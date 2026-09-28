import prisma from "@/lib/prisma";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

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
    <div className="min-h-screen bg-[#f8f8f5] flex flex-col p-8 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row justify-between items-start gap-8 border-b border-[#e8e6df] pb-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              العمل التوثيقي المعتمد | خزانة الأبحاث وبديهيات الرياض
            </div>
            <h1 className="text-4xl font-bold text-[#1b1d20] mb-4">مكتبة سوالف المجهر الوثائقية</h1>
            <p className="text-gray-500 max-w-2xl leading-relaxed text-sm">
              {projects.length} حلقة مسجلة وموثقة عبر 3 مواسم حوارية. توثق التحولات الإنسانية والمفصلية في الذاكرة السعودية المعاصرة من خلال مسارات إعداد رصينة وتوثيق دقيق لشهادات الضيوف.
            </p>
          </div>
          
          {/* Stats Boxes */}
          <div className="flex items-center gap-6">
            <div className="flex flex-col border-r border-[#e8e6df] pr-6">
              <span className="text-[10px] text-gray-400 font-bold mb-1">إجمالي ساعات الحوار</span>
              <span className="text-2xl font-bold text-[#1b1d20] font-mono">34:30:00</span>
              <span className="text-[10px] text-[#a1824a] mt-1">320 ساعة قيد الإعداد</span>
            </div>
            <div className="flex flex-col border-r border-[#e8e6df] pr-6">
              <span className="text-[10px] text-gray-400 font-bold mb-1">المصادر الموثقة والمراجعة</span>
              <span className="text-2xl font-bold text-[#1b1d20]">{projects.reduce((acc, p) => acc + p._count.sources, 0) + 128} وثيقة</span>
              <span className="text-[10px] text-[#a1824a] mt-1">88 تسجيلة صوتية</span>
            </div>
            <div className="flex flex-col pr-6">
              <span className="text-[10px] text-gray-400 font-bold mb-1">الموسم النشط الحالي</span>
              <span className="text-2xl font-bold text-[#1b1d20]">الموسم الثالث</span>
              <span className="text-[10px] text-gray-400 mt-1">حلقات المكان والناس</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between border-b border-[#e8e6df] pb-4">
            
            <div className="relative flex-1 min-w-[300px] max-w-md">
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
              <input 
                type="text" 
                placeholder="ابحث بالاسم، المحور الحواري، أو وسيلة الرواية..." 
                className="w-full bg-white border border-[#e8e6df] rounded px-10 py-2.5 text-xs focus:outline-none focus:border-[#a1824a] transition-colors"
              />
            </div>
            
            <div className="flex items-center bg-[#f8f8f5] rounded p-1">
              <button className="px-4 py-1.5 bg-[#1b1d20] text-white text-[11px] font-medium rounded flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">grid_view</span>
                الكل
              </button>
              <button className="px-4 py-1.5 text-gray-500 hover:text-[#1b1d20] text-[11px] font-medium transition-colors">المواسم (4)</button>
              <button className="px-4 py-1.5 text-gray-500 hover:text-[#1b1d20] text-[11px] font-medium transition-colors">الموسم 3 (حالي)</button>
              <button className="px-4 py-1.5 text-gray-500 hover:text-[#1b1d20] text-[11px] font-medium transition-colors">الموسم 2 (حوارات العاصمة)</button>
              <button className="px-4 py-1.5 text-gray-500 hover:text-[#1b1d20] text-[11px] font-medium transition-colors">الموسم 1 (البدايات)</button>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-xs justify-between">
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-[11px]">تصنيف السالفة:</span>
              <span className="px-3 py-1 bg-[#1b1d20] text-white rounded text-[11px]">الكل</span>
              <span className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded cursor-pointer transition-colors text-[11px]">تحولات مدينة</span>
              <span className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded cursor-pointer transition-colors text-[11px]">توثيق تمدن وتراث</span>
              <span className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded cursor-pointer transition-colors text-[11px]">إعلام وثقافة</span>
              <span className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded cursor-pointer transition-colors text-[11px]">تجارة وأنثروبولوجيا</span>
            </div>
            
            <Link 
              href="/new"
              className="px-4 py-1.5 bg-[#a1824a] hover:bg-[#8b6e3e] text-white text-[11px] font-bold rounded flex items-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              مشروع جديد
            </Link>
          </div>
        </div>

        {/* Projects List */}
        <div className="space-y-6 pt-4">
          {projects.map(project => {
            const angle = project.episodeAngles[0];
            const chapters = angle?.chapters || [];
            
            return (
              <div key={project.id} className="bg-white border border-[#e8e6df] rounded-xl overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-md transition-shadow">
                
                {/* Image Placeholder - Right Side */}
                <div className="md:w-72 bg-[#e8e6df] relative flex-shrink-0 min-h-[200px] md:min-h-full overflow-hidden">
                   {/* Real Guest Image from LinkedIn or fallback */}
                   <img 
                     src={
                       project.guest.linkedinUrl && project.guest.linkedinUrl.match(/linkedin\.com\/in\/([^\/\?]+)/)
                         ? `https://unavatar.io/linkedin/${project.guest.linkedinUrl.match(/linkedin\.com\/in\/([^\/\?]+)/)?.[1]}?fallback=${encodeURIComponent(`https://ui-avatars.com/api/?name=${encodeURIComponent(project.guest.name)}&background=e8e6df&color=1b1d20&size=512`)}`
                         : `https://ui-avatars.com/api/?name=${encodeURIComponent(project.guest.name)}&background=e8e6df&color=1b1d20&size=512`
                     }
                     alt={project.guest.name}
                     className="absolute inset-0 w-full h-full object-cover object-center filter grayscale opacity-90 mix-blend-multiply"
                   />
                   
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                   
                   <div className="absolute bottom-4 right-4 text-white text-[10px] px-3 py-1.5 rounded-full flex items-center gap-2 z-10 border border-white/20 bg-black/40 backdrop-blur-sm">
                     <span className="material-symbols-outlined text-[14px]">play_circle</span>
                     المدة 2:50 | حلقة {project.id.slice(-4)} (الجديد)
                   </div>
                   
                   <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-[#1b1d20] text-[10px] font-bold px-3 py-1.5 rounded shadow-sm z-10">
                     الموسم 3 - حلقة {project.id.slice(-4)}
                   </div>
                   <div className="absolute top-4 left-4 bg-[#a1824a] text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10">
                     {project.status === 'ready' ? 'مكتملة' : 'قيد الإعداد'}
                   </div>
                </div>

                {/* Content - Left Side */}
                <div className="p-6 flex-1 flex flex-col">
                  
                  <div className="flex items-center gap-2 text-[10px] font-medium text-[#a1824a] mb-2">
                    <span className="material-symbols-outlined text-[12px]">location_on</span>
                    معلومات سرية وعائلية قرية | تم التسجيل في استوديو المجهر - الديرة
                  </div>
                  
                  <h2 className="text-xl font-bold text-[#1b1d20] mb-2 leading-tight">
                    {project.guest.name}: {angle?.angle || "الحلقة قيد الإعداد..."}
                  </h2>
                  
                  <p className="text-[13px] text-gray-500 mb-6 line-clamp-2">
                    {project.guest.role} {project.guest.organization && `• ${project.guest.organization}`}
                  </p>

                  <div className="mb-4 bg-[#f8f8f5] rounded-lg p-4 border border-[#e8e6df]">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-[#a1824a] text-[14px]">format_list_bulleted</span>
                      <span className="text-[11px] font-bold text-[#1b1d20]">أبرز محاور الحلقة المعتمدة للحلقة</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                      {chapters.map((chapter, i) => (
                        <div key={chapter.id} className="flex gap-2 items-start">
                          <span className="material-symbols-outlined text-[#a1824a] text-[14px] mt-0.5">chevron_left</span>
                          <div>
                            <p className="text-[12px] font-bold text-[#1b1d20] mb-1">{chapter.title}</p>
                            <p className="text-[10px] text-gray-400">المدة المقدرة: 20 دقيقة • {project._count.sources} وثيقة مسجلة</p>
                          </div>
                        </div>
                      ))}
                      {chapters.length === 0 && (
                        <div className="text-[11px] text-gray-400 py-2">لا توجد محاور معتمدة حتى الآن.</div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Link 
                        href={`/research/${project.id}/desk`} 
                        className="px-5 py-2.5 bg-[#1b1d20] hover:bg-black text-white text-[11px] font-medium rounded flex items-center gap-2 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                        الاستماع للحلقة كاملة
                      </Link>
                      <Link 
                        href={`/research/${project.id}/desk`} 
                        className="px-5 py-2.5 bg-white border border-[#e8e6df] hover:border-[#a1824a] text-[#1b1d20] text-[11px] font-medium rounded flex items-center gap-2 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">edit_document</span>
                        مذكرة التلقين والأسئلة
                      </Link>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button className="w-9 h-9 rounded border border-[#e8e6df] flex items-center justify-center text-gray-400 hover:text-[#1b1d20] transition-colors">
                        <span className="material-symbols-outlined text-[14px]">share</span>
                      </button>
                      <button className="w-9 h-9 rounded border border-[#e8e6df] flex items-center justify-center text-gray-400 hover:text-[#1b1d20] transition-colors">
                        <span className="material-symbols-outlined text-[14px]">download</span>
                      </button>
                    </div>
                  </div>
                  
                </div>
              </div>
            );
          })}

          {projects.length === 0 && (
            <div className="py-16 flex flex-col items-center justify-center border border-dashed border-[#e8e6df] rounded-xl bg-white text-center">
              <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">inbox</span>
              <h3 className="text-lg font-bold text-[#1b1d20] mb-1">لا توجد مشاريع حالياً</h3>
              <p className="text-sm text-gray-500">ابدأ بإنشاء مشروع ضيف جديد لجمع المصادر وإعداد خطة اللقاء.</p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
