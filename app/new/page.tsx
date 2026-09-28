"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewProject() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      guestName: formData.get("guestName") as string,
      role: formData.get("role") as string,
      organization: formData.get("organization") as string,
      country: formData.get("country") as string,
      url: formData.get("url") as string,
      twitterUrl: formData.get("twitterUrl") as string,
      linkedinUrl: formData.get("linkedinUrl") as string,
      phone: formData.get("phone") as string,
    };

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.error || "حدث خطأ غير متوقع");
      }

      router.push(`/research/${json.projectId}/desk`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  const inputClass = "w-full bg-white text-[#1b1d20] border border-[#e8e6df] p-3 rounded font-body-default focus:border-[#a1824a] focus:outline-none transition-colors";
  const labelClass = "block mb-2 font-bold text-xs text-gray-500";

  return (
    <main className="min-h-screen bg-[#f8f8f5] flex flex-col items-center py-16 px-4" dir="rtl">
      <div className="max-w-2xl w-full bg-white border border-[#e8e6df] rounded-lg p-8 shadow-sm relative overflow-hidden">
        
        {/* Subdued Glitch effect background */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-accent-acid/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex justify-between items-center mb-8 relative z-10">
          <div>
            <h1 className="text-2xl font-bold text-[#1b1d20] mb-2">إضافة ضيف جديد</h1>
            <p className="text-sm text-gray-500">أدخل المعلومات الأساسية للضيف لبدء بناء ملف الإعداد.</p>
          </div>
          <Link href="/" className="text-gray-400 hover:text-[#1b1d20] transition-colors">
            <span className="material-symbols-outlined">close</span>
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded mb-8 text-sm relative z-10 flex items-start gap-2">
            <span className="material-symbols-outlined text-xl shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className={labelClass}>اسم الضيف (مطلوب)</label>
              <input name="guestName" required className={inputClass} placeholder="مثال: نورة السالم" />
            </div>

            <div>
              <label className={labelClass}>المسمى الوظيفي/الصفة</label>
              <input name="role" className={inputClass} placeholder="مثال: مؤسس أو خبير اقتصادي" />
            </div>

            <div>
              <label className={labelClass}>الجهة/المنظمة</label>
              <input name="organization" className={inputClass} placeholder="اسم الشركة أو المؤسسة" />
            </div>

            <div>
              <label className={labelClass}>الدولة/المنطقة</label>
              <input name="country" className={inputClass} placeholder="مثال: السعودية" defaultValue="السعودية" />
            </div>

            <div>
              <label className={labelClass}>رابط اللينكد إن (إن وجد)</label>
              <input name="linkedinUrl" type="url" className={inputClass} placeholder="https://linkedin.com/in/..." dir="ltr" />
            </div>

            <div>
              <label className={labelClass}>رقم الجوال (للبحث العميق OSINT)</label>
              <input name="phone" type="tel" className={inputClass} placeholder="مثال: +9665..." dir="ltr" />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>روابط أو مواد مقترحة مبدئياً</label>
              <textarea name="url" className={`${inputClass} min-h-[100px] resize-y`} placeholder="مقابلة سابقة، بودكاست، أو مقالة يفضل البدء بها..."></textarea>
            </div>
          </div>

          <div className="pt-6 border-t border-[#e8e6df] flex justify-end gap-3">
            <Link href="/" className="px-6 py-3 rounded text-sm text-gray-500 hover:text-[#1b1d20] hover:bg-gray-100 transition-all duration-300 font-bold active:scale-95">
              إلغاء
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#1b1d20] text-white hover:bg-black hover:shadow-lg hover:-translate-y-1 active:scale-95 px-8 py-3 rounded text-sm font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-xl text-[#a1824a]">progress_activity</span>
                  جاري الإنشاء بالذكاء الاصطناعي...
                </>
              ) : (
                "ابدأ إعداد الحلقة"
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
