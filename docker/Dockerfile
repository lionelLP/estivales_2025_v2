FROM node:18-alpine

WORKDIR /app

# Installation de git
RUN apk add --no-cache git

# Arguments pour le token GitLab
ARG GITLAB_TOKEN

# Configuration de git pour utiliser le token avec votre GitLab IUT
RUN git config --global url."https://oauth2:${GITLAB_TOKEN}@iutbg-gitlab.iutbourg.univ-lyon1.fr/".insteadOf "https://iutbg-gitlab.iutbourg.univ-lyon1.fr/"

# Créer le script d'entrée
COPY <<'EOF' /entrypoint.sh
#!/bin/sh
if [ -d "/app/node_modules" ]; then
    echo "Le projet existe déjà"
else
    echo "Clonage du projet..."
    git clone https://iutbg-gitlab.iutbourg.univ-lyon1.fr/sae-but31/2024-25-web/estivales-brou.git .
    npm install
fi
tail -f /dev/null
EOF

# Rendre le script exécutable
RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]