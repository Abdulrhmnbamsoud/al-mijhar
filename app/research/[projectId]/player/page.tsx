import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function AudioPlayerPage({ params }: { params: Promise<{ projectId: string }> }) {
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
            include: { hostQuestions: true, moment: true }
          }
        }
      }
    }
  });

  if (!project) return <div>Project not found</div>;

  const activeAngle = project.episodeAngles[0];
  const chapters = activeAngle?.chapters || [];

  return (
    <div className="w-full font-sans" dir="rtl">
      
      {/* Top Player Section (Dark) */}
      <section className="bg-[#1b1d20] text-white p-8 lg:p-10 border-b border-[#282a2f]">
        <div className="max-w-6xl mx-auto space-y-6">
          
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold mb-3">
                <span className="bg-[#a1824a] text-white px-2 py-0.5 rounded text-[9px]">وثائقي صوتي • الحلقة #{project.id.slice(-3)}</span>
                <span>سجلت في استوديو المجهر</span>
                <span>•</span>
                <span>فصول مراجعة المونتاج الصوتي</span>
              </div>
              <h1 className="text-3xl font-bold text-white max-w-3xl leading-tight mb-4">
                {project.guest.name}: {activeAngle?.angle || "الحلقة قيد الإعداد"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-xs font-bold transition-colors">
                <span className="material-symbols-outlined text-[16px]">share</span>
                مشاركة توقيت المحور
              </button>
              <button className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                <span className="material-symbols-outlined text-[16px]">graphic_eq</span>
              </button>
              <button className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                <span className="material-symbols-outlined text-[16px]">download</span>
              </button>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#a1824a]/20 border border-[#a1824a]/30 flex items-center justify-center text-[#a1824a]">
                  <span className="material-symbols-outlined text-2xl">menu_book</span>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 font-bold mb-1">المحور النشط حالياً</div>
                  <div className="text-sm font-bold text-white">{chapters[1] ? `الفصل 2: ${chapters[1].title}` : (chapters[0] ? `الفصل 1: ${chapters[0].title}` : 'لا توجد فصول')}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-gray-400 mb-1">24:18 / 02:05:00 <span className="mx-2">|</span> متبقي 20:52 من المسار</div>
              </div>
            </div>

            {/* Custom Audio Timeline */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-[9px] text-gray-500 font-bold px-1">
                <span>بداية التسجيل [00:00]</span>
                <span>تخطيط فصول التحرير الصوتي ({chapters.length} محاور)</span>
                <span>الختام [02:05:00]</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full flex overflow-hidden">
                <div className="h-full bg-white/20 w-1/5 border-l border-[#1b1d20]"></div>
                <div className="h-full bg-[#a1824a] w-1/5 border-l border-[#1b1d20]"></div>
                <div className="h-full bg-gray-800 w-3/5"></div>
              </div>
              <div className="flex text-[9px] text-gray-400 font-bold justify-between px-2 pt-1">
                {chapters.map((ch, idx) => (
                  <div key={ch.id} className={`flex-1 text-center ${idx === 1 ? 'text-[#a1824a]' : ''}`}>
                    {idx + 1}. {ch.title.split(' ')[0]} {ch.title.split(' ')[1] || ''}
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <button className="bg-white/10 text-white text-[10px] font-bold px-3 py-1.5 rounded hover:bg-white/20 transition-colors">1.0x السرعة</button>
                <button className="text-gray-400 hover:text-white flex items-center gap-1 text-[10px] font-bold"><span className="material-symbols-outlined text-[14px]">timer</span> مؤقت النوم</button>
                <button className="text-gray-400 hover:text-white flex items-center gap-1 text-[10px] font-bold"><span className="material-symbols-outlined text-[14px]">volume_up</span> 100%</button>
              </div>

              <div className="flex items-center gap-6">
                <button className="text-white hover:text-[#a1824a] transition-colors"><span className="material-symbols-outlined text-xl">skip_previous</span></button>
                <button className="text-white hover:text-[#a1824a] transition-colors"><span className="material-symbols-outlined text-xl">fast_rewind</span></button>
                <button className="w-12 h-12 bg-[#a1824a] hover:bg-[#8b6e3e] text-white rounded-full flex items-center justify-center transition-colors shadow-lg">
                  <span className="material-symbols-outlined text-2xl ml-1">pause</span>
                </button>
                <button className="text-white hover:text-[#a1824a] transition-colors"><span className="material-symbols-outlined text-xl">fast_forward</span></button>
                <button className="text-white hover:text-[#a1824a] transition-colors"><span className="material-symbols-outlined text-xl">skip_next</span></button>
              </div>

              <div className="flex items-center gap-3 text-[10px] text-gray-400">
                <span className="material-symbols-outlined text-[14px]">format_list_bulleted</span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-1 bg-[#a1824a] rounded-full" style={{ height: `${[8, 16, 12, 6, 14][i]}px` }}></div>
                  ))}
                </div>
                موجة الاستوديو 2-CH
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area (Light) */}
      <section className="bg-[#f8f8f5] p-8 lg:p-10">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10">
          
          {/* Right Column - Content details */}
          <div className="flex-1 space-y-8">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-[#a1824a] text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#a1824a]"></span>
                  سؤال المحور الرئيسي الموجه للضيف
                </div>
                <div className="text-[10px] text-gray-400">سجل عند الدقيقة 21:05</div>
              </div>
              
              <h2 className="text-3xl font-bold text-[#1b1d20] leading-tight mb-6">
                «{chapters[0]?.hostQuestions[0]?.question || "الحلقة في طور التسجيل أو قيد الإعداد"}»
              </h2>

              <div className="bg-white border-r-2 border-[#a1824a] p-5 rounded-l-lg shadow-sm">
                <div className="text-[10px] text-[#a1824a] font-bold mb-2">أبرز نقطة في هذا الفصل (Highlight)</div>
                <p className="text-[#1b1d20] text-sm font-bold font-serif leading-relaxed mb-4">
                  «{chapters[0]?.moment?.description || project.notes || "لم يتم تحديد لحظة بارزة بعد."}»
                </p>
                <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold">
                  <span>{project.guest.name} • تسجيل הדقيقة 24:12</span>
                  <button className="flex items-center gap-1 text-[#a1824a] hover:text-[#8b6e3e]">
                    استمع لهذه اللحظة
                    <span className="material-symbols-outlined text-[14px]">play_circle</span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-[#1b1d20] text-sm font-bold mb-4">
                <span className="material-symbols-outlined text-[18px]">account_tree</span>
                نقاط وأحداث مسجلة في المحور
                <span className="text-[9px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded mr-2 font-normal">{chapters.length} محطات</span>
              </div>

              <div className="space-y-3">
                {chapters.map((ch: any, i: number) => (
                  <div key={ch.id} className="bg-white border border-[#e8e6df] rounded-lg p-4 flex gap-4 items-center">
                    <div className="w-8 h-8 rounded bg-[#f8f8f5] border border-[#e8e6df] flex items-center justify-center text-gray-500 font-bold text-xs">{i + 1}</div>
                    <div className="flex-1">
                      <h4 className="text-[#1b1d20] text-sm font-bold mb-1">{ch.moment?.title || ch.title}</h4>
                      <p className="text-gray-500 text-[11px] leading-relaxed">{ch.moment?.description || ch.hostQuestions[0]?.whyItMatters || "..."}</p>
                    </div>
                    <div className="text-gray-400 text-[10px] font-mono">{ch.estimatedMinutes}:00</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Document preview card */}
            <div className="bg-[#1b1d20] rounded-xl overflow-hidden flex flex-col md:flex-row mt-8">
              <div className="w-full md:w-1/3 bg-gray-800 relative min-h-[120px] overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1619983081563-430f63602796?auto=format&fit=crop&q=80&w=800"
                  alt="كاسيت"
                  className="absolute inset-0 w-full h-full object-cover filter grayscale opacity-70 mix-blend-screen"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/80 to-transparent"></div>
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[9px] px-2 py-0.5 rounded z-10">صورة توضيحية لملف الضيف</div>
              </div>
              <div className="flex-1 p-5 text-white flex justify-between items-center">
                <div>
                  <div className="text-[#a1824a] text-[9px] font-bold mb-1">بيانات مرجعية</div>
                  <h4 className="text-base font-bold mb-2">البحث الأولي لـ {project.guest.name}</h4>
                  <p className="text-[10px] text-gray-400 leading-relaxed max-w-sm">
                    {project.notes ? (project.notes.length > 150 ? project.notes.substring(0, 150) + '...' : project.notes) : "لا توجد تفاصيل مبدئية مسجلة"}
                  </p>
                </div>
                <div>
                  <button className="bg-[#a1824a] hover:bg-[#8b6e3e] text-white text-[10px] font-bold px-4 py-2 rounded transition-colors">
                    إضافة نقطة
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Left Column - Index */}
          <div className="w-full lg:w-80">
            <div className="flex items-center gap-2 text-[#1b1d20] text-lg font-bold mb-6">
              <span className="material-symbols-outlined text-[20px] text-[#a1824a]">format_list_numbered_rtl</span>
              فهرس فصول الحوار
              <span className="mr-auto text-[9px] text-gray-400 font-normal">إجمالي المدة: 02:05:00</span>
            </div>

            <div className="space-y-3">
              {chapters.map((ch, idx) => (
                <div key={ch.id} className={`p-4 rounded-lg border-l-4 ${idx === 1 ? 'bg-white shadow-sm border-[#1b1d20]' : 'bg-transparent border-transparent hover:bg-white/50'}`}>
                  <div className="flex justify-between items-center mb-1 text-[9px] font-bold">
                    <span className={idx === 1 ? 'text-[#a1824a]' : 'text-gray-400'}>
                      {idx === 1 ? '● الفصل الحالي • قيد الاستماع حالياً' : `الفصل ${idx + 1} • 15 دقيقة`}
                    </span>
                    <span className="text-gray-500 font-mono">18:20 - 00:00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <h3 className={`text-sm font-bold ${idx === 1 ? 'text-[#1b1d20]' : 'text-gray-600'}`}>{ch.title}</h3>
                    <button className={idx === 1 ? 'text-[#1b1d20]' : 'text-gray-400'}>
                      <span className="material-symbols-outlined text-[16px]">{idx === 1 ? 'volume_up' : 'play_arrow'}</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2 line-clamp-2">
                    {ch.hostQuestions[0]?.question || "تفاصيل المحور..."}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
