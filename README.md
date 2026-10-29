# FroskCode — Responsive Browser Web IDE

A compact browser-based coding workspace with a VS Code-inspired layout, animated 4-second intro, account creation/login, unique usernames, and a responsive UI for phones, tablets, laptops, and desktops.

## Run locally

Requirements: Node.js 18 or newer.

```bash
npm install
npm start
```

Open `http://localhost:3000`.

To test on another device on the **same Wi-Fi**, open `http://YOUR_COMPUTER_LAN_IP:3000` on that device. Keep the server running.

## Features

- 4-second animated splash screen
- Login and account creation
- Server-side unique username checks (case-insensitive)
- Passwords hashed using Node.js `crypto.scrypt` with per-user random salt
- Smooth error shake and red error UI when a username is already used
- Welcome screen and logout/login flow
- Responsive VS Code-inspired editor UI
- HTML, CSS, JavaScript, and README starter files
- Basic editing, line numbers, file creation, download-current-file, and HTML preview
- No frontend framework or build step required

## Important deployment notes

This is a small starter web IDE, not the full Microsoft VS Code product. User accounts are stored in `data/users.json`; deploy only to a trusted Node host with persistent storage and set `DATA_DIR` to a persistent directory. A host with ephemeral filesystems can lose accounts after redeploy/restart. Use HTTPS in production. For a real multi-user production service, add rate limiting, CSRF/session controls, email/password recovery, database backups, and a proper database.

This starter does not sync project files between devices or isolate per-user project files yet; the editor's work is held in the current browser session. Account creation/login is handled by the server, so unique names are enforced across clients connected to the same server.
