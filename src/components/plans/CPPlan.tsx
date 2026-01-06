import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

export const CPPlan = () => {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadPlan()
  }, [user])

  const loadPlan = async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data } = await supabase
        .from('plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'CP')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data && data.content) {
        setContent(data.content)
      }
    } catch (error) {
      console.error('Error loading CP plan:', error)
    } finally {
      setLoading(false)
    }
  }

  const savePlan = async () => {
    if (!user) return
    setSaving(true)
    try {
      const { data: existing } = await supabase
        .from('plans')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'CP')
        .single()

      if (existing) {
        await supabase
          .from('plans')
          .update({ content, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
      } else {
        await supabase
          .from('plans')
          .insert([{
            user_id: user.id,
            type: 'CP',
            title: 'CP Plan',
            content
          }])
      }

      alert('CP Plan saved successfully!')
    } catch (error) {
      console.error('Error saving CP plan:', error)
      alert('Failed to save CP plan')
    } finally {
      setSaving(false)
    }
  }

  const defaultContent = `PHASE 1 - FUNDAMENTALS:
- Arrays and Strings
- Two Pointers
- Sliding Window
- Hashing
- Sorting

PHASE 2 - ADVANCED:
- Dynamic Programming
- Graphs
- Trees
- Backtracking
- Greedy Algorithms`

  return (
    <div style={{
      background: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginBottom: '1rem', color: '#667eea' }}>📝 CP Plan</h2>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <textarea
            value={content || defaultContent}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your CP Plan here..."
            style={{
              width: '100%',
              minHeight: '300px',
              padding: '1rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '0.95rem',
              fontFamily: 'monospace',
              resize: 'vertical'
            }}
          />
          
          <button
            onClick={savePlan}
            disabled={saving}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              background: saving ? '#ccc' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontWeight: '600'
            }}
          >
            {saving ? 'Saving...' : 'Save CP Plan'}
          </button>
        </>
      )}
    </div>
  )
}