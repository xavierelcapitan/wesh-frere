# Dashboard Administratif

Ce projet est un tableau de bord administratif pour gérer une application mobile.

## Technologies utilisées

- Next.js 14+ (App Router)
- Firebase Authentication
- Firebase Firestore
- Tailwind CSS
- ShadCN UI
- React Hook Form + Zod
- Recharts pour les visualisations

## Prérequis

- Node.js 18+ 
- pnpm

## Installation

1. Clonez le dépôt
2. Installez les dépendances avec pnpm :

```bash
pnpm install
```

3. Configurez vos variables d'environnement Firebase dans le fichier `.env.local` :

```
NEXT_PUBLIC_FIREBASE_API_KEY=votre_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id
```

## Utilisation

Pour démarrer le serveur de développement :

```bash
pnpm dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000).

## Fonctionnalités

- Authentification sécurisée avec Firebase
- Tableau de bord avec statistiques
- Visualisation de données avec graphiques
- Gestion des utilisateurs
- Paramètres du compte et préférences

## Structure du projet

- `/src/app` - Routes de l'application (App Router)
- `/src/components` - Composants réutilisables
- `/src/lib` - Utilitaires et configuration
- `/public` - Ressources statiques

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
