// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// State
let currentTab = 'categories';
let categories = [];
let products = [];
let users = [];
let orders = [];
let authToken = localStorage.getItem('auth_token');

// DOM Elements
const adminTabs = document.querySelectorAll('.admin-tab');
const adminTabContents = document.querySelectorAll('.admin-tab-content');
const adminModal = document.getElementById('adminModal');
const adminOverlay = document.getElementById('adminOverlay');
const closeAdminModal = document.getElementById('closeAdminModal');
const adminModalBody = document.getElementById('adminModalBody');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initEventListeners();
    loadCategories();
});

// Auth Check
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!authToken) {
        alert('Debes iniciar sesión para acceder al panel de administración.');
        window.location.href = '/HTML/login.html';
        return;
    }

    if (user.role !== 'admin') {
        alert('Acceso denegado. Solo administradores pueden acceder a este panel.');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/HTML/index.html';
        return;
    }
}

// Global error handler for API calls
async function handleApiError(response) {
    if (response.status === 401) {
        alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/HTML/login.html';
        return;
    }

    if (response.status === 403) {
        alert('No tienes permisos de administrador. Acceso denegado.');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/HTML/index.html';
        return;
    }

    throw new Error('Error en la petición');
}

// Event Listeners
function initEventListeners() {
    // Tab switching
    adminTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchTab(tabName);
        });
    });

    // Modal close
    closeAdminModal.addEventListener('click', closeModal);
    adminOverlay.addEventListener('click', closeModal);

    // Logout
    document.getElementById('logoutAdminBtn').addEventListener('click', logout);

    // Add buttons
    document.getElementById('addCategoryBtn').addEventListener('click', () => openCategoryModal());
    document.getElementById('addProductBtn').addEventListener('click', () => openProductModal());
    document.getElementById('addUserBtn').addEventListener('click', () => openUserModal());
}

function switchTab(tabName) {
    currentTab = tabName;

    // Update active tab
    adminTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update active content
    adminTabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });

    // Load data
    switch(tabName) {
        case 'categories':
            loadCategories();
            break;
        case 'products':
            loadProducts();
            break;
        case 'users':
            loadUsers();
            break;
        case 'orders':
            loadOrders();
            break;
    }
}

// ============= CATEGORIES =============

async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/category`, {
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            await handleApiError(response);
            return;
        }

        const data = await response.json();
        categories = data.data || [];
        renderCategories();
    } catch (error) {
        console.error('Error loading categories:', error);
        showError('categoriesTableBody', 'Error al cargar categorías');
    }
}

function renderCategories() {
    const tbody = document.getElementById('categoriesTableBody');

    if (categories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-cell">No hay categorías</td></tr>';
        return;
    }

    tbody.innerHTML = categories.map(cat => `
        <tr>
            <td>${cat.id}</td>
            <td>${cat.name}</td>
            <td>${cat.slug}</td>
            <td>${getProductCountByCategory(cat.id)}</td>
            <td class="actions-cell">
                <button class="btn-action btn-edit" onclick="openCategoryModal(${cat.id})">Editar</button>
                <button class="btn-action btn-delete" onclick="deleteCategory(${cat.id})">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

function getProductCountByCategory(categoryId) {
    return products.filter(p => p.category_id === categoryId).length;
}

function openCategoryModal(id = null) {
    const category = id ? categories.find(c => c.id === id) : null;
    const isEdit = !!category;

    adminModalBody.innerHTML = `
        <h2 class="modal-title">${isEdit ? 'Editar' : 'Nueva'} Categoría</h2>
        <form class="admin-form" id="categoryForm">
            <div class="form-group">
                <label class="form-label">Nombre</label>
                <input type="text" class="form-input" id="categoryName" value="${category?.name || ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Slug</label>
                <input type="text" class="form-input" id="categorySlug" value="${category?.slug || ''}" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
                <button type="submit" class="btn-primary">${isEdit ? 'Actualizar' : 'Crear'}</button>
            </div>
        </form>
    `;

    document.getElementById('categoryForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveCategory(id);
    });

    openModal();
}

async function saveCategory(id = null) {
    const name = document.getElementById('categoryName').value;
    const slug = document.getElementById('categorySlug').value;

    try {
        const url = id ? `${API_BASE_URL}/category/${id}` : `${API_BASE_URL}/category`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ name, slug })
        });

        if (!response.ok) {
            await handleApiError(response);
            return;
        }

        closeModal();
        loadCategories();
        showNotification(id ? 'Categoría actualizada' : 'Categoría creada');
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar la categoría');
    }
}

async function deleteCategory(id) {
    if (!confirm('¿Eliminar esta categoría?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/category/${id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            loadCategories();
            showNotification('Categoría eliminada');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar categoría');
    }
}

// ============= PRODUCTS =============

async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/product`, {
            headers: { 'Accept': 'application/json' }
        });
        const data = await response.json();
        products = data.data || [];

        // Load categories if not loaded
        if (categories.length === 0) {
            await loadCategories();
        }

        renderProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        showError('productsTableBody', 'Error al cargar productos');
    }
}

function renderProducts() {
    const tbody = document.getElementById('productsTableBody');

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-cell">No hay productos</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(prod => {
        const category = categories.find(c => c.id === prod.category_id);

        // Calcular stock total desde las tallas si existen
        let totalStock = prod.stock; // Fallback al stock general
        if (prod.sizes && prod.sizes.length > 0) {
            totalStock = prod.sizes.reduce((sum, size) => sum + (size.stock || 0), 0);
        }

        return `
            <tr>
                <td>${prod.id}</td>
                <td>${prod.name}</td>
                <td>${category?.name || 'N/A'}</td>
                <td>${parseFloat(prod.price).toFixed(2)}€</td>
                <td>${totalStock}</td>
                <td><span class="badge ${prod.active ? 'badge-active' : 'badge-inactive'}">${prod.active ? 'Activo' : 'Inactivo'}</span></td>
                <td class="actions-cell">
                    <button class="btn-action btn-edit" onclick="openProductModal(${prod.id})">Editar</button>
                    <button class="btn-action btn-delete" onclick="deleteProduct(${prod.id})">Eliminar</button>
                </td>
            </tr>
        `;
    }).join('');
}

function openProductModal(id = null) {
    const product = id ? products.find(p => p.id === id) : null;
    const isEdit = !!product;

    adminModalBody.innerHTML = `
        <h2 class="modal-title">${isEdit ? 'Editar' : 'Nuevo'} Producto</h2>
        <form class="admin-form" id="productForm" enctype="multipart/form-data">
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Nombre</label>
                    <input type="text" class="form-input" id="productName" value="${product?.name || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Slug</label>
                    <input type="text" class="form-input" id="productSlug" value="${product?.slug || ''}" required>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Descripción</label>
                <textarea class="form-input" id="productDescription" rows="3">${product?.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label class="form-label">Precio</label>
                <input type="number" step="0.01" class="form-input" id="productPrice" value="${product?.price || ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Categoría</label>
                <select class="form-input" id="productCategory" required>
                    <option value="">Seleccionar...</option>
                    ${categories.map(cat => `
                        <option value="${cat.id}" ${product?.category_id === cat.id ? 'selected' : ''}>
                            ${cat.name}
                        </option>
                    `).join('')}
                </select>
            </div>

            <div class="form-group" id="stockGeneralGroup">
                <label class="form-label">Stock General <span id="stockGeneralHint">(para todas las tallas)</span></label>
                <input type="number" class="form-input" id="productStockAll" placeholder="Dejar vacío para configurar por talla">
            </div>

            <div class="form-group" id="sizeStockGroup">
                <label class="form-label">Stock por Talla</label>
                <div class="size-stock-container">
                    ${['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => {
                        const sizeData = product?.sizes?.find(s => s.size === size);
                        return `
                        <div class="size-stock-item">
                            <label class="size-stock-label">${size}</label>
                            <input type="number"
                                   class="form-input size-stock-input"
                                   data-size="${size}"
                                   value="${sizeData?.stock || 0}"
                                   min="0"
                                   placeholder="0">
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Imagen Principal</label>
                <input type="file" class="form-input" id="productImage" accept="image/*">
                ${product?.path ? `<small style="color: #888; margin-top: 0.5rem; display: block;">Imagen actual: ${product.path.split('/').pop()}</small>` : ''}
            </div>
            <div class="form-group">
                <label class="form-label">Imagen Secundaria</label>
                <input type="file" class="form-input" id="productImageSecondary" accept="image/*">
                ${product?.image_secondary ? `<small style="color: #888; margin-top: 0.5rem; display: block;">Imagen actual: ${product.image_secondary.split('/').pop()}</small>` : ''}
            </div>
            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="productActive" ${product?.active ? 'checked' : ''}>
                    <span>Producto activo</span>
                </label>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
                <button type="submit" class="btn-primary">${isEdit ? 'Actualizar' : 'Crear'}</button>
            </div>
        </form>
    `;

    document.getElementById('productForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveProduct(id);
    });

    // Event listener para cambiar entre categorías y ocultar/mostrar tallas
    const categorySelect = document.getElementById('productCategory');
    const sizeStockGroup = document.getElementById('sizeStockGroup');
    const stockGeneralHint = document.getElementById('stockGeneralHint');
    const stockAllInput = document.getElementById('productStockAll');

    function toggleSizeInputs() {
        const selectedCategoryId = parseInt(categorySelect.value);
        const isAccessory = selectedCategoryId === 5;

        if (isAccessory) {
            // Ocultar sección de tallas
            sizeStockGroup.style.display = 'none';
            // Cambiar hint del stock general
            if (stockGeneralHint) {
                stockGeneralHint.textContent = '';
            }
            // Hacer obligatorio el stock general
            stockAllInput.placeholder = 'Stock del producto';
            stockAllInput.required = true;
        } else {
            // Mostrar sección de tallas
            sizeStockGroup.style.display = 'block';
            // Restaurar hint
            if (stockGeneralHint) {
                stockGeneralHint.textContent = '(para todas las tallas)';
            }
            // Hacer opcional el stock general
            stockAllInput.placeholder = 'Dejar vacío para configurar por talla';
            stockAllInput.required = false;
        }
    }

    // Ejecutar al cargar si ya hay categoría seleccionada
    if (categorySelect.value) {
        toggleSizeInputs();
    }

    // Ejecutar al cambiar categoría
    categorySelect.addEventListener('change', toggleSizeInputs);

    // Event listener para Stock General (aplicar a todas las tallas)
    if (stockAllInput) {
        stockAllInput.addEventListener('input', (e) => {
            const value = e.target.value;
            if (value && sizeStockGroup.style.display !== 'none') {
                document.querySelectorAll('.size-stock-input').forEach(input => {
                    input.value = value;
                });
            }
        });
    }

    openModal();
}

async function saveProduct(id = null) {
    const formData = new FormData();

    formData.append('name', document.getElementById('productName').value);
    formData.append('slug', document.getElementById('productSlug').value);
    formData.append('description', document.getElementById('productDescription').value);
    formData.append('price', document.getElementById('productPrice').value);

    const categoryId = document.getElementById('productCategory').value;
    formData.append('category_id', categoryId);
    formData.append('active', document.getElementById('productActive').checked ? '1' : '0');

    const isAccessory = parseInt(categoryId) === 5;

    // Recoger stock
    if (isAccessory) {
        // Para accesorios: usar solo el stock general
        const stockAll = document.getElementById('productStockAll').value;
        const totalStock = parseInt(stockAll) || 0;
        formData.append('stock', totalStock);
        // No enviar tallas para accesorios
        formData.append('sizes', JSON.stringify([]));
    } else {
        // Para productos con tallas: recoger stock por talla
        const sizeInputs = document.querySelectorAll('.size-stock-input');
        const sizes = [];
        let totalStock = 0;

        sizeInputs.forEach(input => {
            const size = input.dataset.size;
            const stock = parseInt(input.value) || 0;
            sizes.push({ size, stock });
            totalStock += stock;
        });

        // Enviar stock total (suma de todas las tallas)
        formData.append('stock', totalStock);

        // Enviar array de tallas con stock como JSON
        formData.append('sizes', JSON.stringify(sizes));
    }

    // Agregar imagen principal si se seleccionó
    const imageInput = document.getElementById('productImage');
    if (imageInput.files.length > 0) {
        formData.append('image', imageInput.files[0]);
    }

    // Agregar imagen secundaria si se seleccionó
    const imageSecondaryInput = document.getElementById('productImageSecondary');
    if (imageSecondaryInput.files.length > 0) {
        formData.append('image_secondary', imageSecondaryInput.files[0]);
    }

    // Para PUT requests en Laravel con FormData, necesitamos usar POST con _method
    if (id) {
        formData.append('_method', 'PUT');
    }

    try {
        const url = id ? `${API_BASE_URL}/product/${id}` : `${API_BASE_URL}/product`;
        const method = 'POST'; // Siempre POST cuando usamos FormData

        const response = await fetch(url, {
            method,
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${authToken}`
                // NO incluir Content-Type, el navegador lo añade automáticamente con boundary
            },
            body: formData
        });

        if (response.ok) {
            closeModal();
            loadProducts();
            showNotification(id ? 'Producto actualizado' : 'Producto creado');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al guardar producto');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar el producto: ' + error.message);
    }
}

async function deleteProduct(id) {
    if (!confirm('¿Eliminar este producto?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/product/${id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            loadProducts();
            showNotification('Producto eliminado');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar producto');
    }
}

// ============= USERS =============

async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/user`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });
        const data = await response.json();
        users = data.data || [];
        renderUsers();
    } catch (error) {
        console.error('Error loading users:', error);
        showError('usersTableBody', 'Error al cargar usuarios');
    }
}

function renderUsers() {
    const tbody = document.getElementById('usersTableBody');

    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-cell">No hay usuarios</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}">${user.role}</span></td>
            <td>${formatDate(user.created_at)}</td>
            <td class="actions-cell">
                <button class="btn-action btn-edit" onclick="openUserModal(${user.id})">Editar</button>
                <button class="btn-action btn-delete" onclick="deleteUser(${user.id})">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

function openUserModal(id = null) {
    const user = id ? users.find(u => u.id === id) : null;
    const isEdit = !!user;

    adminModalBody.innerHTML = `
        <h2 class="modal-title">${isEdit ? 'Editar' : 'Nuevo'} Usuario</h2>
        <form class="admin-form" id="userForm">
            <div class="form-group">
                <label class="form-label">Nombre</label>
                <input type="text" class="form-input" id="userName" value="${user?.name || ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-input" id="userEmail" value="${user?.email || ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Contraseña ${isEdit ? '(dejar vacío para no cambiar)' : ''}</label>
                <input type="password" class="form-input" id="userPassword" ${isEdit ? '' : 'required'}>
            </div>
            <div class="form-group">
                <label class="form-label">Rol</label>
                <select class="form-input" id="userRole" required>
                    <option value="user" ${user?.role === 'user' ? 'selected' : ''}>Usuario</option>
                    <option value="admin" ${user?.role === 'admin' ? 'selected' : ''}>Administrador</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
                <button type="submit" class="btn-primary">${isEdit ? 'Actualizar' : 'Crear'}</button>
            </div>
        </form>
    `;

    document.getElementById('userForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveUser(id);
    });

    openModal();
}

async function saveUser(id = null) {
    const userData = {
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        role: document.getElementById('userRole').value
    };

    const password = document.getElementById('userPassword').value;
    if (password) {
        userData.password = password;
    }

    try {
        const url = id ? `${API_BASE_URL}/user/${id}` : `${API_BASE_URL}/user`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            closeModal();
            loadUsers();
            showNotification(id ? 'Usuario actualizado' : 'Usuario creado');
        } else {
            throw new Error('Error al guardar usuario');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar el usuario');
    }
}

async function deleteUser(id) {
    if (!confirm('¿Eliminar este usuario?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/user/${id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            loadUsers();
            showNotification('Usuario eliminado');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar usuario');
    }
}

// ============= ORDERS =============

async function loadOrders() {
    try {
        const response = await fetch(`${API_BASE_URL}/order`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });
        const data = await response.json();
        orders = data.data || [];
        renderOrders();
    } catch (error) {
        console.error('Error loading orders:', error);
        showError('ordersTableBody', 'Error al cargar órdenes');
    }
}

function renderOrders() {
    const tbody = document.getElementById('ordersTableBody');

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-cell">No hay órdenes</td></tr>';
        return;
    }

    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>#${order.id}</td>
            <td>${order.user?.name || 'N/A'}</td>
            <td>${parseFloat(order.total_price || 0).toFixed(2)}€</td>
            <td><span class="badge badge-${order.status}">${order.status || 'pending'}</span></td>
            <td>${formatDate(order.created_at)}</td>
            <td class="actions-cell">
                <button class="btn-action btn-view" onclick="viewOrder(${order.id})">Ver</button>
                <button class="btn-action btn-edit" onclick="updateOrderStatus(${order.id})">Estado</button>
            </td>
        </tr>
    `).join('');
}

function viewOrder(id) {
    const order = orders.find(o => o.id === id);
    if (!order) return;

    adminModalBody.innerHTML = `
        <h2 class="modal-title">Orden #${order.id}</h2>
        <div class="order-details">
            <div class="detail-row">
                <span class="detail-label">Usuario:</span>
                <span>${order.user?.name || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span>${order.user?.email || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Subtotal:</span>
                <span>${parseFloat(order.subtotal || 0).toFixed(2)}€</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">IVA (21%):</span>
                <span>${parseFloat(order.tax || 0).toFixed(2)}€</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Envío:</span>
                <span>${parseFloat(order.shipping_cost || 0).toFixed(2)}€</span>
            </div>
            <div class="detail-row" style="font-weight: 600; font-size: 1.1em; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.1);">
                <span class="detail-label">Total:</span>
                <span>${parseFloat(order.total_price || 0).toFixed(2)}€</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Estado:</span>
                <span class="badge badge-${order.status}">${order.status}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Fecha:</span>
                <span>${formatDate(order.created_at)}</span>
            </div>
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="closeModal()">Cerrar</button>
        </div>
    `;

    openModal();
}

function updateOrderStatus(id) {
    const order = orders.find(o => o.id === id);
    if (!order) return;

    adminModalBody.innerHTML = `
        <h2 class="modal-title">Actualizar Estado - Orden #${order.id}</h2>
        <form class="admin-form" id="orderStatusForm">
            <div class="form-group">
                <label class="form-label">Estado</label>
                <select class="form-input" id="orderStatus" required>
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pendiente</option>
                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Procesando</option>
                    <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Enviado</option>
                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Entregado</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelado</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
                <button type="submit" class="btn-primary">Actualizar</button>
            </div>
        </form>
    `;

    document.getElementById('orderStatusForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const status = document.getElementById('orderStatus').value;

        try {
            const response = await fetch(`${API_BASE_URL}/order/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                closeModal();
                loadOrders();
                showNotification('Estado actualizado');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al actualizar el estado');
        }
    });

    openModal();
}

// ============= UTILITIES =============

function openModal() {
    adminModal.classList.add('active');
    adminOverlay.classList.add('active');
}

function closeModal() {
    adminModal.classList.remove('active');
    adminOverlay.classList.remove('active');
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showError(tbodyId, message) {
    const tbody = document.getElementById(tbodyId);
    const colspan = tbody.closest('table').querySelectorAll('th').length;
    tbody.innerHTML = `<tr><td colspan="${colspan}" class="error-cell">${message}</td></tr>`;
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

async function logout() {
    try {
        await fetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Accept': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error:', error);
    } finally {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/HTML/login.html';
    }
}
