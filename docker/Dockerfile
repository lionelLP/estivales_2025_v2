FROM node:18-alpine

WORKDIR /app

# Copie des fichiers du projet depuis le contexte local
COPY . .

# Installation des dépendances
RUN npm install --os=linux --libc=musl sharp

# Construction de l'application
RUN npm run build 

# Démarrage de l'application
CMD ["npm", "run", "start"]

