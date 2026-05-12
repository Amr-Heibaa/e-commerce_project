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
    }
}

async function register(event) {
    event.preventDefault();
    const form = event.target;
    const errorBox = document.getElementById('errorBox');
    const payload = {
        firstName: form.firstName.value.trim(),
        lastName: form.lastName.value.trim(),
        email: form.email.value.trim(),
        password: form.password.value
    };
    try {
        await api.post('/auth/register', payload);
        window.location.href = '/login.html';
    } catch (error) {
        errorBox.textContent = error.message;
        errorBox.classList.remove('hidden');
    }
}

function logout() {
    api.logout();
}