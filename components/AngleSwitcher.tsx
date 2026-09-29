"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function AngleSwitcher({ 
  angles, 
  currentAngleId 
}: { 
  angles: { id: string, angle: string, createdAt: Date, isActive: boolean }[],
  currentAngleId: string
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSwitch = (angleId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('angleId', angleId);
    router.push(`${pathname}?${params.toString()}`);
  };

  if (angles.length === 0) return null; // No need to show switcher if no angles exist

  return (
    <div className="mt-4">
      <div className="text-[10px] text-gray-500 font-bold mb-2">تاريخ المحاولات والتوجيهات (اختر للتبديل):</div>
      <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
        {angles.map((a, i) => {
          const isSelected = a.id === currentAngleId;
          const dateStr = new Date(a.createdAt).toISOString().split('T')[0];
          const label = i === 0 ? "أحدث محاولة" : \`محاولة أقدم (\${dateStr})\`;
          return (
            <button
              key={a.id}
              onClick={() => handleSwitch(a.id)}
              className={`text-right w-full p-3 rounded-lg border transition-colors ${isSelected ? 'bg-[#a1824a]/10 border-[#a1824a]/50 text-[#a1824a]' : 'bg-[#282a2f] border-[#282a2f] text-gray-400 hover:bg-gray-800'}`}
            >
              <div className="text-[10px] font-bold mb-1 opacity-80">{label}</div>
              <div className="text-xs font-serif leading-relaxed line-clamp-2">«{a.angle}»</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
