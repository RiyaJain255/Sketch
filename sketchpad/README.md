# 🎨 SketchPad — Draw. Save. Share.

A full-stack drawing application with authentication, a rich canvas board, and a personal gallery. Built with React + Vite (frontend) and Node.js + Express + MongoDB (backend).

---

## ✨ Features

- **Canvas Drawing** — brush, eraser, paint bucket (flood fill)
- **Brush Controls** — adjustable size, full color picker + 15-color palette
- **Undo / Redo** — full history stack with keyboard shortcuts (Ctrl+Z / Ctrl+Y)
- **Save Drawings** — persisted to MongoDB with a title
- **Personal Gallery** — view, download (PNG), delete your drawings
- **Authentication** — Google OAuth **and** email/password signup/login
- **Protected Routes** — all drawing/gallery routes require a valid JWT
- **Responsive** — works on desktop and touch/mobile

---

## 🗂 Project Structure

```
sketchpad/
├── frontend/              # React + Vite app
│   ├── src/
│   │   ├── components/    # Toolbar, Navbar, SaveModal
│   │   ├── context/       # AuthContext (global user state)
│   │   ├── hooks/         # useCanvas (all drawing logic)
│   │   ├── pages/         # DrawingPage, GalleryPage, LoginPage
│   │   └── styles/        # Per-component CSS files
│   ├── vite.config.js
│   └── package.json
├── backend/               # Node.js + Express API
│   ├── src/
│   │   ├── models/        # User.js, Drawing.js (Mongoose)
│   │   ├── routes/        # auth.js, drawings.js
│   │   ├── middleware/     # auth.js (JWT verify)
│   │   ├── db.js          # MongoDB connection
│   │   └── server.js      # Express app + startup
│   └── package.json
├── vercel.json            # Frontend deploy config
├── render.yaml            # Backend deploy config
└── package.json           # Root (concurrently dev script)
```

---

## 🚀 Local Setup (VS Code)

### Prerequisites

- **Node.js** v18+ — [download](https://nodejs.org)
- **MongoDB Atlas** account (free) — [mongodb.com/atlas](https://www.mongodb.com/atlas)
- **Google Cloud Console** account (for OAuth) — [console.cloud.google.com](https://console.cloud.google.com)
- **Git** — [git-scm.com](https://git-scm.com)

---

### Step 1 — Clone and open in VS Code

```bash
git clone https://github.com/YOUR_USERNAME/sketchpad.git
cd sketchpad
code .
```

---

### Step 2 — Install dependencies

Open the VS Code terminal (`Ctrl+`` ` ``) and run:

```bash
# Install root dev tools
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..
```

---

### Step 3 — Set up MongoDB Atlas

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → **Create a free cluster**
2. Create a database user (username + password)
3. In **Network Access**, add `0.0.0.0/0` (allow from anywhere)
4. Click **Connect** → **Drivers** → copy the connection string
   - It looks like: `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/`
   - Append your DB name: `...mongodb.net/sketchpad`

---

### Step 4 — Set up Google OAuth

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Go to **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
4. Application type: **Web application**
5. Add **Authorized JavaScript origins**:
   - `http://localhost:3000`
   - `https://your-app.vercel.app` (add later for production)
6. Copy the **Client ID**

---

### Step 5 — Configure environment variables

**Backend** — create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://your_user:your_pass@cluster.mongodb.net/sketchpad
JWT_SECRET=replace_with_a_long_random_string_at_least_32_chars
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
CLIENT_URL=http://localhost:3000
```

**Frontend** — create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

> 💡 **Tip**: In VS Code, install the [DotENV extension](https://marketplace.visualstudio.com/items?itemName=mikestead.dotenv) for syntax highlighting in `.env` files.

---

### Step 6 — Run in development

From the project root:

```bash
npm run dev
```

This starts both servers concurrently:
- Frontend → [http://localhost:3000](http://localhost:3000)
- Backend API → [http://localhost:5000](http://localhost:5000)

Or run them separately in two VS Code terminals:

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

---

## 🌐 Deployment

### Deploy Backend to Render (free tier)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add **Environment Variables** in the Render dashboard:
   ```
   MONGODB_URI    = your Atlas connection string
   JWT_SECRET     = your secret key
   GOOGLE_CLIENT_ID = your Google client ID
   CLIENT_URL     = https://your-app.vercel.app
   NODE_ENV       = production
   ```
6. Click **Deploy** — note your Render URL (e.g. `https://sketchpad-api.onrender.com`)

---

### Deploy Frontend to Vercel

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```
2. From the `frontend/` directory:
   ```bash
   cd frontend
   vercel
   ```
3. Follow the prompts, then add **Environment Variables** in the Vercel dashboard:
   ```
   VITE_API_URL           = https://sketchpad-api.onrender.com
   VITE_GOOGLE_CLIENT_ID  = your Google client ID
   ```
4. Redeploy: `vercel --prod`

---

### Post-deployment: Update Google OAuth origins

Back in Google Cloud Console → **Credentials** → your OAuth client:
- Add your Vercel URL to **Authorized JavaScript origins**: `https://your-app.vercel.app`
- Save changes

---

## 🔑 API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/signup` | — | Register with email/password |
| POST | `/api/auth/login` | — | Login with email/password |
| POST | `/api/auth/google` | — | Login/signup via Google OAuth |
| GET | `/api/auth/me` | ✅ JWT | Get current user |
| GET | `/api/drawings` | ✅ JWT | List all your drawings |
| GET | `/api/drawings/:id` | ✅ JWT | Get single drawing |
| POST | `/api/drawings` | ✅ JWT | Save new drawing |
| PUT | `/api/drawings/:id` | ✅ JWT | Update drawing |
| DELETE | `/api/drawings/:id` | ✅ JWT | Delete drawing |
| GET | `/api/health` | — | Health check |

---

## 🎨 Design Choices

### Frontend
- **React + Vite** — fast dev server, optimized production builds
- **Canvas API** — native, no library needed for drawing; gives full pixel-level control
- **useCanvas hook** — separates all drawing logic from UI; easy to test and extend
- **JWT in localStorage** — simple, stateless auth; set axios default header on load
- **react-hot-toast** — lightweight, beautiful notifications

### Backend
- **Express** — minimal, flexible; easy to reason about
- **MongoDB + Mongoose** — flexible schema ideal for evolving data; Atlas free tier
- **bcryptjs** — industry-standard password hashing (12 rounds)
- **JWT (30 day expiry)** — stateless, no server-side session store needed
- **Rate limiting** — 100 req/15min per IP to prevent abuse
- **Base64 storage** — simple for a demo; in production swap for Cloudinary/S3

### Auth
- **Google OAuth (implicit flow)** — fetches Google profile in frontend, sends to backend to create/find user; avoids needing a redirect URL for development
- **Email/password** — bcrypt + JWT; standard and well-understood

---

## 🛠 VS Code Extensions (Recommended)

Install these for the best development experience:

- **ESLint** — `dbaeumer.vscode-eslint`
- **Prettier** — `esbenp.prettier-vscode`
- **DotENV** — `mikestead.dotenv`
- **MongoDB for VS Code** — `mongodb.mongodb-vscode`
- **GitLens** — `eamodio.gitlens`
- **Thunder Client** — `rangav.vscode-thunder-client` (API testing, like Postman)

---

## ⌨️ Keyboard Shortcuts (Canvas)

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |

---

## 📝 License

MIT
