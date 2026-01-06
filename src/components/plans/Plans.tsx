import { CPPlan } from './CPPlan'
import { DietPlan } from './DietPlan'
import { GymPlan } from './GymPlan'

export const Plans = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', color: '#333' }}>My Plans</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <CPPlan />
        <DietPlan />
        <GymPlan />
      </div>
    </div>
  )
}