const emailInput = document.getElementById('email');
const codeInput = document.getElementById('code');
const sendCodeBtn = document.getElementById('send-code-btn');
const verifyCodeBtn = document.getElementById('verify-code-btn');
const backBtn = document.getElementById('back-btn');
const emailSection = document.getElementById('email-section');
const codeSection = document.getElementById('code-section');
const errorMessage = document.getElementById('error-message');
const codeMessage = document.getElementById('code-message');

let currentEmail = '';

function showError(message) {
    if (typeof message === 'object') {
        if (message.detail) {
            errorMessage.textContent = message.detail;
        } else {
            errorMessage.textContent = JSON.stringify(message);
        }
    } else {
        errorMessage.textContent = message;
    }
    errorMessage.style.display = 'block';
}

function hideError() {
    errorMessage.style.display = 'none';
}

function showCodeSection() {
    emailSection.style.display = 'none';
    codeSection.style.display = 'block';
    hideError();
}

function showEmailSection() {
    codeSection.style.display = 'none';
    emailSection.style.display = 'block';
    hideError();
}

sendCodeBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    if (!email) {
        showError('Please enter your email');
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/send-login-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to send verification code');
        }

        currentEmail = email;
        showCodeSection();
        codeMessage.textContent = `Verification code sent to ${email}`;
    } catch (err) {
        showError(err.message);
    }
});

verifyCodeBtn.addEventListener('click', async () => {
    const code = codeInput.value.trim();
    if (!code) {
        showError('Please enter the verification code');
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/verify-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: currentEmail,
                code: code
            })
        });

        if (!response.ok) {
            const error = await response.json();
            showError(error);
            return;
        }

        const userData = await response.json();
        window.electronAPI.saveUser(userData);
        window.location.href = 'dashboard.html';
    } catch (err) {
        showError(err.message);
    }
});

backBtn.addEventListener('click', () => {
    showEmailSection();
    codeInput.value = '';
    codeMessage.textContent = '';
});

// Handle Enter key
emailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendCodeBtn.click();
    }
});

codeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        verifyCodeBtn.click();
    }
});
