import prisma from "@/lib/prisma";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

export default async function ProjectsList() {
  const projects = await prisma.episodeProject.findMany({
    include: {
      guest: true,
      _count: {
        select: { sources: true, storyMoments: true }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <main className="min-h-screen bg-canvas-base flex flex-col p-space-lg">
      <div className="max-w-7xl mx-auto w-full space-y-space-lg">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-space-md border-b border-border-subtle pb-space-md">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-text-ivory">مشاريع الحلقات</h1>
            <p className="font-body-default text-text-muted mt-space-xs">
              مسار الحلقات في خط الإنتاج. متابعة دقيقة لكل ضيف عبر مراحل البحث، التدقيق، وجاهزية المذيع.
            </p>
          </div>
          <Link 
            href="/new"
            className="px-space-md py-space-sm bg-accent-acid text-canvas-base font-label-md font-bold rounded flex items-center gap-space-xs hover:bg-primary-fixed-dim transition-colors"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            مشروع ضيف جديد
          </Link>
        </header>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
          {projects.map(project => (
            <Link key={project.id} href={`/research/${project.id}/desk`} className="group">
              <div className="bg-surface-card border border-border-subtle rounded-lg p-space-md h-full flex flex-col hover:border-outline transition-colors relative overflow-hidden">
                <div className="flex justify-between items-start mb-space-md relative z-10">
                  <div className="flex items-center gap-space-xs">
                    <span className={`w-2 h-2 rounded-full ${project.status === 'ready' ? 'bg-badge-fact-text' : 'bg-badge-inference'}`}></span>
                    <span className="font-caption-code text-caption-code text-text-dim">
                      {project.status === 'draft' && "مسودة أولية"}
                      {project.status === 'researching' && "غرفة البحث والتوثيق"}
                      {project.status === 'pre_interview' && "اللقاء التمهيدي"}
                      {project.status === 'editing' && "طاولة الحلقة"}
                      {project.status === 'reviewing' && "مراجعة واعتماد"}
                      {project.status === 'ready' && "جاهزة للمقدم"}
                    </span>
                  </div>
                  <span className="font-caption-code text-caption-code text-text-muted">
                    {formatDistanceToNow(project.updatedAt, { addSuffix: true, locale: ar })}
                  </span>
                </div>
                
                <h2 className="font-headline-sm text-text-ivory group-hover:text-accent-acid transition-colors mb-space-xs relative z-10">
                  {project.guest.name}
                </h2>
                
                <p className="font-body-dense text-text-muted line-clamp-2 mb-space-md flex-grow relative z-10">
                  {project.guest.role} {project.guest.organization && `• ${project.guest.organization}`}
                </p>

                <div className="flex items-center gap-space-md pt-space-sm border-t border-border-subtle font-label-sm text-text-dim relative z-10">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">description</span>
                    {project._count.sources} مصدر
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">flash_on</span>
                    {project._count.storyMoments} لحظة قصة
                  </span>
                </div>
                
                {/* Subtle gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-surface-elevated/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </Link>
          ))}

          {projects.length === 0 && (
            <div className="col-span-full py-space-xl flex flex-col items-center justify-center border border-dashed border-border-subtle rounded-lg bg-surface-elevated/20 text-center">
              <span className="material-symbols-outlined text-4xl text-text-dim mb-space-sm">inbox</span>
              <h3 className="font-headline-sm text-text-ivory mb-space-xs">لا توجد مشاريع حالياً</h3>
              <p className="font-body-default text-text-muted max-w-md">
                ابدأ بإنشاء مشروع ضيف جديد لجمع المصادر وإعداد خطة اللقاء.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
