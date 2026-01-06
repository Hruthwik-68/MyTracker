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
  const [commonPriority, setCommonPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW')
  const [loading, setLoading] = useState(false)

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
        .eq('date', today)
        .order('created_at', { ascending: true })

      if (data) {
        setCommonTodos(data.filter(t => t.category === 'COMMON'))
        setDsaTodos(data.filter(t => t.category === 'DSA'))
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
    if (!task.trim()) return

    try {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('daily_todos')
        .insert([{
          user_id: user.id,
          category,
          task: task.trim(),
          priority: category === 'COMMON' ? commonPriority : 'LOW',
          is_done: false,
          date: today
        }])
        .select()
        .single()

      if (data) {
        if (category === 'COMMON') {
          setCommonTodos([...commonTodos, data])
          setNewCommonTodo('')
        } else {
          setDsaTodos([...dsaTodos, data])
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
        setCommonTodos(commonTodos.map(t => 
          t.id === todo.id ? { ...t, is_done: !t.is_done } : t
        ))
      } else {
        setDsaTodos(dsaTodos.map(t => 
          t.id === todo.id ? { ...t, is_done: !t.is_done } : t
        ))
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

  const renderTodoList = (todos: DailyTodo[], category: 'COMMON' | 'DSA') => (
    <div style={{ marginTop: '1rem' }}>
      {todos.length === 0 ? (
        <p style={{ color: '#999', fontStyle: 'italic' }}>No todos yet</p>
      ) : (
        todos.map(todo => (
          <div
            key={todo.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.75rem',
              background: todo.is_done ? '#f0f0f0' : 'white',
              border: '1px solid #ddd',
              borderRadius: '4px',
              marginBottom: '0.5rem'
            }}
          >
            <input
              type="checkbox"
              checked={todo.is_done}
              onChange={() => toggleTodo(todo)}
              style={{ cursor: 'pointer', width: '18px', height: '18px' }}
            />
            <span style={{
              flex: 1,
              textDecoration: todo.is_done ? 'line-through' : 'none',
              color: todo.is_done ? '#999' : '#333'
            }}>
              {todo.task}
            </span>
            {category === 'COMMON' && (
              <span style={{
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                background: todo.priority === 'HIGH' ? '#fee' : todo.priority === 'MEDIUM' ? '#ffeaa7' : '#dfe6e9',
                color: todo.priority === 'HIGH' ? '#c33' : todo.priority === 'MEDIUM' ? '#d63031' : '#666'
              }}>
                {todo.priority}
              </span>
            )}
            <button
              onClick={() => deleteTodo(todo.id, category)}
              style={{
                background: '#ff6b6b',
                color: 'white',
                border: 'none',
                padding: '0.5rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🗑️
            </button>
          </div>
        ))
      )}
    </div>
  )

  if (loading) return <p>Loading todos...</p>

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', color: '#333' }}>📝 Daily Todo</h1>

      {/* Common Todos */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ marginBottom: '1rem', color: '#667eea' }}>💼 Common Tasks</h2>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <input
            type="text"
            value={newCommonTodo}
            onChange={(e) => setNewCommonTodo(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo('COMMON')}
            placeholder="Add a common task..."
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
          <select
            value={commonPriority}
            onChange={(e) => setCommonPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
            style={{
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          <button
            onClick={() => addTodo('COMMON')}
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
            Add
          </button>
        </div>

        {renderTodoList(commonTodos, 'COMMON')}
      </div>

      {/* DSA Todos */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '1rem', color: '#667eea' }}>🧠 DSA Plan</h2>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <input
            type="text"
            value={newDsaTodo}
            onChange={(e) => setNewDsaTodo(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo('DSA')}
            placeholder="Add DSA task for next day..."
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
          <button
            onClick={() => addTodo('DSA')}
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
            Add
          </button>
        </div>

        {renderTodoList(dsaTodos, 'DSA')}
      </div>
    </div>
  )
}

export default TodoList