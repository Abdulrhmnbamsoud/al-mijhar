"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function StudioView({ project, angle }: { project: any, angle: any }) {
  const [activeChapterId, setActiveChapterId] = useState(angle?.chapters?.[0]?.id);
  const [showMobileNotes, setShowMobileNotes] = useState(false);

  const activeChapter = angle?.chapters?.find((c: any) => c.id === activeChapterId) || angle?.chapters?.[0];
  let parsedScenarios: any[] = [];
  try {
    parsedScenarios = project.expectedScenarios ? JSON.parse(project.expectedScenarios) : [];
  } catch (e) { }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#f8f8f5] text-[#1b1d20] font-sans selection:bg-[#a1824a] selection:text-white" dir="rtl">
      {/* Top Header */}
      <header className="bg-[#1b1d20] text-white flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 sticky top-0 z-50 flex-wrap gap-2">
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#a1824a] flex items-center justify-center font-bold text-xs sm:text-base">م</div>
            <span className="font-bold text-sm sm:text-lg tracking-wider">بودكاست ضيف الأسبوع</span>
          </div>
          <div className="h-4 sm:h-6 w-px bg-gray-700 hidden sm:block"></div>
          <span className="text-gray-300 text-xs sm:text-sm hidden sm:inline">استوديو الحوار الوثائقي</span>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-300">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-xs">LIVE</span>
          </div>
          <div className="h-3 sm:h-4 w-px bg-gray-700"></div>
          <span className="text-[#a1824a] font-medium truncate max-w-[140px] sm:max-w-none">{project.guest.name}</span>
          <div className="h-3 sm:h-4 w-px bg-gray-700"></div>
          <Link href={`/research/${project.id}/desk`} className="bg-gray-800 hover:bg-gray-700 text-white px-2.5 py-1 rounded text-xs flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            <span className="hidden sm:inline">المكتب</span>
          </Link>
        </div>
      </header>

      {/* Mobile Chapters Bar (Horizontal scroll on phone) */}
      <div className="md:hidden flex overflow-x-auto gap-2 p-2.5 bg-white border-b border-gray-200 hide-scrollbar shrink-0 z-20">
        {angle?.chapters?.map((chapter: any, index: number) => {
          const isActive = chapter.id === activeChapterId;
          return (
            <button
              key={chapter.id}
              onClick={() => setActiveChapterId(chapter.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 ${
                isActive 
                  ? 'bg-[#1b1d20] text-white shadow-sm' 
                  : 'bg-[#f8f8f5] text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span>المحور {index + 1}</span>
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#a1824a]"></span>}
            </button>
          );
        })}
      </div>

      <div className="flex flex-1 h-[calc(100vh-60px)] overflow-hidden">
        {/* Right Sidebar - Navigation (Desktop only) */}
        <aside className="w-64 bg-white border-l border-gray-200 p-6 flex-col gap-8 shrink-0 overflow-y-auto hidden xl:flex">
          <div>
            <h2 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">غرفة التحرير الصوتي</h2>
            <h1 className="text-xl font-bold text-[#1b1d20]">جلسة التسجيل الحالية</h1>
          </div>
          
          <nav className="flex flex-col gap-2">
            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-[#f8f8f5] text-[#a1824a] font-bold rounded-lg border border-[#a1824a]/20">
              <span className="material-symbols-outlined text-lg">mic</span>
              استوديو البث الحي
            </a>
            <Link href={`/research/${project.id}/desk`} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-[#1b1d20] rounded-lg transition-colors">
              <span className="material-symbols-outlined text-lg">folder_open</span>
              المصادر والوثائق
            </Link>
            <Link href={`/research/${project.id}/cards`} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-[#1b1d20] rounded-lg transition-colors">
              <span className="material-symbols-outlined text-lg">tablet_mac</span>
              كروت الآيباد
            </Link>
          </nav>
        </aside>

        {/* Chapters Map (Desktop & Tablet) */}
        <div className="w-72 lg:w-80 bg-[#f8f8f5] border-l border-gray-200 shrink-0 overflow-y-auto p-4 hide-scrollbar hidden md:block">
          <div className="flex items-center gap-2 mb-6 px-2 pt-4">
            <span className="material-symbols-outlined text-[#a1824a]">format_list_bulleted</span>
            <h2 className="font-bold text-lg">خريطة محاور السوالف</h2>
          </div>

          <div className="space-y-4">
            {angle?.chapters?.map((chapter: any, index: number) => {
              const isActive = chapter.id === activeChapterId;
              return (
                <button 
                  key={chapter.id}
                  onClick={() => setActiveChapterId(chapter.id)}
                  className={`w-full text-right p-4 rounded-xl border transition-all duration-200 ${
                    isActive 
                    ? 'bg-white border-[#a1824a] shadow-sm ring-1 ring-[#a1824a]/20' 
                    : 'bg-white/50 border-gray-200 hover:bg-white hover:border-gray-300 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">المحور {index + 1}</span>
                    {isActive && <span className="w-2 h-2 rounded-full bg-[#a1824a]"></span>}
                  </div>
                  <h3 className={`font-bold mb-2 ${isActive ? 'text-[#1b1d20]' : 'text-gray-600'}`}>{chapter.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {chapter.hostQuestions?.[0]?.question || ''}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content (Active Chapter) */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 hide-scrollbar bg-[#fcfcfb] w-full">
          {activeChapter && (
            <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 pb-20">
              
              {/* Mobile Chapter Banner Header */}
              <div className="bg-[#fcfbf9] rounded-xl sm:rounded-2xl shadow-sm border border-[#e8e6df] overflow-hidden">
                <div className="bg-[#f2efe9] p-3 sm:p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-[#e8e6df]">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="bg-white text-[#a1824a] text-xs font-bold px-2 py-1 rounded shadow-sm border border-[#e8e6df]">المحور {activeChapter.orderIndex}</span>
                    <h2 className="font-bold text-sm sm:text-base text-[#1b1d20]">{activeChapter.title}</h2>
                  </div>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    النقاش المقترح: {activeChapter.estimatedMinutes || 15} دقيقة
                  </span>
                </div>

                <div className="p-4 sm:p-8">
                  {activeChapter.hostQuestions?.map((hq: any, i: number) => (
                    <div key={hq.id} className={i > 0 ? "mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-[#e8e6df]" : ""}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5 text-[#a1824a]">
                          <span className="material-symbols-outlined text-sm">format_quote</span>
                          <span className="text-xs font-bold uppercase tracking-wider">سؤال {i + 1}</span>
                        </div>
                        {hq.type === 'sensitive' && (
                          <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">نقطة حساسة</span>
                        )}
                        {hq.type === 'viral' && (
                          <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold">فرصة انتشار</span>
                        )}
                      </div>
                      
                      <h3 className="text-xl sm:text-2xl lg:text-3xl leading-relaxed font-bold text-[#1b1d20] mb-4 sm:mb-6 font-serif">
                        «{hq.question}»
                      </h3>
                      
                      {hq.whyItMatters && (
                        <div className="bg-white rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 border border-gray-100 shadow-sm">
                          <span className="material-symbols-outlined text-[#a1824a] shrink-0 text-lg">track_changes</span>
                          <p className="whitespace-pre-wrap leading-relaxed"><strong className="text-[#1b1d20] block mb-0.5">بطاقة التوجيه للمذيع:</strong> {hq.whyItMatters}</p>
                        </div>
                      )}

                      {hq.followUps?.length > 0 && (
                        <div className="space-y-2.5 sm:space-y-3 mt-4 sm:mt-8">
                          <h4 className="text-xs sm:text-sm font-bold text-[#1b1d20] mb-2 sm:mb-3 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[#a1824a] text-base sm:text-lg">account_tree</span>
                            مسارات الاستطراد الذكية (على حسب رد الضيف):
                          </h4>
                          {hq.followUps.map((fu: any) => (
                            <div key={fu.id} className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border-r-4 border-[#a1824a] shadow-sm hover:shadow-md transition-shadow border-y border-l border-gray-100">
                              <p className="font-bold text-[#1b1d20] text-sm sm:text-base leading-relaxed">{fu.question}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Session Pace Indicator */}
              <div className="bg-[#f0ece1] rounded-xl p-3.5 sm:p-4 flex items-center justify-between border border-[#e8e6df]">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <span className="material-symbols-outlined text-[#a1824a] text-xl">coffee</span>
                  <div>
                    <strong className="block text-[#1b1d20] text-xs sm:text-sm">إيقاع الجلسة الآن</strong>
                    <span className="text-[10px] sm:text-xs text-gray-600">حوار متصل • الضيف يحكي بدون تكلف • صب فنجال قهوة</span>
                  </div>
                </div>
                <button className="bg-white text-gray-700 text-[10px] sm:text-xs px-2.5 py-1 sm:px-3 sm:py-1.5 rounded border border-gray-200 shadow-sm font-medium">جلسة ممتازة</button>
              </div>

            </div>
          )}
        </main>

        {/* Left Sidebar - Host Assistance (Desktop only) */}
        <aside className="w-72 lg:w-80 bg-white border-r border-gray-200 shrink-0 overflow-y-auto p-4 sm:p-6 hide-scrollbar flex-col gap-6 hidden 2xl:flex">
          <div className="flex items-center gap-2 text-[#a1824a] mb-2">
            <span className="material-symbols-outlined">support_agent</span>
            <h2 className="font-bold text-lg">مساعدة المحاور اللحظية</h2>
          </div>

          <div className="bg-[#fcfbf9] rounded-xl p-4 sm:p-5 border border-[#a1824a]/20 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-[#a1824a]">
              <span className="material-symbols-outlined text-sm">label_important</span>
              <h3 className="font-bold text-sm">بيانات الضيف السريعة</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.guest.role && <span className="bg-white border border-gray-200 text-gray-700 px-2.5 py-1 rounded text-xs font-medium shadow-sm">{project.guest.role}</span>}
              {project.guest.organization && <span className="bg-white border border-gray-200 text-gray-700 px-2.5 py-1 rounded text-xs font-medium shadow-sm">{project.guest.organization}</span>}
              {project.guest.country && <span className="bg-white border border-gray-200 text-gray-700 px-2.5 py-1 rounded text-xs font-medium shadow-sm">{project.guest.country}</span>}
            </div>
          </div>

          {parsedScenarios.length > 0 && (
            <div className="bg-[#fdf8f6] rounded-xl p-4 border border-red-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1 h-full bg-red-400"></div>
              <div className="flex items-center gap-2 mb-2 text-red-700">
                <span className="material-symbols-outlined text-sm">notification_important</span>
                <h3 className="font-bold text-xs">تنبيه تحريري من الإعداد:</h3>
              </div>
              <p className="text-xs text-red-800/80 leading-relaxed font-bold mb-1">
                {parsedScenarios[0]?.name}
              </p>
              <p className="text-[11px] text-red-800/70 leading-relaxed">
                {parsedScenarios[0]?.description}
              </p>
            </div>
          )}
        </aside>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
