import OpenAI from "openai";
import OpenAI from "openai";

const openai = new OpenAI();

const systemPrompt = `أنت رئيس تحرير محترف لبرنامج "المجهر". هذه هي النقاط الأساسية لمنهجيتك التي يجب الالتزام بها حرفياً:

1. **بناء الحلقة على خلفية الضيف:** اجمع مسيرته وتجاربه وتصريحاته من المصادر، ثم ابنِ الأسئلة عليها. (مثال: إذا انتقل من وظيفة لمشروع: "وش خلاك تفكر تبدأ مشروعك وأنت عندك وظيفة؟")
2. **اختيار فكرة رئيسية تربط الحلقة:** حدد خيطًا مناسبًا لقصة الضيف (angle)، وتخدمه المحاور.
3. **افتتاح يشد المشاهد ويريح الضيف:** نبدأ بموقف حقيقي ومهم، بسؤال واضح يقدر الضيف يحكي عنه. (مثال: "يوم جاءك أول عميل، وش صار معك؟")
4. **ترتيب المحاور بحيث كل محور يمهّد للي بعده:** ينتقل الحوار من الدافع إلى المحاولة، ثم التحدي والقرار والنتيجة.
5. **أسئلة قصيرة وطبيعية، كل سؤال فيه فكرة واحدة:** تُكتب بلهجة سعودية مريحة للمقدم والضيف، بدون اتهامات أو افتراض مشاعر. (مثال: "كيف كان استقبال أهلك للقرار؟" بدل "ليش أهلك ما دعموك؟")
6. **متابعات حسب الإجابة (followUps):** ولّد متابعات اختيارية تساعد المقدم يطلب تفاصيل أو مثالًا.
7. **إظهار طريقة تفكير الضيف:** نتجاوز سرد الإنجازات إلى فهم قراراته، مع مساحة للنقاش باحترام.
8. **ربط التجربة بما يهم المستمع:** تأتي الفائدة العملية من موقف شرحه الضيف، وتوضح حدود تطبيقها.
9. **توزيع مرن لـ٩٠ دقيقة:** جهز نحو ١٨–٢٤ سؤالًا أساسيًا (موزعة على المحاور) و١٠–١٥ متابعة اختيارية، ويوزع الوقت حسب ثراء المحاور.
10. **خاتمة مرتبطة بافتتاح الحلقة:** نرجع للموقف الأول بعد ما فهمنا القصة، ونترك المشاهد بمعنى واضح.
11. **بطاقة واضحة لكل سؤال:** كل سؤال يجب أن يتضمن: السؤال نفسه، سبب اختياره من خلفية الضيف (reasoning)، فائدته للمستمع (valueForListener)، والمصدر (sourceInfo).

حقل "hostIntro": مقدمة المقدّم. نص حواري كامل، يُقال بصوت عالٍ أمام الجمهور قبل الترحيب بالضيف، مبني على خبرته الفعلية.
حقل "introWarnings": ضع فيه أي تنبيه للمحرر إذا كانت معلومات الضيف غير مؤكدة تماماً.
يجب أن تكون جميع النصوص والمخرجات باللغة العربية حصراً. الرد يجب أن يكون بصيغة JSON حصرية.`;

const jsonSchema = {
  name: "episode_structure",
  schema: {
    type: "object",
    properties: {
      angle: { type: "string" },
      chapters: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            hostQuestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  reasoning: { type: "string" },
                  valueForListener: { type: "string" },
                  sourceInfo: { type: "string" },
                  followUps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: { question: { type: "string" } },
                      required: ["question"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["question", "reasoning", "valueForListener", "followUps"],
                additionalProperties: false
              }
            }
          },
          required: ["title", "hostQuestions"],
          additionalProperties: false
        }
      }
    },
    required: ["angle", "chapters"],
    additionalProperties: false
  }
};

async function testGuest(guestProfile: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: guestProfile }
    ],
    response_format: { type: "json_schema", json_schema: jsonSchema }
  });
  return JSON.parse(completion.choices[0].message.content || "{}");
}

async function run() {
  const guest1 = `الضيف: مهندس برمجيات قرر ترك وظيفة مرموقة في شركة كبرى لتأسيس مقهى مختص صغير.
الخلفية: اشتغل 7 سنين في أرامكو، كان راتبه عالي. فجأة فتح مقهى في الرياض. المقهى نجح بعد أول سنة عانى فيها من خسائر. في تغريدة له قديمة قال "البزنس بدون شقاوة وتعب ما له طعم".`;

  const guest2 = `الضيف: لاعبة شطرنج محترفة، فازت ببطولات دولية، ثم انتقلت فجأة لعالم الاستثمار في التقنية العميقة.
الخلفية: تم استضافتها في بودكاست قديم وقالت "رقعة الشطرنج علمتني أن كل خطوة لها ثمن، ونفس الشيء في الاستثمار". حالياً تدير صندوق استثماري بملايين الريالات.`;

  console.log("=== Guest 1 ===");
  const res1 = await testGuest(guest1);
  console.log("Angle:", res1.angle);
  console.log("First Chapter Title:", res1.chapters[0].title);
  console.log("First Question:", res1.chapters[0].hostQuestions[0]);

  console.log("\n=== Guest 2 ===");
  const res2 = await testGuest(guest2);
  console.log("Angle:", res2.angle);
  console.log("First Chapter Title:", res2.chapters[0].title);
  console.log("First Question:", res2.chapters[0].hostQuestions[0]);
}

run().catch(console.error);
