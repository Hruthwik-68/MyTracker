import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import type { DailyStat, ChecklistItem, DailyChecklist } from '../../types'

interface NutritionStatsProps {
  items: ChecklistItem[]
  logs: DailyChecklist[]
}

export const NutritionStats = ({ items, logs }: NutritionStatsProps) => {
  const { user } = useAuth()
  const [stats, setStats] = useState<DailyStat | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [user])

  const loadStats = async () => {
    if (!user) return
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const { data } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      if (data) {
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate nutrition from diet logs - THIS RUNS EVERY RENDER WITH NEW LOGS
  const calculateNutrition = () => {
    let totalCalories = 0
    let totalProtein = 0
    let totalCarbs = 0
    let totalFiber = 0
    let totalFats = 0
    let totalWater = 0
    let caloriesBurned = 0

    console.log('🔍 Calculating nutrition...', { itemsCount: items.length, logsCount: logs.length })

    const dietItems = items.filter(i => i.category === 'DIET')
    const routineItems = items.filter(i => i.category === 'ROUTINE')

    console.log('📊 Diet items:', dietItems.length, 'Routine items:', routineItems.length)

    // Calculate intake from diet
    dietItems.forEach(item => {
      const log = logs.find(l => l.checklist_item_id === item.id)
      if (log && log.value) {
        const quantity = parseFloat(log.value) || 0
        const metadata = item.metadata as any

        if (metadata && quantity > 0) {
          if (item.name.toLowerCase().includes('water')) {
            totalWater += quantity
          } else {
            totalCalories += (metadata.calories || 0) * quantity
            totalProtein += (metadata.protein || 0) * quantity
            totalCarbs += (metadata.carbs || 0) * quantity
            totalFiber += (metadata.fiber || 0) * quantity
            totalFats += (metadata.fats || 0) * quantity
          }
        }
      }
    })

    // Calculate calories burned from exercises
    routineItems.forEach(item => {
      const log = logs.find(l => l.checklist_item_id === item.id)
      const metadata = item.metadata as any
      
      console.log('🏋️ Checking routine item:', {
        name: item.name,
        hasLog: !!log,
        isDone: log?.is_done,
        hasMetadata: !!metadata,
        caloriesBurn: metadata?.calories_burn
      })
      
      if (log && log.is_done && metadata?.calories_burn) {
        console.log('✅ Adding calories burned:', metadata.calories_burn)
        caloriesBurned += metadata.calories_burn
      }
    })

    console.log('📈 Final calculation:', {
      totalCalories,
      caloriesBurned,
      netCalories: totalCalories - caloriesBurned
    })

    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fiber: Math.round(totalFiber * 10) / 10,
      fats: Math.round(totalFats * 10) / 10,
      water: Math.round(totalWater * 10) / 10,
      caloriesBurned
    }
  }

  if (loading) return <p>Loading stats...</p>

  const nutrition = calculateNutrition()
  const netCalories = nutrition.calories - nutrition.caloriesBurned

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    }}>
      {/* Net Calories */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '1.5rem',
        borderRadius: '12px',
        color: 'white',
        boxShadow: '0 4px 15px rgba(102,126,234,0.3)',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔥</div>
        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Net Calories</div>
        <div style={{ 
          fontSize: '1.75rem', 
          fontWeight: 'bold', 
          marginTop: '0.5rem',
          color: netCalories < 0 ? '#ffcccb' : 'white'
        }}>
          {netCalories} cal
        </div>
        <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>
          {nutrition.calories} in - {nutrition.caloriesBurned} out
        </div>
      </div>

      {/* Protein */}
      <div style={{
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        padding: '1.5rem',
        borderRadius: '12px',
        color: 'white',
        boxShadow: '0 4px 15px rgba(245,87,108,0.3)',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💪</div>
        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Protein</div>
        <div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
          {nutrition.protein}g
        </div>
      </div>

      {/* Carbs */}
      <div style={{
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        padding: '1.5rem',
        borderRadius: '12px',
        color: 'white',
        boxShadow: '0 4px 15px rgba(79,172,254,0.3)',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🍞</div>
        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Carbs</div>
        <div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
          {nutrition.carbs}g
        </div>
      </div>

      {/* Fats */}
      <div style={{
        background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
        padding: '1.5rem',
        borderRadius: '12px',
        color: 'white',
        boxShadow: '0 4px 15px rgba(253,203,110,0.3)',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🥑</div>
        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Fats</div>
        <div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
          {nutrition.fats}g
        </div>
      </div>

      {/* Fiber */}
      <div style={{
        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        padding: '1.5rem',
        borderRadius: '12px',
        color: 'white',
        boxShadow: '0 4px 15px rgba(67,233,123,0.3)',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌾</div>
        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Fiber</div>
        <div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
          {nutrition.fiber}g
        </div>
      </div>

      {/* Water */}
      <div style={{
        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        padding: '1.5rem',
        borderRadius: '12px',
        color: 'white',
        boxShadow: '0 4px 15px rgba(250,112,154,0.3)',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💧</div>
        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Water</div>
        <div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
          {nutrition.water}L
        </div>
      </div>
    </div>
  )
}
