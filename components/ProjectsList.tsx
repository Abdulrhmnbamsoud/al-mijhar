'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { AutoRefresh } from './AutoRefresh';
import ClientButton from './ClientButton';

export default function ProjectsList({ initialProjects }: { initialProjects: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');

  const hasProcessingProjects = initialProjects.some(p => p.status === 'researching');

  const [toastMsg, setToastMsg] = useState<{ id: string, msg: string } | null>(null);

  const showToast = (id: string, msg: string) => {
    setToastMsg({ id, msg });
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Interactive functions
  const handleShare = (projectId: string) => {
    const url = `${window.location.origin}/research/${projectId}/desk`;
    navigator.clipboard.writeText(url);
    showToast(projectId, 'تم نسخ الرابط!');
  };

  const handleDownload = () => {
    alert('جاري تجهيز حزمة ملفات المشروع للتنزيل...');
  };

  // Filter projects
  const filteredProjects = initialProjects.filter(project => {
    const searchLower = searchQuery.toLowerCase();
    const guestName = (project.guest?.name || '').toLowerCase();
    const angleText = (project.episodeAngles?.[0]?.angle || '').toLowerCase();
    
    return guestName.includes(searchLower) || angleText.includes(searchLower);
  });

  return (
    <>
      {hasProcessingProjects && <AutoRefresh intervalMs={3000} />}
      {/* Filter Bar */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-wrap gap-4 items-center justify-between border-b border-[#e8e6df] pb-4">
          
          <div className="relative flex-1 min-w-[300px] max-w-md">
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم الضيف، أو المقدمة التعريفية..." 
              className="w-full bg-white border border-[#e8e6df] rounded px-10 py-2.5 text-xs focus:outline-none focus:border-[#a1824a] transition-colors"
            />
          </div>
          
          <Link 
            href="/new"
            className="px-4 py-2.5 bg-[#a1824a] hover:bg-[#8b6e3e] text-white text-xs font-bold rounded flex items-center gap-2 transition-all duration-300 hover:shadow-md active:scale-95 shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            مشروع جديد
          </Link>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-6 pt-4">
        {filteredProjects.map(project => {
          const angle = project.episodeAngles[0];
          const chapters = angle?.chapters || [];

          return (
            <div key={project.id} className="bg-white border border-[#e8e6df] rounded-xl overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-[#a1824a] transition-all duration-300 group">
              
              {/* Image Placeholder - Right Side */}
              <div className="md:w-72 bg-[#e8e6df] relative flex-shrink-0 min-h-[200px] md:min-h-full overflow-hidden">
                 {/* Real Guest Image from LinkedIn or fallback */}
                 <img 
                   src={
                     project.guest.linkedinUrl && project.guest.linkedinUrl.match(/linkedin\.com\/in\/([^\/\?]+)/)
                       ? `https://unavatar.io/linkedin/${project.guest.linkedinUrl.match(/linkedin\.com\/in\/([^\/\?]+)/)?.[1]}`
                       : `https://ui-avatars.com/api/?name=${encodeURIComponent(project.guest.name)}&background=e8e6df&color=1b1d20&size=512`
                   }
                   alt={project.guest.name}
                   className="absolute inset-0 w-full h-full object-cover object-center filter grayscale opacity-90 mix-blend-multiply"
                   onError={(e) => {
                     e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(project.guest.name)}&background=e8e6df&color=1b1d20&size=512`;
                   }}
                 />
                 
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                 

                 
                 <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-[#1b1d20] text-[10px] font-bold px-3 py-1.5 rounded shadow-sm z-10">
                   الموسم 3 - حلقة {project.id.slice(-4)}
                 </div>
                 <div className="absolute top-4 left-4 bg-[#a1824a] text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10">
                   {project.status === 'ready' ? 'مكتملة' : 'قيد الإعداد'}
                 </div>
              </div>

              {/* Content - Left Side */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#a1824a]">
                    <span className="material-symbols-outlined text-[16px]">mic_external_on</span>
                    مقترح جاهز للعرض
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono" suppressHydrationWarning>
                    آخر تحديث: {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true, locale: ar })}
                  </span>
                </div>
                
                <h2 className="text-xl font-bold text-[#1b1d20] mb-2 leading-tight">
                  {project.guest.name}: {angle?.angle || "الحلقة قيد الإعداد..."}
                </h2>
                
                <p className="text-[13px] text-gray-500 mb-6 line-clamp-2">
                  {project.guest.role} {project.guest.organization && `• ${project.guest.organization}`}
                </p>

                <div className="mb-4 bg-[#f8f8f5] rounded-lg p-4 border border-[#e8e6df]">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-[#a1824a] text-[14px]">format_list_bulleted</span>
                    <span className="text-[11px] font-bold text-[#1b1d20]">أبرز محاور الحلقة المعتمدة للحلقة</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                    {chapters.map((chapter: any) => (
                      <div key={chapter.id} className="flex gap-2 items-start">
                        <span className="material-symbols-outlined text-[#a1824a] text-[14px] mt-0.5">chevron_left</span>
                        <div>
                          <p className="text-[12px] font-bold text-[#1b1d20] mb-1">{chapter.title}</p>
                          <p className="text-[10px] text-gray-400">المدة المقدرة: 20 دقيقة • {project._count.sources} وثيقة مسجلة</p>
                        </div>
                      </div>
                    ))}
                    {chapters.length === 0 && (
                      <div className="text-[11px] text-gray-400 py-2">لا توجد محاور معتمدة حتى الآن.</div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link 
                      href={`/research/${project.id}/desk`} 
                      className="px-5 py-2.5 bg-[#1b1d20] hover:bg-black text-white text-[11px] font-medium rounded flex items-center gap-2 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit_document</span>
                      مذكرة التلقين والأسئلة
                    </Link>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <ClientButton 
                      actionType="copy" 
                      copyText={`/research/${project.id}/desk`} 
                      className="w-9 h-9 rounded border border-[#e8e6df] flex items-center justify-center text-gray-400 hover:text-[#1b1d20] hover:border-[#1b1d20] hover:bg-gray-50 transition-all shadow-sm" 
                      title="مشاركة"
                    >
                      <span className="material-symbols-outlined text-[14px]">share</span>
                    </ClientButton>
                    <ClientButton 
                      actionType="alert" 
                      alertMessage="سيتم تجميع المستندات وتحميلها بصيغة PDF قريبًا" 
                      className="w-9 h-9 rounded border border-[#e8e6df] flex items-center justify-center text-gray-400 hover:text-[#1b1d20] hover:border-[#1b1d20] hover:bg-gray-50 transition-all shadow-sm" 
                      title="تحميل"
                    >
                      <span className="material-symbols-outlined text-[14px]">download</span>
                    </ClientButton>
                  </div>
                </div>
                
              </div>
            </div>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center border border-dashed border-[#e8e6df] rounded-xl bg-white text-center">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">search_off</span>
            <h3 className="text-lg font-bold text-[#1b1d20] mb-1">لا توجد نتائج مطابقة</h3>
            <p className="text-sm text-gray-500">حاول البحث بكلمات أخرى أو تغيير إعدادات التصفية.</p>
          </div>
        )}
      </div>
    </>
  );
}
