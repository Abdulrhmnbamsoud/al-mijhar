import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await prisma.episodeProject.findUnique({
    where: { id: projectId },
    include: { guest: true },
  });

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="min-h-screen bg-canvas-base flex flex-col font-body-default text-on-surface">
      {/* Header */}
      <header className="sticky top-0 w-full z-50 bg-surface-card border-b border-border-subtle">
        <div className="h-16 w-full px-space-lg flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md">
            <Link href="/" className="flex items-center gap-space-sm pl-space-md border-l border-border-subtle">
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-text-ivory leading-none tracking-tight">المِجهر</span>
                <span className="font-caption-code text-caption-code text-accent-acid mt-space-xs">منظومة إعداد ضيف الأسبوع</span>
              </div>
            </Link>
            
            <div className="hidden xl:flex items-center gap-space-xs bg-badge-fact-bg/40 border border-badge-fact-text/30 px-space-sm py-space-xs rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-badge-fact-text animate-pulse"></span>
              <span className="font-label-sm text-label-sm text-badge-fact-text">حلقة: {project.guest.name}</span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-space-xs">
            <Link href={`/research/${project.id}/desk`} className="px-space-md py-space-xs rounded font-label-md transition-colors text-text-muted hover:text-text-ivory hover:bg-surface-elevated">
              طاولة الحلقة
            </Link>
            <Link href={`/research/${project.id}/room`} className="px-space-md py-space-xs rounded font-label-md transition-colors text-text-muted hover:text-text-ivory hover:bg-surface-elevated">
              غرفة البحث والتوثيق
            </Link>
            <Link href={`/research/${project.id}/pre-interview`} className="px-space-md py-space-xs rounded font-label-md transition-colors text-text-muted hover:text-text-ivory hover:bg-surface-elevated">
              اللقاء التمهيدي
            </Link>
            <Link href={`/research/${project.id}/review`} className="px-space-md py-space-xs rounded font-label-md transition-colors text-text-muted hover:text-text-ivory hover:bg-surface-elevated">
              المراجعة
            </Link>
            <Link href={`/research/${project.id}/presenter`} className="px-space-md py-space-xs rounded font-label-md transition-colors text-text-muted hover:text-text-ivory hover:bg-surface-elevated">
              موجز المقدّم
            </Link>
          </nav>

          <div className="flex items-center gap-space-sm">
            <Link href={`/research/${project.id}/studio`} className="inline-flex items-center gap-space-xs px-space-sm py-space-xs rounded bg-accent-acid font-label-sm text-label-sm font-bold text-canvas-base hover:bg-primary-fixed-dim transition-colors">
              <span className="material-symbols-outlined text-base">desktop_windows</span>
              شاشة المسرح الحي
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col w-full">
        {children}
      </main>
    </div>
  );
}
