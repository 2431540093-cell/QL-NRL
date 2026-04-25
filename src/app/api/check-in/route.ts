import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = requireRole(request, ["EVENT_MANAGER", "ADMIN", "SUPER_ADMIN"]);
    const { qrToken } = await request.json();

    if (!qrToken) {
      return NextResponse.json(
        { error: "Missing qrToken" },
        { status: 400 }
      );
    }

    const registration = await prisma.registration.findUnique({
      where: { qrToken },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Invalid QR token" },
        { status: 400 }
      );
    }

    if (registration.checkedIn) {
      return NextResponse.json(
        { error: "Already checked in" },
        { status: 400 }
      );
    }

    // Update registration
    await prisma.registration.update({
      where: { qrToken },
      data: { checkedIn: true },
    });

    // Create check-in record
    const checkIn = await prisma.checkIn.create({
      data: {
        registrationId: registration.id,
        eventId: registration.eventId,
        checkedInBy: user.id,
      },
    });

    return NextResponse.json({
      message: "Check-in successful",
      checkIn,
    });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "Check-in failed" },
      { status: 500 }
    );
  }
}