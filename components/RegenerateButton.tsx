"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RegenerateButton({ projectId, endpoint, label }: { projectId: string, endpoint?: string, label?: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegenerate = async () => {
    setIsLoading(true);
    try {
      const targetEndpoint = endpoint || `/api/projects/${projectId}/regenerate`;
      const res = await fetch(targetEndpoint, {
        method: "POST",
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
