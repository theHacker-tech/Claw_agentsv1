module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { token, accessKeys, telegramId } = req.body;

    if (!token || !accessKeys || !telegramId) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        // In production, verify user is left_hand for this briefcase
        // Update access_keys in briefcase record
        return res.status(200).json({
            message: 'Access keys locked successfully',
            token,
            status: 'locked'
        });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to lock assets' });
    }
};