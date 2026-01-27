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

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    // Parse body properly
    let body = req.body
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body)
        } catch (e) {
            return res.status(400).json({ error: 'Invalid JSON body' })
        }
    }

    const { email } = body

    if (!email) {
        return res.status(400).json({ error: 'Email is required' })
    }

    try {
        const { data: otpData, error: otpError } = await supabase.auth.signInWithOtp({
            email,
            options: { shouldCreateUser: true }
        })

        if (otpError) throw otpError

        return res.status(200).json(otpData)
    } catch (error) {
        return res.status(400).json({ error: error.message })
    }
}
