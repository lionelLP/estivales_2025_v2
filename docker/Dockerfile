FROM node:20-alpine

WORKDIR /app

# Installation de git
RUN apk add --no-cache git

# mettre à jour npm
RUN npm install -g npm@11

# Arguments pour le token GitLab
ARG GITLAB_TOKEN

# Configuration de git pour utiliser le token avec votre GitLab IUT
RUN git config --global url."https://oauth2:${GITLAB_TOKEN}@iutbg-gitlab.iutbourg.univ-lyon1.fr/".insteadOf "https://iutbg-gitlab.iutbourg.univ-lyon1.fr/"

# Créer le script d'entrée
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

CMD ["/usr/local/bin/entrypoint.sh"]