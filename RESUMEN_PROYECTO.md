# 📦 FVCKOFF - E-commerce Streetwear

## 🎯 Resumen del Proyecto

Tienda online de streetwear premium con backend en Laravel 11 y frontend vanilla JavaScript, completamente dockerizada.

---

## 🗂️ Estructura del Proyecto

```
FuckOff/
├── backend/           # API Laravel 11 + MySQL
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── CartController.php       # ← NUEVO
│   │   │   │   ├── CategoryController.php
│   │   │   │   ├── ProductController.php
│   │   │   │   ├── UserController.php
│   │   │   │   └── OrderController.php
│   │   │   └── Middleware/
│   │   │       └── CheckAdmin.php
│   │   └── Models/
│   │       ├── User.php
│   │       ├── Category.php
│   │       ├── Product.php
│   │       ├── Order.php
│   │       └── CartItem.php                 # ← NUEVO
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   │       ├── DatabaseSeeder.php
│   │       └── ProductSeeder.php
│   ├── routes/
│   │   └── api.php
│   ├── .env
│   ├── Dockerfile
│   └── docker-entrypoint.sh
│
├── frontend/          # SPA Vanilla JS + Live Server
│   ├── HTML/
│   │   ├── index.html      # Tienda principal
│   │   ├── login.html      # Login/Registro
│   │   ├── checkout.html   # Checkout
│   │   └── admin.html      # Panel Admin
│   ├── CSS/
│   │   └── styles.css      # ~2000 líneas - Glassmorphism
│   └── JS/
│       ├── app.js          # Lógica tienda
│       ├── auth.js         # Login/Registro
│       ├── checkout.js     # Checkout
│       └── admin.js        # Panel Admin
│
└── docker-compose.yml
```

---

## 🚀 Comandos Rápidos

### Iniciar el proyecto
```bash
docker-compose up -d
```

### Acceder a la aplicación
- **Tienda**: http://localhost:8080
- **Panel Admin**: http://localhost:8080/HTML/admin.html
- **API Backend**: http://localhost:8000/api

### Ver usuarios en base de datos
```bash
docker exec tienda_backend php check_users.php
```

### Resetear base de datos con datos de prueba
```bash
docker exec tienda_backend php artisan migrate:fresh --seed
```

### Logs del backend
```bash
docker logs tienda_backend --tail 50
```

### Acceder al contenedor backend
```bash
docker exec -it tienda_backend bash
```

---

## 👥 Usuarios de Prueba

### Administrador
- **Email**: `admin@example.com`
- **Password**: `password`
- **Rol**: admin

### Usuario Normal
- **Email**: `test@example.com`
- **Password**: `password`
- **Rol**: user

---

## 🔧 Configuración Docker

### Servicios

#### 1. Base de Datos (MySQL 8.0)
- **Puerto**: 3307:3306
- **Base de datos**: tienda_db
- **Usuario**: tienda_user
- **Contraseña**: tienda_pass

#### 2. Backend (Laravel 11)
- **Puerto**: 8000
- **Framework**: Laravel 11
- **PHP**: 8.2-fpm
- **Autenticación**: Laravel Sanctum (tokens)
- **Servidor**: PHP Built-in Server (10 workers)

#### 3. Frontend (Live Server)
- **Puerto**: 8080
- **Stack**: HTML + CSS + Vanilla JavaScript
- **Hot Reload**: Activado

---

## 📊 Base de Datos

### Tablas Principales

#### `users`
- id, name, email, password, role (user/admin)

#### `categories`
- id, name, slug

#### `products`
- id, category_id, name, slug, description, price, size, stock, path, image_secondary, active

#### `product_sizes` 🆕
- id, product_id, size (enum), stock, timestamps
- **Relaciones**: belongsTo(Product)
- **Constraint**: unique(product_id, size) - Una entrada por talla por producto

#### `orders`
- id, user_id, total_price, subtotal, tax, shipping_cost, status, shipping_address, created_at

#### `cart_items` 🆕
- id, user_id, product_id, quantity, timestamps
- **Relaciones**: belongsTo(User), belongsTo(Product)
- **Constraint**: unique(user_id, product_id) - Un producto por usuario

#### `personal_access_tokens` (Sanctum)
- Tokens de autenticación

### Seeders

**20 productos** distribuidos en **5 categorías**:
- Camisetas (4 productos)
- Pantalones (4 productos)
- Sudaderas (3 productos)
- Chaquetas (3 productos)
- Accesorios (6 productos)

---

## 🔐 Sistema de Autenticación

### Laravel Sanctum
- Tokens de acceso personal
- Autenticación basada en API
- Middleware `auth:sanctum` para rutas protegidas
- Middleware `admin` para rutas de administrador

### Endpoints de Auth
```
POST   /api/register    # Registro de usuario
POST   /api/login       # Iniciar sesión
POST   /api/logout      # Cerrar sesión (requiere auth)
GET    /api/me          # Obtener usuario actual (requiere auth)
```

---

## 🛍️ API Endpoints

### Públicos (sin autenticación)

#### Categorías
```
GET    /api/category           # Listar todas
GET    /api/category/{id}      # Ver una
```

#### Productos
```
GET    /api/product            # Listar todos
GET    /api/product/{id}       # Ver uno
```

### Protegidos (requiere token)

#### Carrito 🆕
```
GET    /api/cart                    # Obtener carrito del usuario
POST   /api/cart                    # Añadir producto al carrito
PUT    /api/cart/{productId}        # Actualizar cantidad
DELETE /api/cart/{productId}        # Eliminar producto del carrito
DELETE /api/cart                    # Vaciar carrito completo
POST   /api/cart/sync               # Sincronizar carrito desde localStorage
```

#### Órdenes
```
GET    /api/order              # Listar órdenes del usuario
POST   /api/order              # Crear orden (con validación de stock)
GET    /api/order/{id}         # Ver orden
PUT    /api/order/{id}         # Actualizar orden (restaura stock si cancela)
DELETE /api/order/{id}         # Eliminar orden
```

### Solo Admin (requiere token + rol admin)

#### Categorías
```
POST   /api/category           # Crear
PUT    /api/category/{id}      # Actualizar
DELETE /api/category/{id}      # Eliminar
```

#### Productos
```
POST   /api/product            # Crear (soporta upload de imágenes)
PUT    /api/product/{id}       # Actualizar (soporta upload de imágenes)
DELETE /api/product/{id}       # Eliminar
```

#### Usuarios
```
GET    /api/user               # Listar todos
POST   /api/user               # Crear
GET    /api/user/{id}          # Ver uno
PUT    /api/user/{id}          # Actualizar
DELETE /api/user/{id}          # Eliminar
```

---

## 🎨 Frontend - Características

### Tienda Principal (`index.html`)

#### Funcionalidades
- ✅ Hero section con llamado a la acción
- ✅ Catálogo de productos con grid responsive
- ✅ Filtrado por categorías (tabs en navbar - carga dinámica desde API)
- ✅ Ordenamiento (precio, nombre)
- ✅ Badges de stock (últimas unidades, agotado)
- ✅ Modal de detalles de producto
- ✅ **Sistema de galería de imágenes** 🆕:
  - Dos imágenes por producto (principal + secundaria)
  - Navegación prev/next con botones
  - Indicadores visuales de imagen actual
  - Transiciones suaves con glassmorphism
- ✅ **Sistema de tallas completo** 🆕:
  - 6 tallas disponibles: XS, S, M, L, XL, XXL
  - Stock independiente por talla
  - Tallas sin stock: rojas, tachadas y deshabilitadas
  - Display dinámico de stock al seleccionar talla
  - Auto-selección de primera talla disponible
- ✅ Carrito lateral (sidebar)
- ✅ **Sistema de carrito persistente**:
  - Carrito en localStorage para usuarios no autenticados
  - Carrito en base de datos para usuarios autenticados
  - Sincronización automática al hacer login
  - Se limpia de vista al cerrar sesión, pero persiste en BD
  - Restauración automática al volver a iniciar sesión
  - **Items diferenciados por talla** 🆕: mismo producto con diferentes tallas = items separados
- ✅ Gestión de cantidades (+-) con validación de stock por talla
- ✅ Cálculo automático de totales

#### Menú de Usuario
- **Si NO está logueado**: Muestra botones "Iniciar Sesión" y "Registrarse"
- **Si está logueado como USER**: Muestra dropdown con "Mi Perfil" y "Cerrar Sesión"
- **Si está logueado como ADMIN**: Botón "Mi Perfil" redirige al panel admin

### Login/Registro (`login.html`)

#### Funcionalidades
- ✅ Formulario de login
- ✅ Formulario de registro (toggle entre ambos)
- ✅ Validación de contraseñas coincidentes
- ✅ Loaders durante peticiones
- ✅ Manejo de errores con mensajes
- ✅ **Sincronización de carrito al hacer login** 🆕:
  - Si localStorage tiene items → sincroniza con backend
  - Si localStorage vacío → carga desde backend
- ✅ Redirección automática según rol:
  - Admin → `/HTML/admin.html`
  - User → `/HTML/index.html` o URL de retorno
- ✅ Parámetro `?register=1` para mostrar form de registro
- ✅ Parámetro `?return=URL` para redirección post-login
- ✅ Botón "Volver" para regresar a la página anterior 🆕

### Checkout (`checkout.html`)

#### Funcionalidades
- ✅ Protegido: Requiere autenticación
- ✅ Formulario de información de envío
- ✅ Formulario de pago (solo visual, no procesa)
- ✅ Resumen de orden con productos del carrito
- ✅ **Desglose detallado de IVA** 🆕:
  - Base imponible (precio sin IVA)
  - + IVA (21%)
  - = Subtotal productos
  - + Envío (5€)
  - = Total final
  - **Nota**: El IVA se EXTRAE del precio (ya incluido), no se suma
- ✅ Layout de 2 columnas (formulario + resumen)
- ✅ Botón "Volver" para regresar a la página anterior 🆕

### Panel Admin (`admin.html`)

#### Protecciones
- ✅ Frontend: Verifica rol antes de cargar
- ✅ Backend: Middleware `admin` en todas las APIs
- ✅ Manejo de errores 401/403 con redirección

#### Funcionalidades - 4 Pestañas

**1. Gestión de Categorías**
- ✅ Tabla con listado (ID, nombre, slug, cantidad de productos)
- ✅ Crear nueva categoría (modal)
- ✅ Editar categoría (modal)
- ✅ Eliminar categoría (confirmación)

**2. Gestión de Productos**
- ✅ Tabla con listado (ID, nombre, categoría, precio, stock, estado)
- ✅ Crear nuevo producto (modal con todos los campos)
- ✅ **Upload de dos imágenes** 🆕:
  - Imagen principal (obligatoria)
  - Imagen secundaria (opcional)
  - Validación: jpeg, png, jpg, gif, webp (max 5MB)
  - Almacenamiento en storage/app/public/products
  - URL pública servida desde /storage/products/
  - Eliminación automática al actualizar
- ✅ **Gestión de stock por talla** 🆕:
  - Campo "Stock General": aplica mismo stock a todas las tallas
  - 6 inputs individuales para stock por talla (XS-XXL)
  - Grid responsive en el formulario
  - Datos enviados como JSON al backend
- ✅ Editar producto (modal con upload de imágenes y tallas)
- ✅ Eliminar producto (confirmación + limpieza de imágenes)
- ✅ Toggle activo/inactivo
- ✅ Seleccionar categoría (dropdown)

**3. Gestión de Usuarios**
- ✅ Tabla con listado (ID, nombre, email, rol, fecha registro)
- ✅ Crear nuevo usuario (modal)
- ✅ Editar usuario (modal)
- ✅ Cambiar contraseña
- ✅ Asignar rol (user/admin)
- ✅ Eliminar usuario (confirmación)
- ✅ Badges de colores para roles

**4. Gestión de Órdenes**
- ✅ Tabla con listado (ID, usuario, total, estado, fecha)
- ✅ Ver detalles de orden (modal)
- ✅ Actualizar estado de orden (modal)
- ✅ Estados: pending, processing, shipped, delivered, cancelled
- ✅ **Gestión automática de stock** 🆕:
  - Al crear orden → reduce stock de productos
  - Al cancelar orden → restaura stock + 1 unidad de bonus
- ✅ Badges de colores por estado

---

## 🎨 Diseño Visual

### Tema
- **Paleta**: Matte Black (Dark Theme)
- **Estilo**: Glassmorphism + Blur Effects
- **Tipografía**: Inter (Google Fonts)
- **Animaciones**: Smooth transitions (cubic-bezier)

### Componentes Reutilizables
- Botones primarios/secundarios
- Cards de productos con hover effects
- Modales con overlay
- Tablas responsivas con scroll
- Badges de estado con colores semánticos
- Forms con validación visual
- Loaders/spinners
- Notificaciones toast

### Responsive
- ✅ Mobile-first approach
- ✅ Breakpoints: 768px, 1024px
- ✅ Grid adaptativo de productos (1, 2, 3, 4 columnas)
- ✅ Sidebar del carrito se adapta a móvil
- ✅ Tablas con scroll horizontal en móvil
- ✅ Forms adaptativos (columnas → fila en móvil)

---

## 🔒 Seguridad

### Frontend
- Verificación de token en localStorage
- Verificación de rol antes de mostrar UI de admin
- Redirección automática si no autorizado
- Limpieza de sesión en logout

### Backend
- Validación de campos en todos los controllers
- Middleware `auth:sanctum` para autenticación
- Middleware `admin` para verificar rol
- Hash de contraseñas con bcrypt (4 rounds en dev)
- Tokens únicos por usuario (Sanctum)
- CORS habilitado para desarrollo

### Protección de Rutas
```
Rutas Públicas → Todos
Rutas Auth → Token válido
Rutas Admin → Token válido + role='admin'
```

---

## ⚡ Optimizaciones de Rendimiento

### Backend Laravel
- **OPcache**: Habilitado con configuraciones optimizadas
  - `opcache.enable=1`
  - `opcache.validate_timestamps=1`
  - `opcache.max_accelerated_files=10000`
  - `realpath_cache_size=4096K`

- **PHP Workers**: 10 workers concurrentes
- **Autoloader**: Optimizado con classmap authoritative
- **Caché**: Sistema de archivos (file driver)
- **Debug**: Desactivado en producción
- **BCRYPT_ROUNDS**: 4 (desarrollo)
- **LOG_LEVEL**: Error (solo errores críticos)

### Frontend
- Carga asíncrona de categorías y productos
- LocalStorage para carrito (persistencia sin servidor)
- Lazy loading de imágenes (preparado)
- CSS minificado (para producción)
- Animaciones con GPU acceleration (transform, opacity)

---

## 📝 Archivos de Utilidad

### Backend

**check_users.php**
```bash
docker exec tienda_backend php check_users.php
```
Muestra todos los usuarios con:
- ID, nombre, email, rol
- Hash de contraseña (primeros 30 caracteres)
- Fecha de creación

**check_products.php**
```bash
docker exec tienda_backend php check_products.php
```
Muestra todos los productos con sus categorías asignadas

---

## 🐛 Debugging

### Ver logs de Laravel
```bash
docker exec tienda_backend tail -f storage/logs/laravel.log
```

### Ver logs del servidor PHP
```bash
docker logs -f tienda_backend
```

### Limpiar cachés de Laravel
```bash
docker exec tienda_backend php artisan optimize:clear
```

### Ejecutar comandos Artisan
```bash
docker exec tienda_backend php artisan [comando]
```

### Acceder a MySQL directamente
```bash
docker exec -it tienda_db mysql -u tienda_user -ptienda_pass tienda_db
```

---

## 🔄 Flujo de Trabajo Típico

### Usuario Normal
1. Entra a la tienda (`http://localhost:8080`)
2. Navega por categorías
3. Añade productos al carrito
4. Hace clic en "Finalizar Compra"
5. Si no está logueado → Redirige a login
6. Después de login → Redirige a checkout
7. Completa formulario de envío y pago
8. Crea orden

### Administrador
1. Hace login (`admin@example.com`)
2. Se redirige automáticamente a `/HTML/admin.html`
3. Gestiona categorías, productos, usuarios y órdenes
4. Todos los cambios se reflejan inmediatamente en la tienda
5. Puede ver la tienda con botón "Ver Tienda"

---

## 🚧 Limitaciones Conocidas

### Desarrollo
- El servidor PHP built-in es **solo para desarrollo**
- Primera request siempre es más lenta (cold start de Laravel)
- No hay paginación en listings (todos los productos/categorías de una vez)
- El checkout solo es visual (no integra pasarelas de pago)
- Las imágenes de productos son placeholders (emojis)

### Producción
Para producción se recomienda:
- Usar **Laravel Octane** (con RoadRunner o Swoole)
- O usar **PHP-FPM + Nginx**
- Implementar **Redis** para caché y sesiones
- Agregar **paginación** a todas las listas
- Implementar **búsqueda** de productos
- Integrar **pasarela de pago** real
- Subir **imágenes reales** de productos
- Implementar **CDN** para assets
- Agregar **rate limiting** a la API
- Configurar **SSL/HTTPS**

---

## 📦 Tecnologías Utilizadas

### Backend
- **Laravel**: 11.x
- **PHP**: 8.2
- **MySQL**: 8.0
- **Laravel Sanctum**: Autenticación API
- **Composer**: Gestión de dependencias

### Frontend
- **HTML5**: Estructura semántica
- **CSS3**: Glassmorphism + Animations
- **JavaScript**: ES6+ (Vanilla, sin frameworks)
- **Live Server**: Hot reload en desarrollo

### DevOps
- **Docker**: Containerización
- **Docker Compose**: Orquestación multi-contenedor

---

## 🎓 Conceptos Implementados

### Backend
- ✅ RESTful API
- ✅ CRUD completo
- ✅ Autenticación basada en tokens
- ✅ Middleware personalizado
- ✅ Validación de requests
- ✅ Relaciones Eloquent
- ✅ Seeders y Factories
- ✅ Manejo de errores
- ✅ CORS

### Frontend
- ✅ SPA (Single Page Application)
- ✅ LocalStorage API
- ✅ Fetch API
- ✅ Modales dinámicos
- ✅ Gestión de estado
- ✅ Routing manual
- ✅ Event delegation
- ✅ Template literals
- ✅ Async/Await

---

## 📚 Recursos Adicionales

### Documentación Oficial
- Laravel: https://laravel.com/docs/11.x
- Laravel Sanctum: https://laravel.com/docs/11.x/sanctum
- Docker: https://docs.docker.com
- MDN Web Docs: https://developer.mozilla.org

### Comandos Útiles de Artisan
```bash
# Migraciones
php artisan migrate
php artisan migrate:fresh --seed
php artisan migrate:rollback

# Caché
php artisan config:cache
php artisan route:cache
php artisan cache:clear

# Crear recursos
php artisan make:model NombreModelo -m
php artisan make:controller NombreController
php artisan make:middleware NombreMiddleware
php artisan make:seeder NombreSeeder
```

---

## ✅ Checklist de Funcionalidades

### Autenticación ✅
- [x] Registro de usuarios
- [x] Login
- [x] Logout
- [x] Tokens Sanctum
- [x] Protección de rutas
- [x] Redirección según rol

### Tienda ✅
- [x] Listado de productos
- [x] Filtrado por categorías
- [x] Ordenamiento
- [x] Detalles de producto
- [x] Carrito de compras
- [x] Gestión de cantidades
- [x] Persistencia en LocalStorage
- [x] Checkout protegido

### Panel Admin ✅
- [x] Protección frontend y backend
- [x] CRUD Categorías
- [x] CRUD Productos
- [x] CRUD Usuarios
- [x] Gestión de Órdenes
- [x] Actualización de estados

### UX/UI ✅
- [x] Diseño responsive
- [x] Glassmorphism theme
- [x] Animaciones suaves
- [x] Loaders
- [x] Notificaciones
- [x] Modales
- [x] Badges de estado
- [x] Confirmaciones

---

## 🎯 Próximas Mejoras Sugeridas

### Funcionalidades
- [ ] Búsqueda de productos (barra de búsqueda)
- [ ] Filtros avanzados (precio, talla, disponibilidad)
- [ ] Wishlist / Favoritos
- [ ] Reviews y calificaciones de productos
- [ ] Historial de órdenes del usuario
- [ ] Dashboard de estadísticas para admin
- [ ] Notificaciones por email
- [ ] Recuperación de contraseña
- [ ] Perfil de usuario editable
- [ ] Sistema de cupones/descuentos

### Técnicas
- [ ] Paginación en todas las listas
- [ ] Lazy loading de imágenes
- [ ] Service Workers (PWA)
- [ ] Optimización de imágenes
- [ ] Tests automatizados (PHPUnit, Jest)
- [ ] CI/CD pipeline
- [ ] Rate limiting en API
- [ ] Logging avanzado
- [ ] Monitoreo de errores (Sentry)
- [ ] Analytics

---

## 🐛 Problemas Resueltos

### Sistema de Accesorios sin Tallas - IMPLEMENTACIÓN COMPLETA (29/11/2025)

#### Necesidad
El usuario requería que la categoría "Accesorios" (gorras, bolsos, mochilas, etc.) no mostrara el selector de tallas, ya que estos productos no lo necesitan. El objetivo era simplificar el proceso de compra para este tipo de productos.

#### Análisis del Problema
El sistema estaba diseñado exclusivamente para productos con tallas (XS-XXL), aplicando esta lógica a todas las categorías sin distinción. Esto creaba una experiencia de usuario confusa para accesorios que no requieren talla.

**Impacto:**
- UX: Clientes debían seleccionar una talla innecesaria para gorras, bolsos, etc.
- Admin: Obligados a configurar stock por talla para productos de talla única
- Datos: Stock mal distribuido entre tallas inexistentes

#### Solución Implementada

**1. Frontend - Tienda** (`frontend/JS/app.js`)

**Detección de Accesorios (línea 341):**
```javascript
// Verificar si es un accesorio (category_id = 5)
const isAccessory = product.category_id === 5;
```

**Ocultación Condicional del Selector de Tallas (líneas 383-417):**
```javascript
// Solo renderiza selector de tallas si NO es accesorio
${!isAccessory ? `
  <div class="size-selector-container">
    <label class="size-selector-label">Selecciona tu talla:</label>
    <div class="size-selector" id="sizeSelector">
      ${/* Botones de tallas XS-XXL */}
    </div>
  </div>
` : ''}
```

**Lógica de Añadir al Carrito sin Talla (líneas 483-503):**
```javascript
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
    closeProductModal();
}
```

**Display Condicional en Carrito (línea 745):**
```javascript
// Solo muestra "Talla X" si la talla NO es 'N/A'
${item.size !== 'N/A' ? `<div class="cart-item-size">Talla ${item.size}</div>` : ''}
```

**2. Panel Admin** (`frontend/JS/admin.js`)

**IDs Añadidos a Grupos de Stock (líneas 345-368):**
```javascript
<div class="form-group" id="stockGeneralGroup">
    <label class="form-label">Stock General <span id="stockGeneralHint">(para todas las tallas)</span></label>
    <input type="number" class="form-input" id="productStockAll" placeholder="Dejar vacío para configurar por talla">
</div>

<div class="form-group" id="sizeStockGroup">
    <label class="form-label">Stock por Talla</label>
    <div class="size-stock-container">
        ${/* Inputs de tallas XS-XXL */}
    </div>
</div>
```

**Función `toggleSizeInputs()` (líneas 403-428):**
```javascript
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
```

**Event Listeners (líneas 430-436):**
```javascript
// Ejecutar al cargar si ya hay categoría seleccionada
if (categorySelect.value) {
    toggleSizeInputs();
}

// Ejecutar al cambiar categoría
categorySelect.addEventListener('change', toggleSizeInputs);
```

**Lógica Condicional en `saveProduct()` (líneas 465-493):**
```javascript
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

    formData.append('stock', totalStock);
    formData.append('sizes', JSON.stringify(sizes));
}
```

#### Flujo Completo Implementado

**Crear Accesorio:**
1. Admin selecciona "Accesorios" → inputs de tallas se ocultan automáticamente
2. Admin introduce stock general (obligatorio): 25 unidades
3. Backend recibe: `{stock: 25, sizes: [], category_id: 5}`
4. Producto se guarda sin registros en `product_sizes`

**Comprar Accesorio:**
1. Cliente navega a categoría "Accesorios"
2. Click en producto → modal se abre SIN selector de tallas
3. Click "Añadir al Carrito" → se añade con talla 'N/A' internamente
4. Carrito muestra: "Nombre del producto" (sin "Talla X")

#### Resultado
✅ Modal de producto NO muestra selector de tallas para accesorios
✅ Panel admin oculta inputs de tallas al seleccionar categoría "Accesorios"
✅ Campo "Stock General" se vuelve obligatorio para accesorios
✅ Carrito no muestra "Talla X" para items con talla 'N/A'
✅ Función `addToCartWithSize()` no requiere talla para accesorios
✅ Backend recibe array vacío de tallas para accesorios
✅ Compatibilidad total con productos existentes con tallas

#### Archivos Modificados
**Frontend - Tienda:**
- `frontend/JS/app.js:341` - Detección de accesorios
- `frontend/JS/app.js:383-417` - Selector de tallas condicional
- `frontend/JS/app.js:483-503` - Lógica addToCartWithSize sin talla
- `frontend/JS/app.js:745` - Display condicional de talla en carrito

**Frontend - Admin:**
- `frontend/JS/admin.js:345-368` - IDs añadidos a grupos de stock
- `frontend/JS/admin.js:397-450` - toggleSizeInputs() + event listeners
- `frontend/JS/admin.js:465-493` - Lógica condicional en saveProduct()

#### Beneficios
- **UX mejorada**: Clientes no necesitan seleccionar talla innecesaria para accesorios
- **Gestión simplificada**: Admins configuran solo stock general para accesorios
- **Datos limpios**: No se crean registros de tallas falsas en BD
- **Mantenibilidad**: Lógica centralizada y clara con detección por `category_id`
- **Escalabilidad**: Fácil agregar más categorías sin tallas en el futuro

#### Limitaciones
- Hardcoded a `category_id = 5` (Accesorios)
- Si se requiere otra categoría sin tallas, debe duplicarse la lógica
- Mejora futura: Campo `requires_size` en tabla `categories`

---

### Productos Inactivos se Podían Comprar - SEGURIDAD (24/11/2025)

#### Problema
Los productos marcados como inactivos (`active = 0`) en el panel de administración seguían siendo visibles en la tienda y se podían añadir al carrito y comprar. Esto representaba un problema de seguridad y control de inventario.

#### Causa Raíz
No existían validaciones del campo `active` en:
- Frontend: `loadProducts()` no filtraba productos inactivos
- Frontend: `addToCart()` no verificaba el estado del producto
- Backend: `CartController` permitía operaciones con productos inactivos
- Backend: `OrderController` no validaba el estado al crear pedidos

#### Solución Aplicada

**Frontend** (`frontend/JS/app.js`):

1. **Filtrado en carga de productos** (línea 180):
```javascript
// Filtrar solo productos activos (active === 1)
allProducts = data.data.filter(product => product.active === 1);
```

2. **Validación en addToCart** (líneas 537-541):
```javascript
// Verificar que el producto esté activo
if (product.active !== 1) {
    alert('Este producto no está disponible');
    return;
}
```

**Backend** (`backend/app/Http/Controllers/Api/CartController.php`):

3. **Filtrado en index()** (líneas 21-24):
```php
->filter(function ($item) {
    // Filtrar productos inactivos del carrito
    return $item->product && $item->product->active;
})
```

4. **Validación en store()** (líneas 54-58):
```php
if (!$product->active) {
    return response()->json([
        'error' => 'Este producto no está disponible'
    ], Response::HTTP_BAD_REQUEST);
}
```

5. **Validación en update()** (líneas 123-127):
```php
if (!$product->active) {
    return response()->json([
        'error' => 'Este producto no está disponible'
    ], Response::HTTP_BAD_REQUEST);
}
```

6. **Validación en sync()** (línea 194):
```php
if ($product && $product->active) {
    // Solo sincronizar productos activos
}
```

**Backend** (`backend/app/Http/Controllers/Api/OrderController.php`):

7. **Validación en store()** (líneas 57-60):
```php
if (!$product->active) {
    throw new \Exception("El producto {$product->name} no está disponible");
}
```

#### Resultado
✅ Productos inactivos no aparecen en el catálogo
✅ No se pueden añadir al carrito (validación frontend)
✅ API rechaza operaciones con productos inactivos (validación backend)
✅ No se pueden crear pedidos con productos inactivos
✅ Carrito se limpia automáticamente de productos que se vuelven inactivos

#### Archivos Modificados
- `frontend/JS/app.js` (líneas 180, 537-541)
- `backend/app/Http/Controllers/Api/CartController.php` (líneas 21-24, 54-58, 123-127, 194)
- `backend/app/Http/Controllers/Api/OrderController.php` (líneas 57-60)

---

### Visualización Incorrecta de Stock en Panel Admin (24/11/2025)

#### Problema
En el panel de administración, la columna de stock mostraba valores incorrectos. Por ejemplo, al configurar 5 unidades por talla (XS, S, M, L, XL, XXL), mostraba 30 unidades en lugar de la suma correcta calculada dinámicamente.

#### Causa Raíz
El sistema utilizaba el campo `stock` general del producto (que almacena la suma de todas las tallas al crear el producto), pero este valor podía quedar **desincronizado** si:
- Se vendían productos (el stock de tallas se reduce, pero el stock general no)
- Se actualizaba solo el stock de algunas tallas
- Se eliminaban tallas

La tabla mostraba directamente `prod.stock` sin recalcular desde las tallas.

#### Solución Aplicada

**Frontend** (`frontend/JS/admin.js` líneas 285-289):

```javascript
// Calcular stock total desde las tallas si existen
let totalStock = prod.stock; // Fallback al stock general
if (prod.sizes && prod.sizes.length > 0) {
    totalStock = prod.sizes.reduce((sum, size) => sum + (size.stock || 0), 0);
}
```

**Lógica implementada**:
1. Si el producto tiene tallas configuradas (`prod.sizes.length > 0`):
   - Suma dinámicamente el stock de todas las tallas usando `reduce()`
   - Ejemplo: XS:5 + S:5 + M:5 + L:5 + XL:5 + XXL:5 = **30 unidades**
2. Si no tiene tallas configuradas (productos legacy):
   - Usa el campo `stock` general como fallback

**Backend** (`backend/app/Http/Controllers/Api/ProductController.php` línea 16):
```php
// Ya incluía ->with('sizes') para cargar las tallas
$products = Product::with('sizes')->get();
```

#### Resultado
✅ Stock se calcula en tiempo real desde la tabla `product_sizes`
✅ Evita desincronización entre stock general y stock por talla
✅ Compatibilidad con productos sin tallas configuradas
✅ Visualización precisa del inventario disponible

#### Archivos Modificados
- `frontend/JS/admin.js` (líneas 285-289)

---

### Error de Sintaxis en OrderController - CRÍTICO (05/11/2025)

#### Problema
El sistema de checkout fallaba con **error 500** al intentar crear pedidos. Los usuarios no podían completar sus compras.

#### Causa Raíz
```php
// ❌ INCORRECTO - ParseError en OrderController.php línea 47
public function store(Request $request) {
    DB::beginTransaction();
    try {
        const TAX_RATE = 0.21;      // Error: const dentro de método
        const SHIPPING_COST = 5.00;  // Error: const dentro de método
    }
}
```

**Error de logs**: `ParseError: syntax error, unexpected token "const" at OrderController.php:47`

PHP no permite declarar constantes con `const` dentro de métodos. Solo se permiten a nivel de clase.

#### Solución Aplicada
**Archivo**: `backend/app/Http/Controllers/Api/OrderController.php`

1. **Movidas constantes a nivel de clase** (líneas 15-16):
```php
class OrderController extends Controller
{
    private const TAX_RATE = 0.21;
    private const SHIPPING_COST = 5.00;
}
```

2. **Actualizadas referencias** con `self::` (líneas 81, 85, 97):
```php
$subtotal = round($totalWithTax / (1 + self::TAX_RATE), 2);
$total = $totalWithTax + self::SHIPPING_COST;
'shipping_cost' => self::SHIPPING_COST,
```

3. **Limpiadas cachés**:
   - `php artisan optimize:clear`
   - `composer dump-autoload` (6223 clases regeneradas)

#### Resultado
✅ Sistema de checkout completamente funcional
✅ Pedidos se crean correctamente con cálculo de IVA
✅ Stock se reduce automáticamente al crear orden

---

### Rediseño de UI de Autenticación (05/11/2025)

#### Necesidad
Los botones "Volver", "Iniciar Sesión" y "Registrarse" estaban dentro de las cajas de glassmorphism, dificultando su visibilidad y accesibilidad.

#### Solución Implementada

**Frontend - HTML** (`frontend/HTML/login.html`):
- ✅ Extraídos botones fuera de `.auth-form`
- ✅ Creados contenedores `.auth-external-actions` separados para login/registro
- ✅ Sistema de toggle entre formularios mejorado

**Frontend - CSS** (`frontend/CSS/styles.css`):
- ✅ Nuevos estilos `.auth-external-actions` con glassmorphism sutil
- ✅ Clase `.auth-link` para enlaces con efectos hover (elevation, glow)
- ✅ Clase `.btn-outline` para botón "Volver" con borde visible
- ✅ Estilos responsive para móviles (< 768px)

**Frontend - JavaScript** (`frontend/JS/auth.js`):
- ✅ Lógica de visibilidad sincronizada entre formularios y botones externos
- ✅ `showRegisterForm()` / `showLoginForm()` actualizados

#### Diseño Visual Final
```
┌─────────────────────────────────────┐
│   [Caja de Login glassmorphism]     │
│   - Campos de formulario            │
│   - Botón submit                    │
└─────────────────────────────────────┘
        ↓ 2rem de separación
┌─────────────────────────────────────┐
│ ¿No tienes cuenta? [Regístrate]    │ ← Semi-transparente + blur
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│         [← Volver]                  │ ← Borde outline visible
└─────────────────────────────────────┘
```

**Mejoras UX**:
- 📍 Botones claramente visibles fuera de la caja principal
- 📍 Hover effects con elevación y glow
- 📍 Icono de flecha (←) en botón "Volver"
- 📍 Contraste mejorado con fondos semi-transparentes

#### Archivos Modificados
- `frontend/HTML/login.html` - Reestructuración del DOM
- `frontend/CSS/styles.css` - 70+ líneas de nuevos estilos
- `frontend/JS/auth.js` - Lógica de toggle mejorada

---

### Corrección de Docker Build - Symlink Storage (05/11/2025)

#### Problema
Docker build fallaba con error: `invalid file request public/storage`

#### Causa
Docker no puede copiar enlaces simbólicos durante el contexto de build. El symlink `public/storage → storage/app/public` causaba el fallo.

#### Solución Aplicada

1. **Eliminado symlink del host**:
```bash
rm backend/public/storage
```

2. **Creado `.dockerignore`** (`backend/.dockerignore`):
```
public/storage
vendor/
node_modules/
.env
storage/framework/cache/data/*
# ... otros archivos
```

3. **Modificado entrypoint** (`backend/docker-entrypoint.sh` líneas 12-16):
```bash
# Crear enlace simbólico de storage si no existe
if [ ! -L public/storage ]; then
  echo "Creating storage symlink..."
  php artisan storage:link
fi
```

4. **Rebuild exitoso**:
```bash
docker-compose down
docker-compose up --build -d
```

#### Resultado
✅ Build de Docker completado sin errores
✅ Symlink creado automáticamente en runtime
✅ Log confirmado: "The [public/storage] link has been connected to [storage/app/public]"
✅ Upload de imágenes de productos funcionando correctamente

---

### Sistema de Carrito Persistente Implementado (04/11/2025)

#### Necesidad
El usuario requería que el carrito:
1. Se vaciara visualmente al cerrar sesión
2. Persistiera en la base de datos por cuenta de usuario
3. Se restaurara al volver a iniciar sesión
4. Sincronizara items de localStorage al hacer login

#### Implementación Completa

**Backend - Base de Datos:**
- Migración `create_cart_items_table` con campos: user_id, product_id, quantity
- Constraint único: un producto por usuario
- Foreign keys con cascade delete
- Modelo `CartItem` con relaciones User y Product

**Backend - API CartController:**
- `GET /api/cart` - Obtener carrito del usuario
- `POST /api/cart` - Añadir producto (con validación de stock)
- `PUT /api/cart/{productId}` - Actualizar cantidad
- `DELETE /api/cart/{productId}` - Eliminar producto
- `DELETE /api/cart` - Vaciar carrito completo
- `POST /api/cart/sync` - Sincronizar desde localStorage (usado en login)

**Frontend - app.js:**
- `loadCartFromBackend()` - Carga carrito desde API al iniciar
- `addToCart()` modificado - Sincroniza con backend si está autenticado
- `handleLogout()` modificado - Limpia localStorage y array del carrito

**Frontend - auth.js:**
- `syncCartAfterLogin()` - Nueva función que:
  - Si localStorage vacío → carga desde backend
  - Si localStorage con items → POST /api/cart/sync

#### Flujo Implementado
1. **Usuario sin login**: Carrito en localStorage únicamente
2. **Login con carrito**: localStorage se sincroniza a backend, se limpia localStorage y carga desde BD
3. **Login sin carrito**: Carga carrito desde backend si existe
4. **Logout**: Se limpia de vista, persiste en BD
5. **Login nuevamente**: Restaura desde BD

#### Archivos Modificados
- `backend/database/migrations/2025_11_04_132439_create_cart_items_table.php`
- `backend/app/Models/CartItem.php`
- `backend/app/Http/Controllers/Api/CartController.php`
- `backend/routes/api.php:33-38`
- `frontend/JS/app.js` (loadCartFromBackend, addToCart, handleLogout)
- `frontend/JS/auth.js` (syncCartAfterLogin)

---

### Botones de Navegación "Volver" Añadidos (04/11/2025)

#### Necesidad
El usuario requería botones para volver a la página anterior en:
- Página de login/registro
- Página de checkout

#### Implementación
- `frontend/HTML/login.html:55-57, 100-102` - Botón "Volver" en ambos formularios
- `frontend/HTML/checkout.html:145` - Botón "Volver" reemplazando link de tienda
- `frontend/CSS/styles.css:1297-1299` - Clase `.auth-back` para estilos
- Todos usan `javascript:history.back()` para navegación del historial

---

### Desglose Visual de IVA Implementado (04/11/2025)

#### Necesidad
El usuario requería que el IVA (21%) se mostrara claramente desglosado, con la aclaración de que el precio ya incluye IVA (extracción, no adición).

#### Fórmula Aplicada
```php
$totalWithTax = sum(product_price * quantity);
$subtotal = round($totalWithTax / 1.21, 2);  // Base imponible
$tax = round($totalWithTax - $subtotal, 2);   // IVA extraído
$total = $totalWithTax + SHIPPING_COST;
```

#### Implementación Frontend
- `frontend/HTML/checkout.html:110-127` - Sección visual con desglose
- `frontend/CSS/styles.css` - Estilos para `.summary-section`
- Layout mejorado con indentación, símbolos (+, =) y highlights

#### Resultado Visual
```
Desglose de productos:
  Base imponible         45.45€
  + IVA (21%)            9.55€
  = Subtotal productos   55.00€

Envío                    5.00€
────────────────────────────
Total                    60.00€
```

---

### Sistema de Upload de Imágenes para Productos (03/11/2025)

#### Necesidad
Cambiar el input de URL por upload de archivos para las imágenes de productos.

#### Implementación

**Backend:**
- `ProductController::store()` y `update()` modificados
- Validación: `image|mimes:jpeg,png,jpg,gif,webp|max:5120`
- Storage en `storage/app/public/products/`
- Filename: `timestamp_uniqid.extension`
- Ruta en DB: `/storage/products/filename.ext`
- Comando ejecutado: `php artisan storage:link`
- Ruta pública servida desde `backend/routes/api.php:61-69`

**Frontend:**
- `frontend/JS/admin.js` modificado para usar `FormData`
- Input cambiado de `<input type="text">` a `<input type="file">`
- Headers sin `Content-Type` (browser añade multipart boundary)
- Workaround Laravel: `_method: 'PUT'` en FormData para updates

#### Archivos Modificados
- `backend/app/Http/Controllers/Api/ProductController.php:42-49, 70-78`
- `frontend/JS/admin.js:saveProduct()`
- `frontend/HTML/admin.html` - Input file en modal de productos

---

### Error: Middleware CheckAdmin no encontrado (30/10/2025)

#### Síntoma
Al intentar crear, editar o eliminar categorías desde el panel de administración, las operaciones fallaban con error 500.

#### Causa
```
Target class [App\Http\Middleware\CheckAdmin] does not exist
```

Aunque el archivo `CheckAdmin.php` existía físicamente en `app/Http/Middleware/` y estaba registrado en `bootstrap/app.php`, Laravel no podía encontrarlo porque el **autoloader de Composer** no tenía la clase registrada en su mapa de clases.

#### Solución Aplicada
```bash
# 1. Limpiar caché de Laravel
docker exec tienda_backend php artisan optimize:clear

# 2. Regenerar autoloader de Composer desde el host
cd backend
composer dump-autoload --optimize

# 3. Reiniciar contenedor backend
docker-compose restart backend
```

#### Resultado
- ✅ Operaciones CRUD de categorías funcionando correctamente
- ✅ Middleware CheckAdmin detectado y ejecutándose
- ✅ Autoloader optimizado con 6220 clases registradas

#### Prevención
Cada vez que se cree un nuevo archivo PHP (Controller, Middleware, Model, etc.), ejecutar:
```bash
composer dump-autoload
```

O desde el contenedor Docker:
```bash
docker exec tienda_backend composer dump-autoload
```

#### Archivos Involucrados
- `backend/app/Http/Middleware/CheckAdmin.php` - Middleware de verificación de admin
- `backend/bootstrap/app.php:20-22` - Registro del middleware
- `backend/routes/api.php:36-49` - Rutas protegidas con middleware admin
- `backend/vendor/composer/autoload_*` - Archivos de autoloader regenerados

---

## 📞 Información de Contacto

**Proyecto**: FVCKOFF E-commerce
**Versión**: 1.0.7
**Fecha**: Noviembre 2025
**Stack**: Laravel 11 + Vanilla JS + Docker
**Última Actualización**: 29/11/2025

### 🆕 Cambios en v1.0.7 (29/11/2025)
- ✅ **Sistema de Accesorios sin Tallas**: Implementación completa de productos sin selector de tallas
  - Frontend: Categoría "Accesorios" (category_id=5) no muestra selector de tallas en modal de producto
  - Panel Admin: Al seleccionar "Accesorios" se oculta automáticamente la sección "Stock por Talla"
  - Panel Admin: Campo "Stock General" se vuelve obligatorio y cambia placeholder para accesorios
  - Lógica de carrito: Items de accesorios usan talla 'N/A' internamente
  - Visualización de carrito: No muestra "Talla X" para productos sin talla
  - Función `addToCartWithSize()`: No requiere selección de talla para accesorios
  - Función `saveProduct()`: Envía array vacío de tallas para accesorios, solo stock general
  - Función `toggleSizeInputs()`: Controla visibilidad dinámica según categoría seleccionada
- ✅ **UX Mejorada**: Proceso de añadir al carrito simplificado para accesorios (gorras, bolsos, etc.)
- ✅ **Compatibilidad**: Sistema mantiene funcionalidad completa de tallas para otras categorías

### 🆕 Cambios en v1.0.6 (24/11/2025)
- ✅ **SEGURIDAD**: Sistema completo de validación de productos inactivos
  - Frontend: Productos inactivos no se muestran en catálogo
  - Frontend: Validación al intentar añadir productos inactivos al carrito
  - Backend CartController: Validaciones en store(), update(), sync() e index()
  - Backend OrderController: Validación al crear pedidos
  - Productos inactivos se filtran automáticamente del carrito al cargar
- ✅ **Panel Admin**: Corrección de visualización de stock
  - Stock ahora se calcula dinámicamente desde product_sizes
  - Suma en tiempo real del stock de todas las tallas
  - Evita desincronización entre stock general y stock por talla
- ✅ **Base de Datos**: Limpieza y reset completo
  - Reset de AUTO_INCREMENT con migrate:fresh
  - Recreación de categorías base (Camisetas, Pantalones, Sudaderas, Chaquetas, Accesorios)
  - Creación de usuario administrador
- ✅ **Documentación**: Resumen actualizado con cambios de la sesión

### 🆕 Cambios en v1.0.3 (05/11/2025)
- ✅ **CRÍTICO**: Corregido error fatal en sistema de checkout (ParseError en OrderController)
- ✅ **UX**: Rediseño completo de UI de autenticación con botones externos visibles
- ✅ **DevOps**: Solucionado problema de Docker build con enlaces simbólicos
- ✅ Sistema de pedidos completamente funcional
- ✅ Upload de imágenes de productos operativo

### 🆕 Cambios en v1.0.4 (11/11/2025)
- ✅ **Sistema de galería de imágenes**: Productos con dos fotos (principal y secundaria)
- ✅ **Navegación de galería**: Botones prev/next e indicadores en modal de producto
- ✅ **Sistema de tallas completo**: Selección de 6 tallas (XS, S, M, L, XL, XXL)
- ✅ **Stock por talla**: Gestión independiente de stock para cada talla
- ✅ **Panel Admin mejorado**: Campo "Stock General" y 6 inputs individuales por talla
- ✅ **Display dinámico de stock**: Actualización en tiempo real al seleccionar tallas
- ✅ **Tallas sin stock**: Botones rojos con texto tachado y deshabilitados
- ✅ **Carrito por talla**: Mismo producto con diferentes tallas = items separados
- ✅ **Limpieza de UI**: Eliminada talla de las tarjetas de producto
- ✅ **Compatibilidad**: Productos sin tallas configuradas usan stock general

### 🆕 Cambios en v1.0.5 (18/11/2025)
- ✅ **Páginas informativas y legales completas**:
  - Sobre Nosotros (about.html) - Filosofía de marca con 4 pilares
  - Envíos (shipping.html) - 3 métodos de envío, zonas, tracking
  - Devoluciones (returns.html) - Política de 30 días, proceso paso a paso
  - Contacto (contact.html) - Formulario, horarios, redes sociales
  - Privacidad (privacy.html) - GDPR compliant con 11 secciones
  - Términos (terms.html) - 14 secciones de términos y condiciones
  - Cookies (cookies.html) - Política de cookies con gestión por navegador
- ✅ **Footer actualizado**: Enlaces funcionales a todas las nuevas páginas
- ✅ **Eliminación de tienda física**: Actualizado todo el contenido para reflejar modelo 100% online
- ✅ **Sistema de selección de método de envío en checkout**:
  - 3 opciones: Estándar (5€), Express (8€), Gratis (+75€)
  - Selección dinámica con actualización de precio en tiempo real
  - Badge "Más Popular" en Envío Express
  - Habilitación automática de envío gratis al superar 75€
  - Deshabilitación de envío estándar al alcanzar envío gratis
  - Display de "Añade X€ más para envío gratis"
- ✅ **Mejoras en carrito de compras**:
  - Límite mínimo de 1 unidad por producto
  - Límite máximo según stock disponible
  - Botón de papelera para eliminar productos
  - Sincronización completa con backend
  - Botones deshabilitados con estados visuales
- ✅ **Optimización de UX**:
  - Botón "Añadir al Carrito" → "Seleccionar Talla" que abre modal
  - Cierre automático de modal después de añadir al carrito
  - Botón "Volver" → "Seguir Comprando" en checkout
  - Botón "Completar Pedido" → "Finalizar Pedido"
- ✅ **Seeders mejorados**: Auto-creación de tallas con stock distribuido para todos los productos
- ✅ **580+ líneas de CSS**: Estilos completos para páginas legales e informativas con glassmorphism

---

## 📄 Páginas Informativas y Legales (v1.0.5)

### Sobre Nosotros (`about.html`)

**Contenido**:
- Historia de la marca FVCKOFF
- Para quién está dirigida (público joven, urbano e inconformista)
- Filosofía de marca con 4 pilares:
  - 💥 Actitud Sin Disculpas
  - 🔥 Calidad Premium
  - 🎨 Diseños Únicos
  - 🌍 Comunidad Auténtica
- Compromiso con sostenibilidad y producción ética
- CTA para unirse a la comunidad

**Diseño**: Hero section + glassmorphism cards con iconos

### Envíos (`shipping.html`)

**Métodos de envío**:
1. **Envío Estándar** - 5€ (3-5 días laborables)
2. **Envío Express** - 8€ (24-48 horas) - Badge "Más Popular"
3. **Envío Gratis** - Compras +75€ (3-5 días laborables)

**Zonas**:
- 🇪🇸 España Peninsular (3-5 días)
- 🏝️ Islas Baleares y Canarias (5-7 días)
- 🇪🇺 Unión Europea (consultar)

**Información adicional**:
- Seguimiento de pedidos
- Tiempos de procesamiento
- FAQ sobre envíos

### Devoluciones (`returns.html`)

**Política**:
- 30 días desde recepción del producto
- Producto en perfectas condiciones
- Etiquetas y embalaje original
- Gastos de devolución a cargo del cliente

**Proceso en 4 pasos**:
1. Contactar con atención al cliente
2. Recibir autorización e instrucciones
3. Enviar producto con seguimiento
4. Recibir reembolso (5-10 días hábiles)

**Productos no retornables**:
- Artículos en oferta final
- Productos personalizados
- Productos usados o dañados

### Contacto (`contact.html`)

**Métodos de contacto**:
- 📧 Email: info@fvckoff.com (respuesta 24-48h)
- 📞 Teléfono: +34 910 123 456 (Lun-Vie 10:00-18:00)

**Formulario de contacto**:
- Campos: Nombre, Email, Asunto, Nº Pedido (opcional), Mensaje
- Validación completa con JavaScript
- Handler en `contact.js`

**Horario de atención**:
- Lunes a Viernes: 10:00 - 18:00
- Sábados y Domingos: Cerrado

**Redes sociales**:
- Instagram: @fvckoff_official
- Twitter: @fvckoff_store
- TikTok: @fvckoff

### Privacidad (`privacy.html`)

**11 Secciones GDPR Compliant**:
1. Información General
2. Datos que Recopilamos (personales y automáticos)
3. Uso de tus Datos
4. Protección de Datos (cifrado SSL)
5. Compartir Información (terceros necesarios)
6. Tus Derechos (acceso, rectificación, supresión, portabilidad)
7. Cookies (referencia a política de cookies)
8. Retención de Datos
9. Menores de Edad (no dirigido a -16 años)
10. Cambios en esta Política
11. Contacto (privacidad@fvckoff.com)

### Términos y Condiciones (`terms.html`)

**14 Secciones**:
1. Información General
2. Datos del Titular (nombre comercial, email, teléfono)
3. Objeto (condiciones de compra)
4. Proceso de Compra (registro, pedidos, precios con IVA)
5. Pagos (tarjetas, PayPal, transferencia)
6. Envíos y Entregas
7. Derecho de Desistimiento (30 días)
8. Garantías (2 años legales)
9. Propiedad Intelectual
10. Responsabilidad
11. Protección de Datos
12. Modificaciones
13. Legislación y Jurisdicción (española, tribunales de Madrid)
14. Contacto

### Cookies (`cookies.html`)

**Secciones**:
- Qué son las Cookies
- Tipos de Cookies:
  - Esenciales (auth_token, cart)
  - De Preferencias
  - Analíticas (Google Analytics)
  - De Marketing
- Finalidad de las Cookies
- Cookies de Terceros
- Gestión de Cookies (por navegador)
- Enlaces de ayuda: Chrome, Firefox, Safari, Edge
- Consecuencias de Desactivar Cookies
- Actualización de la Política
- Más Información (referencia a privacidad)

**Tabla de cookies**:
| Cookie | Descripción | Duración |
|--------|-------------|----------|
| auth_token | Mantiene sesión activa | Hasta cerrar sesión |
| cart | Almacena productos del carrito | 30 días |

### Diseño Visual Común

**Estilos compartidos** (`styles.css` líneas 2489-3067):
- `.legal-page-container` / `.info-page-container` - Contenedor principal
- `.legal-page-header` / `.info-page-header` - Headers con título y fecha
- `.legal-section` / `.info-section` - Secciones con glassmorphism
- `.legal-title` / `.section-title` - Títulos H2
- `.legal-subtitle` / `.section-subtitle` - Subtítulos H3
- `.legal-list` - Listas con checkmarks
- `.contact-info-box` - Caja de información de contacto
- `.shipping-card` - Tarjetas de métodos de envío
- `.return-step` - Pasos numerados con círculos
- `.contact-form` - Formulario estilizado
- `.cookie-table` - Tabla de cookies
- `.browser-links` - Enlaces a navegadores

**Responsive**: Breakpoints en 768px para adaptación móvil

### Archivos Creados

**HTML** (7 nuevos archivos):
- `frontend/HTML/about.html`
- `frontend/HTML/shipping.html`
- `frontend/HTML/returns.html`
- `frontend/HTML/contact.html`
- `frontend/HTML/privacy.html`
- `frontend/HTML/terms.html`
- `frontend/HTML/cookies.html`

**JavaScript** (1 nuevo archivo):
- `frontend/JS/contact.js` - Handler del formulario de contacto

**CSS**:
- `frontend/CSS/styles.css` - 580+ líneas añadidas (líneas 2489-3199)

**Footer actualizado**:
- `frontend/HTML/index.html` - Enlaces del footer actualizados
- Todas las páginas nuevas tienen footer con enlaces correctos

---

## 🚚 Sistema de Métodos de Envío en Checkout (v1.0.5)

### Implementación

El checkout ahora permite al usuario seleccionar el método de envío con actualización dinámica del precio total.

### Opciones de Envío

#### 1. Envío Estándar
- **Precio**: 5€
- **Tiempo**: 3-5 días laborables
- **Estado por defecto**: Seleccionado si pedido < 75€
- **Estado con pedido ≥75€**: **Deshabilitado** (no tiene sentido pagar si hay envío gratis)

#### 2. Envío Express
- **Precio**: 8€
- **Tiempo**: 24-48 horas
- **Badge**: "Más Popular"
- **Estado**: Siempre disponible (incluso con pedido ≥75€)
- **Justificación**: Cliente puede preferir entrega rápida aunque pague

#### 3. Envío Gratis
- **Precio**: 0€
- **Requisito**: Pedido ≥ 75€
- **Estado por defecto**: Deshabilitado con mensaje "Añade X€ más"
- **Al alcanzar 75€**:
  - Se habilita automáticamente
  - Se selecciona automáticamente
  - Muestra "Gratis" en lugar de "0.00€"
  - Oculta mensaje de "Añade X€ más"

### HTML (`checkout.html`)

**Estructura añadida** (líneas 72-122):
```html
<div class="checkout-card">
    <h3 class="checkout-card-title">Método de Envío</h3>
    <div class="shipping-options">
        <label class="shipping-option" id="standardShippingOption">
            <input type="radio" name="shippingMethod" value="standard" data-price="5" checked>
            <div class="shipping-option-content">
                <div class="shipping-option-header">
                    <span class="shipping-option-icon">📦</span>
                    <div class="shipping-option-info">
                        <span class="shipping-option-name">Envío Estándar</span>
                        <span class="shipping-option-time">3-5 días laborables</span>
                    </div>
                    <span class="shipping-option-price">5.00€</span>
                </div>
            </div>
        </label>
        <!-- Express y Gratis con estructura similar -->
    </div>
</div>
```

**Elementos dinámicos**:
- `#standardShippingOption` - Contenedor opción estándar
- `#expressShippingOption` - Contenedor opción express
- `#freeShippingOption` - Contenedor opción gratis
- `#freeShippingNote` - Mensaje "Añade X€ más"
- `#amountForFreeShipping` - Span con cantidad faltante

### JavaScript (`checkout.js`)

**Variables de estado**:
```javascript
let selectedShippingCost = 5.00; // Default: Standard
const FREE_SHIPPING_THRESHOLD = 75.00;
```

**Función `setupShippingOptions()`** (líneas 80-127):
- Calcula total del carrito
- Verifica si alcanza 75€ para envío gratis
- **Si total ≥ 75€**:
  - Habilita envío gratis y lo selecciona
  - Deshabilita envío estándar
  - Mantiene envío express disponible
  - Oculta mensaje "Añade X€"
  - Actualiza costo a 0€
- **Si total < 75€**:
  - Habilita envío estándar y express
  - Deshabilita envío gratis
  - Muestra "Añade X€ más para envío gratis"

**Función `updateOrderSummary()`** (líneas 129-141):
- Recalcula totales con costo de envío seleccionado
- Actualiza display de envío (muestra "Gratis" si es 0€)
- Actualiza total final

**Listeners**:
- Event listeners en todos los radio buttons
- Al cambiar selección → actualiza `selectedShippingCost` → llama `updateOrderSummary()`

**Datos enviados al backend** (líneas 156-176):
```javascript
const orderData = {
    // ... otros campos
    shipping_method: 'standard'|'express'|'free',
    shipping_cost: selectedShippingCost
};
```

### CSS (`styles.css`)

**Estilos añadidos** (líneas 3069-3199):

**Contenedor**:
```css
.shipping-options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
```

**Opción de envío**:
```css
.shipping-option-content {
    background: rgba(255, 255, 255, 0.03);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1.25rem;
    transition: all 0.3s ease;
}

/* Hover */
.shipping-option:hover .shipping-option-content {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.2);
}

/* Seleccionada */
.shipping-option input[type="radio"]:checked ~ .shipping-option-content {
    background: rgba(255, 255, 255, 0.08);
    border-color: #fff;
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
}

/* Deshabilitada */
.shipping-option input[type="radio"]:disabled ~ .shipping-option-content {
    opacity: 0.5;
    cursor: not-allowed;
}
```

**Badge "Más Popular"**:
```css
.shipping-option-badge {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    font-size: 0.7rem;
    font-weight: 600;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    text-transform: uppercase;
}
```

**Nota de envío gratis**:
```css
.shipping-option-note {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.7);
}
```

### UX Highlights

**Estados visuales claros**:
- Opción seleccionada: Borde blanco brillante + glow
- Opción hover: Elevación sutil
- Opción deshabilitada: Opacidad 0.5 + cursor not-allowed

**Feedback inmediato**:
- Al cambiar opción → Total se actualiza instantáneamente
- Al alcanzar 75€ → Envío gratis se activa y mensaje desaparece
- Animaciones suaves con transitions

**Lógica de negocio**:
- No permitir pagar envío estándar si ya tiene gratis
- Permitir pagar express incluso con gratis (entrega rápida)

### Mejoras UX Adicionales

**Botones actualizados**:
- "Volver" → "Seguir Comprando" (línea 197)
- "Completar Pedido" → "Finalizar Pedido" (línea 194)

---

## 🛒 Mejoras en Sistema de Carrito (v1.0.5)

### Límites de Cantidad

**Mínimo: 1 unidad**
- Botón "-" se deshabilita cuando cantidad = 1
- No se permite eliminar con botón de cantidad

**Máximo: Stock disponible**
- Botón "+" se deshabilita cuando cantidad = stock
- Alert si intenta agregar más: "No hay más stock disponible para la talla X"

### Botón de Papelera

**Ubicación**: Al lado de los controles de cantidad

**HTML** (app.js línea ~610):
```javascript
<button class="btn-remove-item" onclick="removeFromCart(${item.id}, '${item.size}')"
        title="Eliminar del carrito">
    <svg>... icono de papelera ...</svg>
</button>
```

**CSS**:
```css
.btn-remove-item {
    background: rgba(255, 68, 68, 0.2);
    border: 1px solid rgba(255, 68, 68, 0.4);
    /* Hover effect con rojo más intenso */
}
```

**Funcionalidad**:
- Click → elimina item del carrito inmediatamente
- Sincroniza con backend si usuario autenticado
- Actualiza UI y localStorage

### Sincronización con Backend

**Función `removeFromCart()` actualizada**:
```javascript
async function removeFromCart(productId, size) {
    const token = localStorage.getItem('auth_token');
    if (token) {
        // DELETE request al backend con size en body
        const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
            method: 'DELETE',
            headers: { /* ... */ },
            body: JSON.stringify({ size: size })
        });
        await loadCartFromBackend(); // Reload desde DB
    } else {
        // Filtrar de localStorage
        cart = cart.filter(item => !(item.id === productId && item.size === size));
        saveCart();
    }
    updateCartUI();
}
```

**Función `updateQuantity()` actualizada**:
```javascript
async function updateQuantity(productId, size, change) {
    const item = cart.find(item => item.id === productId && item.size === size);
    const newQuantity = item.quantity + change;

    // Validaciones
    if (newQuantity < 1) return; // No permitir menos de 1
    if (newQuantity > item.stock) {
        alert(`No hay más stock. Máximo: ${item.stock}`);
        return;
    }

    // Sincronizar con backend si autenticado
    if (token) {
        await fetch(`${API_BASE_URL}/cart/${productId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity: newQuantity, size: size })
        });
        await loadCartFromBackend();
    } else {
        item.quantity = newQuantity;
        saveCart();
    }
    updateCartUI();
}
```

### Estados Visuales de Botones

**HTML con disabled dinámico**:
```javascript
<button class="btn-qty" onclick="updateQuantity(...)"
        ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
<button class="btn-qty" onclick="updateQuantity(...)"
        ${item.quantity >= item.stock ? 'disabled' : ''}>+</button>
```

**CSS**:
```css
.btn-qty:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: rgba(255, 255, 255, 0.05);
}
```

### Backend - CartController Actualizado

**Soporte para size en todas las operaciones**:

**destroy()** (líneas ~80-95):
```php
public function destroy(Request $request, $productId) {
    $data = $request->validate([
        'size' => 'required|string|in:XS,S,M,L,XL,XXL',
    ]);

    $cartItem = CartItem::where('user_id', $userId)
        ->where('product_id', $productId)
        ->where('size', $data['size'])
        ->firstOrFail();

    $cartItem->delete();
    return response()->json(['message' => 'Eliminado'], 200);
}
```

**update()** (líneas ~60-78):
```php
public function update(Request $request, $productId) {
    $data = $request->validate([
        'quantity' => 'required|integer|min:1',
        'size' => 'required|string|in:XS,S,M,L,XL,XXL',
    ]);

    // Validar stock de la talla específica
    $productSize = ProductSize::where('product_id', $productId)
        ->where('size', $data['size'])
        ->first();

    if ($data['quantity'] > $productSize->stock) {
        return response()->json([
            'message' => 'Stock insuficiente'
        ], 400);
    }

    $cartItem->update(['quantity' => $data['quantity']]);
}
```

### Migración de Tabla cart_items

**Constraint único actualizado**:
```php
$table->unique(['user_id', 'product_id', 'size']);
```

Esto permite que un mismo producto con diferentes tallas sean items separados en el carrito.

---

## 🎯 Optimizaciones de UX (v1.0.5)

### Botón "Añadir al Carrito" → "Seleccionar Talla"

**Problema anterior**:
- Botón intentaba añadir sin talla seleccionada
- Usuario confundido sobre cómo elegir talla

**Solución**:
- Botón ahora abre modal de producto directamente
- Texto cambiado a "Seleccionar Talla"
- `onclick="openProductModal(${product.id})"`

**Código** (app.js línea ~304-305):
```javascript
<button class="btn-add-cart"
        onclick="event.stopPropagation(); openProductModal(${product.id})"
        ${product.stock === 0 ? 'disabled' : ''}>
    ${product.stock === 0 ? 'Agotado' : 'Seleccionar Talla'}
</button>
```

### Cierre Automático de Modal

**Problema anterior**:
- Usuario añadía al carrito pero modal seguía abierto
- Tenía que cerrar manualmente

**Solución**:
- Modal se cierra automáticamente tras añadir al carrito
- Función `closeProductModal()` llamada después de `addToCart()`

**Código** (app.js línea ~487-488):
```javascript
async function addToCartWithSize(productId) {
    // ... código de validación
    await addToCart(productId, selectedSize);
    closeProductModal(); // ← Añadido
}
```

### Botón "Volver" → "Seguir Comprando"

**Checkout** (checkout.html línea 197):
- Antes: `<a href="javascript:history.back()">Volver</a>`
- Ahora: `<a href="/HTML/index.html">Seguir Comprando</a>`

**Ventaja**:
- Más claro el destino (tienda principal)
- No depende del historial del navegador

### Botón "Completar Pedido" → "Finalizar Pedido"

**Checkout** (checkout.html línea 194):
- Texto más profesional y común en e-commerce
- Actualizado también en mensajes de error (checkout.js línea 229)

### Eliminación de Stock en Botones de Talla

**Antes**:
- Botones mostraban "M - 10 uds" o "Agotado"
- Sobrecargaba visualmente

**Ahora**:
- Botones solo muestran la letra de talla
- Stock se muestra en display separado al seleccionar

**Código** (app.js línea ~407):
```javascript
// Línea eliminada:
// <span class="size-stock-label">${hasStock ? stock + ' uds' : 'Agotado'}</span>
```

---

## 🌱 Mejoras en Seeders (v1.0.5)

### Auto-creación de Tallas con Stock

**Problema anterior**:
- Después de `migrate:fresh --seed`, productos tenían stock general
- Pero no tenían registros en `product_sizes`
- Usuario no podía añadir al carrito (requiere talla específica)

**Solución**:
- ProductSeeder ahora crea automáticamente 6 registros de tallas por producto
- Stock se distribuye equitativamente entre las 6 tallas
- Resto va a la talla M

**Código** (ProductSeeder.php líneas ~30-50):
```php
$sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

foreach ($products as $productData) {
    $product = Product::create($productData);

    $totalStock = $productData['stock'];
    $stockPerSize = floor($totalStock / count($sizes));
    $remainder = $totalStock % count($sizes);

    foreach ($sizes as $size) {
        $sizeStock = $stockPerSize;

        // El resto va a la talla M
        if ($size === 'M' && $remainder > 0) {
            $sizeStock += $remainder;
        }

        ProductSize::create([
            'product_id' => $product->id,
            'size' => $size,
            'stock' => $sizeStock
        ]);
    }
}
```

**Ejemplo de distribución**:
```
Producto con stock 30:
- XS: 5 uds
- S: 5 uds
- M: 5 uds
- L: 5 uds
- XL: 5 uds
- XXL: 5 uds

Producto con stock 32:
- XS: 5 uds
- S: 5 uds
- M: 7 uds  ← Resto de 2 unidades
- L: 5 uds
- XL: 5 uds
- XXL: 5 uds
```

**Beneficio**:
- Después de seeder, todos los productos son completamente funcionales
- No se requiere configuración manual de tallas
- Sistema 100% operativo desde el primer `migrate:fresh --seed`

---

## 🎨 Sistema de Galería de Imágenes (v1.0.4)

### Funcionalidad
Cada producto puede tener dos imágenes:
- **Imagen Principal**: Primera imagen que se muestra
- **Imagen Secundaria**: Segunda imagen opcional

### Navegación
- **Botones**: Prev/Next para cambiar entre imágenes
- **Indicadores**: Puntos en la parte inferior que muestran la imagen actual
- **Click en indicador**: Navega directamente a esa imagen

### Implementación Backend
- Campo `image_secondary` en tabla `products`
- ProductController maneja ambas imágenes en store/update/destroy
- Eliminación automática de imágenes antiguas al actualizar

### Implementación Frontend
- Modal de producto con galería dinámica
- Funciones: `changeProductImage()`, `setProductImage()`, `updateProductImage()`
- CSS con botones glassmorphism y animaciones suaves

**Archivos modificados**:
- `backend/database/migrations/2025_11_11_104349_add_image_secondary_to_products_table.php`
- `backend/app/Models/Product.php:17`
- `backend/app/Http/Controllers/Api/ProductController.php:66-72, 145-158, 202-206`
- `frontend/JS/app.js:329-335, 342-364, 464-501`
- `frontend/CSS/styles.css:1101-1189`

---

## 👕 Sistema de Tallas y Stock por Talla (v1.0.4)

### Concepto
Cada producto puede tener stock específico para cada una de las 6 tallas disponibles: **XS, S, M, L, XL, XXL**

### Base de Datos

#### Tabla `product_sizes`
```sql
- id (bigint)
- product_id (bigint, foreign key)
- size (enum: XS, S, M, L, XL, XXL)
- stock (integer)
- timestamps
- unique(product_id, size)
- cascade delete
```

#### Modelo `ProductSize`
- Relación belongsTo con Product
- Fillable: product_id, size, stock

#### Modelo `Product`
- Relación hasMany con ProductSize
- Método: `sizes()`

### Panel Admin - Gestión de Stock

#### Campo "Stock General"
- Input numérico para aplicar el mismo stock a todas las tallas
- Listener automático que replica el valor a todos los inputs de talla
- Útil para productos nuevos con stock uniforme

#### Inputs Individuales por Talla
- Grid de 6 inputs (XS, S, M, L, XL, XXL)
- Cada input tiene su propio valor de stock
- Se envían como array JSON al backend: `[{size: 'M', stock: 10}, ...]`

#### Validación Backend
```php
'sizes' => 'nullable|array',
'sizes.*.size' => 'required|string|in:XS,S,M,L,XL,XXL',
'sizes.*.stock' => 'required|integer|min:0',
```

### Frontend Store - Selección de Tallas

#### Modal de Producto
- Selector visual con 6 botones de talla
- Cada botón muestra: **Talla + Stock disponible**
- Estados:
  - **Con stock**: Botón activo, muestra "X uds"
  - **Sin stock**: Botón rojo con texto tachado, muestra "Agotado", deshabilitado

#### Primera Talla Seleccionada
- Auto-selección de la primera talla con stock > 0
- Clase CSS `active` aplicada automáticamente
- Stock inicial mostrado en el display

#### Display Dinámico de Stock
- Elemento `#productStockDisplay` actualizado en tiempo real
- Al hacer click en cualquier talla, muestra su stock específico
- Función `selectSize(size, stock)` gestiona la actualización

### Sistema de Carrito por Talla

#### Identificación de Items
Los items del carrito se identifican por **ID de producto + Talla**:
```javascript
// Mismo producto con diferentes tallas = items separados
cart.find(item => item.id === productId && item.size === size)
```

#### Validación de Stock
Antes de añadir al carrito:
1. Busca el stock de la talla específica en `product.sizes`
2. Verifica que `stock > 0`
3. Comprueba que cantidad a añadir ≤ stock disponible
4. Muestra alerta específica si no hay stock: `"La talla M no tiene stock disponible"`

#### Actualización de Cantidades
- Botones +/- ahora incluyen parámetro de talla: `updateQuantity(id, size, change)`
- Función `removeFromCart()` también filtra por talla
- Display en carrito muestra: Nombre + "Talla X"

### Compatibilidad con Productos Antiguos

#### Productos sin Tallas Configuradas
Si `product.sizes` está vacío o `product.sizes.length === 0`:
- Todas las tallas muestran el stock general del producto
- Comportamiento legacy mantenido
- Migración gradual sin romper funcionalidad existente

### Estilos CSS

#### Tallas con Stock
```css
.size-option {
  background: rgba(30, 30, 30, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.1);
  /* Glassmorphism + hover effects */
}
```

#### Tallas sin Stock
```css
.size-option.out-of-stock {
  background: rgba(255, 68, 68, 0.2);
  border-color: rgba(255, 68, 68, 0.4);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
}

.size-option.out-of-stock .size-label {
  text-decoration: line-through;
}
```

### Flujo Completo

1. **Admin crea/edita producto**:
   - Opción A: Usar "Stock General" → todas las tallas con mismo stock
   - Opción B: Configurar stock individual por talla
   - Submit → JSON enviado al backend

2. **Backend procesa**:
   - Parsea JSON de tallas si viene como string
   - Valida estructura del array
   - Elimina tallas existentes (si update)
   - Crea registros en `product_sizes` para cada talla

3. **Cliente ve producto**:
   - API incluye `->with('sizes')` en respuesta
   - Frontend detecta si hay tallas configuradas
   - Renderiza botones con stock específico o general

4. **Cliente selecciona talla**:
   - Click en botón de talla
   - Función `selectSize(size, stock)` ejecutada
   - Stock display actualizado: "X unidades"
   - Variable global `window.selectedSizeStock` guardada

5. **Cliente añade al carrito**:
   - Verificación de stock de talla específica
   - Item añadido con: id, name, price, **size**, quantity, stock
   - Si ya existe item con mismo id+size → incrementa cantidad
   - Si es talla diferente → nuevo item en carrito

6. **Checkout**:
   - Cada item con su talla se procesa independientemente
   - Stock reducido por talla en backend (futura implementación)

### Archivos Modificados

**Backend**:
- `backend/database/migrations/2025_11_11_122012_create_product_sizes_table.php`
- `backend/app/Models/ProductSize.php` (nuevo)
- `backend/app/Models/Product.php:24`
- `backend/app/Http/Controllers/Api/ProductController.php:15-17, 23, 30-49, 77-94, 104-123, 165-183`

**Frontend**:
- `frontend/JS/admin.js` (formulario de producto, saveProduct)
- `frontend/JS/app.js:337-348, 383-411, 440-464, 504-549, 580-605, 623-641`
- `frontend/CSS/styles.css:1085-1099, size-stock-container, size-stock-item`

**Admin HTML**:
- `frontend/HTML/admin.html` (inputs de stock por talla)

---

## 🎒 Sistema de Accesorios sin Tallas (v1.0.7)

### Concepto
La categoría "Accesorios" (gorras, bolsos, mochilas, etc.) no requiere selección de tallas. Los productos se gestionan únicamente con stock general.

### Diferencias con Productos con Tallas

#### Productos Normales (Camisetas, Pantalones, etc.)
- Requieren selección de talla (XS, S, M, L, XL, XXL)
- Stock independiente por talla
- Mismo producto + diferentes tallas = items separados en carrito
- Display: "Producto X - Talla M"

#### Accesorios
- **NO** requieren selección de talla
- Stock general único
- Un solo item por producto en carrito
- Display: "Producto X" (sin mención de talla)

### Implementación Frontend - Tienda

#### Detección de Accesorios (`app.js:341`)
```javascript
const isAccessory = product.category_id === 5;
```

#### Modal de Producto (`app.js:383-417`)
```javascript
// Solo renderiza selector de tallas si NO es accesorio
${!isAccessory ? `
  <div class="size-selector-container">
    <!-- Selector de tallas XS-XXL -->
  </div>
` : ''}
```

#### Añadir al Carrito (`app.js:483-503`)
```javascript
async function addToCartWithSize(productId) {
    const product = allProducts.find(p => p.id === productId);
    const isAccessory = product && product.category_id === 5;

    let selectedSize = window.selectedSize || ...;

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
    closeProductModal();
}
```

#### Display en Carrito (`app.js:745`)
```javascript
// Solo muestra "Talla X" si la talla NO es 'N/A'
${item.size !== 'N/A' ? `<div class="cart-item-size">Talla ${item.size}</div>` : ''}
```

### Implementación Panel Admin

#### Función `toggleSizeInputs()` (`admin.js:403-428`)
Controla la visibilidad de los campos de tallas según la categoría:

```javascript
function toggleSizeInputs() {
    const selectedCategoryId = parseInt(categorySelect.value);
    const isAccessory = selectedCategoryId === 5;

    if (isAccessory) {
        // Ocultar sección de tallas
        sizeStockGroup.style.display = 'none';
        // Cambiar hint del stock general
        stockGeneralHint.textContent = '';
        // Hacer obligatorio el stock general
        stockAllInput.placeholder = 'Stock del producto';
        stockAllInput.required = true;
    } else {
        // Mostrar sección de tallas
        sizeStockGroup.style.display = 'block';
        // Restaurar hint
        stockGeneralHint.textContent = '(para todas las tallas)';
        // Hacer opcional el stock general
        stockAllInput.placeholder = 'Dejar vacío para configurar por talla';
        stockAllInput.required = false;
    }
}
```

**Event Listeners:**
- Al cargar modal: verifica categoría seleccionada
- Al cambiar categoría: ejecuta `toggleSizeInputs()`

#### Función `saveProduct()` (`admin.js:465-493`)
Maneja el guardado según tipo de producto:

```javascript
const isAccessory = parseInt(categoryId) === 5;

if (isAccessory) {
    // Para accesorios: usar solo el stock general
    const stockAll = document.getElementById('productStockAll').value;
    const totalStock = parseInt(stockAll) || 0;
    formData.append('stock', totalStock);
    // No enviar tallas para accesorios
    formData.append('sizes', JSON.stringify([]));
} else {
    // Para productos con tallas: recoger stock por talla
    // ... lógica existente
}
```

### Flujo Completo - Crear Accesorio

1. **Admin accede al panel**
   - Va a pestaña "Productos"
   - Click "Nuevo Producto"

2. **Formulario de producto**
   - Nombre: "Gorra Urbana Gris"
   - Categoría: **Accesorios** ← Al seleccionar
     - ❌ Desaparece sección "Stock por Talla"
     - ✅ Campo "Stock General" se vuelve obligatorio
     - ✅ Placeholder cambia a "Stock del producto"
   - Stock General: 25 (obligatorio)
   - Imagen: upload
   - Guardar

3. **Backend procesa**
   - Recibe: `stock: 25`, `sizes: []`, `category_id: 5`
   - Crea producto sin registros en `product_sizes`
   - Stock se guarda en campo `stock` del producto

4. **Cliente ve en tienda**
   - Navega a pestaña "Accesorios"
   - Click en "Gorra Urbana Gris"
   - Modal se abre **SIN selector de tallas**
   - Botón muestra "Añadir al Carrito" directamente

5. **Cliente añade al carrito**
   - Click "Añadir al Carrito"
   - No pide talla (se asigna 'N/A' internamente)
   - Item se añade: `{id: X, name: "Gorra...", size: 'N/A', ...}`

6. **Visualización en carrito**
   - Nombre del producto
   - **NO muestra "Talla X"**
   - Precio, cantidad, botones +/- normal

### Compatibilidad

#### Productos Existentes
- Productos de otras categorías mantienen funcionalidad completa de tallas
- No hay cambios en camisetas, pantalones, sudaderas, chaquetas

#### Migración de Datos
- No requiere migración de base de datos
- Campo `category_id` existente se usa para detección
- Campo `stock` existente se usa para accesorios

### Validaciones

**Frontend:**
- Si NO es accesorio + NO tiene talla → alerta "Por favor, selecciona una talla"
- Si es accesorio → omite validación de talla

**Backend:**
- Accesorios reciben `sizes: []` (array vacío)
- No se crean registros en tabla `product_sizes`
- Stock se maneja únicamente desde campo `product.stock`

### Archivos Modificados v1.0.7

**Frontend - Tienda:**
- `frontend/JS/app.js:341` - Detección de accesorios
- `frontend/JS/app.js:383-417` - Ocultar selector de tallas con condición
- `frontend/JS/app.js:483-503` - Lógica addToCartWithSize sin talla
- `frontend/JS/app.js:745` - Display condicional de talla en carrito

**Frontend - Admin:**
- `frontend/JS/admin.js:345-368` - IDs añadidos a grupos de stock
- `frontend/JS/admin.js:397-450` - Función toggleSizeInputs() + event listeners
- `frontend/JS/admin.js:465-493` - Lógica condicional en saveProduct()

### Casos de Uso

**Accesorios típicos:**
- Gorras / Sombreros
- Mochilas / Bolsos
- Cinturones (talla única)
- Carteras / Billeteras
- Gafas de sol
- Calcetines (pack único)
- Joyería / Accesorios

**Nota**: Si un accesorio SÍ requiere tallas (ej: guantes, calcetines por talla), se debe categorizar en otra categoría o crear una nueva.

---

## 📄 Licencia

Proyecto educativo / Demo

---

> **Nota**: Este es un proyecto de demostración. Para uso en producción, se deben implementar medidas adicionales de seguridad, optimización y escalabilidad.
