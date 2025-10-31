# Taskify Kanban

Aplikasi Kanban board modern dengan real-time collaboration menggunakan Next.js, TypeScript, Tailwind CSS, dan Supabase.

## ✨ Fitur

- 🔐 **Autentikasi Email/Password** - Register dan login dengan email + password, verifikasi OTP code 6 digit
- 📋 **Kanban Board** - Buat dan kelola multiple boards
- 📝 **Columns & Cards** - CRUD lengkap untuk columns dan cards
- 🎯 **Drag & Drop** - Smooth drag-and-drop dengan dnd-kit
- ⚡ **Optimistic UI** - Update instant dengan rollback otomatis saat gagal
- 🔄 **Realtime Sync** - Sinkronisasi real-time antar tab/user dengan Supabase Realtime
- 💬 **Comments** - Kolaborasi dengan comment pada cards
- 👥 **Team Collaboration** - Invite member ke board
- 🎨 **Modern UI** - Responsive design dengan Tailwind CSS
- ♿ **Accessibility** - Focus ring, aria-labels, dan keyboard navigation

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase
- **State Management**: React Query (TanStack Query)
- **Drag & Drop**: @dnd-kit
- **Forms**: React Hook Form + Zod
- **Animation**: Framer Motion
- **Testing**: Vitest + Testing Library

## 📋 Prerequisites

- Node.js 18+ dan npm/pnpm/yarn
- Akun Supabase (gratis)

## 🚀 Setup Local

### 1. Clone Repository

```bash
git clone <repository-url>
cd taskify-kanban
```

### 2. Install Dependencies

```bash
npm install
# atau
pnpm install
# atau
yarn install
```

### 3. Setup Supabase

1. Buat project baru di [Supabase](https://supabase.com)
2. Di SQL Editor, jalankan script berikut untuk membuat tables:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Boards table
create table boards (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  owner_id uuid references profiles(id) on delete cascade not null,
  members uuid[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Columns table
create table columns (
  id uuid default uuid_generate_v4() primary key,
  board_id uuid references boards(id) on delete cascade not null,
  title text not null,
  "order" integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Cards table
create table cards (
  id uuid default uuid_generate_v4() primary key,
  column_id uuid references columns(id) on delete cascade not null,
  title text not null,
  description text default '',
  labels text[] default '{}',
  due_date timestamp with time zone,
  assignees uuid[] default '{}',
  "order" integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Comments table
create table comments (
  id uuid default uuid_generate_v4() primary key,
  card_id uuid references cards(id) on delete cascade not null,
  author_id uuid references profiles(id) on delete cascade not null,
  body text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table boards enable row level security;
alter table columns enable row level security;
alter table cards enable row level security;
alter table comments enable row level security;

-- RLS Policies

-- Profiles: users can read all profiles, update only their own
create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- Boards: users can read boards they own or are members of
create policy "Users can view boards they own or are members of"
  on boards for select using (
    auth.uid() = owner_id or auth.uid() = any(members)
  );

create policy "Users can create boards"
  on boards for insert with check (auth.uid() = owner_id);

create policy "Board owners can update their boards"
  on boards for update using (auth.uid() = owner_id);

create policy "Board owners can delete their boards"
  on boards for delete using (auth.uid() = owner_id);

-- Columns: access via board membership
create policy "Users can view columns of accessible boards"
  on columns for select using (
    exists (
      select 1 from boards
      where boards.id = columns.board_id
      and (boards.owner_id = auth.uid() or auth.uid() = any(boards.members))
    )
  );

create policy "Board members can create columns"
  on columns for insert with check (
    exists (
      select 1 from boards
      where boards.id = columns.board_id
      and (boards.owner_id = auth.uid() or auth.uid() = any(boards.members))
    )
  );

create policy "Board members can update columns"
  on columns for update using (
    exists (
      select 1 from boards
      where boards.id = columns.board_id
      and (boards.owner_id = auth.uid() or auth.uid() = any(boards.members))
    )
  );

create policy "Board members can delete columns"
  on columns for delete using (
    exists (
      select 1 from boards
      where boards.id = columns.board_id
      and (boards.owner_id = auth.uid() or auth.uid() = any(boards.members))
    )
  );

-- Cards: access via board membership (through columns)
create policy "Users can view cards of accessible boards"
  on cards for select using (
    exists (
      select 1 from columns
      join boards on boards.id = columns.board_id
      where columns.id = cards.column_id
      and (boards.owner_id = auth.uid() or auth.uid() = any(boards.members))
    )
  );

create policy "Board members can create cards"
  on cards for insert with check (
    exists (
      select 1 from columns
      join boards on boards.id = columns.board_id
      where columns.id = cards.column_id
      and (boards.owner_id = auth.uid() or auth.uid() = any(boards.members))
    )
  );

create policy "Board members can update cards"
  on cards for update using (
    exists (
      select 1 from columns
      join boards on boards.id = columns.board_id
      where columns.id = cards.column_id
      and (boards.owner_id = auth.uid() or auth.uid() = any(boards.members))
    )
  );

create policy "Board members can delete cards"
  on cards for delete using (
    exists (
      select 1 from columns
      join boards on boards.id = columns.board_id
      where columns.id = cards.column_id
      and (boards.owner_id = auth.uid() or auth.uid() = any(boards.members))
    )
  );

-- Comments: access via board membership (through cards -> columns)
create policy "Users can view comments of accessible cards"
  on comments for select using (
    exists (
      select 1 from cards
      join columns on columns.id = cards.column_id
      join boards on boards.id = columns.board_id
      where cards.id = comments.card_id
      and (boards.owner_id = auth.uid() or auth.uid() = any(boards.members))
    )
  );

create policy "Board members can create comments"
  on comments for insert with check (
    exists (
      select 1 from cards
      join columns on columns.id = cards.column_id
      join boards on boards.id = columns.board_id
      where cards.id = comments.card_id
      and (boards.owner_id = auth.uid() or auth.uid() = any(boards.members))
    )
  );

-- Enable Realtime
alter publication supabase_realtime add table columns;
alter publication supabase_realtime add table cards;

-- Function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call function on new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

3. Di Supabase Dashboard, aktifkan Email Auth:
   - Ke menu **Authentication** > **Providers**
   - Pastikan **Email** provider **ENABLED**
   - Set **Confirm email** ke **enabled** (untuk OTP verification)
   - **SAVE**

### 4. Environment Variables

Copy `.env.local.example` ke `.env.local` dan isi dengan kredensial Supabase:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with UI
npm run test:ui
```

## 📦 Build untuk Production

```bash
npm run build
npm start
```

## 🚀 Deploy ke Vercel

1. Push code ke GitHub
2. Import project di [Vercel](https://vercel.com)
3. Tambahkan environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## 📖 Struktur Folder

```
taskify-kanban/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth routes (login)
│   ├── (app)/               # Protected app routes
│   │   └── boards/          # Board list & detail pages
│   ├── api/                 # API routes
│   └── layout.tsx           # Root layout
├── components/
│   ├── ui/                  # Reusable UI components
│   ├── board/               # Board-specific components
│   └── dnd/                 # Drag-and-drop components
├── lib/
│   ├── hooks/               # Custom React hooks
│   ├── supabase.server.ts   # Server-side Supabase client
│   ├── supabase.browser.ts  # Client-side Supabase client
│   ├── ordering.ts          # Ordering logic untuk DnD
│   ├── realtime.ts          # Realtime subscription helpers
│   └── types.ts             # TypeScript types
├── providers/               # React Context providers
└── styles/                  # Global styles
```

## 🎯 Fitur Utama

### Drag & Drop dengan Ordering Stabil

Menggunakan integer gap-based ordering (100, 200, 300, ...) untuk performa optimal:
- Insert di tengah: kalkulasi average
- Normalisasi otomatis saat gap terlalu kecil
- Tidak ada race condition

### Optimistic UI

React Query mutations dengan:
- Update cache instantly
- Rollback otomatis saat error
- Invalidate & refresh dari server

### Real-time Sync

Supabase Realtime broadcast untuk:
- Column changes (INSERT, UPDATE, DELETE)
- Card changes (INSERT, UPDATE, DELETE)
- Auto-merge ke React Query cache

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - feel free to use this project for learning or production.

## 👨‍💻 Author

Dibuat oleh Gandhi Ert Julio

---

**Happy Kanban-ing! 🎉**

