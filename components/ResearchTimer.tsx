"use client";

import { useState, useEffect } from "react";

export default function ResearchTimer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progress = Math.min((seconds / 180) * 100, 99); // max 3 minutes for progress bar

  return (
    <div className="bg-white border border-[#e8e6df] rounded-xl p-8 shadow-sm text-center">
      <div className="flex flex-col items-center justify-center space-y-4">
        <span className="material-symbols-outlined text-4xl text-[#a1824a] animate-spin">hourglass_empty</span>
        <h3 className="text-xl font-bold text-[#1b1d20]">جاري البحث وبناء المحاور بالذكاء الاصطناعي...</h3>
        <p className="text-sm text-gray-500 max-w-md">
          يقوم النظام الآن بالبحث المعمق، قراءة المصادر، وتوليد 7 محاور وأسئلة تفصيلية لحلقة مدتها 90 دقيقة. 
          العملية قد تستغرق ما بين دقيقتين إلى 3 دقائق.
        </p>
        
        <div className="w-full max-w-md mt-6">
          <div className="flex justify-between items-end mb-2">
             <span className="text-xs font-bold text-[#a1824a]">الوقت المستغرق</span>
             <span className="text-xl font-mono font-bold text-[#1b1d20]">{formatTime(seconds)}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-[#a1824a] h-2 rounded-full transition-all duration-1000 ease-linear" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
