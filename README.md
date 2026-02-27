# Urban Diaries

Urban Diaries is a production-ready journaling web application focused on fast writing, autosave reliability, mood/context tracking, and Google-only authentication.

## Project Overview

- Multi-session rich-text journaling dashboard
- Inline image support with resize/drag controls in the editor
- Debounced autosave backed by Firestore
- Google Auth only access model
- Admin access flow backed by Firebase Functions custom claims
- Responsive landing page and dashboard

## Tech Stack

- React 18
- TypeScript + Vite 6
- Tailwind CSS 4
- Firebase Auth, Firestore, Functions
- Firebase Hosting
- Tiptap editor

## Updated Source Structure

```text
src/
  components/
  pages/
  hooks/
  utils/
  styles/
  assets/
  services/
  App.tsx
  routes.tsx
  main.tsx
```

## Setup

1. Install dependencies:

```bash
npm install
npm install --prefix functions
```

2. Create root env file:

```bash
cp .env.example .env.local
```

3. Create functions env file:

```bash
cp functions/.env.example functions/.env
```

4. Start development server:

```bash
npm run dev
```

## Environment Variables

Root `.env.local`:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_FUNCTIONS_REGION=us-central1
```

Functions `functions/.env`:

```env
ADMIN_PASSWORD=your_strong_admin_password
ADMIN_EMAIL=your-google-account@gmail.com
```

## Firebase Setup

1. Create/select a Firebase project.
2. Add a web app and copy config values into `.env.local`.
3. Enable Authentication with Google provider.
4. Create Firestore database.
5. Deploy Firestore rules from `firestore.rules`.
6. Configure Functions runtime env (`functions/.env`) and deploy functions.
7. In Authentication -> Authorized domains, include your hosting domains.

## Commands

- `npm run dev` - start Vite dev server
- `npm run build` - create production build
- `npm run preview` - preview production build
- `firebase emulators:start --only functions` - run functions emulator (from `functions/`)
- `firebase deploy --only hosting,functions,firestore:rules` - deploy app

## Deployment

1. Build frontend:

```bash
npm run build
```

2. Deploy:

```bash
firebase deploy --only hosting,functions,firestore:rules
```

3. Verify:

- Google sign-in works in production
- Dashboard sessions load/create/delete correctly
- Autosave status transitions to `Saved`
