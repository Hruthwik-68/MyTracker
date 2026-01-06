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
    consistency: true
  })

  useEffect(() => {
    loadChecklistData()
  }, [user])

  const loadChecklistData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]

      // Load items
      const { data: itemsData } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('user_id', user.id)
        .order('order_index', { ascending: true })

      // Load today's logs
      const { data: logsData } = await supabase
        .from('daily_checklists')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)

      if (itemsData) setItems(itemsData)
      if (logsData) setLogs(logsData)

      // If no items exist, create default ones
      if (!itemsData || itemsData.length === 0) {
        await createDefaultItems()
      }
    } catch (error) {
      console.error('Error loading checklist:', error)
    } finally {
      setLoading(false)
    }
  }

  const createDefaultItems = async () => {
    if (!user) return

    const defaultItems = [
      // Routine
      { category: 'ROUTINE', name: 'Wake up', order_index: 1 },
      { category: 'ROUTINE', name: 'Brush', order_index: 2 },
      { category: 'ROUTINE', name: 'Splash water', order_index: 3 },
      { category: 'ROUTINE', name: 'Revise while brushing', order_index: 4 },
      { category: 'ROUTINE', name: 'Treadmill', order_index: 5 },
      { category: 'ROUTINE', name: 'Gym', order_index: 6 },
      { category: 'ROUTINE', name: 'Study DSA', order_index: 7 },
      { category: 'ROUTINE', name: 'Sleep 8 hours', order_index: 8 },
      
      // Supplements
      { category: 'SUPPLEMENT', name: 'Hot water (morning)', order_index: 9 },
      { category: 'SUPPLEMENT', name: 'Glutathione tab (alternate days)', order_index: 10 },
      { category: 'SUPPLEMENT', name: 'Vitamin C tab (alternate days)', order_index: 11 },
      { category: 'SUPPLEMENT', name: 'Skin care tablet (morning)', order_index: 12 },
      { category: 'SUPPLEMENT', name: 'Skin care tablet (night)', order_index: 13 },
      { category: 'SUPPLEMENT', name: 'Creatine 3-5g', order_index: 14 },
      { category: 'SUPPLEMENT', name: 'Green tea (evening)', order_index: 15 },
      { category: 'SUPPLEMENT', name: 'Multivitamin (evening)', order_index: 16 },
      { category: 'SUPPLEMENT', name: 'Flaxseed 1 spoon', order_index: 17 },
      
      // Diet
      { category: 'DIET', name: 'Water (litres)', order_index: 18 },
      { category: 'DIET', name: 'Chicken (grams)', order_index: 19 },
      { category: 'DIET', name: 'Eggs (units)', order_index: 20 },
      { category: 'DIET', name: 'Sprouts (grams)', order_index: 21 },
      { category: 'DIET', name: 'Whey Protein (scoops)', order_index: 22 },
      { category: 'DIET', name: 'Curd (grams)', order_index: 23 },
      { category: 'DIET', name: 'Rice (grams)', order_index: 24 }
    ]

    const itemsToInsert = defaultItems.map(item => ({
      user_id: user.id,
      category: item.category,
      name: item.name,
      is_persistent: true,
      order_index: item.order_index
    }))

    await supabase.from('checklist_items').insert(itemsToInsert)
    loadChecklistData()
  }

  const toggleChecklistItem = async (item: ChecklistItem) => {
    if (!user) return
    const today = new Date().toISOString().split('T')[0]

    const existingLog = logs.find(l => l.checklist_item_id === item.id)

    if (existingLog) {
      // Update
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
      // Create
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
      }
    } catch (error) {
      console.error('Error adding item:', error)
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

      if (existing) {
        await supabase
          .from('daily_stats')
          .update({
            energy_level: dailyStats.energyLevel,
            focus_level: dailyStats.focusLevel,
            consistency: dailyStats.consistency
          })
          .eq('id', existing.id)
      } else {
        await supabase
          .from('daily_stats')
          .insert([{
            user_id: user.id,
            date: today,
            energy_level: dailyStats.energyLevel,
            focus_level: dailyStats.focusLevel,
            consistency: dailyStats.consistency
          }])
      }

      alert('Daily stats saved!')
    } catch (error) {
      console.error('Error saving stats:', error)
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
          padding: '0.75rem',
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '4px',
          marginBottom: '0.5rem'
        }}>
          <span style={{ flex: 1 }}>{item.name}</span>
          <input
            type="text"
            value={log?.value || ''}
            onChange={(e) => updateDietValue(item, e.target.value)}
            placeholder="Enter value"
            style={{
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              width: '150px'
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
        padding: '0.75rem',
        background: log?.is_done ? '#f0f0f0' : 'white',
        border: '1px solid #ddd',
        borderRadius: '4px',
        marginBottom: '0.5rem'
      }}>
        <input
          type="checkbox"
          checked={log?.is_done || false}
          onChange={() => toggleChecklistItem(item)}
          style={{ cursor: 'pointer', width: '18px', height: '18px' }}
        />
        <span style={{
          flex: 1,
          textDecoration: log?.is_done ? 'line-through' : 'none',
          color: log?.is_done ? '#999' : '#333'
        }}>
          {item.name}
        </span>
      </div>
    )
  }

  if (loading) return <p>Loading checklist...</p>

  const routineItems = items.filter(t => t.category === 'ROUTINE')
  const supplementItems = items.filter(t => t.category === 'SUPPLEMENT')
  const dietItems = items.filter(t => t.category === 'DIET')

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h1 style={{ margin: 0, color: '#333' }}>✅ Daily Checklist</h1>
        <button
          onClick={() => setShowStreaks(true)}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          🔥 View Streaks
        </button>
      </div>

      <NutritionStats />

      {/* Routine Section */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ marginBottom: '1rem', color: '#667eea' }}>🌅 Morning Routine</h2>
        {routineItems.map(renderChecklistItem)}
      </div>

      {/* Supplements Section */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ marginBottom: '1rem', color: '#667eea' }}>💊 Supplements & Care</h2>
        {supplementItems.map(renderChecklistItem)}
      </div>

      {/* Diet Section */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ marginBottom: '1rem', color: '#667eea' }}>🍽️ Diet Tracking</h2>
        {dietItems.map(renderChecklistItem)}
      </div>

      {/* Daily Self Check */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ marginBottom: '1rem', color: '#667eea' }}>✅ Daily Self-Check</h2>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Energy Level: {dailyStats.energyLevel}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={dailyStats.energyLevel}
            onChange={(e) => setDailyStats({...dailyStats, energyLevel: Number(e.target.value)})}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Focus Level: {dailyStats.focusLevel}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={dailyStats.focusLevel}
            onChange={(e) => setDailyStats({...dailyStats, focusLevel: Number(e.target.value)})}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={dailyStats.consistency}
              onChange={(e) => setDailyStats({...dailyStats, consistency: e.target.checked})}
            />
            Consistency Maintained Today
          </label>
        </div>

        <button
          onClick={saveDailyStats}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Save Daily Stats
        </button>
      </div>

      {/* Add New Item Button */}
      <button
        onClick={() => setShowAddItem(true)}
        style={{
          padding: '0.75rem 1.5rem',
          background: '#4ade80',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: '600',
          marginBottom: '2rem'
        }}
      >
        ➕ Add New Item
      </button>

      {/* Add Item Modal */}
      {showAddItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2 style={{ marginBottom: '1rem' }}>Add New Checklist Item</h2>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Item Name</label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Category</label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({...newItem, category: e.target.value as any})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              >
                <option value="ROUTINE">Routine</option>
                <option value="SUPPLEMENT">Supplement</option>
                <option value="DIET">Diet</option>
              </select>
            </div>

            {newItem.category !== 'DIET' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={newItem.persistent}
                    onChange={(e) => setNewItem({...newItem, persistent: e.target.checked})}
                  />
                  Save for future days
                </label>
              </div>
            )}

            {newItem.category === 'DIET' && (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Calories</label>
                  <input
                    type="number"
                    value={newItem.calories}
                    onChange={(e) => setNewItem({...newItem, calories: Number(e.target.value)})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Protein (g)</label>
                  <input
                    type="number"
                    value={newItem.protein}
                    onChange={(e) => setNewItem({...newItem, protein: Number(e.target.value)})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
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
                  padding: '0.75rem',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Add Item
              </button>
              <button
                onClick={() => setShowAddItem(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#ccc',
                  color: '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Streak Calendar Modal */}
      {showStreaks && <StreakCalendar onClose={() => setShowStreaks(false)} />}
    </div>
  )
}