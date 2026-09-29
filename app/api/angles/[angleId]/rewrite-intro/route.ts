export const maxDuration = 60;
import { NextResponse } from "next/server";
import OpenAI from "openai";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ angleId: string }> }
) {
  try {
    const { angleId } = await params;
    const body = await request.json();
    const { action, currentText } = body;

    const angle = await prisma.episodeAngle.findUnique({
      where: { id: angleId },
      include: { project: { include: { guest: true } } }
    });

    if (!angle) {
      return NextResponse.json({ error: "Angle not found" }, { status: 404 });
    }

    const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
    
    if (!openai) {
      return NextResponse.json({ error: "OpenAI API Key is missing" }, { status: 500 });
    }

    const guestName = angle.project.guest.name;
    const guestRole = angle.project.guest.role || "";

    let systemInstruction = `أنت رئيس تحرير محترف لبرنامج حواري استقصائي. مهمتك هي تعديل "مقدمة المقدّم" بناءً على طلب فريق الإعداد.
النص الحالي يجب أن يقرأ على الهواء للترحيب بالضيف: ${guestName} (${guestRole}).
حافظ على طبيعة النص الإذاعية والتقديمية بحيث تكون المقدمة متماسكة وجاهزة للقراءة.
لا تضف أي معلومات وهمية.
قم بإرجاع النص الجديد فقط بدون أي مقدمات أو شروحات إضافية.
`;

    if (action === "shorter") {
      systemInstruction += "\nالمطلوب: اجعل المقدمة أقصر وأكثر كثافة وإيقاعاً أسرع، دون الإخلال بالمعنى الأساسي أو هيبة التقديم. مدة القراءة يجب ألا تتجاوز 25 ثانية.";
    } else if (action === "warmer") {
      systemInstruction += "\nالمطلوب: اجعل أسلوب المقدمة أدفأ، أكثر ترحاباً وحميمية، وكأنك تستقبل ضيفاً عزيزاً أو شخصية لها مكانة عاطفية خاصة لدى الجمهور، دون أن تفقد مهنيتها.";
    } else {
      systemInstruction += "\nالمطلوب: أعد صياغة المقدمة بالكامل لتكون أقوى في لغتها، أكثر جاذبية وتشويقاً للمشاهد، وتبرز أهمية اللقاء بشكل أفضل من الصياغة الحالية.";
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: `النص الحالي:\n${currentText}` }
      ],
    });

    const newIntro = completion.choices[0].message.content?.trim() || currentText;

    // We do NOT save it to the DB automatically. We let the user see it in the editor and click "Save/Approve" later.
    // If the user wanted it saved, we would do:
    // await prisma.episodeAngle.update({ where: { id: angleId }, data: { hostIntro: newIntro } });

    return NextResponse.json({ success: true, newText: newIntro });
  } catch (error: any) {
    console.error("Error rewriting intro:", error);
    return NextResponse.json({ error: "Failed to rewrite intro" }, { status: 500 });
  }
}
