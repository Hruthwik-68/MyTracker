import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import type { DailyTodo } from '../../types'

export const TodoList = () => {
  const { user } = useAuth()
  const [todos, setTodos] = useState<DailyTodo[]>([])
  const [loading, setLoading] = useState(true)
  const [newTask, setNewTask] = useState({
    common: '',
    dsa: ''
  })
  const [newPriority, setNewPriority] = useState({
    common: 'MEDIUM' as 'HIGH' | 'MEDIUM' | 'LOW',
    dsa: 'MEDIUM' as 'HIGH' | 'MEDIUM' | 'LOW'
  })

  useEffect(() => {
    loadTodos()
  }, [user])

  const loadTodos = async () => {
    if (!user) return
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]

      const { data } = await supabase
        .from('daily_todos')
        .select('*')
        .eq('user_id', user.id)
        .or(`date.eq.${today},and(date.lt.${today},is_done.eq.false)`)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (data) {
        setTodos(data)
      }
    } catch (error) {
      console.error('Error loading todos:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTodo = async (category: 'COMMON' | 'DSA') => {
    if (!user) return
    
    const task = category === 'COMMON' ? newTask.common : newTask.dsa
    const priority = category === 'COMMON' ? newPriority.common : newPriority.dsa
    
    if (!task.trim()) return

    try {
      const today = new Date().toISOString().split('T')[0]
      
      const { data } = await supabase
        .from('daily_todos')
        .insert([{
          user_id: user.id,
          date: today,
          category,
          task: task.trim(),
          priority,
          is_done: false
        }])
        .select()
        .single()

      if (data) {
        setTodos([data, ...todos])
        if (category === 'COMMON') {
          setNewTask({ ...newTask, common: '' })
          setNewPriority({ ...newPriority, common: 'MEDIUM' })
        } else {
          setNewTask({ ...newTask, dsa: '' })
          setNewPriority({ ...newPriority, dsa: 'MEDIUM' })
        }
      }
    } catch (error) {
      console.error('Error adding todo:', error)
      alert('❌ Failed to add task')
    }
  }

  const toggleTodo = async (todo: DailyTodo) => {
    try {
      const { data } = await supabase
        .from('daily_todos')
        .update({ is_done: !todo.is_done })
        .eq('id', todo.id)
        .select()
        .single()

      if (data) {
        setTodos(todos.map(t => t.id === data.id ? data : t))
      }
    } catch (error) {
      console.error('Error toggling todo:', error)
    }
  }

  const deleteTodo = async (id: string) => {
    if (!confirm('Delete this task?')) return

    try {
      await supabase
        .from('daily_todos')
        .delete()
        .eq('id', id)

      setTodos(todos.filter(t => t.id !== id))
    } catch (error) {
      console.error('Error deleting todo:', error)
      alert('❌ Failed to delete task')
    }
  }

  const changePriority = async (todo: DailyTodo, newPriority: 'HIGH' | 'MEDIUM' | 'LOW') => {
    try {
      const { data } = await supabase
        .from('daily_todos')
        .update({ priority: newPriority })
        .eq('id', todo.id)
        .select()
        .single()

      if (data) {
        setTodos(todos.map(t => t.id === data.id ? data : t))
      }
    } catch (error) {
      console.error('Error updating priority:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return '#ff6b6b'
      case 'MEDIUM': return '#ffd93d'
      case 'LOW': return '#6bcf7f'
      default: return '#999'
    }
  }

  const getPriorityEmoji = (priority: string) => {
    switch (priority) {
      case 'HIGH': return '🔴'
      case 'MEDIUM': return '🟡'
      case 'LOW': return '🟢'
      default: return '⚪'
    }
  }

  const sortTodosByPriority = (todoList: DailyTodo[]) => {
    const priorityOrder: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 }
    return [...todoList].sort((a, b) => {
      if (a.is_done !== b.is_done) {
        return a.is_done ? 1 : -1
      }
      return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1)
    })
  }

  if (loading) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      flexDirection: 'column',
      gap: '1rem',
      padding: '2rem'
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        border: '6px solid rgba(102, 126, 234, 0.2)',
        borderTop: '6px solid #667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <p style={{ color: '#667eea', fontSize: '1.1rem', fontWeight: '600', textAlign: 'center' }}>Loading...</p>
    </div>
  )

  const commonTodos = sortTodosByPriority(todos.filter(t => t.category === 'COMMON'))
  const dsaTodos = sortTodosByPriority(todos.filter(t => t.category === 'DSA'))

  const renderTodoSection = (
    title: string,
    icon: string,
    category: 'COMMON' | 'DSA',
    todoList: DailyTodo[]
  ) => (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '1rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      border: '1px solid #f0f0f0'
    }}>
      <h2 style={{ 
        fontSize: '1.3rem', 
        marginBottom: '1rem', 
        color: '#667eea',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        {icon} {title}
      </h2>

      {/* Add Task Input - Mobile Optimized */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '0.5rem', 
        marginBottom: '1rem'
      }}>
        <input
          type="text"
          value={category === 'COMMON' ? newTask.common : newTask.dsa}
          onChange={(e) => setNewTask({
            ...newTask,
            [category === 'COMMON' ? 'common' : 'dsa']: e.target.value
          })}
          onKeyPress={(e) => e.key === 'Enter' && addTodo(category)}
          placeholder={`Add ${category === 'COMMON' ? 'common' : 'DSA'} task...`}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '0.9rem'
          }}
        />
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select
            value={category === 'COMMON' ? newPriority.common : newPriority.dsa}
            onChange={(e) => setNewPriority({
              ...newPriority,
              [category === 'COMMON' ? 'common' : 'dsa']: e.target.value as 'HIGH' | 'MEDIUM' | 'LOW'
            })}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '0.85rem',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="HIGH">🔴 HIGH</option>
            <option value="MEDIUM">🟡 MED</option>
            <option value="LOW">🟢 LOW</option>
          </select>

          <button
            onClick={() => addTodo(category)}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.85rem'
            }}
          >
            ➕ Add
          </button>
        </div>
      </div>

      {/* Todo List */}
      {todoList.length === 0 ? (
        <p style={{ 
          textAlign: 'center', 
          color: '#999', 
          padding: '1.5rem',
          fontSize: '0.9rem',
          fontStyle: 'italic'
        }}>
          No todos yet
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {todoList.map(todo => {
            const today = new Date().toISOString().split('T')[0]
            const isOld = todo.date < today

            return (
              <div
                key={todo.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  background: todo.is_done 
                    ? 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' 
                    : isOld 
                      ? 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)'
                      : 'white',
                  border: `2px solid ${todo.is_done ? '#4caf50' : isOld ? '#ff9800' : '#e0e0e0'}`,
                  borderRadius: '8px',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Top Row: Checkbox + Task */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={todo.is_done}
                    onChange={() => toggleTodo(todo)}
                    style={{
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                      accentColor: '#4caf50',
                      marginTop: '2px',
                      flexShrink: 0
                    }}
                  />

                  <span style={{
                    flex: 1,
                    textDecoration: todo.is_done ? 'line-through' : 'none',
                    color: todo.is_done ? '#666' : '#333',
                    fontWeight: '500',
                    fontSize: '0.9rem',
                    wordBreak: 'break-word'
                  }}>
                    {todo.task}
                  </span>
                </div>

                {/* Old Task Indicator */}
                {isOld && !todo.is_done && (
                  <div style={{
                    fontSize: '0.7rem',
                    color: '#ff9800',
                    fontWeight: '600',
                    paddingLeft: '26px'
                  }}>
                    📅 From {new Date(todo.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                )}

                {/* Bottom Row: Priority + Delete */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '0.5rem',
                  paddingLeft: '26px'
                }}>
                  {!todo.is_done ? (
                    <select
                      value={todo.priority}
                      onChange={(e) => changePriority(todo, e.target.value as 'HIGH' | 'MEDIUM' | 'LOW')}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        border: `2px solid ${getPriorityColor(todo.priority)}`,
                        borderRadius: '6px',
                        background: 'white',
                        color: getPriorityColor(todo.priority),
                        fontWeight: '700',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      <option value="HIGH">🔴 HIGH</option>
                      <option value="MEDIUM">🟡 MED</option>
                      <option value="LOW">🟢 LOW</option>
                    </select>
                  ) : (
                    <span style={{
                      flex: 1,
                      padding: '0.5rem',
                      background: '#4caf50',
                      color: 'white',
                      borderRadius: '6px',
                      fontWeight: '700',
                      fontSize: '0.75rem',
                      textAlign: 'center'
                    }}>
                      ✓ Done
                    </span>
                  )}

                  <button
                    onClick={() => deleteTodo(todo.id)}
                    title="Delete"
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: '#ff6b6b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      flexShrink: 0
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  return (
    <div style={{ 
      maxWidth: '100%', 
      margin: '0 auto', 
      padding: '0.5rem',
      minHeight: '100vh',
      background: '#f5f7fa'
    }}>
      <h1 style={{ 
        fontSize: '1.5rem', 
        marginBottom: '1rem', 
        color: '#333',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0 0.5rem'
      }}>
        📝 Daily Todo
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {renderTodoSection('Common Tasks', '💼', 'COMMON', commonTodos)}
        {renderTodoSection('DSA Plan', '🧠', 'DSA', dsaTodos)}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          body {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  )
}
