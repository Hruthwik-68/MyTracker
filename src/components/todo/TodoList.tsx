import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import type { DailyTodo } from '../../types'

const TodoList = () => {
  const { user } = useAuth()
  const [commonTodos, setCommonTodos] = useState<DailyTodo[]>([])
  const [dsaTodos, setDsaTodos] = useState<DailyTodo[]>([])
  const [newCommonTodo, setNewCommonTodo] = useState('')
  const [newDsaTodo, setNewDsaTodo] = useState('')
  const [commonPriority, setCommonPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
  const [dsaPriority, setDsaPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadTodos()
  }, [user])

  const sortByPriority = (todos: DailyTodo[]) => {
    const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
    return [...todos].sort((a, b) => {
      // First sort by completion status (incomplete first)
      if (a.is_done !== b.is_done) {
        return a.is_done ? 1 : -1
      }
      // Then sort by priority (high to low)
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  const loadTodos = async () => {
    if (!user) return
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const { data } = await supabase
        .from('daily_todos')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('created_at', { ascending: true })

      if (data) {
        const common = data.filter(t => t.category === 'COMMON')
        const dsa = data.filter(t => t.category === 'DSA')
        setCommonTodos(sortByPriority(common))
        setDsaTodos(sortByPriority(dsa))
      }
    } catch (error) {
      console.error('Error loading todos:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTodo = async (category: 'COMMON' | 'DSA') => {
    if (!user) return
    const task = category === 'COMMON' ? newCommonTodo : newDsaTodo
    const priority = category === 'COMMON' ? commonPriority : dsaPriority
    if (!task.trim()) return

    try {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('daily_todos')
        .insert([{
          user_id: user.id,
          category,
          task: task.trim(),
          priority,
          is_done: false,
          date: today
        }])
        .select()
        .single()

      if (data) {
        if (category === 'COMMON') {
          setCommonTodos(sortByPriority([...commonTodos, data]))
          setNewCommonTodo('')
        } else {
          setDsaTodos(sortByPriority([...dsaTodos, data]))
          setNewDsaTodo('')
        }
      }
    } catch (error) {
      console.error('Error adding todo:', error)
    }
  }

  const toggleTodo = async (todo: DailyTodo) => {
    try {
      await supabase
        .from('daily_todos')
        .update({ is_done: !todo.is_done })
        .eq('id', todo.id)

      if (todo.category === 'COMMON') {
        const updated = commonTodos.map(t => 
          t.id === todo.id ? { ...t, is_done: !t.is_done } : t
        )
        setCommonTodos(sortByPriority(updated))
      } else {
        const updated = dsaTodos.map(t => 
          t.id === todo.id ? { ...t, is_done: !t.is_done } : t
        )
        setDsaTodos(sortByPriority(updated))
      }
    } catch (error) {
      console.error('Error toggling todo:', error)
    }
  }

  const deleteTodo = async (id: string, category: 'COMMON' | 'DSA') => {
    try {
      await supabase.from('daily_todos').delete().eq('id', id)
      
      if (category === 'COMMON') {
        setCommonTodos(commonTodos.filter(t => t.id !== id))
      } else {
        setDsaTodos(dsaTodos.filter(t => t.id !== id))
      }
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  const updatePriority = async (todo: DailyTodo, newPriority: 'LOW' | 'MEDIUM' | 'HIGH') => {
    try {
      await supabase
        .from('daily_todos')
        .update({ priority: newPriority })
        .eq('id', todo.id)

      if (todo.category === 'COMMON') {
        const updated = commonTodos.map(t => 
          t.id === todo.id ? { ...t, priority: newPriority } : t
        )
        setCommonTodos(sortByPriority(updated))
      } else {
        const updated = dsaTodos.map(t => 
          t.id === todo.id ? { ...t, priority: newPriority } : t
        )
        setDsaTodos(sortByPriority(updated))
      }
    } catch (error) {
      console.error('Error updating priority:', error)
    }
  }

  const getPriorityColor = (priority: 'LOW' | 'MEDIUM' | 'HIGH') => {
    switch (priority) {
      case 'HIGH': return { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' }
      case 'MEDIUM': return { bg: '#fef3c7', color: '#d97706', border: '#fcd34d' }
      case 'LOW': return { bg: '#dbeafe', color: '#2563eb', border: '#93c5fd' }
    }
  }

  const renderTodoList = (todos: DailyTodo[], category: 'COMMON' | 'DSA') => (
    <div style={{ marginTop: '1rem' }}>
      {todos.length === 0 ? (
        <p style={{ color: '#999', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>No todos yet</p>
      ) : (
        todos.map(todo => {
          const priorityColors = getPriorityColor(todo.priority)
          return (
            <div
              key={todo.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                background: todo.is_done ? '#f0f0f0' : 'white',
                border: `2px solid ${todo.is_done ? '#ddd' : priorityColors.border}`,
                borderRadius: '12px',
                marginBottom: '0.75rem',
                transition: 'all 0.3s ease',
                boxShadow: todo.is_done ? 'none' : '0 2px 8px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => {
                if (!todo.is_done) {
                  e.currentTarget.style.transform = 'translateX(5px)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)'
              }}
            >
              <input
                type="checkbox"
                checked={todo.is_done}
                onChange={() => toggleTodo(todo)}
                style={{ cursor: 'pointer', width: '22px', height: '22px', accentColor: '#4caf50' }}
              />
              <span style={{
                flex: 1,
                textDecoration: todo.is_done ? 'line-through' : 'none',
                color: todo.is_done ? '#999' : '#333',
                fontWeight: '500',
                fontSize: '1rem'
              }}>
                {todo.task}
              </span>
              
              {/* Priority Selector */}
              <select
                value={todo.priority}
                onChange={(e) => updatePriority(todo, e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
                disabled={todo.is_done}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  border: `2px solid ${priorityColors.border}`,
                  background: priorityColors.bg,
                  color: priorityColors.color,
                  cursor: todo.is_done ? 'not-allowed' : 'pointer',
                  opacity: todo.is_done ? 0.5 : 1
                }}
              >
                <option value="HIGH">🔴 HIGH</option>
                <option value="MEDIUM">🟡 MEDIUM</option>
                <option value="LOW">🟢 LOW</option>
              </select>

              <button
                onClick={() => deleteTodo(todo.id, category)}
                style={{
                  background: '#ff6b6b',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#ff5252'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#ff6b6b'}
              >
                🗑️
              </button>
            </div>
          )
        })
      )}
    </div>
  )

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
      <p style={{ color: '#667eea', fontSize: '1.2rem', fontWeight: '600' }}>Loading todos...</p>
    </div>
  )

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', color: '#333', fontSize: '2.5rem' }}>📝 Daily Todo</h1>

      {/* Common Todos */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        marginBottom: '2rem',
        border: '1px solid #f0f0f0'
      }}>
        <h2 style={{ marginBottom: '1.5rem', color: '#667eea', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span>💼</span> Common Tasks
        </h2>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={newCommonTodo}
            onChange={(e) => setNewCommonTodo(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo('COMMON')}
            placeholder="Add a common task..."
            style={{
              flex: 1,
              minWidth: '250px',
              padding: '1rem',
              border: '2px solid #ddd',
              borderRadius: '12px',
              fontSize: '1rem'
            }}
          />
          <select
            value={commonPriority}
            onChange={(e) => setCommonPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
            style={{
              padding: '1rem',
              border: '2px solid #ddd',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <option value="HIGH">🔴 HIGH</option>
            <option value="MEDIUM">🟡 MEDIUM</option>
            <option value="LOW">🟢 LOW</option>
          </select>
          <button
            onClick={() => addTodo('COMMON')}
            style={{
              padding: '1rem 2rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            ➕ Add
          </button>
        </div>

        {renderTodoList(commonTodos, 'COMMON')}
      </div>

      {/* DSA Todos */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #f0f0f0'
      }}>
        <h2 style={{ marginBottom: '1.5rem', color: '#667eea', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span>🧠</span> DSA Plan
        </h2>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={newDsaTodo}
            onChange={(e) => setNewDsaTodo(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo('DSA')}
            placeholder="Add DSA task for next day..."
            style={{
              flex: 1,
              minWidth: '250px',
              padding: '1rem',
              border: '2px solid #ddd',
              borderRadius: '12px',
              fontSize: '1rem'
            }}
          />
          <select
            value={dsaPriority}
            onChange={(e) => setDsaPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
            style={{
              padding: '1rem',
              border: '2px solid #ddd',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <option value="HIGH">🔴 HIGH</option>
            <option value="MEDIUM">🟡 MEDIUM</option>
            <option value="LOW">🟢 LOW</option>
          </select>
          <button
            onClick={() => addTodo('DSA')}
            style={{
              padding: '1rem 2rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            ➕ Add
          </button>
        </div>

        {renderTodoList(dsaTodos, 'DSA')}
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

export default TodoList
