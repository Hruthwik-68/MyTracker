import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useState, useEffect } from 'react'

export const Navbar = () => {
  const location = useLocation()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const end = new Date()
      end.setHours(23, 59, 59, 999)
      const diff = end.getTime() - now.getTime()

      if (diff < 0) {
        setTimeLeft('00:00:00')
        return
      }

      const h = Math.floor(diff / (1000 * 60 * 60))
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const s = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft(`${h}h ${m}m ${s}s`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [])

  // Professional Dark Theme
  const THEME = {
    bg: '#09090b', // Solid Rich Black
    border: '#27272a',
    accent: '#f97316',
    text: '#e4e4e7',
    textMuted: '#a1a1aa',
    activeBg: '#27272a'
  }

  return (
    <nav style={{
      background: THEME.bg,
      backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${THEME.border}`,
      padding: '0 1.5rem',
      height: '64px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center'
    }}>
      <div style={{
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ fontSize: '1.5rem' }}>📊</div>
          <h2 style={{
            color: 'white',
            margin: 0,
            fontSize: '1.1rem',
            fontWeight: '700',
            letterSpacing: '-0.025em'
          }}>
            Daily<span style={{ color: THEME.accent }}>Tracker</span>
          </h2>
          {/* Mobile Timer */}
          <div style={{
            marginLeft: '1rem',
            fontVariantNumeric: 'tabular-nums',
            fontSize: '0.8rem',
            color: THEME.textMuted,
            background: 'rgba(255,255,255,0.05)',
            padding: '0.2rem 0.5rem',
            borderRadius: '6px',
            display: 'none' // Hidden by default, shown via media query if needed
          }} className="mobile-timer">
            ⏳ {timeLeft} left
          </div>
        </div>

        {/* Desktop Links */}
        <div style={{
          display: 'none',
          gap: '0.5rem',
          alignItems: 'center'
        }}
          className="desktop-nav">
          <div style={{
            marginRight: '1rem',
            fontVariantNumeric: 'tabular-nums',
            fontSize: '0.9rem',
            color: THEME.accent,
            background: 'rgba(249, 115, 22, 0.1)',
            padding: '0.25rem 0.75rem',
            borderRadius: '99px',
            border: '1px solid rgba(249, 115, 22, 0.2)'
          }}>
            ⏳ {timeLeft} left
          </div>
          {[
            { path: '/plans', label: 'Plans' },
            { path: '/checklist', label: 'Dashboard' },
            { path: '/stats', label: 'Stats' }
          ].map(link => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                color: isActive(link.path) ? 'white' : THEME.textMuted,
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                background: isActive(link.path) ? THEME.activeBg : 'transparent',
                fontWeight: isActive(link.path) ? '600' : '500',
                fontSize: '0.9rem',
                transition: 'all 0.2s',
                border: isActive(link.path) ? `1px solid rgba(249, 115, 22, 0.2)` : '1px solid transparent'
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* User Section */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'transparent',
              color: 'white',
              border: `1px solid ${THEME.border}`,
              padding: '0.25rem 0.5rem 0.25rem 0.25rem',
              borderRadius: '999px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = THEME.textMuted}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = THEME.border}
          >
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '700', fontSize: '0.8rem'
            }}>
              {user?.email?.[0].toUpperCase()}
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: '500', color: THEME.textMuted, paddingRight: '0.25rem' }}>
              Profile
            </span>
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 0.75rem)',
              right: 0,
              background: '#18181b',
              border: `1px solid ${THEME.border}`,
              borderRadius: '12px',
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)',
              padding: '0.5rem',
              minWidth: '220px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
              zIndex: 200 // Higher z-index
            }}>
              <div style={{ padding: '0.75rem', borderBottom: `1px solid ${THEME.border}`, marginBottom: '0.25rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'white', fontWeight: '600' }}>Signed in as</div>
                <div style={{ fontSize: '0.8rem', color: THEME.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email}
                </div>
              </div>

              {/* Mobile Links inside Profile for mobile view */}
              <div className="mobile-only-links" style={{ display: 'none', flexDirection: 'column', gap: '0.25rem' }}>
                <Link to="/plans" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '0.6rem', borderRadius: '6px', color: THEME.textMuted, textDecoration: 'none', fontSize: '0.9rem' }}>Plans</Link>
                <Link to="/checklist" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '0.6rem', borderRadius: '6px', color: THEME.textMuted, textDecoration: 'none', fontSize: '0.9rem' }}>Dashboard</Link>
                <Link to="/stats" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '0.6rem', borderRadius: '6px', color: THEME.textMuted, textDecoration: 'none', fontSize: '0.9rem' }}>Stats</Link>
                <div style={{ height: '1px', background: THEME.border, margin: '0.25rem 0' }}></div>
              </div>

              <button
                onClick={logout}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  border: 'none',
                  padding: '0.6rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  textAlign: 'left',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                🚪 Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
        }
        @media (max-width: 768px) {
          .mobile-only-links { display: flex !important; }
          .mobile-timer { display: block !important; }
        }
      `}</style>
    </nav>
  )
}
