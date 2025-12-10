# FVCKOFF - E-commerce Streetwear

Tienda online de streetwear premium con backend Laravel 11 y frontend vanilla JavaScript.

## Requisitos

- Docker Desktop
- Git

## Instalación

```bash
git clone https://github.com/HectorFernandezRico/FuckOff.git
cd FuckOff
docker-compose up -d
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
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **DevOps**: Docker, Docker Compose

## Comandos Útiles

```bash
# Resetear base de datos
docker exec tienda_backend php artisan migrate:fresh --seed

# Ver logs
docker logs tienda_backend --tail 50

# Limpiar cachés
docker exec tienda_backend php artisan optimize:clear
```

## Autor

Héctor - Trabajo Final de Grado
