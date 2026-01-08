import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

export const CPPlan = () => {
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
        .eq('type', 'CP')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data && data.content) {
        setContent(data.content)
      }
    } catch (error) {
      console.error('Error loading CP plan:', error)
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
        .eq('type', 'CP')
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
            type: 'CP',
            title: 'CP Master Plan',
            content
          }])
      }

      alert('✅ CP Plan saved successfully!')
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving CP plan:', error)
      alert('❌ Failed to save CP plan')
    } finally {
      setSaving(false)
    }
  }

  const cpMasterPlan = `🎯 COMPETITIVE PROGRAMMING MASTER PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📘 MASTER DOCUMENTATION

🎯 HARD DEADLINE: CF EXPERT BY MAY END
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PLATFORMS TARGETS:
✓ Codeforces → Expert (1600+)
✓ CodeChef → 4-5★
✓ LeetCode → 2000+

TIME AVAILABLE:
- Weekdays: 3-4 hours
- Weekends/Holidays: 8 hours (STRICT)

FOCUS: PHASE 1 + PHASE 2 ONLY
No Meta HC, No CM now. One target: EXPERT BY MAY


🔑 CORE PRINCIPLES (NON-NEGOTIABLE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ CONTESTS ARE PRIORITY
   ✓ All CF contests → YES (unless meeting)
   ✓ All CC contests → YES
   ✓ All LC weekly & biweekly → YES

2️⃣ TOPICS ARE LEARNED JUST IN TIME
   • If new topic appears in contest:
     - Research same day
     - Practice 3 days
     - Revise weekly

3️⃣ DAILY STRUCTURE
   • 1 hr → concepts
   • 2 hrs → solving
   • Extra → contests / upsolve

4️⃣ NOTES
   • One living document
   • Patterns, mistakes, tricks
   • Not theory dumps


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🟦 PHASE 1 — FOUNDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏱️ DURATION: 30 days (max 40 days hard cap)

🎯 PHASE-1 OBJECTIVE:
By end of Phase 1:
✓ CF Div2 B easy, C approachable
✓ No fear of math
✓ Strong implementation basics
✓ Comfortable with recursion & logic construction


1️⃣ RECURSION / D&C / BACKTRACKING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOPICS (MUST):
- Recursion basics & stack
- Base case design
- Recursion tree
- Backtracking template
- Pruning
- Divide & conquer mindset
- Merge-sort style recursion

YOU SHOULD BE ABLE TO:
✓ Convert brute force → recursion
✓ Identify overlapping subproblems (DP later)
✓ Write recursion without infinite loops


2️⃣ MATHS (EXPERT-LEVEL, NOT CM)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A. MODULAR ARITHMETIC (ABSOLUTE CORE)
   • Mod add / sub / mul
   • Negative mod handling
   • Fast exponentiation
   • Modular inverse (Fermat intuition)
   • Mod division rules

B. GCD / LCM / NT BASICS
   • Euclidean algorithm
   • GCD-LCM relation
   • Divisibility logic
   • Simplification via gcd

C. PRIMES & SIEVE
   • Prime check √n
   • Sieve of Eratosthenes
   • Smallest prime factor
   • Prime factorization

D. COMBINATORICS (LIGHT)
   • Factorial
   • nCr meaning
   • nCr with mod (fact + inv)
   • When combinations apply

E. EULER TOTIENT (BASIC)
   • Meaning of φ(n)
   • Simple formula using prime factors
   • When totient appears

📌 DEPTH RULE:
If you can code it WITHOUT GOOGLE, depth is enough.


3️⃣ BINARY SEARCH (INCLUDING ON ANSWER)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Lower bound / upper bound
- Binary search on monotonic function
- Binary search on answer
- Precision handling (double BS)
- When NOT to use BS

YOU SHOULD RECOGNIZE:
"Is this monotonic?" → BS candidate


4️⃣ STL — EVERYTHING NEEDED FOR EXPERT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONTAINERS:
- vector
- deque
- set / multiset
- map / unordered_map
- priority_queue
- pair / tuple

ALGORITHMS:
- sort (custom comparator)
- lower_bound / upper_bound
- binary_search
- accumulate
- next_permutation

TRICKS:
- Coordinate compression
- Custom sorting logic
- Iterators vs index


5️⃣ GREEDY (CONCEPTUAL ONLY IN PHASE 1)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NOT MASTERING YET, only learning:
- What greedy means
- Local vs global optimum
- Exchange argument intuition
- Sorting-based greedy
- Interval greedy

YOU SHOULD BE ABLE TO:
✓ Try greedy
✓ Know when it fails
✓ Understand editorial greedy logic


6️⃣ CONSTRUCTIVE ALGORITHMS (INTRO)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Building answer step-by-step
- Output any valid solution
- Pattern construction
- Observation-based construction

Very common in CF Div2 C.


7️⃣ C++ CORE FOR CP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LANGUAGE ESSENTIALS:
- int vs long long
- Overflow handling
- static variables
- References vs pointers
- Pass by value vs reference
- Fast IO
- Templates for CP

BONUS (LIGHT EXPOSURE):
- Memory layout intuition
- Stack vs heap


⏰ PHASE-1 TIME TABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WEEKDAY (≈3 hrs):
┌─────────┬──────────────────┐
│ 1 hr    │ Concept learning │
│ 2 hrs   │ Problem solving  │
│ Optional│ Contest if live  │
└─────────┴──────────────────┘

WEEKEND (≈8 hrs):
┌───────┬──────────────────┐
│ 2 hrs │ Concept revision │
│ 3 hrs │ Contest          │
│ 3 hrs │ Upsolve + notes  │
└───────┴──────────────────┘


🏁 PHASE-1 EXIT TARGETS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ CF rating: 1300-1400
✓ Confident implementation
✓ Math fear gone
✓ STL fluent

⚠️ If not achieved in 30 days → extend max 10 days, NO MORE.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🟦 PHASE 2 — CORE CP ENGINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏱️ DURATION: 3-4 months (till May end)

🎯 PHASE-2 OBJECTIVE:
By end of Phase 2:
✓ CF Expert (1600+)
✓ Div2 C solved fast
✓ Div2 D solvable
✓ Occasional Div2 E partial/full


1️⃣ DYNAMIC PROGRAMMING (MOST IMPORTANT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BASIC:
- 1D DP
- 2D DP
- Knapsack (0/1, unbounded)
- LIS / LCS

INTERMEDIATE:
- DP state design
- Transition optimization
- Space optimization
- DP + prefix

ADVANCED (EXPERT-LEVEL):
- Bitmask DP
- DP on trees
- State compression DP


2️⃣ TREES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- DFS / BFS
- Parent / depth / subtree size
- Tree traversal
- Tree DP basics
- Rerooting idea (intro)


3️⃣ GRAPHS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CORE:
- BFS / DFS
- Connected components
- Bipartite check
- Cycle detection

INTERMEDIATE:
- Topological sort
- DAG DP
- Shortest path (BFS, Dijkstra)
- DSU (Union Find)


4️⃣ RANGE QUERIES / DATA STRUCTURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Prefix sums
- Difference array
- Fenwick tree (BIT)
- Segment tree (point + range)
- Lazy propagation (intro)


5️⃣ SIDE-BY-SIDE LEARNING (CONTEST DRIVEN)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ADVANCED MATHS (GRADUAL):
- Inclusion-exclusion (basic)
- Modular combinatorics deeper
- Probability intuition
- Parity tricks

ADVANCED GREEDY:
- Greedy + DS
- Greedy + binary search
- Proof-based greedy

EXTRA DS:
- Monotonic stack
- Monotonic queue
- Coordinate compression (advanced use)


⏰ PHASE-2 DAILY STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WEEKDAY (3-4 hrs):
┌──────────┬─────────────────────────┐
│ 1 hr     │ Concept                 │
│ 2 hrs    │ Solve based on concept  │
│ 0.5-1 hr │ Upsolve / revise        │
└──────────┴─────────────────────────┘

WEEKEND (8 hrs):
- 1-2 contests
- Deep upsolving
- Notes refinement


🧠 LLD + C++ SIDE TRACK (OPTIONAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DAILY:
- 0.5 hr LLD (if fresh)

WEEKEND:
- 2 hrs LLD
- C++ OOPS
- Pointers
- Threading (conceptual only)

📌 RULE:
If CP suffers → pause LLD.
Expert CF > everything till May.


🏁 PHASE-2 EXIT TARGETS (BY MAY END)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ CF Expert (1600+)
✓ CodeChef 4-5★
✓ LeetCode 2000+
✓ Strong DP + Graph confidence
✓ Contest-ready mindset


🔥 FINAL TRUTH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This plan is:
- AGGRESSIVE
- ACHIEVABLE
- NOT FOR CASUAL EXECUTION

If you:
✓ Respect contests
✓ Do honest upsolving
✓ Don't jump topics randomly

👉 EXPERT BY MAY IS REALISTIC`

  const formatText = (type: 'bold' | 'italic' | 'underline' | 'code') => {
    const textarea = document.getElementById('cp-editor') as HTMLTextAreaElement
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
    const textarea = document.getElementById('cp-editor') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const heading = '#'.repeat(level) + ' '
    const newContent = content.substring(0, start) + heading + content.substring(start)
    setContent(newContent)
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
      transition: 'all 0.3s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)'
      e.currentTarget.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.4)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.3)'
    }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '3rem' }}>📝</div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, color: 'white', fontSize: '1.8rem' }}>CP Master Plan</h2>
          <p style={{ margin: '0.25rem 0 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
            Your roadmap to CF Expert by May
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
              id="cp-editor"
              value={content || cpMasterPlan}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Your CP Master Plan will appear here..."
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
              {content || cpMasterPlan}
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
                color: saving ? '#999' : '#667eea',
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
              {saving ? '⏳ Saving...' : '💾 Save CP Plan'}
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
