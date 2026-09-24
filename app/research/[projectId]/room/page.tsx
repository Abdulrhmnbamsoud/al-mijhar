import prisma from "@/lib/prisma";

export default async function ResearchRoomPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  // Simplified room view showing gathered sources
  const project = await prisma.episodeProject.findUnique({
    where: { id: projectId },
    include: { sources: { orderBy: { createdAt: 'desc' } } }
  });

  if (!project) return <div>Project not found</div>;

  return (
    <div className="w-full px-space-lg py-space-lg max-w-7xl mx-auto space-y-space-md">
      <div className="flex items-center gap-2 mb-space-md">
        <span className="material-symbols-outlined text-accent-acid">manage_search</span>
        <h2 className="font-headline-md text-text-ivory">غرفة البحث والتوثيق</h2>
      </div>

      <div className="grid grid-cols-1 gap-space-sm">
        {project.sources.map(source => (
          <div key={source.id} className="bg-surface-card border border-border-subtle p-space-md rounded">
            <h3 className="font-headline-sm text-text-ivory">{source.title}</h3>
            {source.originalUrl && (
              <a href={source.originalUrl} target="_blank" className="text-text-muted font-label-sm block mt-1 hover:text-accent-acid transition-colors">
                {source.originalUrl}
              </a>
            )}
            <p className="font-body-dense text-text-muted mt-space-sm line-clamp-3">
              {source.extractedText}
            </p>
          </div>
        ))}
        {project.sources.length === 0 && (
          <div className="text-center py-space-lg text-text-muted">
            لا توجد مصادر حتى الآن. يتم جمعها بواسطة الباحث الآلي...
          </div>
        )}
      </div>
    </div>
  );
}
