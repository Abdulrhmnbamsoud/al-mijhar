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
    // Stage 1 - Massive OSINT Gathering
    await updateJob(jobId, "جمع المعلومات الاستخباراتية الشاملة (OSINT)", 10);
    
    const coreQueries = [
      `${job.guestName} ${job.role || ""} ${job.organization || ""}`,
      `${job.guestName} ${job.country || ""}`,
      job.url ? `site:${new URL(job.url).hostname} ${job.guestName}` : null,
      job.twitterUrl ? `site:x.com OR site:twitter.com ${job.guestName}` : null,
      job.linkedinUrl ? `site:linkedin.com/in ${job.guestName}` : null,
    ].filter(Boolean) as string[];

    const deepQueries = [
      `"${job.guestName}" ("مجلس إدارة" OR "مؤسس" OR "مدير" OR "شريك" OR "استثمار" OR "ثروة")`,
      `"${job.guestName}" (PDF OR "ورقة عمل" OR "بحث" OR "جامعة" OR "أكاديمي")`,
      `"${job.guestName}" ("انتقادات" OR "فضيحة" OR "خلاف" OR "تحقيق" OR "قضية" OR "محكمة" OR "تسريب")`,
      `"${job.guestName}" ("لقاء" OR "بودكاست" OR "حوار" OR "تصريح" OR "تلفزيون")`,
      `"${job.guestName}" (site:instagram.com OR site:facebook.com OR site:tiktok.com OR site:youtube.com)`
    ];

    const allQueries = [...coreQueries, ...deepQueries];

    const searchResults = await Promise.all(
      allQueries.map(q => tvlyClient.search(q, { searchDepth: "advanced", maxResults: 15, includeImages: true }))
    );

    const uniqueResults = Array.from(
      new Map(
        searchResults.flatMap(res => res.results).map(item => [item.url, item])
      ).values()
    );
    
    // Gather all images returned by Tavily
    const allImages = searchResults.flatMap(res => res.images || []);
    const candidateImageUrl = allImages.length > 0 ? (typeof allImages[0] === 'string' ? allImages[0] : (allImages[0] as any).url) : null;

    const searchResponse = { results: uniqueResults };

    if (searchResponse.results.length === 0) {
      await updateJob(jobId, "failed", 100, "لم يتم العثور على أية نتائج لهذا الشخص.");
      return;
    }

    await updateJob(jobId, "تحليل الهوية والتحقق من البصمة الرقمية", 30);
    
    // Check identity using top 10 results to save time/tokens for the basic profile step
    const topContext = searchResponse.results.slice(0, 10).map(r => ({title: r.title, content: r.content}));

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert Arabic researcher. Your task is to confirm the identity of the person from the search results. Return a JSON with 'name', 'role', 'organization', 'location', 'confidence' (High, Medium, Low). IMPORTANT: All string values MUST be in Arabic language only. Translate if necessary." },
        { role: "user", content: `Identify this person: ${job.guestName}. Search Context: ${JSON.stringify(topContext)}` }
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
        imageUrl: candidateImageUrl,
      }
    });

    for (const result of searchResponse.results) {
      await prisma.source.create({
        data: {
          projectId,
          title: result.title || "بدون عنوان",
          url: result.url,
          type: "OSINT Search",
          reliability: "Medium",
        }
      });
    }

    const allContext = searchResponse.results.map(r => r.content).join("\n\n---\n\n");

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
            },
            networkNodes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  relationType: { type: "string" },
                  description: { type: "string" },
                  riskLevel: { type: "string" }
                },
                required: ["name", "relationType", "description", "riskLevel"],
                additionalProperties: false
              }
            },
            anomalies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  severity: { type: "string" }
                },
                required: ["title", "description", "severity"],
                additionalProperties: false
              }
            },
            behavioralProfile: { type: "string" },
            evasionScore: { type: "number" },
            interviewScriptAxes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  content: { type: "string" }
                },
                required: ["title", "content"],
                additionalProperties: false
              }
            },
            psychologicalTraits: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  trait: { type: "string" },
                  evidence: { type: "string" },
                  score: { type: "number" },
                  exploitation: { type: "string" }
                },
                required: ["trait", "evidence", "score", "exploitation"],
                additionalProperties: false
              }
            },
            lieDetectorRadars: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  topic: { type: "string" },
                  statementA: { type: "string" },
                  dateA: { type: "string" },
                  statementB: { type: "string" },
                  dateB: { type: "string" },
                  evasionScore: { type: "number" }
                },
                required: ["topic", "statementA", "statementB", "evasionScore"],
                additionalProperties: false
              }
            },
            behavioralPatterns: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  trigger: { type: "string" },
                  behavior: { type: "string" },
                  analysis: { type: "string" },
                  countermeasure: { type: "string" }
                },
                required: ["trigger", "behavior", "analysis", "countermeasure"],
                additionalProperties: false
              }
            }
          },
          required: ["identityMatch", "executiveBriefing", "confidenceScore", "quickMetrics", "timeline", "strengths", "verifications", "contradictions", "appearances", "topics", "questions", "networkNodes", "anomalies", "behavioralProfile", "evasionScore", "interviewScriptAxes", "psychologicalTraits", "lieDetectorRadars", "behavioralPatterns"],
          additionalProperties: false
        },
        strict: true
      }
    };

    const fullAnalysisCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a ruthless, elite OSINT intelligence analyst and psychological profiler preparing a highly classified dossier on a target. Read the context and output a detailed JSON containing all requested fields. CRITICAL REQUIREMENT: You MUST write the ENTIRE output exclusively in the ARABIC language.\n\nEXHAUSTIVE INTELLIGENCE ANALYSIS REQUIREMENT:\n- 'executiveBriefing': Write a deep, critical intelligence summary of the target's true influence, hidden motivations, and operational footprint.\n- 'strengths': Generate at least 5 deep psychological and strategic strengths (e.g., manipulation, networking, specific technical leverage).\n- 'verifications': Generate at least 5 deep vulnerabilities, blind spots, pressure points, and undeclared affiliations that need probing.\n- 'contradictions': Generate at least 3-5 major ideological shifts, financial discrepancies, or hypocritical statements over time.\n- 'topics': Generate at least 6-8 high-risk 'Interrogation Vectors' (topics that will put the target under pressure).\n- 'questions': Generate at least 10-15 deep, penetrating, and psychologically challenging questions designed to break the target's PR facade.\n- 'networkNodes': Map out at least 4-6 key associates (allies, rivals, financial backers).\n- 'anomalies': Flag at least 2-3 behavioral or timeline anomalies (unexplained wealth, deleted history, gap in resume).\n- 'behavioralProfile': A 2-sentence psychological archetype summary of the target.\n- 'evasionScore': An integer 0-100 indicating how evasive/defensive the target is based on their quotes.\n- 'interviewScriptAxes': Generate a full, highly conversational interview script divided into 8-10 'Axes' (المحاور). Each axis should have a title like 'المحور الأول: بداية أميرة من نقطة الشعلة' and the content must be written as a smooth, welcoming, and directly spoken script by a TV host addressing the guest warmly but probing deeply into the extracted facts (e.g. 'أهلاً بك يا أميرة... خلينا نرجع للبداية...'). The script MUST be based 100% on the factual context gathered, completely accurate without hallucination, but formulated as a smooth teleprompter script.\n- 'psychologicalTraits': Generate at least 4 dark/deep psychological traits (e.g., Narcissism, Machiavellianism, defensive paranoia) based on text analysis. Score each from 0-100. Provide 'exploitation' tactic on how an interviewer can use this trait against them.\n- 'lieDetectorRadars': Identify at least 3-4 distinct topics where the target's statements contradict their actions or earlier statements. Provide 'statementA' and 'statementB' (with dates if available) and give an 'evasionScore' (0-100) indicating the level of deception.\n- 'behavioralPatterns': Predict the target's non-verbal and physical 'tells' during stress. E.g. trigger: 'When asked about funding', behavior: 'rapid blinking, changing topic', analysis: 'indicates deception or hidden shame', countermeasure: 'maintain prolonged silence to force them to keep speaking'." },
        { role: "user", content: `Target: ${job.guestName}\n\nRaw OSINT Intel:\n${allContext.substring(0, 60000)}` }
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

    if (analysis.interviewScriptAxes) {
      for (const axis of analysis.interviewScriptAxes) {
        await prisma.interviewScriptAxis.create({
          data: { projectId, title: axis.title || "", content: axis.content || "" }
        });
      }
    }

    if (analysis.networkNodes) {
      for (const node of analysis.networkNodes) {
        await prisma.networkNode.create({
          data: {
            projectId,
            name: node.name || "",
            relationType: node.relationType || "",
            description: node.description || "",
            riskLevel: node.riskLevel || ""
          }
        });
      }
    }

    if (analysis.anomalies) {
      for (const anomaly of analysis.anomalies) {
        await prisma.anomaly.create({
          data: {
            projectId,
            title: anomaly.title || "",
            description: anomaly.description || "",
            severity: anomaly.severity || ""
          }
        });
      }
    }

    if (analysis.behavioralProfile || analysis.evasionScore) {
      await prisma.personProfile.update({
        where: { projectId },
        data: {
          behavioralProfile: analysis.behavioralProfile,
          evasionScore: analysis.evasionScore
        }
      });
    }

    if (analysis.psychologicalTraits) {
      for (const pt of analysis.psychologicalTraits) {
        await prisma.psychologicalTrait.create({
          data: {
            projectId,
            trait: pt.trait || "",
            evidence: pt.evidence || "",
            score: pt.score || 50,
            exploitation: pt.exploitation || ""
          }
        });
      }
    }

    if (analysis.behavioralPatterns) {
      for (const bp of analysis.behavioralPatterns) {
        await prisma.behavioralPattern.create({
          data: {
            projectId,
            trigger: bp.trigger || "",
            behavior: bp.behavior || "",
            analysis: bp.analysis || "",
            countermeasure: bp.countermeasure || ""
          }
        });
      }
    }

    if (analysis.lieDetectorRadars) {
      for (const radar of analysis.lieDetectorRadars) {
        await prisma.lieDetectorRadar.create({
          data: {
            projectId,
            topic: radar.topic || "",
            statementA: radar.statementA || "",
            dateA: radar.dateA,
            statementB: radar.statementB || "",
            dateB: radar.dateB,
            evasionScore: radar.evasionScore || 50
          }
        });
      }
    }

    await updateJob(jobId, "completed", 100);

  } catch (error: any) {
    console.error("Research Engine Error:", error);
    await updateJob(jobId, "failed", 100, error.message || "حدث خطأ غير معروف أثناء البحث");
  }
}
