import { useState } from 'react'

export const GymPlan = () => {
  const [content, setContent] = useState(`💪 COMPLETE GYM & FITNESS PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 DAILY WORKOUT STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏱️ TOTAL WORKOUT TIME: 2.5 hours daily

1️⃣ WEIGHT TRAINING: 1 hour
   • Focus: 2 body parts each day
   • Progressive overload principle
   • 4-5 exercises per body part
   • 3-4 sets × 8-12 reps

2️⃣ CORE & FOREARMS: 30 minutes (Alternate Days)
   • Monday/Wednesday/Friday: Core
   • Tuesday/Thursday/Saturday: Forearms
   • Sunday: Rest

3️⃣ CARDIO - TREADMILL: 1 hour
   • Speed: 8 km/h (steady pace)
   • Incline: 0-2% for fat burn
   • Can split: 30 min morning + 30 min evening
   • Burn: ~400-500 calories


📅 WEEKLY TRAINING SPLIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 MONDAY - Chest + Triceps + Core
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHEST:
   • Barbell Bench Press: 4×8-10
   • Incline Dumbbell Press: 3×10-12
   • Cable Flyes: 3×12-15
   • Push-ups: 3×failure

TRICEPS:
   • Close Grip Bench: 3×10-12
   • Tricep Dips: 3×10-15
   • Cable Pushdowns: 3×12-15
   • Overhead Extension: 3×12

CORE:
   • Planks: 3×60 sec
   • Crunches: 3×25
   • Leg Raises: 3×15
   • Russian Twists: 3×30


🔵 TUESDAY - Back + Biceps + Forearms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BACK:
   • Deadlifts: 4×6-8
   • Pull-ups: 3×max
   • Barbell Rows: 3×10-12
   • Lat Pulldowns: 3×12-15
   • Face Pulls: 3×15

BICEPS:
   • Barbell Curls: 3×10-12
   • Hammer Curls: 3×12-15
   • Preacher Curls: 3×12
   • Cable Curls: 3×15

FOREARMS:
   • Wrist Curls: 3×20
   • Reverse Curls: 3×15
   • Farmer's Walk: 3×30 sec
   • Grip Squeezes: 3×max


🟢 WEDNESDAY - Legs + Shoulders + Core
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LEGS:
   • Squats: 4×8-10
   • Leg Press: 3×12-15
   • Leg Curls: 3×12-15
   • Leg Extensions: 3×12-15
   • Calf Raises: 4×20

SHOULDERS:
   • Military Press: 4×8-10
   • Lateral Raises: 3×12-15
   • Front Raises: 3×12-15
   • Rear Delt Flyes: 3×15

CORE:
   • Hanging Knee Raises: 3×15
   • Ab Wheel: 3×12
   • Side Planks: 3×45 sec each
   • Mountain Climbers: 3×30


🟡 THURSDAY - Chest + Triceps + Forearms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHEST:
   • Incline Barbell Press: 4×8-10
   • Flat Dumbbell Press: 3×10-12
   • Decline Press: 3×10-12
   • Pec Deck: 3×12-15

TRICEPS:
   • Skull Crushers: 3×10-12
   • Rope Pushdowns: 3×12-15
   • Overhead Cable Extension: 3×12
   • Diamond Push-ups: 3×failure

FOREARMS:
   • Barbell Wrist Curls: 3×20
   • Reverse Wrist Curls: 3×20
   • Plate Pinches: 3×30 sec
   • Dead Hangs: 3×max


🟠 FRIDAY - Back + Biceps + Core
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BACK:
   • T-Bar Rows: 4×10-12
   • Wide Grip Pulldowns: 3×12-15
   • Cable Rows: 3×12-15
   • Straight Arm Pulldowns: 3×15
   • Hyperextensions: 3×15

BICEPS:
   • EZ Bar Curls: 3×10-12
   • Concentration Curls: 3×12 each
   • Cable Curls: 3×15
   • 21s: 3 sets

CORE:
   • Weighted Crunches: 3×20
   • Bicycle Crunches: 3×30
   • V-Ups: 3×15
   • Dead Bugs: 3×20


🟣 SATURDAY - Legs + Abs + Forearms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LEGS:
   • Front Squats: 4×10-12
   • Romanian Deadlifts: 3×10-12
   • Bulgarian Split Squats: 3×12 each
   • Leg Press: 3×15
   • Seated Calf Raises: 4×20

ABS:
   • Cable Crunches: 3×20
   • Reverse Crunches: 3×20
   • Plank to Pike: 3×15
   • Toe Touches: 3×20
   • Ab Rollout: 3×12

FOREARMS:
   • Behind Back Wrist Curls: 3×20
   • Finger Curls: 3×25
   • Towel Hangs: 3×max


⚪ SUNDAY - Active Recovery
━━━━━━━━━━━━━━━━━━━━━━━━━
   • Light cardio: 30-45 min walk
   • Stretching: 20-30 minutes
   • Yoga or mobility work
   • Optional: Light swim


🎯 PROGRESSIVE OVERLOAD STRATEGY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Week 1-2: Learn form, moderate weight
Week 3-4: Increase weight by 5-10%
Week 5-6: Add 1-2 reps per set
Week 7-8: Increase weight again
Week 9+:  Deload week, then continue


💡 WORKOUT TIPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Always warm up: 5-10 minutes
✓ Focus on form over weight
✓ Rest 60-90 seconds between sets
✓ Stay hydrated during workout
✓ Track your weights and progress
✓ Sleep 7-9 hours for recovery
✓ Eat within 30 min post-workout


⚠️ SAFETY REMINDERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ Use spotter for heavy lifts
⚠️ Don't ego lift - use proper weight
⚠️ Listen to your body
⚠️ Take rest days seriously
⚠️ Stretch before and after
⚠️ Report any pain immediately`)

  return (
    <div style={{
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      padding: '2rem',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(79, 172, 254, 0.3)',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
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
        <div>
          <h2 style={{ margin: 0, color: 'white', fontSize: '1.8rem' }}>Complete Gym Plan</h2>
          <p style={{ margin: '0.25rem 0 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
            Detailed workout split with progressive overload strategy
          </p>
        </div>
      </div>
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
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
      
      <button
        onClick={() => alert('✅ Gym plan saved!')}
        style={{
          marginTop: '1.5rem',
          padding: '1rem 2.5rem',
          background: 'white',
          color: '#00f2fe',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          fontWeight: '700',
          fontSize: '1.1rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        💾 Save Gym Plan
      </button>
    </div>
  )
}