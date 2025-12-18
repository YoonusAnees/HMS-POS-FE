# Anexxa Hotel POS Frontend (React + Vite + Tailwind CSS v4)

This is the **Frontend** for the Hotel POS system (role-based UI for **admin / manager / cashier / reception**).
It connects to the Backend API (Express + Prisma) via a single base API service.

---

## Tech Stack
- React 18
- Vite
- Tailwind CSS v4
- Axios
- React Router v6

---

## Project Structure (pattern you requested)
```
src/
  App.jsx
  main.jsx
  index.css

  contexts/
    AuthContext.jsx

  routes/
    ProtectedRoute.jsx
    RoleHomeRedirect.jsx

  layouts/
    AppShell.jsx
    AdminLayout.jsx
    ManagerLayout.jsx
    CashierLayout.jsx
    ReceptionLayout.jsx

  services/
    api.js
    auth.service.js
    users.service.js
    categories.service.js
    items.service.js
    tables.service.js
    orders.service.js
    payments.service.js
    refunds.service.js
    reports.service.js
    dashboard.service.js

  pages/
    Login.jsx
    NotFound.jsx
    admin/...
    manager/...
    cashier/...
    reception/...

  components/
    common/...
    ui/...
```

---

## Requirements
- Node.js **18+** recommended (Node 20 LTS is safest)
- Backend running (local or deployed)

---

## Install & Run
```bash
npm install
npm run dev
```
Default URL:
- http://localhost:5173

---

## Configure API Base URL
Create **.env** in the frontend root:
```bash
VITE_API_BASE_URL=http://localhost:4000/api
```
If deployed:
```bash
VITE_API_BASE_URL=https://your-domain.com/api
```

---

## Login
Route:
- `/login`

Example admin user:
- username: `admin`
- password: `admin123`

After login, app redirects by role:
- admin → `/admin`
- manager → `/manager`
- cashier → `/cashier`
- reception → `/reception`

---

## Auth Flow (Route → API)
1. `POST /auth/login` returns `{ token, user }`
2. Frontend stores token + user in `localStorage`
3. Axios interceptor adds header:
   - `Authorization: Bearer <token>`
4. `ProtectedRoute` blocks pages if:
   - not logged in (401 flow)
   - role mismatch (403 flow)

---

## Expected Backend Endpoints (base `/api`)
Auth / Users
- `POST /auth/register`
- `POST /auth/login`
- `GET /users`

Menu
- `GET /categories`
- `POST /categories`
- `PUT /categories/:id`
- `DELETE /categories/:id`

- `GET /items`
- `POST /items`
- `POST /items/bulk`
- `PUT /items/:id`
- `DELETE /items/:id`

Restaurant Tables
- `GET /tables`
- `POST /tables`
- `POST /tables/bulk`
- `PUT /tables/:id`
- `DELETE /tables/:id`

Orders
- `GET /orders/open`
- `GET /orders/:id`
- `POST /orders`
- `POST /orders/:id/items`

Payments / Refunds
- `POST /payments`
- `GET /payments/order/:orderId`
- `POST /refunds`

Reports / Dashboard
- `GET /reports/eod?date=YYYY-MM-DD&currency=LKR`
- `GET /dashboard/summary?from=YYYY-MM-DD&to=YYYY-MM-DD`

> If your backend routes differ, update `src/services/*.service.js`.

---

## Build
```bash
npm run build
npm run preview
```

---

## Common Issues
### CORS error
Enable CORS on backend:
```js
app.use(cors())
```

### 401 Missing token
- Login first
- Ensure `Authorization: Bearer <token>` is being sent

### 403 Forbidden
- Your user role is not allowed for that route

---

## Notes
This repo is frontend-only. Backend is a separate repo.

