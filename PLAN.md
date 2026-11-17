# PLAN.md

## Stack
- **Frontend:** React 18, Vite, Tailwind CSS, react-i18next for i18n & RTL support  
- **Backend:** Node.js 20, Express.js, SQLite (via better-sqlite3)  
- **Build & Tooling:** Vite for dev server & bundling, ESLint + Prettier, npm workspaces (optional)  
- **Deployment:** Single Docker container exposing port 3000 (API) and 5173 (Vite dev) or static build served by Express.

## Features
1. **Responsive UI** – fluid layout that works on mobile, tablet, desktop.  
2. **Arabic RTL Support** – toggleable language that flips layout direction.  
3. **Product Catalog** – list of clothing items with images, price, description.  
4. **Categories** – filter products by predefined categories (e.g., Men, Women, Kids).  
5. **Search Bar** – free‑text search across product titles & descriptions.  
6. **Advanced Filters** – size, color, price range sliders.  
7. **Product Detail Page** – larger images, size/color selectors, add‑to‑cart.  
8. **Shopping Cart** – add/remove items, quantity adjustment, subtotal calculation.  
9. **Checkout Flow** – simple form (name, address, email) + order summary.  
10. **Order Confirmation** – thank‑you page with order ID.  
11. **Admin Dashboard** – protected area for staff.  
12. **Product Management** – create, read, update, delete (CRUD) products, upload images.  
13. **Inventory Tracking** – stock count per SKU, auto‑decrement on purchase.  
14. **Order Management** – list orders, view details, mark status (pending, shipped, completed).  
15. **Fast Load** – lazy‑load images, code‑splitting, server‑side caching headers.  

## Files
| Path                     | Exported symbols                     |
|--------------------------|--------------------------------------|
| `src/server.js`          | `startServer`                        |
| `src/client/App.jsx`     | `App` (default export)               |
| `src/client/index.html`  | *(no exports – entry point)*         |

## Rules
- **Modularity:** Each layer (API, UI, utilities) lives in its own folder under `src/`.  
- **Naming:** Files use `camelCase` for JS/JSX, kebab‑case for assets. Functions are `camelCase`.  
- **API Contracts:** JSON responses follow `{ success: boolean, data: any, error?: string }`.  
- **Security:** Admin routes are protected by a simple token middleware (`X-Admin-Token`).  
- **RTL:** All UI components read `dir` from i18n context; Tailwind `rtl:` utilities are used.  
- **Performance:** Images served via Express static middleware with cache‑control headers.  
- **Testing:** Critical functions (e.g., cart calculations) are pure and unit‑testable.  
- **Error Handling:** Central Express error handler returns consistent JSON shape.  
- **Documentation:** Inline JSDoc for exported functions; README will be generated from this PLAN.
