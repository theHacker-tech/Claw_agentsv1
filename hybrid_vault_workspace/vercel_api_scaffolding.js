async function processEndOfTransaction(req) {
    const { query, body } = req;
    const token = decodeURIComponent(query.token);
    
    if (body.state === 'confirmed') {
        const deductRes = await deductServiceFee(token);
        const finalizeRes = await finalizePayment(token);
        
        if (deductRes && finalizeRes) {
            return triggerTelegramNotification(`${token}`);
        }
    }
    
    return new Response(JSON.stringify({
        status: 'fail',
        error: 'Transaction backend execution failed'
    }), { status: 500 });
}

async function deductServiceFee(token) {
    const feeQuery = 'SELECT total_amount FROM "Briefcase" WHERE briefcase_token = $1';
    const result = await executePaymentProcess(feeQuery, [token]);
    
    const fee = PERCENTAGE_FEE * result.rows[0].total_amount;
    return await executePaymentProcess(
        'UPDATE "Briefcase" SET fee_charged = true WHERE $token',
        [token]
    );
}