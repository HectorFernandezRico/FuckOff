
FROM node:16-alpine

WORKDIR /app

# Instala live-server globalmente para hot-reload
RUN npm install -g live-server

# Copia package.json primero para aprovechar cache (si existe)
COPY package*.json ./
RUN if [ -f package.json ]; then npm install --silent; fi

# Copia el resto del proyecto (en dev montarás el volumen para editar en host)
COPY . .

EXPOSE 8080

# Live-server en modo watch, sin abrir navegador desde el contenedor
CMD ["live-server", "--host=0.0.0.0", "--port=8080", "--watch=.", "--no-browser"]
