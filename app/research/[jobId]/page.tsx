"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ResearchDashboard() {
  const params = useParams();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/research/${jobId}`);
        const data = await res.json();
        setJob(data);

        if (data.status === "completed" || data.status === "failed") {
          setLoading(false);
          if (interval) clearInterval(interval);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchJob();
    interval = setInterval(fetchJob, 3000);

    return () => clearInterval(interval);
  }, [jobId]);

  if (!job) {
    return (
      <div className="min-h-screen bg-canvas-base flex flex-col items-center justify-center text-text-ivory">
        <Loader2 className="animate-spin text-accent-acid w-12 h-12" />
        <p className="mt-4 font-body-default">جاري تحميل البيانات...</p>
      </div>
    );
  }

  if (job.status === "failed") {
    return (
      <div className="min-h-screen bg-canvas-base p-8 text-text-ivory flex justify-center items-center">
        <div className="bg-surface-elevated border-l-4 border-error p-6 rounded-lg max-w-2xl w-full">
          <h2 className="text-error font-headline-md flex items-center gap-2">
            <span className="material-symbols-outlined">warning</span> تعذر استكمال البحث
          </h2>
          <p className="mt-4 text-text-muted">{job.error}</p>
        </div>
      </div>
    );
  }

  if (job.status !== "completed") {
    return (
      <div className="min-h-screen bg-canvas-base p-8 text-text-ivory flex justify-center items-center">
        <div className="bg-surface-card border border-border-subtle p-8 rounded-lg max-w-2xl w-full">
          <h2 className="text-center font-headline-sm mb-6">جاري إجراء البحث الاستقصائي...</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between text-text-dim font-label-md">
              <span>المرحلة الحالية:</span>
              <span className="text-accent-acid font-bold animate-pulse">{job.status}</span>
            </div>
            
            <div className="w-full bg-surface-elevated h-2 rounded-full overflow-hidden">
              <div 
                className="bg-accent-acid h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${job.progress}%` }} 
              />
            </div>
            
            <p className="text-center text-sm text-text-dim mt-4">
              المصادر المكتشفة: {job.project?.sources?.length || 0}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const project = job.project;
  const profile = project?.profile;
  const quickMetrics = project?.quickMetrics ? JSON.parse(project.quickMetrics) : {};
  const identityMatch = project?.identityMatch ? JSON.parse(project.identityMatch) : {};
  const confidenceScore = project?.confidenceScore || 0;
  
  const sources = project?.sources || [];
  const primarySources = sources.filter((s:any) => s.type === "Primary").length;
  const mediaSources = sources.filter((s:any) => s.type === "News/Interview").length;

  return (
    <div className="bg-canvas-base font-body-default text-on-surface antialiased min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-surface-card border-b border-border-subtle">
        <div className="h-16 w-full px-space-lg flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-space-sm pl-space-md border-l border-border-subtle">
              <img alt="Profile" className="w-8 h-8 rounded-full object-cover" src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'G')}&background=181C24&color=D4FF00&size=128`}/>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-text-ivory leading-none tracking-tight">المِجهر</span>
                <span className="font-caption-code text-caption-code text-accent-acid mt-space-xs">ذكاء استقصائي مهني</span>
              </div>
            </div>
            <div className="hidden xl:flex items-center gap-space-xs bg-badge-fact-bg/40 border border-badge-fact-text/30 px-space-sm py-space-xs rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-badge-fact-text animate-pulse"></span>
              <span className="font-label-sm text-label-sm text-badge-fact-text">محرك البحث الاستقصائي متصل</span>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-space-xs">
            <a aria-current="page" className="px-space-md py-space-xs rounded font-label-md transition-colors bg-surface-elevated text-accent-acid border border-border-subtle" href="#">الملف الاستقصائي</a>
            <a className="px-space-md py-space-xs rounded font-label-md text-label-md text-text-muted hover:text-text-ivory hover:bg-surface-elevated transition-colors" href="/">بحث جديد</a>
          </nav>
          <div className="flex items-center gap-space-sm">
            <div className="hidden sm:flex items-center gap-space-sm bg-surface-elevated border border-border-subtle px-space-sm py-space-xs rounded text-text-muted">
              <span className="material-symbols-outlined text-sm">search</span>
              <span className="font-label-sm text-label-sm text-text-dim">بحث سريع...</span>
              <kbd className="font-caption-code text-caption-code bg-surface-container px-1 py-0.5 rounded text-text-dim border border-border-subtle">⌘K</kbd>
            </div>
            <div className="flex items-center gap-space-xs">
              <button className="hidden md:inline-flex items-center gap-space-xs px-space-sm py-space-xs rounded bg-surface-elevated border border-border-subtle font-label-sm text-label-sm text-text-ivory hover:border-text-muted transition-colors" type="button">
                <span className="material-symbols-outlined text-base">picture_as_pdf</span>تصدير PDF
              </button>
              <button className="hidden md:inline-flex items-center gap-space-xs px-space-sm py-space-xs rounded bg-surface-elevated border border-border-subtle font-label-sm text-label-sm text-text-ivory hover:border-text-muted transition-colors" type="button">
                <span className="material-symbols-outlined text-base">quiz</span>ورقة الأسئلة
              </button>
              <button className="inline-flex items-center gap-space-xs px-space-sm py-space-xs rounded bg-accent-acid font-label-sm text-label-sm font-bold text-canvas-base hover:bg-primary-fixed-dim transition-colors" type="button">
                <span className="material-symbols-outlined text-base">content_copy</span>نسخ التقرير
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full pt-16 bg-canvas-base">
        <div className="flex flex-col w-full">
          <section className="w-full bg-surface-card border-b border-border-subtle px-space-lg py-space-sm flex flex-wrap items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-md">
              <div className="flex items-center gap-space-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-acid animate-pulse"></span>
                <span className="font-caption-code text-caption-code text-accent-acid tracking-wider font-semibold">ملف استقصائي مُفهرس // مِلف-{project?.id.split('-')[0].toUpperCase()}</span>
              </div>
              <span className="text-border-subtle">|</span>
              <div className="flex items-center gap-space-xs text-text-muted">
                <span className="material-symbols-outlined text-sm">schedule</span>
                <span className="font-caption-code text-caption-code">تاريخ التوثيق: {new Date(project?.createdAt).toLocaleDateString('ar-SA')}</span>
              </div>
              <span className="hidden md:inline text-border-subtle">|</span>
              <div className="hidden md:flex items-center gap-space-xs text-text-muted">
                <span className="material-symbols-outlined text-sm">database</span>
                <span className="font-caption-code text-caption-code">{sources.length} مصدراً تم فحصها آلياً</span>
              </div>
            </div>
            <div className="flex items-center gap-space-sm">
              <span className="font-caption-code text-caption-code text-text-dim">مستوى دقة التثبت:</span>
              <div className="flex items-center gap-1 bg-badge-fact-bg/50 border border-badge-fact-text/40 px-space-sm py-0.5 rounded">
                <span className="material-symbols-outlined text-badge-fact-text text-sm">verified_user</span>
                <span className="font-label-sm text-label-sm text-badge-fact-text font-bold">{confidenceScore}% موثوقية استقصائية</span>
              </div>
            </div>
          </section>

          <section className="w-full bg-surface-container-low border-b border-border-subtle px-space-lg py-space-xs">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-badge-inference text-base shrink-0">info</span>
                <p className="font-label-sm text-label-sm text-text-muted">
                  <strong className="text-text-ivory font-semibold">إشعار قانوني وتحريري:</strong>
                  هذا التقرير مبني على مصادر مفتوحة ومتاحة للعامة. الاستنتاجات التحليلية ليست حقائق قطعية، ويجب التحقق منها أثناء الحوار.
                </p>
              </div>
              <span className="font-caption-code text-caption-code text-text-dim shrink-0 hidden lg:inline">نظام الاستقصاء الآلي v4</span>
            </div>
          </section>

          <div className="w-full px-space-lg py-space-lg max-w-7xl mx-auto space-y-space-lg">
            {/* Guest Profile Ledger Card (Hero Unit) */}
            <section className="w-full bg-surface-card border border-border-subtle rounded-lg p-space-lg relative overflow-hidden">
              <div className="absolute -top-24 -left-24 w-80 h-80 bg-accent-acid/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-lg relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-space-lg">
                  <div className="relative shrink-0">
                    <img className="w-28 h-28 sm:w-32 sm:h-32 rounded-lg object-cover border border-border-subtle bg-surface-elevated" src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'G')}&background=181C24&color=D4FF00&size=256`} alt="Profile" />
                    <div className="absolute -bottom-2 -left-2 bg-canvas-base border border-border-subtle px-1.5 py-0.5 rounded text-accent-acid font-caption-code text-caption-code flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined text-xs">shield_lock</span>
                      <span>مُطابَق</span>
                    </div>
                  </div>
                  <div className="space-y-space-xs">
                    <div className="flex flex-wrap items-center gap-space-xs">
                      <span className="px-space-xs py-0.5 rounded bg-surface-elevated border border-border-subtle font-caption-code text-caption-code text-text-dim">شخصية بحث</span>
                      <span className="px-space-xs py-0.5 rounded bg-badge-fact-bg/40 border border-badge-fact-text/30 font-caption-code text-caption-code text-badge-fact-text">سجل موثق</span>
                      <span className="px-space-xs py-0.5 rounded bg-surface-elevated border border-border-subtle font-caption-code text-caption-code text-text-muted">مُعرّف: {project?.id.split('-')[0].toUpperCase()}</span>
                    </div>
                    <h1 className="font-headline-lg text-headline-lg text-text-ivory tracking-tight">{profile?.name}</h1>
                    <p className="font-body-dense text-body-dense text-text-muted">
                      {profile?.role} | <span className="text-text-ivory font-medium">{profile?.organization}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-space-md text-text-dim pt-space-xs font-label-sm text-label-sm">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        {profile?.location}
                      </span>
                      <span className="flex items-center gap-1 text-accent-acid">
                        <span className="material-symbols-outlined text-sm">campaign</span>
                        مستهدف: جلسة حوارية متعمقة
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="w-full lg:w-auto flex flex-row lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 lg:border-r border-border-subtle pt-space-md lg:pt-0 lg:pr-space-lg gap-space-md">
                  <div className="flex items-center gap-space-md">
                    <div className="text-right">
                      <div className="font-caption-code text-caption-code text-text-dim">مؤشر موثوقية البيانات</div>
                      <div className="font-display-hero text-display-hero text-accent-acid leading-none font-bold tracking-tight">{confidenceScore}%</div>
                      <div className="font-caption-code text-caption-code text-badge-fact-text mt-1 flex items-center gap-0.5 justify-end">
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        <span>فحص متقاطع مستقل</span>
                      </div>
                    </div>
                    {/* Inline Radial Chart */}
                    <div className="w-16 h-16 shrink-0 relative flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path className="text-surface-elevated" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5"></path>
                        <path className="text-accent-acid" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${confidenceScore}, 100`} strokeLinecap="round" strokeWidth="3.5"></path>
                      </svg>
                      <span className="material-symbols-outlined text-accent-acid text-base absolute">hub</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm mt-space-lg pt-space-md border-t border-border-subtle">
                <div className="bg-surface-elevated/70 border border-border-subtle p-space-sm rounded">
                  <span className="font-caption-code text-caption-code text-text-dim block">سنوات الخبرة التنفيذية</span>
                  <span className="font-headline-md text-headline-md text-text-ivory font-bold">{quickMetrics.yearsOfExperience || 0}</span>
                </div>
                <div className="bg-surface-elevated/70 border border-border-subtle p-space-sm rounded">
                  <span className="font-caption-code text-caption-code text-text-dim block">المصادر الأولية والمستندات</span>
                  <span className="font-headline-md text-headline-md text-accent-acid font-bold">{primarySources}</span>
                </div>
                <div className="bg-surface-elevated/70 border border-border-subtle p-space-sm rounded">
                  <span className="font-caption-code text-caption-code text-text-dim block">الأرشيف الإعلامي المقروء</span>
                  <span className="font-headline-md text-headline-md text-text-ivory font-bold">{mediaSources}</span>
                </div>
                <div className="bg-surface-elevated/70 border border-border-subtle p-space-sm rounded">
                  <span className="font-caption-code text-caption-code text-text-dim block">القضايا الإشكالية المحورية</span>
                  <span className="font-headline-md text-headline-md text-badge-gap-risk font-bold">{project?.verifications?.length || 0} فجوات</span>
                </div>
              </div>
            </section>

            {/* Briefing */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              <section className="lg:col-span-8 bg-surface-card border border-border-subtle rounded-lg p-space-lg space-y-space-md">
                <div className="flex items-center justify-between border-b border-border-subtle pb-space-sm">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-accent-acid text-lg">timer</span>
                    <h2 className="font-headline-sm text-headline-sm text-text-ivory">موجز الدقائق الخمس</h2>
                  </div>
                  <span className="font-caption-code text-caption-code px-2 py-0.5 bg-surface-elevated border border-border-subtle text-text-muted rounded">قراءة تمهيدية قبل اللقاء</span>
                </div>
                <div className="font-body-default text-body-default text-on-surface space-y-space-sm leading-relaxed text-justify">
                  <p>{project?.executiveBriefing}</p>
                </div>
                
                <div className="bg-surface-elevated border border-border-subtle rounded p-space-md mt-space-md">
                  <div className="flex items-center justify-between mb-space-xs">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-badge-fact-text text-base">fingerprint</span>
                      <h3 className="font-label-md text-label-md text-text-ivory font-bold">تأكيد الهوية ومطابقة الشخصية</h3>
                    </div>
                    <span className="px-2 py-0.5 bg-badge-fact-bg/60 text-badge-fact-text font-caption-code text-caption-code rounded border border-badge-fact-text/30">{identityMatch.status || 'تطابق قطعي'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm font-caption-code text-caption-code text-text-muted mt-space-sm">
                    {identityMatch.reasons?.map((reason: string, i: number) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-badge-fact-text text-sm">check</span>
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
              
              <aside className="lg:col-span-4 space-y-space-md">
                {/* Behavioral Profile */}
                <div className="bg-surface-card border border-border-subtle rounded-lg p-space-md space-y-space-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-badge-gap-risk to-accent-acid"></div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent-acid">psychology</span>
                    <span className="font-label-md text-label-md text-text-ivory font-bold">النمط السلوكي</span>
                  </div>
                  <p className="font-body-dense text-body-dense text-text-muted mt-2">
                    {profile?.behavioralProfile || 'قيد التحليل الاستخباراتي...'}
                  </p>
                  <div className="mt-4 pt-4 border-t border-border-subtle">
                    <div className="flex justify-between font-caption-code text-caption-code mb-2">
                      <span className="text-text-muted">مؤشر المراوغة (Evasion Score)</span>
                      <span className="text-badge-gap-risk font-bold">{profile?.evasionScore || 0}%</span>
                    </div>
                    <div className="w-full bg-surface-elevated h-2 rounded-full overflow-hidden">
                      <div className="bg-badge-gap-risk h-full rounded-full transition-all duration-1000" style={{ width: `${profile?.evasionScore || 0}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-card border border-border-subtle rounded-lg p-space-md space-y-space-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-label-md text-text-ivory font-bold">توزيع مصادر الثقة ({sources.length} مصدراً)</span>
                    <span className="material-symbols-outlined text-text-dim text-sm">pie_chart</span>
                  </div>
                  <div className="space-y-space-xs pt-space-xs">
                    <div>
                      <div className="flex justify-between font-caption-code text-caption-code mb-1">
                        <span className="text-text-muted">مصادر أولية ومستندات رسمية ({primarySources})</span>
                        <span className="text-badge-fact-text font-bold">{sources.length > 0 ? Math.round((primarySources/sources.length)*100) : 0}%</span>
                      </div>
                      <div className="w-full bg-surface-elevated h-1.5 rounded-full overflow-hidden">
                        <div className="bg-badge-fact-text h-full rounded-full" style={{ width: `${sources.length > 0 ? (primarySources/sources.length)*100 : 0}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-caption-code text-caption-code mb-1">
                        <span className="text-text-muted">تقارير إعلامية مستقلة ({mediaSources})</span>
                        <span className="text-badge-claim-text font-bold">{sources.length > 0 ? Math.round((mediaSources/sources.length)*100) : 0}%</span>
                      </div>
                      <div className="w-full bg-surface-elevated h-1.5 rounded-full overflow-hidden">
                        <div className="bg-badge-claim-text h-full rounded-full" style={{ width: `${sources.length > 0 ? (mediaSources/sources.length)*100 : 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>

            {/* Timeline */}
            <section className="w-full bg-surface-card border border-border-subtle rounded-lg p-space-lg space-y-space-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-sm border-b border-border-subtle gap-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-accent-acid text-lg">timeline</span>
                  <h2 className="font-headline-sm text-headline-sm text-text-ivory">الخط الزمني المهني ومحطات التحقق</h2>
                </div>
                <span className="font-caption-code text-caption-code text-text-dim">ترتيب زمني مبني على الأحداث</span>
              </div>
              <div className="relative pr-6 border-r-2 border-border-subtle space-y-space-lg my-space-md">
                {project?.timeline?.map((t: any) => (
                  <div key={t.id} className="relative group">
                    <div className="absolute -right-[31px] top-1.5 w-3 h-3 rounded-full bg-accent-acid ring-4 ring-canvas-base group-hover:bg-badge-fact-text transition-colors"></div>
                    <div className="bg-surface-elevated border border-border-subtle rounded p-space-md space-y-space-xs hover:border-accent-acid/50 transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-space-xs">
                        <div className="flex items-center gap-space-xs">
                          <span className="font-caption-code text-caption-code font-bold text-accent-acid bg-accent-acid/10 px-2 py-0.5 rounded">{t.date}</span>
                          <h3 className="font-label-md text-label-md text-text-ivory font-bold">{t.event}</h3>
                        </div>
                        <span className="px-space-xs py-0.5 rounded bg-surface-container-highest font-caption-code text-caption-code text-text-muted">{t.organization}</span>
                      </div>
                      <p className="font-body-dense text-body-dense text-text-muted">{t.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Network & Anomalies (OSINT Insane Mode) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg items-stretch">
              {/* Network Nodes */}
              {project?.networkNodes && project.networkNodes.length > 0 && (
                <section className="bg-surface-card border border-border-subtle rounded-lg p-space-lg space-y-space-md">
                  <div className="flex items-center justify-between border-b border-border-subtle pb-space-sm mb-space-md">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-accent-acid text-lg">share</span>
                      <h2 className="font-headline-sm text-headline-sm text-text-ivory">شبكة الارتباطات الاستخباراتية</h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-space-sm">
                    {project.networkNodes.map((node: any) => (
                      <div key={node.id} className="bg-surface-elevated border border-border-subtle rounded p-space-sm flex items-start gap-space-sm relative overflow-hidden group">
                        <div className={`absolute top-0 bottom-0 right-0 w-1 ${node.relationType.includes('حليف') || node.relationType.includes('داعم') ? 'bg-badge-fact-text' : node.relationType.includes('خصم') ? 'bg-badge-gap-risk' : 'bg-badge-inference'}`}></div>
                        <span className="material-symbols-outlined text-text-dim mt-1">person</span>
                        <div className="space-y-1 w-full pr-1">
                          <div className="flex justify-between items-start w-full">
                            <h3 className="font-label-md text-label-md text-text-ivory font-bold">{node.name}</h3>
                            <span className="font-caption-code text-caption-code text-text-muted bg-surface-container-highest px-2 py-0.5 rounded">{node.relationType}</span>
                          </div>
                          <p className="font-body-dense text-body-dense text-text-muted leading-relaxed">{node.description}</p>
                          <div className="mt-2 text-right">
                            <span className={`font-caption-code text-caption-code px-2 py-0.5 rounded border ${node.riskLevel === 'مرتفع' ? 'bg-badge-gap-risk/20 text-badge-gap-risk border-badge-gap-risk/30' : node.riskLevel === 'متوسط' ? 'bg-badge-inference/20 text-badge-inference border-badge-inference/30' : 'bg-badge-fact-bg/40 text-badge-fact-text border-badge-fact-text/30'}`}>
                              تهديد: {node.riskLevel}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Anomalies */}
              {project?.anomalies && project.anomalies.length > 0 && (
                <section className="bg-surface-card border border-border-subtle rounded-lg p-space-lg space-y-space-md">
                  <div className="flex items-center justify-between border-b border-border-subtle pb-space-sm mb-space-md">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-badge-gap-risk text-lg">warning</span>
                      <h2 className="font-headline-sm text-headline-sm text-text-ivory">شذوذ السيرة والبصمة المخفية</h2>
                    </div>
                  </div>
                  <div className="space-y-space-md">
                    {project.anomalies.map((anomaly: any) => (
                      <div key={anomaly.id} className="border border-badge-gap-risk/30 bg-badge-gap-risk/5 rounded p-space-md relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-0.5 bg-badge-gap-risk"></div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-label-md text-label-md text-badge-gap-risk font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">priority_high</span>
                            {anomaly.title}
                          </h3>
                          <span className="font-caption-code text-caption-code text-badge-gap-risk bg-badge-gap-risk/20 px-2 py-0.5 rounded border border-badge-gap-risk/30">{anomaly.severity}</span>
                        </div>
                        <p className="font-body-dense text-body-dense text-text-muted mt-1 leading-relaxed">{anomaly.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Strengths & Gaps */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg items-stretch">
              <section className="bg-surface-card border border-border-subtle rounded-lg p-space-lg space-y-space-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-space-xs border-b border-border-subtle pb-space-sm mb-space-md">
                    <span className="material-symbols-outlined text-badge-fact-text text-lg">verified</span>
                    <h2 className="font-headline-sm text-headline-sm text-text-ivory">نقاط القوة المدعومة بالأدلة القطعية</h2>
                  </div>
                  <div className="space-y-space-md">
                    {project?.strengths?.map((s: any) => (
                      <div key={s.id} className="border-r-2 border-badge-fact-text pr-space-md py-0.5">
                        <h3 className="font-label-md text-label-md text-text-ivory font-bold">{s.title}</h3>
                        <p className="font-body-dense text-body-dense text-text-muted mt-1">{s.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="bg-surface-card border border-border-subtle rounded-lg p-space-lg space-y-space-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-border-subtle pb-space-sm mb-space-md">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-badge-gap-risk text-lg">search_check</span>
                      <h2 className="font-headline-sm text-headline-sm text-text-ivory">مواطن التحقق والفجوات غير المحسومة</h2>
                    </div>
                  </div>
                  <div className="space-y-space-md">
                    {project?.verifications?.map((v: any) => (
                      <div key={v.id} className="border-r-2 border-badge-gap-risk pr-space-md py-0.5">
                        <h3 className="font-label-md text-label-md text-text-ivory font-bold">{v.gap}</h3>
                        <p className="font-body-dense text-body-dense text-text-muted mt-1">{v.whyItMatters}</p>
                        <div className="mt-space-xs bg-surface-elevated p-2 rounded text-text-dim font-caption-code text-caption-code flex items-start gap-1">
                          <span className="text-accent-acid font-bold shrink-0">سؤال مقترح:</span>
                          <span>{v.questionToAsk}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* Contradictions */}
            {project?.contradictions && project.contradictions.length > 0 && (
              <section className="w-full bg-surface-card border border-border-subtle rounded-lg p-space-lg space-y-space-md">
                <div className="flex items-center justify-between border-b border-border-subtle pb-space-sm">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-badge-inference text-lg">balance</span>
                    <h2 className="font-headline-sm text-headline-sm text-text-ivory">خريطة التناقضات وتتبع تصريحات الأرشيف</h2>
                  </div>
                  <span className="font-caption-code text-caption-code bg-badge-inference/10 text-badge-inference border border-badge-inference/30 px-2 py-0.5 rounded">مقارنة تحليلية مدققة</span>
                </div>
                
                {project.contradictions.map((c: any) => (
                  <div key={c.id} className="bg-surface-elevated border border-border-subtle rounded-lg p-space-md space-y-space-md mt-space-md">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-badge-gap-risk"></span>
                      <span className="font-label-md text-label-md text-text-ivory font-bold">تناقض مصرح به</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md relative">
                      <div className="bg-surface-card border border-border-subtle p-space-md rounded space-y-space-xs">
                        <div className="flex items-center justify-between text-badge-claim-text font-caption-code text-caption-code">
                          <span className="flex items-center gap-1">تصريح أ</span>
                        </div>
                        <blockquote className="font-body-dense text-body-dense text-text-ivory italic pr-2 border-r border-badge-claim-text">
                          «{c.statementA}»
                        </blockquote>
                      </div>
                      <div className="bg-surface-card border border-border-subtle p-space-md rounded space-y-space-xs">
                        <div className="flex items-center justify-between text-badge-gap-risk font-caption-code text-caption-code">
                          <span className="flex items-center gap-1">تصريح ب</span>
                        </div>
                        <blockquote className="font-body-dense text-body-dense text-text-ivory italic pr-2 border-r border-badge-gap-risk">
                          «{c.statementB}»
                        </blockquote>
                      </div>
                    </div>
                    <div className="bg-surface-card/90 border border-accent-acid/30 rounded p-space-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm">
                      <div className="space-y-0.5">
                        <span className="font-caption-code text-caption-code text-accent-acid font-bold block">السؤال الاحترافي المقترح للمحاور (بدون اتهام):</span>
                        <p className="font-body-dense text-body-dense text-text-muted">
                          {c.question}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* Radar / Hot Conversation Map */}
            <section className="w-full bg-surface-card border border-border-subtle rounded-lg p-space-lg space-y-space-md">
              <div className="flex items-center justify-between border-b border-border-subtle pb-space-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-accent-acid text-lg">radar</span>
                  <h2 className="font-headline-sm text-headline-sm text-text-ivory">خريطة الحوار الساخن</h2>
                </div>
                <span className="font-caption-code text-caption-code text-text-muted">مناطق لتوجيه بوصلة المقابلة</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
                {project?.topics?.map((t: any, idx: number) => {
                  let borderColor = "border-t-badge-fact-text";
                  let textColor = "text-badge-fact-text";
                  if (idx === 1) { borderColor = "border-t-accent-acid"; textColor = "text-accent-acid"; }
                  if (idx === 2) { borderColor = "border-t-badge-inference"; textColor = "text-badge-inference"; }
                  if (idx === 3) { borderColor = "border-2 border-accent-acid"; textColor = "text-accent-acid"; }

                  return (
                    <div key={t.id} className={`bg-surface-elevated ${idx !== 3 ? 'border-t-4 border border-border-subtle' : ''} ${borderColor} rounded p-space-md space-y-space-xs flex flex-col justify-between`}>
                      <div>
                        <div className="flex items-center justify-between mb-space-xs">
                          <span className={`font-caption-code text-caption-code font-bold ${textColor} tracking-wider`}>{t.category}</span>
                        </div>
                        <h3 className="font-label-md text-label-md text-text-ivory font-bold mb-1">{t.openingQuestion}</h3>
                        <p className="font-caption-code text-caption-code text-text-muted leading-relaxed">
                          {t.whyUseful}
                        </p>
                      </div>
                      <div className="pt-space-xs border-t border-border-subtle text-text-dim font-caption-code text-caption-code">
                        المستوى: {t.riskLevel}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Questions List */}
            {project?.questions && project.questions.length > 0 && (
              <section className="w-full bg-surface-card border border-border-subtle rounded-lg p-space-lg space-y-space-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-sm border-b border-border-subtle gap-space-sm">
                  <div>
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-accent-acid text-lg">quiz</span>
                      <h2 className="font-headline-sm text-headline-sm text-text-ivory">قائمة الأسئلة الاستقصائية المصنفة للّقاء</h2>
                    </div>
                  </div>
                </div>
                <div className="space-y-space-xs divide-y divide-border-subtle">
                  {project.questions.map((q: any) => (
                    <div key={q.id} className="pt-space-sm pb-space-xs flex items-start justify-between gap-space-md group">
                      <div className="space-y-1">
                        <div className="flex items-center gap-space-xs">
                          <span className="font-caption-code text-caption-code px-1.5 py-0.5 rounded bg-surface-elevated text-text-muted border border-border-subtle">{q.category}</span>
                        </div>
                        <p className="font-body-dense text-body-dense text-text-ivory">
                          «{q.question}»
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Source Ledger */}
            <section className="w-full bg-surface-card border border-border-subtle rounded-lg p-space-lg space-y-space-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-sm border-b border-border-subtle gap-space-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-accent-acid text-lg">folder_shared</span>
                  <h2 className="font-headline-sm text-headline-sm text-text-ivory">سجل المصادر المفهرس</h2>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right font-caption-code text-caption-code border-collapse">
                  <thead>
                    <tr className="border-b border-border-subtle text-text-dim">
                      <th className="py-space-xs px-space-sm font-semibold">م</th>
                      <th className="py-space-xs px-space-sm font-semibold">العنوان</th>
                      <th className="py-space-xs px-space-sm font-semibold">النوع</th>
                      <th className="py-space-xs px-space-sm font-semibold">الموثوقية</th>
                      <th className="py-space-xs px-space-sm font-semibold">الرابط</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle text-text-muted">
                    {sources.map((s: any, idx: number) => (
                      <tr key={s.id} className="hover:bg-surface-elevated/60 transition-colors">
                        <td className="py-space-sm px-space-sm text-accent-acid font-bold">[{idx + 1}]</td>
                        <td className="py-space-sm px-space-sm text-text-ivory font-medium line-clamp-1">{s.title}</td>
                        <td className="py-space-sm px-space-sm"><span className="px-1.5 py-0.5 rounded bg-surface-elevated text-text-muted border border-border-subtle">{s.type}</span></td>
                        <td className="py-space-sm px-space-sm"><span className="text-badge-fact-text font-bold">{s.reliability}</span></td>
                        <td className="py-space-sm px-space-sm"><a className="text-accent-acid hover:underline flex items-center gap-0.5" href={s.url} target="_blank"><span className="material-symbols-outlined text-xs">open_in_new</span> فتح</a></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
