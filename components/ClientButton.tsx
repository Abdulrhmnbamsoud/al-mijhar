'use client';

import React from 'react';

interface ClientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  actionType: 'print' | 'cast' | 'alert' | 'copy';
  alertMessage?: string;
  copyText?: string;
  children: React.ReactNode;
}

export default function ClientButton({ actionType, alertMessage, copyText, children, ...props }: ClientButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (actionType === 'print') {
      window.print();
    } else if (actionType === 'copy') {
      if (copyText) {
        navigator.clipboard.writeText(copyText);
        alert('تم النسخ بنجاح!');
      }
    } else if (actionType === 'alert' && alertMessage) {
      alert(alertMessage);
    } else if (actionType === 'cast') {
      alert('جاري البحث عن شاشات العرض القريبة للربط...');
    }
    
    if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <button onClick={handleClick} {...props}>
      {children}
    </button>
  );
}
