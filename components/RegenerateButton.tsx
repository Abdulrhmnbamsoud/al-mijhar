"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function RegenerateButton({ projectId, endpoint, label }: { projectId: string, endpoint?: string, label?: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingTime(prev => prev + 1);
      }, 1000);
    } else {
      setLoadingTime(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleRegenerate = async () => {
    const instructions = window.prompt("أدخل التوجيه للذكاء الاصطناعي (مثال: أريد محاور تصادمية، ركز على الجانب الاقتصادي، إلخ). اترك الحقل فارغاً للنمط الافتراضي:");
    if (instructions === null) return; // User cancelled

    setIsLoading(true);
    try {
      const targetEndpoint = endpoint || `/api/projects/${projectId}/regenerate`;
      const res = await fetch(targetEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructions })
      });
      if (res.ok) {
        router.refresh();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`فشلت العملية: ${errorData.error || "تأكد من صحة المفاتيح (API Keys) والاتصال"}`);
      }
    } catch (e) {
      console.error(e);
      alert("حدث خطأ في الاتصال");
    } finally {
      setIsLoading(false);
    }
  };

  const loadingMessages = [
    "جاري قراءة وتصنيف مصادر الضيف...",
    "يتم الآن تحليل المقابلات والتصريحات السابقة...",
    "يقوم الذكاء الاصطناعي ببناء الهيكل التحريري...",
    "جاري استخراج الأسئلة الاستقصائية العميقة...",
    "صياغة المقدمة التعريفية للمذيع...",
    "اللمسات الأخيرة، قاربت العملية على الانتهاء..."
  ];

  const currentMessageIndex = Math.min(
    Math.floor(loadingTime / 10), 
    loadingMessages.length - 1
  );

  return (
    <>
      <button 
        onClick={handleRegenerate}
        disabled={isLoading}
        className="px-6 py-2 rounded bg-white border border-[#e8e6df] text-[#1b1d20] font-bold text-sm hover:border-[#a1824a] hover:text-[#a1824a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
      >
        {isLoading ? (
          <>
            <span className="material-symbols-outlined animate-spin text-sm text-[#a1824a]">progress_activity</span>
            جاري المعالجة...
          </>
        ) : (
          label || "إعادة توليد المحاور"
        )}
      </button>

      {isLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" dir="rtl">
          <div className="bg-[#1b1d20] border border-[#a1824a]/30 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden">
            {/* Glowing effect behind */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#a1824a]/20 blur-[50px] rounded-full"></div>
            
            <div className="w-16 h-16 rounded-full bg-[#a1824a]/10 border border-[#a1824a]/50 flex items-center justify-center mx-auto mb-6 relative z-10 shadow-[0_0_15px_rgba(161,130,74,0.3)]">
              <span className="material-symbols-outlined animate-spin text-[#a1824a] text-3xl">auto_awesome</span>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2 relative z-10">صناعة الحلقة قيد التقدم...</h3>
            
            <p className="text-gray-400 text-sm mb-8 h-8 flex items-center justify-center relative z-10 transition-all duration-500">
              {loadingMessages[currentMessageIndex]}
            </p>

            <div className="w-full bg-gray-800 rounded-full h-1.5 mb-3 overflow-hidden relative z-10">
              <div 
                className="bg-[#a1824a] h-full rounded-full transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(161,130,74,0.8)]" 
                style={{ width: `${Math.min((loadingTime / 45) * 100, 97)}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center text-xs text-gray-500 relative z-10">
              <span>{Math.min(Math.floor((loadingTime / 45) * 100), 97)}%</span>
              <span className="font-mono" dir="ltr">
                {String(Math.floor(loadingTime / 60)).padStart(2, '0')}:{String(loadingTime % 60).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
