import prisma from "./prisma";
import { tavily } from "@tavily/core";
import OpenAI from "openai";

async function logAudit(projectId: string, action: string, entityType: string, entityId: string, changes?: string) {
  await prisma.auditEvent.create({
    data: { projectId, action, entityType, entityId, changes }
  });
}

async function updateRun(runId: string, status: string, error?: string) {
  await prisma.generationRun.update({
    where: { id: runId },
    data: { status, error }
  });
}

export async function startResearchPipeline(projectId: string) {
  const project = await prisma.episodeProject.findUnique({
    where: { id: projectId },
    include: { guest: true }
  });

  if (!project) return;

  const tvlyClient = process.env.TAVILY_API_KEY ? tavily({ apiKey: process.env.TAVILY_API_KEY }) : null;
  const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

  // 1. Researcher Agent (الباحث)
  const researchRun = await prisma.generationRun.create({
    data: { projectId, agentRole: "researcher", status: "running" }
  });

  if (!tvlyClient || !openai) {
    await updateRun(researchRun.id, "failed", "Missing API Keys. Please provide TAVILY_API_KEY and OPENAI_API_KEY.");
    return;
  }

  try {
    const guest = project.guest;
    const queries: string[] = [];
    
    // 1. Exact match with context
    queries.push(`"${guest.name}" ${guest.role || ""} ${guest.organization || ""} ${guest.country || ""}`.trim());
    
    // 2. Exact match in media context
    queries.push(`"${guest.name}" ("لقاء" OR "بودكاست" OR "حوار" OR "تصريح" OR "برنامج")`);
    
    // 3. Exact match for professional shifts / controversies
    queries.push(`"${guest.name}" ("خلاف" OR "رأي" OR "موقف" OR "استقالة" OR "تعيين" OR "انتقاد")`);

    // 4. Domain specific searches if URL was provided
    if (guest.url) {
      try {
        const urlObj = new URL(guest.url);
        queries.push(`site:${urlObj.hostname} "${guest.name}"`);
      } catch (e) {
        // ignore invalid URL
      }
    }
    
    // 5. LinkedIn specific
    if (guest.linkedinUrl) {
      queries.push(`site:linkedin.com/in "${guest.name}"`);
    }

    let allResults: any[] = [];
    for (const q of queries) {
      const res = await tvlyClient.search(q, { searchDepth: "advanced", maxResults: 5 });
      allResults = allResults.concat(res.results);
    }

    const uniqueResults = Array.from(new Map(allResults.map(r => [r.url, r])).values());

    for (const r of uniqueResults) {
      const source = await prisma.source.create({
        data: {
          projectId,
          title: r.title || "مادة مبدئية",
          originalUrl: r.url,
          type: "article",
          extractedText: r.content,
          processingStatus: "completed"
        }
      });
      await logAudit(projectId, "create", "Source", source.id, "Researcher agent collected source");
    }

    await updateRun(researchRun.id, "completed");
  } catch (error: any) {
    await updateRun(researchRun.id, "failed", error.message);
    return;
  }

  // 4. Editor Agent (محرر الحلقة) - Skipped 2 & 3 for demo brevity
  const editorRun = await prisma.generationRun.create({
    data: { projectId, agentRole: "editor", status: "running" }
  });

  try {
    // Generate an angle and chapter structure based on sources
    const sources = await prisma.source.findMany({ where: { projectId } });
    const contextStr = sources.map(s => s.extractedText).join("\n\n").slice(0, 10000);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `أنت محرر محترف لبرنامج حواري (مثل برنامج الليوان). مهمتك هي استخراج زاوية للحلقة وثلاثة فصول بناءً على المصادر المقدمة. 
          هام جداً: تجاهل أي معلومات أو مصادر تتحدث عن أشخاص آخرين يحملون أسماء مشابهة، ركز فقط على الضيف المستهدف بصفته ومجاله. 
          إذا كانت المعلومات غير كافية، ركز على ما هو مؤكد فقط. الرد يجب أن يكون بصيغة JSON حصرية.`
        },
        { role: "user", content: `الضيف: ${project.guest.name}\n\nالمصادر:\n${contextStr}` }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "episode_structure",
          schema: {
            type: "object",
            properties: {
              angle: { type: "string" },
              chapters: {
                type: "array",
                items: {
                  type: "object",
                  properties: { title: { type: "string" }, estimatedMinutes: { type: "number" } },
                  required: ["title", "estimatedMinutes"],
                  additionalProperties: false
                }
              }
            },
            required: ["angle", "chapters"],
            additionalProperties: false
          }
        }
      }
    });

    const parsed = JSON.parse(completion.choices[0].message.content || "{}");
    if (parsed.angle) {
      const angle = await prisma.episodeAngle.create({
        data: { projectId, angle: parsed.angle, isActive: true }
      });
      
      let index = 1;
      for (const ch of parsed.chapters) {
        await prisma.chapter.create({
          data: { angleId: angle.id, title: ch.title, orderIndex: index++, estimatedMinutes: ch.estimatedMinutes }
        });
      }
    }

    await updateRun(editorRun.id, "completed");
    
    // Update project status to ready
    await prisma.episodeProject.update({
      where: { id: projectId },
      data: { status: "ready" }
    });

  } catch (error: any) {
    await updateRun(editorRun.id, "failed", error.message);
    return;
  }
}
