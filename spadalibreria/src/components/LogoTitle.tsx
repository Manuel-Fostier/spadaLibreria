'use client';

import React from 'react';

interface LogoTitleProps {
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

export default function LogoTitle({
  className = '',
  titleClassName = 'text-sm font-bold tracking-tight text-gray-900',
  subtitleClassName = 'text-xs text-gray-600',
}: LogoTitleProps) {
  return (
    <div className={`flex flex-col justify-center ${className}`.trim()}>
      <span className={titleClassName}>SPADA LIBRERIA</span>
      <span className={subtitleClassName}>platform v1.0</span>
    </div>
  );
}
