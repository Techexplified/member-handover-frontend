import React from 'react';

// Two people icon matching Trello Member Handover header
export function UsersIcon({ className = "w-6 h-6", color = "#0c66e4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" fill={color} stroke="none" />
      <circle cx="9" cy="7" r="4" fill={color} stroke="none" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

// Close X icon
export function CloseIcon({ className = "w-5 h-5", color = "#626f86" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// Search magnifying glass
export function SearchIcon({ className = "w-4 h-4", color = "#626f86", size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ flexShrink: 0 }}
    >
      <circle cx="11" cy="11" r="7.5" />
      <line x1="21" y1="21" x2="16.5" y2="16.5" />
    </svg>
  );
}

// Chevron Down
export function ChevronDownIcon({ className = "w-3.5 h-3.5", color = "#626f86" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// Chevron Left
export function ChevronLeftIcon({ className = "w-3.5 h-3.5", color = "#626f86" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

// Chevron Right
export function ChevronRightIcon({ className = "w-3.5 h-3.5", color = "#626f86" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// Card outline with list lines (used next to card name in Image 2 & Image 4)
export function CardOutlineIcon({ className = "w-4 h-4", color = "#626f86" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <line x1="7" y1="9" x2="17" y2="9" />
      <line x1="7" y1="13" x2="13" y2="13" />
    </svg>
  );
}

// Checkmark icon
export function CheckIcon({ className = "w-3.5 h-3.5", color = "#ffffff", strokeWidth = 3 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// Arrow Right (Used in From -> To)
export function ArrowRightIcon({ className = "w-4 h-4", color = "#626f86" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

// Credit card / Trello card icon (Image 4)
export function CardIcon({ className = "w-4 h-4", color = "#626f86" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2" y="5" width="20" height="14" rx="2.5" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}

// Boards / Columns icon (Image 4)
export function BoardsIcon({ className = "w-4 h-4", color = "#626f86" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="4" y="4" width="6" height="16" rx="2" />
      <rect x="14" y="4" width="6" height="16" rx="2" />
    </svg>
  );
}

// Lists icon (Image 4)
export function ListsIcon({ className = "w-4 h-4", color = "#626f86" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <circle cx="4" cy="6" r="1.5" fill={color} stroke="none" />
      <circle cx="4" cy="12" r="1.5" fill={color} stroke="none" />
      <circle cx="4" cy="18" r="1.5" fill={color} stroke="none" />
    </svg>
  );
}

// Warning Triangle (Image 4)
export function WarningTriangleIcon({ className = "w-5 h-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="#ffab00"
      className={className}
    >
      <path
        d="M12 2.5L1.5 20.5C1.15 21.1 1.55 21.8 2.25 21.8H21.75C22.45 21.8 22.85 21.1 22.5 20.5L12 2.5Z"
        fill="#ff991f"
      />
      <rect x="11" y="9" width="2" height="5.5" rx="1" fill="#172b4d" />
      <circle cx="12" cy="17.5" r="1.25" fill="#172b4d" />
    </svg>
  );
}

// Clock / Pending icon (Image 5)
export function ClockPendingIcon({ className = "w-5 h-5", color = "#626f86" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 15" />
    </svg>
  );
}

// Alert / Exclamation in circle icon (Image 5)
export function AlertCircleIcon({ className = "w-5 h-5", color = "#626f86" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <circle cx="12" cy="16" r="1" fill={color} stroke="none" />
    </svg>
  );
}

// Info Circle "ℹ" (Image 3 & Image 5)
export function InfoCircleIcon({ className = "w-5 h-5", color = "#0c66e4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <circle cx="12" cy="8.5" r="1" fill={color} stroke="none" />
    </svg>
  );
}

// Trello Logo
export function TrelloIcon({ className = "w-5 h-5", color = "#ffffff" }) {
  return (
    <svg viewBox="0 0 24 24" fill={color} className={className}>
      <rect x="2" y="2" width="20" height="20" rx="3.5" fill={color} />
      <rect x="5.5" y="5.5" width="5.5" height="11" rx="1.5" fill="#0052cc" />
      <rect x="13" y="5.5" width="5.5" height="7.5" rx="1.5" fill="#0052cc" />
    </svg>
  );
}

// Filter Icon
export function FilterIcon({ className = "w-4 h-4", color = "currentColor" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

// Calendar Icon
export function CalendarIcon({ className = "w-3.5 h-3.5", color = "currentColor" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

// Check Square (Checklist)
export function CheckSquareIcon({ className = "w-3.5 h-3.5", color = "currentColor" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

// Message Square (Comments)
export function MessageSquareIcon({ className = "w-3.5 h-3.5", color = "currentColor" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

// Bell Icon
export function BellIcon({ className = "w-4 h-4", color = "currentColor" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

// Empty state cards illustration with magnifying glass and sparkles (Image 3)
export function NoCardsIllustration({ className = "w-36 h-28" }) {
  return (
    <div className={`relative flex items-center justify-center ${className} mx-auto`}>
      <svg viewBox="0 0 160 120" fill="none" className="w-full h-full">
        {/* Sparkle rays */}
        <line x1="80" y1="12" x2="80" y2="20" stroke="#79b2f2" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="68" y1="18" x2="73" y2="24" stroke="#79b2f2" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="92" y1="18" x2="87" y2="24" stroke="#79b2f2" strokeWidth="2.5" strokeLinecap="round" />

        {/* Back Card */}
        <rect x="42" y="32" width="68" height="48" rx="8" fill="#e2e8f0" />
        <rect x="50" y="42" width="28" height="4" rx="2" fill="#cbd5e1" />
        <rect x="50" y="50" width="46" height="4" rx="2" fill="#cbd5e1" />

        {/* Front Card */}
        <rect x="30" y="42" width="76" height="52" rx="8" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
        <rect x="40" y="54" width="24" height="5" rx="2.5" fill="#cbd5e1" />
        <rect x="40" y="64" width="50" height="5" rx="2.5" fill="#cbd5e1" />
        <rect x="40" y="74" width="36" height="5" rx="2.5" fill="#cbd5e1" />

        {/* Magnifying Glass with soft blue background circle */}
        <circle cx="106" cy="74" r="22" fill="#e9f2ff" />
        <circle cx="105" cy="72" r="10" stroke="#0c66e4" strokeWidth="3" fill="none" />
        <line x1="112" y1="79" x2="120" y2="87" stroke="#0c66e4" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}
