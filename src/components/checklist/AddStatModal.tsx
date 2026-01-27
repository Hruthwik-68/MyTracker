import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

interface AddStatModalProps {
    onClose: () => void
    onAdded: () => void
}

export const AddStatModal = ({ onClose, onAdded }: AddStatModalProps) => {
    const { user } = useAuth()
    const [label, setLabel] = useState('')
    const [emoji, setEmoji] = useState('📊')
    const [color, setColor] = useState('#3b82f6') // Blue default
    const [loading, setLoading] = useState(false)

    const handleSave = async () => {
        if (!user || !label.trim()) return
        setLoading(true)

        try {
            await supabase.from('stat_definitions').insert([{
                user_id: user.id,
                label,
                emoji,
                color,
                type: 'number' // Default to number for now
            }])
            onAdded()
            onClose()
        } catch (error) {
            console.error('Error adding stat:', error)
            alert('Failed to add stat')
        } finally {
            setLoading(false)
        }
    }

    const THEME = {
        bg: '#18181b', // Card Bg
        inputBg: '#27272a',
        border: '#3f3f46',
        text: 'white',
        accent: '#f97316'
    }

    const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{
                background: 'rgba(24, 24, 27, 0.7)',
                backdropFilter: 'blur(16px)',
                width: '90%', maxWidth: '400px',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '1.5rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                color: THEME.text
            }}>
                <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Add Custom Stat</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>Label</label>
                        <input
                            type="text"
                            placeholder="e.g. Meditation (mins)"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: '8px',
                                background: THEME.inputBg, border: `1px solid ${THEME.border}`,
                                color: 'white'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>Emoji Icon</label>
                        <div style={{
                            display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '0.5rem',
                            background: THEME.inputBg, padding: '0.75rem', borderRadius: '8px',
                            border: `1px solid ${THEME.border}`
                        }}>
                            {['📊', '🧘', '💧', '🏃', '📚', '🧠', '💼', '🎨', '🎵', '💤', '🥗', '💊', '⚙️', '📝', '✅', '🔥', '💡', '⏰', '📱', '💻', '🚲', '🏋️', '🧘‍♂️', '🥬'].map(e => (
                                <button
                                    key={e}
                                    onClick={() => setEmoji(e)}
                                    style={{
                                        background: emoji === e ? 'rgba(255,255,255,0.2)' : 'transparent',
                                        border: 'none', borderRadius: '4px',
                                        fontSize: '1.2rem', cursor: 'pointer', padding: '4px',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    {e}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>Color</label>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {COLORS.map(c => (
                                <div
                                    key={c}
                                    onClick={() => setColor(c)}
                                    style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        background: c, cursor: 'pointer',
                                        border: color === c ? '3px solid white' : 'none',
                                        transform: color === c ? 'scale(1.1)' : 'scale(1)'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: `1px solid ${THEME.border}`, color: 'white', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={handleSave} disabled={loading} style={{ flex: 1, padding: '0.75rem', background: THEME.accent, border: 'none', color: 'white', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', opacity: loading ? 0.7 : 1 }}>{loading ? 'Adding...' : 'Add Stat'}</button>
                </div>
            </div>
        </div>
    )
}
