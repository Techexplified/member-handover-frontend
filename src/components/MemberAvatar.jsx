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
  
  const PALETTES = [
    { bg: '#eae6ff', color: '#403294' }, // soft purple
    { bg: '#dcfff1', color: '#216e4e' }, // soft green
    { bg: '#ffeceb', color: '#ae2e24' }, // soft coral
    { bg: '#deebff', color: '#0747a6' }, // soft blue
    { bg: '#e6fcff', color: '#006644' }, // soft teal
    { bg: '#fff0b3', color: '#172b4d' }, // soft gold
  ];
  let charCode = 0;
  for (let i = 0; i < (member.name || '').length; i++) {
    charCode += member.name.charCodeAt(i);
  }
  const chosen = PALETTES[charCode % PALETTES.length];
  const bg = member.bg || chosen.bg;
  const color = member.color || chosen.color;

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

