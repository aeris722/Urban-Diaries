# Urban Diaries

A journaling web app built with React + Vite + Firebase.

## Live Site

- https://urban-diaries.web.app

## Tech Stack

- React 18
- Vite 6
- Firebase Authentication
- Firestore
- Firebase Hosting

## 1. Install and Run Locally

```bash
npm install
npm run dev
```

Open the local URL shown in terminal (usually `http://localhost:5173`).

## 2. Firebase Setup (Console)

1. Create/select a Firebase project.
2. Add a **Web App**.
3. Enable **Authentication**:
- Email/Password
- Google (optional but used in this app)
4. Create a **Firestore Database**.

## 3. Environment Variables

Create a file named `.env.local` in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Notes:
- Do not commit `.env.local`.
- This repo includes `.env.example` as a template.

## 4. Firebase Hosting Init (One-Time)

If not already initialized:

```bash
firebase login
firebase init hosting
```

Choose:
- Use existing project
- Your Firebase project
- Public directory: `dist`
- Single-page app rewrite: `Yes`
- GitHub deploy setup: `No`
- Overwrite `index.html`: `No`

## 5. Deploy

```bash
npm run build
firebase deploy --only hosting
```

## 6. Common Issue

If site deploys but Google login fails:

1. Firebase Console -> Authentication -> Settings -> Authorized domains
2. Add:
- `urban-diaries.web.app`
- `urban-diaries.firebaseapp.com`

## Scripts

- `npm run dev` - run dev server
- `npm run build` - production build
- `npm run preview` - preview production build locally
