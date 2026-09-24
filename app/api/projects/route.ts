import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { startResearchPipeline } from "@/lib/research-engine";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { guestName, role, organization, country, url, linkedinUrl } = body;

    if (!guestName) {
      return NextResponse.json({ error: "اسم الضيف مطلوب" }, { status: 400 });
    }

    // 1. Create Guest
    const guest = await prisma.guest.create({
      data: {
        name: guestName,
        role: role || null,
        organization: organization || null,
        country: country || null,
        url: url || null,
        linkedinUrl: linkedinUrl || null,
      },
    });

    // 2. Create Project
    const project = await prisma.episodeProject.create({
      data: {
        guestId: guest.id,
        status: "researching", // Start in researching phase
        title: `حلقة ${guest.name}`,
        notes: url ? `روابط مقترحة مبدئياً:\n${url}` : null,
      },
    });

    // 3. Trigger the background pipeline
    startResearchPipeline(project.id).catch(console.error);

    return NextResponse.json({ projectId: project.id });
  } catch (error: any) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء إنشاء المشروع" }, { status: 500 });
  }
}
