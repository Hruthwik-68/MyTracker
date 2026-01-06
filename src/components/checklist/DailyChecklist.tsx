import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import type { ChecklistItem, DailyChecklist as DailyChecklistType } from '../../types'
import { NutritionStats } from './NutritionStats'
import { StreakCalendar } from './StreakCalendar'

export const DailyChecklist = () => {
  const { user } = useAuth()
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [logs, setLogs] = useState<DailyChecklistType[]>([])
  const [loading, setLoading] = useState(true)
  const [showStreaks, setShowStreaks] = useState(false)
  const [showAddItem, setShowAddItem] = useState(false)
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'ROUTINE' as 'ROUTINE' | 'SUPPLEMENT' | 'DIET',
    persistent: true,
    calories: 0,
    protein: 0,
    fats: 0,
    carbs: 0,
    fiber: 0
  })
  const [dailyStats, setDailyStats] = useState({
    energyLevel: 5,
    focusLevel: 5,
    consistency: true,
    dsaHours: 0,
    lldHours: 0,
    problemsSolved: 0
  })

  const today = new Date()
  const formattedDate = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  useEffect(() => {
    loadChecklistData()
  }, [user])

  const loadChecklistData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]

      const { data: itemsData } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('user_id', user.id)
        .order('order_index', { ascending: true })

      const { data: logsData } = await supabase
        .from('daily_checklists')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)

      if (itemsData) setItems(itemsData)
      if (logsData) setLogs(logsData)

      if (!itemsData || itemsData.length === 0) {
        await createDefaultItems()
      }

      // Load today's stats including DSA, LLD, Problems
      const { data: statsData } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      if (statsData) {
        setDailyStats({
          energyLevel: statsData.energy_level || 5,
          focusLevel: statsData.focus_level || 5,
          consistency: statsData.consistency ?? true,
          dsaHours: statsData.dsa_hours || 0,
          lldHours: statsData.lld_hours || 0,
          problemsSolved: statsData.problems_solved || 0
        })
      }
    } catch (error) {
      console.error('Error loading checklist:', error)
    } finally {
      setLoading(false)
    }
  }

  const createDefaultItems = async () => {
    if (!user) return

    const { data: existing } = await supabase
      .from('checklist_items')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)

    if (existing && existing.length > 0) {
      return
    }

    const defaultItems = [
      { category: 'ROUTINE', name: '☀️ Wake up', order_index: 1 },
      { category: 'ROUTINE', name: '🪥 Brush', order_index: 2 },
      { category: 'ROUTINE', name: '💦 Splash water', order_index: 3 },
      { category: 'ROUTINE', name: '📚 Revise while brushing', order_index: 4 },
      { category: 'ROUTINE', name: '🏃 Treadmill (1 hr @ 8km/h)', order_index: 5 },
      { category: 'ROUTINE', name: '💪 Gym - Weight Training (1 hr)', order_index: 6 },
      { category: 'ROUTINE', name: '🧠 Study DSA/CP', order_index: 7 },
      { category: 'ROUTINE', name: '💻 Work Block (9 AM - 6 PM)', order_index: 8 },
      { category: 'ROUTINE', name: '📖 LLD Study (0.5-1 hr)', order_index: 9 },
      { category: 'ROUTINE', name: '🛌 Sleep 8 hours', order_index: 10 },
      
      { category: 'SUPPLEMENT', name: '🔥 Hot water (morning)', order_index: 11 },
      { category: 'SUPPLEMENT', name: '💊 Glutathione (alternate days)', order_index: 12 },
      { category: 'SUPPLEMENT', name: '🍊 Vitamin C (alternate days)', order_index: 13 },
      { category: 'SUPPLEMENT', name: '✨ Skin care tablet (morning)', order_index: 14 },
      { category: 'SUPPLEMENT', name: '🌙 Skin care tablet (night)', order_index: 15 },
      { category: 'SUPPLEMENT', name: '⚡ Creatine 3-5g', order_index: 16 },
      { category: 'SUPPLEMENT', name: '🍵 Green tea (evening)', order_index: 17 },
      { category: 'SUPPLEMENT', name: '💊 Multivitamin (evening)', order_index: 18 },
      { category: 'SUPPLEMENT', name: '🌰 Flaxseed 1 spoon', order_index: 19 },
      
      { category: 'DIET', name: '💧 Water (litres)', order_index: 20 },
      { category: 'DIET', name: '🍗 Chicken Breast (grams)', order_index: 21 },
      { category: 'DIET', name: '🥚 Eggs (units)', order_index: 22 },
      { category: 'DIET', name: '🌱 Sprouts (grams)', order_index: 23 },
      { category: 'DIET', name: '💪 Whey Protein (scoops)', order_index: 24 },
      { category: 'DIET', name: '🥛 Curd (grams)', order_index: 25 },
      { category: 'DIET', name: '🍚 Boiled Rice (grams)', order_index: 26 },
      { category: 'DIET', name: '🫘 Soya Chunks (grams)', order_index: 27 },
    ]

    const itemsToInsert = defaultItems.map(item => ({
      user_id: user.id,
      category: item.category,
      name: item.name,
      is_persistent: true,
      order_index: item.order_index
    }))

    await supabase.from('checklist_items').insert(itemsToInsert)
    await loadChecklistData()
  }

  const toggleChecklistItem = async (item: ChecklistItem) => {
    if (!user) return
    const today = new Date().toISOString().split('T')[0]

    const existingLog = logs.find(l => l.checklist_item_id === item.id)

    if (existingLog) {
      const { data } = await supabase
        .from('daily_checklists')
        .update({ is_done: !existingLog.is_done })
        .eq('id', existingLog.id)
        .select()
        .single()

      if (data) {
        setLogs(logs.map(l => l.id === data.id ? data : l))
      }
    } else {
      const { data } = await supabase
        .from('daily_checklists')
        .insert([{
          user_id: user.id,
          date: today,
          checklist_item_id: item.id,
          is_done: true
        }])
        .select()
        .single()

      if (data) {
        setLogs([...logs, data])
      }
    }
  }

  const updateDietValue = async (item: ChecklistItem, value: string) => {
    if (!user) return
    const today = new Date().toISOString().split('T')[0]

    const existingLog = logs.find(l => l.checklist_item_id === item.id)

    if (existingLog) {
      const { data } = await supabase
        .from('daily_checklists')
        .update({ value })
        .eq('id', existingLog.id)
        .select()
        .single()

      if (data) {
        setLogs(logs.map(l => l.id === data.id ? data : l))
      }
    } else {
      const { data } = await supabase
        .from('daily_checklists')
        .insert([{
          user_id: user.id,
          date: today,
          checklist_item_id: item.id,
          is_done: false,
          value
        }])
        .select()
        .single()

      if (data) {
        setLogs([...logs, data])
      }
    }
  }

  const addNewItem = async () => {
    if (!user || !newItem.name.trim()) return

    try {
      const { data } = await supabase
        .from('checklist_items')
        .insert([{
          user_id: user.id,
          category: newItem.category,
          name: newItem.name,
          is_persistent: newItem.persistent,
          order_index: items.length + 1,
          metadata: newItem.category === 'DIET' ? {
            calories: newItem.calories,
            protein: newItem.protein,
            fats: newItem.fats,
            carbs: newItem.carbs,
            fiber: newItem.fiber
          } : null
        }])
        .select()
        .single()

      if (data) {
        setItems([...items, data])
        setShowAddItem(false)
        setNewItem({
          name: '',
          category: 'ROUTINE',
          persistent: true,
          calories: 0,
          protein: 0,
          fats: 0,
          carbs: 0,
          fiber: 0
        })
        alert('✅ New item added successfully!')
      }
    } catch (error) {
      console.error('Error adding item:', error)
      alert('❌ Failed to add item')
    }
  }

  const saveDailyStats = async () => {
    if (!user) return
    const today = new Date().toISOString().split('T')[0]

    try {
      const { data: existing } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      const statsData = {
        energy_level: dailyStats.energyLevel,
        focus_level: dailyStats.focusLevel,
        consistency: dailyStats.consistency,
        dsa_hours: dailyStats.dsaHours,
        lld_hours: dailyStats.lldHours,
        problems_solved: dailyStats.problemsSolved
      }

      if (existing) {
        await supabase
          .from('daily_stats')
          .update(statsData)
          .eq('id', existing.id)
      } else {
        await supabase
          .from('daily_stats')
          .insert([{
            user_id: user.id,
            date: today,
            ...statsData
          }])
      }

      // Update streak
      const { data: existingStreak } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      if (existingStreak) {
        await supabase
          .from('streaks')
          .update({ is_success: true })
          .eq('id', existingStreak.id)
      } else {
        await supabase
          .from('streaks')
          .insert([{
            user_id: user.id,
            date: today,
            is_success: true
          }])
      }

      alert('✅ Daily stats and streak saved!')
      
      // Reload to update streak calendar
      await loadChecklistData()
    } catch (error) {
      console.error('Error saving stats:', error)
      alert('❌ Failed to save stats')
    }
  }

  const getLogForItem = (itemId: string) => {
    return logs.find(l => l.checklist_item_id === itemId)
  }

  const renderChecklistItem = (item: ChecklistItem) => {
    const log = getLogForItem(item.id)

    if (item.category === 'DIET') {
      return (
        <div key={item.id} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '1rem',
          background: 'white',
          border: '2px solid #e0e0e0',
          borderRadius: '12px',
          marginBottom: '0.75rem',
          transition: 'all 0.3s ease',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#667eea'
          e.currentTarget.style.transform = 'translateX(5px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#e0e0e0'
          e.currentTarget.style.transform = 'translateX(0)'
        }}
        >
          <span style={{ flex: 1, fontWeight: '500', fontSize: '1rem' }}>{item.name}</span>
          <input
            type="text"
            value={log?.value || ''}
            onChange={(e) => updateDietValue(item, e.target.value)}
            placeholder="0"
            style={{
              padding: '0.75rem',
              border: '2px solid #ddd',
              borderRadius: '8px',
              width: '120px',
              fontSize: '1rem',
              textAlign: 'center',
              fontWeight: '600'
            }}
          />
        </div>
      )
    }

    return (
      <div key={item.id} style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        background: log?.is_done ? 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' : 'white',
        border: log?.is_done ? '2px solid #4caf50' : '2px solid #e0e0e0',
        borderRadius: '12px',
        marginBottom: '0.75rem',
        transition: 'all 0.3s ease',
        boxShadow: log?.is_done ? '0 4px 12px rgba(76,175,80,0.2)' : '0 2px 8px rgba(0,0,0,0.05)'
      }}
      onMouseEnter={(e) => {
        if (!log?.is_done) {
          e.currentTarget.style.borderColor = '#667eea'
          e.currentTarget.style.transform = 'translateX(5px)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = log?.is_done ? '#4caf50' : '#e0e0e0'
        e.currentTarget.style.transform = 'translateX(0)'
      }}
      >
        <input
          type="checkbox"
          checked={log?.is_done || false}
          onChange={() => toggleChecklistItem(item)}
          style={{ 
            cursor: 'pointer', 
            width: '22px', 
            height: '22px',
            accentColor: '#4caf50'
          }}
        />
        <span style={{
          flex: 1,
          textDecoration: log?.is_done ? 'line-through' : 'none',
          color: log?.is_done ? '#666' : '#333',
          fontWeight: '500',
          fontSize: '1rem'
        }}>
          {item.name}
        </span>
      </div>
    )
  }

  if (loading) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '400px',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        border: '6px solid rgba(102, 126, 234, 0.2)',
        borderTop: '6px solid #667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <p style={{ color: '#667eea', fontSize: '1.2rem', fontWeight: '600' }}>Loading your checklist...</p>
    </div>
  )

  const routineItems = items.filter(t => t.category === 'ROUTINE')
  const supplementItems = items.filter(t => t.category === 'SUPPLEMENT')
  const dietItems = items.filter(t => t.category === 'DIET')

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header with Date */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
        borderRadius: '16px',
        marginBottom: '2rem',
        boxShadow: '0 10px 30px rgba(102,126,234,0.3)',
        color: 'white'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅ Daily Checklist</h1>
            <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.9 }}>📅 {formattedDate}</p>
          </div>
          <button
            onClick={() => setShowStreaks(true)}
            style={{
              padding: '1rem 2rem',
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '1.1rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.3)'
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            🔥 View Streaks
          </button>
        </div>
      </div>

      {/* Stats Grid - Enhanced with DSA, LLD, Problems - EDITABLE */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {/* DSA Hours - Editable */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '1.5rem',
          borderRadius: '12px',
          color: 'white',
          boxShadow: '0 4px 15px rgba(102,126,234,0.3)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🧠</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>DSA Hours</div>
          <input
            type="number"
            step="0.5"
            min="0"
            value={dailyStats.dsaHours}
            onChange={(e) => setDailyStats({...dailyStats, dsaHours: Number(e.target.value)})}
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              padding: '0.5rem',
              width: '100%',
              color: 'white',
              textAlign: 'center'
            }}
          />
        </div>

        {/* LLD Hours - Editable */}
        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          padding: '1.5rem',
          borderRadius: '12px',
          color: 'white',
          boxShadow: '0 4px 15px rgba(245,87,108,0.3)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📐</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>LLD Hours</div>
          <input
            type="number"
            step="0.5"
            min="0"
            value={dailyStats.lldHours}
            onChange={(e) => setDailyStats({...dailyStats, lldHours: Number(e.target.value)})}
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              padding: '0.5rem',
              width: '100%',
              color: 'white',
              textAlign: 'center'
            }}
          />
        </div>

        {/* Problems Solved - Editable */}
        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          padding: '1.5rem',
          borderRadius: '12px',
          color: 'white',
          boxShadow: '0 4px 15px rgba(79,172,254,0.3)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Problems Solved</div>
          <input
            type="number"
            min="0"
            value={dailyStats.problemsSolved}
            onChange={(e) => setDailyStats({...dailyStats, problemsSolved: Number(e.target.value)})}
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              padding: '0.5rem',
              width: '100%',
              color: 'white',
              textAlign: 'center'
            }}
          />
        </div>
      </div>

      <NutritionStats />

      {/* Routine Section */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        marginBottom: '2rem',
        border: '1px solid #f0f0f0'
      }}>
        <h2 style={{ marginBottom: '1.5rem', color: '#667eea', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span>🌅</span> Morning Routine
        </h2>
        {routineItems.map(renderChecklistItem)}
      </div>

      {/* Supplements Section */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        marginBottom: '2rem',
        border: '1px solid #f0f0f0'
      }}>
        <h2 style={{ marginBottom: '1.5rem', color: '#f5576c', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span>💊</span> Supplements & Care
        </h2>
        {supplementItems.map(renderChecklistItem)}
      </div>

      {/* Diet Section */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        marginBottom: '2rem',
        border: '1px solid #f0f0f0'
      }}>
        <h2 style={{ marginBottom: '1.5rem', color: '#00f2fe', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span>🍽️</span> Diet Tracking
        </h2>
        {dietItems.map(renderChecklistItem)}
      </div>

      {/* Daily Self Check */}
      <div style={{
        background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(253,203,110,0.3)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ marginBottom: '1.5rem', color: '#2d3436', fontSize: '1.8rem' }}>✅ Daily Self-Check</h2>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', fontSize: '1.1rem', color: '#2d3436' }}>
            ⚡ Energy Level: {dailyStats.energyLevel}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={dailyStats.energyLevel}
            onChange={(e) => setDailyStats({...dailyStats, energyLevel: Number(e.target.value)})}
            style={{ width: '100%', height: '8px', accentColor: '#fdcb6e' }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', fontSize: '1.1rem', color: '#2d3436' }}>
            🎯 Focus Level: {dailyStats.focusLevel}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={dailyStats.focusLevel}
            onChange={(e) => setDailyStats({...dailyStats, focusLevel: Number(e.target.value)})}
            style={{ width: '100%', height: '8px', accentColor: '#fdcb6e' }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: '600', color: '#2d3436' }}>
            <input
              type="checkbox"
              checked={dailyStats.consistency}
              onChange={(e) => setDailyStats({...dailyStats, consistency: e.target.checked})}
              style={{ width: '22px', height: '22px', accentColor: '#fdcb6e' }}
            />
            💯 Consistency Maintained Today
          </label>
        </div>

        <button
          onClick={saveDailyStats}
          style={{
            padding: '1rem 2.5rem',
            background: '#2d3436',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '1.1rem',
            boxShadow: '0 4px 15px rgba(45,52,54,0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(45,52,54,0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(45,52,54,0.3)'
          }}
        >
          💾 Save Daily Stats & Update Streak
        </button>
      </div>

      {/* Add New Item Button */}
      <button
        onClick={() => setShowAddItem(true)}
        style={{
          padding: '1rem 2.5rem',
          background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          fontWeight: '700',
          fontSize: '1.1rem',
          boxShadow: '0 4px 15px rgba(76,175,80,0.3)',
          marginBottom: '2rem',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        ➕ Add New Checklist Item
      </button>

      {/* Add Item Modal */}
      {showAddItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            padding: '2.5rem',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ marginBottom: '2rem', color: '#333', fontSize: '1.8rem' }}>➕ Add New Checklist Item</h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', color: '#555' }}>Item Name</label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                placeholder="e.g., 🏊 Swimming 30 minutes"
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', color: '#555' }}>Category</label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({...newItem, category: e.target.value as any})}
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              >
                <option value="ROUTINE">Routine</option>
                <option value="SUPPLEMENT">Supplement</option>
                <option value="DIET">Diet</option>
              </select>
            </div>

            {newItem.category !== 'DIET' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1rem', fontWeight: '600', color: '#555' }}>
                  <input
                    type="checkbox"
                    checked={newItem.persistent}
                    onChange={(e) => setNewItem({...newItem, persistent: e.target.checked})}
                    style={{ width: '20px', height: '20px', accentColor: '#667eea' }}
                  />
                  💾 Save for future days
                </label>
              </div>
            )}

            {newItem.category === 'DIET' && (
              <>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', color: '#555' }}>Calories</label>
                  <input
                    type="number"
                    value={newItem.calories}
                    onChange={(e) => setNewItem({...newItem, calories: Number(e.target.value)})}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', color: '#555' }}>Protein (g)</label>
                  <input
                    type="number"
                    value={newItem.protein}
                    onChange={(e) => setNewItem({...newItem, protein: Number(e.target.value)})}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', color: '#555' }}>Carbs (g)</label>
                  <input
                    type="number"
                    value={newItem.carbs}
                    onChange={(e) => setNewItem({...newItem, carbs: Number(e.target.value)})}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', color: '#555' }}>Fiber (g)</label>
                  <input
                    type="number"
                    value={newItem.fiber}
                    onChange={(e) => setNewItem({...newItem, fiber: Number(e.target.value)})}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={addNewItem}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '1.1rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                ✅ Add Item
              </button>
              <button
                onClick={() => setShowAddItem(false)}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: '#ccc',
                  color: '#333',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '1.1rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showStreaks && <StreakCalendar onClose={() => setShowStreaks(false)} />}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          opacity: 1;
        }
      `}</style>
    </div>
  )
}