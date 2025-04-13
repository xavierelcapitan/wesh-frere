# Admin Dashboard - Wesh Frère

Tableau de bord administratif pour l'application Wesh Frère.

## Technologies Utilisées

- Next.js 15
- React 19
- Firebase (Authentication, Firestore)
- TailwindCSS
- TypeScript

## Fonctionnalités

- Gestion des utilisateurs
- Modération des commentaires
- Gestion des suggestions
- Administration des mots
- Statistiques et analytics

## Démarrage Rapide

### Prérequis

- Node.js (version 18.x ou supérieure)
- pnpm (version 8.x ou supérieure)

### Installation

1. Clonez le dépôt
   ```bash
   git clone https://github.com/xavierelcapitan/wesh-frere.git
   cd wesh-frere/admin-dashboard
   ```

2. Installez les dépendances
   ```bash
   pnpm install
   ```

3. Configurez les variables d'environnement
   Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

4. Lancez le serveur de développement
   ```bash
   pnpm dev
   ```

5. Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Déploiement sur Vercel

### Méthode 1: Via l'Interface Vercel

1. Connectez-vous à [Vercel](https://vercel.com/)
2. Cliquez sur "New Project" et importez votre dépôt GitHub
3. Sélectionnez le répertoire `admin-dashboard`
4. Configurez les variables d'environnement dans l'interface Vercel
5. Cliquez sur "Deploy"

### Méthode 2: Via Vercel CLI

1. Installez Vercel CLI
   ```bash
   pnpm install -g vercel
   ```

2. Connectez-vous à votre compte Vercel
   ```bash
   vercel login
   ```

3. Déployez l'application
   ```bash
   cd admin-dashboard
   vercel
   ```

4. Pour un déploiement en production
   ```bash
   vercel --prod
   ```

### Configuration de Firebase pour la Production

1. Assurez-vous d'avoir configuré les règles de sécurité Firestore appropriées
2. Activez uniquement les fournisseurs d'authentification nécessaires
3. Configurez les domaines autorisés dans Firebase Authentication

## Structure du Projet

```
admin-dashboard/
├── public/         # Fichiers statiques
├── src/
│   ├── app/        # Pages et routes Next.js
│   ├── components/ # Composants React réutilisables
│   ├── lib/        # Bibliothèques et configurations
│   └── services/   # Services Firebase et API
├── .env.local      # Variables d'environnement locales
└── vercel.json     # Configuration Vercel
```

## Sécurité

- Assurez-vous que votre fichier `.env.local` n'est pas commité dans le dépôt
- Utilisez des règles Firestore restrictives en production
- Limitez l'accès administrateur aux comptes vérifiés

## Licence

Ce projet est sous licence privée et n'est pas destiné à être distribué ou utilisé sans autorisation.
