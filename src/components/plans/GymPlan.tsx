import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

export const GymPlan = () => {
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
        .eq('type', 'GYM')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data && data.content) {
        setContent(data.content)
      }
    } catch (error) {
      console.error('Error loading gym plan:', error)
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
        .eq('type', 'GYM')
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
            type: 'GYM',
            title: 'Complete Gym Plan',
            content
          }])
      }

      alert('✅ Gym Plan saved successfully!')
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving gym plan:', error)
      alert('❌ Failed to save gym plan')
    } finally {
      setSaving(false)
    }
  }

  const gymMasterPlan = `💪 COMPLETE GYM WORKOUT PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 WEEKLY WORKOUT STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Daily Format:
- 1 hour Weight Training (2 body parts)
- 30 min Core/Forearms (alternate days)
- 1 hour Treadmill @ 8 km/h

Total Daily Time: ~2.5 hours


📅 MONDAY - CHEST + TRICEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHEST:
1. Flat Bench Press: 4×8-10
2. Incline Dumbbell Press: 4×10-12
3. Cable Flyes: 3×12-15
4. Dips (Chest focus): 3×10-12

TRICEPS:
1. Close Grip Bench Press: 4×8-10
2. Overhead Tricep Extension: 3×12-15
3. Tricep Pushdowns: 3×12-15
4. Diamond Push-ups: 3×AMRAP

CORE: Planks + Crunches
CARDIO: Treadmill 1 hour @ 8 km/h


📅 TUESDAY - BACK + BICEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BACK:
1. Deadlifts: 4×6-8
2. Pull-ups/Lat Pulldowns: 4×8-12
3. Barbell Rows: 4×10-12
4. Seated Cable Rows: 3×12-15
5. Face Pulls: 3×15-20

BICEPS:
1. Barbell Curls: 4×10-12
2. Hammer Curls: 3×12-15
3. Cable Curls: 3×12-15
4. Concentration Curls: 3×12-15

FOREARMS: Wrist Curls + Reverse Curls
CARDIO: Treadmill 1 hour @ 8 km/h


📅 WEDNESDAY - SHOULDERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SHOULDERS:
1. Overhead Press (Barbell): 4×8-10
2. Dumbbell Lateral Raises: 4×12-15
3. Front Raises: 3×12-15
4. Reverse Flyes: 3×12-15
5. Shrugs: 4×15-20
6. Arnold Press: 3×10-12

CORE: Leg Raises + Russian Twists
CARDIO: Treadmill 1 hour @ 8 km/h


📅 THURSDAY - LEGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LEGS:
1. Squats: 4×8-10
2. Leg Press: 4×12-15
3. Leg Extensions: 3×12-15
4. Leg Curls: 3×12-15
5. Lunges: 3×12 each leg
6. Calf Raises: 4×15-20

FOREARMS: Farmer's Walk + Grip Strengtheners
CARDIO: Treadmill 1 hour @ 8 km/h


📅 FRIDAY - CHEST + BACK (Volume Day)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHEST:
1. Incline Bench Press: 4×8-10
2. Dumbbell Flyes: 3×12-15
3. Push-ups: 3×AMRAP

BACK:
1. T-Bar Rows: 4×10-12
2. Single Arm Dumbbell Rows: 3×12-15
3. Straight Arm Pulldowns: 3×12-15

CORE: Hanging Leg Raises + Side Planks
CARDIO: Treadmill 1 hour @ 8 km/h


📅 SATURDAY - ARMS + SHOULDERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BICEPS:
1. Preacher Curls: 4×10-12
2. Cable Curls: 3×12-15
3. 21s: 3 sets

TRICEPS:
1. Skull Crushers: 4×10-12
2. Overhead Cable Extension: 3×12-15
3. Tricep Dips: 3×AMRAP

SHOULDERS:
1. Face Pulls: 4×15-20
2. Lateral Raises: 3×15-20
3. Rear Delt Flyes: 3×15-20

FOREARMS: Full Forearm Circuit
CARDIO: Treadmill 1 hour @ 8 km/h


📅 SUNDAY - ACTIVE REST / OPTIONAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OPTIONS:
- Full Rest Day (Recommended)
- Light Cardio Only (30-45 min walk)
- Yoga/Stretching (30-45 min)
- Swimming (30 min)

Focus: Recovery and meal prep


⚡ PROGRESSIVE OVERLOAD STRATEGY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WEEK 1-2: Learn form, moderate weight
WEEK 3-4: Increase weight 5-10%
WEEK 5-6: Add 1 extra set to main lifts
WEEK 7-8: Increase weight again 5-10%
WEEK 9-10: Deload week (reduce weight 20%)
WEEK 11-12: New personal records!

Always prioritize:
✓ Perfect form over heavy weight
✓ Full range of motion
✓ Controlled movements
✓ Proper breathing
✓ Mind-muscle connection


🔥 CALORIE BURN ESTIMATES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Weight Training (1 hr): ~400 calories
Treadmill @ 8km/h (1 hr): ~850 calories
Core Work (30 min): ~150 calories

Total Daily Burn: ~1,400 calories


💡 PRO TIPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Warm up 5-10 min before weights
✓ Stretch after each workout
✓ Track your lifts in a notebook
✓ Rest 60-90 seconds between sets
✓ Rest 2-3 min for heavy compounds
✓ Stay hydrated (500ml during workout)
✓ Don't train through pain
✓ Sleep 8 hours for recovery
✓ Increase protein on workout days


🚫 COMMON MISTAKES TO AVOID
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

× Ego lifting (too much weight)
× Poor form
× Skipping warm-up
× Not tracking progress
× Training same muscles back-to-back
× Neglecting legs
× Ignoring core work
× Not eating enough protein
× Insufficient rest


📈 PROGRESS TRACKING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Track weekly:
- Body weight (same time, same day)
- Body measurements (chest, arms, waist)
- Gym performance (weights, reps)
- Progress photos (monthly)
- How you feel (energy, soreness)


💪 STAY STRONG & CONSISTENT!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`

  const formatText = (type: 'bold' | 'italic' | 'underline' | 'code') => {
    const textarea = document.getElementById('gym-editor') as HTMLTextAreaElement
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
    const textarea = document.getElementById('gym-editor') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const heading = '#'.repeat(level) + ' '
    const newContent = content.substring(0, start) + heading + content.substring(start)
    setContent(newContent)
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      padding: '2rem',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(79, 172, 254, 0.3)',
      transition: 'all 0.3s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)'
      e.currentTarget.style.boxShadow = '0 15px 40px rgba(79, 172, 254, 0.4)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = '0 10px 30px rgba(79, 172, 254, 0.3)'
    }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '3rem' }}>💪</div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, color: 'white', fontSize: '1.8rem' }}>Complete Gym Plan</h2>
          <p style={{ margin: '0.25rem 0 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
            Weekly workout split with progressive overload
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
              id="gym-editor"
              value={content || gymMasterPlan}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Your Gym Plan will appear here..."
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
              {content || gymMasterPlan}
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
                color: saving ? '#999' : '#00f2fe',
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
              {saving ? '⏳ Saving...' : '💾 Save Gym Plan'}
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
