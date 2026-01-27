
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import {
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts'
import { Navbar } from '../components/common/Navbar'

interface ChartData {
    date: string
    [key: string]: any
}

export const StatsSummary = () => {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<ChartData[]>([])

    // Stats + Nutrition Pseudo-Stats
    const [stats, setStats] = useState<{ id: string, label: string, color: string, emoji: string }[]>([])
    const [selectedStats, setSelectedStats] = useState<string[]>([])

    // Date Range
    const [dateRange, setDateRange] = useState<'7' | '30' | '90' | 'ALL' | 'CUSTOM'>('7')
    const [customStart, setCustomStart] = useState('')
    const [customEnd, setCustomEnd] = useState('')

    // Mobile Check
    const [isMobile, setIsMobile] = useState(false)
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Professional Dark Theme
    const THEME = {
        bg: '#09090b', // Solid Rich Black
        cardBg: 'rgba(24, 24, 27, 0.6)',
        border: 'rgba(255, 255, 255, 0.08)',
        accent: '#f97316',
        text: '#e4e4e7',
    }

    // Load Data
    useEffect(() => {
        if (user) {
            loadData()
        }
    }, [user, dateRange, customStart, customEnd, selectedStats]) // Reload when stats change to ensure zero-fill

    const loadData = async () => {
        if (!user) return
        setLoading(true)
        try {
            // 1. Define Core Nutrition Pseudo-Stats
            const NUTRITION_STATS = [
                { id: 'calories', label: 'Net Calories', emoji: '🔥', color: '#f87171' },
                { id: 'protein', label: 'Protein (g)', emoji: '💪', color: '#fef08a' },
                { id: 'carbs', label: 'Carbs (g)', emoji: '🍞', color: '#60a5fa' },
                { id: 'fats', label: 'Fats (g)', emoji: '🥑', color: '#facc15' },
                { id: 'water', label: 'Water (L)', emoji: '💧', color: '#38bdf8' }
            ]

            // 2. Fetch User Custom Stats Definitions
            const { data: defs } = await supabase
                .from('stat_definitions')
                .select('*')
                .eq('user_id', user.id)

            const allStats = [...NUTRITION_STATS, ...(defs || [])]
            setStats(allStats)

            // Default selection if empty
            if (selectedStats.length === 0) {
                if (defs && defs.length > 0) {
                    setSelectedStats([defs[0].id, 'calories'])
                } else {
                    setSelectedStats(['calories', 'protein'])
                }
            }

            // 3. Determine Date Range
            let startDateStr = ''
            let endDateStr = new Date().toISOString().split('T')[0]

            if (dateRange === 'ALL') {
                const d = new Date()
                d.setFullYear(d.getFullYear() - 1)
                startDateStr = d.toISOString().split('T')[0]
            } else if (dateRange === 'CUSTOM') {
                if (!customStart || !customEnd) {
                    setLoading(false)
                    return
                }
                startDateStr = customStart
                endDateStr = customEnd
            } else {
                // If custom range was selected but now switched to 7/30/90
                const days = parseInt(dateRange)
                const d = new Date()
                d.setDate(d.getDate() - days)
                startDateStr = d.toISOString().split('T')[0]
            }

            // 4. Fetch Stats Data
            const { data: valData } = await supabase
                .from('daily_stat_values')
                .select('*')
                .eq('user_id', user.id)
                .gte('date', startDateStr)
                .lte('date', endDateStr)

            const { data: logsData } = await supabase
                .from('daily_checklists')
                .select('*')
                .eq('user_id', user.id)
                .gte('date', startDateStr)
                .lte('date', endDateStr)

            const { data: itemsData } = await supabase
                .from('checklist_items')
                .select('*')
                .eq('user_id', user.id)

            // 5. Process & Merge
            const groupedData: Record<string, any> = {}

            // Fill dates
            const start = new Date(startDateStr)
            const end = new Date(endDateStr)
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0]
                groupedData[dateStr] = { date: dateStr }
            }

            // Merge Custom Stats
            if (valData) {
                valData.forEach(v => {
                    if (groupedData[v.date]) {
                        groupedData[v.date][v.stat_def_id] = v.value
                    }
                })
            }

            // Merge Nutrition
            if (logsData && itemsData) {
                const logsByDate: Record<string, typeof logsData> = {}
                logsData.forEach(l => {
                    if (!logsByDate[l.date]) logsByDate[l.date] = []
                    logsByDate[l.date].push(l)
                })

                Object.keys(groupedData).forEach(date => {
                    const dayLogs = logsByDate[date] || []
                    let cal = 0, pro = 0, carb = 0, fat = 0, wat = 0, burnt = 0

                    dayLogs.forEach(log => {
                        const item = itemsData.find(i => i.id === log.checklist_item_id)
                        if (item && log.value) {
                            const qty = parseFloat(log.value) || 0
                            const meta = item.metadata as any
                            if (meta) {
                                if (item.name.toLowerCase().includes('water')) {
                                    wat += qty
                                } else if (qty > 0) {
                                    cal += (meta.calories || 0) * qty
                                    pro += (meta.protein || 0) * qty
                                    carb += (meta.carbs || 0) * qty
                                    fat += (meta.fats || 0) * qty
                                }
                            }
                        }
                        if (item?.category === 'ROUTINE' && log.is_done) {
                            const meta = item.metadata as any
                            if (meta?.calories_burn) burnt += meta.calories_burn
                        }
                    })

                    groupedData[date]['calories'] = Math.round(cal - burnt)
                    groupedData[date]['protein'] = Math.round(pro)
                    groupedData[date]['carbs'] = Math.round(carb)
                    groupedData[date]['fats'] = Math.round(fat)
                    groupedData[date]['water'] = Math.round(wat * 10) / 10
                })
            }

            // 6. Zero-Fill & Finalize
            const chartData = Object.values(groupedData).sort((a, b) => a.date.localeCompare(b.date))

            // CRITICAL: Ensure ALL selected stats have a value (0) for ALL dates to prevent gaps
            chartData.forEach(d => {
                selectedStats.forEach(statId => {
                    if (d[statId] === undefined || d[statId] === null) {
                        d[statId] = 0
                    }
                })
            })

            const formatted = chartData.map(d => ({
                ...d,
                displayDate: new Date(d.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
            }))
            setData(formatted)

        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const toggleStat = (id: string) => {
        setSelectedStats(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        )
    }

    return (
        <div style={{ minHeight: '100vh', background: THEME.bg, color: THEME.text, fontFamily: 'Inter, sans-serif' }}>
            <Navbar />

            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '1rem' : '2rem' }}>
                <h1 style={{ marginBottom: '2rem', fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: 'bold' }}>
                    📊 Stats Summary
                </h1>

                {/* Controls Container */}
                <div style={{
                    background: THEME.cardBg,
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: `1px solid ${THEME.border}`,
                    padding: '1.5rem',
                    borderRadius: '16px',
                    marginBottom: '2rem',
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? '1.5rem' : '2rem',
                    alignItems: 'flex-start'
                }}>

                    {/* Stats Selection */}
                    <div style={{ flex: 2, width: '100%' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '1rem', color: THEME.text, fontSize: '1rem', opacity: 0.8 }}>Select Stats</h3>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.75rem',
                            maxHeight: '200px',
                            overflowY: 'auto'
                        }}>
                            {stats.map(stat => (
                                <button
                                    key={stat.id}
                                    onClick={() => toggleStat(stat.id)}
                                    style={{
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '8px',
                                        border: selectedStats.includes(stat.id) ? `1px solid ${stat.color || THEME.accent}` : `1px solid ${THEME.border}`,
                                        background: selectedStats.includes(stat.id) ? `${stat.color}33` : 'rgba(255,255,255,0.05)',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        transition: 'all 0.2s',
                                        fontSize: '0.85rem',
                                        fontWeight: '500'
                                    }}
                                >
                                    <span>{stat.emoji}</span>
                                    <span>{stat.label}</span>
                                    {selectedStats.includes(stat.id) && <span style={{ opacity: 0.7 }}>✓</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date Range Selection */}
                    <div style={{ flex: 1, minWidth: isMobile ? '100%' : '300px' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '1rem', color: THEME.text, fontSize: '1rem', opacity: 0.8 }}>Date Range</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {['7', '30', '90', 'ALL'].map(range => (
                                    <button
                                        key={range}
                                        onClick={() => setDateRange(range as any)}
                                        style={{
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '6px',
                                            border: 'none',
                                            background: dateRange === range ? THEME.accent : 'rgba(255,255,255,0.1)',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            fontSize: '0.85rem',
                                            flex: 1,
                                            minWidth: '50px'
                                        }}
                                    >
                                        {range === 'ALL' ? 'All' : `${range}D`}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setDateRange('CUSTOM')}
                                    style={{
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '6px',
                                        border: dateRange === 'CUSTOM' ? `1px solid ${THEME.accent}` : '1px solid transparent',
                                        background: dateRange === 'CUSTOM' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(255,255,255,0.1)',
                                        color: dateRange === 'CUSTOM' ? THEME.accent : 'white',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '0.85rem',
                                        flex: 1,
                                        minWidth: '60px'
                                    }}
                                >
                                    Custom
                                </button>
                            </div>

                            {/* Detailed Custom Date Inputs */}
                            {dateRange === 'CUSTOM' && (
                                <div style={{
                                    display: 'flex', gap: '0.5rem',
                                    background: 'rgba(0,0,0,0.2)', padding: '0.75rem',
                                    borderRadius: '8px', border: `1px solid ${THEME.border}`,
                                    flexWrap: 'wrap'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.75rem', color: '#a1a1aa', display: 'block', marginBottom: '0.25rem' }}>Start</label>
                                        <input
                                            type="date"
                                            value={customStart}
                                            onChange={(e) => setCustomStart(e.target.value)}
                                            style={{
                                                width: '100%', padding: '0.4rem', borderRadius: '4px',
                                                background: 'rgba(255,255,255,0.1)', border: 'none',
                                                color: 'white', colorScheme: 'dark', fontSize: '0.85rem'
                                            }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.75rem', color: '#a1a1aa', display: 'block', marginBottom: '0.25rem' }}>End</label>
                                        <input
                                            type="date"
                                            value={customEnd}
                                            onChange={(e) => setCustomEnd(e.target.value)}
                                            style={{
                                                width: '100%', padding: '0.4rem', borderRadius: '4px',
                                                background: 'rgba(255,255,255,0.1)', border: 'none',
                                                color: 'white', colorScheme: 'dark', fontSize: '0.85rem'
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Graph Container */}
                <div style={{
                    background: THEME.cardBg,
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: `1px solid ${THEME.border}`,
                    padding: isMobile ? '1rem' : '2rem',
                    borderRadius: '24px',
                    height: '500px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    position: 'relative',
                    overflow: 'hidden' // Prevent chart overflow
                }}>
                    <h2 style={{ marginTop: 0, marginBottom: '2rem', fontSize: isMobile ? '1.2rem' : '1.5rem' }}>📈 Performance Analysis</h2>

                    {loading ? (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            Loading...
                        </div>
                    ) : (data.length === 0) ? (
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                            No data found for this period
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="85%">
                            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    {stats.map(stat => (
                                        <linearGradient key={stat.id} id={`color-${stat.id}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={stat.color || '#8884d8'} stopOpacity={0.4} />
                                            <stop offset="95%" stopColor={stat.color || '#8884d8'} stopOpacity={0} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                <XAxis
                                    dataKey="displayDate"
                                    stroke={THEME.text}
                                    style={{ fontSize: '0.7rem' }}
                                    tick={{ fill: THEME.text }}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke={THEME.text}
                                    style={{ fontSize: '0.7rem' }}
                                    tick={{ fill: THEME.text }}
                                    tickLine={false}
                                    axisLine={false}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'rgba(9, 9, 11, 0.95)',
                                        border: `1px solid ${THEME.border}`,
                                        borderRadius: '12px',
                                        backdropFilter: 'blur(12px)',
                                        color: 'white',
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                                    }}
                                    itemStyle={{ padding: 0 }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                {selectedStats.map(id => {
                                    const stat = stats.find(s => s.id === id)
                                    if (!stat) return null
                                    return (
                                        <Area
                                            key={id}
                                            type="monotone"
                                            dataKey={id}
                                            name={stat.label}
                                            stroke={stat.color || '#8884d8'}
                                            fillOpacity={1}
                                            fill={`url(#color-${id})`}
                                            strokeWidth={3}
                                            connectNulls={true}
                                            isAnimationActive={true}
                                            animationDuration={1000}
                                            activeDot={{ r: 6, strokeWidth: 0 }}
                                            dot={{ r: 0 }} // Clean lines, dots only on hover
                                        />
                                    )
                                })}
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </main>
        </div>
    )
}
