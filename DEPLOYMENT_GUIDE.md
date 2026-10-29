# 🚀 End-to-End Production Deployment Guide

### Smart BIT Campus Stationery Pre-Ordering & Online Xerox Management Platform
**Stack**: React.js (Vite) + Node.js (Express) + MongoDB Atlas + Vercel + Render

---

## 📋 Architecture & Deployment Strategy

```
                ┌──────────────────────────────────────┐
                │          Student / Staff / Admin     │
                │             Web Browser UI           │
                └──────────────────┬───────────────────┘
                                   │
                                   ▼
         ┌────────────────────────────────────────────────────┐
         │               Vercel (Frontend CDN)                │
         │        Single Page React App (Vite Bundle)         │
         │        Env: VITE_API_BASE_URL                      │
         └─────────────────────────┬──────────────────────────┘
                                   │ REST API Calls (CORS enabled)
                                   ▼
         ┌────────────────────────────────────────────────────┐
         │             Render.com (Backend Web Service)       │
         │          Node.js / Express.js REST API             │
         │   Env: MONGODB_URI, JWT_SECRET, CLIENT_URL, PORT   │
         └─────────────────────────┬──────────────────────────┘
                                   │
                                   ▼
         ┌────────────────────────────────────────────────────┐
         │                 MongoDB Atlas                      │
         │           Cloud Database (M0 Free Tier)            │
         │    Users, Products, Orders, XeroxOrders, Logs      │
         └────────────────────────────────────────────────────┘
```

---

## 1️⃣ STEP 1: Push Code to GitHub

The project has already been initialized, configured, tested, and committed locally to the `main` branch with safe `.gitignore` rules (no `.env` or sensitive files included).

### Run in Terminal:
1. Open your browser and create a new repository on [GitHub](https://github.com/new):
   - **Repository name**: `smart-bit-stationery-xerox` (or any name you prefer)
   - **Visibility**: Public or Private
   - **Do NOT check** "Initialize with README", `.gitignore`, or license (they are already included locally).
2. Link your local project to your GitHub repository and push:

```bash
# Add your GitHub remote URL (replace YOUR_USERNAME and YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/smart-bit-stationery-xerox.git

# Push to GitHub
git push -u origin main
```

*(If prompted for credentials, use your GitHub username and a Personal Access Token with `repo` permissions).*

---

## 2️⃣ STEP 2: Set Up MongoDB Atlas (Cloud Database)

1. **Sign in / Register**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. **Create a Free Cluster**:
   - Choose **M0 Free** (Shared).
   - Provider: **AWS**, Region: Closest to your users (e.g., `ap-south-1` Mumbai).
3. **Create Database User**:
   - Navigate to **Security** ➔ **Database Access** ➔ **Add New Database User**.
   - Authentication Method: **Password**.
   - Username: `bitadmin` (or custom).
   - Password: Autogenerate or create a strong password (save this securely).
   - Database User Privileges: **Read and write to any database**.
4. **Configure Network Access**:
   - Navigate to **Security** ➔ **Network Access** ➔ **Add IP Address**.
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`).
   - Click **Confirm**. (Render dynamically allocates IP addresses; this allows Render's servers to connect).
5. **Get Connection String**:
   - Navigate to **Deployment** ➔ **Database** ➔ Click **Connect**.
   - Select **Drivers** (Node.js).
   - Copy the SRV connection string:
     ```
     mongodb+srv://bitadmin:<password>@cluster0.xxxxx.mongodb.net/bit_stationery_db?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual database user password.

---

## 3️⃣ STEP 3: Deploy Backend on Render

1. **Sign in**: Go to [Render.com](https://render.com) and log in with your GitHub account.
2. **Create New Web Service**:
   - Click **New +** ➔ **Web Service**.
   - Connect your GitHub repository (`smart-bit-stationery-xerox`).
3. **Configure Service Settings**:
   - **Name**: `bit-stationery-backend` (or your choice)
   - **Region**: Singapore or Frankfurt (choose closest to your Atlas cluster)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. **Add Environment Variables**:
   Click **Advanced** ➔ **Add Environment Variable**:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `5000` | Internal server port |
   | `MONGODB_URI` | `mongodb+srv://bitadmin:<password>@cluster0.xxxxx.mongodb.net/bit_stationery_db?retryWrites=true&w=majority` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | `generate-a-random-secure-string-here` | 32+ character random secret |
   | `CLIENT_URL` | `https://your-frontend.vercel.app` | *Leave empty initially; update after deploying frontend* |
5. **Deploy**:
   - Click **Create Web Service**.
   - Render will build and deploy. Wait for `Server running in production mode on port 5000` and `MongoDB Connected`.
   - Copy your public Render URL: e.g., `https://bit-stationery-backend.onrender.com`.
   - Test health check in your browser: `https://bit-stationery-backend.onrender.com/api/health` ➔ should return `{"status":"ok"}`.

---

## 4️⃣ STEP 4: Deploy Frontend on Vercel

1. **Sign in**: Go to [Vercel.com](https://vercel.com) and log in with GitHub.
2. **Import Project**:
   - Click **Add New...** ➔ **Project**.
   - Find and import your repository (`smart-bit-stationery-xerox`).
3. **Configure Build Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. **Environment Variables**:
   Add the following variable:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://bit-stationery-backend.onrender.com/api` | Point to your deployed Render backend URL + `/api` |
5. **Deploy**:
   - Click **Deploy**.
   - Vercel will install dependencies and compile the Vite production bundle.
   - Once completed, you'll receive your production domain: e.g., `https://smart-bit-stationery.vercel.app`.
6. **Update CORS in Render**:
   - Return to your Render Dashboard ➔ `bit-stationery-backend` ➔ **Environment**.
   - Set `CLIENT_URL` to `https://smart-bit-stationery.vercel.app` (your Vercel URL).
   - Save changes (Render will automatically redeploy with the updated CORS origin).

---

## 5️⃣ STEP 5: Seed the Production Database

To populate the initial catalog (stationery items, Xerox pricing configurations, demo student, staff, and admin accounts):

### Option A: From Your Local Machine (Quickest)
Run the seed script pointing to your remote MongoDB Atlas database:

```bash
# In the project root on your computer:
MONGODB_URI="mongodb+srv://bitadmin:<password>@cluster0.xxxxx.mongodb.net/bit_stationery_db?retryWrites=true&w=majority" node server/seed/seedData.js
```

### Option B: From Render Shell
1. Go to your Render service dashboard.
2. Click on the **Shell** tab.
3. Run:
   ```bash
   node seed/seedData.js
   ```

You will see:
```
Connected to MongoDB
Database Cleared...
Admin User Created...
Staff User Created...
Student Users Created...
Products Seeded...
Xerox Pricing Settings Initialized...
Sample Stationery & Xerox Orders Created...
DATA SEEDED SUCCESSFULLY!
```

---

## 6️⃣ STEP 6: Post-Deployment Verification Checklist

| Test Item | Verification Steps | Expected Result |
| :--- | :--- | :--- |
| **Backend Health** | Open `https://your-backend.onrender.com/api/health` | Status 200: `{"status":"ok"}` |
| **Frontend Load** | Visit `https://your-app.vercel.app` | Clean, modern light UI loads with role switcher banner |
| **Student Login** | Click **Aarav Sharma (Student)** on top banner | Logs in instantly, displays catalog and Xerox pre-order tab |
| **Stationery Pre-Order** | Add products to cart, select pickup slot, submit | Order created, token generated, stock decremented |
| **Xerox Pre-Order** | Switch to Xerox tab, upload PDF, select B&W/Colour & binding | Live cost calculated, order submitted, digital slip available |
| **Staff Processing** | Click **Ramesh (Staff)** on top banner | Views stationery fulfillment queue & Xerox queue; can accept, update status to `Ready for Pickup`, and mark payment as `Paid` |
| **Admin Controls** | Click **Dr. Balasubramanian (Admin)** | Views financial analytics, inventory asset value, configures Xerox per-page pricing |

---

## 🔒 Security & Environment Architecture

- **No Exposed Secrets**: Frontend code contains zero hardcoded API keys, JWT secrets, or database credentials.
- **Protected Environment Variables**: `.env` is ignored by Git in `.gitignore`. Only `.env.example` templates are tracked.
- **Document Access Control**: Uploaded student PDFs are served through authenticated streaming routes (`/api/xerox/:id/file`) verifying role and ownership, preventing unauthorized direct access.
- **Graceful Render Cold Starts**: Free tier Render instances sleep after 15 minutes of inactivity; the frontend includes proper error handling and retry cues.
