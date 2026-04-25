import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = requireRole(request, ["ADMIN", "SUPER_ADMIN"]);
    const { eventId, userEmails } = await request.json();

    if (!eventId || !userEmails || !Array.isArray(userEmails)) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    let count = 0;
    for (const email of userEmails) {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        // Check if already registered
        const existing = await prisma.registration.findUnique({
          where: {
            userId_eventId: {
              userId: user.id,
              eventId: parseInt(eventId),
            },
          },
        });

        if (!existing) {
          await prisma.registration.create({
            data: {
              userId: user.id,
              eventId: parseInt(eventId),
              qrToken: crypto.randomUUID(),
              checkedIn: true, // Assume past event, already checked in
            },
          });
          count++;
        }
      }
    }

    // Log import
    await prisma.importLog.create({
      data: {
        eventId: parseInt(eventId),
        importedBy: user.id,
        fileName: "manual_import",
        count,
      },
    });

    return NextResponse.json({
      message: "Import successful",
      count,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Import failed" },
      { status: 500 }
    );
  }
}