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
    <div className="flex flex-col p-8 font-sans w-full" dir="rtl">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row justify-between items-start gap-8 border-b border-[#e8e6df] pb-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              العمل التوثيقي المعتمد | خزانة الأبحاث وبديهيات الرياض
            </div>
            <h1 className="text-4xl font-bold text-[#1b1d20] mb-4">مكتبة بودكاست ضيف الأسبوع</h1>
            <p className="text-gray-500 max-w-2xl leading-relaxed text-sm">
              {projects.length} حلقة مسجلة وموثقة عبر 3 مواسم حوارية. توثق التحولات الإنسانية والمفصلية في الذاكرة السعودية المعاصرة من خلال مسارات إعداد رصينة وتوثيق دقيق لشهادات الضيوف.
            </p>
          </div>
          
          {/* Stats Boxes */}
          <div className="flex items-center gap-6">
            <div className="flex flex-col border-r border-[#e8e6df] pr-6">
              <span className="text-[10px] text-gray-400 font-bold mb-1">إجمالي الحلقات والمشاريع</span>
              <span className="text-2xl font-bold text-[#1b1d20] font-mono">{projects.length}</span>
              <span className="text-[10px] text-[#a1824a] mt-1">
                {projects.filter(p => p.status === 'researching').length} قيد الإعداد حالياً
              </span>
            </div>
            <div className="flex flex-col border-r border-[#e8e6df] pr-6">
              <span className="text-[10px] text-gray-400 font-bold mb-1">إجمالي المصادر المرفوعة</span>
              <span className="text-2xl font-bold text-[#1b1d20]">{projects.reduce((acc, p) => acc + p._count.sources, 0)}</span>
              <span className="text-[10px] text-[#a1824a] mt-1">تمت قراءتها وتحليلها</span>
            </div>
            <div className="flex flex-col pr-6">
              <span className="text-[10px] text-gray-400 font-bold mb-1">إجمالي الأسئلة المستخرجة</span>
              <span className="text-2xl font-bold text-[#1b1d20]">
                {projects.reduce((acc, p) => acc + (p.episodeAngles[0]?.chapters.reduce((cAcc, c) => cAcc + 7, 0) || 0), 0)}
              </span>
              <span className="text-[10px] text-gray-400 mt-1">سؤال استقصائي ذكي</span>
            </div>
          </div>
        </div>

        <ProjectsList initialProjects={projects} />
        
      </div>
    </div>
  );
}
