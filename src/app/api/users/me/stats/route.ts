import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await requireAuth(req);

    // Get full user data from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user stats
    const [registeredEvents, attendedEvents] = await Promise.all([
      // Total registered events
      prisma.registration.count({
        where: {
          userId: user.id,
        },
      }),

      // Total attended events (checked in)
      prisma.registration.count({
        where: {
          userId: user.id,
          checkedIn: true,
        },
      }),
    ]);

    return NextResponse.json({
      trainingPoints: dbUser.trainingPoints || 0,
      registeredEvents,
      attendedEvents,
    });
  } catch (error) {
    return NextResponse.json({ error: "Stats fetch failed" }, { status: 500 });
  }
}