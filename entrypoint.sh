#!/bin/sh
if [ -d "/app/.git" ]; then
    echo "Le projet existe déjà, mise à jour..."
    git pull
    npm install --os=linux --libc=musl sharp
else
    echo "Clonage du projet..."
    git clone https://iutbg-gitlab.iutbourg.univ-lyon1.fr/sae-but31/2024-25-web/estivales-brou.git .
    npm install --os=linux --libc=musl sharp
fi
npm run build
npm run sitemap
npm run dev