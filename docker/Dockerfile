FROM node:18-alpine

WORKDIR /app

# Installation de git
RUN apk add --no-cache git

# Arguments pour le token GitLab
ARG GITLAB_TOKEN

# Configuration de git pour utiliser le token avec votre GitLab IUT
RUN git config --global url."https://oauth2:${GITLAB_TOKEN}@iutbg-gitlab.iutbourg.univ-lyon1.fr/".insteadOf "https://iutbg-gitlab.iutbourg.univ-lyon1.fr/"

# si le dossier .git existe, c'est que le projet est déjà cloné
RUN if [ -d "/app/.git" ]; then echo "Le projet existe déjà, mise à jour..."; git pull; else echo "Clonage du projet..."; git clone https://iutbg-gitlab.iutbourg.univ-lyon1.fr/sae-but31/2024-25-web/estivales-brou.git .; fi

RUN npm install --os=linux --libc=musl --cpu=arm64 sharp

RUN npm run build 

CMD ["npm", "run", "start"]

