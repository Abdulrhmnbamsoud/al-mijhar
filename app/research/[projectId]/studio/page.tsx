import prisma from "@/lib/prisma";

export default async function StudioPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await prisma.episodeProject.findUnique({
    where: { id: projectId },
    include: {
      episodeAngles: {
        where: { isActive: true },
        include: {
          chapters: {
            orderBy: { orderIndex: 'asc' },
            include: { hostQuestions: { orderBy: { orderIndex: 'asc' }, include: { followUps: true } } }
          }
        }
      }
    }
  });

  if (!project) return <div>Project not found</div>;

  const activeAngle = project.episodeAngles[0];

  return (
    <div className="min-h-screen bg-canvas-base w-full flex flex-col p-space-xl">
      <div className="flex justify-between items-center mb-space-xl border-b border-border-subtle pb-space-md">
        <h1 className="font-display-hero text-text-ivory">شاشة المسرح (وضع التصوير)</h1>
        <span className="font-label-md text-accent-acid animate-pulse flex items-center gap-2">
          <span className="material-symbols-outlined">fiber_manual_record</span>
          مباشر
        </span>
      </div>

      {activeAngle && activeAngle.chapters[0] && activeAngle.chapters[0].hostQuestions[0] ? (
        <div className="max-w-4xl mx-auto text-center space-y-space-xl mt-12">
          <h2 className="font-headline-md text-accent-acid">السؤال الحالي</h2>
          <p className="text-5xl font-display-hero leading-tight text-text-ivory">
            {activeAngle.chapters[0].hostQuestions[0].question}
          </p>
          
          {activeAngle.chapters[0].hostQuestions[0].whyItMatters && (
            <div className="mt-space-xl p-space-md border border-border-subtle rounded-lg bg-surface-elevated max-w-2xl mx-auto">
              <span className="text-badge-fact-text font-label-md block mb-2">توجيه للمقدم:</span>
              <p className="text-text-muted font-body-lead">
                {activeAngle.chapters[0].hostQuestions[0].whyItMatters}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-text-muted mt-24">
          لا توجد أسئلة معتمدة في هذا المشروع بعد.
        </div>
      )}
    </div>
  );
}
