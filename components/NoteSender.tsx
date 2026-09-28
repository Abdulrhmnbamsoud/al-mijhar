"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NoteSender({ projectId }: { projectId: string }) {
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSend = async () => {
    if (!note.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/note`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note })
      });
      if (res.ok) {
        setNote("");
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <input 
        type="text" 
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
        placeholder="اكتب توجيه عاجل للمذيع..." 
        className="w-full bg-[#282a2f] border border-[#282a2f] focus:border-[#a1824a] rounded text-white text-[10px] px-3 py-2 pr-9 outline-none transition-colors"
      />
      <button 
        onClick={handleSend}
        disabled={isLoading || !note.trim()}
        className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-[#a1824a] text-white rounded cursor-pointer hover:bg-[#8b6e3e] disabled:opacity-50 transition-all active:scale-95"
      >
        {isLoading ? (
          <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
        ) : (
          <span className="material-symbols-outlined text-[14px]">send</span>
        )}
      </button>
    </div>
  );
}
