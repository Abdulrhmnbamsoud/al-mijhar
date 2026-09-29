"use client";

import { useState } from "react";

export default function ChapterCard({ chapter, index }: { chapter: any, index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white border border-[#e8e6df] rounded-xl p-5 shadow-sm relative hover:shadow-lg hover:-translate-y-1 hover:border-[#a1824a] transition-all duration-300">
      
      {/* Chapter Number Badge */}
      <div className="absolute -right-4 top-5 w-8 h-8 rounded-full bg-[#1b1d20] text-white flex items-center justify-center text-xs font-bold shadow-md">
        {String(index + 1).padStart(2, '0')}
      </div>

      <div className="flex justify-between items-start mb-4 pr-6">
        <div>
          <div className="text-[10px] text-gray-500 font-bold mb-1">المحور {index + 1} • {chapter.title}</div>
          <h3 className="text-lg font-bold text-[#1b1d20]">
            {chapter.hostQuestions[0]?.question || "جاري تجهيز السؤال..."}
          </h3>
        </div>
        <div className="flex items-center gap-2 bg-[#f8f8f5] border border-[#e8e6df] px-2 py-1 rounded text-[10px] text-gray-500 font-medium shrink-0">
          <span className="material-symbols-outlined text-[14px]">schedule</span>
          {chapter.estimatedMinutes || 15} دقيقة
        </div>
      </div>

      {chapter.hostQuestions[0]?.whyItMatters && (
        <div className="bg-[#f8f8f5] border-r-2 border-[#a1824a] p-3 rounded text-[11px] text-[#1b1d20] mb-4">
          <span className="text-[#a1824a] font-bold block mb-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">campaign</span>
            تلميح للمذيع:
          </span>
          {chapter.hostQuestions[0].whyItMatters}
        </div>
      )}

      {/* Expanded Control Bank */}
      {isOpen && chapter.hostQuestions.length > 0 && (
        <div className="mt-6 mb-4 pt-4 border-t border-dashed border-[#e8e6df] space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[#a1824a] text-lg">account_tree</span>
            <h4 className="font-bold text-sm text-[#1b1d20]">بنك التحكم: الأسئلة والتفرعات</h4>
          </div>
          
          {chapter.hostQuestions.map((hq: any, i: number) => (
            <div key={hq.id} className="bg-[#f8f8f5] rounded-lg p-4 border border-[#e8e6df]">
              <div className="flex items-start gap-3">
                <div className="bg-[#1b1d20] text-white w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  س{i + 1}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-[#1b1d20] mb-2">{hq.question}</p>
                  {hq.whyItMatters && (
                    <p className="text-[10px] text-gray-500 mb-3 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">info</span>
                      الهدف: {hq.whyItMatters}
                    </p>
                  )}
                  
                  {hq.followUps && hq.followUps.length > 0 && (
                    <div className="space-y-2 mt-3 pl-4 border-r-2 border-gray-200">
                      {hq.followUps.map((fu: any, j: number) => (
                        <div key={fu.id} className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-[12px] text-gray-400 mt-0.5">subdirectory_arrow_left</span>
                          <p className="text-xs text-gray-700">{fu.question}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-[#e8e6df] text-[10px] text-gray-500 font-medium mt-4">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-[#a1824a]">article</span> 
            {chapter.hostQuestions.length} أسئلة وتفرعات
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-red-500">warning</span> 
            نقطة حساسة في الطرح
          </span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-[#a1824a] hover:text-[#8b6e3e] flex items-center gap-1 transition-colors font-bold outline-none"
        >
          {isOpen ? "إخفاء بنك التحكم" : "عرض بنك التحكم لهذا المحور"}
          <span className={`material-symbols-outlined text-[14px] transition-transform duration-300 ${isOpen ? 'rotate-90' : 'rotate-180'}`}>
            arrow_drop_up
          </span>
        </button>
      </div>
    </div>
  );
}
