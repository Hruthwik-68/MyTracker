import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

export const DietPlan = () => {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

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

      alert('✅ Diet Plan saved successfully!')
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving diet plan:', error)
      alert('❌ Failed to save diet plan')
    } finally {
      setSaving(false)
    }
  }

  const dietMasterPlan = `🍽️ COMPLETE DIET & NUTRITION PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 DAILY NUTRITION BREAKDOWN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🍗 CHICKEN BREAST
   Quantity: 350g
   Calories: 420 Cal
   Protein: 78.8g
   Carbs: 9.1g
   Fats: 0.7g

🥚 EGGS (Medium)
   Quantity: 4 units
   Calories: 273 Cal
   Protein: 18.7g
   Carbs: 9.2g
   Fats: 8g

💪 WHEY PROTEIN
   Quantity: 2 scoops
   Calories: 270 Cal
   Protein: 44g
   Carbs: 4.2g
   Fats: 14g

🍚 BOILED RICE
   Quantity: 300g
   Calories: 324 Cal
   Protein: 5.4g
   Carbs: 72g
   Fats: 0.6g

🥛 CURD
   Quantity: 200g
   Calories: 120 Cal
   Protein: 6.2g
   Carbs: 8g
   Fats: 6g

🌱 SPROUTS
   Quantity: 50g
   Calories: 15 Cal
   Protein: 1.5g
   Carbs: 0.1g
   Fiber: 0.9g
   Fats: 3g

🫘 SOYA CHUNKS
   Quantity: 11g
   Calories: 38 Cal
   Protein: 5.7g
   Carbs: 0.1g
   Fiber: 1.4g
   Fats: 3.6g


📈 TOTAL DAILY INTAKE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔥 Calories: ~1,460 Cal
💪 Protein: ~164g
🍞 Carbs: ~72g
🥑 Fats: ~41g
🌾 Fiber: ~6.3g


💊 SUPPLEMENT SCHEDULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌅 MORNING (Empty Stomach)
   • Hot water with lemon
   • Glutathione (Alternate days)
   • Vitamin C (Alternate days - when no Glutathione)
   • Skin care tablet

🏋️ PRE-WORKOUT (30 min before)
   • Black coffee (optional)
   • 1 Banana

💪 POST-WORKOUT (Within 30 min)
   • Whey Protein shake (1 scoop)
   • Creatine 3-5g

🌆 EVENING
   • Green tea
   • Multivitamin
   • Flaxseed 1 spoon

🌙 NIGHT (Before bed)
   • Skin care tablet
   • Whey Protein (1 scoop if needed)


💧 HYDRATION GOAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Target: 2-3 Litres daily
- Morning: 500ml
- Pre-workout: 500ml
- During workout: 500ml
- Post-workout: 500ml
- Evening: 500ml
- Night: 500ml


⏰ MEAL TIMING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

07:00 AM - Wake up + Hot water
07:30 AM - Breakfast (Eggs + Sprouts)
10:00 AM - Mid-morning (Curd)
12:30 PM - Lunch (Chicken + Rice)
03:00 PM - Pre-workout snack
04:00 PM - Workout
05:30 PM - Post-workout (Whey + Banana)
08:00 PM - Dinner (Chicken + Soya)
10:00 PM - Bedtime snack (Curd if hungry)


🎯 NUTRITION GOALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRIMARY GOALS:
✓ High protein for muscle building
✓ Moderate carbs for energy
✓ Healthy fats for hormones
✓ Adequate fiber for digestion
✓ Consistent meal timing

MACROS RATIO:
- Protein: ~45%
- Carbs: ~30%
- Fats: ~25%


📝 NOTES & TIPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Meal prep on Sunday for the week
✓ Always have backup protein sources
✓ Track water intake religiously
✓ Don't skip post-workout nutrition
✓ Adjust portions based on activity level
✓ Cheat meal once a week (Saturday)
✓ Monitor weight weekly (same time)
✓ Adjust calories if not seeing results


🚫 AVOID
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
× Processed foods
× Sugary drinks
× Fried foods (except cheat day)
× Late night eating
× Skipping meals
× Insufficient protein


💪 STAY CONSISTENT! 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`

  const formatText = (type: 'bold' | 'italic' | 'underline' | 'code') => {
    const textarea = document.getElementById('diet-editor') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)

    let formattedText = ''
    switch (type) {
      case 'bold':
        formattedText = `**${selectedText}**`
        break
      case 'italic':
        formattedText = `*${selectedText}*`
        break
      case 'underline':
        formattedText = `__${selectedText}__`
        break
      case 'code':
        formattedText = `\`${selectedText}\``
        break
    }

    const newContent = content.substring(0, start) + formattedText + content.substring(end)
    setContent(newContent)
  }

  const insertHeading = (level: number) => {
    const textarea = document.getElementById('diet-editor') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const heading = '#'.repeat(level) + ' '
    const newContent = content.substring(0, start) + heading + content.substring(start)
    setContent(newContent)
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      padding: '2rem',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(245, 87, 108, 0.3)',
      transition: 'all 0.3s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)'
      e.currentTarget.style.boxShadow = '0 15px 40px rgba(245, 87, 108, 0.4)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = '0 10px 30px rgba(245, 87, 108, 0.3)'
    }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '3rem' }}>🍽️</div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, color: 'white', fontSize: '1.8rem' }}>Diet & Nutrition Plan</h2>
          <p style={{ margin: '0.25rem 0 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
            Complete nutrition breakdown and meal schedule
          </p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          style={{
            padding: '0.75rem 1.5rem',
            background: isEditing ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1rem',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.4)'}
          onMouseLeave={(e) => e.currentTarget.style.background = isEditing ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)'}
        >
          {isEditing ? '👁️ Preview' : '✏️ Edit'}
        </button>
      </div>
      
      {loading ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem',
          color: 'white',
          fontSize: '1.2rem'
        }}>
          <div style={{
            display: 'inline-block',
            width: '50px',
            height: '50px',
            border: '5px solid rgba(255,255,255,0.3)',
            borderTop: '5px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '1rem' }}>Loading your plan...</p>
        </div>
      ) : (
        <>
          {isEditing && (
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '1rem',
              flexWrap: 'wrap'
            }}>
              <button onClick={() => formatText('bold')} style={toolbarButtonStyle} title="Bold">
                <strong>B</strong>
              </button>
              <button onClick={() => formatText('italic')} style={toolbarButtonStyle} title="Italic">
                <em>I</em>
              </button>
              <button onClick={() => formatText('underline')} style={toolbarButtonStyle} title="Underline">
                <u>U</u>
              </button>
              <button onClick={() => formatText('code')} style={toolbarButtonStyle} title="Code">
                {'</>'}
              </button>
              <button onClick={() => insertHeading(1)} style={toolbarButtonStyle} title="Heading 1">
                H1
              </button>
              <button onClick={() => insertHeading(2)} style={toolbarButtonStyle} title="Heading 2">
                H2
              </button>
              <button onClick={() => insertHeading(3)} style={toolbarButtonStyle} title="Heading 3">
                H3
              </button>
            </div>
          )}

          {isEditing ? (
            <textarea
              id="diet-editor"
              value={content || dietMasterPlan}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Your Diet Plan will appear here..."
              style={{
                width: '100%',
                minHeight: '600px',
                padding: '1.5rem',
                border: 'none',
                borderRadius: '12px',
                fontSize: '0.95rem',
                fontFamily: 'Monaco, Consolas, monospace',
                resize: 'vertical',
                background: 'rgba(255,255,255,0.95)',
                color: '#333',
                lineHeight: '1.8',
                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)'
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              minHeight: '600px',
              maxHeight: '600px',
              overflowY: 'auto',
              padding: '1.5rem',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.95)',
              color: '#333',
              lineHeight: '1.8',
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)',
              fontFamily: 'Monaco, Consolas, monospace',
              fontSize: '0.95rem',
              whiteSpace: 'pre-wrap'
            }}>
              {content || dietMasterPlan}
            </div>
          )}
          
          {isEditing && (
            <button
              onClick={savePlan}
              disabled={saving}
              style={{
                marginTop: '1.5rem',
                padding: '1rem 2.5rem',
                background: saving ? 'rgba(255,255,255,0.5)' : 'white',
                color: saving ? '#999' : '#f5576c',
                border: 'none',
                borderRadius: '12px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: '700',
                fontSize: '1.1rem',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => !saving && (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {saving ? '⏳ Saving...' : '💾 Save Diet Plan'}
            </button>
          )}
        </>
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

const toolbarButtonStyle: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  background: 'rgba(255,255,255,0.2)',
  backdropFilter: 'blur(10px)',
  color: 'white',
  border: '1px solid rgba(255,255,255,0.3)',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '0.9rem',
  transition: 'all 0.2s ease',
  minWidth: '40px'
}
