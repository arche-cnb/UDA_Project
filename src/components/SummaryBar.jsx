export default function SummaryBar({ summary }) {
  const cards = [
    {
      label: 'Totali liberi',
      value: summary.liberi,
      sub: `su ${summary.totale} posti`,
      accent: '#10b981',
      bg: 'rgba(16,185,129,0.08)',
      border: 'rgba(16,185,129,0.2)',
    },
    {
      label: 'Auto',
      value: summary.auto,
      sub: 'su 10',
      accent: '#60a5fa',
      bg: 'rgba(96,165,250,0.08)',
      border: 'rgba(96,165,250,0.2)',
    },
    {
      label: 'Moto',
      value: summary.moto,
      sub: 'su 5',
      accent: '#f59e0b',
      bg: 'rgba(245,158,11,0.08)',
      border: 'rgba(245,158,11,0.2)',
    },
    {
      label: 'Disabili',
      value: summary.disabili,
      sub: 'su 5',
      accent: '#a78bfa',
      bg: 'rgba(167,139,250,0.08)',
      border: 'rgba(167,139,250,0.2)',
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <p style={{
        fontSize: '10px', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '.1em',
        color: '#4a4a55', marginBottom: '4px',
      }}>
        Disponibilità
      </p>
      {cards.map(c => (
        <div key={c.label} style={{
          background: c.bg,
          border: `1px solid ${c.border}`,
          borderRadius: '12px',
          padding: '14px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em' }}>
              {c.label}
            </p>
            <p style={{ fontSize: '11px', color: '#374151', marginTop: '2px', color: c.accent, opacity: 0.7 }}>
              {c.sub}
            </p>
          </div>
          <span style={{
            fontSize: '32px', fontWeight: 700, lineHeight: 1,
            color: c.accent, fontFamily: 'DM Mono, monospace',
          }}>
            {c.value}
          </span>
        </div>
      ))}
    </div>
  )
}