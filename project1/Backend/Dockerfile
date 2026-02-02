FROM node:20-slim

WORKDIR /app

# install openssl dependency to avoid runtime errors
RUN apt-get update -y && apt-get install -y openssl libssl3 && rm -rf /var/lib/apt/lists/*

# cpy dependency manifests
COPY package*.json ./
RUN npm ci

# copy source
COPY . .

# generate prisma cclient
RUN npx prisma generate

# build 
RUN npm run build

# expose port.
EXPOSE 3000

CMD ["node", "dist/server.js"]
