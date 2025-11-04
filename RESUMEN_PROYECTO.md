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
│   │       └── Order.php
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
- id, category_id, name, slug, description, price, size, stock, path, active

#### `orders`
- id, user_id, total, status, created_at

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

#### Órdenes
```
GET    /api/order              # Listar órdenes del usuario
POST   /api/order              # Crear orden
GET    /api/order/{id}         # Ver orden
PUT    /api/order/{id}         # Actualizar orden
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
POST   /api/product            # Crear
PUT    /api/product/{id}       # Actualizar
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
- ✅ Filtrado por categorías (tabs en navbar)
- ✅ Ordenamiento (precio, nombre)
- ✅ Badges de stock (últimas unidades, agotado)
- ✅ Modal de detalles de producto
- ✅ Carrito lateral (sidebar)
- ✅ LocalStorage para persistencia del carrito
- ✅ Gestión de cantidades (+-) con validación de stock
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
- ✅ Redirección automática según rol:
  - Admin → `/HTML/admin.html`
  - User → `/HTML/index.html` o URL de retorno
- ✅ Parámetro `?register=1` para mostrar form de registro
- ✅ Parámetro `?return=URL` para redirección post-login

### Checkout (`checkout.html`)

#### Funcionalidades
- ✅ Protegido: Requiere autenticación
- ✅ Formulario de información de envío
- ✅ Formulario de pago (solo visual, no procesa)
- ✅ Resumen de orden con productos del carrito
- ✅ Cálculo de totales
- ✅ Layout de 2 columnas (formulario + resumen)

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
- ✅ Tabla con listado (ID, nombre, categoría, precio, stock, talla, estado)
- ✅ Crear nuevo producto (modal con todos los campos)
- ✅ Editar producto (modal)
- ✅ Eliminar producto (confirmación)
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
**Versión**: 1.0.1
**Fecha**: Octubre 2025
**Stack**: Laravel 11 + Vanilla JS + Docker
**Última Actualización**: 30/10/2025

---

## 📄 Licencia

Proyecto educativo / Demo

---

> **Nota**: Este es un proyecto de demostración. Para uso en producción, se deben implementar medidas adicionales de seguridad, optimización y escalabilidad.
