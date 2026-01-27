import { supabase } from '../_lib/supabase.js'

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    )

    if (req.method === 'OPTIONS') {
        res.status(200).end()
        return
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    // Parse body properly
    let body = req.body
    console.log('Login Request Body Type:', typeof body)
    console.log('Login Request Body:', body)

    if (typeof body === 'string') {
        try {
            body = JSON.parse(body)
            console.log('Parsed Body:', body)
        } catch (e) {
            console.error('JSON Parse Error:', e)
            return res.status(400).json({ error: 'Invalid JSON body' })
        }
    }

    // Handle case where body might be empty object if parsing failed earlier or wasn't sent
    if (!body) {
        return res.status(400).json({ error: 'No request body sent' })
    }

    const { email, password } = body

    if (!email || !password) {
        console.error('Missing fields. Email:', !!email, 'Password:', !!password)
        return res.status(400).json({ error: 'Email and password are required' })
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) {
            console.error('Supabase Login Error:', error)
            throw error
        }

        return res.status(200).json(data)
    } catch (error) {
        return res.status(400).json({ error: error.message || 'Login failed' })
    }
}
