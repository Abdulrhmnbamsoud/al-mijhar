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

  const inputClass = "w-full bg-surface-elevated text-text-ivory border border-border-subtle p-3 rounded font-body-default focus:border-accent-acid focus:outline-none transition-colors";
  const labelClass = "block mb-2 font-label-md text-text-muted";

  return (
    <main className="min-h-screen bg-canvas-base flex flex-col items-center py-16 px-4">
      <div className="max-w-2xl w-full bg-surface-card border border-border-subtle rounded-lg p-space-lg shadow-xl relative overflow-hidden">
        
        {/* Subdued Glitch effect background */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-accent-acid/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex justify-between items-center mb-space-lg relative z-10">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-text-ivory mb-2">إضافة ضيف جديد</h1>
            <p className="font-body-default text-text-muted">أدخل المعلومات الأساسية للضيف لبدء بناء ملف الإعداد.</p>
          </div>
          <Link href="/" className="text-text-muted hover:text-text-ivory transition-colors">
            <span className="material-symbols-outlined">close</span>
          </Link>
        </div>

        {error && (
          <div className="bg-error-container/20 border border-error text-error p-space-sm rounded mb-space-lg font-label-md relative z-10 flex items-start gap-2">
            <span className="material-symbols-outlined text-xl shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-space-md relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
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

            <div className="md:col-span-2">
              <label className={labelClass}>روابط أو مواد مقترحة مبدئياً</label>
              <textarea name="url" className={`${inputClass} min-h-[100px] resize-y`} placeholder="مقابلة سابقة، بودكاست، أو مقالة يفضل البدء بها..."></textarea>
            </div>
          </div>

          <div className="pt-space-md border-t border-border-subtle flex justify-end gap-space-sm">
            <Link href="/" className="px-space-md py-3 rounded font-label-md text-text-muted hover:text-text-ivory hover:bg-surface-elevated transition-colors">
              إلغاء
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-accent-acid text-canvas-base hover:bg-primary-fixed-dim px-space-xl py-3 rounded font-label-md font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                  جاري الإنشاء...
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
