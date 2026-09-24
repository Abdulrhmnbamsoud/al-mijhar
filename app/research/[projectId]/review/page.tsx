import prisma from "@/lib/prisma";

export default async function ReviewPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  
  const angle = await prisma.episodeAngle.findFirst({
    where: { projectId, isActive: true },
    include: {
      chapters: {
        include: {
          moment: true
        }
      }
    }
  });

  return (
    <div className="w-full px-space-lg py-space-lg max-w-7xl mx-auto space-y-space-md">
      <div className="flex items-center gap-2 mb-space-md">
        <span className="material-symbols-outlined text-badge-inference">fact_check</span>
        <h2 className="font-headline-md text-text-ivory">مراجعة الحلقة والتنبيهات</h2>
      </div>
      <p className="text-text-muted font-body-default mb-space-lg">
        تدقيق وتوثيق اللحظات والأحداث المستخرجة.
      </p>

      {!angle ? (
        <div className="text-center py-space-lg text-text-muted">لا توجد مسارات لمراجعتها.</div>
      ) : (
        <div className="grid grid-cols-1 gap-space-md">
          {angle.chapters.filter(ch => ch.moment).map(chapter => (
            <div key={chapter.id} className="bg-surface-card border border-border-subtle p-space-md rounded-lg flex items-start gap-space-md">
              <div className="mt-1">
                <input type="checkbox" className="w-5 h-5 accent-badge-inference cursor-pointer" />
              </div>
              <div>
                <h3 className="font-headline-sm text-text-ivory mb-1">
                  <span className="text-text-muted font-label-sm ml-2">[{chapter.title}]</span>
                  {chapter.moment!.title}
                </h3>
                <p className="font-body-default text-text-muted mt-2">{chapter.moment!.description}</p>
                
                <div className="mt-space-sm flex gap-2">
                  <span className="px-2 py-1 text-xs rounded bg-surface-elevated border border-border-subtle text-text-dim">
                    الحالة: قيد المراجعة
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
