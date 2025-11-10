// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// State
let cart = [];
const SHIPPING_COST = 5.00;
const TAX_RATE = 0.21; // IVA 21%

// DOM Elements
const summaryItems = document.getElementById('summaryItems');
const summarySubtotal = document.getElementById('summarySubtotal');
const summaryTax = document.getElementById('summaryTax');
const summaryProductsTotal = document.getElementById('summaryProductsTotal');
const summaryShipping = document.getElementById('summaryShipping');
const summaryTotal = document.getElementById('summaryTotal');
const completeOrderBtn = document.getElementById('completeOrderBtn');
const checkoutForm = document.getElementById('checkoutForm');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    if (!token) {
        window.location.href = '/HTML/login.html?return=' + encodeURIComponent(window.location.href);
        return;
    }

    // Load cart from localStorage
    cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        window.location.href = '/HTML/index.html';
        return;
    }

    loadCheckoutData();
    loadUserData();

    completeOrderBtn.addEventListener('click', handleCompleteOrder);
});

function loadCheckoutData() {
    // Render cart items
    summaryItems.innerHTML = cart.map(item => `
        <div class="summary-item">
            <div class="summary-item-image">
                👕
            </div>
            <div class="summary-item-info">
                <div class="summary-item-name">${item.name}</div>
                <div class="summary-item-details">Talla ${item.size} × ${item.quantity}</div>
            </div>
            <div class="summary-item-price">${(item.price * item.quantity).toFixed(2)}€</div>
        </div>
    `).join('');

    // Calculate totals (precio YA incluye IVA)
    const totalWithTax = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Extraer IVA del precio (precio ya incluye IVA)
    // Fórmula: base = total / 1.21, IVA = total - base
    const subtotal = totalWithTax / (1 + TAX_RATE);
    const tax = totalWithTax - subtotal;

    // Total final = productos (con IVA incluido) + envío
    const total = totalWithTax + SHIPPING_COST;

    summarySubtotal.textContent = `${subtotal.toFixed(2)}€`;
    summaryTax.textContent = `${tax.toFixed(2)}€`;
    summaryProductsTotal.textContent = `${totalWithTax.toFixed(2)}€`;
    summaryShipping.textContent = `${SHIPPING_COST.toFixed(2)}€`;
    summaryTotal.textContent = `${total.toFixed(2)}€`;
}

async function loadUserData() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            document.getElementById('fullName').value = user.name || '';
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

async function handleCompleteOrder() {
    const token = localStorage.getItem('auth_token');

    // Validate form
    const fullName = document.getElementById('fullName').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const zipCode = document.getElementById('zipCode').value;
    const country = document.getElementById('country').value;

    if (!fullName || !phone || !address || !city || !zipCode || !country) {
        alert('Por favor, completa todos los campos');
        return;
    }

    // Show loading
    completeOrderBtn.disabled = true;
    completeOrderBtn.textContent = 'Procesando...';

    try {
        // Prepare order data
        const orderData = {
            user_id: JSON.parse(localStorage.getItem('user')).id,
            items: cart.map(item => ({
                product_id: item.id,
                quantity: item.quantity
            })),
            shipping_address: {
                fullName,
                phone,
                address,
                city,
                zipCode,
                country
            }
        };

        const response = await fetch(`${API_BASE_URL}/order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al procesar el pedido');
        }

        // Clear cart
        localStorage.removeItem('cart');

        // Show success message
        alert('¡Pedido realizado con éxito! Recibirás un email de confirmación.');

        // Redirect to home
        window.location.href = '/HTML/index.html';

    } catch (error) {
        alert('Error al procesar el pedido: ' + error.message);
        completeOrderBtn.disabled = false;
        completeOrderBtn.textContent = 'Completar Pedido';
    }
}
