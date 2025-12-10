# FVCKOFF - E-commerce Streetwear

Tienda online de streetwear premium con backend Laravel 11 y frontend JavaScript.

## Requisitos

- Docker Desktop
- Git

## Instalación

1. Clonar el repositorio
   ```bash
   git clone https://github.com/HectorFernandezRico/FuckOff.git
   ```

2. Dirigirse a la carpeta
   ```bash
   cd FuckOff
   ```

3. Levantar los contenedores
   ```bash
   docker-compose up -d
   ```

4. Inicializar la base de datos
   ```bash
   docker exec tienda_backend php artisan migrate:fresh --seed
   ```

## Acceso

| Servicio | URL |
|----------|-----|
| Tienda | http://localhost:8080 |
| Panel Admin | http://localhost:8080/HTML/admin.html |
| API | http://localhost:8000/api |

## Usuarios de Prueba

| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@example.com | password |
| Usuario | test@example.com | password |

## Tecnologías

- **Backend**: Laravel 11, PHP 8.2, MySQL 8.0, Sanctum
- **Frontend**: HTML5, CSS3, JavaScript
- **DevOps**: Docker, Docker Compose

## Autor

Héctor Fernández Rico - Trabajo Final de Grado (TFG)
