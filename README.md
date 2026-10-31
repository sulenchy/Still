# Still — A Living Family Archive

[![Live Demo](https://img.shields.io/badge/Demo-Live%20Site-183e32?style=for-the-badge&logo=githubpages&logoColor=white)](https://sulenchy.github.io/still/)
[![Figma Prototype](https://img.shields.io/badge/Figma-Prototype-F24E1E?style=for-the-badge&logo=figma&logoColor=white)](https://forum-remake-98457982.figma.site/)
[![Accessibility](https://img.shields.io/badge/WCAG%202.1-AAA%20Ready-success?style=for-the-badge&logo=w3c&logoColor=white)](#-web-accessibility-in-practice-a11y-first-engineering)
[![React](https://img.shields.io/badge/React-19-149eca?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

> **"Hold on to the little things."**  
> An editorial, living archive for family memories. The landing page is a **React** application styled with **Tailwind CSS**. The original semantic **HTML** and **CSS** page is preserved in [`old-template`](old-template/).

---

## 🌟 Quick Links

- 🌐 **[Live Website Demo](https://still-rg7h.onrender.com/)**
- 🎨 **[Figma Prototype](https://forum-remake-98457982.figma.site/)**
- ♿ **[Web Accessibility Architecture](#-web-accessibility-in-practice-a11y-first-engineering)**
- 🚀 **[Quick Start & Preview](#-quick-start)**
- 🔐 **[Supabase](#-supabase)**
- 🗄️ **[Migrations](#migrations)**
- 🧭 **[Direct routes in production](#-direct-routes-in-production)**
- 📐 **[Design System & Tokens](#-design-system--tokens)**
- 🗂️ **[Original HTML & CSS landing](old-template/)**

---

## 📖 About Still

Most photo albums today are either chaotic camera rolls or generic cloud drives. **Still** takes an editorial approach: turning everyday family moments, forgotten voices, and intimate notes into a considered, timeless collection.

The landing page has been rebuilt as a React application. Layout, color, and type come from Tailwind CSS, with the palette defined as theme tokens in `src/styles.css`. Page sections live in `src/components`, and shared copy and class strings live in `src/constants`.

Sign-in, sign-up, and the protected archive use [Supabase Auth](#-supabase).

The earlier static landing page — `index.html` and `styles.css`, with no JavaScript — has moved to `old-template/`. That folder is the reference for the original markup and styles. The app in `src/` is the page to run and change.

Interactive behavior that used to be HTML and CSS alone is now React state:

- The mobile menu opens from a button click, and closes on a link click or Escape.
- The gallery filter shows memories for the selected person.
- The contact form checks the name, email, topic, and message before it accepts a submission.

---

## ♿ Web Accessibility in Practice (a11y-First Engineering)

Web accessibility is built into the markup and interaction, following [WCAG 2.1 AA/AAA guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/). The same landmarks, names, and contrast carry over from the original page. React supplies the behavior that a checkbox hack used to provide.

### 1. Semantic Landmark Architecture
Screen reader users navigate web pages primarily through landmarks and headings. Still keeps an unambiguous document structure:

- **Landmark Elements**: `<header>`, `<main id="main-content">`, `<section>`, `<article>`, `<figure>`, `<figcaption>`, and `<footer>`.
- **Heading Hierarchy**: Strict `<h1>` → `<h2>` → `<h3>` hierarchy.
- **Section Labeling with `aria-labelledby`**: Every major section points at its heading.

```jsx
<section id="how-it-works" aria-labelledby="story-title">
  <h2 id="story-title">
    Every picture has a story. <em>Help it remember.</em>
  </h2>
</section>
```

### 2. Skip to Main Content (Bypass Blocks)
Keyboard and switch-device users often have to tab through repetitive header links. `SkipLink` sits off-screen until it receives focus, then moves focus to `<main id="main-content">`.

### 3. Accessible Name Computation & Decorative Icon Isolation
Icon-only controls carry an explicit name. Decorative icons are hidden from assistive technology.

```jsx
<button type="button" aria-label={`Open ${memory.title}`}>
  <ArrowIcon />
</button>
```

`ArrowIcon` and `PlusIcon` set `aria-hidden="true"` on the SVG. The brand mark does the same on its decorative bars, while the home link is named with `aria-label="Still home"`.

### 4. Human-Centered Alternative Text
Photographs use narrative `alt` text. Gallery copy, including each image `alt`, lives with the memory in `src/constants/data.js`.

### 5. Visible Focus Rings (`:focus-visible`)
Keyboard focus uses a high-contrast outline. Form fields move that cue to the bottom border so the editorial underline stays intact.

```css
:focus-visible {
  outline: 2px solid var(--color-forest);
  outline-offset: 3px;
}
```

### 6. Motor & Touch Accessibility (WCAG 2.5.5 / 2.5.8)
Primary actions use `min-h-11` (44px) so the touch target meets the minimum size.

### 7. Vestibular Disorder & Reduced Motion Support
`src/styles.css` honors `prefers-reduced-motion: reduce` by collapsing animation, transition, and smooth-scroll duration.

### 8. High Color Contrast & Readability
- Deep ink (`#21342d`) and forest green (`#102e26`) sit on warm paper (`#fffdf7`) and cream (`#f7f2e8`).
- Contrast ratios exceed **10:1**, above the WCAG AAA thresholds (7:1 for regular text, 4.5:1 for large text).
- Role badges pair a letter initial with the role name, so color is not the only signal.

### 9. Mobile Navigation
Below the `desk` breakpoint (981px), the header shows a menu button. It toggles the navigation with React state, exposes `aria-expanded`, and points at the nav with `aria-controls`. Escape and choosing a link both close the menu. At desktop width the links stay in the header and the button is hidden.

The original checkbox-and-label menu remains in `old-template/` for the no-JavaScript version.

---

## 🎨 Design System & Tokens

The palette is defined in the Tailwind `@theme` block in `src/styles.css`. Utilities use the token name: `bg-forest`, `text-ink`, `font-serif`, `border-line`.

| Token | Value | Usage |
| :--- | :--- | :--- |
| `--color-forest` | `#183e32` | Primary buttons, active states, brand tone |
| `--color-deep` | `#102e26` | Dark sections, footer |
| `--color-ink` | `#21342d` | Primary text |
| `--color-paper` | `#fffdf7` | Page background |
| `--color-cream` | `#f7f2e8` | Warm containers |
| `--color-sage` | `#9eb7a5` | Soft borders and accents |
| `--color-peach` | `#e7a486` | Highlights and emphasis |
| `--color-pale` | `#dbe5d9` | Quiet fills |
| `--color-beige` | `#f1d5a5` | Notes and cards |
| `--font-serif` | `"Instrument Serif", Georgia, serif` | Headlines |
| `--font-sans` | `"DM Sans", Arial, sans-serif` | Body text |
| `--breakpoint-desk` | `981px` | Desktop layout (`desk:`) |

The original custom properties (`--forest`, `--ink`, and the rest) still live in `old-template/styles.css`.

---

## 📁 Project Structure

```text
Still/
├── index.html                 # Vite entry shell (#root)
├── package.json
├── pnpm-lock.yaml
├── vite.config.js             # React and Tailwind Vite plugins
├── public/
│   └── images/                # AVIF imagery used by the app
├── supabase/
│   └── migrations/            # SQL applied with the Supabase CLI
├── src/
│   ├── main.jsx               # React root
│   ├── app.jsx                # Routes: home, login, signup, dashboard
│   ├── styles.css             # Tailwind theme and base rules
│   ├── app/
│   │   └── store.js           # Redux store
│   ├── features/
│   │   ├── auth/              # Session slice, listener, and sign-out
│   │   └── archive/           # Saved people, memories, capsules, and files
│   ├── lib/
│   │   └── supabase.js        # Supabase client
│   ├── pages/                 # Landing, login, signup, dashboard
│   ├── components/            # Header, hero, gallery, contact, footer
│   └── constants/             # Class strings and page data
└── old-template/              # Original HTML and CSS landing page
    ├── index.html
    ├── styles.css
    ├── public/images/
    └── .github/workflows/     # Static GitHub Pages workflow for that page
```

---

## 🚀 Quick Start

The app uses [pnpm](https://pnpm.io/). From the project root:

```bash
pnpm install
```

Create [`.env.local`](#-supabase) with the Supabase project URL and publishable key, then start the app:

```bash
pnpm dev
```

Vite serves the React landing page at **`http://localhost:5173`**. Sign in at `/login`, create an account at `/signup`, and open the archive at `/dashboard`.

```bash
pnpm build     # production build in dist/
pnpm preview   # serve the production build
```

### Original HTML and CSS page

`old-template/` has no build step. Open `old-template/index.html` in a browser, or serve that folder with any static server. Its images are in `old-template/public/images/`.

---

## 🔐 Supabase

Accounts are stored with [Supabase Auth](https://supabase.com/docs/guides/auth). The browser client is `@supabase/supabase-js` (`^2.118.0`), created in `src/lib/supabase.js`.

### Environment

The client reads two variables. Put them in `.env.local` at the project root. That file is listed in `.gitignore`.

The API endpoint is `https://bhqsucwdkfvaofmirsqc.supabase.co`. Auth requests use `https://bhqsucwdkfvaofmirsqc.supabase.co/auth/v1`.

```bash
VITE_SUPABASE_URL=https://bhqsucwdkfvaofmirsqc.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

| Variable | Where to copy it |
| :--- | :--- |
| `VITE_SUPABASE_URL` | `https://bhqsucwdkfvaofmirsqc.supabase.co`, also shown in the Connect dialog |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | The publishable key from the Connect dialog, or from Settings → API Keys |
| `DB_PSWD` | The database password from Project Settings → Database. The Supabase CLI uses it. The app does not. |

There is no separate Settings → API page. The publishable key is safe to ship in the browser. The secret key is not read by the app. Do not put it in `.env.local`, and do not give it a `VITE_` name: Vite inlines every `VITE_` variable into the bundle. `DB_PSWD` must stay without a `VITE_` name for the same reason. The client throws on startup if the URL or the publishable key is missing. `pnpm dev` and `pnpm build` both need those two variables, because the production bundle bakes them in at build time.

In Authentication, enable the Email provider. If **Confirm email** is on, a new account has no session until the person opens the confirmation link. If it is off, signup returns a session immediately.

### Migrations

Schema changes live in `supabase/migrations`. Each file runs once, in timestamp order, and the remote database records that version. The first file is `supabase/migrations/20261027160000_create_archive.sql`. It creates the archive tables, row-level security, and the private `archive-media` bucket. That file is already applied on the hosted project. Leave it as it is.

Install the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) (`brew install supabase/tap/supabase`). This repo has no `config.toml` and the commands below do not need `supabase login`. They connect with `DB_PSWD` from `.env.local`. Run them from the repository root.

If the password contains characters such as `@`, `:`, `/`, or `#`, the connection string needs those characters percent-encoded. This reads `.env.local` and builds that string:

```bash
DB_URL=$(python3 << 'PY'
import urllib.parse
env = {}
for line in open(".env.local"):
    line = line.strip()
    if not line or line.startswith("#") or "=" not in line:
        continue
    key, value = line.split("=", 1)
    env[key.strip()] = value.strip().strip('"').strip("'")
password = urllib.parse.quote(env["DB_PSWD"], safe="")
print(f"postgresql://postgres:{password}@db.bhqsucwdkfvaofmirsqc.supabase.co:5432/postgres")
PY
)
```

See which files are applied:

```bash
supabase migration list --db-url "$DB_URL"
```

Check what a push would send, then apply only the files the remote history does not have:

```bash
supabase db push --db-url "$DB_URL" --dry-run
supabase db push --db-url "$DB_URL" --yes
```

`--dry-run` prints the pending file names and does not change the database. `--yes` answers the confirm prompt. Without `--yes`, the CLI asks before it applies anything.

For the next change, add a new file and push that file. Do not edit a migration that is already on the remote.

```bash
supabase migration new describe_the_change
```

That writes `supabase/migrations/<timestamp>_describe_the_change.sql`. Put the SQL there, run the dry run, then `supabase db push`.

### What the app calls

- **Sign up** (`/signup`) validates the email and password, then calls `supabase.auth.signUp`. When Supabase returns a session, “Go to your archive” opens `/dashboard`. When it does not, the welcome screen says to check email and the button returns home.
- **Sign in** (`/login`) calls `supabase.auth.signInWithPassword`. A successful sign-in offers “Open the archive”, which goes to `/dashboard`. Unknown email or password shows “Email or password is incorrect.”
- **Session** lives in the Redux auth slice (`src/features/auth/`). `AuthListener` loads it with `getSession` and follows later changes with `onAuthStateChange`. `useAuth` reads `user` and `loading` from the store and dispatches `signOut`. The stored user is `{ id, email }`.
- **`/dashboard`** is behind `ProtectedRoute`. A visitor with no session is sent to `/login`. While the session is loading, the page reads “Checking your session…”.
- **`/login` and `/signup`** are behind `GuestRoute`. Someone who already has a session is sent to `/dashboard`. The check is made when that page opens, so a sign-in or signup that just created a session can still show its confirmation on that page. Opening either address again goes to the archive.
- **Log out**, in the marketing header and on the account view, calls `supabase.auth.signOut()` and then reads `getSession()` again. The person is logged out when that stored session is gone, and is returned to `/login` from the account view. If a session is still there, the header stays signed in and shows the error.
- A signed-in header replaces Sign in and Start your archive with **Your archive** (`/dashboard`) and **Log out**.

Forgot password stays on `/login`. Sending it shows a local note and does not call `supabase.auth.resetPasswordForEmail`, so Supabase sends no reset email.

### Saved archive

The signed-in archive is stored in Supabase. After sign-in, the dashboard loads that account’s people, memories, and capsules. An invite, a moment, and a capsule are written from those forms. A chosen file is uploaded to the private `archive-media` bucket. Refreshing the dashboard reads the saved rows again.

The landing-page gallery stays in `src/constants/data.js`. Those stories are the public page, not the signed-in archive.

---

### Dashboard data structure

archives
  id, owner_id, created_at

profiles
  id              -- same as auth.users.id
  display_name    -- optional; until set, keep deriving a name from the email in the UI

people
  id, archive_id, name, email, role, created_at
  role: family_member | contributor | viewer
  unique (archive_id, email)

memories
  id, archive_id, created_by, created_at
  title, story, place, happened_on
  kind: photo | story | voice | video
  privacy: private | family
  voice_speaker, voice_transcript     -- both optional

memory_people
  memory_id, person_id

memory_assets
  id, memory_id
  role: image | video | audio
  storage_path, mime_type, bytes
  alt, duration_seconds

capsules
  id, archive_id, created_by, created_at
  title, recipient_id, opens_on, message, signature
  sealed_at          -- null while it is still gathering

capsule_memories
  capsule_id, memory_id, position

---

## 🧭 Direct routes in production

The live site is the [Render](https://render.com/docs/static-sites) static site at <https://still-rg7h.onrender.com/>. `createBrowserRouter` in `src/app.jsx` registers real paths: `/`, `/login`, `/signup`, and `/dashboard`.

### The challenge

Typing `/login`, `/signup`, or `/dashboard` in the address bar, or refreshing one of those pages, showed React Router’s “404 Not Found” page. Choosing Sign in, Start your archive, or Your archive inside the app still opened the right screen. `pnpm dev` and `pnpm preview` opened the same paths correctly.

Vite’s dev server returns `index.html` for an unknown path and leaves the address as it was. A React Router `<Link>` never asks the host for a new document. A full page load does. Production answered that load with a **301** to `/index.html`:

| Request | Response |
| :--- | :--- |
| `/login`, `/signup`, `/dashboard` | `301` to `/index.html` |
| `/` and `/index.html` | `200`, the app shell |

The browser followed the redirect, so the address became `/index.html`. React Router looked up that pathname, found no route, and rendered its default 404. The path the person had typed was already gone.

Publishing copies of the built shell as `dist/login.html`, `dist/signup.html`, and `dist/dashboard.html` did not remove the 404. Those files answered `200` at `/login.html`, and `/login` still redirected. Render applies a redirect when no file exists at the requested path, and `/login` is a different path from `/login.html`.

### The fix

On the static site, open **Redirects/Rewrites** and keep a single rule:

| Field | Value |
| :--- | :--- |
| Source | `/*` |
| Destination | `/index.html` |
| Action | **Rewrite** |

A redirect sends the browser to a new address. A rewrite returns `index.html` with status `200` and leaves the address on `/login`, so React Router still sees `/login`. Render skips the rule when a real file is already at that path, so `/assets/*.js` and the images stay themselves.

The rule is set on the Render service. It is not in this repo. After it is saved, `/login`, `/signup`, and `/dashboard` return `200` and keep their paths. Check in a private window, because browsers cache a `301`.

---

## 🧪 Accessibility Testing Checklist

- [x] **Keyboard Navigation**: Press <kbd>Tab</kbd> to test skip-link activation, link focus, form field focus, and button triggering via <kbd>Enter</kbd> / <kbd>Space</kbd>.
- [x] **Screen Readers**:
  - macOS / iOS: **VoiceOver** (<kbd>Cmd</kbd> + <kbd>F5</kbd>)
  - Windows: **NVDA** or **JAWS**
  - Android: **TalkBack**
- [x] **Automated Audits**:
  - Run **Google Chrome Lighthouse** (Accessibility category target: 100/100).
  - Run **axe DevTools** browser extension (0 critical or serious violations).
  - Test via **WAVE** (Web Accessibility Evaluation Tool).

---

### Stripe Testing

You can grab test payment data at https://docs.stripe.com/testing

---

## 🤝 Contributing

Contributions that further improve accessibility, add new interactions, or sharpen the React and Tailwind landing page are welcome.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/a11y-enhancement`)
3. Commit your changes (`git commit -m 'feat: enhance form error announcements'`)
4. Push to the branch (`git push origin feature/a11y-enhancement`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — feel free to use the layout, styles, and accessibility patterns in your own projects.