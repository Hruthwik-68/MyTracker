import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import type { Streak, DailyStat, DailyChecklist, ChecklistItem } from '../../types'

interface StreakCalendarProps {
  onClose: () => void
}

export const StreakCalendar = ({ onClose }: StreakCalendarProps) => {
  const { user } = useAuth()
  const [streaks, setStreaks] = useState<Streak[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [dayData, setDayData] = useState<{
    stats: DailyStat | null
    checklists: DailyChecklist[]
    items: ChecklistItem[]
  } | null>(null)
  const [loadingDayData, setLoadingDayData] = useState(false)

  useEffect(() => {
    loadStreaks()
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

  const loadDayData = async (dateStr: string) => {
    if (!user) return
    setLoadingDayData(true)
    setSelectedDate(dateStr)

    try {
      // Load stats
      const { data: statsData } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', dateStr)
        .single()

      // Load checklists
      const { data: checklistData } = await supabase
        .from('daily_checklists')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', dateStr)

      // Load checklist items
      const { data: itemsData } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('user_id', user.id)
        .order('order_index', { ascending: true })

      setDayData({
        stats: statsData || null,
        checklists: checklistData || [],
        items: itemsData || []
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
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '16px',
        maxWidth: selectedDate ? '1000px' : '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.8rem' }}>🔥 Streak Calendar</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#333'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          {/* Calendar */}
          <div style={{ flex: selectedDate ? '0 0 400px' : '1', minWidth: '350px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <button onClick={previousMonth} style={{
                background: '#667eea',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#5568d3'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
              >
                ←
              </button>
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{monthName}</span>
              <button onClick={nextMonth} style={{
                background: '#667eea',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#5568d3'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
              >
                →
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  color: '#666'
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
                gap: '0.5rem'
              }}>
                {getDaysInMonth().map((day, index) => {
                  const dateStr = day ? `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null
                  const isSelected = dateStr === selectedDate
                  
                  return (
                    <div
                      key={index}
                      onClick={() => handleDayClick(day)}
                      style={{
                        aspectRatio: '1',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: '8px',
                        background: day === null ? 'transparent' : 
                                   isSelected ? '#667eea' :
                                   isStreakDay(day) ? '#4ade80' : 
                                   '#fee2e2',
                        color: day === null ? 'transparent' : 
                               isSelected ? 'white' :
                               isStreakDay(day) ? 'white' : '#dc2626',
                        fontWeight: 'bold',
                        cursor: day ? 'pointer' : 'default',
                        transition: 'all 0.2s ease',
                        border: isSelected ? '3px solid #764ba2' : 'none',
                        boxShadow: isSelected ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (day && !isSelected) {
                          e.currentTarget.style.transform = 'scale(1.1)'
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      {day}
                    </div>
                  )
                })}
              </div>
            )}

            <div style={{
              marginTop: '1.5rem',
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  background: '#4ade80',
                  borderRadius: '4px'
                }}></div>
                <span style={{ fontSize: '0.875rem' }}>Completed</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  background: '#fee2e2',
                  borderRadius: '4px'
                }}></div>
                <span style={{ fontSize: '0.875rem' }}>Missed</span>
              </div>
            </div>
          </div>

          {/* Day Details */}
          {selectedDate && (
            <div style={{ 
              flex: 1, 
              borderLeft: '2px solid #e0e0e0', 
              paddingLeft: '2rem',
              minWidth: '300px'
            }}>
              <h3 style={{ marginBottom: '1rem', color: '#667eea', fontSize: '1.3rem' }}>
                📅 {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
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
                  <p style={{ marginTop: '1rem', color: '#666' }}>Loading day data...</p>
                </div>
              ) : dayData ? (
                <>
                  {/* Stats */}
                  {dayData.stats && (
                    <div style={{ 
                      marginBottom: '1.5rem',
                      background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%)',
                      padding: '1.25rem',
                      borderRadius: '12px',
                      border: '1px solid #e0e7ff'
                    }}>
                      <h4 style={{ marginBottom: '1rem', color: '#333', fontSize: '1.1rem' }}>📊 Daily Stats</h4>
                      <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.95rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>⚡ Energy:</span>
                          <strong>{dayData.stats.energy_level}/10</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>🎯 Focus:</span>
                          <strong>{dayData.stats.focus_level}/10</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>💯 Consistency:</span>
                          <strong>{dayData.stats.consistency ? '✅ Yes' : '❌ No'}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>🧠 DSA Hours:</span>
                          <strong>{dayData.stats.dsa_hours ?? 0}h</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>📐 LLD Hours:</span>
                          <strong>{dayData.stats.lld_hours ?? 0}h</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>✅ Problems Solved:</span>
                          <strong>{dayData.stats.problems_solved ?? 0}</strong>
                        </div>
                        {(dayData.stats.water_litres ?? 0) > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>💧 Water:</span>
                            <strong>{dayData.stats.water_litres}L</strong>
                          </div>
                        )}
                        {(dayData.stats.sleep_hours ?? 0) > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>🛌 Sleep:</span>
                            <strong>{dayData.stats.sleep_hours}h</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Checklist Progress */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ marginBottom: '0.75rem', color: '#333', fontSize: '1.1rem' }}>✅ Checklist Progress</h4>
                    <div style={{
                      background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      fontSize: '1.3rem',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      color: '#2e7d32',
                      border: '2px solid #4caf50'
                    }}>
                      {getCompletedCount().completed} / {getCompletedCount().total} completed
                    </div>
                  </div>

                  {/* Completed Items */}
                  {dayData.checklists.filter(c => c.is_done).length > 0 && (
                    <div>
                      <h4 style={{ marginBottom: '0.75rem', color: '#333', fontSize: '1.1rem' }}>✅ Completed Tasks</h4>
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '0.5rem',
                        maxHeight: '300px',
                        overflowY: 'auto'
                      }}>
                        {dayData.checklists.filter(c => c.is_done).map(log => {
                          const item = dayData.items.find(i => i.id === log.checklist_item_id)
                          return item ? (
                            <div key={log.id} style={{
                              padding: '0.75rem 1rem',
                              background: '#e8f5e9',
                              borderRadius: '8px',
                              fontSize: '0.9rem',
                              color: '#2e7d32',
                              border: '1px solid #c8e6c9',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              <span style={{ fontSize: '1rem' }}>✓</span>
                              {item.name}
                            </div>
                          ) : null
                        })}
                      </div>
                    </div>
                  )}

                  {/* No data state */}
                  {!dayData.stats && dayData.checklists.length === 0 && (
                    <div style={{
                      textAlign: 'center',
                      padding: '2rem',
                      color: '#999',
                      fontStyle: 'italic'
                    }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                      <p>No data recorded for this day</p>
                    </div>
                  )}
                </>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: '#999',
                  fontStyle: 'italic'
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