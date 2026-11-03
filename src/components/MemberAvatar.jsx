import React, { useState } from 'react';

export function MemberAvatar({ member, size = 40, className = "" }) {
  const [imageError, setImageError] = useState(false);

  if (!member) {
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          backgroundColor: '#dfe1e6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#626f86',
          fontSize: `${Math.round(size * 0.4)}px`,
          fontWeight: 600,
          flexShrink: 0,
        }}
        className={className}
      >
        ?
      </div>
    );
  }

  // If photo avatar and not errored
  if (member.avatarType === 'photo' && member.avatarUrl && !imageError) {
    return (
      <img
        src={member.avatarUrl}
        alt={member.name}
        onError={() => setImageError(true)}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
        }}
        className={className}
      />
    );
  }

  // Fallback or Initials Avatar
  const initials = member.initials || member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const bg = member.bg || '#dbeafe';
  const color = member.color || '#1e40af';

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: bg,
        color: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${Math.round(size * 0.38)}px`,
        fontWeight: 600,
        letterSpacing: '0.02em',
        flexShrink: 0,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)',
        userSelect: 'none',
      }}
      className={className}
    >
      {initials}
    </div>
  );
}

