# PowerTask

**Lightweight study & task planner** — plan tasks, organize roadmaps, and timebox learning topics with a simple List ↔ Roadmap flow.

**Links**
- 🔖 Latest release: [v0.9.0 – MVP](https://github.com/Wichern94/To-do-App/releases/tag/v0.9.0)
- 🚀 Live demo: https://pwr-tsk.web.app

---

## Overview
PowerTask helps you learn more effectively: track topics, measure time spent, and organize work into tasks or roadmap nodes. The MVP focuses on a clean UX, per-user data isolation (Firebase), and reliable session handling.

## Features
- **Tasks List** – create, edit, delete tasks.
- **Roadmaps** – pick a roadmap and manage its nodes/items.
- **Import** – bulk add multiple nodes/items in one go.
- **Timeboxing for study** – track/allocate time per topic.
- **Auth** – Email/Password sign-in & password reset.
- **Session hygiene** – no cross-account “ghost” data; hard reload on logout.
- **Deterministic UI** – app always starts in **List** mode after sign-in.

## Tech stack
- **Language/UI:** Vanilla JavaScript (ES modules), HTML, SCSS
- **BaaS:** Firebase **Authentication** (Email/Password), **Cloud Firestore** (per-user subtrees under `/users/{uid}/…`)
- **Libraries:** Firebase JS SDK, **Toastify.js** (notifications), **JS PLUMB**, **ANIMATE.CSS**, **ANIME.js**, **CANVAS-CONFETTI**

---

## Getting started (local)

### 1) Firebase setup
- Create a Firebase project.
- **Authentication → Sign-in method:** enable **Email/Password**.
- **Authentication → Authorized domains:** add your local/dev or hosting domain.
- **Firestore:** create a database.

<details>
<summary>Firestore rules (MVP)</summary>

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function isOwner(userId) { return isSignedIn() && request.auth.uid == userId; }

    function validCommon() {
      return
        (!('title' in request.resource.data) || (request.resource.data.title is string && request.resource.data.title.size() <= 160)) &&
        (!('name' in request.resource.data) || (request.resource.data.name is string && request.resource.data.name.size() <= 160)) &&
        (!('description' in request.resource.data) || (request.resource.data.description is string && request.resource.data.description.size() <= 2000)) &&
        (!('done' in request.resource.data) || request.resource.data.done is bool) &&
        (!('order' in request.resource.data) || (request.resource.data.order is int && request.resource.data.order >= 0 && request.resource.data.order <= 1000000)) &&
        (!('isActive' in request.resource.data) || request.resource.data.isActive is bool) &&
        (!('createdAt' in request.resource.data) || request.resource.data.createdAt is timestamp) &&
        (!('updatedAt' in request.resource.data) || request.resource.data.updatedAt is timestamp);
    }

    match /users/{userId} {
      allow read, write: if false;

      match /{collectionName}/{docId} {
        allow read: if isOwner(userId);
        allow create: if isOwner(userId) && validCommon();
        allow update: if isOwner(userId) && validCommon();
        allow delete: if isOwner(userId);

        match /{subCollection}/{subId} {
          allow read: if isOwner(userId);
          allow create: if isOwner(userId) && validCommon();
          allow update: if isOwner(userId) && validCommon();
          allow delete: if isOwner(userId);
        }
      }
    }
  }
}
```
</details>
### 2) App config
- Put your Firebase web config into:
(Use the config from your Firebase Console → Project settings → Web app.)

```txt
/Services/firebase/firebase-init.js
```
- Make sure this file exports the initialized app instance as fireApp
  
```txt
  
  mport { initializeApp } from '[https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js](https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js)';

// IMPORTANT: Replace the placeholders below with your actual Firebase configuration keys.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
export const fireApp = initializeApp(firebaseConfig);

```
### 3) Run locally
- Use any static server (modules need HTTP, not file://):
- option A: quick static server

```txt
npx serve .
  
```
- option B: VS Code “Live Server” extension
 or your own dev server script,
- Open the served URL and sign in with Email/Password.
  ```
  
### 3) Run locally
- Use any static server (modules need HTTP, not file://):
- option A: quick static server
```txt
npx serve .
  
```
- option B: VS Code “Live Server” extension
 or your own dev server script,
- Open the served URL and sign in with Email/Password.
  






