# Supabase Database Schema Instructions

This app is a **real-time production coordination platform** for church media teams.

The database must support:
- Multiple churches (multi-tenant)
- Multiple users per church
- Real-time synchronization
- Role-based access (Mixer, Cameraman, Admin)

---

## 🔑 Core Rules

When generating SQL for this app, always ensure:

1. **Every table includes `church_id`**
   - This is mandatory for data isolation.
   - No table should exist without it (except `churches`).

2. **Use UUIDs**
   - All primary keys must be UUIDs.
   - Use `uuid_generate_v4()`.

3. **Enable Realtime**
   - Tables that need live sync MUST support Supabase Realtime.
   - Avoid unnecessary tables being subscribed to.

4. **Foreign Keys Must Be Explicit**
   - Enforce relationships between:
     - churches
     - members
     - services
     - cameras
     - cues

---

## 🗂️ Required Tables

### 1. churches
Stores each church using the app.

Required columns:
- id (UUID, primary key)
- name (text)
- created_at (timestamp)

---

### 2. church_members
Maps users to churches and roles.

Required columns:
- id (UUID, primary key)
- user_id (UUID, from auth.users)
- church_id (UUID, FK → churches.id)
- role (text: Mixer | Cameraman | Admin)
- created_at (timestamp)

---

### 3. services
Represents a live service (e.g. Sunday 1st Service).

Required columns:
- id (UUID, primary key)
- church_id (UUID, FK)
- name (text)
- is_live (boolean)
- created_at (timestamp)

---

### 4. cameras
Represents camera operators and their state.

Required columns:
- id (UUID, primary key)
- church_id (UUID, FK)
- service_id (UUID, FK)
- operator_name (text)
- status (text: READY | NOT_READY | LIVE)
- updated_at (timestamp)

---

### 5. cues
Live cues sent by the mixer.

Required columns:
- id (UUID, primary key)
- church_id (UUID, FK)
- service_id (UUID, FK)
- message (text)
- created_at (timestamp)

---

## 🔐 Security & Access Control

- SQL must be compatible with **Row Level Security (RLS)**.
- Policies must ensure:
  - Users can only read/write rows matching their `church_id`.
  - No cross-church access is possible.

---

## 🚫 What NOT to Do

- Do NOT generate flat tables without `church_id`.
- Do NOT rely on frontend filtering for security.
- Do NOT use polling for updates.
- Do NOT assume a single church exists.

---

## ✅ Output Expectations

When generating SQL:
- Include `CREATE TABLE` statements.
- Include `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`.
- Include example RLS policies.
- Ensure the schema supports real-time collaboration.

This schema must be production-ready.