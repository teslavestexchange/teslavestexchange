import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, fullname, username } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email address is required' });
        }

        // Generate secure 6-digit OTP code
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const userId = 'usr_' + Date.now();

        // Send email via Resend API
        const data = await resend.emails.send({
            from: 'Teslavestexchange Security <onboarding@resend.dev>', // Update to your custom domain once verified on Resend
            to: [email],
            subject: 'Your Account Verification Security Token',
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #0b0f17; color: #e2e8f0; padding: 30px; border-radius: 12px; max-width: 500px; margin: auto; border: 1px solid #1a2332;">
                    <h2 style="color: #00E676; text-transform: uppercase; margin-bottom: 5px;">Security Checkpoint</h2>
                    <p style="color: #94a3b8; font-size: 14px;">Hello ${fullname || username || 'Trader'},</p>
                    <p style="color: #cbd5e1; font-size: 14px;">Use the following one-time security token to activate your ledger profile on Teslavestexchange:</p>
                    <div style="background-color: #121824; border: 1px solid #00E676; border-radius: 10px; padding: 15px; text-align: center; margin: 25px 0;">
                        <span style="font-family: monospace; font-size: 32px; font-weight: bold; color: #00E676; letter-spacing: 6px;">${otpCode}</span>
                    </div>
                    <p style="color: #64748b; font-size: 12px; text-align: center;">If you did not request this code, please ignore this message.</p>
                </div>
            `
        });

        // Return user identifier and the generated token for session validation
        return res.status(200).json({
            success: true,
            userId: userId,
            otpCode: otpCode, // Passed to verify.html for validation against typed input
            message: 'Verification code successfully sent to email.'
        });

    } catch (error) {
        console.error('Email Dispatch Error:', error);
        return res.status(500).json({ error: error.message || 'Failed to dispatch email' });
    }
}