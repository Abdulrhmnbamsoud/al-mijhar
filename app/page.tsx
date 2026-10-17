import prisma from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import ProjectsList from "@/components/ProjectsList";

export const dynamic = 'force-dynamic';

export default async function ProjectsArchive() {
  const projects = await prisma.episodeProject.findMany({
    include: {
      guest: true,
      episodeAngles: {
        include: {
          chapters: {
            take: 4,
            orderBy: { orderIndex: 'asc' }
          }
        }
      },
      _count: {
        select: { sources: true, storyMoments: true }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div className="flex flex-col p-4 sm:p-8 font-sans w-full" dir="rtl">
      <div className="max-w-6xl mx-auto w-full space-y-6 sm:space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row justify-between items-start gap-6 sm:gap-8 border-b border-[#e8e6df] pb-6 sm:pb-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2 sm:mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              العمل التوثيقي المعتمد | خزانة الأبحاث وبديهيات الرياض
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-[#1b1d20] mb-2 sm:mb-4">مكتبة بودكاست ضيف الأسبوع</h1>
            <p className="text-gray-500 max-w-2xl leading-relaxed text-xs sm:text-sm">
              {projects.length} حلقة مسجلة وموثقة عبر 3 مواسم حوارية. توثق التحولات الإنسانية والمفصلية في الذاكرة السعودية المعاصرة من خلال مسارات إعداد رصينة وتوثيق دقيق لشهادات الضيوف.
            </p>
          </div>
          
          {/* Stats Boxes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 w-full xl:w-auto">
            <div className="flex flex-col border-r border-[#e8e6df] pr-3 sm:pr-6">
              <span className="text-[10px] text-gray-400 font-bold mb-1">إجمالي الحلقات</span>
              <span className="text-xl sm:text-2xl font-bold text-[#1b1d20] font-mono">{projects.length}</span>
              <span className="text-[10px] text-[#a1824a] mt-0.5 sm:mt-1">
                {projects.filter(p => p.status === 'researching').length} قيد الإعداد
              </span>
            </div>
            <div className="flex flex-col border-r border-[#e8e6df] pr-3 sm:pr-6">
              <span className="text-[10px] text-gray-400 font-bold mb-1">إجمالي المصادر</span>
              <span className="text-xl sm:text-2xl font-bold text-[#1b1d20]">{projects.reduce((acc, p) => acc + p._count.sources, 0)}</span>
              <span className="text-[10px] text-[#a1824a] mt-0.5 sm:mt-1">مقروءة ومحللة</span>
            </div>
            <div className="flex flex-col pr-3 sm:pr-6 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-gray-400 font-bold mb-1">إجمالي الأسئلة</span>
              <span className="text-xl sm:text-2xl font-bold text-[#1b1d20]">
                {projects.reduce((acc, p) => acc + (p.episodeAngles[0]?.chapters.reduce((cAcc, c) => cAcc + 7, 0) || 0), 0)}
              </span>
              <span className="text-[10px] text-gray-400 mt-0.5 sm:mt-1">سؤال استقصائي ذكي</span>
            </div>
          </div>
        </div>

        <ProjectsList initialProjects={projects} />
        
      </div>
    </div>
  );
}
