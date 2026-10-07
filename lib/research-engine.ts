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
    
    // Extract exact provided URLs directly
    const urlsToExtract = [];
    if (guest.linkedinUrl) urlsToExtract.push(guest.linkedinUrl);
    if (guest.url) urlsToExtract.push(guest.url);
    
    if (urlsToExtract.length > 0) {
      try {
        const extractRes = await tvlyClient.extract(urlsToExtract);
        if (extractRes && extractRes.results) {
          for (const ext of extractRes.results) {
            allResults.push({
              title: "مصدر مباشر (معلومات المستخدم)",
              url: ext.url,
              content: ext.rawContent || "لا يوجد نص"
            });
          }
        }
      } catch (e) {
        console.error("Direct URL extraction failed:", e);
      }
    }

    for (const q of queries) {
      const res = await tvlyClient.search(q, { searchDepth: "advanced", maxResults: 25 });
      allResults = allResults.concat(res.results);
    }

    // Remove strict text matching as it fails with Arabic formatting (أ/ا, ي/ى)
    // Tavily already filters for relevance based on the query.
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
          content: `أنت رئيس تحرير محترف لبرنامج "المجهر". المطلوب منك: بناء حلقة مدتها ٩٠ دقيقة على خلفية الضيف، بأسئلة طبيعية تريحه، وتسلسل يخلي المستمع يفهم القصة ويهتم بتكملتها. هذه تفاصيل النقاط الـ١١ لمنهجية البرنامج:

### ١. بناء الحلقة على خلفية الضيف
قبل توليد الأسئلة، ابنِ ملفًا بحثيًا تفهم منه الشخص:
- مسيرته والمراحل المهمة فيها وتجاربه ومشاريعه وأدواره.
- قراراته والتحولات بين المراحل واهتماماته.
- تصريحاته السابقة وسياقها والمعلومات الناقصة التي تحتاج توضيحًا منه.
ميّز بين معلومة موثقة، وتصريح للضيف، واستنتاج يحتاج تأكيدًا. لا تفترض أن تغيير وظيفة يعني فشلًا، أو أن تأسيس مشروع يعني نجاحًا.
مثال: إذا ثبت أن الضيف كان موظفًا ثم أسس مقهى، نسأل: «وش اللي جذبك لفكرة المقهى وأنت تشتغل في مجال مختلف؟»
إذا ما عرفنا هل ترك الوظيفة أو جمع بين الاثنين: «بالبداية، كنت تجمع بين الوظيفة والمشروع، أو تفرغت له؟»

### ٢. اختيار فكرة رئيسية تربط الحلقة
بعد فهم الخلفية، حدد السؤال الكبير الذي تستكشفه الحلقة. الفكرة تكون محددة وتعكس تجربة الضيف، وتساعد في اختيار المحاور وترتيبها.
مثال: «كيف تكتشف المسار المناسب لك، وكيف تختبره قبل ما تغيّر حياتك؟»
المحاور تستكشف الفكرة من زوايا مختلفة: بداية الاهتمام، التجربة الأولى، اتخاذ القرار، ثم تقييمه اليوم.

### ٣. افتتاح يشد المشاهد ويريح الضيف
افتح بموقف أو قرار موثّق يسهل على الضيف الحديث عنه، ويفتح فضول المستمع.
الافتتاح يتكون من: تقديم مختصر، سؤال يدخلنا إلى تجربة محددة، ومتابعة أو اثنتين، وانتقال يرجع بنا للخلفية.
مثال: «وش تتذكر من يوم افتتحت المقهى؟» ثم انتقال: «خلنا نرجع شوي… كيف بدأت الفكرة أصلًا؟»

### ٤. ترتيب المحاور بحيث كل محور يمهّد للي بعده
ابنِ المحاور حول الأحداث والمعاني الموجودة في خلفية الضيف. لا تفرض عناوين ثابتة.
كل محور يوضح: لماذا نتحدث عنه الآن؟ وما الأسئلة التي تكشفه؟ وكيف يقود للتالي؟
انتقال مقترح: «الحين فهمنا كيف بدأت… خلنا ندخل في اللي صار بعد الافتتاح»

### ٥. أسئلة قصيرة وطبيعية، كل سؤال فيه فكرة واحدة
السؤال واضح بلهجة سعودية طبيعية. سؤال واحد في كل مرة، وتجنب المدح اللي يلقّنه.
مثال: بدل «كيف واجهت التحديات وكيف أثرت عليك؟» تُقسم إلى: «وش كان أصعب جزء في الانتقال؟» ثم «كيف تعاملت معه؟»
وبدل «ليش أهلك رفضوا قرارك؟» نسأل: «كيف كان استقبال أهلك للقرار؟»

### ٦. متابعات حسب الإجابة
لكل سؤال أساسي، ولّد متابعات مشروطة بما يقوله الضيف، لتوضيح إجابة أو طلب مثال.
مثال: إذا كانت الإجابة "سويت تجربة صغيرة"، المتابعة: "وش كنت تبي تعرف من هالتجربة؟"
وإذا كانت "اعتمدت على خبرتي"، المتابعة: "وش من خبرتك ساعدك تحكم على الفكرة؟"

### ٧. إظهار طريقة تفكير الضيف
الأسئلة تكشف كيف وصل إلى القرار: ما الموقف؟ الخيارات؟ ما الذي رجّحه؟ ماذا حدث؟
مثال: «وقتها، وش الخيارات اللي كانت قدامك؟» ثم «وش خلاك تختار هذا الخيار؟» و«وش المعلومة اللي كنت تتمنى تعرفها قبل القرار؟»

### ٨. ربط التجربة بما يهم المستمع
حوّل تفاصيل التجربة لأسئلة تفيد المستمع بـ خطوة عملية، أو فهمًا أعمق.
مثال: «لو شخص عنده فكرة ويشتغل حاليًا، وش تجربة بسيطة يقدر يبدأ فيها؟»
«متى تشوف إن هالطريقة ما تناسب الشخص؟» لا تجعل نجاح ضيف قاعدة للجميع.

### ٩. توزيع مرن لـ٩٠ دقيقة وكثافة أسئلة مدروسة
جهز نحو ١٨–٢٤ سؤالًا أساسيًا للمقابلة بأكملها، و١٠–١٥ متابعة اختيارية.
**بالنسبة لكل محور: يجب أن تولّد من ٣ إلى ٥ أسئلة أساسية فيه، بناءً على أهمية المحور وحجم التفاصيل وفرص الانتشار (viral).**
حدد لكل سؤال أولويته: أساسي، توسّع، احتياطي.

### ١٠. خاتمة مرتبطة بافتتاح الحلقة
الخاتمة تعود للموقف الأول بعد فهم أوسع له.
مثال: «بدأنا من يوم الافتتاح… بعد كل اللي مرّ معك، وش صار يعني لك هاليوم؟»
وسؤال أخير مثل: «وش الشيء اللي تحاول تفهمه أو تتعلمه في مرحلتك الحالية؟»

### ١١. بطاقة واضحة لكل سؤال
كل سؤال يتضمن: السؤال، سبب الاختيار (ارتباطه بالخلفية)، فائدته للمستمع، المصدر (رابط وتاريخ إن وجد)، المتابعات (شروط للإجابات المحتملة)، الأولوية، والوقت التقديري للمحور.

          
          حقل "hostIntro": مقدمة المقدّم. نص حواري كامل، يُقال بصوت عالٍ أمام الجمهور قبل الترحيب بالضيف، مبني على خبرته الفعلية.
          حقل "introWarnings": ضع فيه أي تنبيه للمحرر إذا كانت معلومات الضيف غير مؤكدة تماماً.
          ${userInstructions ? `توجيه خاص من المستخدم يجب الالتزام به حرفياً: "${userInstructions}"` : ""}
          يجب أن تكون جميع النصوص والمخرجات باللغة العربية حصراً. الرد يجب أن يكون بصيغة JSON حصرية.`
        },
        { 
          role: "user", 
          content: `الضيف: ${project.guest.name}
${project.guest.role ? `المنصب/الدور: ${project.guest.role}` : ""}
${project.guest.organization ? `الجهة/المؤسسة: ${project.guest.organization}` : ""}
${project.guest.country ? `البلد: ${project.guest.country}` : ""}
${project.guest.linkedinUrl ? `رابط لينكد إن: ${project.guest.linkedinUrl}` : ""}
${project.guest.url ? `رابط إضافي: ${project.guest.url}` : ""}
${project.guest.phone ? `رقم الجوال: ${project.guest.phone}` : ""}

المصادر:
${contextStr || "لا توجد مصادر محددة، اعتمد على معلوماتك العامة عن الضيف ومسيرته بالإضافة للمعلومات المذكورة أعلاه."}`
        }
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
                          reasoning: { type: "string", description: "سبب اختيار السؤال من خلفية الضيف (In Arabic)" },
                          valueForListener: { type: "string", description: "فائدته للمستمع (In Arabic)" },
                          sourceInfo: { type: "string", description: "المصدر عند وجود معلومة - اختياري (In Arabic)" },
                          type: { type: "string", enum: ["normal", "sensitive", "viral"], description: "Type of question: normal (عادي), sensitive (حساس للضيف أو المجتمع), viral (مثيرة للجدل وتجلب مشاهدات عالية)" },
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
                        required: ["question", "reasoning", "valueForListener", "type", "followUps"],
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
            const whyItMattersFormatted = `السبب: ${q.reasoning || "غير محدد"}\nالفائدة: ${q.valueForListener || "غير محدد"}\nالمصدر: ${q.sourceInfo || "لا يوجد"}`;
            const hostQuestion = await prisma.hostQuestion.create({
              data: { chapterId: chapter.id, question: q.question, type: q.type || "normal", whyItMatters: whyItMattersFormatted, orderIndex: qIdx++ }
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
