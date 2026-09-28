import prisma from "@/lib/prisma";
import StudioView from "./StudioView";

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

  return <StudioView project={project} angle={angle} />;
}
