import { supabase } from '../_lib/supabase.js'

export default async function handler(req, res) {
    // CORS setup
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

    // Debugging logs
    console.log('Received OTP request');
    console.log('Body type:', typeof req.body);
    console.log('Raw body:', req.body);

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    // Parse body
    let body = req.body
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body)
        } catch (e) {
            console.error('JSON Parse Error:', e)
            return res.status(400).json({ error: 'Invalid JSON body' })
        }
    }

    const { email, redirectUri } = body || {}

    if (!email) {
        console.error('Missing email in body')
        return res.status(400).json({ error: 'Email is required' })
    }

    try {
        console.log('Attempting Supabase signInWithOtp for:', email)

        // Explicitly nullify emailRedirectTo if it causes issues, or ensure it is valid
        // For now, let's try WITHOUT it if it's failing, or log carefully
        const options = {
            shouldCreateUser: true
        }

        // Only add redirect if it exists and is valid
        if (redirectUri && redirectUri.startsWith('http')) {
            options.emailRedirectTo = redirectUri
        }

        const { data: otpData, error: otpError } = await supabase.auth.signInWithOtp({
            email,
            options
        })

        if (otpError) {
            console.error('Supabase OTP Error details:', JSON.stringify(otpError, null, 2))
            throw otpError
        }

        console.log('Supabase OTP Success:', otpData)

        return res.status(200).json(otpData)
    } catch (error) {
        console.error('Handler Critical Error:', error)
        return res.status(400).json({ error: error.message || 'An error occurred' })
    }
}
