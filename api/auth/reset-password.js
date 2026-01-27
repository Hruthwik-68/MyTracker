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

    const { email } = req.body

    try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email)

        if (error) throw error

        return res.status(200).json(data)
    } catch (error) {
        return res.status(400).json({ error: error.message })
    }
}
