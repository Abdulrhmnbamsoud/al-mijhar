import prisma from "@/lib/prisma";
import Link from "next/link";
import { AutoRefresh } from "@/components/AutoRefresh";

export default async function EpisodeDeskPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await prisma.episodeProject.findUnique({
    where: { id: projectId },
    include: {
      guest: true,
      episodeAngles: {
        where: { isActive: true },
        include: {
          chapters: {
            orderBy: { orderIndex: 'asc' },
            include: {
              moment: {
                include: {
                  excerpts: {
                    include: { excerpt: { include: { source: true } } }
                  }
                }
              },
              hostQuestions: {
                orderBy: { orderIndex: 'asc' },
                include: { followUps: { orderBy: { orderIndex: 'asc' } }, excerpt: { include: { source: true } } }
              }
            }
          }
        }
      }
    }
  });

  if (!project) return <div>Project not found</div>;

  const activeAngle = project.episodeAngles[0];

  return (
    <div className="w-full px-space-lg py-space-lg max-w-7xl mx-auto space-y-space-lg">
      
      {/* Header Profile */}
      <section className="w-full bg-surface-card border border-border-subtle rounded-lg p-space-lg relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-lg relative z-10">
          <div className="flex flex-col space-y-space-xs">
            <h1 className="font-headline-lg text-headline-lg text-text-ivory tracking-tight">{project.guest.name}</h1>
            <p className="font-body-dense text-body-dense text-text-muted">
              {project.guest.role} {project.guest.organization && `| ${project.guest.organization}`}
            </p>
            
            {project.notes && (
              <div className="mt-space-sm p-space-sm bg-surface-base border border-border-subtle rounded text-text-muted font-body-dense max-w-3xl leading-relaxed">
                <span className="material-symbols-outlined text-sm inline-block ml-1 align-text-bottom">person_book</span>
                {project.notes}
              </div>
            )}
            
            {activeAngle && (
              <div className="mt-space-md p-space-sm bg-surface-elevated border border-accent-acid/30 rounded inline-block max-w-3xl">
                <span className="font-caption-code text-caption-code text-accent-acid block mb-1">زاوية الحلقة المعتمدة:</span>
                <p className="font-body-default text-text-ivory font-medium">{activeAngle.angle}</p>
              </div>
            )}
            {!activeAngle && project.status === "researching" && (
              <div className="mt-space-md p-space-sm bg-surface-elevated border border-accent-acid/30 rounded inline-flex items-center gap-2">
                <span className="material-symbols-outlined text-accent-acid animate-spin">progress_activity</span>
                <span className="font-label-sm text-text-ivory">جاري جمع المصادر وبناء الزاوية والفصول بواسطة الذكاء الاصطناعي...</span>
                <AutoRefresh intervalMs={2000} />
              </div>
            )}
            {!activeAngle && project.status !== "researching" && (
              <div className="mt-space-md p-space-sm bg-surface-elevated border border-badge-gap-risk/30 rounded inline-block">
                <span className="font-label-sm text-badge-gap-risk block mb-1">تنبيه: لا توجد زاوية حلقة معتمدة حتى الآن</span>
                <Link href={`/research/${project.id}/room`} className="text-sm text-text-ivory underline">
                  الذهاب إلى غرفة البحث لتوليد المقترح
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-space-sm">
            <button className="px-space-md py-2 rounded bg-surface-elevated border border-border-subtle font-label-md text-text-ivory hover:border-accent-acid transition-colors">
              إعادة توليد المحاور
            </button>
          </div>
        </div>
      </section>

      {/* Chapters/Axes (Timeline path) */}
      {activeAngle && (
        <section className="space-y-space-md">
          <div className="flex items-center gap-2 mb-space-md">
            <span className="material-symbols-outlined text-accent-acid">route</span>
            <h2 className="font-headline-md text-text-ivory">مسار الحلقة والفصول</h2>
          </div>

          <div className="grid grid-cols-1 gap-space-md">
            {activeAngle.chapters.map((chapter, idx) => (
              <div key={chapter.id} className="bg-surface-card border border-border-subtle rounded-lg p-space-md hover:border-outline-variant transition-colors group">
                <div className="flex items-start gap-space-md">
                  {/* Chapter number indicator */}
                  <div className="w-10 h-10 shrink-0 rounded-full bg-surface-elevated border border-border-subtle flex items-center justify-center font-headline-sm text-accent-acid">
                    {idx + 1}
                  </div>
                  
                  <div className="flex-grow space-y-space-sm">
                    <details className="group/details">
                      <summary className="flex justify-between items-center border-b border-border-subtle pb-space-xs cursor-pointer select-none outline-none list-none [&::-webkit-details-marker]:hidden">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-text-muted transition-transform group-open/details:rotate-90">chevron_left</span>
                          <h3 className="font-headline-sm text-text-ivory group-hover:text-accent-acid transition-colors">{chapter.title}</h3>
                        </div>
                        <span className="font-caption-code text-text-dim">{chapter.estimatedMinutes} دقيقة</span>
                      </summary>

                      <div className="pt-space-md space-y-space-md animate-in fade-in slide-in-from-top-2">
                        {/* Moment / Fact context */}
                        {chapter.moment && (
                          <div className="bg-surface-elevated p-space-sm rounded border border-border-subtle text-text-muted font-body-dense flex gap-2">
                            <span className="material-symbols-outlined text-sm text-badge-fact-text shrink-0 mt-0.5">info</span>
                            <div>
                              <strong className="text-text-ivory">{chapter.moment.title}: </strong>
                              {chapter.moment.description}
                            </div>
                          </div>
                        )}

                        {/* Questions */}
                        <div className="space-y-space-xs">
                          {chapter.hostQuestions.map((q, qIdx) => (
                            <div key={q.id} className="bg-surface-container-low p-space-sm rounded border-l-2 border-l-accent-acid">
                              <p className="font-body-default text-text-ivory font-medium">س: {q.question}</p>
                              {q.whyItMatters && (
                                <p className="font-caption-code text-text-dim mt-1">الهدف: {q.whyItMatters}</p>
                              )}
                              
                              {/* Follow-ups */}
                              {q.followUps.length > 0 && (
                                <div className="mt-space-sm pl-space-md border-r-2 border-r-border-subtle space-y-1">
                                  {q.followUps.map(fu => (
                                    <p key={fu.id} className="font-body-dense text-text-muted flex gap-1">
                                      <span className="material-symbols-outlined text-[14px] text-badge-claim-text shrink-0 mt-0.5">turn_right</span>
                                      {fu.question}
                                    </p>
                                  ))}
                                </div>
                              )}

                              {/* Source Link if present */}
                              {q.excerpt && (
                                <div className="mt-space-sm text-xs bg-surface-elevated inline-flex items-center gap-1 px-2 py-1 rounded text-text-muted">
                                  <span className="material-symbols-outlined text-[14px]">link</span>
                                  مستند من: {q.excerpt.source.title}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </details>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
