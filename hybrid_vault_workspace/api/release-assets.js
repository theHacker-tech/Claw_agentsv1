// 5% FEE CALCULATION FUNCTION
function calculatePlatformFee(baseAmount) {
    const feePercentage = 0.05;
    const platformFee = baseAmount * feePercentage;
    const amountToSeller = baseAmount - platformFee;
    return {
        platformFee: parseFloat(platformFee.toFixed(2)),
        amountToSeller: parseFloat(amountToSeller.toFixed(2))
    };
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { token, telegramId, paymentTxHash } = req.body;

    if (!token || !telegramId || !paymentTxHash) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        // In production:
        // 1. Verify payment on blockchain (async)
        // 2. Fetch briefcase
        // 3. Calculate 5% fee
        // 4. Update briefcase status to 'completed'
        // 5. Release access keys to right_hand
        
        const baseAmount = 100; // Would come from payment data
        const { platformFee, amountToSeller } = calculatePlatformFee(baseAmount);

        return res.status(200).json({
            message: 'Assets released successfully',
            token,
            platformFee,
            amountToSeller,
            status: 'completed'
        });
    } catch (error) {
        return res.status(500).json({ error: 'Asset release failed' });
    }
};