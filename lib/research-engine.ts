import prisma from "./prisma";
import { tavily } from "@tavily/core";
import OpenAI from "openai";

async function updateJob(jobId: string, status: string, progress: number, error?: string) {
  await prisma.researchJob.update({
    where: { id: jobId },
    data: { status, progress, error: error || null },
  });
}

export async function startResearchJob(jobId: string) {
  const job = await prisma.researchJob.findUnique({ where: { id: jobId } });
  if (!job) return;

  const projectId = job.projectId;
  if (!projectId) return;

  const tvlyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    // Stage 1
    await updateJob(jobId, "التحقق من هوية الضيف", 10);
    const queries = [
      `${job.guestName} ${job.role || ""} ${job.organization || ""}`,
      `${job.guestName} ${job.country || ""}`,
      job.url ? `site:${new URL(job.url).hostname} ${job.guestName}` : null,
      job.twitterUrl ? `site:x.com OR site:twitter.com ${job.guestName} ${job.twitterUrl}` : null,
      job.linkedinUrl ? `site:linkedin.com/in ${job.guestName} ${job.linkedinUrl}` : null,
    ].filter(Boolean) as string[];

    const searchResults = await Promise.all(
      queries.map(q => tvlyClient.search(q, { searchDepth: "advanced", maxResults: 10 }))
    );

    const searchResponse = {
      results: Array.from(
        new Map(
          searchResults.flatMap(res => res.results).map(item => [item.url, item])
        ).values()
      )
    };
    
    if (searchResponse.results.length === 0) {
      await updateJob(jobId, "failed", 100, "لم يتم العثور على أية نتائج لهذا الشخص.");
      return;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert Arabic researcher. Your task is to confirm the identity of the person from the search results. Return a JSON with 'name', 'role', 'organization', 'location', 'confidence' (High, Medium, Low). IMPORTANT: All string values MUST be in Arabic language only. Translate if necessary." },
        { role: "user", content: `Identify this person: ${job.guestName}. Search Context: ${JSON.stringify(searchResponse.results.map(r => ({title: r.title, content: r.content})))}` }
      ],
      response_format: { type: "json_object" }
    });

    const profileData = JSON.parse(completion.choices[0].message.content || "{}");
    
    await prisma.personProfile.create({
      data: {
        projectId,
        name: profileData.name || job.guestName,
        role: profileData.role,
        organization: profileData.organization,
        location: profileData.location,
        confidence: profileData.confidence,
      }
    });

    for (const result of searchResponse.results) {
      await prisma.source.create({
        data: {
          projectId,
          title: result.title || "بدون عنوان",
          url: result.url,
          type: "Primary",
          reliability: "High",
        }
      });
    }

    // Stage 2 & 3
    await updateJob(jobId, "البحث في المصادر المفتوحة وقراءة المقابلات", 30);
    const specificSearch = await tvlyClient.search(`مقابلة OR إنجازات OR تصريح ${job.guestName} ${job.organization || ""}`, { searchDepth: "advanced", maxResults: 15 });
    
    const allContext = [...searchResponse.results, ...specificSearch.results].map(r => r.content).join("\n\n---\n\n");

    for (const result of specificSearch.results) {
      const existing = await prisma.source.findFirst({ where: { projectId, url: result.url } });
      if (!existing) {
        await prisma.source.create({
          data: {
            projectId,
            title: result.title || "بدون عنوان",
            url: result.url,
            type: "News/Interview",
            reliability: "Medium",
          }
        });
      }
    }

    // Stage 4-7
    await updateJob(jobId, "مقارنة المعلومات وبناء الخط الزمني", 50);

    const responseFormat = {
      type: "json_schema" as const,
      json_schema: {
        name: "research_dossier",
        schema: {
          type: "object",
          properties: {
            identityMatch: {
              type: "object",
              properties: {
                status: { type: "string" },
                reasons: { type: "array", items: { type: "string" } },
                ambiguity: { type: "boolean" }
              },
              required: ["status", "reasons", "ambiguity"],
              additionalProperties: false
            },
            executiveBriefing: { type: "string" },
            confidenceScore: { type: "number" },
            quickMetrics: {
              type: "object",
              properties: {
                yearsOfExperience: { type: "number" },
                mediaAppearances: { type: "number" },
                criticalGaps: { type: "number" }
              },
              required: ["yearsOfExperience", "mediaAppearances", "criticalGaps"],
              additionalProperties: false
            },
            timeline: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string" },
                  event: { type: "string" },
                  organization: { type: "string" },
                  explanation: { type: "string" },
                  classification: { type: "string" },
                },
                required: ["date", "event", "organization", "explanation", "classification"],
                additionalProperties: false
              }
            },
            strengths: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  explanation: { type: "string" },
                  confidence: { type: "string" },
                },
                required: ["title", "explanation", "confidence"],
                additionalProperties: false
              }
            },
            verifications: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  gap: { type: "string" },
                  whyItMatters: { type: "string" },
                  existingEvidence: { type: "string" },
                  missingInfo: { type: "string" },
                  questionToAsk: { type: "string" },
                },
                required: ["gap", "whyItMatters", "existingEvidence", "missingInfo", "questionToAsk"],
                additionalProperties: false
              }
            },
            contradictions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  statementA: { type: "string" },
                  statementB: { type: "string" },
                  dateA: { type: ["string", "null"] },
                  dateB: { type: ["string", "null"] },
                  question: { type: "string" },
                  confidence: { type: "string" }
                },
                required: ["statementA", "statementB", "dateA", "dateB", "question", "confidence"],
                additionalProperties: false
              }
            },
            appearances: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  platform: { type: "string" },
                  date: { type: "string" },
                  themes: { type: "string" },
                  quote: { type: "string" },
                },
                required: ["title", "platform", "date", "themes", "quote"],
                additionalProperties: false
              }
            },
            topics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  whyUseful: { type: "string" },
                  evidence: { type: "string" },
                  openingQuestion: { type: "string" },
                  followUp: { type: "string" },
                  riskLevel: { type: "string" }
                },
                required: ["category", "whyUseful", "evidence", "openingQuestion", "followUp", "riskLevel"],
                additionalProperties: false
              }
            },
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  question: { type: "string" },
                },
                required: ["category", "question"],
                additionalProperties: false
              }
            }
          },
          required: ["identityMatch", "executiveBriefing", "confidenceScore", "quickMetrics", "timeline", "strengths", "verifications", "contradictions", "appearances", "topics", "questions"],
          additionalProperties: false
        },
        strict: true
      }
    };

    const fullAnalysisCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a professional investigative journalist preparing an Arabic research dossier for a high-profile interview. Read the context and output a detailed JSON containing all requested fields. CRITICAL REQUIREMENT: You MUST write the ENTIRE output (all fields, summaries, quotes, explanations, timelines) exclusively in the ARABIC language. If source context is in English, translate it to high-quality Arabic." },
        { role: "user", content: `Person: ${job.guestName}\n\nContext:\n${allContext.substring(0, 30000)}` }
      ],
      response_format: responseFormat
    });

    const analysis = JSON.parse(fullAnalysisCompletion.choices[0].message.content || "{}");

    await updateJob(jobId, "تجهيز التقرير النهائي", 80);

    // Save Top-level Fields to Project
    await prisma.researchProject.update({
      where: { id: projectId },
      data: {
        executiveBriefing: analysis.executiveBriefing || "",
        confidenceScore: analysis.confidenceScore || 0,
        identityMatch: JSON.stringify(analysis.identityMatch || {}),
        quickMetrics: JSON.stringify(analysis.quickMetrics || {}),
      }
    });

    if (analysis.timeline) {
      for (const t of analysis.timeline) {
        await prisma.timelineEvent.create({
          data: { projectId, date: t.date || "", event: t.event || "", organization: t.organization, explanation: t.explanation, classification: t.classification || "Verified" }
        });
      }
    }

    if (analysis.strengths) {
      for (const s of analysis.strengths) {
        await prisma.strength.create({
          data: { projectId, title: s.title || "", explanation: s.explanation || "", confidence: s.confidence || "High", sourceUrls: "[]" }
        });
      }
    }

    if (analysis.verifications) {
      for (const v of analysis.verifications) {
        await prisma.verificationArea.create({
          data: { projectId, gap: v.gap || "", whyItMatters: v.whyItMatters || "", existingEvidence: v.existingEvidence || "", missingInfo: v.missingInfo || "", questionToAsk: v.questionToAsk || "", sourceUrls: "[]" }
        });
      }
    }

    if (analysis.contradictions) {
      for (const c of analysis.contradictions) {
        await prisma.contradiction.create({
          data: { projectId, statementA: c.statementA || "", statementB: c.statementB || "", question: c.question || "", confidence: c.confidence || "Medium" }
        });
      }
    }

    if (analysis.topics) {
      for (const t of analysis.topics) {
        await prisma.conversationTopic.create({
          data: { projectId, category: t.category || "منطقة مريحة", whyUseful: t.whyUseful || "", evidence: t.evidence || "", openingQuestion: t.openingQuestion || "", followUp: t.followUp || "", riskLevel: t.riskLevel || "Low" }
        });
      }
    }

    if (analysis.questions) {
      for (const q of analysis.questions) {
        await prisma.interviewQuestion.create({
          data: { projectId, category: q.category || "exploratory", question: q.question || "" }
        });
      }
    }

    await updateJob(jobId, "completed", 100);

  } catch (error: any) {
    console.error("Research Engine Error:", error);
    await updateJob(jobId, "failed", 100, error.message || "حدث خطأ غير معروف أثناء البحث");
  }
}
