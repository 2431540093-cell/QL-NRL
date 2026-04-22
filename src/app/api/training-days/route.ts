import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ✅ GET all training days
export async function GET() {
  try {
    const events = await prisma.trainingDay.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json(
      { error: "Fetch failed" },
      { status: 500 }
    );
  }
}

// ✅ CREATE training day
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { title, startTime, endTime, location } = body;

    if (!title || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const event = await prisma.trainingDay.create({
      data: {
        title,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        location,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Create failed" },
      { status: 500 }
    );
  }
}