const crypto = require('crypto');

// Generate secure 6-digit alphanumeric token
function generateSecureToken() {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let token = '';
    const bytes = crypto.randomBytes(6);
    for (let i = 0; i < 6; i++) {
        token += characters[bytes[i] % characters.length];
    }
    return token;
}

// Calculate 5% platform fee
function calculateFee(baseAmount) {
    const fee = baseAmount * 0.05;
    const totalAmount = baseAmount + fee;
    return {
        platformFee: parseFloat(fee.toFixed(2)),
        totalAmount: parseFloat(totalAmount.toFixed(2))
    };
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { rightHandId, leftHandId } = req.body;

    if (!rightHandId || !leftHandId) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        // Generate secure 6-digit token
        const token = generateSecureToken();

        // Initialize briefcase with zero amounts (will be set during funding)
        const { platformFee, totalAmount } = calculateFee(0);

        // In production, this would save to Supabase
        // For now, return the token structure
        return res.status(200).json({
            token,
            rightHandId,
            leftHandId,
            status: 'pending',
            platformFee: 0,
            totalAmount: 0
        });
    } catch (error) {
        return res.status(500).json({ error: 'Token generation failed' });
    }
};