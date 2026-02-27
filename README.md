# Urban Diaries

Urban Diaries is a calm, writing-first journaling web app built for fast capture, reflection, and reliable autosave.

## What It Offers

- Rich-text journaling with image support
- Multi-session writing workflow
- Debounced autosave to Firestore
- Mood + context metadata (location/weather)
- Mobile-friendly responsive experience
- Google sign-in

## Tech Stack

- React 18
- TypeScript + Vite 6
- Tailwind CSS 4
- Firebase Auth, Firestore, Functions
- Firebase Hosting
- Tiptap editor

## Project Structure

```text
src/
  components/
  pages/
  hooks/
  utils/
  styles/
  services/
  App.tsx
  routes.tsx
  main.tsx
```

## Quick Start

```bash
npm install
npm install --prefix functions
cp .env.example .env.local
npm run dev
```

## Environment Variables

Create `.env.local` from `.env.example` and set:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_FUNCTIONS_REGION=us-central1
```

## Firebase Setup

1. Create/select a Firebase project.
2. Add a Firebase web app and copy credentials to `.env.local`.
3. Enable Google Authentication.
4. Create Firestore and deploy `firestore.rules`.
5. Add your hosting domain(s) in Firebase Auth authorized domains.

## Commands

- `npm run dev` - start local development
- `npm run build` - build production assets to `dist`
- `npm run preview` - preview production build locally
- `firebase deploy --only hosting,functions,firestore:rules` - deploy app

## Deployment Notes

- Hosting is configured with a predeploy build step (`npm run build`), so deploys publish fresh `dist` output.
- After deploy, hard refresh (`Ctrl+F5`) if your browser caches old static assets.

## Performance + UX Notes

Recent improvements include:

- Reduced heavy blur/animation load on mobile
- Better hero CTA sizing and readability
- Improved small-screen spacing and section flow
- Warm, low-contrast visual effects tuned for comfort
