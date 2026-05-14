/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = '', size = 32 }: LogoProps) {
  // SVG representation of the stylized "A" logo provided by the user
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="currentColor" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M20 90L50 10L80 90H70L50 35L30 90H20ZM45 60L55 60L65 75H35L45 60Z" 
        fillRule="evenodd" 
      />
      {/* 
        The stylized bars on the right of the A from the reference 
      */}
      <path d="M55 30H85V38H58L55 30Z" />
      <path d="M58 45H85V53H61L58 45Z" />
      <path d="M62 60H85V68H65L62 60Z" />
    </svg>
  );
}
