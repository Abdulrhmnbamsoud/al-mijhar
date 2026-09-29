"use client";

import { useState } from "react";
import AngleSwitcher from "./AngleSwitcher";
import ClientButton from "./ClientButton";

export default function IntroEditor({
  activeAngle,
  allAngles
}: {
  activeAngle: any;
  allAngles: any[];
}) {
  const [introText, setIntroText] = useState(activeAngle?.hostIntro || activeAngle?.angle || "جاري صياغة المقدمة التعريفية...");
  
  let metadata: any = {};
  if (activeAngle?.introMetadata) {
    try {
      metadata = JSON.parse(activeAngle.introMetadata);
    } catch(e) {}
  }

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAction = async (actionName: string) => {
    if (!activeAngle?.id) return;
    
    setIsProcessing(true);
    try {
      // Map Arabic labels to English action strings for the API
      let action = "rewrite";
      if (actionName === "اجعلها أقصر") action = "shorter";
      if (actionName === "اجعلها أدفأ") action = "warmer";

      const res = await fetch(`/api/angles/${activeAngle.id}/rewrite-intro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, currentText: introText })
      });
      
      const data = await res.json();
      if (data.success && data.newText) {
        setIntroText(data.newText);
      } else {
        alert("حدث خطأ أثناء إعادة الصياغة.");
      }
    } catch (error) {
      console.error(error);
      alert("تعذر الاتصال بالخادم.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async (showSuccessMsg: boolean = false, isIntroApproved: boolean = false) => {
    if (!activeAngle?.id) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/angles/${activeAngle.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostIntro: introText, isIntroApproved })
      });
      
      if (res.ok) {
        if (showSuccessMsg) {
          alert("تم حفظ المقدمة كمسودة بنجاح!");
        }
      } else {
        alert("فشل الحفظ.");
      }
    } catch (error) {
      alert("حدث خطأ أثناء الحفظ.");
    } finally {
      setIsSaving(false);
      // Reload page to reflect changes
      window.location.reload();
    }
  };

  return (
    <div id="intro" className="bg-[#282a2f]/50 border border-[#282a2f] rounded-lg p-5 scroll-mt-20 flex flex-col gap-4">
      
      {/* Header and Editor */}
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2 text-[#a1824a] text-xs font-bold">
            <span className="material-symbols-outlined text-[16px]">record_voice_over</span>
            مقدمة المقدّم — جاهزة للقراءة على الهواء
          </div>
          {metadata.time && (
            <span className="text-[10px] bg-[#1b1d20] text-gray-300 px-2 py-1 rounded">
              المدة التقديرية: {metadata.time}
            </span>
          )}
        </div>
        
        {/* The angle itself as a small note for the team */}
        {activeAngle?.angle && activeAngle.hostIntro && (
          <div className="mb-3 px-3 py-2 bg-[#1b1d20] rounded border border-dashed border-[#3f4147] text-[11px] text-gray-400">
            <strong className="text-gray-300">زاوية الحلقة التحريرية:</strong> {activeAngle.angle}
          </div>
        )}

        <textarea 
          value={introText}
          onChange={(e) => setIntroText(e.target.value)}
          className="w-full bg-[#1b1d20] text-gray-300 text-sm leading-relaxed font-serif p-4 rounded border border-[#3f4147] focus:outline-none focus:border-[#a1824a] resize-y min-h-[120px]"
          dir="rtl"
        />
        
        {/* Warnings */}
        {metadata.warnings && (
          <div className="mt-3 flex items-start gap-2 bg-red-900/20 text-red-300 text-[10px] p-2.5 rounded border border-red-900/50">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            <div>
              <strong className="block mb-0.5">تنبيه للمحرر:</strong>
              {metadata.warnings}
            </div>
          </div>
        )}
      </div>

      {/* Editor Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#3f4147]">
        <div className="flex gap-2">
          <button 
            onClick={() => handleAction('أعد الصياغة')} 
            disabled={isProcessing}
            className="px-3 py-1.5 bg-[#1b1d20] hover:bg-black text-gray-300 hover:text-white text-[10px] rounded border border-[#3f4147] transition-colors disabled:opacity-50"
          >
            {isProcessing ? 'جاري...' : 'أعد الصياغة'}
          </button>
          <button 
            onClick={() => handleAction('اجعلها أقصر')} 
            disabled={isProcessing}
            className="px-3 py-1.5 bg-[#1b1d20] hover:bg-black text-gray-300 hover:text-white text-[10px] rounded border border-[#3f4147] transition-colors disabled:opacity-50"
          >
            اجعلها أقصر
          </button>
          <button 
            onClick={() => handleAction('اجعلها أدفأ')} 
            disabled={isProcessing}
            className="px-3 py-1.5 bg-[#1b1d20] hover:bg-black text-gray-300 hover:text-white text-[10px] rounded border border-[#3f4147] transition-colors disabled:opacity-50"
          >
            اجعلها أدفأ
          </button>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => handleSave(true, false)}
            disabled={isSaving}
            className="px-3 py-1.5 bg-[#1b1d20] text-gray-400 text-[10px] rounded border border-[#3f4147] hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'يحفظ...' : 'احفظ كمسودة'}
          </button>
          <button 
            onClick={() => {
              handleSave(false, true).then(() => {
                alert("تم اعتماد المقدمة وإرسالها لشاشة الملقن (Teleprompter) بنجاح!");
              });
            }}
            disabled={isSaving}
            className="px-4 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white font-bold text-[10px] rounded flex items-center gap-1 transition-colors shadow-sm disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[12px]">check_circle</span>
            اعتمد للمقدّم
          </button>
        </div>
      </div>

      <AngleSwitcher angles={allAngles} currentAngleId={activeAngle?.id || ""} />
    </div>
  );
}
