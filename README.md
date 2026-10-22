# Khateef — Your personal space

A responsive, installable Progressive Web App (PWA) for organizing everyday life. Built with plain HTML, CSS, and JavaScript so it can be hosted for free and requires no build step.

## Features
- Overview dashboard with task completion, habits, and active goal stats
- Create, edit, complete, and delete tasks with due dates and priorities
- Notes with editable titles and body text
- Daily habit check-ins
- Goals with adjustable progress
- Light and dark themes
- Export and import a JSON backup
- Responsive mobile layout
- PWA manifest and service worker for install/offline shell support
- No account, paid API, or server required

## Run locally
Because the app uses a service worker, use a local web server instead of opening `index.html` as a file.

### Option A: Python
```bash
python -m http.server 8000
```
Open `http://localhost:8000`.

### Option B: Node
```bash
npx serve .
```

## Install on your phone
1. Publish the folder to a static HTTPS host (GitHub Pages, Cloudflare Pages, or Netlify).
2. Open the live HTTPS URL in Chrome on Android.
3. Use the browser menu and choose **Install app** or **Add to Home screen**.
4. On iPhone, open the URL in Safari and choose **Share → Add to Home Screen**.

## Free deployment
### GitHub Pages
1. Create a free GitHub account and a new public repository named `khateef`.
2. Upload the contents of this folder to the repository root.
3. Open **Settings → Pages**, select deployment from the `main` branch and `/ (root)`.
4. Wait for GitHub Pages to publish the site. Your URL will look like `https://YOUR-USERNAME.github.io/khateef/`.
5. Since this is a static PWA, it works without a backend.

Alternative: drag the folder into Netlify Drop or create a free Cloudflare Pages project from a Git repository.

## Data and privacy
The current version saves data in `localStorage` in the browser on the current device. Data is not synced between devices and there is no login/cloud account. Export backups regularly. Browser storage can be cleared by device/browser settings; imported JSON backups replace current local data after confirmation.

## Current limitations / next steps
- No multi-device sync, account system, or server-side database yet.
- The AI assistant is not connected to a model/API in this free starter, so it does not send personal data to a third-party AI service.
- Add cloud sync and authentication only if you want multi-device use; a secure backend and privacy policy would then be needed.
