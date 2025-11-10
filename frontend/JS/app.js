// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// State
let allProducts = [];
let filteredProducts = [];
let categories = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentCategory = 'all';

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const loading = document.getElementById('loading');
const cartBtn = document.getElementById('cartBtn');
const userBtn = document.getElementById('userBtn');
const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');
const overlay = document.getElementById('overlay');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const totalPrice = document.getElementById('totalPrice');
const sortSelect = document.getElementById('sortSelect');
const categoryNav = document.getElementById('categoryNav');
const productModal = document.getElementById('productModal');
const closeModal = document.getElementById('closeModal');
const modalBody = document.getElementById('modalBody');
const userDropdown = document.getElementById('userDropdown');
const authButtons = document.getElementById('authButtons');
const logoutBtn = document.getElementById('logoutBtn');
const profileBtn = document.getElementById('profileBtn');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadCategories();
    await loadProducts();
    await loadCartFromBackend(); // Cargar carrito del backend si está autenticado
    updateCartUI();
    initEventListeners();
    updateUserUI();
});

// Event Listeners
function initEventListeners() {
    cartBtn.addEventListener('click', toggleCart);
    userBtn.addEventListener('click', toggleUserMenu);
    closeCart.addEventListener('click', toggleCart);
    overlay.addEventListener('click', () => {
        toggleCart();
        closeProductModal();
        closeUserMenu();
    });
    sortSelect.addEventListener('change', handleSort);

    closeModal.addEventListener('click', closeProductModal);

    // Checkout button
    const checkoutBtn = document.querySelector('.btn-checkout');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }

    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Profile button
    if (profileBtn) {
        profileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            // If admin, go to admin panel
            if (user.role === 'admin') {
                window.location.href = '/HTML/admin.html';
            } else {
                alert('Funcionalidad de perfil próximamente');
            }
        });
    }

    // Close user menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-menu-container')) {
            closeUserMenu();
        }
    });
}

// User Menu Functions
function updateUserUI() {
    const token = localStorage.getItem('auth_token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (token && user.name) {
        // User is authenticated - show dropdown, hide auth buttons
        userDropdown.classList.remove('hidden');
        authButtons.classList.add('hidden');

        // Update user info in dropdown
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userEmail').textContent = user.email;
    } else {
        // User is not authenticated - hide dropdown, show auth buttons
        userDropdown.classList.add('hidden');
        authButtons.classList.remove('hidden');
    }
}

function toggleUserMenu(e) {
    e.stopPropagation();
    const token = localStorage.getItem('auth_token');

    if (token) {
        // Toggle dropdown menu
        userDropdown.classList.toggle('active');
        authButtons.classList.remove('active');
    } else {
        // Toggle auth buttons
        authButtons.classList.toggle('active');
        userDropdown.classList.remove('active');
    }
}

function closeUserMenu() {
    userDropdown.classList.remove('active');
    authButtons.classList.remove('active');
}

async function handleLogout(e) {
    e.preventDefault();

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
        await fetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error logging out:', error);
    } finally {
        // Limpiar TODO el localStorage (incluyendo carrito)
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart'); // ← IMPORTANTE: Limpiar carrito

        // Limpiar carrito en memoria
        cart = [];

        location.reload();
    }
}

function handleCheckout() {
    const token = localStorage.getItem('auth_token');

    if (!token) {
        // User not logged in - redirect to login with return URL
        window.location.href = '/HTML/login.html?return=' + encodeURIComponent('/HTML/checkout.html');
    } else {
        // User logged in - go to checkout
        window.location.href = '/HTML/checkout.html';
    }
}

// API Calls
async function loadProducts() {
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/product`);
        const data = await response.json();

        if (data.data) {
            allProducts = data.data;
            filteredProducts = [...allProducts];
            renderProducts(filteredProducts);
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Error al cargar los productos');
    } finally {
        showLoading(false);
    }
}

// Cart Backend Sync Functions
async function loadCartFromBackend() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        // Si no está autenticado, usar localStorage
        cart = JSON.parse(localStorage.getItem('cart')) || [];
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cart`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            cart = data.data || [];
            localStorage.setItem('cart', JSON.stringify(cart));
            console.log('Cart loaded from backend:', cart.length, 'items');
        } else {
            // Si falla, usar localStorage
            cart = JSON.parse(localStorage.getItem('cart')) || [];
        }
    } catch (error) {
        console.error('Error loading cart from backend:', error);
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    }
}

async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/category`);
        const data = await response.json();

        if (data.data) {
            categories = data.data;
            console.log('Categories loaded:', categories);
            renderCategoryNav();
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function renderCategoryNav() {
    // Keep the "Todo" link
    const allLink = categoryNav.querySelector('[data-category="all"]');

    // Clear and rebuild nav
    categoryNav.innerHTML = '';
    categoryNav.appendChild(allLink);

    // Add dynamic categories
    categories.forEach(category => {
        const link = document.createElement('a');
        link.href = '#';
        link.className = 'nav-link';
        link.dataset.category = category.slug;
        link.textContent = category.name;

        link.addEventListener('click', (e) => {
            e.preventDefault();
            filterByCategory(category.slug);

            categoryNav.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });

        categoryNav.appendChild(link);
    });

    // Re-attach event listener to "Todo" link
    allLink.addEventListener('click', (e) => {
        e.preventDefault();
        filterByCategory('all');

        categoryNav.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        allLink.classList.add('active');
    });
}

// Render Functions
function renderProducts(products) {
    console.log('Rendering products:', products.length, 'products');

    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 0; color: var(--gray-light);">
                <h3>No se encontraron productos</h3>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = products.map(product => {
        const imageUrl = product.path ? `http://localhost:8000${product.path}` : 'http://localhost:8000/images/products/default.jpg';
        return `
        <div class="product-card" onclick="openProductModal(${product.id})">
            <div class="product-image">
                <img src="${imageUrl}" alt="${product.name}" onerror="this.src='http://localhost:8000/images/products/default.jpg'; this.onerror=null;">
                ${product.stock < 10 && product.stock > 0 ? '<div class="product-badge">Últimas unidades</div>' : ''}
                ${product.stock === 0 ? '<div class="product-badge" style="background: #ff4444;">Agotado</div>' : ''}
            </div>
            <div class="product-info">
                <div class="product-category">${getCategoryName(product.category_id)}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description || 'Sin descripción'}</p>
                <div class="product-footer">
                    <span class="product-price">${parseFloat(product.price).toFixed(2)}€</span>
                    <span class="product-size">Talla ${product.size}</span>
                </div>
                <button class="btn-add-cart" onclick="event.stopPropagation(); addToCart(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
                    ${product.stock === 0 ? 'Agotado' : 'Añadir al Carrito'}
                </button>
            </div>
        </div>
        `;
    }).join('');
}

function getCategoryName(categoryId) {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Sin categoría';
}

function getCategorySlug(categoryId) {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.slug : '';
}

function openProductModal(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const imageUrl = product.path ? `http://localhost:8000${product.path}` : 'http://localhost:8000/images/products/default.jpg';

    modalBody.innerHTML = `
        <div class="modal-product">
            <div class="modal-image">
                <img src="${imageUrl}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" onerror="this.src='http://localhost:8000/images/products/default.jpg'; this.onerror=null;">
            </div>
            <div class="modal-details">
                <div class="modal-category">${getCategoryName(product.category_id)}</div>
                <h2>${product.name}</h2>
                <div class="modal-price">${parseFloat(product.price).toFixed(2)}€</div>
                <p class="modal-description">${product.description || 'Sin descripción disponible para este producto.'}</p>
                <div class="modal-info">
                    <div class="info-item">
                        <div class="info-label">Talla</div>
                        <div class="info-value">${product.size}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Stock</div>
                        <div class="info-value">${product.stock} unidades</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Estado</div>
                        <div class="info-value">${product.active ? 'Disponible' : 'No disponible'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">SKU</div>
                        <div class="info-value">#${product.id.toString().padStart(5, '0')}</div>
                    </div>
                </div>
                <button class="btn-primary" onclick="addToCart(${product.id}); closeProductModal();" ${product.stock === 0 ? 'disabled' : ''} style="width: 100%;">
                    ${product.stock === 0 ? 'Agotado' : 'Añadir al Carrito'}
                </button>
            </div>
        </div>
    `;

    productModal.classList.add('active');
    overlay.classList.add('active');
}

function closeProductModal() {
    productModal.classList.remove('active');
    overlay.classList.remove('active');
}

// Cart Functions
async function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product || product.stock === 0) return;

    const token = localStorage.getItem('auth_token');

    if (!token) {
        // Usuario NO autenticado: usar localStorage
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            if (existingItem.quantity < product.stock) {
                existingItem.quantity++;
            } else {
                alert('No hay más stock disponible');
                return;
            }
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: parseFloat(product.price),
                size: product.size,
                quantity: 1,
                stock: product.stock
            });
        }

        saveCart();
        updateCartUI();
        showNotification('Producto añadido al carrito');
        return;
    }

    // Usuario autenticado: sincronizar con backend
    try {
        const response = await fetch(`${API_BASE_URL}/cart`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: 1
            })
        });

        if (response.ok) {
            await loadCartFromBackend(); // Recargar carrito del backend
            updateCartUI();
            showNotification('Producto añadido al carrito');
        } else {
            const error = await response.json();
            alert(error.error || 'Error al añadir al carrito');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Error al añadir al carrito');
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }

    if (newQuantity > item.stock) {
        alert('No hay más stock disponible');
        return;
    }

    item.quantity = newQuantity;
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update cart items
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="cart-empty">Tu carrito está vacío</div>';
        totalPrice.textContent = '0.00€';
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <div style="font-size: 2rem;">👕</div>
            </div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-size">Talla ${item.size}</div>
                <div class="cart-item-footer">
                    <div class="cart-item-price">${(item.price * item.quantity).toFixed(2)}€</div>
                    <div class="cart-item-quantity">
                        <button class="btn-qty" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="btn-qty" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalPrice.textContent = `${total.toFixed(2)}€`;
}

function toggleCart() {
    cartSidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

// Filter & Sort Functions
function filterByCategory(category) {
    currentCategory = category;

    console.log('Filtering by category:', category);
    console.log('All categories:', categories);

    if (category === 'all') {
        filteredProducts = [...allProducts];
    } else {
        filteredProducts = allProducts.filter(product => {
            const productCategory = getCategorySlug(product.category_id);
            console.log(`Product ${product.name} (ID: ${product.id}) - Category ID: ${product.category_id} - Slug: ${productCategory}`);
            return productCategory === category;
        });
    }

    console.log('Filtered products:', filteredProducts.length);
    renderProducts(filteredProducts);
}

function handleSort(e) {
    const sortValue = e.target.value;

    switch (sortValue) {
        case 'price-asc':
            filteredProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            break;
        case 'price-desc':
            filteredProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            break;
        case 'name':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default:
            filteredProducts = [...allProducts];
            if (currentCategory !== 'all') {
                filterByCategory(currentCategory);
                return;
            }
    }

    renderProducts(filteredProducts);
}

// Utility Functions
function showLoading(show) {
    if (show) {
        loading.classList.remove('hidden');
        productsGrid.innerHTML = '';
    } else {
        loading.classList.add('hidden');
    }
}

function showError(message) {
    productsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 0; color: #ff4444;">
            <h3>${message}</h3>
            <button class="btn-primary" onclick="loadProducts()" style="margin-top: 1rem;">
                Reintentar
            </button>
        </div>
    `;
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: white;
        color: black;
        padding: 1rem 2rem;
        border-radius: 8px;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
