# Questlog — a Life RPG

Turn real tasks into quests. Complete them for XP and gold, level up on a
non-linear curve, build a daily streak, and spend gold in the Trading Post
on cosmetic themes, badges, and titles.

Built for the IIT Bhubaneswar web hackathon, following the Life RPG PRD:
secure auth, a real backend + database (not localStorage), a non-linear
leveling engine, streaks, attribute-based tasks, and a gold economy.

## Stack

| Layer     | Choice                                                          |
|-----------|------------------------------------------------------------------|
| Frontend  | React 18 + Vite, Tailwind CSS, Framer Motion, React Router       |
| Backend   | FastAPI (Python), SQLAlchemy ORM, custom JWT auth (bcrypt hashing)|
| Database  | SQLite for local dev, PostgreSQL in production (one env var swap)|

All reward math (XP, gold, level-ups, streaks) is computed **server-side**.
The client never gets to say how much a quest is worth — it only tells the
server which quest was completed, and the server looks up the reward from
the task row it created. This is what stops the "edit the request in devtools"
class of cheating the brief calls out.

## Project structure

```
liferpg/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app, CORS, startup seeding
│   │   ├── models.py          # SQLAlchemy models (User, Character, Task, Shop, Inventory)
│   │   ├── schemas.py         # Pydantic request/response schemas
│   │   ├── auth.py            # JWT + bcrypt password hashing
│   │   ├── leveling.py        # XP curve, level-up, streak logic
│   │   ├── serializers.py
│   │   ├── seed.py            # Shop catalog seed data
│   │   └── routers/
│   │       ├── auth_router.py
│   │       ├── character_router.py
│   │       ├── tasks_router.py
│   │       └── shop_router.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/client.js       # Axios instance + endpoint wrappers
    │   ├── context/AuthContext.jsx
    │   ├── pages/{Login,Register,Dashboard}.jsx
    │   ├── components/         # CharacterSheet, TaskList, Shop, LevelUpOverlay, ...
    │   └── utils/leveling.js
    ├── package.json
    └── .env.example
```

## Running locally

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # defaults work as-is for local dev (SQLite)
uvicorn app.main:app --reload --port 8000
```

The API is now at `http://localhost:8000`. Interactive docs (Swagger UI) are
at `http://localhost:8000/docs` — useful for demoing the API directly.

The first run creates `liferpg.db` (SQLite) in `backend/` and seeds the shop
catalog automatically. No manual migration step needed for local dev.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env            # VITE_API_URL=http://localhost:8000
npm run dev
```

Open `http://localhost:5173`, register a character, and start questing.

## Core systems (mapped to the PRD checklist)

- **Auth & security**: JWT bearer tokens, bcrypt-hashed passwords, every
  task/character/shop query is filtered by `user_id` from the token — a
  user can never see or touch another user's data. Attempting to act on
  someone else's task returns a plain 404, not a 403, so existence isn't
  leaked either.
- **Database & CRUD**: SQLAlchemy models for Users, Characters, Tasks,
  ShopItemCatalog, and InventoryItem. Full create/read/update/delete on
  tasks, all persisted (survives a refresh — see `backend/app/models.py`).
- **Non-linear leveling**: `xp_to_next(level) = floor(80 * level^1.45)`
  (`backend/app/leveling.py`). Level 2 needs 80 XP, level 10 needs ~2,050,
  level 20 needs ~5,700 — the curve visibly steepens.
- **Streaks**: `update_streak()` compares the completion date to
  `last_activity_date`. Same day → no double count. Next calendar day →
  streak +1. Any gap → streak resets to 1.
- **Attributes**: each quest is tagged with one of five attributes
  (Intellect, Strength, Discipline, Creativity, Vitality); completing it
  increments that stat by 1.
- **Economy**: gold is earned per quest (scaled by difficulty) and spent in
  the Trading Post on themes/badges/titles. Purchase price is re-validated
  against the server-side catalog, not trusted from the client.
- **Responsive & accessible**: mobile-first grid that stacks on narrow
  screens, visible focus rings everywhere, full keyboard operability
  (Tab/Enter/Space/Escape), `aria-live` on the XP bar and level-up overlay,
  `prefers-reduced-motion` respected.
- **Robustness**: empty/blank quest titles are rejected both client- and
  server-side; a dropped request during "complete" rolls the optimistic UI
  update back instead of silently losing state; a 401 anywhere clears the
  session and returns to `/login` instead of showing a broken screen.

## Deploying

### Database (pick one, both have free tiers)
- **Neon** (neon.tech) or **Supabase** — create a project, copy the
  Postgres connection string.

### Backend → Render
1. Push this repo to GitHub.
2. Render → New → Web Service → connect the repo, root directory `backend`.
3. Build command: `pip install -r requirements.txt`
   Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Environment variables: `SECRET_KEY` (generate a long random string),
   `DATABASE_URL` (from Neon/Supabase), `CORS_ORIGINS` (your Vercel URL,
   added after step below — you can redeploy to update it).

### Frontend → Vercel
1. Vercel → New Project → import the repo, root directory `frontend`.
2. Framework preset: Vite. Build command `npm run build`, output `dist`.
3. Environment variable: `VITE_API_URL` = your Render backend URL.
4. Deploy, then go back to Render and set `CORS_ORIGINS` to the Vercel URL
   it gives you, and redeploy the backend.

### Before submitting
- Confirm the GitHub repo is **public** and has more than 3 real commits.
- Confirm the live frontend URL loads with a cold cache (no login wall in
  front of it) and the backend URL responds at `/`.
- Record the 90–180s walkthrough: sign up → add a quest → complete it (show
  the level-up moment) → refresh the page to prove the data persisted from
  the database, not localStorage.

## Notes on the leveling formula

If you want a different pacing (faster early game, slower late game, etc.),
the only two numbers that matter are `BASE_XP` and `EXPONENT` in
`backend/app/leveling.py` — mirror any change in
`frontend/src/utils/leveling.js` so the client-side display matches what
the server actually awards.
