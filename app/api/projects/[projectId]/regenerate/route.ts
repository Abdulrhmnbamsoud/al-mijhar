import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { startResearchPipeline } from "@/lib/research-engine";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    
    // Check if project exists
    const project = await prisma.episodeProject.findUnique({
      where: { id: projectId },
    });
    
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Reset status to researching
    await prisma.episodeProject.update({
      where: { id: projectId },
      data: { status: "researching" },
    });

    // Delete existing angles to force recreation (this cascades to chapters, questions, etc.)
    await prisma.episodeAngle.deleteMany({
      where: { projectId },
    });
    
    // We could delete sources, but maybe it's better to keep them and just re-run the Editor?
    // Let's actually re-run the whole pipeline to get fresh results.
    await prisma.source.deleteMany({
      where: { projectId },
    });
    
    // Re-run pipeline
    startResearchPipeline(projectId).catch(console.error);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error regenerating project:", error);
    return NextResponse.json({ error: "Failed to regenerate" }, { status: 500 });
  }
}
