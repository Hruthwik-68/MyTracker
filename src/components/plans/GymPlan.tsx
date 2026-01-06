import { useState } from 'react'

export const GymPlan = () => {
  const [content, setContent] = useState(`DAILY GYM ROUTINE:

🏋️ Weight Training: 1 hour
- Focus on 2 body parts each day
- Progressive overload principle

💪 Core & Forearms: 30 minutes (Alternate Days)
- Planks, crunches, leg raises
- Forearm curls and grip exercises

🏃 Cardio - Treadmill: 1 hour
- Speed: 8 km/h
- Steady state cardio

WEEKLY SPLIT:
- Monday: Chest + Triceps
- Tuesday: Back + Biceps
- Wednesday: Legs + Shoulders
- Thursday: Chest + Triceps
- Friday: Back + Biceps
- Saturday: Legs + Abs
- Sunday: Rest / Light cardio`)

  return (
    <div style={{
      background: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginBottom: '1rem', color: '#667eea' }}>💪 Gym Plan</h2>
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{
          width: '100%',
          minHeight: '350px',
          padding: '1rem',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '0.95rem',
          fontFamily: 'monospace',
          resize: 'vertical'
        }}
      />
      
      <button
        onClick={() => alert('Gym plan saved!')}
        style={{
          marginTop: '1rem',
          padding: '0.75rem 1.5rem',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: '600'
        }}
      >
        Save Gym Plan
      </button>
    </div>
  )
}