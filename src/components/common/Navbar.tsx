import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export const Navbar = () => {
  const location = useLocation()
  const { user, logout } = useAuth()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav style={{
      background: '#667eea',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <h2 style={{ color: 'white', margin: 0 }}>Daily Tracker</h2>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link
            to="/plans"
            style={{
              color: 'white',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              background: isActive('/plans') ? 'rgba(255,255,255,0.2)' : 'transparent',
              fontWeight: isActive('/plans') ? '600' : '400'
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
              fontWeight: isActive('/todo') ? '600' : '400'
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
              fontWeight: isActive('/checklist') ? '600' : '400'
            }}
          >
            Daily Checklist
          </Link>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ color: 'white' }}>👤 {user?.email}</span>
        <button
          onClick={logout}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  )
}