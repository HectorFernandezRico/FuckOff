# FVCKOFF - E-commerce Streetwear

Tienda online de streetwear premium con backend Laravel 11 y frontend vanilla JavaScript.

## Requisitos

- Docker Desktop
- Git

## Instalación

<<<<<<< HEAD
=======
1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/HectorFernandezRico/FuckOff.git
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
>>>>>>> 25aefc4e377a2fd42583319d6b25b8f30991dd9e
```bash
git clone https://github.com/tu-usuario/FuckOff.git
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
