import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import type { Streak, DailyStat, DailyChecklist, ChecklistItem, Note, ChecklistTodo, TodoTag } from '../../types'

interface StreakCalendarProps {
  onClose: () => void
}

export const StreakCalendar = ({ onClose }: StreakCalendarProps) => {
  const { user } = useAuth()
  const [streaks, setStreaks] = useState<Streak[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [dayData, setDayData] = useState<{
    stats: DailyStat | null
    checklists: DailyChecklist[]
    items: ChecklistItem[]
    note: Note | null
    todos: ChecklistTodo[]
    todoTags: TodoTag[]
  } | null>(null)
  const [loadingDayData, setLoadingDayData] = useState(false)

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

  useEffect(() => {
    loadStreaks()
    loadNotes()
  }, [user, currentMonth])

  const loadStreaks = async () => {
    if (!user) return
    setLoading(true)
    try {
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

      const { data } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth.toISOString().split('T')[0])

      if (data) {
        setStreaks(data)
      }
    } catch (error) {
      console.error('Error loading streaks:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadNotes = async () => {
    if (!user) return
    try {
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

      const { data } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth.toISOString().split('T')[0])

      if (data) {
        setNotes(data)
      }
    } catch (error) {
      console.error('Error loading notes:', error)
    }
  }

  const hasNote = (dateStr: string) => {
    return notes.some(n => n.date === dateStr)
  }

  const loadDayData = async (dateStr: string) => {
    if (!user) return
    setLoadingDayData(true)
    setSelectedDate(dateStr)

    try {
      const { data: statsData } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', dateStr)
        .single()

      const { data: checklistData } = await supabase
        .from('daily_checklists')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', dateStr)

      const { data: itemsData } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('user_id', user.id)
        .order('order_index', { ascending: true })

      const { data: noteData } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', dateStr)
        .single()

      // Fetch TODOs for this date
      const { data: todosData } = await supabase
        .from('checklist_todos')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', dateStr)
        .order('created_at', { ascending: true })

      // Fetch all todo tags
      const { data: todoTagsData } = await supabase
        .from('todo_tags')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      setDayData({
        stats: statsData || null,
        checklists: checklistData || [],
        items: itemsData || [],
        note: noteData || null,
        todos: todosData || [],
        todoTags: todoTagsData || []
      })
    } catch (error) {
      console.error('Error loading day data:', error)
    } finally {
      setLoadingDayData(false)
    }
  }


  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const days = []
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }





  const isStreakDay = (day: number | null) => {
    if (!day) return false
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const streak = streaks.find(s => s.date === dateStr)
    return streak?.is_success
  }

  const handleDayClick = (day: number | null) => {
    if (!day) return
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    loadDayData(dateStr)
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
    setSelectedDate(null)
    setDayData(null)
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
    setSelectedDate(null)
    setDayData(null)
  }

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })

  const getCompletedCount = () => {
    if (!dayData) return { completed: 0, total: 0 }
    const completed = dayData.checklists.filter(c => c.is_done).length
    const total = dayData.items.filter(i => i.category === 'ROUTINE' || i.category === 'SUPPLEMENT').length
    return { completed, total }
  }

  const calculateNutrition = () => {
    if (!dayData) return { calories: 0, protein: 0, carbs: 0, fiber: 0, fats: 0, water: 0, caloriesBurned: 0 }

    let totalCalories = 0
    let totalProtein = 0
    let totalCarbs = 0
    let totalFiber = 0
    let totalFats = 0
    let totalWater = 0
    let caloriesBurned = 0

    const dietItems = dayData.items.filter(i => i.category === 'DIET')
    const routineItems = dayData.items.filter(i => i.category === 'ROUTINE')

    dietItems.forEach(item => {
      const log = dayData.checklists.find(l => l.checklist_item_id === item.id)
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

    routineItems.forEach(item => {
      const log = dayData.checklists.find(l => l.checklist_item_id === item.id)
      const metadata = item.metadata as any

      if (log && log.is_done && metadata?.calories_burn) {
        caloriesBurned += metadata.calories_burn
      }
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

  const getDaysAgo = (originalDate: string, currentDate: string) => {
    if (originalDate === currentDate) return 0
    const orig = new Date(originalDate)
    const curr = new Date(currentDate)
    const diffTime = Math.abs(curr.getTime() - orig.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (

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
      padding: isMobile ? '0.5rem' : '1rem'
    }}>
      <div style={{
        background: 'rgba(24, 24, 27, 0.7)', // Glass Dark
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: isMobile ? '1rem' : '2rem',
        borderRadius: isMobile ? '20px' : '24px',
        maxWidth: selectedDate && !isMobile ? '1000px' : isMobile ? '100%' : '650px',
        width: '100%',
        maxHeight: '95vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        transition: 'all 0.3s ease',
        color: 'white'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isMobile ? '0.75rem' : '1.5rem'
        }}>
          <h2 style={{ margin: 0, fontSize: isMobile ? '1.2rem' : '1.8rem', color: 'white' }}>🔥 Streak Calendar</h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px', height: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem',
              cursor: 'pointer',
              color: 'white',
              transition: 'background 0.2s'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: selectedDate && !isMobile ? 'row' : 'column',
          gap: isMobile ? '1rem' : '2rem'
        }}>
          {/* Calendar */}
          <div style={{
            flex: selectedDate && !isMobile ? '0 0 400px' : '1',
            minWidth: 'auto',
            width: '100%'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem'
            }}>
              <button onClick={previousMonth} style={{
                background: '#667eea',
                color: 'white',
                border: 'none',
                padding: isMobile ? '0.5rem 0.75rem' : '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: isMobile ? '1rem' : '1.2rem'
              }}>
                ←
              </button>
              <span style={{
                fontWeight: 'bold',
                fontSize: isMobile ? '0.85rem' : '1.1rem',
                textAlign: 'center'
              }}>
                {monthName}
              </span>
              <button onClick={nextMonth} style={{
                background: '#667eea',
                color: 'white',
                border: 'none',
                padding: isMobile ? '0.5rem 0.75rem' : '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: isMobile ? '1rem' : '1.2rem'
              }}>
                →
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: isMobile ? '0.25rem' : '0.5rem',
              marginBottom: isMobile ? '0.5rem' : '1rem'
            }}>
              {(isMobile ? ['S', 'M', 'T', 'W', 'T', 'F', 'S'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).map((day, idx) => (
                <div key={idx} style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: isMobile ? '0.65rem' : '0.875rem',
                  color: '#a1a1aa'
                }}>
                  {day}
                </div>
              ))}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{
                  display: 'inline-block',
                  width: '40px',
                  height: '40px',
                  border: '4px solid rgba(102, 126, 234, 0.2)',
                  borderTop: '4px solid #667eea',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: isMobile ? '0.25rem' : '0.5rem'
              }}>
                {getDaysInMonth().map((day, index) => {
                  const dateStr = day ? `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null
                  const isSelected = dateStr === selectedDate
                  const hasNoteMarker = dateStr && hasNote(dateStr)

                  return (
                    <div
                      key={index}
                      onClick={() => handleDayClick(day)}
                      style={{
                        position: 'relative',
                        aspectRatio: '1',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: isMobile ? '6px' : '8px',
                        background: day === null ? 'transparent' :
                          isSelected ? '#60a5fa' :
                            isStreakDay(day) ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        color: day === null ? 'transparent' :
                          isSelected ? 'white' :
                            isStreakDay(day) ? '#4ade80' :
                              (day && !isStreakDay(day) && new Date(dateStr!) < new Date()) ? '#f87171' : 'white',
                        fontWeight: 'bold',
                        fontSize: isMobile ? '0.7rem' : '0.9rem',
                        cursor: day ? 'pointer' : 'default',
                        transition: 'all 0.2s ease',
                        border: isSelected ? '2px solid #3b82f6' :
                          isStreakDay(day) ? '1px solid rgba(74, 222, 128, 0.3)' :
                            '1px solid rgba(255, 255, 255, 0.05)',
                        boxShadow: isSelected ? '0 0 15px rgba(59, 130, 246, 0.4)' : 'none'
                      }}
                    >
                      {day}
                      {hasNoteMarker && (
                        <div style={{
                          position: 'absolute',
                          top: isMobile ? '2px' : '4px',
                          right: isMobile ? '2px' : '4px',
                          width: isMobile ? '4px' : '6px',
                          height: isMobile ? '4px' : '6px',
                          background: '#000',
                          borderRadius: '50%',
                          boxShadow: '0 0 3px rgba(0,0,0,0.5)'
                        }}></div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            <div style={{
              marginTop: isMobile ? '0.75rem' : '1.5rem',
              display: 'flex',
              gap: isMobile ? '0.5rem' : '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{
                  width: isMobile ? '14px' : '20px',
                  height: isMobile ? '14px' : '20px',
                  background: '#4ade80',
                  borderRadius: '4px'
                }}></div>
                <span style={{ fontSize: isMobile ? '0.7rem' : '0.875rem' }}>Complete</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{
                  width: isMobile ? '14px' : '20px',
                  height: isMobile ? '14px' : '20px',
                  background: '#fee2e2',
                  borderRadius: '4px'
                }}></div>
                <span style={{ fontSize: isMobile ? '0.7rem' : '0.875rem' }}>Missed</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{
                  width: isMobile ? '14px' : '20px',
                  height: isMobile ? '14px' : '20px',
                  background: 'white',
                  border: '2px solid #000',
                  borderRadius: '4px',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '1px',
                    right: '1px',
                    width: isMobile ? '3px' : '4px',
                    height: isMobile ? '3px' : '4px',
                    background: '#000',
                    borderRadius: '50%'
                  }}></div>
                </div>
                <span style={{ fontSize: isMobile ? '0.7rem' : '0.875rem' }}>Note</span>
              </div>
            </div>
          </div>

          {/* Day Details */}
          {selectedDate && (
            <div style={{
              flex: 1,
              borderLeft: isMobile ? 'none' : '2px solid #e0e0e0',
              borderTop: isMobile ? '2px solid #e0e0e0' : 'none',
              paddingLeft: isMobile ? '0' : '2rem',
              paddingTop: isMobile ? '1rem' : '0',
              minWidth: 'auto',
              width: '100%',
              maxHeight: isMobile ? 'none' : '600px',
              overflowY: 'auto'
            }}>
              <h3 style={{
                marginBottom: '1rem',
                color: '#60a5fa', // Blue-400
                fontSize: isMobile ? '0.9rem' : '1.3rem',
                position: isMobile ? 'static' : 'sticky',
                top: 0,
                background: 'rgba(24, 24, 27, 0.95)', // Match Modal Bg
                paddingBottom: '0.5rem',
                zIndex: 10,
                backdropFilter: 'blur(10px)'
              }}>
                📅 {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: isMobile ? 'short' : 'long',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h3>

              {loadingDayData ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{
                    display: 'inline-block',
                    width: '40px',
                    height: '40px',
                    border: '4px solid rgba(102, 126, 234, 0.2)',
                    borderTop: '4px solid #667eea',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <p style={{ marginTop: '1rem', color: '#666', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>Loading...</p>
                </div>
              ) : dayData ? (
                <>
                  {/* Note Display */}
                  {dayData.note && (
                    <div style={{
                      marginBottom: '1rem',
                      background: 'linear-gradient(135deg, #fff9e6 0%, #ffe8b3 100%)',
                      padding: isMobile ? '0.75rem' : '1rem',
                      borderRadius: isMobile ? '8px' : '12px',
                      border: '2px solid #ffd700'
                    }}>
                      <h4 style={{
                        marginBottom: '0.5rem',
                        color: '#b8860b',
                        fontSize: isMobile ? '0.8rem' : '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        📝 Note
                      </h4>
                      <p style={{
                        margin: 0,
                        color: '#666',
                        fontSize: isMobile ? '0.75rem' : '0.9rem',
                        lineHeight: '1.5',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}>
                        {dayData.note.content}
                      </p>
                    </div>
                  )}

                  {/* Stats */}
                  {dayData.stats && (
                    <div style={{
                      marginBottom: '1rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      padding: isMobile ? '0.75rem' : '1rem',
                      borderRadius: isMobile ? '8px' : '12px',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <h4 style={{ marginBottom: '0.75rem', color: '#e4e4e7', fontSize: isMobile ? '0.85rem' : '1rem' }}>📊 Stats</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: isMobile ? '0.75rem' : '0.85rem' }}>
                        <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', color: '#d4d4d8' }}>
                          <span>⚡ Energy:</span>
                          <strong style={{ float: 'right', color: 'white' }}>{dayData.stats.energy_level}/10</strong>
                        </div>
                        <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', color: '#d4d4d8' }}>
                          <span>🎯 Focus:</span>
                          <strong style={{ float: 'right', color: 'white' }}>{dayData.stats.focus_level}/10</strong>
                        </div>
                        <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', color: '#d4d4d8' }}>
                          <span>💯 Consistent:</span>
                          <strong style={{ float: 'right', color: 'white' }}>{dayData.stats.consistency ? '✅' : '❌'}</strong>
                        </div>
                        <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', color: '#d4d4d8' }}>
                          <span>🧠 DSA:</span>
                          <strong style={{ float: 'right', color: 'white' }}>{dayData.stats.dsa_hours || 0}h</strong>
                        </div>
                        <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', color: '#d4d4d8' }}>
                          <span>📐 LLD:</span>
                          <strong style={{ float: 'right', color: 'white' }}>{dayData.stats.lld_hours || 0}h</strong>
                        </div>
                        <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', color: '#d4d4d8' }}>
                          <span>✅ Problems:</span>
                          <strong style={{ float: 'right', color: 'white' }}>{dayData.stats.problems_solved || 0}</strong>
                        </div>
                        <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', color: '#d4d4d8' }}>
                          <span>💪 Gym:</span>
                          <strong style={{ float: 'right', color: 'white' }}>{dayData.stats.gym_hours || 0}h</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TODOs Section */}
                  {dayData.todos && dayData.todos.length > 0 && selectedDate && (
                    <div style={{
                      marginBottom: '1rem',
                      background: 'linear-gradient(135deg, #f0f4ff 0%, #e0e8ff 100%)',
                      padding: isMobile ? '0.75rem' : '1rem',
                      borderRadius: isMobile ? '8px' : '12px',
                      border: '1px solid #c7d2fe'
                    }}>
                      <h4 style={{ marginBottom: '0.75rem', color: '#333', fontSize: isMobile ? '0.85rem' : '1rem' }}>📝 TODOs</h4>

                      {/* Group todos by tag */}
                      {dayData.todoTags.filter(tag =>
                        dayData.todos.some(todo => todo.tag_id === tag.id)
                      ).map(tag => {
                        const tagTodos = dayData.todos.filter(todo => todo.tag_id === tag.id)
                        const completedCount = tagTodos.filter(t => t.is_done).length
                        const totalCount = tagTodos.length

                        return (
                          <div key={tag.id} style={{ marginBottom: '0.75rem' }}>
                            {/* Tag Header */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              marginBottom: '0.5rem',
                              padding: '0.5rem',
                              background: 'white',
                              borderRadius: '8px',
                              border: `2px solid ${tag.color}`
                            }}>
                              <div style={{
                                width: '16px',
                                height: '16px',
                                background: tag.color,
                                borderRadius: '4px'
                              }}></div>
                              <span style={{
                                flex: 1,
                                fontWeight: '600',
                                fontSize: isMobile ? '0.8rem' : '0.9rem',
                                color: '#333'
                              }}>
                                {tag.name}
                              </span>
                              <span style={{
                                background: completedCount === totalCount
                                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                  : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                color: 'white',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '10px',
                                fontSize: isMobile ? '0.7rem' : '0.75rem',
                                fontWeight: '700'
                              }}>
                                {completedCount}/{totalCount}
                              </span>
                            </div>

                            {/* Todo Items */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              {tagTodos.map(todo => {
                                const daysAgo = getDaysAgo(todo.original_date, selectedDate)
                                return (
                                  <div key={todo.id} style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '0.5rem',
                                    padding: '0.5rem',
                                    background: todo.is_done ? '#dcfce7' : 'white',
                                    borderRadius: '6px',
                                    border: `1px solid ${todo.is_done ? '#86efac' : '#e0e0e0'}`,
                                    fontSize: isMobile ? '0.75rem' : '0.85rem'
                                  }}>
                                    <span style={{
                                      flexShrink: 0,
                                      color: todo.is_done ? '#16a34a' : '#9ca3af'
                                    }}>
                                      {todo.is_done ? '✅' : '⬜'}
                                    </span>
                                    <div style={{ flex: 1 }}>
                                      <span style={{
                                        textDecoration: todo.is_done ? 'line-through' : 'none',
                                        color: todo.is_done ? '#666' : '#333',
                                        wordBreak: 'break-word'
                                      }}>
                                        {todo.task}
                                      </span>
                                      {daysAgo > 0 && (
                                        <span style={{
                                          display: 'inline-block',
                                          marginLeft: '0.5rem',
                                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                          color: 'white',
                                          padding: '0.15rem 0.4rem',
                                          borderRadius: '4px',
                                          fontSize: isMobile ? '0.6rem' : '0.7rem',
                                          fontWeight: '600'
                                        }}>
                                          📅 {daysAgo}d ago
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}

                      {/* Todos without tags */}
                      {dayData.todos.filter(todo => !dayData.todoTags.some(tag => tag.id === todo.tag_id)).length > 0 && (
                        <div style={{ marginBottom: '0.75rem' }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.5rem',
                            padding: '0.5rem',
                            background: 'white',
                            borderRadius: '8px',
                            border: '2px solid #9ca3af'
                          }}>
                            <div style={{
                              width: '16px',
                              height: '16px',
                              background: '#9ca3af',
                              borderRadius: '4px'
                            }}></div>
                            <span style={{
                              flex: 1,
                              fontWeight: '600',
                              fontSize: isMobile ? '0.8rem' : '0.9rem',
                              color: '#666'
                            }}>
                              Other
                            </span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {dayData.todos.filter(todo => !dayData.todoTags.some(tag => tag.id === todo.tag_id)).map(todo => {
                              const daysAgo = getDaysAgo(todo.original_date, selectedDate)
                              return (
                                <div key={todo.id} style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '0.5rem',
                                  padding: '0.5rem',
                                  background: todo.is_done ? '#dcfce7' : 'white',
                                  borderRadius: '6px',
                                  border: `1px solid ${todo.is_done ? '#86efac' : '#e0e0e0'}`,
                                  fontSize: isMobile ? '0.75rem' : '0.85rem'
                                }}>
                                  <span style={{
                                    flexShrink: 0,
                                    color: todo.is_done ? '#16a34a' : '#9ca3af'
                                  }}>
                                    {todo.is_done ? '✅' : '⬜'}
                                  </span>
                                  <div style={{ flex: 1 }}>
                                    <span style={{
                                      textDecoration: todo.is_done ? 'line-through' : 'none',
                                      color: todo.is_done ? '#666' : '#333',
                                      wordBreak: 'break-word'
                                    }}>
                                      {todo.task}
                                    </span>
                                    {daysAgo > 0 && (
                                      <span style={{
                                        display: 'inline-block',
                                        marginLeft: '0.5rem',
                                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                        color: 'white',
                                        padding: '0.15rem 0.4rem',
                                        borderRadius: '4px',
                                        fontSize: isMobile ? '0.6rem' : '0.7rem',
                                        fontWeight: '600'
                                      }}>
                                        📅 {daysAgo}d ago
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Nutrition */}
                  {(() => {
                    const nutrition = calculateNutrition()
                    const netCalories = nutrition.calories - nutrition.caloriesBurned
                    return (
                      <div style={{
                        marginBottom: '1rem',
                        background: 'linear-gradient(135deg, #e8fff0 0%, #d0ffe0 100%)',
                        padding: isMobile ? '0.75rem' : '1rem',
                        borderRadius: isMobile ? '8px' : '12px',
                        border: '1px solid #b3ffc8'
                      }}>
                        <h4 style={{ marginBottom: '0.75rem', color: '#333', fontSize: isMobile ? '0.85rem' : '1rem' }}>🍽️ Nutrition</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: isMobile ? '0.75rem' : '0.85rem' }}>
                          <div style={{ padding: '0.5rem', background: 'white', borderRadius: '6px' }}>
                            <span>🔥 Net:</span>
                            <strong style={{ float: 'right', color: netCalories < 0 ? '#dc2626' : '#16a34a' }}>
                              {netCalories}
                            </strong>
                          </div>
                          <div style={{ padding: '0.5rem', background: 'white', borderRadius: '6px', fontSize: isMobile ? '0.65rem' : '0.75rem', color: '#666' }}>
                            <span>{nutrition.calories} in</span>
                            <span style={{ float: 'right' }}>-{nutrition.caloriesBurned}</span>
                          </div>
                          <div style={{ padding: '0.5rem', background: 'white', borderRadius: '6px' }}>
                            <span>💪 Protein:</span>
                            <strong style={{ float: 'right' }}>{nutrition.protein}g</strong>
                          </div>
                          <div style={{ padding: '0.5rem', background: 'white', borderRadius: '6px' }}>
                            <span>🥑 Fats:</span>
                            <strong style={{ float: 'right' }}>{nutrition.fats}g</strong>
                          </div>
                          <div style={{ padding: '0.5rem', background: 'white', borderRadius: '6px' }}>
                            <span>🍞 Carbs:</span>
                            <strong style={{ float: 'right' }}>{nutrition.carbs}g</strong>
                          </div>
                          <div style={{ padding: '0.5rem', background: 'white', borderRadius: '6px' }}>
                            <span>🌾 Fiber:</span>
                            <strong style={{ float: 'right' }}>{nutrition.fiber}g</strong>
                          </div>
                          <div style={{ padding: '0.5rem', background: 'white', borderRadius: '6px', gridColumn: 'span 2' }}>
                            <span>💧 Water:</span>
                            <strong style={{ float: 'right' }}>{nutrition.water}L</strong>
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Checklist Progress */}
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ marginBottom: '0.75rem', color: '#333', fontSize: isMobile ? '0.85rem' : '1rem' }}>✅ Progress</h4>
                    <div style={{
                      background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                      borderRadius: isMobile ? '8px' : '12px',
                      padding: isMobile ? '0.75rem' : '1rem',
                      fontSize: isMobile ? '1rem' : '1.2rem',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      color: '#2e7d32',
                      border: '2px solid #4caf50'
                    }}>
                      {getCompletedCount().completed} / {getCompletedCount().total}
                    </div>
                  </div>

                  {/* Completed Items */}
                  {dayData.checklists.filter(c => c.is_done).length > 0 && (
                    <div>
                      <h4 style={{ marginBottom: '0.75rem', color: '#333', fontSize: isMobile ? '0.85rem' : '1rem' }}>✅ Completed</h4>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        maxHeight: isMobile ? '150px' : '200px',
                        overflowY: 'auto'
                      }}>
                        {dayData.checklists.filter(c => c.is_done).map(log => {
                          const item = dayData.items.find(i => i.id === log.checklist_item_id)
                          return item ? (
                            <div key={log.id} style={{
                              padding: '0.5rem 0.75rem',
                              background: '#e8f5e9',
                              borderRadius: '8px',
                              fontSize: isMobile ? '0.75rem' : '0.85rem',
                              color: '#2e7d32',
                              border: '1px solid #c8e6c9',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              wordBreak: 'break-word'
                            }}>
                              <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>✓</span>
                              {item.name}
                            </div>
                          ) : null
                        })}
                      </div>
                    </div>
                  )}

                  {/* No data state */}
                  {!dayData.stats && dayData.checklists.length === 0 && !dayData.note && (
                    <div style={{
                      textAlign: 'center',
                      padding: '2rem',
                      color: '#999',
                      fontStyle: 'italic',
                      fontSize: isMobile ? '0.8rem' : '0.9rem'
                    }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                      <p>No data for this day</p>
                    </div>
                  )}
                </>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: '#999',
                  fontStyle: 'italic',
                  fontSize: isMobile ? '0.8rem' : '0.9rem'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                  <p>No data for this day</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
