# FVCKOFF - E-commerce Streetwear

![Version](https://img.shields.io/badge/version-1.0.7-blue.svg)
![Laravel](https://img.shields.io/badge/Laravel-11.x-red.svg)
![PHP](https://img.shields.io/badge/PHP-8.2-purple.svg)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)

> Tienda online de streetwear premium con backend Laravel 11 y frontend vanilla JavaScript, completamente dockerizada.

**Trabajo Final de Grado (TFG)** - E-commerce completo con gestión de productos, carrito persistente, sistema de tallas, y panel de administración.

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)
- [Capturas](#-capturas)
- [Documentación](#-documentación)
- [Licencia](#-licencia)

---

## ✨ Características

### 🛍️ Tienda Online
- **Catálogo de productos** con sistema de categorías dinámicas
- **Filtrado por categorías** (Camisetas, Pantalones, Sudaderas, Chaquetas, Accesorios)
- **Sistema de tallas completo** (XS, S, M, L, XL, XXL) con stock independiente
- **Accesorios sin tallas** - Productos que no requieren selección de talla
- **Galería de imágenes** - Dos imágenes por producto con navegación
- **Carrito persistente** - LocalStorage para invitados, base de datos para usuarios autenticados
- **Sincronización automática** del carrito al hacer login
- **Checkout completo** con 3 métodos de envío y desglose de IVA

### 🔐 Autenticación
- **Laravel Sanctum** - Autenticación basada en tokens
- **Roles de usuario** - Admin y User con permisos diferenciados
- **Protección de rutas** - Frontend y backend

### 👤 Panel de Administración
- **CRUD completo** de Categorías, Productos, Usuarios y Órdenes
- **Gestión de stock por talla** - Control independiente de inventario
- **Upload de imágenes** - Soporte para imagen principal y secundaria
- **Sistema de accesorios** - Detección automática para productos sin tallas
- **Estados de órdenes** - Seguimiento completo del proceso de compra
- **Gestión automática de stock** - Reducción al crear orden, restauración al cancelar

### 🎨 Diseño
- **Glassmorphism UI** - Efectos de vidrio y blur modernos
- **Dark Theme** - Paleta Matte Black
- **Totalmente responsive** - Mobile-first approach
- **Animaciones suaves** - Transiciones con cubic-bezier

---

## 🚀 Tecnologías

### Backend
- **Laravel 11.x** - Framework PHP moderno
- **MySQL 8.0** - Base de datos relacional
- **Laravel Sanctum** - Autenticación API
- **PHP 8.2** - Lenguaje del lado del servidor

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Glassmorphism + Animaciones
- **JavaScript (Vanilla)** - ES6+ sin frameworks
- **Live Server** - Hot reload en desarrollo

### DevOps
- **Docker** - Containerización completa
- **Docker Compose** - Orquestación multi-contenedor
- **Nginx/PHP-FPM** - Servidor web optimizado

---

## 🔧 Instalación

### Requisitos Previos
- Docker Desktop instalado
- Git
- Puerto 8000 (backend) y 8080 (frontend) disponibles

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/FuckOff.git
   cd FuckOff
   ```

2. **Configurar variables de entorno**
   ```bash
   cd backend
   cp .env.example .env
   ```

3. **Levantar los contenedores**
   ```bash
   docker-compose up -d
   ```

4. **Instalar dependencias de Laravel**
   ```bash
   docker exec tienda_backend composer install
   ```

5. **Generar clave de aplicación**
   ```bash
   docker exec tienda_backend php artisan key:generate
   ```

6. **Ejecutar migraciones y seeders**
   ```bash
   docker exec tienda_backend php artisan migrate:fresh --seed
   ```

7. **Crear enlace simbólico de storage**
   ```bash
   docker exec tienda_backend php artisan storage:link
   ```

8. **Acceder a la aplicación**
   - **Tienda**: http://localhost:8080
   - **Panel Admin**: http://localhost:8080/HTML/admin.html
   - **API Backend**: http://localhost:8000/api

---

## 💻 Uso

### Usuarios de Prueba

#### Administrador
```
Email: admin@example.com
Password: password
```

#### Usuario Normal
```
Email: test@example.com
Password: password
```

### Comandos Útiles

**Ver logs del backend**
```bash
docker logs tienda_backend --tail 50
```

**Resetear base de datos**
```bash
docker exec tienda_backend php artisan migrate:fresh --seed
```

**Acceder al contenedor backend**
```bash
docker exec -it tienda_backend bash
```

**Ver usuarios en la base de datos**
```bash
docker exec tienda_backend php check_users.php
```

**Limpiar cachés de Laravel**
```bash
docker exec tienda_backend php artisan optimize:clear
```

**Acceder a MySQL directamente**
```bash
docker exec -it tienda_db mysql -u tienda_user -ptienda_pass tienda_db
```

---

## 📁 Estructura del Proyecto

```
FuckOff/
├── backend/                    # API Laravel 11
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── CartController.php
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
│   │       ├── ProductSize.php
│   │       ├── Order.php
│   │       └── CartItem.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   └── api.php
│   ├── .env
│   ├── Dockerfile
│   └── docker-entrypoint.sh
│
├── frontend/                   # SPA Vanilla JS
│   ├── HTML/
│   │   ├── index.html         # Tienda principal
│   │   ├── login.html         # Login/Registro
│   │   ├── checkout.html      # Checkout
│   │   ├── admin.html         # Panel Admin
│   │   ├── about.html         # Sobre Nosotros
│   │   ├── shipping.html      # Información de Envíos
│   │   ├── returns.html       # Política de Devoluciones
│   │   ├── contact.html       # Contacto
│   │   ├── privacy.html       # Política de Privacidad
│   │   ├── terms.html         # Términos y Condiciones
│   │   └── cookies.html       # Política de Cookies
│   ├── CSS/
│   │   └── styles.css         # ~3000 líneas - Glassmorphism
│   ├── JS/
│   │   ├── app.js             # Lógica tienda
│   │   ├── auth.js            # Login/Registro
│   │   ├── checkout.js        # Checkout
│   │   ├── admin.js           # Panel Admin
│   │   └── contact.js         # Formulario de contacto
│   └── IMG/                   # Imágenes de productos
│
├── docker-compose.yml          # Configuración Docker
├── README.md                   # Este archivo
└── RESUMEN_PROYECTO.md         # Documentación técnica completa
```

---

## 🔌 API Endpoints

### Autenticación
```http
POST   /api/register           # Registro de usuario
POST   /api/login              # Iniciar sesión
POST   /api/logout             # Cerrar sesión (requiere auth)
GET    /api/me                 # Obtener usuario actual (requiere auth)
```

### Categorías (públicas)
```http
GET    /api/category           # Listar todas
GET    /api/category/{id}      # Ver una
```

### Productos (públicos)
```http
GET    /api/product            # Listar todos
GET    /api/product/{id}       # Ver uno
```

### Carrito (requiere autenticación)
```http
GET    /api/cart                    # Obtener carrito del usuario
POST   /api/cart                    # Añadir producto al carrito
PUT    /api/cart/{productId}        # Actualizar cantidad
DELETE /api/cart/{productId}        # Eliminar producto del carrito
DELETE /api/cart                    # Vaciar carrito completo
POST   /api/cart/sync               # Sincronizar carrito desde localStorage
```

### Órdenes (requiere autenticación)
```http
GET    /api/order              # Listar órdenes del usuario
POST   /api/order              # Crear orden
GET    /api/order/{id}         # Ver orden
PUT    /api/order/{id}         # Actualizar orden
DELETE /api/order/{id}         # Eliminar orden
```

### Admin - Categorías (requiere rol admin)
```http
POST   /api/category           # Crear
PUT    /api/category/{id}      # Actualizar
DELETE /api/category/{id}      # Eliminar
```

### Admin - Productos (requiere rol admin)
```http
POST   /api/product            # Crear (con upload de imágenes)
PUT    /api/product/{id}       # Actualizar (con upload de imágenes)
DELETE /api/product/{id}       # Eliminar
```

### Admin - Usuarios (requiere rol admin)
```http
GET    /api/user               # Listar todos
POST   /api/user               # Crear
GET    /api/user/{id}          # Ver uno
PUT    /api/user/{id}          # Actualizar
DELETE /api/user/{id}          # Eliminar
```

---

## 📊 Base de Datos

### Tablas Principales

#### `users`
- id, name, email, password, role (user/admin)

#### `categories`
- id, name, slug

#### `products`
- id, category_id, name, slug, description, price, stock, path, image_secondary, active

#### `product_sizes`
- id, product_id, size (XS/S/M/L/XL/XXL), stock
- **Constraint**: unique(product_id, size)

#### `cart_items`
- id, user_id, product_id, size, quantity
- **Constraint**: unique(user_id, product_id, size)

#### `orders`
- id, user_id, total_price, subtotal, tax, shipping_cost, shipping_method, status, shipping_address

---

## 🎯 Características Destacadas

### Sistema de Tallas Inteligente
- **Productos con tallas**: Stock independiente por cada talla (XS-XXL)
- **Accesorios**: Detección automática de categoría para productos sin tallas
- **Carrito diferenciado**: Mismo producto + diferentes tallas = items separados

### Carrito Persistente Avanzado
- **Usuarios no autenticados**: Persistencia en localStorage
- **Usuarios autenticados**: Almacenamiento en base de datos
- **Sincronización automática**: Al hacer login, items de localStorage se sincronizan con BD
- **Restauración**: Al volver a iniciar sesión, carrito se recupera desde BD

### Sistema de Envío Dinámico
- **Envío Estándar**: 5€ (3-5 días)
- **Envío Express**: 8€ (24-48h) - Más popular
- **Envío Gratis**: Compras +75€
- **Habilitación automática**: Envío gratis se activa al alcanzar el mínimo
- **Cálculo en tiempo real**: Total se actualiza al cambiar método

### Gestión de Stock Automática
- **Al crear orden**: Stock se reduce automáticamente por talla
- **Al cancelar orden**: Stock se restaura + bonus de 1 unidad
- **Validación**: No permite crear orden si no hay stock suficiente
- **Productos inactivos**: No se pueden añadir al carrito ni comprar

---

## 📸 Capturas

### Tienda Principal
- Hero section con llamado a la acción
- Grid responsive de productos
- Filtrado por categorías
- Modal de producto con galería de imágenes
- Selector de tallas con stock en tiempo real

### Panel de Administración
- Dashboard con 4 pestañas principales
- Gestión completa de productos con upload de imágenes
- Sistema de stock por talla
- Gestión de órdenes con estados
- Interfaz glassmorphism moderna

### Checkout
- Formulario de información de envío
- Selección de método de envío
- Resumen de orden con desglose de IVA
- Formulario de pago (visual)

---

## 📚 Documentación

Para documentación técnica completa, consulta:
- **[RESUMEN_PROYECTO.md](RESUMEN_PROYECTO.md)** - Documentación técnica exhaustiva (2340+ líneas)

Incluye:
- Guía de instalación detallada
- Arquitectura del sistema
- Explicación de todas las funcionalidades
- Códigos de ejemplo
- Problemas resueltos
- Historial de cambios por versión

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
- Hash de contraseñas con bcrypt
- Tokens únicos por usuario (Sanctum)
- CORS habilitado para desarrollo
- Validación de productos activos en carrito y checkout

---

## 🐛 Problemas Conocidos

### Limitaciones de Desarrollo
- Servidor PHP built-in (solo para desarrollo)
- Sin paginación en listings
- Checkout visual (no integra pasarelas de pago reales)
- Imágenes de productos son emojis/placeholders en seeders

### Para Producción
Se recomienda:
- Usar Laravel Octane (RoadRunner/Swoole) o PHP-FPM + Nginx
- Implementar Redis para caché y sesiones
- Agregar paginación a todas las listas
- Implementar búsqueda de productos
- Integrar pasarela de pago real (Stripe, PayPal)
- Subir imágenes reales optimizadas
- Implementar CDN para assets
- Agregar rate limiting a la API
- Configurar SSL/HTTPS

---

## 🛠️ Desarrollo

### Comandos Artisan Útiles

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

### Estructura de Docker

**Servicios:**
1. **db** (MySQL 8.0) - Puerto 3307:3306
2. **backend** (Laravel 11 + PHP 8.2) - Puerto 8000
3. **frontend** (Live Server) - Puerto 8080

---

## 📝 Changelog

### v1.0.7 (29/11/2025)
- ✅ Sistema de Accesorios sin Tallas
- ✅ Detección automática de categoría
- ✅ UI simplificada para productos sin talla

### v1.0.6 (24/11/2025)
- ✅ Validación completa de productos inactivos
- ✅ Corrección de visualización de stock en admin

### v1.0.5 (18/11/2025)
- ✅ 7 páginas informativas y legales
- ✅ Sistema de métodos de envío en checkout
- ✅ Mejoras en carrito de compras

### v1.0.4 (11/11/2025)
- ✅ Sistema de galería de imágenes
- ✅ Sistema de tallas completo
- ✅ Stock por talla independiente

### v1.0.3 (05/11/2025)
- ✅ Corrección error fatal en checkout
- ✅ Rediseño UI de autenticación
- ✅ Fix Docker build con symlinks

---

## 👨‍💻 Autor

**Héctor** - Trabajo Final de Grado

---

## 📄 Licencia

Este proyecto es un **proyecto educativo / demo** desarrollado como Trabajo Final de Grado (TFG).

No está destinado para uso comercial en su estado actual. Para uso en producción, se deben implementar medidas adicionales de seguridad, optimización y escalabilidad.

---

## 🙏 Agradecimientos

- Laravel por el framework excepcional
- Docker por simplificar el desarrollo
- La comunidad de GitHub por las herramientas y recursos

---

## 📧 Contacto

Para preguntas o sugerencias sobre este proyecto académico:
- GitHub: [Crear un issue](https://github.com/tu-usuario/FuckOff/issues)

---

**⭐ Si este proyecto te ha sido útil como referencia, considera darle una estrella en GitHub**
