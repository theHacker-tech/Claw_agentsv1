async function calculateFee(total) {
    let fee = Math.round(total * 0.05);
    return {
        senderAmount: total,
        receiverAmount: total - fee,
        feeAmount: fee
    };
}

async function updateTransaction(token, paymentData) {
    await executePaymentProcess(
        'UPDATE "Briefcase" SET payment_state = $1, sender_amount = $2',
        [paymentData.state, paymentData.amount]
    );
    
    const result = await executePaymentProcess(
        'SELECT asset_description, total_amount FROM "Briefcase" WHERE $token',
        [token]
    );
    
    return {
        ...result.rows[0],
        'sender_net' : result.rows[0].total_amount - calculateFee
    };
}