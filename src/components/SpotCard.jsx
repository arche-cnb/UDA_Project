import { useState } from 'react'

const CONFIG = {
  auto: {
    free:     { bg: 'rgba(16,185,129,0.1)',  border: '#10b981', text: '#10b981', borderStyle: 'solid' },
    occupied: { bg: 'rgba(239,68,68,0.08)', border: '#ef4444', text: '#ef4444', borderStyle: 'solid' },
    accent: '#60a5fa',
  },
  moto: {
    free:     { bg: 'rgba(16,185,129,0.1)',  border: '#10b981', text: '#10b981', borderStyle: 'dashed' },
    occupied: { bg: 'rgba(239,68,68,0.08)', border: '#ef4444', text: '#ef4444', borderStyle: 'dashed' },
    accent: '#f59e0b',
  },
  disabile: {
    free:     { bg: 'rgba(16,185,129,0.1)',  border: '#10b981', text: '#10b981', borderStyle: 'dotted' },
    occupied: { bg: 'rgba(239,68,68,0.08)', border: '#ef4444', text: '#ef4444', borderStyle: 'dotted' },
    accent: '#a78bfa',
  },
}

const ICONS = {
  auto: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="9" width="18" height="9" rx="2"/>
      <path d="M6 9l1.5-5h9L18 9"/>
      <circle cx="7.5" cy="18.5" r="1.5"/>
      <circle cx="16.5" cy="18.5" r="1.5"/>
    </svg>
  ),
  moto: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="5.5" cy="17.5" r="3.5"/>
      <circle cx="18.5" cy="17.5" r="3.5"/>
      <path d="M15 6h-3l-2 5.5M8 17.5h10V13l-4-2-1-5h4"/>
    </svg>
  ),
  disabile: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="4" r="2"/>
      <path d="M9 20l2-7H7l3-7h8l-2 7h4l-3 7"/>
    </svg>
  ),
}

export default function SpotCard({ spot, onSelect }) {
  const [hovered, setHovered] = useState(false)
  const isFree  = !spot.occupied
  const cfg     = CONFIG[spot.type]
  const state   = isFree ? cfg.free : cfg.occupied

  const scale = hovered && isFree ? 'scale(1.05) translateY(-3px)' : 'scale(1)'

  return (
    <div
      role={isFree ? 'button' : undefined}
      tabIndex={isFree ? 0 : undefined}
      aria-label={`Posto ${spot.id} ${isFree ? 'libero' : 'occupato'}`}
      onClick={() => isFree && onSelect(spot)}
      onKeyDown={e => e.key === 'Enter' && isFree && onSelect(spot)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: hovered && isFree ? 'rgba(16,185,129,0.16)' : state.bg,
        border: `2px ${state.borderStyle} ${state.border}`,
        borderRadius: '14px',
        padding: '16px 8px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '8px',
        cursor: isFree ? 'pointer' : 'default',
        transform: scale,
        transition: 'transform 150ms ease, background 150ms ease, box-shadow 150ms ease',
        boxShadow: hovered && isFree ? `0 8px 24px ${state.border}30` : 'none',
        opacity: isFree ? 1 : 0.55,
        userSelect: 'none',
        aspectRatio: '1',
      }}
    >
      {/* Numero */}
      <span style={{
        fontFamily: 'DM Mono, monospace',
        fontSize: '11px', fontWeight: 500,
        color: state.text, opacity: 0.8,
      }}>
        #{spot.id}
      </span>

      {/* Icona */}
      <span style={{ color: state.text }}>
        {ICONS[spot.type]}
      </span>

      {/* Badge */}
      <span style={{
        fontSize: '10px', fontWeight: 600,
        padding: '2px 8px', borderRadius: '999px',
        background: `${cfg.accent}18`,
        color: cfg.accent,
        textTransform: 'uppercase', letterSpacing: '.04em',
      }}>
        {spot.type === 'disabile' ? '♿' : spot.type}
      </span>

      {/* Tooltip */}
      {hovered && isFree && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 8px)',
          left: '50%', transform: 'translateX(-50%)',
          background: '#1c1c22', border: '1px solid #2a2a32',
          borderRadius: '8px', padding: '6px 10px',
          fontSize: '11px', whiteSpace: 'nowrap',
          color: '#e8e8ea', boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          pointerEvents: 'none', zIndex: 10,
          animation: 'fadeIn 100ms ease',
        }}>
          Prenota posto #{spot.id}
        </div>
      )}
    </div>
  )
}