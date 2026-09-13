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
            timeline: { orderBy: { date: 'asc' } },
            strengths: true,
            verifications: true,
            contradictions: true,
            appearances: true,
            topics: true,
            questions: true,
            networkNodes: true,
            anomalies: true,
          }
        }
      }
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error: any) {
    console.error("Fetch report error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
