import { Layout } from '../components/common/Layout'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export const Dashboard = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to checklist by default
    navigate('/checklist')
  }, [navigate])

  return (
    <Layout>
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h1>Welcome to Daily Tracker</h1>
        <p>Redirecting...</p>
      </div>
    </Layout>
  )
}