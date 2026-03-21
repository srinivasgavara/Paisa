# 💸 Spendly — Personal Expense Tracker

A full-stack personal expense tracker with Google OAuth, real-time analytics, and Excel export.

---

## 📁 Project Structure

```
expense-tracker/
├── backend/
│   ├── db/
│   │   ├── index.js          # DB connection + init
│   │   └── schema.sql        # PostgreSQL schema
│   ├── middleware/
│   │   └── auth.js           # JWT auth middleware
│   ├── routes/
│   │   ├── auth.js           # Google OAuth login, /me
│   │   └── expenses.js       # CRUD, search, stats, export
│   ├── .env.example
│   ├── package.json
│   └── server.js             # Express app entry point
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Charts.jsx         # Bar, Line, Pie charts
    │   │   ├── ExpenseModal.jsx   # Add/Edit modal
    │   │   ├── ExpenseTable.jsx   # Table with filters
    │   │   ├── FloatingAddButton.jsx
    │   │   ├── Sidebar.jsx        # Navigation sidebar
    │   │   ├── StatCards.jsx      # Overview cards
    │   │   └── TodayPanel.jsx     # Today's spending
    │   ├── context/
    │   │   └── AuthContext.jsx    # Auth state
    │   ├── pages/
    │   │   ├── Dashboard.jsx      # Main dashboard
    │   │   └── LoginPage.jsx      # Google login
    │   ├── utils/
    │   │   ├── api.js             # API client
    │   │   └── format.js          # Formatters + constants
    │   ├── App.jsx
    │   ├── index.css              # Global dark theme
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## 🔧 Prerequisites

- Node.js v18+
- PostgreSQL 14+
- A Google account (for OAuth)

---

## 🗄️ 1. Database Setup

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE expense_tracker;
\q
```

The schema is auto-applied when the server starts (via `db/init.js`).

---

## 🔑 2. Google OAuth Setup

### Step-by-step:

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or select an existing one)
3. Navigate to **APIs & Services → Credentials**
4. Click **"Create Credentials" → "OAuth 2.0 Client ID"**
5. Set **Application type**: Web application
6. Add **Authorized JavaScript origins**:
   - `http://localhost:5173` (local development)
   - `https://yourdomain.com` (production)
7. Add **Authorized redirect URIs**:
   - `http://localhost:5173` (local development)
   - `https://yourdomain.com` (production)
8. Click **Create** — copy the **Client ID** and **Client Secret**

---

## ⚙️ 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
NODE_ENV=development

# Your PostgreSQL connection string
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/expense_tracker

# Generate a strong secret: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# From Google Console
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-yourSecretHere

# Frontend origin (for CORS)
FRONTEND_URL=http://localhost:5173
```

```bash
# Start the backend server
npm run dev
# Server runs at: http://localhost:5000
```

---

## 🎨 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
```

```bash
# Start the frontend dev server
npm run dev
# App runs at: http://localhost:5173
```

---

## 🚀 5. Run Locally

Open two terminals:

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌐 6. Deploy to Production

### Option A: Railway (Easiest — Free Tier Available)

#### Backend + PostgreSQL on Railway:

1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. In `/backend`:
   ```bash
   railway init
   railway up
   ```
4. In Railway dashboard, add a **PostgreSQL** plugin to your project
5. Railway auto-sets `DATABASE_URL` — add your other env vars in the dashboard:
   - `JWT_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `FRONTEND_URL` (your Vercel URL, set after deploying frontend)
   - `NODE_ENV=production`

#### Frontend on Vercel:

1. Push the `frontend/` folder to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Set environment variables:
   - `VITE_API_URL=https://your-railway-backend.railway.app/api`
   - `VITE_GOOGLE_CLIENT_ID=your-client-id`
4. Deploy — Vercel gives you a URL like `https://spendly.vercel.app`

5. **Update Google Console**: Add your Vercel URL to Authorized JavaScript Origins
6. **Update Railway**: Set `FRONTEND_URL=https://spendly.vercel.app`

---

### Option B: Render (Free Tier)

#### Backend:
1. Push to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Build command: `cd backend && npm install`
4. Start command: `cd backend && npm start`
5. Add a **PostgreSQL** database from Render dashboard
6. Set all environment variables

#### Frontend:
1. Create a new **Static Site** on Render
2. Build command: `cd frontend && npm install && npm run build`
3. Publish directory: `frontend/dist`
4. Set env vars

---

### Option C: VPS (DigitalOcean / Linode / Hetzner)

```bash
# On your server:
# 1. Install Node, PostgreSQL, nginx, PM2
sudo apt update && sudo apt install -y nodejs npm postgresql nginx
npm install -g pm2

# 2. Clone your repo
git clone https://github.com/you/expense-tracker.git
cd expense-tracker

# 3. Setup backend
cd backend && npm install
cp .env.example .env  # fill in production values

# 4. Build frontend
cd ../frontend && npm install
npm run build  # creates dist/

# 5. Start backend with PM2
cd ../backend
pm2 start server.js --name expense-tracker
pm2 save && pm2 startup

# 6. Nginx config for frontend + reverse proxy
# /etc/nginx/sites-available/expense-tracker:

server {
    listen 80;
    server_name yourdomain.com;

    # Frontend static files
    root /path/to/expense-tracker/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Enable and reload
sudo ln -s /etc/nginx/sites-available/expense-tracker /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 7. Add SSL with Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/google` | Exchange Google credential for JWT |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/expenses` | List expenses (with filters) |
| POST | `/api/expenses` | Add expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET | `/api/expenses/stats/dashboard` | Dashboard statistics |
| GET | `/api/expenses/export` | Download Excel file |
| GET | `/api/expenses/categories` | List all categories |

### Query params for `GET /api/expenses`:
- `search` — text search on description/category
- `filter` — `today` | `week` | `month` | `custom`
- `startDate` / `endDate` — for custom range (YYYY-MM-DD)
- `category` — filter by category name
- `sortBy` — `date` | `amount` | `category`
- `sortOrder` — `ASC` | `DESC`

---

## 🗃️ Database Schema

```sql
-- users
id UUID PRIMARY KEY
google_id VARCHAR(255) UNIQUE NOT NULL
name VARCHAR(255) NOT NULL
email VARCHAR(255) UNIQUE NOT NULL
avatar VARCHAR(500)
created_at TIMESTAMP

-- expenses
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
date DATE NOT NULL
category VARCHAR(100) NOT NULL
description TEXT NOT NULL
amount NUMERIC(12,2) NOT NULL
created_at TIMESTAMP
updated_at TIMESTAMP (auto-updated by trigger)
```

---

## 🛠️ Troubleshooting

**"Google sign-in not working"**
- Make sure `VITE_GOOGLE_CLIENT_ID` matches `GOOGLE_CLIENT_ID` exactly
- Check that your frontend URL is in Authorized JavaScript Origins on Google Console
- Ensure the Google Identity Services script is loading (check network tab)

**"Database connection failed"**
- Check `DATABASE_URL` format: `postgresql://user:password@host:port/dbname`
- Make sure PostgreSQL is running: `sudo systemctl status postgresql`

**"CORS error"**
- Ensure `FRONTEND_URL` in backend `.env` exactly matches your frontend origin (no trailing slash)

**"JWT token expired"**
- Token expires after 7 days — user just needs to sign in again

---

## ✨ Features Checklist

- [x] Google OAuth 2.0 login
- [x] JWT session management
- [x] Add / Edit / Delete expenses
- [x] Search by description & category
- [x] Filter by Today / Week / Month / Custom Range
- [x] Today's expense summary
- [x] Monthly totals and daily average
- [x] Daily spending bar chart (Chart.js)
- [x] Monthly trend line chart (Chart.js)
- [x] Category pie/doughnut chart (Chart.js)
- [x] Export to Excel (.xlsx)
- [x] Floating "+" add button
- [x] Dark theme dashboard
- [x] Smooth scroll navigation
- [x] Mobile responsive layout
- [x] Secure: all expenses are user-scoped
