import SpotCard from './SpotCard'

export default function ParkingMap({ spots, onSelectSpot }) {
  const autos    = spots.filter(s => s.type === 'auto')
  const motos    = spots.filter(s => s.type === 'moto')
  const disabili = spots.filter(s => s.type === 'disabile')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <Zone label="🚗  Auto" sublabel="Posti 1–10" spots={autos}    color="#60a5fa" onSelect={onSelectSpot} />
      <Zone label="🏍️  Moto" sublabel="Posti 11–15" spots={motos}   color="#f59e0b" onSelect={onSelectSpot} />
      <Zone label="♿  Disabili" sublabel="Posti 16–20" spots={disabili} color="#a78bfa" onSelect={onSelectSpot} />
    </div>
  )
}

function Zone({ label, sublabel, spots, color, onSelect }) {
  return (
    <div style={{
      background: '#16161a',
      border: '1px solid #2a2a32',
      borderRadius: '16px',
      padding: '20px 24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
        <span style={{ fontSize: '14px', fontWeight: 700, color: '#e8e8ea' }}>{label}</span>
        <span style={{ fontSize: '11px', color: '#4a4a55', fontFamily: 'DM Mono, monospace' }}>{sublabel}</span>
        <span style={{
          marginLeft: 'auto', fontSize: '11px', fontWeight: 600,
          color, fontFamily: 'DM Mono, monospace',
        }}>
          {spots.filter(s => !s.occupied).length}/{spots.length} liberi
        </span>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '12px',
      }}>
        {spots.map(s => <SpotCard key={s.id} spot={s} onSelect={onSelect} />)}
      </div>
    </div>
  )
}