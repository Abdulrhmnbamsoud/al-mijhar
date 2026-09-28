'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

export default function GlobalAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Extract projectId if we are in a project route (e.g., /research/123/desk)
  const pathParts = pathname.split('/');
  const projectId = pathParts[1] === 'research' ? pathParts[2] : null;

  const getHref = (base: string) => {
    if (!projectId) return base === '/' ? '/' : '#'; // Disabled or fallback
    return `/research/${projectId}${base}`;
  };

  const navItems = [
    { name: 'بث مباشر - استوديو العزل', href: getHref('/studio'), activePath: '/studio' },
    { name: 'مفكرة المحاور والتلقين', href: getHref('/desk'), activePath: '/desk' }, // using desk as teleprompter for now
    { name: 'إعداد الحلقة والمصادر', href: getHref('/desk'), activePath: '/desk' },
    { name: 'مشغل الفصول الصوتية', href: getHref('/player'), activePath: '/player' },
    { name: 'أرشيف الحلقات', href: '/', activePath: '/', exact: true },
  ];

  if (pathname.includes('/studio')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f8f8f5] text-[#1b1d20] flex flex-col font-sans" dir="rtl">
      
      {/* Top Header */}
      <header className="h-14 bg-[#1b1d20] text-white flex items-center justify-between px-6 sticky top-0 z-40 border-b border-[#282a2f]">
        
        {/* Right - Logo */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="font-bold text-sm leading-none flex items-center gap-2">
              بودكاست المجهر
            </span>
            <span className="text-[10px] text-gray-400 mt-1">استوديو الحوار الوثائقي السعودي</span>
          </div>
        </div>

        {/* Center - Top Nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item, idx) => {
            const isActive = item.exact ? pathname === item.activePath : pathname.includes(item.activePath);
            return (
              <Link 
                key={idx} 
                href={item.href}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive ? 'text-[#a1824a]' : 'text-gray-400 hover:text-white'
                }`}
              >
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#a1824a]"></span>}
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Left - Status & Profile */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-[#282a2f] px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
            شاشة العزل متصل
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden border border-gray-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-sm text-gray-300">person</span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-3.5rem)]">
        
        {/* Right Sidebar */}
        <aside className="w-64 bg-[#1b1d20] flex-shrink-0 flex flex-col overflow-y-auto">
          <div className="p-6">
            <h2 className="text-[10px] text-gray-500 mb-6 font-semibold tracking-wider">غرفة التحرير الصوتي</h2>
            
            <div className="mb-2">
              <h3 className="text-white font-bold text-xl mb-4">سير إنتاج الحلقة</h3>
            </div>

            <nav className="flex flex-col space-y-1">
              {navItems.slice(1).map((item, idx) => {
                const isActive = item.exact ? pathname === item.activePath : pathname.includes(item.activePath);
                return (
                  <Link 
                    key={idx} 
                    href={item.href}
                    className={`flex items-center gap-3 py-3 transition-all ${
                      isActive 
                        ? 'text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto relative bg-[#f8f8f5]">
          {children}
        </main>
        
      </div>
    </div>
  );
}
