import prisma from "@/lib/prisma";
import StudioView from "../presenter/StudioView";

export default async function StudioPage({ params }: { params: Promise<{ projectId: string }> }) {
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
            include: { moment: true, hostQuestions: { orderBy: { orderIndex: 'asc' }, include: { followUps: true } } }
          }
        }
      }
    }
  });

  if (!project) return <div>Project not found</div>;

  const activeAngle = project.episodeAngles[0];

  return <StudioView project={project} angle={activeAngle} />;
}
