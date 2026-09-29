import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    
    // Check if exists
    const project = await prisma.episodeProject.findUnique({
      where: { id: projectId }
    });
    
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    
    // Delete project. Cascading handles related records.
    await prisma.episodeProject.delete({
      where: { id: projectId }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting project:", error);
    return NextResponse.json({ error: error.message || "Failed to delete project" }, { status: 500 });
  }
}
