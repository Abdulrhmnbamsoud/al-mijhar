"use client";

import { useState, useEffect } from "react";

export default function ResearchTimer({ projectId }: { projectId?: string }) {
  const [seconds, setSeconds] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Poll project status directly to bust cache
  useEffect(() => {
    if (!projectId) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.status && data.status !== "researching") {
            window.location.reload();
          }
        }
      } catch (e) {
        // ignore polling network errors
      }
    }, 2500);

    return () => clearInterval(pollInterval);
  }, [projectId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRetry = async () => {
    if (!projectId || isRetrying) return;
    setIsRetrying(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      if (res.ok) {
        setSeconds(0);
      } else {
        alert("تعذر إعادة التشغيل. يرجى تحديث الصفحة.");
      }
    } catch (e) {
      alert("حدث خطأ أثناء إعادة التشغيل.");
    } finally {
      setIsRetrying(false);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progress = Math.min((seconds / 90) * 100, 95);

  return (
    <div className="bg-white border border-[#e8e6df] rounded-xl p-8 shadow-sm text-center">
      <div className="flex flex-col items-center justify-center space-y-4">
        <span className="material-symbols-outlined text-4xl text-[#a1824a] animate-spin">hourglass_empty</span>
        <h3 className="text-xl font-bold text-[#1b1d20]">جاري البحث وبناء المحاور بالذكاء الاصطناعي...</h3>
        <p className="text-sm text-gray-500 max-w-md">
          يقوم النظام الآن بالبحث المعمق، قراءة المصادر، وتوليد 6 محاور و20-25 سؤالاً تفصيلياً لحلقة مدتها 90 دقيقة.
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

        {projectId && seconds >= 35 && (
          <div className="pt-4 border-t border-gray-100 mt-4 w-full max-w-md flex flex-col items-center gap-2">
            <span className="text-xs text-gray-400">إذا انقطع الاتصال أو علقت الصفحة أثناء إعادة البناء:</span>
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="px-4 py-2 bg-[#1b1d20] hover:bg-black text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">replay</span>
              {isRetrying ? "جاري إعادة البدء..." : "إعادة تشغيل التوليد فوراً"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
