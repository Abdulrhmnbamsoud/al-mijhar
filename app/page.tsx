"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
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
      objective: formData.get("objective") as string,
      depth: formData.get("depth") as string,
    };

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.error || "حدث خطأ غير متوقع");
      }

      router.push(`/research/${json.jobId}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  const inputClass = "w-full bg-surface-elevated text-text-ivory border border-border-subtle p-3 rounded font-body-default focus:border-accent-acid focus:outline-none transition-colors";
  const labelClass = "block mb-2 font-label-md text-text-muted";

  return (
    <main className="min-h-screen bg-canvas-base flex flex-col items-center py-16 px-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-display-hero text-text-ivory mb-4">
          <span className="text-accent-acid font-bold">المِجهر</span>
        </h1>
        <p className="text-text-muted text-lg font-body-lead">
          نظام استقصائي تراكمي لإعداد المقابلات المتعمقة
        </p>
      </div>

      <div className="w-full max-w-3xl bg-surface-card border border-border-subtle rounded-lg p-8 shadow-xl">
        {error && (
          <div className="bg-error-container text-on-error-container p-4 rounded mb-6 font-label-md flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className={labelClass}>الاسم الكامل للضيف *</label>
            <input type="text" name="guestName" required placeholder="مثال: م. طارق بن فهد المعجل" className={inputClass} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>المنصب الحالي (اختياري)</label>
              <input type="text" name="role" placeholder="المدير التنفيذي" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>الجهة أو المنظمة (اختياري)</label>
              <input type="text" name="organization" placeholder="سير كابيتال" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>الدولة أو المدينة (اختياري)</label>
              <input type="text" name="country" placeholder="السعودية، الرياض" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>موقع الويب (اختياري)</label>
              <input type="url" name="url" placeholder="رابط موقع الشركة أو الموقع الشخصي" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>رابط حساب تويتر (X)</label>
              <input type="url" name="twitterUrl" placeholder="https://x.com/..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>رابط لينكد إن (LinkedIn)</label>
              <input type="url" name="linkedinUrl" placeholder="https://linkedin.com/in/..." className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>الهدف من اللقاء (اختياري)</label>
            <textarea name="objective" rows={3} placeholder="استيضاح نموذج العمل، مناقشة التناقضات المالية..." className={`${inputClass} resize-y`} />
          </div>

          <div>
            <label className={labelClass}>عمق البحث الاستقصائي</label>
            <select name="depth" defaultValue="متقدم" className={inputClass}>
              <option value="سريع">سريع - فحص سريع وتجهيز عام</option>
              <option value="متقدم">متقدم - بحث متعمق مع تحليل المصادر المفتوحة</option>
              <option value="عميق" disabled>عميق - ربط قواعد البيانات والسجلات المالية (مغلق)</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-accent-acid hover:bg-primary-fixed-dim text-canvas-base font-bold text-lg py-4 rounded transition-colors flex items-center justify-center gap-2 mt-4">
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin">sync</span>
                جاري تفعيل عناكب الزحف وبناء التقرير...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">manage_search</span>
                ابدأ البحث الحقيقي
              </>
            )}
          </button>

          <div className="pt-4 border-t border-border-subtle text-center">
            <p className="text-text-dim text-sm flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-xs text-badge-fact-text">verified_user</span>
              نبحث في المصادر العامة المفتوحة (OSINT) ولا يتم تخزين بيانات المستخدمين.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
