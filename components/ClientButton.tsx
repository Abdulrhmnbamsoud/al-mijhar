'use client';

import React from 'react';

interface ClientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  actionType: 'print' | 'cast' | 'alert' | 'copy';
  alertMessage?: string;
  copyText?: string;
  children: React.ReactNode;
}

export default function ClientButton({ actionType, alertMessage, copyText, children, ...props }: ClientButtonProps) {
  const [toastMsg, setToastMsg] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (actionType === 'print') {
      window.print();
    } else if (actionType === 'copy') {
      if (copyText) {
        navigator.clipboard.writeText(copyText);
        showToast('تم النسخ بنجاح!');
      }
    } else if (actionType === 'alert' && alertMessage) {
      showToast(alertMessage);
    } else if (actionType === 'cast') {
      showToast('جاري البحث عن شاشات العرض القريبة للربط...');
    }
    
    if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <div className="relative inline-block">
      <button 
        onClick={handleClick} 
        {...props} 
        className={`${props.className} active:scale-95 transition-transform duration-200`}
      >
        {children}
      </button>
      {toastMsg && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-[#1b1d20] text-white text-[10px] px-3 py-1.5 rounded shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300 z-50">
          {toastMsg}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1b1d20]"></div>
        </div>
      )}
    </div>
  );
}
