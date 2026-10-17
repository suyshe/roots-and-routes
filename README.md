# Roots & Routes — Community Map & Memories

A community map for class projects: neighbours share **memories**, discover
**heritage** sites, and report **safety** and **accessibility** issues — all on
one interactive map.

> Built with **React.js** + **Leaflet/OpenStreetMap** on the frontend, a
> **Node.js (Express)** API in the middle, **Supabase** (optional) for the
> database, and **Google Sheets / Google Forms** for data collection.

## 🎨 Brand colours

Warm, earthy, community-focused palette. **Green = the Roots & Routes brand**,
while the four marker colours stay fixed across the whole website.

| Colour | Hex | Usage |
| --- | --- | --- |
| 🌲 Deep Forest Green | `#06483F` | Sidebar, primary buttons, branding |
| 🌿 Dark Teal Green | `#003B35` | Secondary dark areas |
| 🥛 Warm Cream | `#F7F5EE` | Main background |
| 🤍 Soft White | `#FFFFFF` | Cards, navbar, panels |
| 🟠 Heritage Orange | `#F5A000` | Memories, highlights |
| 🟣 Heritage Purple | `#7B4FD3` | Historical / heritage locations |
| 🔴 Safety Red | `#E53935` | Safety issues / warnings |
| 🔵 Accessibility Blue | `#168FD0` | Accessibility markers |
| 🌱 Light Sage | `#E5F1E9` | Contribution panels / subtle backgrounds |
| 🖤 Charcoal | `#202522` | Main text |
| 🩶 Muted Gray | `#6B716D` | Secondary text |

![stack](https://img.shields.io/badge/React-18-61dafb) ![stack](https://img.shields.io/badge/Node-Express-339933) ![stack](https://img.shields.io/badge/Leaflet-OSM-1a9e49) ![stack](https://img.shields.io/badge/Supabase-optional-3fcf8e) ![stack](https://img.shields.io/badge/Google-Sheets-blue)

---

## ✨ Features

| Feature | What it does |
| --- | --- |
| 🗺️ **Interactive map** | Leaflet + OpenStreetMap with custom category pins, zoom/locate controls, and search |
| 🔎 **Search** | Find a post by its content or search for a place and fly to it on the map |
| 🔎 **Filters** | Toggle Memories / Heritage / Safety / Accessibility on and off, from the sidebar or floating chips |
| 📜 **Community memory** | Add historical stories, traditions & events with a title, description, photo, and a map pin |
| 🏛️ **Heritage markers** | Curated landmarks & protected places, shown on the map and in the community feed |
| ⚠️ **Safety reporting** | Report potholes, poor lighting, dangerous crossings… with severity and status |
| ♿ **Accessibility reporting** | Wheelchair barriers, broken footpaths, missing ramps, difficult crossings, and more |
| 📋 **Reports page** | All reports in one place, filter by type, mark as resolved / reopen |
| 🏠 **Community dashboard** | Stats, trending memories, recent reports, top contributors |
| 📷 **Photo uploads** | Attach a photo to any pin (stored on the server, or in Supabase storage later) |
| 🔐 **Google sign-in and roles** | Signed-in users manage their own posts; configured admins can remove any post |
| 📊 **Google Sheets** | One-click CSV export and an optional live sync to a spreadsheet via Apps Script |
| 📝 **Google Forms** | Link your data-collection form and point the community to it from the UI |

---

## 🚀 Quick start

Requires **Node 18+** (tested on Node 20/22/25).

```bash
cd civicpulse
npm run setup      # installs root + server + frontend dependencies
npm run dev        # starts the API (:4000) and the React app (:5173)
```

Open **http://localhost:5173** — the app starts with an empty post list and
shows posts created by signed-in users. If port `4000` is taken, set `PORT` in the root `.env` and update the
proxy in `frontend/vite.config.js`.

### One command for everything else

```bash
npm run build   # build the React app into frontend/dist
npm start       # serve the built app + API from one port (:4000)
```

### Backend unavailable

If the API is unreachable, the app shows an offline notice and does not replace
real posts with sample data.

## Deploying with Vercel

Vercel can host the React frontend, but it does not start `server/index.js` for
this project. Deploy the frontend and API as two services:

1. Deploy `frontend` to Vercel. Set **Root Directory** to `frontend`, **Build
   Command** to `npm run build`, and **Output Directory** to `dist`.
2. Deploy `server` to a Node service such as Render or Railway. Set its start
   command to `npm start` and make sure the service listens on the provider's
   `PORT` value.
3. In the Vercel project, add `VITE_API_URL` with the public API URL, for
   example `https://roots-and-routes-api.example.com`, then redeploy. Do not
   include a trailing slash.
4. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, and `ADMIN_EMAILS` in the API environment.
   Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Vercel frontend
   environment too, then redeploy. Run `server/db/supabase-posts-schema.sql` in
   Supabase. Production server filesystems are not persistent, so the default
   local JSON backend should only be used for local development.

After deployment, opening the API URL at `/api/config` should return JSON. The
Vercel site will then send add-memory requests to that API instead of trying to
call its own static host. `npm run build` only builds the frontend; it does not
start the backend.

---

## 🗄️ Database: local JSON (default) or Supabase

Out of the box the API stores markers in `server/data/markers.json` — zero setup,
perfect for a class demo. To switch to **Supabase**:

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL editor, run the schema in **`server/db/init.sql`** (creates the
   `markers` table + row-level-security policies).
3. Copy the project-root `.env.example` to `.env` in the project root and fill in:

   ```env
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=YOUR-SERVICE-ROLE-KEY
   ```

4. Restart the server — it now reads/writes Supabase automatically.

## 🔐 Google sign-in and account roles

Google sign-in uses Supabase Auth. Make one `.env` file in the project root by
copying `.env.example`; Vite and the API both read it. Obtain and set the values
as follows:

1. **`VITE_SUPABASE_URL`** — create/open your project at
   [supabase.com](https://supabase.com), then find **Project URL** under
   **Project Settings → API** (or **Settings → API**).
2. **`VITE_SUPABASE_ANON_KEY`** — on that API settings page, copy the
   **anon/public** project API key. It is safe to use in the browser; do not use
   a service-role/secret key here.
3. **Google OAuth client ID and secret** — in
   [Google Cloud Console](https://console.cloud.google.com/), create/select a
   project, configure the OAuth consent screen, and create an OAuth client ID
   of type **Web application**. Add the callback URL shown under Supabase
   **Authentication → Sign In / Providers → Google** to Google's authorized
   redirect URIs. It looks like
   `https://<project-ref>.supabase.co/auth/v1/callback`. Enable Google in the
   Supabase Google provider settings and paste the client ID and secret there;
   these credentials are entered in Supabase, not in the app `.env`.
4. In Supabase, set **Authentication → URL Configuration → Site URL** to
   `http://localhost:5173` and add it under **Redirect URLs**. Add your deployed
   frontend URL there as well when deploying.
5. **`ADMIN_EMAILS`** — enter the Google account email(s) to designate as
   admins, separated by commas. You choose these addresses; they are not
   generated by Supabase. Other signed-in accounts are normal users.
6. **`SUPABASE_SERVICE_ROLE_KEY`** — optional; only needed to store posts in
   Supabase instead of local JSON. Find the `service_role` secret (or legacy
   service-role key) under **Project Settings → API Keys**. Keep it only in the
   root `.env`; never expose it in the frontend or add a `VITE_` prefix. Run
   `server/db/supabase-posts-schema.sql` in the Supabase SQL editor.

For local Google authentication, set the two `VITE_SUPABASE_*` values and
`ADMIN_EMAILS`. Leave `SUPABASE_SERVICE_ROLE_KEY` blank to use the local JSON
database. Other optional root `.env.example` values:

- `PORT`, `MAP_CENTER_LAT`, `MAP_CENTER_LNG`, and `MAP_ZOOM` set the API port
  and initial map view.
- `VITE_API_URL` is only needed when deploying the frontend and API separately;
  set it to the API's public URL without a trailing slash.
- `GOOGLE_FORM_URL` links your Google Form in the app.
- `GOOGLE_SHEETS_WEBHOOK_URL` is the deployed Apps Script web-app URL for sheet
  sync.

The API verifies access tokens with Supabase and uses the verified identity for
post ownership. The admin email list and service-role key are never sent to the
browser.

Place-name searches use OpenStreetMap's Nominatim service. Searches run only
when submitted (not on every keystroke) and are throttled and cached by the API.

All signed-in Google users can create posts and delete only their own posts.
Emails in the server-side `ADMIN_EMAILS` list get the Admin role and can delete
any post. Do not put admin email configuration or the service-role key in a
`VITE_` variable or frontend file. Apply the schema in
`server/db/supabase-posts-schema.sql` in the Supabase SQL editor.

> The API uses the service-role key for server-side database access and
> explicitly verifies Google users and post permissions. Never expose the
> service-role key to the browser or commit it to source control.

### Sample data

The server does not add sample records automatically on startup. To add the
sample dataset from `server/lib/seedData.js` to the currently configured
database, run `npm run seed` from the project root. With Supabase configured
(including `SUPABASE_SERVICE_ROLE_KEY`) and the schema already applied, this
inserts the sample posts into `public.posts` only if that table is empty.
Otherwise, it reports that the database is not empty and leaves all rows
untouched. Without Supabase credentials, it seeds the local JSON database if
that file is empty.

---

## 📊 Google Sheets & Forms

### Option A — CSV export (always works)

The **“Export CSV”** button in the sidebar downloads every marker as a CSV.
Import it in Google Sheets via *File → Import*. The CSV includes a UTF-8 BOM so
accents display correctly.

### Option B — Live sync to a spreadsheet

1. Create a Google Sheet with the header row:
   `Type, Category, Title, Description, Latitude, Longitude, Severity, Status, Photo URL, Author, Date label, Created at`
2. *Extensions → Apps Script*, paste the contents of **`google-apps-script.gs`**,
   save, then *Deploy → New deployment → Web app*:
   - Execute as: **Me**
   - Who has access: **Anyone**
3. Copy the web app URL into the root `.env`:

   ```env
   GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
   ```

Now the **“Sync to Google Sheets”** button pushes every marker into the sheet.

### Option C — Google Forms for data collection

Point `GOOGLE_FORM_URL` in the root `.env` at a Google Form you use to collect
entries offline (e.g. at community events). The link appears in the sidebar and
on the Community dashboard. Responses land in the same spreadsheet, which you
can import back into the map with the CSV export.

---

## 🗺️ Changing the map centre & sample data

- **Map centre / zoom** — set `MAP_CENTER_LAT`, `MAP_CENTER_LNG`, `MAP_ZOOM` in the root `.env`.
- **Sample markers** — edit `server/lib/seedData.js` with places from your own
  town (coordinates are lat/lng decimal degrees). Delete
  `server/data/markers.json` and restart to reseed. The frontend's demo-mode copy
  lives in `frontend/src/utils/demoData.js`.

---

## 📁 Project structure

```
civicpulse/
├── server/                  # Node.js + Express API
│   ├── index.js             # routes, uploads, static client serving
│   ├── lib/
│   │   ├── db.js            # data layer: local JSON ⇄ Supabase
│   │   ├── seedData.js      # sample markers (edit me!)
│   │   └── sheets.js        # CSV + Apps Script sync
│   ├── db/init.sql          # Supabase schema (run in SQL editor)
│   └── data/                # local JSON database (auto-created)
├── frontend/                # React + Vite app
│   ├── src/
│   │   ├── App.jsx          # state + navigation (entry: main.jsx)
│   │   ├── components/      # reusable UI: TopNav, Sidebar, MapView, panels, modal…
│   │   ├── pages/           # Community & Reports pages
│   │   ├── services/        # api.js — backend API client
│   │   ├── hooks/           # useMarkers, useToasts
│   │   ├── utils/           # marker metadata, demo data, formatting
│   │   └── styles/          # index.css — design system
│   └── vite.config.js       # dev proxy → :4000
├── google-apps-script.gs    # Google Sheets webhook (Option B)
└── README.md
```

---

## 🔌 API reference

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/config` | Map centre, zoom, Google Form URL |
| GET | `/api/markers` | All markers (`?type=safety` to filter) |
| POST | `/api/markers` | Create a marker |
| PATCH | `/api/markers/:id` | Update status / severity / title / description / photo |
| DELETE | `/api/markers/:id` | Remove a marker |
| POST | `/api/upload` | Upload a photo (`multipart/form-data`, field `photo`) |
| GET | `/api/stats` | Counts per category |
| GET | `/api/export.csv` | Full CSV export |
| POST | `/api/sync-sheets` | Push markers to the Google Sheet webhook |

---

## 🧭 Design

Uses the **Roots & Routes** palette above with **Public Sans** typography: deep
forest green brand surfaces, warm cream backgrounds, and four fixed category
colours — orange (memories), purple (heritage), red (safety), blue
(accessibility). The map UI adapts to mobile (panels become bottom sheets).

Enjoy your demo! 🎉
