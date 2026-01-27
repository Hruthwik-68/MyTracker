import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import type { ChecklistItem, DailyChecklist as DailyChecklistType, Note } from '../../types'
import { NutritionStats } from './NutritionStats'
import { StreakCalendar } from './StreakCalendar'
import { AddStatModal } from './AddStatModal'
import { TagBasedTodoModal } from './TagBasedTodoModal'
import type { StatDefinition, DailyStatValue } from '../../types'

export const DailyChecklist = () => {
  const { user } = useAuth()
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [logs, setLogs] = useState<DailyChecklistType[]>([])
  const [loading, setLoading] = useState(true)
  const [showStreaks, setShowStreaks] = useState(false)
  const [showAddItem, setShowAddItem] = useState(false)
  const [showEditItem, setShowEditItem] = useState(false)
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null)
  const [todayNote, setTodayNote] = useState<Note | null>(null)
  const [noteContent, setNoteContent] = useState('')
  const [showTodosModal, setShowTodosModal] = useState(false)
  const [activeSection, setActiveSection] = useState<'OVERVIEW' | 'ROUTINE' | 'SUPPLEMENTS' | 'DIET' | 'STATS'>('OVERVIEW')

  const [newItem, setNewItem] = useState({
    name: '',
    category: 'ROUTINE' as 'ROUTINE' | 'SUPPLEMENT' | 'DIET',
    persistent: true,
    calories: 0,
    protein: 0,
    fats: 0,
    carbs: 0,
    fiber: 0,
    unit: 'gram' as 'gram' | 'unit' | 'scoop',
    calories_burn: 0,
    is_exercise: false
  })

  const [dailyStats, setDailyStats] = useState({
    energyLevel: 5,
    focusLevel: 5,
    consistency: true,
    dsaHours: 0,
    lldHours: 0,
    problemsSolved: 0,
    gymHours: 0
  })

  // Custom Stats State
  const [customStats, setCustomStats] = useState<StatDefinition[]>([])
  const [customStatValues, setCustomStatValues] = useState<DailyStatValue[]>([])
  const [showAddStat, setShowAddStat] = useState(false)

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const today = new Date()
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  useEffect(() => {
    if (user) {
      loadChecklistData()
      loadTodayNote()
    }
  }, [user])

  const loadTodayNote = async () => {
    if (!user) return
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      if (data) {
        setTodayNote(data)
        setNoteContent(data.content)
      }
    } catch (error) {
      console.error('Error loading note:', error)
    }
  }

  const saveNote = async () => {
    if (!user) return

    try {
      const today = new Date().toISOString().split('T')[0]

      if (!noteContent.trim()) {
        if (todayNote) {
          await supabase
            .from('notes')
            .delete()
            .eq('id', todayNote.id)

          setTodayNote(null)
          alert('✅ Note deleted successfully!')
        } else {
          alert('ℹ️ No note to delete')
        }
        setShowNotesModal(false)
        return
      }

      if (todayNote) {
        const { data } = await supabase
          .from('notes')
          .update({ content: noteContent, updated_at: new Date().toISOString() })
          .eq('id', todayNote.id)
          .select()
          .single()

        if (data) setTodayNote(data)
        alert('✅ Note updated successfully!')
      } else {
        const { data } = await supabase
          .from('notes')
          .insert([{
            user_id: user.id,
            date: today,
            content: noteContent
          }])
          .select()
          .single()

        if (data) setTodayNote(data)
        alert('✅ Note saved successfully!')
      }

      setShowNotesModal(false)
    } catch (error) {
      console.error('Error saving note:', error)
      alert('❌ Failed to save note')
    }
  }

  // Auto-seed Core Stats if they don't exist
  useEffect(() => {
    const seedStats = async () => {
      if (!user || loading) return

      const CORE_STATS = [
        { label: 'DSA', emoji: '💠', color: '#10b981' },
        { label: 'LLD', emoji: '🏗️', color: '#d97706' },
        { label: 'Problems', emoji: '💎', color: '#3b82f6' },
        { label: 'Gym', emoji: '💪', color: '#8b5cf6' }
      ]

      try {
        const { data: existing } = await supabase
          .from('stat_definitions')
          .select('label')
          .eq('user_id', user.id)

        const existingLabels = existing?.map(e => e.label) || []
        const toAdd = CORE_STATS.filter(s => !existingLabels.includes(s.label))

        if (toAdd.length > 0) {
          await supabase.from('stat_definitions').insert(
            toAdd.map(s => ({
              user_id: user.id,
              label: s.label,
              emoji: s.emoji,
              color: s.color,
              type: 'number'
            }))
          )
          loadChecklistData() // Reload to fetch new stats
        }
      } catch (err) {
        console.error('Error seeding stats:', err)
      }
    }
    seedStats()
  }, [user, loading]) // Run once when user is loaded

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

      // Default items logic removed to prevent infinite loop and enforce empty state for new users

      const { data: statsData } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      // Load Custom Stats Definitions
      const { data: customDefs } = await supabase
        .from('stat_definitions')
        .select('*')
        .eq('user_id', user.id)

      if (customDefs) setCustomStats(customDefs)

      // Load Custom Stats Values
      const { data: customVals } = await supabase
        .from('daily_stat_values')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)

      if (customVals) setCustomStatValues(customVals)

      if (statsData) {
        setDailyStats({
          energyLevel: statsData.energy_level || 5,
          focusLevel: statsData.focus_level || 5,
          consistency: statsData.consistency ?? true,
          dsaHours: statsData.dsa_hours || 0,
          lldHours: statsData.lld_hours || 0,
          problemsSolved: statsData.problems_solved || 0,
          gymHours: statsData.gym_hours || 0
        })
      }
    } catch (error) {
      console.error('Error loading checklist:', error)
    } finally {
      setLoading(false)
    }
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
      let metadata = null

      if (newItem.category === 'DIET') {
        metadata = {
          unit: newItem.unit,
          calories: newItem.calories,
          protein: newItem.protein,
          fats: newItem.fats,
          carbs: newItem.carbs,
          fiber: newItem.fiber
        }
      } else if (newItem.category === 'ROUTINE' && newItem.is_exercise) {
        metadata = {
          calories_burn: newItem.calories_burn
        }
      }

      const { data } = await supabase
        .from('checklist_items')
        .insert([{
          user_id: user.id,
          category: newItem.category,
          name: newItem.name,
          is_persistent: newItem.persistent,
          order_index: items.length + 1,
          metadata
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
          fiber: 0,
          unit: 'gram',
          calories_burn: 0,
          is_exercise: false
        })
        alert('✅ New item added successfully!')
      }
    } catch (error) {
      console.error('Error adding item:', error)
      alert('❌ Failed to add item')
    }
  }

  const deleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      await supabase
        .from('daily_checklists')
        .delete()
        .eq('checklist_item_id', itemId)

      await supabase
        .from('checklist_items')
        .delete()
        .eq('id', itemId)

      setItems(items.filter(i => i.id !== itemId))
      setLogs(logs.filter(l => l.checklist_item_id !== itemId))
      alert('✅ Item deleted successfully!')
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('❌ Failed to delete item')
    }
  }

  const openEditModal = (item: ChecklistItem) => {
    setEditingItem(item)
    setShowEditItem(true)
  }

  const updateItem = async () => {
    if (!editingItem || !user) return

    try {
      const { data } = await supabase
        .from('checklist_items')
        .update({
          name: editingItem.name,
          metadata: editingItem.metadata
        })
        .eq('id', editingItem.id)
        .select()
        .single()

      if (data) {
        setItems(items.map(i => i.id === data.id ? data : i))
        setShowEditItem(false)
        setEditingItem(null)
        alert('✅ Item updated successfully!')
      }
    } catch (error) {
      console.error('Error updating item:', error)
      alert('❌ Failed to update item')
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
        problems_solved: dailyStats.problemsSolved,
        gym_hours: dailyStats.gymHours
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
      await loadChecklistData()
    } catch (error) {
      console.error('Error saving stats:', error)
      alert('❌ Failed to save stats')
    }
  }

  const updateCustomStat = async (statId: string, value: string) => {
    if (!user) return
    const today = new Date().toISOString().split('T')[0]
    const numValue = parseFloat(value) || 0

    const existing = customStatValues.find(v => v.stat_def_id === statId)

    // Optimistic update
    if (existing) {
      setCustomStatValues(prev => prev.map(v => v.stat_def_id === statId ? { ...v, value: numValue } : v))
    } else {
      const newVal: any = { stat_def_id: statId, value: numValue, date: today, user_id: user.id }
      setCustomStatValues(prev => [...prev, newVal])
    }

    try {
      if (existing) {
        await supabase
          .from('daily_stat_values')
          .update({ value: numValue })
          .eq('id', existing.id)
      } else {
        const { data } = await supabase
          .from('daily_stat_values')
          .insert([{
            user_id: user.id,
            date: today,
            stat_def_id: statId,
            value: numValue
          }])
          .select()
          .single()

        if (data) {
          setCustomStatValues(prev => prev.map(v => v.stat_def_id === statId ? data : v))
        }
      }
    } catch (error) {
      console.error('Error updating custom stat:', error)
    }
  }

  const deleteCustomStat = async (statId: string) => {
    if (!window.confirm('Are you sure you want to delete this stat? All history for this stat will be lost.')) return

    // Optimistic remove
    setCustomStats(prev => prev.filter(s => s.id !== statId))
    setCustomStatValues(prev => prev.filter(v => v.stat_def_id !== statId))

    try {
      await supabase.from('stat_definitions').delete().eq('id', statId)
    } catch (err) {
      console.error('Error deleting stat:', err)
      alert('Failed to delete stat')
    }
  }

  const getCompletedCount = () => {
    const total = items.filter(i =>
      (activeSection === 'OVERVIEW' || i.category === activeSection)
    ).length

    // For specific sections, filter items. For Overview, include everything or maybe just routine checklist? 
    // Let's count everything for Overview.

    const completed = items.filter(i => {
      // Filter by section if not Overview
      if (activeSection !== 'OVERVIEW' && i.category !== activeSection) return false

      // Check if done
      return logs.some(l => l.checklist_item_id === i.id && l.is_done)
    }).length

    return { completed, total }
  }

  // Dashboard Theming
  const THEME = {
    bg: '#09090b', // Rich Black
    cardBg: '#18181b', // Dark Zinc
    activeBg: '#27272a', // Zinc 800
    border: '#27272a',
    accent: '#f97316', // Orange
    text: '#f4f4f5',
    textMuted: '#a1a1aa'
  }

  if (loading) return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      flexDirection: 'column',
      gap: '1rem',
      padding: '2rem',
      background: THEME.bg,
      color: THEME.accent
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        border: `6px solid ${THEME.activeBg}`,
        borderTop: `6px solid ${THEME.accent}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <p style={{ fontSize: '1.1rem', fontWeight: '600', textAlign: 'center' }}>Loading...</p>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div style={{
      display: 'flex',
      minHeight: 'calc(100vh - 64px)', // Adjust for navbar height
      background: THEME.bg,
      color: THEME.text,
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Sidebar Navigation (Desktop Only) */}
      {!isMobile && (
        <div style={{
          width: '260px',
          borderRight: `1px solid ${THEME.border}`,
          padding: '1.5rem 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          flexShrink: 0
        }}>
          {[
            { id: 'OVERVIEW', label: 'Overview', icon: '🏠' },
            { id: 'ROUTINE', label: 'Routine', icon: '📅' },
            { id: 'SUPPLEMENTS', label: 'Supplements', icon: '💊' },
            { id: 'DIET', label: 'Diet & Nutrition', icon: '🍽️' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
                justifyContent: 'flex-start',
                padding: '0.875rem 1.5rem',
                background: activeSection === item.id ? 'rgba(249, 115, 22, 0.1)' : 'transparent',
                border: 'none',
                borderLeft: activeSection === item.id ? `3px solid ${THEME.accent}` : '3px solid transparent',
                color: activeSection === item.id ? THEME.accent : THEME.textMuted,
                fontSize: '0.95rem',
                fontWeight: activeSection === item.id ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: isMobile ? '1rem' : '1.5rem', overflowY: 'auto', paddingBottom: isMobile ? '100px' : '2rem' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <div>
            <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: '700', margin: 0 }}>
              {activeSection === 'OVERVIEW' ? 'Daily Dashboard' :
                activeSection === 'ROUTINE' ? 'Daily Routine' :
                  activeSection === 'SUPPLEMENTS' ? 'Supplement Log' :
                    activeSection === 'DIET' ? 'Diet & Nutrition' : 'Statistics'}
            </h1>
            <p style={{ color: THEME.textMuted, marginTop: '0.5rem' }}>
              {formattedDate}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setShowStreaks(true)}
              style={{
                background: THEME.cardBg,
                border: `1px solid ${THEME.border}`,
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                color: THEME.text,
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              🔥 <span style={{ display: isMobile ? 'none' : 'inline' }}>Streaks</span>
            </button>
            <button
              onClick={() => setShowNotesModal(true)}
              style={{
                background: THEME.cardBg,
                border: `1px solid ${THEME.border}`,
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                color: THEME.text,
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              📝 <span style={{ display: isMobile ? 'none' : 'inline' }}>Notes</span>
            </button>
            <button
              onClick={() => setShowTodosModal(true)}
              style={{
                background: THEME.accent,
                border: 'none',
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
              }}
            >
              ✅ <span style={{ display: isMobile ? 'none' : 'inline' }}>Todos</span>
            </button>
          </div>
        </div>

        {/* Content Panels */}
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {/* OVERVIEW SECTION */}
          {activeSection === 'OVERVIEW' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

              {/* Row 1: Self Check & Progress */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1.5rem' }}>
                {/* Daily Self-Check Card */}
                <div style={{
                  background: 'rgba(24, 24, 27, 0.6)', // Glass
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}>
                  <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    📊 Daily Self-Check
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    {/* Energy Input */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: THEME.textMuted }}>
                        <span>⚡ Energy</span>
                        <span style={{ color: THEME.accent, fontWeight: 'bold' }}>{dailyStats.energyLevel}/10</span>
                      </div>
                      <input
                        type="range" min="1" max="10"
                        value={dailyStats.energyLevel}
                        onChange={(e) => setDailyStats({ ...dailyStats, energyLevel: parseInt(e.target.value) })}
                        style={{ width: '100%', accentColor: THEME.accent }}
                      />
                    </div>

                    {/* Focus Input */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: THEME.textMuted }}>
                        <span>🎯 Focus</span>
                        <span style={{ color: THEME.accent, fontWeight: 'bold' }}>{dailyStats.focusLevel}/10</span>
                      </div>
                      <input
                        type="range" min="1" max="10"
                        value={dailyStats.focusLevel}
                        onChange={(e) => setDailyStats({ ...dailyStats, focusLevel: parseInt(e.target.value) })}
                        style={{ width: '100%', accentColor: THEME.accent }}
                      />
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem', background: THEME.activeBg, borderRadius: '8px' }}>
                      <input
                        type="checkbox"
                        checked={dailyStats.consistency}
                        onChange={(e) => setDailyStats({ ...dailyStats, consistency: e.target.checked })}
                        style={{ width: '18px', height: '18px', accentColor: THEME.accent }}
                      />
                      <span>💯 Consistent today?</span>
                    </label>

                    <button
                      onClick={saveDailyStats}
                      style={{
                        width: '100%',
                        padding: '0.875rem',
                        background: THEME.accent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginTop: '0.5rem'
                      }}
                    >
                      💾 Save Stats
                    </button>
                  </div>
                </div>

                {/* Progress Summary Card */}
                <div style={{
                  background: 'rgba(24, 24, 27, 0.6)', // Glass
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>📈 Today's Progress</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ background: THEME.activeBg, padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '2.5rem', fontWeight: '700', color: THEME.accent }}>
                        {getCompletedCount().completed}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: THEME.textMuted }}>Completed Items</div>
                    </div>
                    <div style={{ background: THEME.activeBg, padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#10b981' }}>
                        {dailyStats.problemsSolved}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: THEME.textMuted }}>Problems Solved</div>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: THEME.textMuted }}>
                      <span>Completion Rate</span>
                      <span>{Math.round((getCompletedCount().completed / (getCompletedCount().total || 1)) * 100)}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: THEME.activeBg, borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${(getCompletedCount().completed / (getCompletedCount().total || 1)) * 100}%`,
                        height: '100%',
                        background: THEME.accent,
                        borderRadius: '4px'
                      }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Stats Inputs Grid */}
              <div>
                <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>⏱️ Daily Stats</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                  {/* Custom Stats (Now INCLUDES Core Stats) */}
                  {customStats.map(stat => {
                    const val = customStatValues.find(v => v.stat_def_id === stat.id)?.value || 0
                    return (
                      <div key={stat.id} style={{
                        background: stat.color ? `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}dd 100%)` : '#3b82f6',
                        padding: '1.5rem',
                        borderRadius: '20px',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: `0 10px 15px -3px ${stat.color}33`,
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteCustomStat(stat.id) }}
                          style={{
                            position: 'absolute', top: '0.75rem', right: '0.75rem',
                            background: 'rgba(0,0,0,0.2)', border: 'none', borderRadius: '50%',
                            width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: 'white', fontSize: '0.8rem', opacity: 0.7,
                            zIndex: 10
                          }}
                          title="Delete Stat"
                        >
                          ✕
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                          <div style={{ fontSize: '1.5rem' }}>{stat.emoji}</div>
                          <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{stat.label}</div>
                        </div>
                        <input
                          type="number"
                          value={val}
                          onChange={(e) => updateCustomStat(stat.id, e.target.value)}
                          style={{
                            width: '100%', background: 'rgba(0,0,0,0.2)', border: 'none',
                            borderRadius: '12px', padding: '0.75rem', color: 'white',
                            fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center'
                          }}
                        />
                      </div>
                    )
                  })}

                  {/* Add Stat Button */}
                  <button
                    onClick={() => setShowAddStat(true)}
                    style={{
                      border: '2px dashed #3f3f46',
                      borderRadius: '16px',
                      background: 'transparent',
                      color: '#a1a1aa',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '1rem',
                      cursor: 'pointer',
                      minHeight: '120px',
                      fontSize: '1rem',
                      fontWeight: '600'
                    }}
                  >
                    <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>+</span>
                    Add Stat
                  </button>
                </div>
              </div>

              {/* Row 3: Nutrition Summary */}
              <div>
                <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>🍎 Nutrition Summary</h3>
                <NutritionStats items={items} logs={logs} />
              </div>

            </div>
          )}

          {/* CHECKLIST SECTIONS (ROUTINE, SUPPLEMENTS, DIET) */}
          {(activeSection === 'ROUTINE' || activeSection === 'SUPPLEMENTS' || activeSection === 'DIET') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {activeSection === 'DIET' && <NutritionStats items={items} logs={logs} />}

              <div style={{
                background: THEME.cardBg,
                borderRadius: '16px',
                border: `1px solid ${THEME.border}`,
                overflow: 'hidden'
              }}>
                {items
                  .filter(item => item.category === (activeSection === 'SUPPLEMENTS' ? 'SUPPLEMENT' : activeSection))
                  .map((item) => {
                    const isDone = logs.some(l => l.checklist_item_id === item.id && l.is_done)
                    const log = logs.find(l => l.checklist_item_id === item.id)

                    return (
                      <div
                        key={item.id}
                        style={{
                          padding: '1rem 1.5rem',
                          borderBottom: `1px solid ${THEME.border}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: isDone ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                          <div
                            onClick={() => toggleChecklistItem(item)}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '6px',
                              border: isDone ? 'none' : `2px solid ${THEME.textMuted}`,
                              background: isDone ? '#10b981' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              color: 'white',
                              flexShrink: 0
                            }}
                          >
                            {isDone && '✓'}
                          </div>

                          <div>
                            <div style={{
                              fontWeight: '500',
                              fontSize: '1rem',
                              textDecoration: isDone ? 'line-through' : 'none',
                              color: isDone ? THEME.textMuted : THEME.text
                            }}>
                              {item.name}
                            </div>
                            {item.metadata && (
                              <div style={{ fontSize: '0.8rem', color: THEME.textMuted, marginTop: '2px' }}>
                                {Object.entries(item.metadata).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Diet Input Field */}
                        {item.category === 'DIET' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <input
                              type="number"
                              placeholder="0"
                              value={log?.value || ''}
                              onChange={(e) => updateDietValue(item, e.target.value)}
                              style={{
                                width: '80px',
                                padding: '0.5rem',
                                borderRadius: '6px',
                                border: `1px solid ${THEME.border}`,
                                background: THEME.activeBg,
                                color: 'white',
                                textAlign: 'center'
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); openEditModal(item); }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: THEME.accent,
                              cursor: 'pointer',
                              padding: '0.5rem'
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteItem(item.id) }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              opacity: 0.5,
                              cursor: 'pointer',
                              padding: '0.5rem'
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    )
                  })}

                {/* Empty State */}
                {items.filter(item => item.category === (activeSection === 'SUPPLEMENTS' ? 'SUPPLEMENT' : activeSection)).length === 0 && (
                  <div style={{ padding: '3rem', textAlign: 'center', color: THEME.textMuted }}>
                    No items in this section yet.
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setNewItem({ ...newItem, category: activeSection === 'SUPPLEMENTS' ? 'SUPPLEMENT' : activeSection as any });
                  setShowAddItem(true);
                }}
                style={{
                  alignSelf: 'flex-start',
                  background: 'transparent',
                  border: `1px dashed ${THEME.textMuted}`,
                  color: THEME.textMuted,
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                + Add New Item
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Modals */}
      {showStreaks && <StreakCalendar onClose={() => setShowStreaks(false)} />}

      {showAddStat && (
        <AddStatModal
          onClose={() => setShowAddStat(false)}
          onAdded={() => loadChecklistData()}
        />
      )}

      {showNotesModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ background: THEME.cardBg, padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '600px', border: `1px solid ${THEME.border}` }}>
            <h2 style={{ marginTop: 0 }}>Values & Notes</h2>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              style={{
                width: '100%', height: '200px', padding: '1rem',
                background: THEME.activeBg, border: `1px solid ${THEME.border}`,
                borderRadius: '8px', color: 'white', marginTop: '1rem',
                resize: 'vertical'
              }}
              placeholder="Reflect on your day..."
            />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowNotesModal(false)} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: `1px solid ${THEME.border}`, color: 'white', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveNote} style={{ padding: '0.75rem 1.5rem', background: THEME.accent, border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Save Note</button>
            </div>
          </div>
        </div>
      )}

      {showTodosModal && (
        <TagBasedTodoModal
          isOpen={showTodosModal}
          onClose={() => setShowTodosModal(false)}
          isMobile={isMobile}
        />
      )}

      {showAddStat && (
        <AddStatModal
          onClose={() => setShowAddStat(false)}
          onAdded={() => loadChecklistData()}
        />
      )}

      {/* Add Item Modal */}
      {showAddItem && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ background: THEME.cardBg, padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '500px', border: `1px solid ${THEME.border}` }}>
            <h2 style={{ marginTop: 0, color: 'white' }}>Add New Item</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              <input
                type="text"
                placeholder="Item name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                style={{ padding: '0.75rem', background: THEME.activeBg, border: `1px solid ${THEME.border}`, borderRadius: '8px', color: 'white' }}
              />

              {activeSection === 'DIET' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input type="number" placeholder="Calories" onChange={e => setNewItem({ ...newItem, calories: parseFloat(e.target.value) })} style={{ padding: '0.5rem', background: THEME.activeBg, border: `1px solid ${THEME.border}`, borderRadius: '8px', color: 'white' }} />
                  <input type="number" placeholder="Protein" onChange={e => setNewItem({ ...newItem, protein: parseFloat(e.target.value) })} style={{ padding: '0.5rem', background: THEME.activeBg, border: `1px solid ${THEME.border}`, borderRadius: '8px', color: 'white' }} />
                  <input type="number" placeholder="Carbs" onChange={e => setNewItem({ ...newItem, carbs: parseFloat(e.target.value) })} style={{ padding: '0.5rem', background: THEME.activeBg, border: `1px solid ${THEME.border}`, borderRadius: '8px', color: 'white' }} />
                  <input type="number" placeholder="Fats" onChange={e => setNewItem({ ...newItem, fats: parseFloat(e.target.value) })} style={{ padding: '0.5rem', background: THEME.activeBg, border: `1px solid ${THEME.border}`, borderRadius: '8px', color: 'white' }} />
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button onClick={() => setShowAddItem(false)} style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: `1px solid ${THEME.border}`, color: 'white', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button onClick={addNewItem} style={{ flex: 1, padding: '0.75rem', background: THEME.accent, border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Add Item</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditItem && editingItem && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ background: THEME.cardBg, padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '500px', border: `1px solid ${THEME.border}` }}>
            <h2 style={{ marginTop: 0, color: 'white' }}>Edit Item</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              <input
                type="text"
                placeholder="Item name"
                value={editingItem.name}
                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                style={{ padding: '0.75rem', background: THEME.activeBg, border: `1px solid ${THEME.border}`, borderRadius: '8px', color: 'white' }}
              />

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button onClick={() => setShowEditItem(false)} style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: `1px solid ${THEME.border}`, color: 'white', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button onClick={updateItem} style={{ flex: 1, padding: '0.75rem', background: THEME.accent, border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Update</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation (Mobile Only) */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(9, 9, 11, 0.95)',
          backdropFilter: 'blur(16px)',
          borderTop: `1px solid ${THEME.border}`,
          display: 'flex',
          justifyContent: 'space-around',
          padding: '0.75rem 0.5rem',
          zIndex: 50,
          paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))'
        }}>
          {[
            { id: 'OVERVIEW', label: 'Home', icon: '🏠' },
            { id: 'ROUTINE', label: 'Routine', icon: '📅' },
            { id: 'SUPPLEMENTS', label: 'Vitamins', icon: '💊' },
            { id: 'DIET', label: 'Diet', icon: '🍽️' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as any)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                background: 'transparent',
                border: 'none',
                color: activeSection === item.id ? THEME.accent : THEME.textMuted,
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: activeSection === item.id ? '600' : '500'
              }}
            >
              <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}

    </div>
  )
}
