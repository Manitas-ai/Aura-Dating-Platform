# Aura — Dating Platform
## Technical Specification · Proof of Concept · June 2026

---

## 1. Project Summary

**Aura** is a proof-of-concept dating platform with a premium, modern design.
The platform consists of two separate React applications sharing a single Supabase backend.
A lightweight username + password login (no email, max 5-character password) allows
multi-user simulation without a real authentication system.

**Design Tagline:** *"Find your wavelength."*

---

## 2. Tech Stack

| Layer         | Technology                          |
|---------------|-------------------------------------|
| Frontend      | React 18 + TypeScript + Vite        |
| Styling       | Tailwind CSS + shadcn/ui            |
| Icons         | Lucide React                        |
| Routing       | React Router v6                     |
| Backend / DB  | Supabase (Postgres + Storage + REST)|
| Hosting       | Netlify (free tier)                 |
| Source Control| GitHub                              |

---

## 3. Repository Structure

```
aura-dating-app/
├── user-app/               # React app — end users
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── lib/supabase.ts
│   │   └── types/index.ts
│   ├── package.json
│   └── vite.config.ts
├── admin-app/              # React app — admin panel
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── lib/supabase.ts
│   │   └── types/index.ts
│   ├── package.json
│   └── vite.config.ts
├── setup.sql               # Full DB schema + seed data
└── dating-app-spec.md      # This document
```

---

## 4. Authentication (PoC)

No real auth system. Simple username + plaintext password stored in the `profiles` table.

- Login screen: enter `username` + `password` (max 5 chars)
- Query Supabase: `SELECT * FROM profiles WHERE username = ? AND password = ?`
- On match: save `profile.id` to `localStorage` as `aura_profile_id`
- On logout: clear `localStorage`, redirect to login screen
- Enables switching between multiple seeded test users for PoC demo purposes

### Seed Credentials (10 pre-built profiles)

| Username | Password | Person              |
|----------|----------|---------------------|
| `alex`   | `sun42`  | Alex, 28, Berlin    |
| `sara`   | `wave7`  | Sara, 25, Munich    |
| `lena`   | `mint3`  | Lena, 31, Hamburg   |
| `marco`  | `fire9`  | Marco, 29, Cologne  |
| `julia`  | `sky11`  | Julia, 27, Frankfurt|
| `tom`    | `rain5`  | Tom, 33, Stuttgart  |
| `nina`   | `rose2`  | Nina, 26, Düsseldorf|
| `felix`  | `moon8`  | Felix, 30, Leipzig  |
| `mia`    | `star4`  | Mia, 24, Dresden    |
| `david`  | `blue6`  | David, 35, Nuremberg|

---

## 5. Database Schema

### `profiles`
Core user table. Doubles as the auth source.

| Column       | Type        | Notes                              |
|--------------|-------------|------------------------------------|
| id           | uuid PK     | auto-generated                     |
| username     | text UNIQUE | login handle (e.g. "alex")         |
| password     | text        | max 5 chars, plaintext (PoC only)  |
| name         | text        | display name (e.g. "Alex M.")      |
| age          | integer     |                                    |
| gender       | text        | man / woman / other                |
| looking_for  | text        | man / woman / everyone             |
| location     | text        | city name                          |
| occupation   | text        |                                    |
| bio          | text        | short personal description         |
| interests    | text[]      | array of tags, e.g. ["hiking","art"]|
| photo_url    | text        | primary profile photo URL          |
| status       | text        | active / suspended (default: active)|
| created_at   | timestamptz | default now()                      |

### `profile_photos`
Multiple photos per profile.

| Column     | Type    | Notes                        |
|------------|---------|------------------------------|
| id         | uuid PK |                              |
| profile_id | uuid FK | → profiles                   |
| photo_url  | text    |                              |
| is_primary | boolean | shown as cover photo         |
| sort_order | integer | display order                |

### `likes`
Directional like from one user to another.

| Column      | Type        | Notes            |
|-------------|-------------|------------------|
| id          | uuid PK     |                  |
| from_id     | uuid FK     | → profiles       |
| to_id       | uuid FK     | → profiles       |
| created_at  | timestamptz |                  |

Unique constraint on `(from_id, to_id)`.

### `matches`
Created automatically when two users like each other.

| Column      | Type        | Notes                  |
|-------------|-------------|------------------------|
| id          | uuid PK     |                        |
| profile_1_id| uuid FK     | → profiles             |
| profile_2_id| uuid FK     | → profiles             |
| created_at  | timestamptz |                        |

### `messages`
Simple per-match messaging.

| Column    | Type        | Notes                  |
|-----------|-------------|------------------------|
| id        | uuid PK     |                        |
| match_id  | uuid FK     | → matches              |
| sender_id | uuid FK     | → profiles             |
| content   | text        |                        |
| created_at| timestamptz |                        |

---

## 6. User App — Pages & Features

### Login Page `/`
- Username + password input
- Error state for wrong credentials
- On success → redirect to Discover

### Discover Page `/discover`
- Stack of profile cards (one at a time, centered)
- Card shows: primary photo, name, age, location, occupation, top 3 interests
- **Like** (heart) and **Pass** (X) buttons
- Already-seen and own profiles are excluded
- On last card: "You've seen everyone — check back later" empty state

### Profile Detail (modal/drawer)
- Full photo gallery (swipeable)
- Complete bio, all interests
- Like / Pass from within the detail view

### Matches Page `/matches`
- Grid of all mutual matches
- Each card shows photo, name, age, city
- "New" badge on unread matches
- Click → opens chat

### Messages Page `/messages`
- Left: list of match conversations (photo, name, last message preview)
- Right: chat thread with send input
- No real-time polling for PoC — refresh to see new messages
- Messages sorted by most recent

### My Profile Page `/profile`
- View/edit your own profile details
- Upload / manage photos
- Logout button

---

## 7. Admin App — Pages & Features

### Password Gate
- Single hardcoded admin password
- Stored in `localStorage` for the session

### Dashboard `/`
KPI cards:
- Total members
- New members today
- Total matches
- Total messages sent
- Chart: signups over last 7 days (simple bar using CSS)

### Members `/members`
Table of all profiles:
- Photo thumbnail, name, age, city, gender, status
- Filter: All / Active / Suspended
- Actions: View detail, Suspend / Reactivate, Delete
- Edit modal: all profile fields

### Matches `/matches`
Table of all matches:
- Both profile names + photos, match date
- Link to view their conversation

### Messages `/messages`
- Read all message threads (moderation view)
- Filter by match
- Delete individual messages

---

## 8. Design System

| Token         | Value                                   |
|---------------|-----------------------------------------|
| Background    | `#0f0f14` (deep slate)                  |
| Card bg       | `#16181f`                               |
| Card bg 2     | `#1e2028`                               |
| Border        | `#2a2d3a`                               |
| Text primary  | `#f0f0f8`                               |
| Text dim      | `#8888aa`                               |
| Accent rose   | `#e8537a` (primary CTA, likes, matches) |
| Accent violet | `#9b5de5` (secondary, highlights)       |
| Success green | `#10b981`                               |
| Font          | Inter (Google Fonts)                    |

---

## 9. Supabase Storage Buckets

| Bucket           | Used for                    |
|------------------|-----------------------------|
| `profile-photos` | User profile & gallery photos|

---

## 10. Scope

### In Scope (PoC)
- Username/password login + logout
- Profile discovery with like / pass
- Mutual match detection
- In-app messaging per match
- My Profile view + edit
- Admin: member management, matches view, messages moderation
- 10 seeded profiles ready to use
- Mobile-responsive design
- Deployed on Netlify

### Out of Scope (PoC)
- Real email / SMS auth (Supabase Auth)
- Push notifications
- Video / voice calls
- Premium subscriptions / payments
- AI matching algorithm
- Location-based filtering
- Profile verification / ID checks
- GDPR compliance tooling

---

## 11. Deployment

| Layer          | Service              | Notes                              |
|----------------|----------------------|------------------------------------|
| user-app       | Netlify              | Auto-deploy from `/user-app` folder|
| admin-app      | Netlify              | Auto-deploy from `/admin-app` folder|
| Database       | Supabase             | Existing account                   |
| Storage        | Supabase Storage     | `profile-photos` bucket            |
| Source control | GitHub               | One repo, two sub-folders          |
