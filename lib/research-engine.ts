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

export async function startResearchPipeline(projectId: string, userInstructions: string = "") {
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
    throw new Error("Missing API Keys: TAVILY_API_KEY or OPENAI_API_KEY");
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

    // 6. Deep OSINT by Phone Number
    if (guest.phone) {
      // Searching the exact phone number, or the phone number with the name
      queries.push(`"${guest.phone}" ("${guest.name}" OR "PDF" OR "contact" OR "directory" OR "دليل")`);
    }

    let allResults: any[] = [];
    for (const q of queries) {
      const res = await tvlyClient.search(q, { searchDepth: "advanced", maxResults: 25 });
      allResults = allResults.concat(res.results);
    }

    const guestNameWords = guest.name.trim().split(" ");
    const uniqueResults = Array.from(new Map(allResults.map(r => [r.url, r])).values()).filter(r => {
      const text = (r.title + " " + r.content).toLowerCase();
      const name = guest.name.toLowerCase();
      if (text.includes(name)) return true;
      if (guestNameWords.length > 1) {
        const firstAndLast = guestNameWords[0].toLowerCase() + " " + guestNameWords[guestNameWords.length - 1].toLowerCase();
        if (text.includes(firstAndLast)) return true;
      }
      return false;
    });

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
    throw new Error(`Research phase failed: ${error.message}`);
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
          content: `أنت رئيس تحرير محترف لبرنامج حواري استقصائي عميق وطويل (مثل برنامج الليوان). مهمتك هي استخراج زاوية رئيسية للحلقة، وبناء "سبعة" (7) محاور (فصول) دقيقة جداً بناءً على المصادر المقدمة.
          مهم جداً:
          1. مدة اللقاء المتوقعة هي "ساعة ونصف" (90 دقيقة)، لذا يجب أن يكون المحتوى غزيراً، متشعباً، ويغطي هذا الوقت الطويل بشكل مريح دون تكرار أو ملل.
          2. كل محور يجب أن يتشعب إلى تفاصيل متعددة، استخرج 5 إلى 7 أسئلة متسلسلة منطقياً في كل محور لتغطية زوايا وقضايا مختلفة في ذات السياق.
          3. **دقة الأسئلة وعمقها (أهم نقطة):** الأسئلة يجب أن تكون مبنية على "معلومات دقيقة وأرقام وحقائق" مستخرجة من المصادر أو مسيرة الضيف. تجنب الأسئلة العامة المستهلكة (مثل: "حدثنا عن بداياتك؟" أو "ما هي رؤيتك للمستقبل؟"). بدلاً من ذلك، واجه الضيف بتصريحات سابقة له، أو قرارات اتخذها، أو أرقام من واقع عمله، واطلب منه تبريرها أو تفكيكها.
          4. صغ الأسئلة بأسلوب "حواري استقصائي" (Conversational & Investigative)، وكأن المذيع جالس يتحدث مع الضيف بطريقة سلسة، ولكنها حادة، ذكية جداً، ومباغتة أحياناً (لا تقبل الإجابات الدبلوماسية).
          5. تجاهل أي معلومات أو مصادر تتحدث عن أشخاص آخرين يحملون أسماء مشابهة، ركز فقط على الضيف المستهدف وتاريخه الفعلي.
          6. استخدم "تلميح للمذيع" (whyItMatters) لتوجيه المذيع حول كيف يحاصر الضيف إن تهرب من الإجابة، أو ما هي النقطة الحساسة في هذا السؤال.
          7. حقل "angle": زاوية الحلقة. جملة تحريرية تساعد فريق الإعداد على تحديد موضوع اللقاء. لا تظهر للمقدّم بوصفها مقدمة جاهزة.
          8. حقل "hostIntro": مقدمة المقدّم. نص حواري كامل، يُقال بصوت عالٍ أمام الجمهور قبل الترحيب بالضيف، مبني على خبرته الفعلية والمعلومات المؤكدة عنه. مدتها نحو 30 إلى 45 ثانية، باللغة العربية السعودية الطبيعية، وبأسلوب تقديم حيّ يليق ببرنامج حواري. تجنب العبارات العامة، ولا تخترع إنجازات أو مناصب.
          9. حقل "introWarnings": ضع فيه أي تنبيه للمحرر إذا كانت معلومات الضيف أو مناصبه غير مؤكدة تماماً، ولا تضعها كحقيقة في نص المقدمة.
          ${userInstructions ? `10. توجيه خاص من المستخدم لنمط هذه المحاور يجب الالتزام به حرفياً: "${userInstructions}"` : ""}
          يجب أن تكون جميع النصوص والمخرجات باللغة العربية الفصحى حصراً (100% Arabic). الرد يجب أن يكون بصيغة JSON حصرية.`
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
              guestSummary: { type: "string", description: "Comprehensive biographical summary of the guest based on sources (In Arabic)" },
              careerHistory: {
                type: "array",
                description: "List of the guest's past and current roles/jobs, especially from LinkedIn (In Arabic)",
                items: {
                  type: "object",
                  properties: {
                    role: { type: "string", description: "Job title or role" },
                    company: { type: "string", description: "Company or organization name" },
                    duration: { type: "string", description: "Duration or year (e.g. 2018 - 2022)" }
                  },
                  required: ["role", "company"],
                  additionalProperties: false
                }
              },
              expectedScenarios: {
                type: "array",
                description: "3 different expected scenarios for how the interview might unfold (e.g. Defensive, Professional, Controversial) (In Arabic)",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string", description: "Scenario Name (e.g. السيناريو التصادمي)" },
                    description: { type: "string", description: "Detailed description of how the guest might behave and how the host should react" }
                  },
                  required: ["name", "description"],
                  additionalProperties: false
                }
              },
              angle: { type: "string", description: "زاوية الحلقة: جملة تحريرية تساعد فريق الإعداد على تحديد موضوع اللقاء" },
              hostIntro: { type: "string", description: "مقدمة المقدّم: نص حواري كامل جاهز للقراءة على الهواء، 30-45 ثانية" },
              introEstimatedTime: { type: "string", description: "المدة التقديرية للقراءة (مثلاً: 40 ثانية)" },
              introWarnings: { type: "string", description: "تنبيهات للمحرر إذا كانت بعض تفاصيل الضيف غير مؤكدة" },
              chapters: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string", description: "Chapter title (In Arabic)" },
                    estimatedMinutes: { type: "number" },
                    moment: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Title of the fact or story (In Arabic)" },
                        description: { type: "string", description: "Details of the fact (In Arabic)" }
                      },
                      required: ["title", "description"],
                      additionalProperties: false
                    },
                    hostQuestions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          question: { type: "string", description: "Main question (In Arabic)" },
                          type: { type: "string", enum: ["normal", "sensitive", "viral"], description: "Type of question: normal (عادي), sensitive (حساس للضيف أو المجتمع), viral (مثيرة للجدل وتجلب مشاهدات عالية)" },
                          whyItMatters: { type: "string", description: "توجيه سري وذكي جداً للمذيع. ممنوع كتابة كلام عام أو سطحي. اكتب تكتيكاً نفسياً عميقاً أو زاوية هجومية لمحاصرة الضيف إذا حاول التهرب بدبلوماسية. يجب أن يكون التوجيه لاذعاً ويكشف النوايا المخفية وراء السؤال (In Arabic)" },
                          followUps: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                question: { type: "string", description: "Follow up question (In Arabic)" }
                              },
                              required: ["question"],
                              additionalProperties: false
                            }
                          }
                        },
                        required: ["question", "type", "whyItMatters", "followUps"],
                        additionalProperties: false
                      }
                    }
                  },
                  required: ["title", "estimatedMinutes", "moment", "hostQuestions"],
                  additionalProperties: false
                }
              }
            },
            required: ["guestSummary", "angle", "chapters", "careerHistory", "expectedScenarios"],
            additionalProperties: false
          }
        }
      }
    });

    const parsed = JSON.parse(completion.choices[0].message.content || "{}");
    if (parsed.angle) {
      // Save guest summary and scenarios
      if (parsed.guestSummary || parsed.expectedScenarios) {
        await prisma.episodeProject.update({
          where: { id: projectId },
          data: { 
            notes: parsed.guestSummary || null,
            expectedScenarios: parsed.expectedScenarios ? JSON.stringify(parsed.expectedScenarios) : null
          }
        });
      }

      const introMetadataObj = {
        time: parsed.introEstimatedTime || null,
        warnings: parsed.introWarnings || null
      };

      const angle = await prisma.episodeAngle.create({
        data: { 
          projectId, 
          angle: parsed.angle, 
          hostIntro: parsed.hostIntro || null,
          introMetadata: JSON.stringify(introMetadataObj),
          isActive: true 
        }
      });
      
      let index = 1;
      for (const ch of parsed.chapters) {
        const chapter = await prisma.chapter.create({
          data: { angleId: angle.id, title: ch.title, orderIndex: index++, estimatedMinutes: ch.estimatedMinutes }
        });
        
        if (ch.moment) {
          const moment = await prisma.storyMoment.create({
            data: { projectId, title: ch.moment.title, description: ch.moment.description }
          });
          await prisma.chapter.update({
            where: { id: chapter.id },
            data: { momentId: moment.id }
          });
        }
        
        if (ch.hostQuestions) {
          let qIdx = 1;
          for (const q of ch.hostQuestions) {
            const hostQuestion = await prisma.hostQuestion.create({
              data: { chapterId: chapter.id, question: q.question, type: q.type || "normal", whyItMatters: q.whyItMatters, orderIndex: qIdx++ }
            });
            
            if (q.followUps) {
              let fIdx = 1;
              for (const f of q.followUps) {
                await prisma.followUp.create({
                  data: { hostQuestionId: hostQuestion.id, question: f.question, orderIndex: fIdx++ }
                });
              }
            }
          }
        }
      }
    }

    if (parsed.careerHistory && Array.isArray(parsed.careerHistory)) {
      const guestId = (await prisma.episodeProject.findUnique({ where: { id: projectId } }))?.guestId;
      if (guestId) {
        await prisma.careerExperience.deleteMany({ where: { guestId } });
        await prisma.careerExperience.createMany({
          data: parsed.careerHistory.map((ch: any) => ({
            guestId,
            role: ch.role,
            company: ch.company,
            duration: ch.duration || null
          }))
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
    throw new Error(`Generation phase failed: ${error.message}`);
  }
}
