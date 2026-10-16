# gather · Campus Events Hub

A clean and fast event discovery web app for college students, built for the **Render72 Hackathon**.

---

## Why we built this

Every semester, campus WhatsApp groups, Instagram stories, and Telegram channels get flooded with unorganized event posters. Key details like team limits, deadlines, fees, and seat availability are almost always buried, and students end up missing out on great workshops and hackathons.

We built **gather** to bring all campus events into one single, easy-to-use place where anyone can find what's happening, check requirements, and register in seconds.

---

## Features

- **Event Discovery**: Browse upcoming hackathons, workshops, and cultural fests with live countdowns and quick filters (by category, free vs paid, online vs offline, technical vs non-technical).
- **Instant Search & Sorting**: Real-time search across event names, tags, and descriptions. Sort by date, available seats, or fee.
- **Detailed Event Pages**:
  - Remaining seats tracker and registration status
  - Schedule timeline with time slots and venues
  - Prize breakdowns (1st, 2nd, 3rd)
  - Eligibility and prerequisite checklists
  - Organizer info and coordinator contact links (email and phone)
  - Photo gallery with full-screen preview
- **Digital Pass & Calendar Sync**: Fill a quick registration form to get a personalized digital entry pass with a QR code and download an `.ics` file directly into your calendar (Google Calendar, Apple Calendar, Outlook).
- **Bookmarks**: Save events you want to attend later (stored locally in your browser).
- **Easter Egg**: Type `render72` anywhere on the site to unlock a secret 3D holographic audition pass!

---

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Build tool**: Vite
- **Routing**: React Router v7
- **Styling**: CSS (custom design tokens, dark mode)
- **API**: Render72 events endpoint (`https://render72.pages.dev/api/test/events`)

---

## Running Locally

Make sure you have Node.js (v20+) installed on your machine.

```bash
# 1. Clone the repo
git clone https://github.com/DevarasettyKuldeep/render72_1.git
cd render72_1

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Production Build

```bash
# Type check and build
npm run build

# Preview production build locally
npm run preview
```

---

## Project Structure

```
render72_agy/
├── public/              # Static assets, sitemap, robots.txt, icons
├── src/
│   ├── components/      # Reusable UI components (Navbar, EventCard, HoloCard, etc.)
│   ├── pages/           # Route views (HomePage, EventsPage, EventDetailPage)
│   ├── hooks/           # Custom React hooks (useEvents data fetching & cache)
│   ├── types.ts         # TypeScript interfaces
│   ├── constants.ts     # API endpoints and configuration
│   └── index.css        # Global design tokens and styles
├── vercel.json          # Deployment routing and cache headers
└── package.json
```

---

Made by Kuldeep for Render72.
