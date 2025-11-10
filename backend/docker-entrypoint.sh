#!/bin/sh
set -e

cd /var/www/html

# Si el volumen montado oculta vendor, instalar dependencias
if [ ! -f vendor/autoload.php ]; then
  echo "vendor not found — installing composer dependencies..."
  composer install --no-interaction --prefer-dist --no-scripts
fi

# Crear enlace simbólico de storage si no existe
if [ ! -L public/storage ]; then
  echo "Creating storage symlink..."
  php artisan storage:link
fi

# Arrancar artisan serve si está habilitado (DEV)
if [ "${ARTISAN_SERVE}" = "1" ]; then
  echo "Starting PHP built-in server with multiple workers on 0.0.0.0:${ARTISAN_PORT}"
  export PHP_CLI_SERVER_WORKERS=10
  exec php -S 0.0.0.0:${ARTISAN_PORT} -t public
fi

# Por defecto ejecutar el comando CMD (php-fpm)
exec "$@"

#Instala el vendor si falta y configura OPcache para el desarrollo.
