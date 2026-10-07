# Soundify

![Project](https://img.shields.io/badge/project-Soundify-7957d5) ![Status](https://img.shields.io/badge/status-demo-blue)

**React · Firebase · Express**

A React music-discovery app: search the iTunes catalog, play short previews and keep likes and playlists in your browser.

## 🌐 Demo

[Open Soundify](https://soundify-1.onrender.com/)

Use "Explore as guest" for the demo, or sign in with a Firebase account. Likes and playlists are stored locally in the browser either way.

## ✨ Features
- Guest mode - explore and play previews without creating an account.
- Search songs with artist, album and artwork details.
- Preview playback with volume, seek, shuffle, repeat and next/previous controls.
- Save favorites and playlists in the current browser.
- Sign up, sign in and password reset with Firebase email/password authentication.
- Accessible player controls, keyboard shortcuts and resilient loading/error states.

## 🧰 Stack
React, JavaScript, CSS, Firebase Authentication, Node.js and Express.

## 🚀 Run locally
Use Node.js 22 or later. In the repository root, run `npm ci` then `npm start`. In a separate terminal, run `cd server`, `npm ci`, then `node server.js`. The frontend opens on port 3000; the API listens on port 5000.

Set `REACT_APP_API_URL` to the full `/api/songs` endpoint when using a hosted backend. A deployed copy needs its own Firebase project configuration in `src/firebase.js` and the correct authorized domains.

## ✅ Checks
Run `CI=true npm test -- --watchAll=false` and `npm run build`.

## 📌 Limits
Songs are Apple iTunes Search previews (about 30 seconds), not licensed full-length tracks. Favorites and playlists use localStorage and are not synced across accounts or devices. No database-backed user library is implemented. Never commit Firebase admin credentials or private keys.
