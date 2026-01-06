import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import type { DailyStat } from '../../types'  // Changed from DailyStats to DailyStat

export const NutritionStats = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<DailyStat | null>(null)  // Changed here too
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [user])

  const loadStats = async () => {
    if (!user) return
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const { data } = await supabase  // Removed unused 'error'
        .from('daily_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      if (data) {
        setStats(data)
      } else {
        // Create default stats for today
        const { data: newStats } = await supabase
          .from('daily_stats')
          .insert([{
            user_id: user.id,
            date: today
          }])
          .select()
          .single()
        
        setStats(newStats)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p>Loading stats...</p>

  const netCalories = (stats?.calories_intake || 0) - (stats?.calories_burned || 0)

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '1.5rem',
        borderRadius: '8px',
        color: 'white',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔥</div>
        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Net Calories</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
          {netCalories} cal
        </div>
        <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>
          {stats?.calories_intake || 0} in - {stats?.calories_burned || 0} out
        </div>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        padding: '1.5rem',
        borderRadius: '8px',
        color: 'white',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💪</div>
        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Protein</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
          {stats?.protein || 0}g
        </div>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        padding: '1.5rem',
        borderRadius: '8px',
        color: 'white',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🍞</div>
        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Carbs</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
          {stats?.carbs || 0}g
        </div>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        padding: '1.5rem',
        borderRadius: '8px',
        color: 'white',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌾</div>
        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Fiber</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
          {stats?.fibre || 0}g
        </div>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        padding: '1.5rem',
        borderRadius: '8px',
        color: 'white',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💧</div>
        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Water</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
          {stats?.water_litres || 0}L
        </div>
      </div>
    </div>
  )
}