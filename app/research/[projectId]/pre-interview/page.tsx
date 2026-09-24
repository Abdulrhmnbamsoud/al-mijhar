import prisma from "@/lib/prisma";

export default async function PreInterviewPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  
  const angle = await prisma.episodeAngle.findFirst({
    where: { projectId, isActive: true },
    include: {
      chapters: {
        include: {
          hostQuestions: true
        }
      }
    }
  });

  return (
    <div className="w-full px-space-lg py-space-lg max-w-7xl mx-auto space-y-space-md">
      <div className="flex items-center gap-2 mb-space-md">
        <span className="material-symbols-outlined text-accent-acid">record_voice_over</span>
        <h2 className="font-headline-md text-text-ivory">اللقاء التمهيدي</h2>
      </div>
      <p className="text-text-muted font-body-default mb-space-lg">استخدم هذه المساحة لتسجيل إجابات الضيف المبدئية أثناء مكالمة الإعداد.</p>

      {!angle ? (
        <div className="text-center py-space-lg text-text-muted">لا توجد أسئلة مقترحة حتى الآن.</div>
      ) : (
        <div className="space-y-space-lg">
          {angle.chapters.map((chapter) => (
            <div key={chapter.id} className="bg-surface-card border border-border-subtle p-space-md rounded-lg">
              <h3 className="font-headline-sm text-text-ivory mb-space-md pb-space-xs border-b border-border-subtle">{chapter.title}</h3>
              <div className="space-y-space-md">
                {chapter.hostQuestions.map((q) => (
                  <div key={q.id} className="flex flex-col space-y-2">
                    <label className="font-label-md text-text-ivory flex items-start gap-2">
                      <span className="material-symbols-outlined text-accent-acid text-sm mt-0.5">help</span>
                      {q.question}
                    </label>
                    <textarea 
                      placeholder="سجّل إجابة الضيف أو ملاحظاتك هنا..." 
                      className="w-full bg-surface-base border border-border-subtle rounded p-space-sm text-text-ivory font-body-default min-h-[100px] focus:border-accent-acid outline-none transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
