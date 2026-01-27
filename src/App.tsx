import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { Login } from './components/auth/Login'
import { PlansPage } from './pages/PlansPage'

import { ChecklistPage } from './pages/ChecklistPage'
import { Dashboard } from './pages/Dashboard'
import { StatsSummary } from './pages/StatsSummary'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.5rem'
      }}>
        Loading...
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/plans" element={<PlansPage />} />

        <Route path="/checklist" element={<ChecklistPage />} />
        <Route path="/stats" element={<StatsSummary />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App