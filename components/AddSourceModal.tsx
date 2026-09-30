"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddSourceModal({ projectId }: { projectId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      type: formData.get("type"),
      text: formData.get("text")
    };

    try {
      const res = await fetch(`/api/projects/${projectId}/sources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setIsOpen(false);
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || "فشل الإرسال");
      }
    } catch (e) {
      alert("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full py-2 bg-white border border-[#e8e6df] hover:border-[#a1824a] hover:text-[#a1824a] text-[#1b1d20] rounded text-[10px] font-bold flex items-center justify-center gap-2 transition-colors mt-2"
      >
        <span className="material-symbols-outlined text-[14px]">add</span>
        إرفاق وثيقة أو تسجيل جديد
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#e8e6df]">
        <div className="bg-[#1b1d20] p-4 flex justify-between items-center text-white">
          <h3 className="font-bold">إرفاق مصدر جديد يدوياً</h3>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 mb-1">عنوان المصدر</label>
            <input required name="title" className="w-full bg-white text-[#1b1d20] border border-[#e8e6df] p-2 rounded focus:border-[#a1824a] outline-none text-xs" placeholder="مثال: مقال صحيفة عكاظ عن الضيف" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 mb-1">نوع المصدر</label>
            <select name="type" className="w-full bg-white text-[#1b1d20] border border-[#e8e6df] p-2 rounded focus:border-[#a1824a] outline-none text-xs">
              <option value="article">مقال / خبر</option>
              <option value="video">تفريغ يوتيوب / بودكاست</option>
              <option value="book">مقتطف من كتاب</option>
              <option value="tweet">تغريدة / منشور</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 mb-1">نص المصدر أو تفريغ التسجيل (مهم للذكاء الاصطناعي)</label>
            <textarea required name="text" className="w-full h-32 bg-white text-[#1b1d20] border border-[#e8e6df] p-2 rounded focus:border-[#a1824a] outline-none text-xs resize-y" placeholder="انسخ والصق النص هنا..."></textarea>
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-[#1b1d20]">إلغاء</button>
            <button disabled={loading} type="submit" className="px-6 py-2 text-xs font-bold bg-[#a1824a] hover:bg-[#8b6e3e] text-white rounded transition-colors disabled:opacity-50">
              {loading ? "جاري الحفظ..." : "حفظ المصدر"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
