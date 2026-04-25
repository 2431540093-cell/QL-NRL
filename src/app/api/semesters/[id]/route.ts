import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

function getToken(request: NextRequest) {
  const cookie = request.headers.get("cookie") || "";
  const token = cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("token="))
    ?.split("=")[1];
  return token;
}

function requireAuth(request: NextRequest) {
  const token = getToken(request);
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: any }
) {
  const { params } = context;
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const semesterId = Number(params.id);
  if (Number.isNaN(semesterId)) {
    return NextResponse.json({ success: false, error: "Invalid semester id" }, { status: 400 });
  }

  const body = await request.json();
  const { name, startDate, endDate } = body;

  if (!name || !startDate || !endDate) {
    return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
  }

  try {
    const updatedSemester = await prisma.semester.update({
      where: { id: semesterId },
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    return NextResponse.json({ success: true, data: updatedSemester });
  } catch (error: any) {
    console.error("Update semester error:", error);
    return NextResponse.json({ success: false, error: error.message || "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: any }
) {
  const { params } = context;
  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const semesterId = Number(params.id);
  if (Number.isNaN(semesterId)) {
    return NextResponse.json({ success: false, error: "Invalid semester id" }, { status: 400 });
  }

  try {
    const eventCount = await prisma.event.count({
      where: { semesterId },
    });

    if (eventCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Không thể xóa học kỳ đang có sự kiện liên kết",
        },
        { status: 400 }
      );
    }

    await prisma.semester.delete({ where: { id: semesterId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete semester error:", error);
    return NextResponse.json({ success: false, error: error.message || "Delete failed" }, { status: 500 });
  }
}
