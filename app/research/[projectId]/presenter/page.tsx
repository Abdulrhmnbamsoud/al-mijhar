import prisma from "@/lib/prisma";

export default async function PresenterPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  
  const project = await prisma.episodeProject.findUnique({
    where: { id: projectId },
    include: { guest: true }
  });

  const angle = await prisma.episodeAngle.findFirst({
    where: { projectId, isActive: true },
    include: {
      chapters: {
        include: {
          moment: true,
          hostQuestions: {
            include: { followUps: true }
          }
        },
        orderBy: { orderIndex: 'asc' }
      }
    }
  });

  if (!project) return null;

  return (
    <div className="w-full px-space-lg py-space-xl max-w-4xl mx-auto space-y-space-xl print:bg-white print:text-black">
      <div className="text-center pb-space-lg border-b border-border-subtle print:border-black">
        <h1 className="font-headline-lg text-text-ivory print:text-black tracking-tight mb-space-sm">{project.guest.name}</h1>
        <p className="font-label-lg text-text-muted print:text-gray-700">{project.guest.role} {project.guest.organization && `| ${project.guest.organization}`}</p>
      </div>

      {project.notes && (
        <section className="space-y-space-sm">
          <h2 className="font-headline-sm text-accent-acid print:text-black">من هو؟</h2>
          <p className="font-body-default text-text-ivory print:text-black leading-relaxed">{project.notes}</p>
        </section>
      )}

      {angle && (
        <>
          <section className="bg-surface-elevated print:bg-gray-100 p-space-md rounded-lg border border-accent-acid/30 print:border-black">
            <h2 className="font-caption-code text-accent-acid print:text-black mb-1">زاوية الحلقة المعتمدة:</h2>
            <p className="font-headline-md text-text-ivory print:text-black">{angle.angle}</p>
          </section>

          <div className="space-y-space-xl">
            {angle.chapters.map((chapter) => (
              <section key={chapter.id} className="space-y-space-md">
                <div className="flex items-center gap-space-sm border-b border-border-subtle print:border-black pb-space-xs">
                  <span className="bg-accent-acid text-canvas-base print:bg-black print:text-white font-bold px-2 py-1 rounded text-sm">{chapter.orderIndex}</span>
                  <h3 className="font-headline-sm text-text-ivory print:text-black">{chapter.title}</h3>
                </div>
                
                {chapter.moment && (
                  <div className="bg-badge-fact-bg/20 print:bg-gray-50 border-r-4 border-badge-fact-text print:border-gray-500 p-space-sm pl-space-lg text-text-ivory print:text-black">
                    <strong className="block mb-1">{chapter.moment.title}</strong>
                    <p className="font-body-dense text-text-muted print:text-gray-700">{chapter.moment.description}</p>
                  </div>
                )}

                <ul className="space-y-space-md list-none pl-0 pr-space-md">
                  {chapter.hostQuestions.map((q) => (
                    <li key={q.id} className="relative">
                      <span className="absolute -right-space-md top-1 text-accent-acid print:text-black">•</span>
                      <p className="font-label-lg text-text-ivory print:text-black mb-1">{q.question}</p>
                      {q.whyItMatters && (
                        <p className="font-body-dense text-text-muted print:text-gray-600 mb-2">الهدف: {q.whyItMatters}</p>
                      )}
                      
                      {q.followUps.length > 0 && (
                        <ul className="pr-space-md border-r border-border-subtle print:border-gray-300 mt-2 space-y-2">
                          {q.followUps.map(f => (
                            <li key={f.id} className="text-text-muted print:text-gray-800 font-label-md flex gap-2">
                              <span>-</span> <span>{f.question}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
