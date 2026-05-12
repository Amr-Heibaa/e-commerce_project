const API_BASE = '/api';

const api = {
    getToken() {
        return localStorage.getItem('accessToken');
    },

    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    setAuth(authResponse) {
        localStorage.setItem('accessToken', authResponse.accessToken);
        localStorage.setItem('user', JSON.stringify({
            userId: authResponse.userId,
            email: authResponse.email,
            fullName: authResponse.fullName,
            roles: authResponse.roles || []
        }));
    },

    logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    },

    isLoggedIn() {
        return !!this.getToken();
    },

    isAdmin() {
        const user = this.getUser();
        return !!user?.roles?.some(role => role === 'ROLE_ADMIN' || role === 'ADMIN');
    },

    async request(endpoint, options = {}) {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });
        const contentType = response.headers.get('content-type');
        const data = contentType && contentType.includes('application/json')
            ? await response.json()
            : await response.text();
        if (response.status === 401 || response.status === 403) {
            this.logout();
            return;
        }
        if (!response.ok) {
            throw new Error(data?.message || data?.error || 'Request failed');
        }
        return data;
    },

    get(endpoint) {
        return this.request(endpoint);
    },

    post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },

    put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },

    patch(endpoint, body = {}) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body)
        });
    },

    delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'

        });
    }
};