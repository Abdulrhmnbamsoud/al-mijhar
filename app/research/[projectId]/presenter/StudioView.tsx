"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { AutoRefresh } from '@/components/AutoRefresh';

export default function StudioView({ project, angle }: { project: any, angle: any }) {
  const [activeChapterId, setActiveChapterId] = useState(angle?.chapters?.[0]?.id);

  const activeChapter = angle?.chapters?.find((c: any) => c.id === activeChapterId) || angle?.chapters?.[0];
  let parsedScenarios: any[] = [];
  try {
    parsedScenarios = project.expectedScenarios ? JSON.parse(project.expectedScenarios) : [];
  } catch (e) { }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#f8f8f5] text-[#1b1d20] font-sans selection:bg-[#a1824a] selection:text-white" dir="rtl">
      <AutoRefresh intervalMs={3000} />
      {/* Top Header */}
      <header className="bg-[#1b1d20] text-white flex items-center justify-between px-6 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#a1824a] flex items-center justify-center font-bold">م</div>
            <span className="font-bold text-lg tracking-wider">بودكاست ضيف الأسبوع</span>
          </div>
          <div className="h-6 w-px bg-gray-700"></div>
          <span className="text-gray-300 text-sm">استوديو الحوار الوثائقي</span>
        </div>
        
        <div className="flex items-center gap-6 text-sm text-gray-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span>REC</span>
            <span className="font-mono">01:24:22</span>
          </div>
          <div className="h-4 w-px bg-gray-700"></div>
          <span>الحلقة 16</span>
          <div className="h-4 w-px bg-gray-700"></div>
          <span className="text-[#a1824a] font-medium">الضيف: {project.guest.name}</span>
        </div>
      </header>

      <div className="flex h-[calc(100vh-60px)] overflow-hidden">
        {/* Right Sidebar - Navigation */}
        <aside className="w-64 bg-white border-l border-gray-200 p-6 flex flex-col gap-8 shrink-0 overflow-y-auto">
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
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-[#1b1d20] rounded-lg transition-colors">
              <span className="material-symbols-outlined text-lg">alt_route</span>
              هندسة المسارات
            </a>
          </nav>
        </aside>

        {/* Chapters Map */}
        <div className="w-80 bg-[#f8f8f5] border-l border-gray-200 shrink-0 overflow-y-auto p-4 hide-scrollbar">
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
        <main className="flex-1 overflow-y-auto p-8 hide-scrollbar bg-[#fcfcfb]">
          {activeChapter && (
            <div className="max-w-3xl mx-auto space-y-6 pb-20">
              {/* Main Question Card */}
              <div className="bg-[#fcfbf9] rounded-2xl shadow-sm border border-[#e8e6df] overflow-hidden">
                <div className="bg-[#f2efe9] p-4 flex items-center justify-between border-b border-[#e8e6df]">
                  <div className="flex items-center gap-3">
                    <span className="bg-white text-[#a1824a] text-xs font-bold px-2 py-1 rounded shadow-sm border border-[#e8e6df]">المحور {activeChapter.orderIndex}</span>
                    <h2 className="font-bold text-[#1b1d20]">{activeChapter.title}</h2>
                  </div>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    وقت النقاش المقترح: ٢٠ دقيقة
                  </span>
                </div>

                <div className="p-8">
                  {activeChapter.hostQuestions?.map((hq: any, i: number) => (
                    <div key={hq.id} className={i > 0 ? "mt-8 pt-8 border-t border-[#e8e6df]" : ""}>
                      <div className="flex gap-2 text-[#a1824a] mb-4">
                        <span className="material-symbols-outlined text-sm">format_quote</span>
                        <span className="text-xs font-bold uppercase tracking-wider">سؤال حواري رئيسي</span>
                      </div>
                      
                      <h3 className="text-3xl leading-relaxed font-bold text-[#1b1d20] mb-6 font-serif">
                        «{hq.question}»
                      </h3>
                      
                      {hq.whyItMatters && (
                        <div className="bg-white rounded-lg p-4 mb-6 flex gap-3 text-sm text-gray-600 border border-gray-100 shadow-sm">
                          <span className="material-symbols-outlined text-[#a1824a]">track_changes</span>
                          <p className="whitespace-pre-wrap"><strong className="text-[#1b1d20] block mb-1">بطاقة السؤال:</strong> {hq.whyItMatters}</p>
                        </div>
                      )}

                      {hq.followUps?.length > 0 && (
                        <div className="space-y-3 mt-8">
                          <h4 className="text-sm font-bold text-[#1b1d20] mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#a1824a] text-lg">account_tree</span>
                            مسارات الاستطراد الذكية (على حسب رد الضيف):
                          </h4>
                          {hq.followUps.map((fu: any, idx: number) => (
                            <div key={fu.id} className="bg-white rounded-xl p-4 border-r-4 border-[#a1824a] shadow-sm hover:shadow-md transition-shadow cursor-pointer border-y border-l border-y-gray-100 border-l-gray-100">
                              <p className="font-bold text-[#1b1d20] mb-1 leading-relaxed text-lg">{fu.question}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Session Pace Indicator */}
              <div className="bg-[#f0ece1] rounded-xl p-4 flex items-center justify-between border border-[#e8e6df]">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#a1824a]">coffee</span>
                  <div>
                    <strong className="block text-[#1b1d20] text-sm">إيقاع الجلسة الآن</strong>
                    <span className="text-xs text-gray-600">حوار هادئ • الضيف يحكي بدون تكلف • صب فنجال قهوة</span>
                  </div>
                </div>
                <button className="bg-white text-gray-700 text-xs px-3 py-1.5 rounded border border-gray-200 shadow-sm font-medium">جلسة ممتازة</button>
              </div>

            </div>
          )}
        </main>

        {/* Left Sidebar - Host Assistance */}
        <aside className="w-80 bg-white border-r border-gray-200 shrink-0 overflow-y-auto p-6 hide-scrollbar flex flex-col gap-6">
          <div className="flex items-center gap-2 text-[#a1824a] mb-2">
            <span className="material-symbols-outlined">support_agent</span>
            <h2 className="font-bold text-lg">مساعدة المحاور اللحظية</h2>
          </div>

          <div className="bg-[#fcfbf9] rounded-xl p-5 border border-[#a1824a]/20 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-[#a1824a]">
              <span className="material-symbols-outlined text-sm">label_important</span>
              <h3 className="font-bold text-sm">بيانات الضيف السريعة</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.guest.role && <span className="bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded text-xs font-medium shadow-sm">{project.guest.role}</span>}
              {project.guest.organization && <span className="bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded text-xs font-medium shadow-sm">{project.guest.organization}</span>}
              {project.guest.country && <span className="bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded text-xs font-medium shadow-sm">{project.guest.country}</span>}
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-[#1b1d20]">
              <span className="material-symbols-outlined text-sm text-gray-400">edit_note</span>
              <h3 className="font-bold text-sm">ملاحظات فريق الإعداد</h3>
            </div>
            <textarea 
              className="w-full bg-[#f9f9f9] border border-gray-200 rounded-lg p-3 text-sm h-32 resize-none focus:ring-1 focus:ring-[#a1824a] outline-none placeholder-gray-400"
              placeholder="اكتب ملاحظاتك هنا أثناء سير الحلقة..."
            ></textarea>
            <p className="text-[10px] text-gray-400 mt-2 text-center">يتم إرفاق هذه الملاحظات في ملخص ما بعد الحلقة</p>
          </div>

          {parsedScenarios.length > 0 ? (
            <div className="bg-[#fdf8f6] rounded-xl p-5 border border-red-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1 h-full bg-red-400"></div>
              <div className="flex items-center gap-2 mb-3 text-red-700">
                <span className="material-symbols-outlined text-sm">notification_important</span>
                <h3 className="font-bold text-sm">تنبيه تحريري من الإعداد:</h3>
              </div>
              <p className="text-xs text-red-800/80 leading-relaxed font-bold mb-2">
                سيناريو متوقع: {parsedScenarios[0]?.name}
              </p>
              <p className="text-xs text-red-800/80 leading-relaxed">
                {parsedScenarios[0]?.description}
              </p>
            </div>
          ) : (
            <div className="bg-[#fdf8f6] rounded-xl p-5 border border-red-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1 h-full bg-red-400"></div>
              <div className="flex items-center gap-2 mb-3 text-red-700">
                <span className="material-symbols-outlined text-sm">notification_important</span>
                <h3 className="font-bold text-sm">لا توجد تنبيهات محددة</h3>
              </div>
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
