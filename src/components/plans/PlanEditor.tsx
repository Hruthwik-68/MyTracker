import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import type { Plan } from '../../types'

interface PlanEditorProps {
    plan?: Plan | null
    onClose: () => void
    onSaved: () => void
}

export const PlanEditor = ({ plan, onClose, onSaved }: PlanEditorProps) => {
    const { user } = useAuth()
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (plan) {
            setTitle(plan.title)
            setDescription(plan.description || '')
            setContent(plan.content || '')
        }
    }, [plan])

    const handleSave = async () => {
        if (!user || !title.trim()) return
        setLoading(true)

        try {
            const planData = {
                user_id: user.id,
                title,
                description,
                content,
                updated_at: new Date().toISOString()
            }

            if (plan) {
                await supabase
                    .from('plans')
                    .update(planData)
                    .eq('id', plan.id)
            } else {
                await supabase
                    .from('plans')
                    .insert([planData])
            }

            onSaved()
            onClose()
        } catch (error) {
            console.error('Error saving plan:', error)
            alert('Failed to save plan')
        } finally {
            setLoading(false)
        }
    }

    // Zinc/Orange Theme
    const THEME = {
        bg: '#18181b', // Card Bg
        inputBg: '#27272a', // Input Bg
        border: '#3f3f46',
        text: '#e4e4e7',
        accent: '#f97316'
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{
                background: THEME.bg,
                width: '90%', maxWidth: '800px', height: '85vh',
                borderRadius: '16px', border: `1px solid ${THEME.border}`,
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem', borderBottom: `1px solid ${THEME.border}`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <h2 style={{ margin: 0, color: 'white' }}>{plan ? 'Edit Plan' : 'Create New Plan'}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#a1a1aa', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', color: '#a1a1aa', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Plan Title</label>
                        <input
                            type="text"
                            placeholder="e.g. CP Master Plan"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={{
                                width: '100%', padding: '0.875rem', borderRadius: '8px',
                                background: THEME.inputBg, border: `1px solid ${THEME.border}`,
                                color: 'white', fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', color: '#a1a1aa', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Short Description</label>
                        <input
                            type="text"
                            placeholder="e.g. Your roadmap to Expert by May"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={{
                                width: '100%', padding: '0.875rem', borderRadius: '8px',
                                background: THEME.inputBg, border: `1px solid ${THEME.border}`,
                                color: 'white', fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <label style={{ display: 'block', color: '#a1a1aa', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Content (Markdown supported)</label>
                        <textarea
                            placeholder="# Phase 1: Basics..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            style={{
                                flex: 1, width: '100%', padding: '1rem', borderRadius: '8px',
                                background: THEME.inputBg, border: `1px solid ${THEME.border}`,
                                color: '#e4e4e7', fontSize: '1rem', lineHeight: '1.6',
                                resize: 'none', minHeight: '300px', fontFamily: 'monospace'
                            }}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '1.5rem', borderTop: `1px solid ${THEME.border}`,
                    display: 'flex', justifyContent: 'flex-end', gap: '1rem'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '0.75rem 1.5rem', borderRadius: '8px',
                            background: 'transparent', border: `1px solid ${THEME.border}`,
                            color: 'white', cursor: 'pointer', fontWeight: '500'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || !title.trim()}
                        style={{
                            padding: '0.75rem 2rem', borderRadius: '8px',
                            background: THEME.accent, border: 'none',
                            color: 'white', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Saving...' : 'Save Plan'}
                    </button>
                </div>
            </div>
        </div>
    )
}
