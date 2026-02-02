import React from 'react';

export default function LoginIllustration() {
  return (
    <svg
      width="420"
      height="320"
      viewBox="0 0 420 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
    >
      <rect x="0" y="0" width="420" height="320" rx="24" fill="url(#bg)" />
      <defs>
        <linearGradient id="bg" x1="0" x2="1">
          <stop offset="0" stopColor="#E6F4FF" />
          <stop offset="1" stopColor="#F8FAFF" />
        </linearGradient>
      </defs>

      {/* Book stack */}
      <rect x="60" y="160" width="260" height="20" rx="3" fill="#8FB3FF" />
      <rect x="70" y="140" width="240" height="18" rx="3" fill="#6D9EFF" />
      <rect x="80" y="122" width="220" height="16" rx="3" fill="#4B86FF" />

      {/* Graduation cap */}
      <path d="M270 82 L210 58 L150 82 L210 106 Z" fill="#0B61FF" />
      <rect x="204" y="102" width="12" height="30" rx="2" fill="#0B61FF" transform="translate(-3,0) rotate(-6 204 102)" />

      {/* Character */}
      <circle cx="140" cy="84" r="28" fill="#FFDDA6" />
      <path d="M120 120 C120 110 160 110 160 120" stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Decorative shapes */}
      <circle cx="340" cy="40" r="10" fill="#A5B7FF" opacity="0.9" />
      <circle cx="320" cy="280" r="18" fill="#DDEBFF" />
      <rect x="20" y="20" width="16" height="6" rx="2" fill="#C9DFFF" />
    </svg>
  );
}
