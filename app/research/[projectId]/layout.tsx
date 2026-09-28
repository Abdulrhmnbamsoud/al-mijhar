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
    <div className="w-full h-full flex flex-col font-body-default text-on-surface">
      {/* Main Content */}
      <main className="flex-grow flex flex-col w-full h-full overflow-hidden">
        {children}
      </main>
    </div>
  );
}
