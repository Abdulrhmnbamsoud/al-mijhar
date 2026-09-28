'use client';
import React from 'react';

interface ClientImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc: string;
}

export default function ClientImage({ fallbackSrc, src, ...props }: ClientImageProps) {
  return (
    <img
      src={src}
      {...props}
      onError={(e) => {
        e.currentTarget.src = fallbackSrc;
      }}
    />
  );
}
