"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RegenerateButton({ projectId }: { projectId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegenerate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/regenerate`, {
        method: "POST",
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("فشلت عملية إعادة التوليد");
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
      className="px-space-md py-2 rounded bg-surface-elevated border border-border-subtle font-label-md text-text-ivory hover:border-accent-acid transition-colors disabled:opacity-50 flex items-center gap-2"
    >
      {isLoading ? (
        <>
          <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
          جاري التوليد...
        </>
      ) : (
        "إعادة توليد المحاور"
      )}
    </button>
  );
}
