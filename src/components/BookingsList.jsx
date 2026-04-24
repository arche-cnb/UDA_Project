import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function BookingsList({ bookings, spots, onRefresh, user }) {
  const [deletingId, setDeletingId] = useState(null)
  const [confirmId,  setConfirmId]  = useState(null)

  const spotType = id => spots.find(s => s.id === id)?.type ?? '—'

  async function handleDelete(booking) {
    if (!user) { alert('Devi essere connesso per eliminare.'); return }
    if (user.role !== 'admin' && booking.user_id !== user.id) { alert('Non hai i permessi per eliminare questa prenotazione.'); return }
    setDeletingId(booking.id)
    const { error: delErr } = await supabase.from('bookings').delete().eq('id', booking.id)
    if (delErr) { alert('Errore: ' + delErr.message); setDeletingId(null); setConfirmId(null); return }
    const { data: remaining } = await supabase.from('bookings').select('id').eq('spot_id', booking.spot_id)
    if (!remaining || remaining.length === 0)
      await supabase.from('spots').update({ occupied: false }).eq('id', booking.spot_id)
    setDeletingId(null); setConfirmId(null); onRefresh()
  }

  if (!bookings.length) return (
    <p style={{ fontSize: '12px', color: '#4a4a55', textAlign: 'center', padding: '32px 0' }}>
      Nessuna prenotazione.
    </p>
  )

  const typeColor = { auto: '#60a5fa', moto: '#f59e0b', disabile: '#a78bfa' }
  const periodColor = { giorno: '#f59e0b', sera: '#a78bfa', misto: '#10b981' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {bookings.map(b => {
        const tc = typeColor[spotType(b.spot_id)] ?? '#6b7280'
        const pc = periodColor[b.period] ?? '#6b7280'
        return (
          <div key={b.id} style={{
            background: '#1c1c22', border: '1px solid #2a2a32',
            borderRadius: '12px', padding: '14px',
            display: 'flex', flexDirection: 'column', gap: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#e8e8ea' }}>
                {b.nome} {b.cognome} {b.is_disabled ? '♿' : ''}
              </span>
              {confirmId !== b.id && (
                <button
                  onClick={() => setConfirmId(b.id)}
                  aria-label="Elimina"
                  style={{
                    width: '24px', height: '24px', borderRadius: '6px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'transparent', border: '1px solid transparent',
                    color: '#4a4a55', cursor: 'pointer', flexShrink: 0,
                    transition: 'all 150ms',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#2d0d0d'; e.currentTarget.style.borderColor = '#7f1d1d'; e.currentTarget.style.color = '#ef4444'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = '#4a4a55'; }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
              <Badge label={`#${b.spot_id}`} color="#6b7280" />
              <Badge label={spotType(b.spot_id)} color={tc} />
              <Badge label={b.vehicle_type} color={tc} />
              <Badge label={b.period} color={pc} />
              <span style={{ marginLeft: 'auto', fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: '13px', color: '#10b981' }}>
                £{Number(b.total_price).toFixed(2)}
              </span>
            </div>

            <div style={{ fontSize: '11px', color: '#4a4a55', fontFamily: 'DM Mono, monospace' }}>
              {new Date(b.arrival_time).toLocaleString('it-IT', {
                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
              })} · {b.duration_h}h
            </div>

            {confirmId === b.id && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button disabled={deletingId === b.id} onClick={() => handleDelete(b)} style={{
                  flex: 1, fontSize: '11px', fontWeight: 600, padding: '6px 0',
                  borderRadius: '8px', border: '1px solid #7f1d1d',
                  background: '#2d0d0d', color: '#ef4444', cursor: 'pointer',
                }}>
                  {deletingId === b.id ? '…' : 'Sì, elimina'}
                </button>
                <button onClick={() => setConfirmId(null)} style={{
                  flex: 1, fontSize: '11px', padding: '6px 0',
                  borderRadius: '8px', border: '1px solid #2a2a32',
                  background: '#1c1c22', color: '#6b7280', cursor: 'pointer',
                }}>
                  No
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function Badge({ label, color }) {
  return (
    <span style={{
      fontSize: '10px', fontWeight: 600, padding: '2px 8px',
      borderRadius: '999px', background: `${color}18`,
      color, textTransform: 'capitalize',
    }}>
      {label}
    </span>
  )
}