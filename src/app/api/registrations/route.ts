import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

// ✅ GET registrations, supports optional eventId filter
export async function GET(request: NextRequest) {
  try {
    const eventId = request.nextUrl.searchParams.get("eventId");

    const where = eventId ? { eventId: parseInt(eventId) } : undefined;

    const data = await prisma.registration.findMany({
      where,
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
export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (user.role !== "STUDENT") {
      return NextResponse.json({ error: "Only students can register" }, { status: 403 });
    }

    const body = await request.json();
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json(
        { error: "Missing eventId" },
        { status: 400 }
      );
    }

    // Check event status
    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
    });

    if (!event || event.status !== "OPEN_REGISTRATION") {
      return NextResponse.json(
        { error: "Registration not open" },
        { status: 400 }
      );
    }

    // Check max participants
    if (event.maxParticipants) {
      const count = await prisma.registration.count({
        where: { eventId: parseInt(eventId) },
      });
      if (count >= event.maxParticipants) {
        return NextResponse.json(
          { error: "Event is full" },
          { status: 400 }
        );
      }
    }

    const registration = await prisma.registration.create({
      data: {
        userId: user.id,
        eventId: parseInt(eventId),
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