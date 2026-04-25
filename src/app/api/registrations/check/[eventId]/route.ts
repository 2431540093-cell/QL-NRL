import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function GET(
  req: Request,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { eventId } = await context.params;
    const eventIdNum = Number(eventId);

    if (isNaN(eventIdNum)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    const registration = await prisma.registration.findFirst({
      where: {
        userId: user.id,
        eventId: eventIdNum,
      },
      include: {
        checkIns: true,
      },
    });

    if (!registration) {
      return NextResponse.json({
        registered: false,
        qrToken: null,
      });
    }

    return NextResponse.json({
      registered: true,
      qrToken: registration.qrToken,
      checkedIn: registration.checkedIn,
      checkInTime: registration.checkIns?.[0]?.checkInTime || null,
    });
  } catch (error) {
    return NextResponse.json({ error: "Check failed" }, { status: 500 });
  }
}