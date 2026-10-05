export const maxDuration = 60;
import { NextResponse, after } from "next/server";
import prisma from "@/lib/prisma";

import { startResearchPipeline } from "@/lib/research-engine";

export async function GET() {
  try {
    const projects = await prisma.episodeProject.findMany({
      orderBy: { createdAt: "desc" },
      include: { guest: true },
    });
    return NextResponse.json({ projects });
  } catch (error: any) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء جلب المشاريع" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { guestName, role, organization, country, url, linkedinUrl, phone } = body;

    if (!guestName || typeof guestName !== "string" || guestName.trim().length === 0) {
      return NextResponse.json({ error: "اسم الضيف مطلوب وصحيح" }, { status: 400 });
    }

    // 1. Find or Create Guest
    let guest = await prisma.guest.findFirst({
      where: { name: guestName.trim() },
    });

    if (!guest) {
      guest = await prisma.guest.create({
        data: {
          name: guestName.trim(),
          role: role?.trim() || null,
          organization: organization?.trim() || null,
          country: country?.trim() || null,
          url: url?.trim() || null,
          linkedinUrl: linkedinUrl?.trim() || null,
          phone: phone?.trim() || null,
        },
      });
    }

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
    after(async () => {
      try {
        await startResearchPipeline(project.id);
      } catch (e: any) {
        console.error("Background research pipeline failed:", e);
        // Fallback update to prevent infinite loading state
        await prisma.episodeProject.update({
          where: { id: project.id },
          data: { status: "failed", notes: project.notes ? project.notes + `\nخطأ في التوليد: ${e.message}` : `خطأ في التوليد: ${e.message}` }
        });
      }
    });

    return NextResponse.json({ projectId: project.id });
  } catch (error: any) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء إنشاء المشروع" }, { status: 500 });
  }
}
