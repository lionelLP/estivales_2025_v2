#!/bin/sh
cd /app || exit 1

if [ -d ".git" ]; then
    echo "Le projet existe déjà, mise à jour..."
    git pull
else
    echo "Clonage du projet..."
    git clone https://iutbg-gitlab.iutbourg.univ-lyon1.fr/sae-but31/2024-25-web/estivales-brou.git .
fi

echo "Installation des dépendances..."
npm install --os=linux --libc=musl sharp

echo "Correction des vulnérabilités..."
npm audit fix || echo "⚠ Certaines vulnérabilités nécessitent --force"

# Supprimer cache Next.js pour build propre
rm -rf .next

echo "Build du projet..."
npm run build

echo "Sitemap..."
npm run sitemap || echo "⚠ Pas de script sitemap trouvé."

echo "Démarrage..."
npm run start