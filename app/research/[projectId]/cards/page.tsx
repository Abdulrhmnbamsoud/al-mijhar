import prisma from "@/lib/prisma";
import Link from "next/link";
import CardsClient from "./CardsClient";

export default async function CardsPage({
  params,
  searchParams
}: {
  params: Promise<{ projectId: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { projectId } = await params;
  const resolvedSearchParams = await searchParams;
  const angleId = typeof resolvedSearchParams.angleId === 'string' ? resolvedSearchParams.angleId : undefined;
  
  const angleWhere = angleId ? { id: angleId } : { isActive: true };
  const project = await prisma.episodeProject.findUnique({
    where: { id: projectId },
    include: {
      episodeAngles: {
        where: angleWhere,
        include: {
          chapters: {
            orderBy: { orderIndex: 'asc' },
            include: {
              hostQuestions: {
                orderBy: { orderIndex: 'asc' },
                include: { followUps: { orderBy: { orderIndex: 'asc' } } }
              }
            }
          }
        }
      }
    }
  });

  if (!project) return <div className="p-10 text-center font-bold text-white">المشروع غير موجود</div>;

  const activeAngle = project.episodeAngles.length > 0 ? project.episodeAngles[0] : null;
  if (!activeAngle) return <div className="p-10 text-center font-bold text-white">لا توجد محاور معتمدة</div>;

  // Flatten chapters into an array of cards for the iPad
  const allCards: any[] = [];
  activeAngle.chapters.forEach((chapter, chIdx) => {
    // Add a chapter title card
    allCards.push({
      type: "chapter_title",
      title: chapter.title,
      index: chIdx + 1,
      estimatedMinutes: chapter.estimatedMinutes
    });

    chapter.hostQuestions.forEach((hq, qIdx) => {
      allCards.push({
        type: "question",
        question: hq.question,
        questionType: hq.type,
        whyItMatters: hq.whyItMatters,
        followUps: hq.followUps,
        qIndex: qIdx + 1,
        chIndex: chIdx + 1
      });
    });
  });

  return (
    <div className="w-full h-screen bg-[#111214] font-sans flex flex-col overflow-hidden" dir="rtl">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#1b1d20] border-b border-[#282a2f] shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">كروت الأسئلة - وضع الآيباد</h1>
          <p className="text-sm text-gray-400 mt-1">{activeAngle.angle}</p>
        </div>
        <Link href={`/research/${project.id}/desk`} className="bg-[#282a2f] hover:bg-gray-700 text-white p-2 rounded-full transition-colors flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px]">close</span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex items-center justify-center relative">
        <CardsClient cards={allCards} />
      </main>
    </div>
  );
}
