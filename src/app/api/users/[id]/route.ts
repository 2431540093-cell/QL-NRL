import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function PUT(req: Request, context: any) {
  try {
    const body = await req.json();

    // 👇 FIX CHUẨN
    const params = await context.params;
    const id = Number(params.id);

    console.log("ID DEBUG:", id);

    if (!id) {
      return NextResponse.json(
        { error: "Invalid ID" },
        { status: 400 }
      );
    }

    if (!body.email && !body.name && !body.role) {
      return NextResponse.json(
        { error: "No data to update" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(body.email && { email: body.email }),
        ...(body.name && { name: body.name }),
        ...(body.role && { role: body.role }),
      },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("UPDATE ERROR:", error);

    return NextResponse.json(
      { error: error?.message || "Update failed" },
      { status: 500 }
    );
  }
}