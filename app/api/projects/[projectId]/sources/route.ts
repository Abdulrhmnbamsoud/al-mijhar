import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const body = await request.json();
    const { title, text, type } = body;

    if (!title || !text) {
      return NextResponse.json({ error: "العنوان والنص مطلوبان" }, { status: 400 });
    }

    const source = await prisma.source.create({
      data: {
        projectId,
        title,
        type: type || "custom",
        extractedText: text,
        processingStatus: "completed"
      }
    });

    return NextResponse.json({ success: true, source });
  } catch (error: any) {
    console.error("Error adding source:", error);
    return NextResponse.json({ error: "فشل إضافة المصدر" }, { status: 500 });
  }
}
