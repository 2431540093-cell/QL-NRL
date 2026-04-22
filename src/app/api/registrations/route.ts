import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ✅ GET all registrations
export async function GET() {
  try {
    const data = await prisma.registration.findMany({
      include: {
        user: true,
        event: true,
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

// ✅ CREATE registration
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, eventId } = body;

    if (!userId || !eventId) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const registration = await prisma.registration.create({
      data: {
        userId,
        eventId,
        qrToken: crypto.randomUUID(), // 🔥 tạo QR token
      },
    });

    return NextResponse.json(registration);
  } catch (error: any) {
      console.error(error);

      // ❗ bắt lỗi đăng ký trùng
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Already registered" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Create failed" },
        { status: 500 }
      );
  }
}