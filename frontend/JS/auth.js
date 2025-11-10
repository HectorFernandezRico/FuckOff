// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginFormElement = document.getElementById('loginFormElement');
const registerFormElement = document.getElementById('registerFormElement');
const showRegisterBtn = document.getElementById('showRegister');
const showLoginBtn = document.getElementById('showLogin');
const loginExternalActions = document.querySelector('.auth-external-actions:not(#registerExternalActions)');
const registerExternalActions = document.getElementById('registerExternalActions');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    const token = localStorage.getItem('auth_token');
    if (token) {
        // Redirect to home if already logged in
        const returnUrl = new URLSearchParams(window.location.search).get('return');
        window.location.href = returnUrl || '/HTML/index.html';
    }

    // Check if register parameter is set
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('register') === '1') {
        showRegisterForm();
    }

    initEventListeners();
});

function initEventListeners() {
    showRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterForm();
    });

    showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginForm();
    });

    loginFormElement.addEventListener('submit', handleLogin);
    registerFormElement.addEventListener('submit', handleRegister);
}

function showRegisterForm() {
    loginForm.classList.add('hidden');
    loginExternalActions.classList.add('hidden');
    registerForm.classList.remove('hidden');
    registerExternalActions.classList.remove('hidden');
}

function showLoginForm() {
    registerForm.classList.add('hidden');
    registerExternalActions.classList.add('hidden');
    loginForm.classList.remove('hidden');
    loginExternalActions.classList.remove('hidden');
}

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    const btnText = document.getElementById('loginBtnText');
    const btnLoader = document.getElementById('loginBtnLoader');

    // Show loader
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');
    errorDiv.classList.remove('show');

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al iniciar sesión');
        }

        // Save token and user data
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Sincronizar carrito después del login
        await syncCartAfterLogin(data.token);

        // Redirect based on role
        const returnUrl = new URLSearchParams(window.location.search).get('return');

        if (data.user.role === 'admin') {
            // Admin users go to admin panel
            window.location.href = '/HTML/admin.html';
        } else {
            // Regular users go to return URL or home
            window.location.href = returnUrl || '/HTML/index.html';
        }

    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.add('show');
    } finally {
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
    }
}

async function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    const errorDiv = document.getElementById('registerError');
    const btnText = document.getElementById('registerBtnText');
    const btnLoader = document.getElementById('registerBtnLoader');

    // Validate passwords match
    if (password !== passwordConfirm) {
        errorDiv.textContent = 'Las contraseñas no coinciden';
        errorDiv.classList.add('show');
        return;
    }

    // Show loader
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');
    errorDiv.classList.remove('show');

    try {
        console.log('Registering user:', { name, email });

        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ name, email, password, password_confirmation: passwordConfirm })
        });

        console.log('Register response status:', response.status);
        console.log('Register response headers:', [...response.headers.entries()]);

        // Check if response has content
        const contentType = response.headers.get('content-type');
        let data;

        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
            console.log('Register response data:', data);
        } else {
            const text = await response.text();
            console.log('Register response text:', text);
            throw new Error('La respuesta del servidor no es JSON válido');
        }

        if (!response.ok) {
            throw new Error(data.message || 'Error al registrar usuario');
        }

        if (!data.token || !data.user) {
            console.error('Missing token or user in response:', data);
            throw new Error('Respuesta del servidor incompleta');
        }

        // Save token and user data
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        console.log('Registration successful, redirecting...');

        // Redirect based on role
        const returnUrl = new URLSearchParams(window.location.search).get('return');

        if (data.user.role === 'admin') {
            // Admin users go to admin panel
            window.location.href = '/HTML/admin.html';
        } else {
            // Regular users go to return URL or home
            window.location.href = returnUrl || '/HTML/index.html';
        }

    } catch (error) {
        console.error('Registration error:', error);
        errorDiv.textContent = error.message || 'Error desconocido al registrar';
        errorDiv.classList.add('show');
    } finally {
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
    }
}


// Cart Synchronization
async function syncCartAfterLogin(token) {
    const localCart = JSON.parse(localStorage.getItem('cart') || '[]');

    if (localCart.length === 0) {
        // No hay nada en localStorage, cargar del backend
        try {
            const response = await fetch(`${API_BASE_URL}/cart`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('cart', JSON.stringify(data.data || []));
            }
        } catch (error) {
            console.error('Error loading cart from backend:', error);
        }
        return;
    }

    // Hay items en localStorage, sincronizar con backend
    try {
        const response = await fetch(`${API_BASE_URL}/cart/sync`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                items: localCart
            })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('cart', JSON.stringify(data.data || []));
            console.log('Cart synced successfully');
        }
    } catch (error) {
        console.error('Error syncing cart:', error);
    }
}
