import { useState, useEffect } from 'react'
import { supabase }  from '../lib/supabase'
import { calcPrice } from '../lib/pricing'

const inputStyle = {
  width: '100%', padding: '10px 14px',
  background: '#1c1c22', border: '1.5px solid #2a2a32',
  borderRadius: '10px', color: '#e8e8ea', fontSize: '13px',
  outline: 'none', transition: 'border-color 150ms, box-shadow 150ms',
  fontFamily: 'DM Sans, sans-serif',
}

const labelStyle = {
  fontSize: '11px', fontWeight: 600,
  color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.06em',
  marginBottom: '6px', display: 'block',
}

const typeAccent = { auto: '#60a5fa', moto: '#f59e0b', disabile: '#a78bfa' }
const typeLabel  = { auto: '🚗 Auto', moto: '🏍️ Moto', disabile: '♿ Disabili' }
const typeVehicle = { auto: 'auto', moto: 'moto', disabile: 'auto' }

export default function BookingModal({ spot, onClose, onBooked, user }) {
  const accent = typeAccent[spot.type]

  const [form, setForm] = useState({
    nome: user ? '' : '',
    cognome: '',
    arrival_time: new Date().toISOString().slice(0, 16),
    duration_h: 1,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState(null)
  const [pricing,    setPricing]    = useState({ total: 3, period: 'giorno' })
  const [focusField, setFocusField] = useState(null)

  useEffect(() => {
    if (form.arrival_time && form.duration_h > 0)
      setPricing(calcPrice(form.arrival_time, Number(form.duration_h)))
  }, [form.arrival_time, form.duration_h])

  useEffect(() => {
    const fn = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const getInputStyle = field => ({
    ...inputStyle,
    borderColor: focusField === field ? accent : '#2a2a32',
    boxShadow: focusField === field ? `0 0 0 3px ${accent}20` : 'none',
  })

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) { setError('Devi essere connesso per prenotare.'); return }
    if (!form.nome.trim() || !form.cognome.trim()) { setError('Compila nome e cognome.'); return }
    setSubmitting(true); setError(null)
    try {
      const { error: bErr } = await supabase.from('bookings').insert({
        spot_id:      spot.id,
        nome:         form.nome.trim(),
        cognome:      form.cognome.trim(),
        vehicle_type: typeVehicle[spot.type],
        is_disabled:  spot.type === 'disabile',
        arrival_time: new Date(form.arrival_time).toISOString(),
        duration_h:   Number(form.duration_h),
        total_price:  pricing.total,
        period:       pricing.period,
        user_id:      user.id,
      })
      if (bErr) throw bErr
      await supabase.from('spots').update({ occupied: true }).eq('id', spot.id)
      onBooked()
    } catch (err) {
      setError(err.message); setSubmitting(false)
    }
  }

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px', animation: 'fadeIn 150ms ease',
      }}
    >
      <div style={{
        background: '#16161a', border: '1px solid #2a2a32',
        borderRadius: '20px', padding: '32px',
        width: '100%', maxWidth: '420px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        animation: 'slideUp 200ms cubic-bezier(0.16,1,0.3,1)',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: `${accent}18`, border: `1px solid ${accent}35`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px',
            }}>
              {spot.type === 'auto' ? '🚗' : spot.type === 'moto' ? '🏍️' : '♿'}
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#e8e8ea', lineHeight: 1 }}>
                Prenota Posto #{spot.id}
              </h2>
              <p style={{ fontSize: '11px', color: accent, marginTop: '4px', fontWeight: 600 }}>
                {typeLabel[spot.type]}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: '32px', height: '32px', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#1c1c22', border: '1px solid #2a2a32',
            color: '#6b7280', cursor: 'pointer',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

            {/* Nome */}
            <div>
              <label style={labelStyle}>Nome</label>
              <input
                style={getInputStyle('nome')} type="text" placeholder="Mario" required
                value={form.nome} onChange={e => set('nome', e.target.value)}
                onFocus={() => setFocusField('nome')} onBlur={() => setFocusField(null)}
              />
            </div>

            {/* Cognome */}
            <div>
              <label style={labelStyle}>Cognome</label>
              <input
                style={getInputStyle('cognome')} type="text" placeholder="Rossi" required
                value={form.cognome} onChange={e => set('cognome', e.target.value)}
                onFocus={() => setFocusField('cognome')} onBlur={() => setFocusField(null)}
              />
            </div>

            {/* Orario arrivo */}
            <div>
              <label style={labelStyle}>Orario arrivo</label>
              <input
                style={getInputStyle('arrival')} type="datetime-local" required
                value={form.arrival_time} onChange={e => set('arrival_time', e.target.value)}
                onFocus={() => setFocusField('arrival')} onBlur={() => setFocusField(null)}
              />
            </div>

            {/* Durata */}
            <div>
              <label style={labelStyle}>Durata (ore)</label>
              <input
                style={getInputStyle('duration')} type="number" min="0.5" max="72" step="0.5" required
                value={form.duration_h} onChange={e => set('duration_h', e.target.value)}
                onFocus={() => setFocusField('duration')} onBlur={() => setFocusField(null)}
              />
            </div>

            {/* Prezzo */}
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{
                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: '12px', padding: '14px 18px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#10b981' }}>Totale stimato</p>
                  <p style={{ fontSize: '11px', color: 'rgba(16,185,129,0.6)', marginTop: '3px' }}>
                    {pricing.period === 'giorno' ? '£3/h · 06:00–22:00' :
                     pricing.period === 'sera'   ? '£1/h · 22:00–06:00' : '£3/h + £1/h misto'}
                  </p>
                </div>
                <span style={{
                  fontSize: '28px', fontWeight: 700, color: '#10b981',
                  fontFamily: 'DM Mono, monospace',
                }}>
                  £{pricing.total.toFixed(2)}
                </span>
              </div>
            </div>

          </div>

          {/* Errore */}
          {error && (
            <div style={{
              marginTop: '12px', padding: '10px 14px',
              background: '#2d0d0d', border: '1px solid #7f1d1d',
              borderRadius: '8px', fontSize: '12px', color: '#fca5a5',
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Bottoni */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: '11px 0', borderRadius: '10px',
              background: '#1c1c22', border: '1px solid #2a2a32',
              color: '#6b7280', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
            }}>
              Annulla
            </button>
            <button type="submit" disabled={submitting} style={{
              flex: 1, padding: '11px 0', borderRadius: '10px',
              background: submitting ? '#065f46' : 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none', color: '#fff',
              fontSize: '13px', fontWeight: 700,
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
              fontFamily: 'DM Sans, sans-serif',
            }}>
              {submitting ? 'Salvataggio…' : '✓ Conferma'}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}