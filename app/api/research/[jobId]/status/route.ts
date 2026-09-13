import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const job = await prisma.researchJob.findUnique({
      where: { id: jobId },
      include: {
        project: {
          include: {
            profile: true,
            sources: true,
          }
        }
      }
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({
      status: job.status,
      progress: job.progress,
      error: job.error,
      projectId: job.projectId,
      sourcesCount: job.project?.sources.length || 0,
    });
  } catch (error: any) {
    console.error("Status check error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
