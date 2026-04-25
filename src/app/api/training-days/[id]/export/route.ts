import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const eventId = Number(id);

    if (isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const registrations = await prisma.registration.findMany({
      where: { eventId },
      include: {
        user: true,
        checkIns: true,
      },
    });

    const csv = [
      "Name,Email,Registered At,Checked In,Check-in Time",
      ...registrations.map(reg => [
        reg.user.name,
        reg.user.email,
        reg.createdAt.toISOString(),
        reg.checkedIn ? "Yes" : "No",
        reg.checkIns.length > 0 ? reg.checkIns[0].checkInTime.toISOString() : "",
      ].join(",")),
    ].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="event_${id}_participants.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}