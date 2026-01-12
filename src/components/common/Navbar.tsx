import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useState } from 'react'

export const Navbar = () => {
  const location = useLocation()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  
  const isActive = (path: string) => location.pathname === path

  return (
    <nav style={{
      background: '#667eea',
      padding: '0.75rem 1rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Mobile Layout */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Logo */}
        <h2 style={{ 
          color: 'white', 
          margin: 0, 
          fontSize: '1.1rem',
          whiteSpace: 'nowrap'
        }}>
          Daily Tracker
        </h2>
        
        {/* Desktop Links (hidden on mobile) */}
        <div style={{ 
          display: 'none',
          gap: '1rem',
          alignItems: 'center'
        }}
        className="desktop-nav">
          <Link
            to="/plans"
            style={{
              color: 'white',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              background: isActive('/plans') ? 'rgba(255,255,255,0.2)' : 'transparent',
              fontWeight: isActive('/plans') ? '600' : '400',
              fontSize: '0.9rem'
            }}
          >
            Plans
          </Link>
          <Link
            to="/todo"
            style={{
              color: 'white',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              background: isActive('/todo') ? 'rgba(255,255,255,0.2)' : 'transparent',
              fontWeight: isActive('/todo') ? '600' : '400',
              fontSize: '0.9rem'
            }}
          >
            Daily Todo
          </Link>
          <Link
            to="/checklist"
            style={{
              color: 'white',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              background: isActive('/checklist') ? 'rgba(255,255,255,0.2)' : 'transparent',
              fontWeight: isActive('/checklist') ? '600' : '400',
              fontSize: '0.9rem'
            }}
          >
            Daily Checklist
          </Link>
        </div>

        {/* User Section */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem'
        }}>
          {/* User Icon (always visible) */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              padding: '0.5rem',
              borderRadius: '50%',
              cursor: 'pointer',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem'
            }}
          >
            👤
          </button>
          
          {/* Desktop Logout (hidden on mobile) */}
          <button
            onClick={logout}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '0.9rem',
              display: 'none'
            }}
            className="desktop-logout"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: '#667eea',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {/* User Email */}
          <div style={{
            color: 'white',
            fontSize: '0.85rem',
            padding: '0.5rem',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '4px',
            wordBreak: 'break-all'
          }}>
            {user?.email}
          </div>

          {/* Mobile Nav Links */}
          <Link
            to="/plans"
            onClick={() => setMenuOpen(false)}
            style={{
              color: 'white',
              textDecoration: 'none',
              padding: '0.75rem',
              borderRadius: '4px',
              background: isActive('/plans') ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
              fontWeight: isActive('/plans') ? '600' : '400',
              fontSize: '0.9rem',
              textAlign: 'center'
            }}
          >
            📋 Plans
          </Link>
          <Link
            to="/todo"
            onClick={() => setMenuOpen(false)}
            style={{
              color: 'white',
              textDecoration: 'none',
              padding: '0.75rem',
              borderRadius: '4px',
              background: isActive('/todo') ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
              fontWeight: isActive('/todo') ? '600' : '400',
              fontSize: '0.9rem',
              textAlign: 'center'
            }}
          >
            ✅ Daily Todo
          </Link>
          <Link
            to="/checklist"
            onClick={() => setMenuOpen(false)}
            style={{
              color: 'white',
              textDecoration: 'none',
              padding: '0.75rem',
              borderRadius: '4px',
              background: isActive('/checklist') ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
              fontWeight: isActive('/checklist') ? '600' : '400',
              fontSize: '0.9rem',
              textAlign: 'center'
            }}
          >
            📊 Daily Checklist
          </Link>

          {/* Mobile Logout */}
          <button
            onClick={() => {
              logout()
              setMenuOpen(false)
            }}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '2px solid rgba(255,255,255,0.3)',
              padding: '0.75rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}
          >
            🚪 Logout
          </button>
        </div>
      )}

      {/* CSS for responsive behavior */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .desktop-logout {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  )
}
