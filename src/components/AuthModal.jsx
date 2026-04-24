import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthModal({ onClose, onLogin }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [adminCode, setAdminCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      const user = data.user
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      onLogin({ id: user.id, email: user.email, role: profile?.role ?? 'user' })
      onClose()
    } catch (err) {
      setError(err.message || 'Errore durante il login')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignup(e) {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({ email, password })
      if (signUpErr) throw signUpErr

      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
      if (signInErr) {
        if (!signUpData?.user) {
          setError('Registrazione effettuata. Controlla la tua email per attivare l\'account.')
          setLoading(false)
          return
        }
      }

      const user = signInData?.user ?? signUpData?.user
      if (!user) {
        setError('Registrazione completata. Controlla la tua email per attivare l\'account.')
        setLoading(false)
        return
      }

      const role = (adminCode && adminCode === import.meta.env.VITE_ADMIN_CODE) ? 'admin' : 'user'

      // Update sovrascrive il ruolo creato dal trigger
      await supabase.from('profiles').update({ role }).eq('id', user.id)

      onLogin({ id: user.id, email: user.email, role })
      onClose()
    } catch (err) {
      setError(err.message || 'Errore durante la registrazione')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px', background: '#16161a', border: '1px solid #2a2a32', borderRadius: '12px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, color: '#e8e8ea' }}>{mode === 'login' ? 'Accedi' : 'Registrati'}</h3>
          <div>
            <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} style={{ marginRight: 8, background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
              {mode === 'login' ? 'Crea account' : 'Hai già un account?'}
            </button>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}>✕</button>
          </div>
        </div>

        <form onSubmit={mode === 'login' ? handleLogin : handleSignup}>
          <label style={{ fontSize: '12px', color: '#6b7280' }}>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" required style={{ width: '100%', padding: '8px 10px', marginTop: 6, marginBottom: 10, background: '#1c1c22', border: '1px solid #2a2a32', color: '#e8e8ea' }} />

          <label style={{ fontSize: '12px', color: '#6b7280' }}>Password</label>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" required style={{ width: '100%', padding: '8px 10px', marginTop: 6, marginBottom: 10, background: '#1c1c22', border: '1px solid #2a2a32', color: '#e8e8ea' }} />

          {mode === 'signup' && (
            <>
              <label style={{ fontSize: '12px', color: '#6b7280' }}>Codice admin (opzionale)</label>
              <input value={adminCode} onChange={e => setAdminCode(e.target.value)} placeholder="Inserisci codice admin per ruolo admin" style={{ width: '100%', padding: '8px 10px', marginTop: 6, marginBottom: 10, background: '#1c1c22', border: '1px solid #2a2a32', color: '#e8e8ea' }} />
            </>
          )}

          {error && <div style={{ color: '#fca5a5', marginBottom: 8 }}>⚠️ {error}</div>}

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '8px 10px', background: '#1c1c22', border: '1px solid #2a2a32', color: '#6b7280' }}>Annulla</button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '8px 10px', background: 'linear-gradient(135deg,#10b981,#059669)', border: 'none', color: '#fff' }}>{loading ? '…' : (mode === 'login' ? 'Accedi' : 'Registrati')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}