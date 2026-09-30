export const maxDuration = 60;
import { NextResponse, after } from "next/server";
import prisma from "@/lib/prisma";
import { startResearchPipeline } from "@/lib/research-engine";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    let instructions = "";
    try {
      const body = await request.json();
      if (body.instructions) instructions = body.instructions;
    } catch (e) {}
    
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

    // Deactivate existing angles instead of deleting them to keep history
    await prisma.episodeAngle.updateMany({
      where: { projectId },
      data: { isActive: false }
    });
    // Run pipeline in the background using Next.js after() to prevent connection timeouts
    after(async () => {
      try {
        await startResearchPipeline(projectId, instructions);
      } catch (e: any) {
        console.error("Background research pipeline failed:", e);
        await prisma.episodeProject.update({
          where: { id: projectId },
          data: { status: "failed" }
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error regenerating project:", error);
    return NextResponse.json({ error: error.message || "Failed to regenerate" }, { status: 500 });
  }
}
