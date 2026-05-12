function requireAuth() {
    if (!api.isLoggedIn()) {
        window.location.href = '/login.html';
    }
}

function requireAdmin() {
    requireAuth();
    if (!api.isAdmin()) {
        window.location.href = '/index.html';
    }
}

function requireOrderAuth() {
    if (!api.isLoggedIn()) {
        window.location.href = '/login.html';
        return;
    }
}

async function login(event) {
    event.preventDefault();
    const form = event.target;
    const errorBox = document.getElementById('errorBox');
    const btn = form.querySelector('button:not([type="button"])');

    errorBox.classList.add('hidden');
    errorBox.textContent = '';
    if (btn) { btn.disabled = true; btn.textContent = 'Signing in…'; }

    const payload = {
        email: form.email.value.trim(),
        password: form.password.value
    };

    try {
        const response = await api.post('/auth/login', payload);
        api.setAuth(response);
        window.location.href = api.isAdmin()
            ? '/admin-dashboard.html'
            : '/index.html';
    } catch (error) {
        errorBox.textContent = error.message;
        errorBox.classList.remove('hidden');
        if (btn) { btn.disabled = false; btn.textContent = 'Login'; }
    }
}

async function register(event) {
    event.preventDefault();
    const form = event.target;
    const errorBox = document.getElementById('errorBox');
    const btn = form.querySelector('button:not([type="button"])');

    errorBox.classList.add('hidden');
    errorBox.textContent = '';
    if (btn) { btn.disabled = true; btn.textContent = 'Creating account…'; }

    const payload = {
        firstName: form.firstName.value.trim(),
        lastName: form.lastName.value.trim(),
        email: form.email.value.trim(),
        password: form.password.value
    };

    try {
        await api.post('/auth/register', payload);
        window.location.href = '/login.html?registered=1';
    } catch (error) {
        errorBox.textContent = error.message;
        errorBox.classList.remove('hidden');
        if (btn) { btn.disabled = false; btn.textContent = 'Register'; }
    }
}

// Redirects to home page instead of login page
function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.location.href = '/index.html';
}

// Show success message after redirect from register
window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('registered') === '1') {
        const errorBox = document.getElementById('errorBox');
        if (errorBox) {
            errorBox.textContent = '✓ Account created successfully! Please log in.';
            errorBox.classList.remove('hidden');
            errorBox.style.background  = 'rgba(34,197,94,0.15)';
            errorBox.style.borderColor = 'rgba(34,197,94,0.4)';
            errorBox.style.color       = '#86efac';
        }
    }
});