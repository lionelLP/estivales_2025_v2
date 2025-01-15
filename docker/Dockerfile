FROM node:18-alpine

WORKDIR /app

# Installation de git
RUN apk add --no-cache git

# Arguments pour le token GitLab
ARG GITLAB_TOKEN

# Configuration de git pour utiliser le token avec votre GitLab IUT
RUN git config --global url."https://oauth2:${GITLAB_TOKEN}@iutbg-gitlab.iutbourg.univ-lyon1.fr/".insteadOf "https://iutbg-gitlab.iutbourg.univ-lyon1.fr/"

# Cloner le projet avec l'URL complète
RUN git clone https://iutbg-gitlab.iutbourg.univ-lyon1.fr/sae-but31/2024-25-web/estivales-brou.git .

# Installer les dépendances
RUN npm install

# Garder le conteneur en vie
CMD ["sh", "-c", "tail -f /dev/null"]