# Soundify

![Project](https://img.shields.io/badge/Soundify-7957d5) ![Status](https://img.shields.io/badge/status-demo-blue)

**React · Firebase · Express**

A React music-preview player with Firebase sign-in and an Express search API.

## 🌐 Demo

[Open Soundify](https://soundify-1.onrender.com/)

The hosted frontend is available; live authentication and audio playback have not been verified in this documentation update.

## ✨ Features
- Search songs with artist, album and artwork details.
- Play previews with volume, seek, shuffle, repeat and next/previous controls.
- Save favorites and playlists in the current browser.
- Sign up or sign in with Firebase email/password authentication.

## 🧰 Stack
React, JavaScript, CSS, Firebase Authentication, Node.js and Express.

## 🚀 Run locally
Use Node.js 22 or later. In the repository root, run `npm ci` then `npm start`. In a separate terminal, run `cd server`, `npm ci`, then `node server.js`. The frontend opens on port 3000; the API listens on port 5000.

Set `REACT_APP_API_URL` to the full `/api/songs` endpoint when using a hosted backend. A deployed copy needs its own Firebase project configuration in `src/firebase.js` and the correct authorized domains.

## ✅ Checks
Run `CI=true npm test -- --watchAll=false` and `npm run build`. The existing tests are not proof of live authentication or playback.

## 📌 Limits
Songs are Apple iTunes Search previews, not licensed full-length tracks. Favorites and playlists use localStorage and are not synced across accounts or devices. No database-backed user library is implemented. Never commit Firebase admin credentials or private keys.
