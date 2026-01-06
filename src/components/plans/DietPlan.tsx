import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

export const DietPlan = () => {
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
        .eq('type', 'DIET')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data && data.content) {
        setContent(data.content)
      }
    } catch (error) {
      console.error('Error loading diet plan:', error)
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
        .eq('type', 'DIET')
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
            type: 'DIET',
            title: 'Diet Plan',
            content
          }])
      }

      alert('Diet Plan saved successfully!')
    } catch (error) {
      console.error('Error saving diet plan:', error)
      alert('Failed to save diet plan')
    } finally {
      setSaving(false)
    }
  }

  const defaultDiet = `DAILY DIET:
- Water: 2 litres
- Chicken: 350g (420 Cal, 78.8g protein)
- Eggs: 4 medium (273 Cal, 22.1g protein)
- Sprouts: 50g (15 Cal, 1.5g protein)
- Whey Protein: 2 scoops (270 Cal, 44g protein)
- Curd: 200g (120 Cal, 6.2g protein)
- Rice: 300g (324 Cal, 5.4g protein)
- Soya Chunks: 11g (38 Cal, 5.7g protein)

SUPPLEMENTS:
- Hot water (morning)
- Glutathione tab (alternate days)
- Vitamin C tab (alternate days)
- Skin care tablet (morning + night)
- Creatine 3-5g
- Green tea (evening)
- Multivitamin (evening)
- Flaxseed 1 spoon (morning/evening)`

  return (
    <div style={{
      background: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginBottom: '1rem', color: '#667eea' }}>🥗 Diet Plan</h2>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <textarea
            value={content || defaultDiet}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your diet plan here..."
            style={{
              width: '100%',
              minHeight: '400px',
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
            {saving ? 'Saving...' : 'Save Diet Plan'}
          </button>
        </>
      )}
    </div>
  )
}