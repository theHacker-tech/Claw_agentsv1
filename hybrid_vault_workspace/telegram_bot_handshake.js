async function handleSellerCommand(message) {
    const { text, from } = message;
    const targetId = text.match(/\\/seller\s+(\\d+)/)?.[1];
    
    try {
        await client.query(
            'UPDATE "Briefcase" SET seller_id = $1, status = $2 WHERE token = $3',
            [targetId, 'pending', generateToken()]
        );
        
        await sendTelegramMessage(`Left_hand: ${targetId} has ${notification}.`);
        
        const leftResult = await client.query('SELECT * FROM "Left_hand" WHERE id = $1', [targetId]);
        if (leftResult.rows.length === 0) throw Error('Unregistered user');
        
        const reply = await sendTelegramMessage(targetId, 'Accept/Reject transaction?');
        await registerPolling({ messageId: reply.messageId, token: generateToken() });
        
    } catch (err) {
        if (err.message.includes('unauthorized')) {
            await message.reply('Transaction validation failed');
        } else {
            await message.reply('Unregistered user');
        }
    }
}

async function registerPolling({ token }) {
    await client.query(
        'INSERT INTO payments (token, status) VALUES ($1, $2)',
        [token, 'new']
    );
}

function generateToken() {
    return Array.from({length: 6}, () => 
        String.fromCharCode(Math.floor(Math.random()*26)+97)
    ).join('');
}