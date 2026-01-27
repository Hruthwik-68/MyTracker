import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import type { ChecklistItem, DailyChecklist as DailyChecklistType, Note } from '../../types'
import { NutritionStats } from './NutritionStats'
import { StreakCalendar } from './StreakCalendar'
import type { ChecklistTodo, TodoTag } from '../../types'  // After adding to types/index.ts
import { TagBasedTodoModal } from './TagBasedTodoModal'
const THEME = {
  bgPrimary: '#0a0e27',
  bgSecondary: '#1a1f3a',
  bgTertiary: '#2d3358',
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  borderPrimary: '#334155',
  borderAccent: '#475569',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  gradientPurple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  gradientBlue: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  gradientGold: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
  gradientOrange: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  gradientGreen: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
}

const DEFAULT_TAG_COLORS = ['#667eea', '#f59e0b', '#10b981', '#ec4899', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16', '#f97316']
export const DailyChecklist = () => {
  const { user } = useAuth()
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [logs, setLogs] = useState<DailyChecklistType[]>([])
  const [loading, setLoading] = useState(true)
  const [showStreaks, setShowStreaks] = useState(false)
  const [showAddItem, setShowAddItem] = useState(false)
  const [showEditItem, setShowEditItem] = useState(false)
  const [showMacroModal, setShowMacroModal] = useState(false)
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null)
  const [viewingMacroItem, setViewingMacroItem] = useState<ChecklistItem | null>(null)
  const [todayNote, setTodayNote] = useState<Note | null>(null)
  const [noteContent, setNoteContent] = useState('')
const [showTodosModal, setShowTodosModal] = useState(false)
  
  // Drag and Drop state
  const [draggedItem, setDraggedItem] = useState<ChecklistItem | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  
  // Collapsible sections state
  const [sectionsExpanded, setSectionsExpanded] = useState({
    routine: false,
    supplements: false,
    diet: false,
    stats: false
  })

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
    if (user) {  // ✅ ADD THIS CHECK
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

  const deleteNote = async () => {
    if (!user || !todayNote) return
    
    if (!confirm('Delete this note permanently?')) return
    
    try {
      await supabase
        .from('notes')
        .delete()
        .eq('id', todayNote.id)
      
      setTodayNote(null)
      setNoteContent('')
      setShowNotesModal(false)
      alert('✅ Note deleted successfully!')
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('❌ Failed to delete note')
    }
  }
// const loadChecklistTodos = async () => {
//   if (!user) return
//   try {
//     const today = new Date().toISOString().split('T')[0]
    
//     const { data: todayTodos } = await supabase
//       .from('checklist_todos')
//       .select('*')
//       .eq('user_id', user.id)
//       .eq('date', today)
//       .order('created_at', { ascending: true })

//     const { data: incompleteTodos } = await supabase
//       .from('checklist_todos')
//       .select('*')
//       .eq('user_id', user.id)
//       .eq('is_done', false)
//       .lt('date', today)
//       .order('original_date', { ascending: true })

//     if (incompleteTodos && incompleteTodos.length > 0) {
//       const carriedForwardTodos = incompleteTodos.map(todo => ({
//         user_id: user.id,
//         date: today,
//         task: todo.task,
//         is_done: false,
//         tags: todo.tags,
//         original_date: todo.original_date
//       }))
      
//       const { data: newTodos } = await supabase
//         .from('checklist_todos')
//         .insert(carriedForwardTodos)
//         .select()
      
//       setChecklistTodos([...(todayTodos || []), ...(newTodos || [])])
//     } else {
//       setChecklistTodos(todayTodos || [])
//     }
//   } catch (error) {
//     console.error('Error loading todos:', error)
//   }
// }

// const loadTodoTags = async () => {
//   if (!user) return
//   try {
//     const { data } = await supabase
//       .from('todo_tags')
//       .select('*')
//       .eq('user_id', user.id)
//       .order('name')

//     if (data) setTodoTags(data)
//   } catch (error) {
//     console.error('Error loading tags:', error)
//   }
// }

// const addChecklistTodo = async () => {
//   if (!user || !newTodoText.trim()) return
  
//   try {
//     const today = new Date().toISOString().split('T')[0]
//     const { data } = await supabase
//       .from('checklist_todos')
//       .insert([{
//         user_id: user.id,
//         date: today,
//         task: newTodoText,
//         is_done: false,
//         tags: selectedTags,
//         original_date: today
//       }])
//       .select()
//       .single()

//     if (data) {
//       setChecklistTodos([...checklistTodos, data])
//       setNewTodoText('')
//       setSelectedTags([])
//     }
//   } catch (error) {
//     console.error('Error adding todo:', error)
//     alert('❌ Failed to add todo')
//   }
// }

// const toggleChecklistTodo = async (todo: ChecklistTodo) => {
//   try {
//     const { data } = await supabase
//       .from('checklist_todos')
//       .update({ is_done: !todo.is_done })
//       .eq('id', todo.id)
//       .select()
//       .single()

//     if (data) {
//       setChecklistTodos(checklistTodos.map(t => t.id === data.id ? data : t))
//     }
//   } catch (error) {
//     console.error('Error toggling todo:', error)
//   }
// }

// const deleteChecklistTodo = async (todoId: string) => {
//   if (!confirm('Delete this todo?')) return
  
//   try {
//     await supabase.from('checklist_todos').delete().eq('id', todoId)
//     setChecklistTodos(checklistTodos.filter(t => t.id !== todoId))
//   } catch (error) {
//     console.error('Error deleting todo:', error)
//   }
// }

// const createTag = async () => {
//   if (!user || !newTagName.trim()) return
  
//   try {
//     const { data } = await supabase
//       .from('todo_tags')
//       .insert([{
//         user_id: user.id,
//         name: newTagName.trim(),
//         color: newTagColor
//       }])
//       .select()
//       .single()

//     if (data) {
//       setTodoTags([...todoTags, data])
//       setNewTagName('')
//       setNewTagColor(DEFAULT_TAG_COLORS[0])
//       alert('✅ Tag created!')
//     }
//   } catch (error: any) {
//     if (error.code === '23505') {
//       alert('❌ Tag name already exists')
//     } else {
//       console.error('Error creating tag:', error)
//       alert('❌ Failed to create tag')
//     }
//   }
// }

// const deleteTag = async (tagId: string, tagName: string) => {
//   if (!confirm(`Delete tag "${tagName}"?`)) return
  
//   try {
//     await supabase.from('todo_tags').delete().eq('id', tagId)
    
//     const todosWithTag = checklistTodos.filter(t => t.tags.includes(tagName))
//     for (const todo of todosWithTag) {
//       await supabase
//         .from('checklist_todos')
//         .update({ tags: todo.tags.filter(t => t !== tagName) })
//         .eq('id', todo.id)
//     }
    
//     setTodoTags(todoTags.filter(t => t.id !== tagId))
//     await loadChecklistTodos()
//     alert('✅ Tag deleted')
//   } catch (error) {
//     console.error('Error deleting tag:', error)
//     alert('❌ Failed to delete tag')
//   }
// }

// const toggleTagSelection = (tagName: string) => {
//   if (selectedTags.includes(tagName)) {
//     setSelectedTags(selectedTags.filter(t => t !== tagName))
//   } else {
//     setSelectedTags([...selectedTags, tagName])
//   }
// }

// const getDaysAgo = (originalDate: string) => {
//   const today = new Date().toISOString().split('T')[0]
//   if (originalDate === today) return 0
  
//   const orig = new Date(originalDate)
//   const todayDate = new Date(today)
//   const diffTime = Math.abs(todayDate.getTime() - orig.getTime())
//   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
//   return diffDays
// }
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
      { category: 'ROUTINE', name: '☀️ Wake up', order_index: 1, metadata: null },
      { category: 'ROUTINE', name: '🪥 Brush', order_index: 2, metadata: null },
      { category: 'ROUTINE', name: '💦 Splash water', order_index: 3, metadata: null },
      { category: 'ROUTINE', name: '📚 Revise while brushing', order_index: 4, metadata: null },
      { category: 'ROUTINE', name: '🏃 Treadmill (1 hr @ 8km/h)', order_index: 5, metadata: { calories_burn: 850 } },
      { category: 'ROUTINE', name: '💪 Gym - Weight Training (1 hr)', order_index: 6, metadata: { calories_burn: 400 } },
      { category: 'ROUTINE', name: '🧠 Study DSA/CP', order_index: 7, metadata: null },
      { category: 'ROUTINE', name: '💻 Work Block (9 AM - 6 PM)', order_index: 8, metadata: null },
      { category: 'ROUTINE', name: '📖 LLD Study (0.5-1 hr)', order_index: 9, metadata: null },
      { category: 'ROUTINE', name: '🛌 Sleep 8 hours', order_index: 10, metadata: null },
      
      { category: 'SUPPLEMENT', name: '🔥 Hot water (morning)', order_index: 11, metadata: null },
      { category: 'SUPPLEMENT', name: '💊 Glutathione (alternate days)', order_index: 12, metadata: null },
      { category: 'SUPPLEMENT', name: '🍊 Vitamin C (alternate days)', order_index: 13, metadata: null },
      { category: 'SUPPLEMENT', name: '✨ Skin care tablet (morning)', order_index: 14, metadata: null },
      { category: 'SUPPLEMENT', name: '🌙 Skin care tablet (night)', order_index: 15, metadata: null },
      { category: 'SUPPLEMENT', name: '⚡ Creatine 3-5g', order_index: 16, metadata: null },
      { category: 'SUPPLEMENT', name: '🍵 Green tea (evening)', order_index: 17, metadata: null },
      { category: 'SUPPLEMENT', name: '💊 Multivitamin (evening)', order_index: 18, metadata: null },
      { category: 'SUPPLEMENT', name: '🌰 Flaxseed 1 spoon', order_index: 19, metadata: null },
      
      { 
        category: 'DIET', 
        name: '💧 Water (litres)', 
        order_index: 20,
        metadata: { unit: 'litre', calories: 0, protein: 0, carbs: 0, fiber: 0, fats: 0 }
      },
      { 
        category: 'DIET', 
        name: '🍗 Chicken Breast (grams)', 
        order_index: 21,
        metadata: { unit: 'gram', calories: 1.2, protein: 0.225, carbs: 0.026, fiber: 0, fats: 0.002 }
      },
      { 
        category: 'DIET', 
        name: '🥚 Eggs (units)', 
        order_index: 22,
        metadata: { unit: 'unit', calories: 68.25, protein: 4.675, carbs: 2.3, fiber: 0, fats: 2 }
      },
      { 
        category: 'DIET', 
        name: '🌱 Sprouts (grams)', 
        order_index: 23,
        metadata: { unit: 'gram', calories: 0.3, protein: 0.03, carbs: 0.002, fiber: 0.018, fats: 0.06 }
      },
      { 
        category: 'DIET', 
        name: '💪 Whey Protein (scoops)', 
        order_index: 24,
        metadata: { unit: 'scoop', calories: 135, protein: 22, carbs: 2.1, fiber: 0.5, fats: 7 }
      },
      { 
        category: 'DIET', 
        name: '🥛 Curd (grams)', 
        order_index: 25,
        metadata: { unit: 'gram', calories: 0.6, protein: 0.031, carbs: 0.04, fiber: 0, fats: 0.03 }
      },
      { 
        category: 'DIET', 
        name: '🍚 Boiled Rice (grams)', 
        order_index: 26,
        metadata: { unit: 'gram', calories: 1.08, protein: 0.018, carbs: 0.24, fiber: 0.01, fats: 0.002 }
      },
      { 
        category: 'DIET', 
        name: '🫘 Soya Chunks (grams)', 
        order_index: 27,
        metadata: { unit: 'gram', calories: 3.45, protein: 0.518, carbs: 0.009, fiber: 0.127, fats: 0.327 }
      },
    ]

    const itemsToInsert = defaultItems.map(item => ({
      user_id: user.id,
      category: item.category,
      name: item.name,
      is_persistent: true,
      order_index: item.order_index,
      metadata: item.metadata
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

  const openMacroModal = (item: ChecklistItem) => {
    setViewingMacroItem(item)
    setShowMacroModal(true)
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

  const getLogForItem = (itemId: string) => {
    return logs.find(l => l.checklist_item_id === itemId)
  }

  const toggleSection = (section: keyof typeof sectionsExpanded) => {
    setSectionsExpanded(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, item: ChecklistItem) => {
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = 'move'
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5'
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1'
    }
    setDraggedItem(null)
    setDragOverIndex(null)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDrop = async (e: React.DragEvent, targetItem: ChecklistItem, targetIndex: number) => {
    e.preventDefault()
    
    if (!draggedItem || !user) return
    if (draggedItem.id === targetItem.id) return
    if (draggedItem.category !== targetItem.category) return

    const categoryItems = items.filter(i => i.category === draggedItem.category)
    const draggedIndex = categoryItems.findIndex(i => i.id === draggedItem.id)
    
    if (draggedIndex === -1) return

    const newCategoryItems = [...categoryItems]
    newCategoryItems.splice(draggedIndex, 1)
    newCategoryItems.splice(targetIndex, 0, draggedItem)

    const updates = newCategoryItems.map((item, idx) => ({
      id: item.id,
      order_index: categoryItems[0].order_index + idx
    }))

    try {
      for (const update of updates) {
        await supabase
          .from('checklist_items')
          .update({ order_index: update.order_index })
          .eq('id', update.id)
      }
      await loadChecklistData()
    } catch (error) {
      console.error('Error reordering items:', error)
      alert('❌ Failed to reorder items')
    }

    setDraggedItem(null)
    setDragOverIndex(null)
  }

  const renderChecklistItem = (item: ChecklistItem, index: number) => {
    const log = getLogForItem(item.id)
    const metadata = item.metadata as any
    const hasCalorieBurn = metadata?.calories_burn !== undefined && metadata?.calories_burn > 0
    const isDragging = draggedItem?.id === item.id
    const isDropTarget = dragOverIndex === index

    if (item.category === 'DIET') {
      return (
        <div 
          key={item.id} 
          draggable
          onDragStart={(e) => handleDragStart(e, item)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={(e) => handleDrop(e, item, index)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            background: isDropTarget ? '#f0f7ff' : 'white',
            border: isDropTarget ? '2px dashed #667eea' : '2px solid #e0e0e0',
            borderRadius: '12px',
            marginBottom: '0.75rem',
            transition: 'all 0.3s ease',
            boxShadow: isDragging ? '0 8px 16px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
            opacity: isDragging ? 0.5 : 1,
            transform: isDragging ? 'scale(1.05)' : 'scale(1)',
            cursor: 'move'
          }}
        >
          <div style={{
            cursor: 'grab',
            color: '#999',
            padding: '0.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            touchAction: 'none'
          }}>
            <span style={{ height: '3px', width: '16px', background: '#999', borderRadius: '2px' }}></span>
            <span style={{ height: '3px', width: '16px', background: '#999', borderRadius: '2px' }}></span>
            <span style={{ height: '3px', width: '16px', background: '#999', borderRadius: '2px' }}></span>
          </div>

          <span style={{ flex: 1, fontWeight: '500', fontSize: '0.9rem', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.name}
          </span>
          
          <input
            type="number"
            step={metadata?.unit === 'gram' ? '1' : metadata?.unit === 'unit' ? '1' : '0.5'}
            min="0"
            value={log?.value || ''}
            onChange={(e) => updateDietValue(item, e.target.value)}
            placeholder="0"
            style={{
              padding: '0.5rem',
              border: '2px solid #ddd',
              borderRadius: '8px',
              width: '60px',
              fontSize: '0.9rem',
              textAlign: 'center',
              fontWeight: '600'
            }}
          />
          
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button
              onClick={() => openMacroModal(item)}
              title="View"
              style={{
                background: '#4caf50',
                color: 'white',
                border: 'none',
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              📊
            </button>
            <button
              onClick={() => deleteItem(item.id)}
              title="Delete"
              style={{
                background: '#ff6b6b',
                color: 'white',
                border: 'none',
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              🗑️
            </button>
          </div>
        </div>
      )
    }

    return (
      <div 
        key={item.id}
        draggable
        onDragStart={(e) => handleDragStart(e, item)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => handleDragOver(e, index)}
        onDrop={(e) => handleDrop(e, item, index)}
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest('button')) {
            toggleChecklistItem(item)
          }
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem',
          background: log?.is_done 
            ? 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' 
            : isDropTarget 
              ? '#f0f7ff' 
              : 'white',
          border: log?.is_done 
            ? '2px solid #4caf50' 
            : isDropTarget 
              ? '2px dashed #667eea' 
              : '2px solid #e0e0e0',
          borderRadius: '12px',
          marginBottom: '0.75rem',
          transition: 'all 0.3s ease',
          boxShadow: isDragging 
            ? '0 8px 16px rgba(0,0,0,0.2)' 
            : log?.is_done 
              ? '0 4px 12px rgba(76,175,80,0.2)' 
              : '0 2px 8px rgba(0,0,0,0.05)',
          opacity: isDragging ? 0.5 : 1,
          transform: isDragging ? 'scale(1.05)' : 'scale(1)',
          cursor: 'pointer'
        }}
      >
        <div 
          style={{
            cursor: 'grab',
            color: '#999',
            padding: '0.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            touchAction: 'none'
          }}
        >
          <span style={{ height: '3px', width: '16px', background: '#999', borderRadius: '2px' }}></span>
          <span style={{ height: '3px', width: '16px', background: '#999', borderRadius: '2px' }}></span>
          <span style={{ height: '3px', width: '16px', background: '#999', borderRadius: '2px' }}></span>
        </div>

        <input
          type="checkbox"
          checked={log?.is_done || false}
          onChange={(e) => e.stopPropagation()}
          style={{ 
            width: '20px', 
            height: '20px',
            accentColor: '#4caf50',
            pointerEvents: 'none',
            flexShrink: 0
          }}
        />
        
        <span style={{
          flex: 1,
          textDecoration: log?.is_done ? 'line-through' : 'none',
          color: log?.is_done ? '#666' : '#333',
          fontWeight: '500',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          minWidth: 0
        }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
          {hasCalorieBurn && (
            <span style={{
              padding: '0.25rem 0.5rem',
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)',
              color: 'white',
              borderRadius: '6px',
              fontSize: '0.7rem',
              fontWeight: '700',
              whiteSpace: 'nowrap'
            }}>
              🔥 {metadata.calories_burn}
            </span>
          )}
        </span>
        
        <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          {hasCalorieBurn && (
            <button
              onClick={() => openEditModal(item)}
              title="Edit"
              style={{
                background: '#ff9800',
                color: 'white',
                border: 'none',
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              ✏️
            </button>
          )}
          
          <button
            onClick={() => deleteItem(item.id)}
            title="Delete"
            style={{
              background: '#ff6b6b',
              color: 'white',
              border: 'none',
              padding: '0.4rem 0.6rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            🗑️
          </button>
        </div>
      </div>
    )
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

  const routineItems = items.filter(t => t.category === 'ROUTINE')
  const supplementItems = items.filter(t => t.category === 'SUPPLEMENT')
  const dietItems = items.filter(t => t.category === 'DIET')

  return (
    <div style={{ 
      maxWidth: '100%', 
      margin: '0 auto',
      padding: isMobile ? '0.5rem' : '1rem',
      minHeight: '100vh',
      background: '#f5f7fa'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: isMobile ? '1rem' : '1.5rem',
        borderRadius: '12px',
        marginBottom: '1rem',
        boxShadow: '0 4px 12px rgba(102,126,234,0.3)',
        color: 'white'
      }}>
        <h1 style={{ margin: 0, fontSize: isMobile ? '1.3rem' : '1.8rem', marginBottom: '0.5rem' }}>✅ Daily Checklist</h1>
        <p style={{ margin: 0, fontSize: isMobile ? '0.8rem' : '0.95rem', opacity: 0.9 }}>📅 {formattedDate}</p>
        
       <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
  <button onClick={() => setShowNotesModal(true)} style={{
    flex: 1,
    minWidth: '100px',
    padding: isMobile ? '0.6rem' : '0.75rem',
    background: todayNote ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
    color: 'white',
    border: `2px solid ${todayNote ? 'rgba(255,215,0,0.5)' : 'rgba(255,255,255,0.3)'}`,
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: isMobile ? '0.85rem' : '0.95rem'
  }}>
    📝 Notes
  </button>
  
  {/* ADD THIS NEW BUTTON */}
<button onClick={() => setShowTodosModal(true)} style={{
  flex: 1,
  minWidth: '100px',
  padding: isMobile ? '0.6rem' : '0.75rem',
  background: 'rgba(79,172,254,0.3)',  // ← SIMPLIFIED
  backdropFilter: 'blur(10px)',
  color: 'white',
  border: '2px solid rgba(79,172,254,0.5)',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '700',
  fontSize: isMobile ? '0.85rem' : '0.95rem'
}}>
  ✅ Todos
</button>
  
  <button onClick={() => setShowStreaks(true)} style={{
    flex: 1,
    minWidth: '100px',
    padding: isMobile ? '0.6rem' : '0.75rem',
    background: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
    color: 'white',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: isMobile ? '0.85rem' : '0.95rem'
  }}>
    🔥 Streaks
  </button>
</div>
      </div>

      {/* Stats Section */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        marginBottom: '1rem',
        overflow: 'hidden'
      }}>
        <button
          onClick={() => toggleSection('stats')}
          style={{
            width: '100%',
            padding: isMobile ? '0.75rem' : '1rem',
            background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: isMobile ? '1rem' : '1.2rem',
            fontWeight: '700',
            color: '#667eea'
          }}
        >
          <span>📊 Stats</span>
          <span style={{ 
            transition: 'transform 0.3s ease',
            transform: sectionsExpanded.stats ? 'rotate(180deg)' : 'rotate(0deg)'
          }}>
            ▼
          </span>
        </button>
        
        {sectionsExpanded.stats && (
          <div style={{ padding: isMobile ? '0.75rem' : '1rem' }}>
            {/* Stats Input Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: isMobile ? '0.5rem' : '0.75rem',
              marginBottom: '1rem'
            }}>
              {/* DSA Hours */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: isMobile ? '0.75rem' : '1rem',
                borderRadius: '8px',
                color: 'white'
              }}>
                <div style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', marginBottom: '0.25rem' }}>🧠</div>
                <div style={{ fontSize: isMobile ? '0.7rem' : '0.8rem', opacity: 0.9, marginBottom: '0.25rem' }}>DSA Hours</div>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={dailyStats.dsaHours || ''}
                  onChange={(e) => setDailyStats({...dailyStats, dsaHours: parseFloat(e.target.value) || 0})}
                  placeholder="0"
                  style={{
                    fontSize: isMobile ? '1rem' : '1.2rem',
                    fontWeight: 'bold',
                    background: 'rgba(255,255,255,0.2)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderRadius: '6px',
                    padding: '0.4rem',
                    width: '100%',
                    color: 'white',
                    textAlign: 'center'
                  }}
                />
              </div>

              {/* LLD Hours */}
              <div style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                padding: isMobile ? '0.75rem' : '1rem',
                borderRadius: '8px',
                color: 'white'
              }}>
                <div style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', marginBottom: '0.25rem' }}>📐</div>
                <div style={{ fontSize: isMobile ? '0.7rem' : '0.8rem', opacity: 0.9, marginBottom: '0.25rem' }}>LLD Hours</div>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={dailyStats.lldHours || ''}
                  onChange={(e) => setDailyStats({...dailyStats, lldHours: parseFloat(e.target.value) || 0})}
                  placeholder="0"
                  style={{
                    fontSize: isMobile ? '1rem' : '1.2rem',
                    fontWeight: 'bold',
                    background: 'rgba(255,255,255,0.2)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderRadius: '6px',
                    padding: '0.4rem',
                    width: '100%',
                    color: 'white',
                    textAlign: 'center'
                  }}
                />
              </div>

              {/* Problems Solved */}
              <div style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                padding: isMobile ? '0.75rem' : '1rem',
                borderRadius: '8px',
                color: 'white'
              }}>
                <div style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', marginBottom: '0.25rem' }}>✅</div>
                <div style={{ fontSize: isMobile ? '0.7rem' : '0.8rem', opacity: 0.9, marginBottom: '0.25rem' }}>Problems</div>
                <input
                  type="number"
                  min="0"
                  value={dailyStats.problemsSolved || ''}
                  onChange={(e) => setDailyStats({...dailyStats, problemsSolved: parseInt(e.target.value) || 0})}
                  placeholder="0"
                  style={{
                    fontSize: isMobile ? '1rem' : '1.2rem',
                    fontWeight: 'bold',
                    background: 'rgba(255,255,255,0.2)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderRadius: '6px',
                    padding: '0.4rem',
                    width: '100%',
                    color: 'white',
                    textAlign: 'center'
                  }}
                />
              </div>

              {/* Gym Hours */}
              <div style={{
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                padding: isMobile ? '0.75rem' : '1rem',
                borderRadius: '8px',
                color: 'white'
              }}>
                <div style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', marginBottom: '0.25rem' }}>💪</div>
                <div style={{ fontSize: isMobile ? '0.7rem' : '0.8rem', opacity: 0.9, marginBottom: '0.25rem' }}>Gym Hours</div>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={dailyStats.gymHours || ''}
                  onChange={(e) => setDailyStats({...dailyStats, gymHours: parseFloat(e.target.value) || 0})}
                  placeholder="0"
                  style={{
                    fontSize: isMobile ? '1rem' : '1.2rem',
                    fontWeight: 'bold',
                    background: 'rgba(255,255,255,0.2)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderRadius: '6px',
                    padding: '0.4rem',
                    width: '100%',
                    color: 'white',
                    textAlign: 'center'
                  }}
                />
              </div>
            </div>
            
            <NutritionStats items={items} logs={logs} />
          </div>
        )}
      </div>

      {/* Routine Section */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        marginBottom: '1rem',
        overflow: 'hidden'
      }}>
        <button
          onClick={() => toggleSection('routine')}
          style={{
            width: '100%',
            padding: isMobile ? '0.75rem' : '1rem',
            background: 'linear-gradient(135deg, #e8f5ff 0%, #d0e8ff 100%)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: isMobile ? '1rem' : '1.2rem',
            fontWeight: '700',
            color: '#667eea'
          }}
        >
          <span>🌅 Routine</span>
          <span style={{ 
            transition: 'transform 0.3s ease',
            transform: sectionsExpanded.routine ? 'rotate(180deg)' : 'rotate(0deg)'
          }}>
            ▼
          </span>
        </button>
        {sectionsExpanded.routine && (
          <div style={{ padding: isMobile ? '0.75rem' : '1rem' }}>
            {routineItems.map((item, index) => renderChecklistItem(item, index))}
          </div>
        )}
      </div>

      {/* Supplements Section */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        marginBottom: '1rem',
        overflow: 'hidden'
      }}>
        <button
          onClick={() => toggleSection('supplements')}
          style={{
            width: '100%',
            padding: isMobile ? '0.75rem' : '1rem',
            background: 'linear-gradient(135deg, #ffe8f0 0%, #ffd0e0 100%)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: isMobile ? '1rem' : '1.2rem',
            fontWeight: '700',
            color: '#f5576c'
          }}
        >
          <span>💊 Supplements</span>
          <span style={{ 
            transition: 'transform 0.3s ease',
            transform: sectionsExpanded.supplements ? 'rotate(180deg)' : 'rotate(0deg)'
          }}>
            ▼
          </span>
        </button>
        {sectionsExpanded.supplements && (
          <div style={{ padding: isMobile ? '0.75rem' : '1rem' }}>
            {supplementItems.map((item, index) => renderChecklistItem(item, index))}
          </div>
        )}
      </div>

      {/* Diet Section */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        marginBottom: '1rem',
        overflow: 'hidden'
      }}>
        <button
          onClick={() => toggleSection('diet')}
          style={{
            width: '100%',
            padding: isMobile ? '0.75rem' : '1rem',
            background: 'linear-gradient(135deg, #e8fff0 0%, #d0ffe0 100%)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: isMobile ? '1rem' : '1.2rem',
            fontWeight: '700',
            color: '#00f2fe'
          }}
        >
          <span>🍽️ Diet</span>
          <span style={{ 
            transition: 'transform 0.3s ease',
            transform: sectionsExpanded.diet ? 'rotate(180deg)' : 'rotate(0deg)'
          }}>
            ▼
          </span>
        </button>
        {sectionsExpanded.diet && (
          <div style={{ padding: isMobile ? '0.75rem' : '1rem' }}>
            {dietItems.map((item, index) => renderChecklistItem(item, index))}
          </div>
        )}
      </div>

      {/* Daily Stats Section */}
      <div style={{
        background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
        padding: isMobile ? '0.75rem' : '1rem',
        borderRadius: '12px',
        marginBottom: '1rem'
      }}>
        <h2 style={{ marginBottom: '1rem', fontSize: isMobile ? '1.1rem' : '1.3rem', color: '#2d3436' }}>✅ Daily Self-Check</h2>
        
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: isMobile ? '0.85rem' : '0.95rem', color: '#2d3436' }}>
            ⚡ Energy: {dailyStats.energyLevel}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={dailyStats.energyLevel}
            onChange={(e) => setDailyStats({...dailyStats, energyLevel: Number(e.target.value)})}
            style={{ width: '100%', height: '6px', accentColor: '#fdcb6e' }}
          />
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: isMobile ? '0.85rem' : '0.95rem', color: '#2d3436' }}>
            🎯 Focus: {dailyStats.focusLevel}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={dailyStats.focusLevel}
            onChange={(e) => setDailyStats({...dailyStats, focusLevel: Number(e.target.value)})}
            style={{ width: '100%', height: '6px', accentColor: '#fdcb6e' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: isMobile ? '0.85rem' : '0.95rem', fontWeight: '600', color: '#2d3436' }}>
            <input
              type="checkbox"
              checked={dailyStats.consistency}
              onChange={(e) => setDailyStats({...dailyStats, consistency: e.target.checked})}
              style={{ width: '18px', height: '18px', accentColor: '#fdcb6e' }}
            />
            💯 Consistency
          </label>
        </div>

        <button
          onClick={saveDailyStats}
          style={{
            width: '100%',
            padding: isMobile ? '0.6rem' : '0.75rem',
            background: '#2d3436',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: isMobile ? '0.85rem' : '0.95rem'
          }}
        >
          💾 Save Stats & Streak
        </button>
      </div>

      {/* Add Item Button */}
      <button
        onClick={() => setShowAddItem(true)}
        style={{
          width: '100%',
          padding: isMobile ? '0.75rem' : '1rem',
          background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          fontWeight: '700',
          fontSize: isMobile ? '0.9rem' : '1rem',
          marginBottom: '1rem'
        }}
      >
        ➕ Add Item
      </button>

      {showStreaks && <StreakCalendar onClose={() => setShowStreaks(false)} />}

      {/* Notes Modal */}
      {showNotesModal && (
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
            padding: isMobile ? '1.5rem' : '2rem',
            borderRadius: '12px',
            maxWidth: isMobile ? '100%' : '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginBottom: '1rem', fontSize: isMobile ? '1.2rem' : '1.5rem' }}>📝 Note</h2>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Write your note..."
              style={{
                width: '100%',
                minHeight: isMobile ? '150px' : '200px',
                padding: '0.75rem',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: isMobile ? '0.85rem' : '0.95rem',
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button onClick={saveNote} style={{
                flex: 1,
                minWidth: '100px',
                padding: isMobile ? '0.6rem' : '0.75rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: isMobile ? '0.85rem' : '0.95rem'
              }}>
                Save
              </button>
              {todayNote && (
                <button onClick={deleteNote} style={{
                  flex: 1,
                  minWidth: '100px',
                  padding: isMobile ? '0.6rem' : '0.75rem',
                  background: '#ff6b6b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: isMobile ? '0.85rem' : '0.95rem'
                }}>
                  Delete
                </button>
              )}
              <button onClick={() => setShowNotesModal(false)} style={{
                flex: 1,
                minWidth: '100px',
                padding: isMobile ? '0.6rem' : '0.75rem',
                background: '#ccc',
                color: '#333',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: isMobile ? '0.85rem' : '0.95rem'
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Macro Modal */}
      {showMacroModal && viewingMacroItem && (
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
            padding: isMobile ? '1.5rem' : '2rem',
            borderRadius: '12px',
            maxWidth: isMobile ? '100%' : '400px',
            width: '100%'
          }}>
            <h2 style={{ marginBottom: '1rem', fontSize: isMobile ? '1.2rem' : '1.5rem', wordBreak: 'break-word' }}>📊 {viewingMacroItem.name}</h2>
            {viewingMacroItem.metadata && (
              <div style={{ background: '#f8f9ff', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: isMobile ? '0.8rem' : '0.9rem', color: '#666' }}>
                  Per {(viewingMacroItem.metadata as any).unit}:
                </p>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'white', borderRadius: '6px', fontSize: isMobile ? '0.85rem' : '0.95rem' }}>
                    <span>Calories:</span>
                    <strong>{(viewingMacroItem.metadata as any).calories || 0}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'white', borderRadius: '6px', fontSize: isMobile ? '0.85rem' : '0.95rem' }}>
                    <span>Protein:</span>
                    <strong>{(viewingMacroItem.metadata as any).protein || 0}g</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'white', borderRadius: '6px', fontSize: isMobile ? '0.85rem' : '0.95rem' }}>
                    <span>Carbs:</span>
                    <strong>{(viewingMacroItem.metadata as any).carbs || 0}g</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'white', borderRadius: '6px', fontSize: isMobile ? '0.85rem' : '0.95rem' }}>
                    <span>Fats:</span>
                    <strong>{(viewingMacroItem.metadata as any).fats || 0}g</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'white', borderRadius: '6px', fontSize: isMobile ? '0.85rem' : '0.95rem' }}>
                    <span>Fiber:</span>
                    <strong>{(viewingMacroItem.metadata as any).fiber || 0}g</strong>
                  </div>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => { setShowMacroModal(false); openEditModal(viewingMacroItem); }} style={{
                flex: 1,
                padding: isMobile ? '0.6rem' : '0.75rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: isMobile ? '0.85rem' : '0.95rem'
              }}>
                Edit
              </button>
              <button onClick={() => { setShowMacroModal(false); setViewingMacroItem(null); }} style={{
                flex: 1,
                padding: isMobile ? '0.6rem' : '0.75rem',
                background: '#ccc',
                color: '#333',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: isMobile ? '0.85rem' : '0.95rem'
              }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

{/* Add Item Modal - COMPLETE WITH ALL MACRO INPUTS */}
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
            padding: isMobile ? '1.5rem' : '2rem',
            borderRadius: '12px',
            maxWidth: isMobile ? '100%' : '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginBottom: '1rem', fontSize: isMobile ? '1.2rem' : '1.5rem' }}>➕ Add Item</h2>
            
            {/* Item Name */}
            <input
              type="text"
              value={newItem.name}
              onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              placeholder="Item name (e.g., 🏊 Swimming 30 min)"
              style={{
                width: '100%',
                padding: isMobile ? '0.6rem' : '0.75rem',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: isMobile ? '0.85rem' : '0.95rem',
                marginBottom: '1rem'
              }}
            />
            
            {/* Category */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: isMobile ? '0.85rem' : '0.95rem' }}>Category</label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({...newItem, category: e.target.value as any})}
                style={{
                  width: '100%',
                  padding: isMobile ? '0.6rem' : '0.75rem',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: isMobile ? '0.85rem' : '0.95rem'
                }}
              >
                <option value="ROUTINE">Routine</option>
                <option value="SUPPLEMENT">Supplement</option>
                <option value="DIET">Diet</option>
              </select>
            </div>

            {/* ROUTINE - Exercise Checkbox */}
            {newItem.category === 'ROUTINE' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: isMobile ? '0.85rem' : '0.95rem', fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={newItem.is_exercise}
                    onChange={(e) => setNewItem({...newItem, is_exercise: e.target.checked})}
                    style={{ width: '18px', height: '18px', accentColor: '#ff6b6b' }}
                  />
                  🔥 This burns calories (exercise)
                </label>
                
                {/* Calorie Burn Input */}
                {newItem.is_exercise && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                      Calories Burned
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newItem.calories_burn}
                      onChange={(e) => setNewItem({...newItem, calories_burn: parseInt(e.target.value) || 0})}
                      placeholder="e.g., 400"
                      style={{
                        width: '100%',
                        padding: isMobile ? '0.6rem' : '0.75rem',
                        border: '2px solid #ddd',
                        borderRadius: '8px',
                        fontSize: isMobile ? '0.85rem' : '0.95rem'
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Persistent Checkbox (not for Diet) */}
            {newItem.category !== 'DIET' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: isMobile ? '0.85rem' : '0.95rem', fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={newItem.persistent}
                    onChange={(e) => setNewItem({...newItem, persistent: e.target.checked})}
                    style={{ width: '18px', height: '18px', accentColor: '#667eea' }}
                  />
                  💾 Save for future days
                </label>
              </div>
            )}

            {/* DIET - All Macro Inputs */}
            {newItem.category === 'DIET' && (
              <>
                {/* Unit Type */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: isMobile ? '0.85rem' : '0.95rem' }}>Unit Type</label>
                  <select
                    value={newItem.unit}
                    onChange={(e) => setNewItem({...newItem, unit: e.target.value as any})}
                    style={{
                      width: '100%',
                      padding: isMobile ? '0.6rem' : '0.75rem',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: isMobile ? '0.85rem' : '0.95rem'
                    }}
                  >
                    <option value="gram">Per Gram</option>
                    <option value="unit">Per Unit</option>
                    <option value="scoop">Per Scoop</option>
                  </select>
                </div>

                {/* Info Box */}
                <div style={{ 
                  background: '#f8f9ff', 
                  padding: isMobile ? '0.75rem' : '1rem', 
                  borderRadius: '8px', 
                  marginBottom: '1rem',
                  border: '1px solid #e0e7ff'
                }}>
                  <p style={{ margin: 0, fontSize: isMobile ? '0.75rem' : '0.85rem', color: '#666' }}>
                    💡 Enter nutrition values per {newItem.unit === 'gram' ? '1 gram' : newItem.unit === 'unit' ? '1 unit' : '1 scoop'}
                  </p>
                </div>

                {/* Calories */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                    Calories (per {newItem.unit})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItem.calories}
                    onChange={(e) => setNewItem({...newItem, calories: parseFloat(e.target.value) || 0})}
                    style={{
                      width: '100%',
                      padding: isMobile ? '0.6rem' : '0.75rem',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: isMobile ? '0.85rem' : '0.95rem'
                    }}
                  />
                </div>

                {/* Protein */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                    Protein (g per {newItem.unit})
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={newItem.protein}
                    onChange={(e) => setNewItem({...newItem, protein: parseFloat(e.target.value) || 0})}
                    style={{
                      width: '100%',
                      padding: isMobile ? '0.6rem' : '0.75rem',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: isMobile ? '0.85rem' : '0.95rem'
                    }}
                  />
                </div>

                {/* Carbs */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                    Carbs (g per {newItem.unit})
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={newItem.carbs}
                    onChange={(e) => setNewItem({...newItem, carbs: parseFloat(e.target.value) || 0})}
                    style={{
                      width: '100%',
                      padding: isMobile ? '0.6rem' : '0.75rem',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: isMobile ? '0.85rem' : '0.95rem'
                    }}
                  />
                </div>

                {/* Fiber */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                    Fiber (g per {newItem.unit})
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={newItem.fiber}
                    onChange={(e) => setNewItem({...newItem, fiber: parseFloat(e.target.value) || 0})}
                    style={{
                      width: '100%',
                      padding: isMobile ? '0.6rem' : '0.75rem',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: isMobile ? '0.85rem' : '0.95rem'
                    }}
                  />
                </div>

                {/* Fats */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                    Fats (g per {newItem.unit})
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={newItem.fats}
                    onChange={(e) => setNewItem({...newItem, fats: parseFloat(e.target.value) || 0})}
                    style={{
                      width: '100%',
                      padding: isMobile ? '0.6rem' : '0.75rem',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: isMobile ? '0.85rem' : '0.95rem'
                    }}
                  />
                </div>
              </>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button onClick={addNewItem} style={{
                flex: 1,
                minWidth: '100px',
                padding: isMobile ? '0.6rem' : '0.75rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: isMobile ? '0.85rem' : '0.95rem'
              }}>
                Add
              </button>
              <button onClick={() => setShowAddItem(false)} style={{
                flex: 1,
                minWidth: '100px',
                padding: isMobile ? '0.6rem' : '0.75rem',
                background: '#ccc',
                color: '#333',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: isMobile ? '0.85rem' : '0.95rem'
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal - COMPLETE WITH ALL MACRO EDITING */}
      {showEditItem && editingItem && (
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
            padding: isMobile ? '1.5rem' : '2rem',
            borderRadius: '12px',
            maxWidth: isMobile ? '100%' : '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginBottom: '1rem', fontSize: isMobile ? '1.2rem' : '1.5rem' }}>
              ✏️ Edit {editingItem.category === 'DIET' ? 'Diet' : editingItem.category === 'ROUTINE' && (editingItem.metadata as any)?.calories_burn ? 'Exercise' : ''} Item
            </h2>
            
            {/* Item Name */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>Item Name</label>
              <input
                type="text"
                value={editingItem.name}
                onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                style={{
                  width: '100%',
                  padding: isMobile ? '0.6rem' : '0.75rem',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: isMobile ? '0.85rem' : '0.95rem'
                }}
              />
            </div>

            {/* ROUTINE - Calorie Burn Edit */}
            {editingItem.category === 'ROUTINE' && (editingItem.metadata as any)?.calories_burn !== undefined && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                  Calories Burned
                </label>
                <input
                  type="number"
                  min="0"
                  value={(editingItem.metadata as any).calories_burn || 0}
                  onChange={(e) => setEditingItem({
                    ...editingItem, 
                    metadata: {...editingItem.metadata, calories_burn: parseInt(e.target.value) || 0}
                  })}
                  style={{
                    width: '100%',
                    padding: isMobile ? '0.6rem' : '0.75rem',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    fontSize: isMobile ? '0.85rem' : '0.95rem'
                  }}
                />
              </div>
            )}

            {/* DIET - All Macro Edit Fields */}
            {editingItem.category === 'DIET' && editingItem.metadata && (
              <>
                <div style={{ 
                  background: '#f8f9ff', 
                  padding: isMobile ? '0.75rem' : '1rem', 
                  borderRadius: '8px', 
                  marginBottom: '1rem',
                  border: '1px solid #e0e7ff'
                }}>
                  <p style={{ margin: 0, fontSize: isMobile ? '0.75rem' : '0.85rem', color: '#666' }}>
                    💡 Update nutrition values per {(editingItem.metadata as any).unit}
                  </p>
                </div>

                {/* Calories */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                    Calories (per {(editingItem.metadata as any).unit})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={(editingItem.metadata as any).calories || 0}
                    onChange={(e) => setEditingItem({
                      ...editingItem, 
                      metadata: {...editingItem.metadata, calories: parseFloat(e.target.value) || 0}
                    })}
                    style={{
                      width: '100%',
                      padding: isMobile ? '0.6rem' : '0.75rem',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: isMobile ? '0.85rem' : '0.95rem'
                    }}
                  />
                </div>

                {/* Protein */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                    Protein (g per {(editingItem.metadata as any).unit})
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={(editingItem.metadata as any).protein || 0}
                    onChange={(e) => setEditingItem({
                      ...editingItem, 
                      metadata: {...editingItem.metadata, protein: parseFloat(e.target.value) || 0}
                    })}
                    style={{
                      width: '100%',
                      padding: isMobile ? '0.6rem' : '0.75rem',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: isMobile ? '0.85rem' : '0.95rem'
                    }}
                  />
                </div>

                {/* Carbs */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                    Carbs (g per {(editingItem.metadata as any).unit})
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={(editingItem.metadata as any).carbs || 0}
                    onChange={(e) => setEditingItem({
                      ...editingItem, 
                      metadata: {...editingItem.metadata, carbs: parseFloat(e.target.value) || 0}
                    })}
                    style={{
                      width: '100%',
                      padding: isMobile ? '0.6rem' : '0.75rem',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: isMobile ? '0.85rem' : '0.95rem'
                    }}
                  />
                </div>

                {/* Fiber */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                    Fiber (g per {(editingItem.metadata as any).unit})
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={(editingItem.metadata as any).fiber || 0}
                    onChange={(e) => setEditingItem({
                      ...editingItem, 
                      metadata: {...editingItem.metadata, fiber: parseFloat(e.target.value) || 0}
                    })}
                    style={{
                      width: '100%',
                      padding: isMobile ? '0.6rem' : '0.75rem',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: isMobile ? '0.85rem' : '0.95rem'
                    }}
                  />
                </div>

                {/* Fats */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                    Fats (g per {(editingItem.metadata as any).unit})
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={(editingItem.metadata as any).fats || 0}
                    onChange={(e) => setEditingItem({
                      ...editingItem, 
                      metadata: {...editingItem.metadata, fats: parseFloat(e.target.value) || 0}
                    })}
                    style={{
                      width: '100%',
                      padding: isMobile ? '0.6rem' : '0.75rem',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: isMobile ? '0.85rem' : '0.95rem'
                    }}
                  />
                </div>
              </>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={updateItem} style={{
                flex: 1,
                padding: isMobile ? '0.6rem' : '0.75rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: isMobile ? '0.85rem' : '0.95rem'
              }}>
                Update
              </button>
              <button onClick={() => { setShowEditItem(false); setEditingItem(null); }} style={{
                flex: 1,
                padding: isMobile ? '0.6rem' : '0.75rem',
                background: '#ccc',
                color: '#333',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: isMobile ? '0.85rem' : '0.95rem'
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
     <TagBasedTodoModal 
  isOpen={showTodosModal}
  onClose={() => setShowTodosModal(false)}
  isMobile={isMobile}
/>

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
