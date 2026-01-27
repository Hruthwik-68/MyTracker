import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import type { Plan } from '../../types'
import { PlanEditor } from './PlanEditor'

export const PlansDashboard = () => {
    const { user } = useAuth()
    const [plans, setPlans] = useState<Plan[]>([])
    const [loading, setLoading] = useState(true)
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
    const [isCreating, setIsCreating] = useState(false)

    useEffect(() => {
        if (user) {
            loadPlans()
        }
    }, [user])

    const loadPlans = async () => {
        if (!user) return
        setLoading(true)
        try {
            const { data } = await supabase
                .from('plans')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (data) setPlans(data)
        } catch (error) {
            console.error('Error loading plans:', error)
        } finally {
            setLoading(false)
        }
    }

    const deletePlan = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm('Are you sure you want to delete this plan?')) return

        try {
            await supabase.from('plans').delete().eq('id', id)
            setPlans(plans.filter(p => p.id !== id))
        } catch (error) {
            console.error('Error deleting plan:', error)
        }
    }

    // Zinc/Orange Theme
    const THEME = {
        bg: '#09090b',
        cardBg: '#18181b',
        border: '#27272a',
        accent: '#f97316',
        text: '#e4e4e7',
        textMuted: '#a1a1aa'
    }

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: THEME.bg, color: THEME.text }}>
            Loading plans...
        </div>
    )

    return (
        <div style={{ minHeight: '100vh', background: THEME.bg, color: THEME.text, padding: '2rem' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', margin: 0 }}>My Plans</h1>
                        <p style={{ color: THEME.textMuted, marginTop: '0.5rem' }}>Manage your master plans and roadmaps.</p>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        style={{
                            background: THEME.accent, color: 'white', border: 'none',
                            padding: '0.875rem 1.5rem', borderRadius: '8px',
                            fontWeight: '600', cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
                        }}
                    >
                        + Create Plan
                    </button>
                </div>

                {plans.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', background: THEME.cardBg, borderRadius: '16px', border: `1px solid ${THEME.border}` }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                        <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>No plans yet</h3>
                        <p style={{ color: THEME.textMuted }}>Create your first master plan to get started.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {plans.map(plan => (
                            <div
                                key={plan.id}
                                onClick={() => setEditingPlan(plan)}
                                style={{
                                    background: 'linear-gradient(145deg, #18181b 0%, #202023 100%)', // Subtle gradient
                                    border: `1px solid ${THEME.border}`,
                                    borderRadius: '16px',
                                    padding: '1.5rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                    display: 'flex', flexDirection: 'column',
                                    minHeight: '200px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)'
                                    e.currentTarget.style.borderColor = THEME.accent
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)'
                                    e.currentTarget.style.borderColor = THEME.border
                                }}
                            >
                                <div style={{ marginBottom: '1rem', fontSize: '2rem' }}>
                                    {plan.title.toLowerCase().includes('diet') ? '🍎' :
                                        plan.title.toLowerCase().includes('gym') ? '💪' :
                                            plan.title.toLowerCase().includes('cp') ? '👨‍💻' : '📋'}
                                </div>

                                <h3 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '1.25rem', lineHeight: '1.4' }}>{plan.title}</h3>

                                {plan.description && (
                                    <p style={{ color: THEME.textMuted, fontSize: '0.9rem', lineHeight: '1.5', flex: 1 }}>
                                        {plan.description}
                                    </p>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                    <button
                                        onClick={(e) => deletePlan(plan.id, e)}
                                        style={{
                                            background: 'transparent', border: 'none',
                                            color: '#71717a', cursor: 'pointer',
                                            zIndex: 2, padding: '0.5rem'
                                        }}
                                        title="Delete Plan"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {(isCreating || editingPlan) && (
                <PlanEditor
                    plan={editingPlan}
                    onClose={() => {
                        setIsCreating(false)
                        setEditingPlan(null)
                    }}
                    onSaved={loadPlans}
                />
            )}
        </div>
    )
}
