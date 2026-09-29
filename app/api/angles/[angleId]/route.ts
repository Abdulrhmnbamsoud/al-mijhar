import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ angleId: string }> }
) {
  try {
    const { angleId } = await params;
    const body = await request.json();
    const { hostIntro } = body;

    const angle = await prisma.episodeAngle.update({
      where: { id: angleId },
      data: { hostIntro }
    });

    return NextResponse.json({ success: true, angle });
  } catch (error: any) {
    console.error("Error updating angle:", error);
    return NextResponse.json({ error: "Failed to update angle" }, { status: 500 });
  }
}
