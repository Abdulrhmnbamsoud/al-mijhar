import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { startResearchJob } from "@/lib/research-engine";

export async function POST(request: Request) {
  try {
    if (!process.env.TAVILY_API_KEY || !process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "تعذر تشغيل البحث الحقيقي لأن خدمة البحث غير متصلة. يرجى إعداد مفاتيح API." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { guestName, role, organization, country, url, twitterUrl, linkedinUrl, objective, depth } = body;

    if (!guestName) {
      return NextResponse.json({ error: "اسم الضيف مطلوب" }, { status: 400 });
    }

    // Create a new ResearchProject first
    const project = await prisma.researchProject.create({
      data: {},
    });

    // Create the job
    const job = await prisma.researchJob.create({
      data: {
        status: "pending",
        progress: 0,
        guestName,
        role: role || null,
        organization: organization || null,
        country: country || null,
        url: url || null,
        twitterUrl: twitterUrl || null,
        linkedinUrl: linkedinUrl || null,
        objective: objective || null,
        depth: depth || "متقدم",
        projectId: project.id,
      },
    });

    // Start background task (don't await it so we can return response)
    startResearchJob(job.id).catch((err) => {
      console.error("Background job failed:", err);
    });

    return NextResponse.json({ jobId: job.id, projectId: project.id });
  } catch (error: any) {
    console.error("Error creating job:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
