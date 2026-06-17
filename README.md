# 🎓 COS 102 Project Hub

A sleek, animated project submission portal for COS 102 Computer Science students.

## Features

- 🏛️ **Class reps** register their department + number of groups
- 👥 **Group leaders** register their group with project name
- 🚀 **Submission** with member list (type or paste) + GitHub link
- 📧 **Automated emails** via Brevo on department register + project submit
- 🔐 **Admin panel** — view all departments, groups, submissions, export CSV
- 💎 Unique dark design with animated grid, glowing orbs, Syne + Inter typography

---

## Tech Stack

- **Next.js 14** (App Router)
- **Supabase** — Postgres database
- **Brevo** — transactional email
- **Vercel** — deployment

---

## Setup

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Open the **SQL Editor** and run the contents of `supabase-schema.sql`
3. Get your keys from **Project Settings → API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 2. Brevo Setup

1. Go to [brevo.com](https://brevo.com) and create a free account
2. Go to **SMTP & API → API Keys** and create a new key
3. Copy it as `BREVO_API_KEY`
4. **Important:** Go to **Senders & Domains** and add/verify `globalgraphics129@gmail.com` as a sender

### 3. Local Development

```bash
# Clone your repo
git clone https://github.com/your-username/cos102-submission
cd cos102-submission

# Install dependencies
npm install

# Copy env file and fill in values
cp .env.example .env.local
# Edit .env.local with your actual keys

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/cos102-submission.git
git push -u origin main
```

### Step 2: Import to Vercel
1. Go to [vercel.com](https://vercel.com) and log in
2. Click **"Add New → Project"**
3. Import your GitHub repo

### Step 3: Add Environment Variables in Vercel

In your Vercel project, go to **Settings → Environment Variables** and add:

| Variable Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `BREVO_API_KEY` | Your Brevo API key |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | A secure password for the admin panel |

> ⚠️ Make sure to set these for **all environments** (Production, Preview, Development)

### Step 4: Deploy
Click **"Deploy"** — Vercel will build and deploy automatically.

---

## Admin Panel

Go to `/admin` on your deployed site.  
Password is whatever you set as `NEXT_PUBLIC_ADMIN_PASSWORD`.

From admin you can:
- See all registered departments and class reps
- View all project submissions with GitHub links and member lists
- Search and filter by department
- Export everything as a CSV for the lecturer
- Delete entries

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing page with overview |
| `/register-department` | Class rep registers department |
| `/register-group` | Group leader registers group |
| `/submit` | Group leader submits project |
| `/admin` | Admin panel (password protected) |

---

## Email Notifications

Emails are sent automatically via Brevo:
1. **Department Registration** → sent to class rep confirming department is live
2. **Project Submission** → sent to group leader with full submission summary

Recipient can reply to `globalgraphics129@gmail.com` for support.
