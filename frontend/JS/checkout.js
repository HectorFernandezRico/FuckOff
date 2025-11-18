// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// State
let cart = [];
let selectedShippingCost = 5.00; // Default: Standard shipping
const TAX_RATE = 0.21; // IVA 21%
const FREE_SHIPPING_THRESHOLD = 75.00;

// DOM Elements
const summaryItems = document.getElementById('summaryItems');
const summarySubtotal = document.getElementById('summarySubtotal');
const summaryTax = document.getElementById('summaryTax');
const summaryProductsTotal = document.getElementById('summaryProductsTotal');
const summaryShipping = document.getElementById('summaryShipping');
const summaryTotal = document.getElementById('summaryTotal');
const completeOrderBtn = document.getElementById('completeOrderBtn');
const checkoutForm = document.getElementById('checkoutForm');
const freeShippingOption = document.getElementById('freeShippingOption');
const amountForFreeShipping = document.getElementById('amountForFreeShipping');
const freeShippingNote = document.getElementById('freeShippingNote');

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
    setupShippingOptions();

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
    const total = totalWithTax + selectedShippingCost;

    summarySubtotal.textContent = `${subtotal.toFixed(2)}€`;
    summaryTax.textContent = `${tax.toFixed(2)}€`;
    summaryProductsTotal.textContent = `${totalWithTax.toFixed(2)}€`;
    summaryShipping.textContent = selectedShippingCost === 0 ? 'Gratis' : `${selectedShippingCost.toFixed(2)}€`;
    summaryTotal.textContent = `${total.toFixed(2)}€`;
}

function setupShippingOptions() {
    const shippingRadios = document.querySelectorAll('input[name="shippingMethod"]');

    // Check if free shipping is available
    const totalWithTax = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const freeShippingInput = document.querySelector('input[value="free"]');
    const standardShippingInput = document.querySelector('input[value="standard"]');
    const expressShippingInput = document.querySelector('input[value="express"]');
    const standardShippingOption = document.getElementById('standardShippingOption');
    const expressShippingOption = document.getElementById('expressShippingOption');

    if (totalWithTax >= FREE_SHIPPING_THRESHOLD) {
        // Enable free shipping and disable only standard shipping
        freeShippingInput.disabled = false;
        freeShippingInput.checked = true;
        freeShippingOption.style.cursor = 'pointer';
        freeShippingNote.style.display = 'none';

        // Disable only standard shipping, keep express available
        standardShippingInput.disabled = true;
        standardShippingOption.style.cursor = 'not-allowed';

        // Keep express shipping enabled
        expressShippingInput.disabled = false;
        expressShippingOption.style.cursor = 'pointer';

        // Update shipping cost to free
        selectedShippingCost = 0;
        updateOrderSummary();
    } else {
        // Show amount needed for free shipping
        const amountNeeded = FREE_SHIPPING_THRESHOLD - totalWithTax;
        amountForFreeShipping.textContent = `${amountNeeded.toFixed(2)}€`;
        freeShippingNote.style.display = 'block';

        // Enable standard and express shipping
        standardShippingInput.disabled = false;
        expressShippingInput.disabled = false;
        standardShippingOption.style.cursor = 'pointer';
        expressShippingOption.style.cursor = 'pointer';
    }

    // Add event listeners to shipping method radios
    shippingRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            selectedShippingCost = parseFloat(e.target.dataset.price);
            updateOrderSummary();
        });
    });
}

function updateOrderSummary() {
    // Calculate totals (precio YA incluye IVA)
    const totalWithTax = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Extraer IVA del precio (precio ya incluye IVA)
    const subtotal = totalWithTax / (1 + TAX_RATE);
    const tax = totalWithTax - subtotal;

    // Total final = productos (con IVA incluido) + envío
    const total = totalWithTax + selectedShippingCost;

    summaryShipping.textContent = selectedShippingCost === 0 ? 'Gratis' : `${selectedShippingCost.toFixed(2)}€`;
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
        // Get selected shipping method
        const selectedShippingMethod = document.querySelector('input[name="shippingMethod"]:checked');
        const shippingMethod = selectedShippingMethod ? selectedShippingMethod.value : 'standard';

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
            },
            shipping_method: shippingMethod,
            shipping_cost: selectedShippingCost
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
        completeOrderBtn.textContent = 'Finalizar Pedido';
    }
}
