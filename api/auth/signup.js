const db = require('../utils/db');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

export default async function handler(req, res) {
    // Only allow POST requests (sending data)
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, password, phone } = req.body;

    // Simple validation check
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        // 1. Check if the email already exists in the database
        const userCheck = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'An account with this email already exists.' });
        }

        // 2. Hash the password securely so it's unreadable
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Insert the new user into the database (Default role: 'client', is_verified: false)
        const newUser = await db.query(
            'INSERT INTO users (email, password_hash, phone) VALUES ($1, $2, $3) RETURNING id',
            [email.toLowerCase(), passwordHash, phone || null]
        );
        const userId = newUser.rows[0].id;

        // 4. Automatically create empty wallets for them (USD and BTC)
        await db.query('INSERT INTO wallets (user_id, currency, balance) VALUES ($1, $2, $3)', [userId, 'USD', 0.0000]);
        await db.query('INSERT INTO wallets (user_id, currency, balance) VALUES ($1, $2, $3)', [userId, 'BTC', 0.0000]);

        // 5. Generate a random 6-digit numeric OTP token
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // For testing/learning purposes, we'll temporarily send the OTP back in the response 
        // so you can see it easily without configuring an email provider layout immediately.
        return res.status(200).json({ 
            success: true, 
            message: 'Registration initialized. Verify your profile to complete setup.', 
            userId: userId, 
            otpCode: otpCode // Temporary for local visibility
        });

    } catch (error) {
        console.error('Registration pipeline failed:', error);
        return res.status(500).json({ error: 'Internal system database failure.' });
    }
}