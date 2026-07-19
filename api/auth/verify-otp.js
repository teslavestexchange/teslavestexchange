const db = require('../utils/db');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId, typedOtp, expectedOtp } = req.body;

    if (!userId || !typedOtp) {
        return res.status(400).json({ error: 'Missing required validation data.' });
    }

    try {
        // Compare what the user typed against what was generated
        if (typedOtp === expectedOtp) {
            // Update the user's status to verified in the database
            await db.query('UPDATE users SET is_verified = true WHERE id = $1', [userId]);
            
            return res.status(200).json({ 
                success: true, 
                message: 'Account successfully activated! Welcome to Teslavestexchange.' 
            });
        } else {
            return res.status(400).json({ error: 'Invalid verification token. Please try again.' });
        }

    } catch (error) {
        console.error('Verification engine failed:', error);
        return res.status(500).json({ error: 'Internal system database failure.' });
    }
}