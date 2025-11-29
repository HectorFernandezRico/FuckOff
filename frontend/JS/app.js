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
            // Filtrar solo productos activos (active === 1)
            allProducts = data.data.filter(product => product.active === 1);
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
                </div>
                <button class="btn-add-cart" onclick="event.stopPropagation(); openProductModal(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
                    ${product.stock === 0 ? 'Agotado' : 'Seleccionar Talla'}
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
    const imageSecondaryUrl = product.image_secondary ? `http://localhost:8000${product.image_secondary}` : null;

    // Crear array de imágenes disponibles
    const images = [imageUrl];
    if (imageSecondaryUrl) {
        images.push(imageSecondaryUrl);
    }

    // Resetear flag de primera talla seleccionada
    window.firstSizeSelected = false;

    // Verificar si es un accesorio (category_id = 5)
    const isAccessory = product.category_id === 5;

    // Determinar si el producto tiene tallas configuradas o usa stock general
    const hasSizesConfigured = product.sizes && product.sizes.length > 0;

    // Calcular el stock inicial
    let initialStock = product.stock;
    if (hasSizesConfigured) {
        const firstAvailableSize = product.sizes.find(s => s.stock > 0);
        initialStock = firstAvailableSize ? firstAvailableSize.stock : 0;
    }

    modalBody.innerHTML = `
        <div class="modal-product">
            <div class="modal-image">
                <div class="product-gallery">
                    <img id="mainProductImage" src="${images[0]}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" onerror="this.src='http://localhost:8000/images/products/default.jpg'; this.onerror=null;">
                    ${images.length > 1 ? `
                        <div class="gallery-nav">
                            <button class="gallery-btn gallery-prev" onclick="changeProductImage(-1)">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="15 18 9 12 15 6"></polyline>
                                </svg>
                            </button>
                            <button class="gallery-btn gallery-next" onclick="changeProductImage(1)">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </button>
                        </div>
                        <div class="gallery-indicators">
                            ${images.map((_, index) => `<span class="gallery-indicator ${index === 0 ? 'active' : ''}" onclick="setProductImage(${index})"></span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="modal-details">
                <div class="modal-category">${getCategoryName(product.category_id)}</div>
                <h2>${product.name}</h2>
                <div class="modal-price">${parseFloat(product.price).toFixed(2)}€</div>
                <p class="modal-description">${product.description || 'Sin descripción disponible para este producto.'}</p>

                ${!isAccessory ? `
                <div class="size-selector-container">
                    <label class="size-selector-label">Selecciona tu talla:</label>
                    <div class="size-selector" id="sizeSelector">
                        ${['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => {
                            // Si no hay tallas configuradas, usar el stock general del producto
                            let stock;
                            if (hasSizesConfigured) {
                                const sizeData = product.sizes.find(s => s.size === size);
                                stock = sizeData?.stock || 0;
                            } else {
                                // Sin tallas configuradas: todas las tallas tienen el stock general
                                stock = product.stock;
                            }

                            const hasStock = stock > 0;
                            const isFirstAvailable = !window.firstSizeSelected && hasStock;

                            if (isFirstAvailable) {
                                window.firstSizeSelected = true;
                            }

                            return `
                            <button class="size-option ${isFirstAvailable ? 'active' : ''} ${!hasStock ? 'out-of-stock' : ''}"
                                    onclick="selectSize('${size}', ${stock})"
                                    data-size="${size}"
                                    data-stock="${stock}"
                                    ${!hasStock ? 'disabled' : ''}>
                                <span class="size-label">${size}</span>
                            </button>
                            `;
                        }).join('')}
                    </div>
                </div>
                ` : ''}

                <div class="modal-info">
                    <div class="info-item">
                        <div class="info-label">Stock</div>
                        <div class="info-value" id="productStockDisplay">${initialStock} unidades</div>
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
                <button class="btn-primary" onclick="addToCartWithSize(${product.id}); closeProductModal();" ${product.stock === 0 ? 'disabled' : ''} style="width: 100%;">
                    ${product.stock === 0 ? 'Agotado' : 'Añadir al Carrito'}
                </button>
            </div>
        </div>
    `;

    // Guardar imágenes en una variable global para la navegación
    window.currentProductImages = images;
    window.currentImageIndex = 0;

    // Establecer el stock inicial
    window.selectedSizeStock = initialStock;

    productModal.classList.add('active');
    overlay.classList.add('active');
}

function closeProductModal() {
    productModal.classList.remove('active');
    overlay.classList.remove('active');
}

// Size selector functions
function selectSize(size, stock) {
    // No hacer nada si no hay stock
    if (stock <= 0) return;

    // Remover clase active de todas las opciones
    document.querySelectorAll('.size-option').forEach(btn => {
        btn.classList.remove('active');
    });

    // Añadir clase active a la opción seleccionada
    const selectedBtn = document.querySelector(`.size-option[data-size="${size}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }

    // Guardar la talla y stock seleccionado globalmente
    window.selectedSize = size;
    window.selectedSizeStock = stock;

    // Actualizar el display del stock
    const stockDisplay = document.getElementById('productStockDisplay');
    if (stockDisplay) {
        stockDisplay.textContent = `${stock} unidades`;
    }
}

async function addToCartWithSize(productId) {
    const product = allProducts.find(p => p.id === productId);
    const isAccessory = product && product.category_id === 5;

    let selectedSize = window.selectedSize || document.querySelector('.size-option.active')?.dataset.size;

    // Si es accesorio, no necesita talla
    if (!isAccessory && !selectedSize) {
        alert('Por favor, selecciona una talla');
        return;
    }

    // Si es accesorio, usar 'N/A' como talla por defecto
    if (isAccessory) {
        selectedSize = 'N/A';
    }

    await addToCart(productId, selectedSize);

    // Cerrar el modal después de añadir al carrito
    closeProductModal();
}

// Gallery navigation functions
function changeProductImage(direction) {
    if (!window.currentProductImages || window.currentProductImages.length <= 1) return;

    window.currentImageIndex += direction;

    // Loop around
    if (window.currentImageIndex < 0) {
        window.currentImageIndex = window.currentProductImages.length - 1;
    } else if (window.currentImageIndex >= window.currentProductImages.length) {
        window.currentImageIndex = 0;
    }

    updateProductImage();
}

function setProductImage(index) {
    if (!window.currentProductImages || index < 0 || index >= window.currentProductImages.length) return;

    window.currentImageIndex = index;
    updateProductImage();
}

function updateProductImage() {
    const mainImage = document.getElementById('mainProductImage');
    if (mainImage && window.currentProductImages) {
        mainImage.src = window.currentProductImages[window.currentImageIndex];

        // Update indicators
        const indicators = document.querySelectorAll('.gallery-indicator');
        indicators.forEach((indicator, index) => {
            if (index === window.currentImageIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }
}

// Cart Functions
async function addToCart(productId, selectedSize = null) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    // Verificar que el producto esté activo
    if (product.active !== 1) {
        alert('Este producto no está disponible');
        return;
    }

    // Usar la talla seleccionada o la talla por defecto del producto
    const size = selectedSize || product.size;

    // Verificar stock de la talla específica
    const sizeData = product.sizes?.find(s => s.size === size);
    // Si no hay datos de talla (producto sin tallas configuradas), usar stock general
    const availableStock = sizeData ? sizeData.stock : (product.stock || 0);

    if (availableStock === 0) {
        alert(`La talla ${size} no tiene stock disponible`);
        return;
    }

    const token = localStorage.getItem('auth_token');

    if (!token) {
        // Usuario NO autenticado: usar localStorage
        // Buscar item con mismo id Y misma talla
        const existingItem = cart.find(item => item.id === productId && item.size === size);

        if (existingItem) {
            if (existingItem.quantity < availableStock) {
                existingItem.quantity++;
            } else {
                alert(`No hay más stock disponible para la talla ${size}`);
                return;
            }
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: parseFloat(product.price),
                size: size,
                quantity: 1,
                stock: availableStock
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
                size: size,
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

async function removeFromCart(productId, size) {
    const token = localStorage.getItem('auth_token');

    // Si está autenticado, eliminar del backend
    if (token) {
        try {
            const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ size: size })
            });

            if (response.ok) {
                // Recargar carrito del backend después de eliminar
                await loadCartFromBackend();
                updateCartUI();
                showNotification('Producto eliminado del carrito');
            } else {
                const error = await response.json();
                alert(error.error || 'Error al eliminar del carrito');
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
            alert('Error al eliminar del carrito');
        }
    } else {
        // Si no está autenticado, solo actualizar localStorage
        cart = cart.filter(item => !(item.id === productId && item.size === size));
        saveCart();
        updateCartUI();
    }
}

async function updateQuantity(productId, size, change) {
    const item = cart.find(item => item.id === productId && item.size === size);
    if (!item) return;

    const newQuantity = item.quantity + change;

    // No permitir menos de 1
    if (newQuantity < 1) {
        return;
    }

    // No permitir más del stock disponible
    if (newQuantity > item.stock) {
        alert(`No hay más stock disponible para la talla ${size}. Stock máximo: ${item.stock}`);
        return;
    }

    const token = localStorage.getItem('auth_token');

    // Si está autenticado, actualizar en backend
    if (token) {
        try {
            const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    size: size,
                    quantity: newQuantity
                })
            });

            if (response.ok) {
                await loadCartFromBackend();
                updateCartUI();
            } else {
                const error = await response.json();
                alert(error.error || 'Error al actualizar cantidad');
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            alert('Error al actualizar cantidad');
        }
    } else {
        // Si no está autenticado, solo actualizar localStorage
        item.quantity = newQuantity;
        saveCart();
        updateCartUI();
    }
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
                ${item.size !== 'N/A' ? `<div class="cart-item-size">Talla ${item.size}</div>` : ''}
                <div class="cart-item-footer">
                    <div class="cart-item-price">${(item.price * item.quantity).toFixed(2)}€</div>
                    <div class="cart-item-actions">
                        <div class="cart-item-quantity">
                            <button class="btn-qty" onclick="updateQuantity(${item.id}, '${item.size}', -1)" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                            <span>${item.quantity}</span>
                            <button class="btn-qty" onclick="updateQuantity(${item.id}, '${item.size}', 1)" ${item.quantity >= item.stock ? 'disabled' : ''}>+</button>
                        </div>
                        <button class="btn-remove-item" onclick="removeFromCart(${item.id}, '${item.size}')" title="Eliminar del carrito">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            </svg>
                        </button>
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
