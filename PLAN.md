# Project Plan: Simple Arabic Greeting Web App

## Overview
A minimal web application that serves a single page displaying the Arabic greeting **"اهلا"**.  
The project demonstrates a clean, modular structure using Node.js and Express.

## Stack
- **Runtime:** Node.js (v20+)
- **Web Framework:** Express
- **Templating:** Static HTML (no templating engine needed)
- **Package Manager:** npm
- **Testing:** None (kept minimal)
- **Linting/Formatting:** ESLint (optional, not included in core files)

## File Structure
```
/ (root)
│
├─ PLAN.md                # This design document
├─ package.json           # npm metadata & dependencies
├─ server.js              # Express server entry point
└─ public/
   └─ index.html          # Static page showing "اهلا"
```

## Development Rules
1. **Modularity** – All runtime logic lives in `server.js`; static assets are under `public/`.
2. **Environment Config** – Port can be overridden with `PORT` env var; defaults to `3000`.
3. **Security** – Use `helmet` middleware for basic HTTP header protection (optional, not required for this demo).
4. **Error Handling** – Graceful 404 for unknown routes and a generic error handler.
5. **Coding Standards** – Keep each source file ≤ 120 lines, use `strict` mode, and avoid global variables.
6. **Documentation** – Each file contains a header comment describing its purpose.

## Setup & Run
```bash
# Install dependencies
npm install

# Start the server
npm start
```

Open a browser to `http://localhost:3000` to see the greeting.

---

*End of PLAN.md*
