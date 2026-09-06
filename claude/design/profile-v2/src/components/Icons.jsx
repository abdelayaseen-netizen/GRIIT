// Lucide-style line icons, stroke 1.6, round caps. No emoji anywhere in this product.
import React from 'react';

const Svg = ({ size = 20, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);

export const ShareIcon = () => (<Svg size={18}><path d="M12 16V4" /><path d="M8 8l4-4 4 4" /><path d="M5 14v5a1 1 0 001 1h12a1 1 0 001-1v-5" /></Svg>);
export const GearIcon = () => (<Svg size={18}><circle cx="12" cy="12" r="3" /><path d="M12 3v2M12 19v2M4.6 7.5l1.7 1M17.7 15.5l1.7 1M4.6 16.5l1.7-1M17.7 8.5l1.7-1M3 12h2M19 12h2" /></Svg>);
export const UserIcon = () => (<Svg><path d="M20 21a8 8 0 00-16 0" /><circle cx="12" cy="7" r="4" /></Svg>);
export const BellIcon = () => (<Svg><path d="M18 16V11a6 6 0 10-12 0v5l-2 3h16l-2-3" /><path d="M10 22h4" /></Svg>);
export const EyeIcon = () => (<Svg><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6" /><circle cx="12" cy="12" r="3" /></Svg>);
export const CardIcon = () => (<Svg><path d="M3 7h18v11a1 1 0 01-1 1H4a1 1 0 01-1-1V7z" /><path d="M3 11h18" /><path d="M7 15h4" /></Svg>);
export const InfoIcon = () => (<Svg><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></Svg>);
export const LockIcon = () => (<Svg size={22}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></Svg>);
export const MessageIcon = () => (<Svg size={18}><path d="M21 12a8 8 0 01-8 8H8l-4 3v-5.5A8 8 0 1121 12z" /></Svg>);
