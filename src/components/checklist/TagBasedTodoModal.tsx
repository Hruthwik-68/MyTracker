// ============================================
// TAG-BASED TODO SYSTEM - COMPLETE REDESIGN
// ============================================
// Replace your existing todo modal with this

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

interface TodoItem {
  id: string
  user_id: string
  tag_id: string
  task: string
  is_done: boolean
  created_at: string
  original_date: string
  date: string
}

interface TagWithTodos {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
  todos: TodoItem[]
  expanded: boolean
}

const THEME = {
  bgPrimary: '#0a0e27',
  bgSecondary: '#1a1f3a',
  bgTertiary: '#2d3358',
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  borderPrimary: '#334155',
  borderAccent: '#475569',
  success: '#10b981',
  error: '#ef4444',
  gradientBlue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  gradientOrange: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  gradientGreen: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
}

export const TagBasedTodoModal = ({ isOpen, onClose, isMobile }: any) => {
  const { user } = useAuth()
  const [tags, setTags] = useState<TagWithTodos[]>([])
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#667eea')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [newTodoText, setNewTodoText] = useState('')
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null)
  const [showAddTag, setShowAddTag] = useState(false)

  useEffect(() => {
    if (user && isOpen) {
      loadTagsWithTodos()
    }
  }, [user, isOpen])

  const loadTagsWithTodos = async () => {
    if (!user) return
    
    try {
      const today = new Date().toISOString().split('T')[0]
      
      // Load all tags
      const { data: tagsData } = await supabase
        .from('todo_tags')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      if (!tagsData) return

      // Load all todos for today
      const { data: todosData } = await supabase
        .from('checklist_todos')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('created_at', { ascending: true })

      // Carry forward incomplete todos
      const { data: incompleteTodos } = await supabase
        .from('checklist_todos')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_done', false)
        .lt('date', today)

      // Create carried forward todos
      if (incompleteTodos && incompleteTodos.length > 0) {
        const carriedForward = incompleteTodos.map(todo => ({
          user_id: user.id,
          tag_id: todo.tag_id,
          date: today,
          task: todo.task,
          is_done: false,
          original_date: todo.original_date
        }))
        
        const { data: newTodos } = await supabase
          .from('checklist_todos')
          .insert(carriedForward)
          .select()
        
        const allTodos = [...(todosData || []), ...(newTodos || [])]
        
        // Group todos by tag
        const tagsWithTodos = tagsData.map(tag => ({
          ...tag,
          todos: allTodos.filter(todo => todo.tag_id === tag.id),
          expanded: false
        }))
        
        setTags(tagsWithTodos)
      } else {
        const tagsWithTodos = tagsData.map(tag => ({
          ...tag,
          todos: (todosData || []).filter(todo => todo.tag_id === tag.id),
          expanded: false
        }))
        
        setTags(tagsWithTodos)
      }
    } catch (error) {
      console.error('Error loading tags:', error)
    }
  }

  const createTag = async () => {
    if (!user || !newTagName.trim()) return
    
    try {
      const { data } = await supabase
        .from('todo_tags')
        .insert([{
          user_id: user.id,
          name: newTagName.trim(),
          color: newTagColor
        }])
        .select()
        .single()

      if (data) {
        setTags([...tags, { ...data, todos: [], expanded: false }])
        setNewTagName('')
        setNewTagColor('#667eea')
        setShowAddTag(false)
        alert('✅ Tag created!')
      }
    } catch (error: any) {
      if (error.code === '23505') {
        alert('❌ Tag name already exists')
      } else {
        console.error('Error creating tag:', error)
        alert('❌ Failed to create tag')
      }
    }
  }

  const deleteTag = async (tagId: string) => {
    if (!confirm('Delete this tag and all its todos?')) return
    
    try {
      await supabase.from('checklist_todos').delete().eq('tag_id', tagId)
      await supabase.from('todo_tags').delete().eq('id', tagId)
      setTags(tags.filter(t => t.id !== tagId))
      alert('✅ Tag deleted')
    } catch (error) {
      console.error('Error deleting tag:', error)
      alert('❌ Failed to delete tag')
    }
  }

  const addTodo = async () => {
    if (!user || !newTodoText.trim() || !selectedTagId) return
    
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('checklist_todos')
        .insert([{
          user_id: user.id,
          tag_id: selectedTagId,
          date: today,
          task: newTodoText,
          is_done: false,
          original_date: today
        }])
        .select()
        .single()

      if (data) {
        setTags(tags.map(tag => 
          tag.id === selectedTagId 
            ? { ...tag, todos: [...tag.todos, data] }
            : tag
        ))
        setNewTodoText('')
        setSelectedTagId(null)
      }
    } catch (error) {
      console.error('Error adding todo:', error)
      alert('❌ Failed to add todo')
    }
  }

  const toggleTodo = async (tagId: string, todoId: string, currentStatus: boolean) => {
    try {
      const { data } = await supabase
        .from('checklist_todos')
        .update({ is_done: !currentStatus })
        .eq('id', todoId)
        .select()
        .single()

      if (data) {
        setTags(tags.map(tag => 
          tag.id === tagId
            ? { ...tag, todos: tag.todos.map(t => t.id === data.id ? data : t) }
            : tag
        ))
      }
    } catch (error) {
      console.error('Error toggling todo:', error)
    }
  }

  const deleteTodo = async (tagId: string, todoId: string) => {
    if (!confirm('Delete this todo?')) return
    
    try {
      await supabase.from('checklist_todos').delete().eq('id', todoId)
      setTags(tags.map(tag => 
        tag.id === tagId
          ? { ...tag, todos: tag.todos.filter(t => t.id !== todoId) }
          : tag
      ))
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  const toggleTagExpand = (tagId: string) => {
    setTags(tags.map(tag => 
      tag.id === tagId 
        ? { ...tag, expanded: !tag.expanded }
        : tag
    ))
  }

  const getDaysAgo = (originalDate: string) => {
    const today = new Date().toISOString().split('T')[0]
    if (originalDate === today) return 0
    
    const orig = new Date(originalDate)
    const todayDate = new Date(today)
    const diffTime = Math.abs(todayDate.getTime() - orig.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: THEME.bgSecondary,
        padding: isMobile ? '1.5rem' : '2rem',
        borderRadius: '12px',
        maxWidth: isMobile ? '100%' : '700px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        border: `1px solid ${THEME.borderPrimary}`,
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: isMobile ? '1.3rem' : '1.5rem', color: THEME.textPrimary }}>
            🏷️ Tag-Based Todos
          </h2>
          <button onClick={onClose} style={{
            background: THEME.bgTertiary,
            border: 'none',
            color: THEME.textPrimary,
            fontSize: '1.5rem',
            cursor: 'pointer',
            width: '32px',
            height: '32px',
            borderRadius: '6px'
          }}>×</button>
        </div>

        {/* Add New Tag Button */}
        <button onClick={() => setShowAddTag(!showAddTag)} style={{
          width: '100%',
          padding: '0.75rem',
          background: THEME.gradientBlue,
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '700',
          fontSize: '0.95rem',
          marginBottom: '1rem'
        }}>
          ➕ {showAddTag ? 'Cancel' : 'Add New Tag'}
        </button>

        {/* Add Tag Form */}
        {showAddTag && (
          <div style={{
            background: THEME.bgTertiary,
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            border: `1px solid ${THEME.borderAccent}`
          }}>
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Tag name (e.g., Work, Personal, Urgent)"
              style={{
                width: '100%',
                padding: '0.75rem',
                background: THEME.bgSecondary,
                border: `1px solid ${THEME.borderAccent}`,
                borderRadius: '8px',
                color: THEME.textPrimary,
                fontSize: '0.95rem',
                marginBottom: '0.75rem'
              }}
            />
            
            {/* Color Picker */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: newTagColor,
                borderRadius: '8px',
                border: `2px solid ${THEME.borderAccent}`,
                cursor: 'pointer'
              }} onClick={() => setShowColorPicker(!showColorPicker)}></div>
              
              <input
                type="color"
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                style={{
                  flex: 1,
                  height: '40px',
                  border: `1px solid ${THEME.borderAccent}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: THEME.bgSecondary
                }}
              />
            </div>

            <button onClick={createTag} style={{
              width: '100%',
              padding: '0.75rem',
              background: THEME.success,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '700'
            }}>
              Create Tag
            </button>
          </div>
        )}

        {/* Tags List */}
        <div style={{ maxHeight: '500px', overflow: 'auto' }}>
          {tags.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: THEME.textSecondary }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏷️</div>
              <p>No tags yet. Create your first tag to organize todos!</p>
            </div>
          ) : (
            tags.map(tag => {
              const incompleteTodos = tag.todos.filter(t => !t.is_done).length
              const totalTodos = tag.todos.length
              
              return (
                <div key={tag.id} style={{
                  background: THEME.bgTertiary,
                  borderRadius: '12px',
                  marginBottom: '1rem',
                  border: `1px solid ${THEME.borderAccent}`,
                  overflow: 'hidden'
                }}>
                  {/* Tag Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem',
                    cursor: 'pointer',
                    background: tag.expanded ? THEME.bgPrimary : THEME.bgTertiary
                  }} onClick={() => toggleTagExpand(tag.id)}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      background: tag.color,
                      borderRadius: '6px',
                      marginRight: '0.75rem'
                    }}></div>
                    
                    <span style={{
                      flex: 1,
                      color: THEME.textPrimary,
                      fontSize: '1.1rem',
                      fontWeight: '700'
                    }}>
                      {tag.name}
                    </span>

                    <span style={{
                      background: incompleteTodos > 0 ? THEME.gradientOrange : THEME.gradientGreen,
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      marginRight: '0.75rem'
                    }}>
                      {incompleteTodos}/{totalTodos}
                    </span>

                    <button onClick={(e) => {
                      e.stopPropagation()
                      deleteTag(tag.id)
                    }} style={{
                      background: THEME.error,
                      color: 'white',
                      border: 'none',
                      padding: '0.4rem 0.6rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      marginRight: '0.5rem',
                      fontSize: '0.85rem'
                    }}>
                      🗑️
                    </button>

                    <span style={{ color: THEME.textSecondary, fontSize: '1.2rem' }}>
                      {tag.expanded ? '▼' : '▶'}
                    </span>
                  </div>

                  {/* Expanded Content */}
                  {tag.expanded && (
                    <div style={{ padding: '1rem', background: THEME.bgSecondary }}>
                      {/* Add Todo Input */}
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <input
                          type="text"
                          value={selectedTagId === tag.id ? newTodoText : ''}
                          onChange={(e) => {
                            setNewTodoText(e.target.value)
                            setSelectedTagId(tag.id)
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && selectedTagId === tag.id) {
                              addTodo()
                            }
                          }}
                          placeholder="Add new todo..."
                          style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: THEME.bgTertiary,
                            border: `1px solid ${THEME.borderAccent}`,
                            borderRadius: '8px',
                            color: THEME.textPrimary,
                            fontSize: '0.9rem'
                          }}
                        />
                        <button onClick={() => {
                          setSelectedTagId(tag.id)
                          addTodo()
                        }} style={{
                          padding: '0.75rem 1rem',
                          background: THEME.success,
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '700'
                        }}>
                          ➕
                        </button>
                      </div>

                      {/* Todos List */}
                      {tag.todos.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '1.5rem', color: THEME.textSecondary }}>
                          No todos yet. Add one above!
                        </div>
                      ) : (
                        tag.todos.map(todo => {
                          const daysAgo = getDaysAgo(todo.original_date)
                          return (
                            <div key={todo.id} style={{
                              background: todo.is_done ? THEME.gradientGreen : THEME.bgTertiary,
                              border: `1px solid ${todo.is_done ? THEME.success : THEME.borderAccent}`,
                              borderRadius: '8px',
                              padding: '0.75rem',
                              marginBottom: '0.5rem',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.75rem'
                            }}>
                              <input
                                type="checkbox"
                                checked={todo.is_done}
                                onChange={() => toggleTodo(tag.id, todo.id, todo.is_done)}
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  marginTop: '2px',
                                  accentColor: THEME.success,
                                  cursor: 'pointer'
                                }}
                              />
                              
                              <div style={{ flex: 1 }}>
                                <div style={{
                                  color: THEME.textPrimary,
                                  textDecoration: todo.is_done ? 'line-through' : 'none',
                                  fontSize: '0.95rem',
                                  marginBottom: daysAgo > 0 ? '0.5rem' : 0,
                                  wordBreak: 'break-word'
                                }}>
                                  {todo.task}
                                </div>
                                
                                {daysAgo > 0 && (
                                  <div style={{
                                    background: THEME.gradientOrange,
                                    color: 'white',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    display: 'inline-block',
                                    fontWeight: '600'
                                  }}>
                                    📅 Forwarded from {daysAgo} day{daysAgo > 1 ? 's' : ''} ago
                                  </div>
                                )}
                              </div>

                              <button onClick={() => deleteTodo(tag.id, todo.id)} style={{
                                background: THEME.error,
                                color: 'white',
                                border: 'none',
                                padding: '0.4rem 0.6rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                              }}>
                                🗑️
                              </button>
                            </div>
                          )
                        })
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
