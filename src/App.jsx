import { useState, useEffect, useCallback } from 'react'
import { supabase }    from './lib/supabase'
import Header          from './components/Header'
import SummaryBar      from './components/SummaryBar'
import ParkingMap      from './components/ParkingMap'
import BookingModal    from './components/BookingModal'
import BookingsList    from './components/BookingsList'
import AuthModal       from './components/AuthModal'

export default function App() {
  const [spots,    setSpots]    = useState([])
  const [bookings, setBookings] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [user,     setUser]     = useState(null)
  const [showAuth, setShowAuth] = useState(false)

  const fetchAll = useCallback(async () => {
    try {
      const [{ data: sp, error: spErr }, { data: bk, error: bkErr }] = await Promise.all([
        supabase.from('spots').select('*').order('id'),
        supabase.from('bookings').select('*').order('created_at', { ascending: false }).limit(50),
      ])
      if (spErr) throw spErr
      if (bkErr) throw bkErr
      setSpots(sp ?? [])
      setBookings(bk ?? [])
      setError(null)
    } catch (err) {
      setError(err.message || 'Errore nel caricamento.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    const channel = supabase
      .channel('parking-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'spots' },    () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => fetchAll())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetchAll])

  useEffect(() => {
    // check session on mount
    async function getSession() {
      try {
        const { data } = await supabase.auth.getSession()
        const sessionUser = data?.session?.user
        if (sessionUser) {
          // fetch profile
          const { data: profile } = await supabase.from('profiles').select('role').eq('id', sessionUser.id).single()
          setUser({ id: sessionUser.id, email: sessionUser.email, role: profile?.role ?? 'user' })
        }
      } catch (err) {
        // ignore
      }
    }
    getSession()

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        (async () => {
          const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
          setUser({ id: session.user.id, email: session.user.email, role: profile?.role ?? 'user' })
        })()
      } else {
        setUser(null)
      }
    })

    return () => listener?.subscription?.unsubscribe()
  }, [])

  const handleLogin = (u) => setUser(u)
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const summary = {
    liberi:   spots.filter(s => !s.occupied).length,
    auto:     spots.filter(s => s.type === 'auto'     && !s.occupied).length,
    moto:     spots.filter(s => s.type === 'moto'     && !s.occupied).length,
    disabili: spots.filter(s => s.type === 'disabile' && !s.occupied).length,
    totale:   spots.length,
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#0f0f11' }}>
      <Header user={user} onLogin={() => setShowAuth(true)} onLogout={handleLogout} />

      <div style={{ display: 'flex', flex: 1, height: 'calc(100vh - 56px)', overflow: 'hidden' }}>

        {/* SIDEBAR */}
        <aside style={{
          width: '280px', flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
          background: '#16161a',
          borderRight: '1px solid #2a2a32',
        }}>
          <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #2a2a32' }}>
            <SummaryBar summary={summary} />
            {user && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Connesso come</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e8e8ea' }}>{user.email} · {user.role}</div>
              </div>
            )}
          </div>
          <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: '#4a4a55', marginBottom: '12px' }}>
              Prenotazioni recenti
            </p>
            <BookingsList bookings={bookings} spots={spots} onRefresh={fetchAll} user={user} />
          </div>
        </aside>

        {/* MAIN */}
        <main style={{
          flex: 1, overflowY: 'auto',
          background: '#0f0f11',
          padding: '32px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          {loading && <p style={{ color: '#4a4a55', marginTop: '64px', fontSize: '14px' }}>Caricamento…</p>}

          {!loading && error && (
            <div style={{
              width: '100%', maxWidth: '760px',
              background: '#1f0d0d', border: '1px solid #7f1d1d',
              borderRadius: '12px', padding: '16px',
              color: '#fca5a5', fontSize: '14px',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              ⚠️ {error}
              <button onClick={fetchAll} style={{
                marginLeft: 'auto', background: '#dc2626', color: '#fff',
                border: 'none', borderRadius: '6px', padding: '6px 14px',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              }}>Riprova</button>
            </div>
          )}

          {!loading && !error && (
            <div style={{ width: '100%', maxWidth: '800px' }}>
              {/* Titolo mappa */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>
                    </svg>
                  </div>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#e8e8ea', lineHeight: 1 }}>
                      Mappa Parcheggio
                    </h2>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '3px' }}>
                      Clicca su un posto verde per prenotare
                    </p>
                  </div>
                </div>
                <div style={{
                  background: '#1c1c22', border: '1px solid #2a2a32',
                  borderRadius: '10px', padding: '8px 16px',
                  fontSize: '13px', fontWeight: 600, color: '#10b981',
                  fontFamily: 'DM Mono, monospace',
                }}>
                  {summary.liberi} / {summary.totale} liberi
                </div>
              </div>

              <ParkingMap spots={spots} onSelectSpot={(s) => {
                if (!user) { setShowAuth(true); return }
                setSelected(s)
              }} />
            </div>
          )}
        </main>
      </div>

      {selected && (
        <BookingModal
          spot={selected}
          onClose={() => setSelected(null)}
          onBooked={() => { setSelected(null); fetchAll() }}
          user={user}
        />
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={handleLogin} />}
    </div>
  )
}