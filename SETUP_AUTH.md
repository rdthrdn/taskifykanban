# Setup Supabase Auth untuk Taskify Kanban

## 🔐 Auth Flow: Email + Password dengan OTP Verification

Taskify Kanban menggunakan **Email/Password authentication** dengan **OTP code verification** (bukan magic link).

### Cara Kerja:

#### 1. **Register (Buat Akun Baru)**
- User input: Email + Password + Nama (opsional)
- Klik "Register"
- Supabase mengirim **email dengan kode OTP 6 digit**
- User input kode OTP di form
- Email terverifikasi → Login otomatis ✅

#### 2. **Login (Akun Sudah Ada)**
- User input: Email + Password
- Klik "Login"
- Jika email sudah verified → Login langsung ✅
- Jika email belum verified → Minta input kode OTP

---

## ⚙️ Setup Supabase

### 1. Enable Email/Password Auth

1. Buka **Supabase Dashboard**
2. Pilih project Anda
3. Ke menu **Authentication** > **Providers**
4. Pastikan **Email** provider **ENABLED**
5. **Confirm email:** Set ke **enabled** (agar user dapat OTP code)
6. **SAVE**

### 2. Email Templates (Opsional)

Di **Authentication** > **Email Templates**, Anda bisa customize:
- **Confirm signup** - Email yang berisi kode OTP
- Subject dan body email

Default template Supabase sudah include kode OTP 6 digit.

---

## 🧪 Testing Flow

### Test Register:

1. Run `npm run dev`
2. Buka `http://localhost:3000/login`
3. Klik **"Belum punya akun? Register"**
4. Isi form:
   - Nama: "Test User"
   - Email: email valid Anda
   - Password: minimal 6 karakter
5. Klik **"Register"**
6. **Cek email** (inbox/spam) → ada kode OTP 6 digit
7. **Input kode OTP** di form
8. Klik **"Verifikasi Email"**
9. ✅ Login otomatis → redirect ke `/boards`

### Test Login:

1. Buka `http://localhost:3000/login`
2. Pastikan mode **"Login"** (bukan register)
3. Input email + password yang sudah terdaftar
4. Klik **"Login"**
5. ✅ Login langsung (karena email sudah verified)

---

## 🔧 Troubleshooting

### **Masalah: Email OTP tidak masuk**
**Solusi:**
- ✅ Cek folder **Spam/Junk**
- ✅ Pastikan Email provider **enabled** di Supabase
- ✅ Cek **quota email** Supabase (free tier: 4 email/hour untuk development)
- ✅ Tunggu 1-2 menit (kadang delay)

### **Masalah: Kode OTP tidak valid**
**Solusi:**
- ✅ Pastikan input **6 digit** yang benar
- ✅ OTP expired (valid 1 jam) → klik **"Kirim ulang kode OTP"**
- ✅ Copy-paste kode langsung dari email (hindari typo)

### **Masalah: "Invalid login credentials"**
**Solusi:**
- ✅ Cek email dan password benar
- ✅ Pastikan akun sudah register
- ✅ Password **minimal 6 karakter**

### **Masalah: Redirect loop ke login terus**
**Solusi:**
- ✅ Clear browser cookies
- ✅ Restart dev server (`npm run dev`)
- ✅ Pastikan email sudah diverifikasi

---

## 📋 Checklist Setup

- [ ] Supabase project sudah dibuat
- [ ] SQL schema sudah dijalankan (lihat README.md)
- [ ] Email provider **enabled** di Authentication > Providers
- [ ] Confirm email **enabled**
- [ ] File `.env.local` sudah diisi dengan Supabase credentials
- [ ] `npm install` sudah dijalankan
- [ ] `npm run dev` berjalan tanpa error

---

## 🎯 Flow Diagram

```
┌─────────────┐
│   /login    │
└──────┬──────┘
       │
   ┌───▼────┐
   │ Toggle │
   │ Mode   │
   └───┬────┘
       │
   ┌───▼──────────┬──────────┐
   │              │          │
┌──▼───┐      ┌──▼─────┐    │
│Login │      │Register│    │
└──┬───┘      └───┬────┘    │
   │              │         │
   │         ┌────▼────┐    │
   │         │ Kirim   │    │
   │         │ OTP     │    │
   │         └────┬────┘    │
   │              │         │
   │         ┌────▼────┐    │
   │         │ Input   │    │
   │         │ OTP     │    │
   │         └────┬────┘    │
   │              │         │
   └────────┬─────┘         │
            │               │
       ┌────▼────┐          │
       │ Success │◄─────────┘
       └────┬────┘
            │
       ┌────▼────┐
       │ /boards │
       └─────────┘
```

---

**Selamat! Auth flow sudah siap digunakan 🎉**

