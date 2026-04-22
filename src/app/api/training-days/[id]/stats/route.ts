import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const eventId = Number(id);

    const total = await prisma.registration.count({
      where: { eventId },
    });

    const checkedIn = await prisma.registration.count({
      where: { eventId, checkedIn: true },
    });

    return NextResponse.json({
      total,
      checkedIn,
      notCheckedIn: total - checkedIn,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Stats failed" },
      { status: 500 }
    );
  }
}