FROM node:20-alpine

# Instalar OpenSSL para generar certificados
RUN apk add --no-cache openssl

WORKDIR /app

# Copiar dependencias y instalar
COPY package.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Generar certificados autofirmados automáticamente al construir
RUN mkdir -p certs && \
    openssl req -x509 -newkey rsa:4096 \
      -keyout certs/key.pem \
      -out certs/cert.pem \
      -days 365 -nodes \
      -subj "/CN=localhost" \
      2>/dev/null

# Crear carpeta de uploads
RUN mkdir -p uploads

EXPOSE 3000

CMD ["node", "app.js"]