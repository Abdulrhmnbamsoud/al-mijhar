"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RegenerateButton({ projectId, endpoint, label }: { projectId: string, endpoint?: string, label?: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
        alert("فشلت العملية");
      }
    } catch (e) {
      console.error(e);
      alert("حدث خطأ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
  );
}
