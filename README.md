## Utilisation

Survoler l'icone de l'utilisateur en haut à droite de l'écran. Puis cliquer sur "Se connecter".

![Illustration se conecter](README/image-2.png)

Connectez-vous à l'application avec l'utilisateur admin (admin@admin.com) et le mot de passe admin (tR&^3&IanGX#sVaqK^V&CZwWq#RbMbwM@1O1!Nr).

A votre première connexion, vous devrez modifier votre mot de passe et le mail de l'administrateur.

Une fois votre mot de passe et votre mail modifié, vous pourrez accéder au panneau d'administration en survolant l'icone de l'utilisateur en haut à droite de l'écran. Puis cliquer sur "Panneau d'administration".

![alt text](README/image-3.png)

### Panneau d'administration

Sur la page d'accueil du panneau d'administration, vous verrez les différentes catégories. Ces sections sont aussi accessibles depuis le menu à gauche de l'écran.

#### Partenaires

La section "Partenaires" est destinée à inquer aux utilisateur les potentielles collaborations que vou avez avec certaines entreprises/institutions.

![Illustration partenaires](README/image-4.png)

Dans la section "Partenaires" sur chaque elements vous avez un icone de corbeille et de pinceau qui permet la suppression de l'élément ainsi que la modification de l'élément.

![alt text](README/image-11.png)

Et pour ajouter un partenaire il suffit de cliquer sur le bouton "Ajouter un partenaire" en haut à droite, puis de remplir le formulaire.

![alt text](README/image-12.png)

#### A propos

La section "A propos" est un espace dans lequel vous pouvez vous présenter plus en détail. Vous pouvez utiliser cet espace comme bon vous semble.

![A propos](README/image-5.png)

Dans la section "A propos" ecriver ce que vous souhaitez et utiliser la barre de mise en forme pour mettre en forme votre texte.

![alt text](README/image-13.png)

#### Evenements

Le nerf de la guerre, c'est ici que vous allez pouvoir ajouter, modifier ou supprimer des événements.

![Evenements](README/image-6.png)

Dans la section "Evenements" vous pouvez ajouter un évènement en cliquant sur le bouton "Ajouter un évènement" en haut à droite, puis remplir le formulaire.

![alt text](README/image-14.png)

Vous pouvez également modifier et supprimer un évènement en cliquant sur l'icone de pinceau ou de corbeille sur l'évènement que vous souhaitez modifier ou supprimer.

![alt text](README/image-15.png)

#### Revue de presse

La section "Revue de presse" vous permet de mettre en avant des articles de journeax qui vous concernent ou qui vous semblent pertinents

![Revue de presse](README/image-7.png)

Pour la revue de presse, collez simplement le lien de l'article dans le champ "URL de l'article" et cliquez sur "Extraire".

![alt text](README/image-16.png)

Une fois l'extraction terminée, vous verrez les informations de l'article extraite automatiquement, ces informations peuvent etre modifiées manuellement.

![alt text](README/image-17.png)

#### Utilisateurs

C'est ici que vous allez pouvoir créer un compte administrateur. !!! Un administrateur possède les droits les plus élever sur le site, il doit être attribué avec considération à une personne de confiance totale dont le rôle est d'éditer sur le site. !!!

![Utilisateurs](README/image-9.png)

Pour crée un nouvelle utilisateur, il suffit de remplire le formulaire et de cliquer sur "Créer".

Attention l'utilisateur doit avoir un mot de passe d'au moins 14 caractères, possedantune majuscule et un caractère spécial. Ce mot de passe pouras bien sur être modifié par l'utilisateur.

#### Gestion des medias

Cette section permet de supprimer manuellement chaque photo, elle permet également d'assigner des photos au carrousel de la page d'accueil.

![Revue de presse](README/image-8.png)

Dans la page medias vous pouvez voir tous les medias qui on été ajouter via des evennements. Si vous cliquer sur le petit coeur, vous pourrez ajouter le media à votre favoris. Ajouter un media à votre favoris permet de le voir dans le carrousel de la page d'accueil.

![alt text](README/image-18.png)

![alt text](README/image-19.png)

#### Newsletter

Dans la sections vous pouvez envoyer une newsletter à tous les utilisateurs qui ce sont inscrit à la newsletter.

![alt text](README/image-10.png)

Pour rappelle une newsletter est egalement envoyé par mail à chaque nouvelle création d'évènement.

#### Mentions légales

![alt text](README/image-20.png)

Dans la section "Mentions légales" vous pouvez écrire vos mentions légales et les afficher sur la page d'accueil.

### Interface utilisateur

## En cas de problème

Si vous rencontrez un problème, veuillez contacter bastien.desprez@etu.univ-lyon1.fr, valentin.goux@etu.univ-lyon1.fr, benjamin.brajon@etu.univ-lyon1.fr ou antoine.ducolomb@etu.univ-lyon1.fr.

# Documentation Technique - Projet Estivales de Brou

## Table des matières

1. [Architecture du projet](#architecture-du-projet)
2. [Configuration et Installation](#configuration-et-installation)
3. [Structure de la base de données](#structure-de-la-base-de-données)
4. [Authentification](#authentification)
5. [Gestion des fichiers](#gestion-des-fichiers)
6. [API Routes](#api-routes)
7. [Composants principaux](#composants-principaux)

## Architecture du projet

Le projet est construit avec :

- Next.js (Framework React)
- MySQL (Base de données)
- Docker (Conteneurisation)
- TypeScript

### Structure des dossiers

```
.
├── app/
│   ├── api/           # Routes API
│   ├── admin/         # Pages d'administration
│   ├── components/    # Composants réutilisables
│   └── ...           # Autres pages et fonctionnalités
├── docker/           # Configuration Docker
├── lib/             # Utilitaires et configurations
└── public/          # Fichiers statiques
```

## Configuration et Installation

### Prérequis

- Docker et Docker Compose
- Node.js 18+
- Git

### Installation

1. Cloner le projet :

```bash
git clone https://iutbg-gitlab.iutbourg.univ-lyon1.fr/sae-but31/2024-25-web/estivales-brou.git
```

2. Configuration des variables d'environnement :

```bash
# Copier le fichier d'exemple
cp .env.example .env
```

Voici le contenu complet du fichier `.env` à configurer :

```bash
# Configuration GitLab
GITLAB_TOKEN=     # Votre token d'accès GitLab

# Configuration de la base de données
DB_HOST=db        # Nom du service dans docker-compose
DB_USER=          # Votre nom d'utilisateur MySQL
DB_PASSWORD=      # Votre mot de passe MySQL
DB_NAME=          # Nom de votre base de données

# Configuration phpMyAdmin
MYSQL_ROOT_PASSWORD=  # Mot de passe root MySQL
MYSQL_DATABASE=       # Même nom que DB_NAME
MYSQL_USER=          # Même nom que DB_USER
MYSQL_PASSWORD=      # Même mot de passe que DB_PASSWORD
PMA_HOST=db          # Même valeur que DB_HOST
PMA_USER=            # Même nom que DB_USER
PMA_PASSWORD=        # Même mot de passe que DB_PASSWORD

# Configuration SMTP pour l'envoi d'emails
SMTP_HOST=        # Exemple : smtp.gmail.com
SMTP_PORT=        # Exemple : 587 pour TLS
SMTP_SECURE=      # true pour SSL, false pour TLS
SMTP_USER=        # Votre adresse email
SMTP_PASSWORD=    # Votre mot de passe SMTP
SMTP_FROM=        # Adresse d'envoi des emails
CONTACT_EMAIL=    # Adresse de réception des formulaires de contact

# Configuration du site
NEXT_PUBLIC_BASE_URL=  # URL complète de votre site (https://votre-domaine.com)

# Sécurité
JWT_SECRET=       # Chaîne aléatoire pour sécuriser les tokens
```

### Guide de configuration

#### 1. Base de données

La base de données est configurée via Docker. Assurez-vous que les variables DB*\* et MYSQL*\* correspondent entre elles. Le `DB_HOST` doit être `db` car c'est le nom du service dans le docker-compose.

#### 2. Serveur SMTP

Pour configurer l'envoi d'emails, vous avez plusieurs options :

**Avec Gmail :**

1. Activez l'authentification à deux facteurs sur votre compte Google
2. Générez un "mot de passe d'application" dans les paramètres de sécurité
3. Utilisez ce mot de passe comme `SMTP_PASSWORD`
4. Configurez les variables :
   - SMTP_HOST=smtp.gmail.com
   - SMTP_PORT=587
   - SMTP_SECURE=false

Autres services disponibles : SendGrid, Amazon SES, etc.

#### 3. URL du site

Le `NEXT_PUBLIC_BASE_URL` doit être l'URL complète de votre site, incluant le protocole https://. Par exemple : https://estivales-brou.fr

#### 4. Sécurité

Pour générer une chaîne aléatoire sécurisée pour `JWT_SECRET`, utilisez la commande :

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

3. Lancement avec Docker :

```bash
docker compose up -d
```

## Structure de la base de données

### Tables principales

- `User` : Gestion des utilisateurs
- `Event` : Événements
- `Partenaire` : Partenaires
- `PasswordReset` : Réinitialisation des mots de passe

### Types d'utilisateurs

- Admin (userType = 0)
- Utilisateur standard (userType = 1)

## Authentification

Le système d'authentification utilise JWT (JSON Web Tokens).

## Gestion des fichiers

### Upload d'images

Les images sont stockées dans le dossier `public/uploads/` avec des sous-dossiers spécifiques :

- `partners/` : Images des partenaires
- `events/` : Images des événements

## API Routes

### Points d'entrée principaux

- `/api/auth/*` : Authentification et gestion des utilisateurs
- `/api/events/*` : Gestion des événements
- `/api/partenaires/*` : Gestion des partenaires
- `/api/about/*` : Gestion du contenu "À propos"

### Middleware d'authentification

Toutes les routes protégées utilisent un middleware de vérification du token JWT.

## Sécurité

### Protection des routes

Toutes les routes administratives sont protégées par vérification du token et du type d'utilisateur.
