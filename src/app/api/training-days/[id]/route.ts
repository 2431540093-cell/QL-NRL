import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ✅ GET by ID
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

    const event = await prisma.trainingDay.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

// ✅ UPDATE
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const eventId = Number(id);

    if (isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json();

    const event = await prisma.trainingDay.update({
      where: { id: eventId },
      data: {
        ...body,
        startTime: body.startTime ? new Date(body.startTime) : undefined,
        endTime: body.endTime ? new Date(body.endTime) : undefined,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// ✅ DELETE
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const eventId = Number(id);

    if (isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await prisma.trainingDay.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}