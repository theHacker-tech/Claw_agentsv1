const POLLING_DURATION = 30; // 30 seconds in production

module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { token, telegramId } = req.query;

    if (!token || !telegramId) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        // In production, check actual payment status from blockchain or payment processor
        // This simulates the async polling loop
        const timeElapsed = Math.floor(Math.random() * POLLING_DURATION * 1000);
        
        // Simulate payment confirmed after polling period
        if (timeElapsed >= POLLING_DURATION * 1000 - 1000) {
            return res.status(200).json({
                status: 'confirmed',
                timeRemaining: 0,
                accessKeysReleased: true
            });
        }

        return res.status(200).json({
            status: 'pending',
            timeRemaining: POLLING_DURATION - Math.floor(timeElapsed / 1000),
            accessKeysReleased: false
        });
    } catch (error) {
        return res.status(500).json({ error: 'Polling failed' });
    }
};