# 🚀 Quick Start Guide - Taskify Kanban

## Setup dalam 5 Menit

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Supabase

#### a. Buat Project di Supabase
- Buka https://supabase.com
- Klik "New Project"
- Isi nama project dan password database
- Tunggu project selesai dibuat (~2 menit)

#### b. Setup Database
1. Buka **SQL Editor** di Supabase Dashboard
2. Copy **SELURUH SQL script** dari `README.md` (section "Setup Supabase")
3. Paste & **Run** di SQL Editor
4. ✅ Tables sudah dibuat

#### c. Enable Email Auth
1. Ke menu **Authentication** > **Providers**
2. Pastikan **Email** toggle **ON** (enabled)
3. Scroll ke **"Confirm email"** → Set ke **enabled**
4. **Save**

#### d. Get API Keys
1. Ke menu **Settings** > **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Setup Environment Variables

Buat file `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Development Server
```bash
npm run dev
```

Buka http://localhost:3000

### 5. Test Auth

#### Register Akun Baru:
1. Klik **"Belum punya akun? Register"**
2. Isi:
   - Email: email valid Anda
   - Password: min 6 karakter
3. Klik **"Register"**
4. **Cek email** → ada kode OTP 6 digit
5. Input kode OTP di form
6. ✅ Login otomatis!

#### Login:
1. Input email + password
2. Klik **"Login"**
3. ✅ Masuk ke dashboard!

---

## 🎯 Fitur Utama

### ✅ Yang Bisa Langsung Dicoba:

1. **Buat Board**
   - Klik tombol "Buat Board"
   - Isi nama board
   - Enter → board baru muncul!

2. **Buat Column**
   - Di board detail, klik "+ Tambah Column"
   - Contoh: "To Do", "In Progress", "Done"

3. **Buat Card**
   - Di setiap column, klik "+ Tambah Card"
   - Isi judul task

4. **Drag & Drop**
   - Drag card antar column
   - Reorder card dalam column
   - **Otomatis save!** ⚡

5. **Edit Card**
   - Klik card untuk buka detail
   - Edit: title, description, labels, due date
   - Tambah comment

6. **Invite Member**
   - Klik tombol "Invite Member"
   - Input User ID member lain (untuk MVP)

7. **Realtime Sync** 🔄
   - Buka board di 2 tab browser
   - Edit di tab A → update instant di tab B!

---

## 🧪 Test Realtime

Cara test real-time collaboration:

1. Login di Chrome
2. Buka board detail
3. Copy URL board
4. Buka **Incognito window** / browser lain
5. Login dengan **akun yang sama** (atau invite member lain)
6. Paste URL board
7. **Drag card di satu browser** → langsung update di browser lain! 🎉

---

## 📦 Deploy ke Vercel

### 1. Push ke GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/taskify-kanban.git
git push -u origin main
```

### 2. Deploy di Vercel
1. Buka https://vercel.com
2. Klik "New Project"
3. Import dari GitHub
4. Tambahkan **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Klik **"Deploy"**
6. ✅ Live dalam 2 menit!

### 3. Update Supabase (Production)
Di Supabase Dashboard:
- **Authentication** > **URL Configuration**
- Tambahkan production URL di **Site URL**

---

## ⚡ Tips & Tricks

### Performance
- Card drag-and-drop sudah di-optimize dengan order integer
- Optimistic UI: update instant, rollback jika error
- React Query caching: data tidak refetch terus-menerus

### Development
```bash
npm run dev       # Run dev server
npm run build     # Build production
npm run test      # Run tests
npm run seed      # Seed sample data (butuh login dulu!)
```

### Troubleshooting
- **Login loop?** → Clear browser cookies
- **OTP tidak masuk?** → Cek spam folder
- **Drag tidak work?** → Refresh page
- **Realtime tidak sync?** → Check browser console untuk error

---

## 🎓 Learn More

- **Full docs:** Lihat `README.md`
- **Auth setup:** Lihat `SETUP_AUTH.md`
- **Supabase docs:** https://supabase.com/docs
- **Next.js docs:** https://nextjs.org/docs

---

**Happy Kanban-ing! 🎉**

Need help? Check README.md atau SETUP_AUTH.md untuk panduan lengkap.

