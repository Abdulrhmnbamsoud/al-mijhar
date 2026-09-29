import prisma from "@/lib/prisma";
import Link from "next/link";
import ClientButton from "@/components/ClientButton";
import ClientImage from "@/components/ClientImage";
import { AutoRefresh } from "@/components/AutoRefresh";
import { RegenerateButton } from "@/components/RegenerateButton";
import ChapterCard from "@/components/ChapterCard";
import NoteSender from "@/components/NoteSender";

export default async function EpisodeDeskPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await prisma.episodeProject.findUnique({
    where: { id: projectId },
    include: {
      sources: {
        orderBy: { createdAt: 'desc' }
      },
      guest: {
        include: { careerHistory: true }
      },
      episodeAngles: {
        where: { isActive: true },
        include: {
          chapters: {
            orderBy: { orderIndex: 'asc' },
            include: {
              moment: {
                include: {
                  excerpts: {
                    include: { excerpt: { include: { source: true } } }
                  }
                }
              },
              hostQuestions: {
                orderBy: { orderIndex: 'asc' },
                include: { followUps: { orderBy: { orderIndex: 'asc' } }, excerpt: { include: { source: true } } }
              }
            }
          }
        }
      }
    }
  });

  if (!project) return <div>Project not found</div>;

  const activeAngle = project.episodeAngles[0];
  let parsedScenarios: { name: string, description: string }[] = [];
  if (project.expectedScenarios) {
    try {
      parsedScenarios = JSON.parse(project.expectedScenarios);
    } catch(e) {}
  }

  // Calculate some stats
  const totalChapters = activeAngle?.chapters?.length || 0;
  const totalQuestions = activeAngle?.chapters?.reduce((acc, ch) => acc + ch.hostQuestions.length, 0) || 0;

  return (
    <div className="w-full bg-[#f8f8f5] font-sans" dir="rtl">
      <AutoRefresh intervalMs={5000} />
      
      {/* Top Banner (Dark) */}
      <section className="bg-[#1b1d20] text-white border-b border-[#282a2f] p-8 lg:p-10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10 justify-between items-start">
          
          {/* Right Side - Info */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3 text-xs font-medium text-gray-400">
              <span className="bg-[#282a2f] text-white px-2 py-1 rounded text-[10px]">حلقة رقم {project.id.slice(-3)}</span>
              <span>• طولة الإعداد المبني للمقترح والقصة</span>
              <span>• <span className="material-symbols-outlined text-[14px] align-middle">schedule</span> تقدير التسجيل: 58 دقيقة</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white mb-2">{project.guest.name}</h1>
            <p className="text-[#a1824a] text-sm lg:text-base font-bold mb-6">
              {project.guest.role} {project.guest.organization && `في ${project.guest.organization}`}
            </p>

            <div className="bg-[#282a2f]/50 border border-[#282a2f] rounded-lg p-5">
              <div className="flex items-center gap-2 text-[#a1824a] text-xs font-bold mb-2">
                <span className="material-symbols-outlined text-[16px]">psychology_alt</span>
                الزاوية التحريرية المعتمدة
              </div>
              <p className="text-gray-300 text-sm leading-relaxed font-serif">
                «{activeAngle?.angle || "جاري صياغة الزاوية التحريرية بناءً على المعطيات..."}»
              </p>
            </div>
          </div>

          {/* Left Side - Tools & Stats */}
          <div className="w-full lg:w-80 flex flex-col gap-4">
            
            {/* Call Card */}
            <div className="bg-[#1b1d20] border border-[#282a2f] rounded-lg overflow-hidden flex flex-col">
              <div className="p-4 flex gap-4 items-center border-b border-[#282a2f]">
                <div className="w-12 h-12 bg-gray-700 rounded overflow-hidden flex-shrink-0 relative">
                   <ClientImage
                     src={
                       project.guest.linkedinUrl && project.guest.linkedinUrl.match(/linkedin\.com\/in\/([^\/\?]+)/)
                         ? `https://unavatar.io/linkedin/${project.guest.linkedinUrl.match(/linkedin\.com\/in\/([^\/\?]+)/)?.[1]}`
                         : `https://ui-avatars.com/api/?name=${encodeURIComponent(project.guest.name)}&background=374151&color=ffffff`
                     }
                     fallbackSrc={`https://ui-avatars.com/api/?name=${encodeURIComponent(project.guest.name)}&background=374151&color=ffffff`}
                     alt={project.guest.name}
                     className="absolute inset-0 w-full h-full object-cover filter grayscale opacity-70"
                   />
                   <div className="absolute inset-0 flex items-center justify-center">
                     <span className="material-symbols-outlined text-white drop-shadow-md">videocam</span>
                   </div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 font-bold mb-1">المكالمة التمهيدية</div>
                  <div className="text-xs font-bold text-white mb-1">{project.guest.name.split(' ')[0]} • مكالمة زوم (42 دقيقة)</div>
                  <div className="text-[10px] text-[#10B981]">مكتملة وموثقة بالكامل</div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#282a2f]/50 border border-[#282a2f] rounded-lg p-3 text-center flex flex-col justify-center">
                <span className="text-xl font-bold text-white">{totalChapters}</span>
                <span className="text-[9px] text-gray-400 mt-1">محاور مسارات</span>
              </div>
              <div className="bg-[#282a2f]/50 border border-[#282a2f] rounded-lg p-3 text-center flex flex-col justify-center">
                <span className="text-xl font-bold text-[#a1824a]">12</span>
                <span className="text-[9px] text-gray-400 mt-1">وثيقة ومصادر</span>
              </div>
              <div className="bg-[#282a2f]/50 border border-[#282a2f] rounded-lg p-3 text-center flex flex-col justify-center">
                <span className="text-xl font-bold text-white">{totalQuestions}</span>
                <span className="text-[9px] text-gray-400 mt-1">أسئلة استرجاعية</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Link href={`/research/${project.id}/studio`} className="flex-1 bg-[#a1824a] hover:bg-[#8b6e3e] text-white text-xs font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <span className="material-symbols-outlined text-sm">mic</span>
                جاهز للدخول للمايك
              </Link>
              <ClientButton actionType="print" className="w-12 bg-[#282a2f] hover:bg-gray-700 text-white rounded-lg flex items-center justify-center transition-colors" title="طباعة">
                <span className="material-symbols-outlined text-sm">print</span>
              </ClientButton>
              <a href={`/research/${project.id}/studio`} target="_blank" className="w-12 bg-[#282a2f] hover:bg-gray-700 text-white rounded-lg flex items-center justify-center transition-colors" title="بث لاستوديو العزل (فتح نافذة جديدة)">
                <span className="material-symbols-outlined text-sm">cast</span>
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto p-6 lg:p-10 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Right Column (Chapters Flow) */}
        <div className="flex-1 w-full">
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="text-[10px] text-gray-500 font-bold mb-1 block">هيكل الحوار التفصيلي</span>
              <h2 className="text-2xl font-bold text-[#1b1d20]">تسلسل المحاور الخمسة وسوالف الحلقة</h2>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-400 bg-white border border-[#e8e6df] px-3 py-1.5 rounded-full shadow-sm">
              <span className="material-symbols-outlined text-[14px]">drag_indicator</span>
              اسحب المحور لإعادة ترتيب تدفق الحوار
            </div>
          </div>

          <div className="space-y-4">
            {activeAngle?.chapters.map((chapter, index) => (
              <ChapterCard key={chapter.id} chapter={chapter} index={index} />
            ))}

            {(!activeAngle?.chapters || activeAngle.chapters.length === 0) && (
              <div className="text-center py-10 bg-white rounded-xl border border-dashed border-[#e8e6df]">
                <RegenerateButton projectId={project.id} label="توليد محاور الحلقة بالذكاء الاصطناعي" />
              </div>
            )}
          </div>
        </div>

        {/* Left Column (Sidebar Tools) */}
        <div className="w-full lg:w-80 space-y-6">
          
          {/* Evidences Box */}
          <div className="bg-[#fcfbf9] border border-[#a1824a]/30 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-white border-b border-[#a1824a]/30 p-4 flex justify-between items-center">
              <div className="flex items-center gap-2 text-[#a1824a] font-bold text-sm">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                أدلة ومصادر البحث
              </div>
              <span className="text-[9px] bg-[#f8f8f5] text-[#a1824a] px-2 py-0.5 rounded border border-[#a1824a]/20">المشروع كاملاً</span>
            </div>
            
            <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
              <p className="text-[10px] text-gray-500 leading-relaxed">
                الأدلة والمصادر التي تم جمعها بواسطة محرك البحث الذكي:
              </p>

              {project.sources && project.sources.length > 0 ? (
                project.sources.map((source: any) => (
                  <div key={source.id} className="bg-white border border-[#e8e6df] rounded p-3 text-[10px]">
                    <div className="flex justify-between items-center text-gray-400 font-bold mb-2 pb-2 border-b border-[#e8e6df]">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px] text-[#1b1d20]">description</span> 
                        {source.publisher || 'مصدر بحث'}
                      </span>
                      <span>{source.publishedAt ? new Date(source.publishedAt).getFullYear() : ''}</span>
                    </div>
                    <p className="text-[#1b1d20] leading-relaxed mb-2 font-serif font-bold line-clamp-3">
                      «{source.title}»
                    </p>
                    <div className="flex justify-between items-center text-gray-400 mt-2 pt-2 border-t border-dashed border-gray-100">
                      {source.originalUrl ? (
                        <a href={source.originalUrl} target="_blank" rel="noopener noreferrer" className="text-[#a1824a] hover:underline flex items-center gap-1 text-[9px]">
                          <span className="material-symbols-outlined text-[11px]">link</span>
                          زيارة المصدر
                        </a>
                      ) : (
                        <span></span>
                      )}
                      <span className="text-[#10B981] bg-green-50 px-1.5 py-0.5 rounded">{source.type}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-6 text-xs border border-dashed border-[#e8e6df] rounded bg-white">
                  لا توجد مصادر مدخلة حالياً
                </div>
              )}

              <ClientButton actionType="alert" alertMessage="جاري فتح نافذة رفع الملفات..." className="w-full py-2 bg-white border border-[#e8e6df] hover:border-[#a1824a] hover:text-[#a1824a] text-[#1b1d20] rounded text-[10px] font-bold flex items-center justify-center gap-2 transition-colors mt-2">
                <span className="material-symbols-outlined text-[14px]">add</span>
                إرفاق وثيقة أو تسجيل جديد
              </ClientButton>
            </div>
          </div>

          {/* Alternative Questions Box */}
          <div className="bg-[#1b1d20] rounded-xl overflow-hidden shadow-md">
            <div className="p-4 border-b border-[#282a2f] flex justify-between items-center">
              <div className="flex items-center gap-2 text-[#a1824a] font-bold text-sm">
                <span className="material-symbols-outlined text-[18px]">alt_route</span>
                بنك الأسئلة البديلة للمقدم
              </div>
              <ClientButton actionType="alert" alertMessage="طلب خطة طوارئ جديدة بالذكاء الاصطناعي..." className="text-gray-400 hover:text-white bg-[#282a2f] text-[9px] px-2 py-1 rounded transition-colors">تطوير الطوارئ</ClientButton>
            </div>
            
            <div className="p-4 space-y-3">
              <p className="text-[10px] text-gray-400 leading-relaxed mb-4">
                إذا أفلتت نورة بسؤال متشعب، أو تشعبت بمبالغة خارج السياق، استخدم هذه الجسور للعودة:
              </p>

              {parsedScenarios.map((scenario, i) => (
                <div key={i} className="bg-[#282a2f] rounded p-3 relative">
                  <ClientButton actionType="copy" copyText={scenario.description} className="absolute top-3 left-3 text-[14px] text-gray-500 cursor-pointer hover:text-white bg-transparent border-none p-0 flex items-center justify-center" title="نسخ">
                    <span className="material-symbols-outlined">content_copy</span>
                  </ClientButton>
                  <div className="text-[9px] text-[#a1824a] font-bold mb-1">{scenario.name}</div>
                  <p className="text-[11px] text-white font-bold leading-relaxed pr-6">
                    «{scenario.description}»
                  </p>
                </div>
              ))}
              
              {parsedScenarios.length === 0 && (
                <div className="bg-[#282a2f] rounded p-3 text-[11px] text-white text-center">
                  لا توجد أسئلة بديلة مولدة بعد.
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-[#282a2f]">
                <div className="text-[9px] text-gray-500 mb-2">ملاحظة فورية لتعليق المذيع أثناء التصوير:</div>
                <NoteSender projectId={project.id} />
              </div>
            </div>
          </div>
        </div>
        
      </section>
    </div>
  );
}

