# Still — A Living Family Archive

[![Live Demo](https://img.shields.io/badge/Demo-Live%20Site-183e32?style=for-the-badge&logo=githubpages&logoColor=white)](https://sulenchy.github.io/PMem/)
[![Figma Prototype](https://img.shields.io/badge/Figma-Prototype-F24E1E?style=for-the-badge&logo=figma&logoColor=white)](https://forum-remake-98457982.figma.site/)
[![Accessibility](https://img.shields.io/badge/WCAG%202.1-AAA%20Ready-success?style=for-the-badge&logo=w3c&logoColor=white)](#-web-accessibility-in-practice-a11y-first-engineering)
[![Zero JS](https://img.shields.io/badge/JavaScript-Zero%20Dependency-brightgreen?style=for-the-badge)](https://sulenchy.github.io/PMem/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

> **"Hold on to the little things."**  
> An editorial, living archive for family memories, designed to demonstrate how **modern web accessibility (a11y)** and visual craftsmanship can be achieved using pure, semantic **HTML5** and **CSS3** — with **zero JavaScript**.

---

## 🌟 Quick Links

- 🌐 **[Live Website Demo](https://sulenchy.github.io/PMem/)**
- 🎨 **[Figma Prototype](https://forum-remake-98457982.figma.site/)**
- ♿ **[Web Accessibility Architecture](#-web-accessibility-in-practice-a11y-first-engineering)**
- 🚀 **[Quick Start & Preview](#-quick-start)**
- 📐 **[Design System & Tokens](#-design-system--tokens)**

---

## 📖 About Still

Most photo albums today are either chaotic camera rolls or generic cloud drives. **Still** takes an editorial approach: turning everyday family moments, forgotten voices, and intimate notes into a considered, timeless collection.

Beyond its visual storytelling, **Still serves as a real-world reference implementation for modern web accessibility**. It proves that modern, elegant, and interactive web experiences do not require heavy JavaScript bundles or complex frameworks to be accessible, fluid, and delightful for all users.

---

## ♿ Web Accessibility in Practice (a11y-First Engineering)

Web accessibility is often treated as an afterthought or outsourced to third-party overlay widgets. **Still demonstrates how to bake accessibility directly into semantic HTML and CSS from day one**, adhering to [WCAG 2.1 AA/AAA guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/).

### 1. Semantic Landmark Architecture
Screen reader users navigate web pages primarily through landmarks and headings. Still implements an unambiguous document structure:

- **Landmark Elements**: Full utilization of `<header>`, `<main id="main-content">`, `<section>`, `<article>`, `<figure>`, `<figcaption>`, and `<footer>`.
- **Heading Hierarchy**: Strict `<h1>` → `<h2>` → `<h3>` hierarchy.
- **Section Labeling with `aria-labelledby`**: Every major section links directly to its heading title, allowing assistive technologies to announce clear context in screen reader rotor navigation:

```html
<section class="story-section" id="how-it-works" aria-labelledby="story-title">
  <div class="story-copy">
    <span class="kicker">MORE THAN A PHOTO</span>
    <h2 id="story-title">Every picture has a story. <em>Help it remember.</em></h2>
    ...
  </div>
</section>
```

### 2. Skip to Main Content (Bypass Blocks)
Keyboard and switch-device users often have to tab through repetitive header links on every page. Still includes an accessible **Skip Link**:

- Positioned off-screen by default.
- Transitions cleanly into view when focused via `Tab`.
- Jumps directly to `<main id="main-content">`.

```html
<!-- At the top of <body> -->
<a href="#main-content" class="skip-link">Skip to main content</a>
```

```css
.skip-link {
  position: absolute;
  top: -999px;
  left: 20px;
  background: var(--forest);
  color: var(--white);
  padding: 12px 20px;
  border-radius: 8px;
  z-index: 9999;
  transition: top 0.2s ease-in-out;
}

.skip-link:focus {
  top: 20px;
  outline: 2px solid var(--peach);
  outline-offset: 3px;
}
```

### 3. Accessible Name Computation & Decorative Icon Isolation
Icon-only controls and decorative SVGs frequently break screen reader usability. Still implements two essential patterns:

- **Explicit `aria-label` for Icon-Only Buttons**: Gives assistive devices explicit action names instead of silence:
  ```html
  <button aria-label="Open The summer we stayed out late">
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h11M11 6l4 4-4 4"></path>
    </svg>
  </button>
  ```
- **`aria-hidden="true"` on Decorative Graphics**: Prevents screen readers from announcing unnecessary SVG vector paths or decorative brand glyphs.

### 4. Human-Centered Alternative Text
Photographs are central to this project. Instead of generic alt tags like `alt="image"` or filename dumps, every image contains descriptive, narrative alt text:

```html
<figure class="main-photo">
  <img
    src="public/images/collage-big-photo.avif"
    alt="Family spending time together outdoors"
  />
  <figcaption>
    <span>Lake District</span><span>Summer ’24</span>
  </figcaption>
</figure>
```

### 5. Visible Focus Rings (`:focus-visible`)
To support keyboard navigators without compromising aesthetics for mouse users, Still utilizes `:focus-visible` with high-contrast outlines:

```css
:focus-visible {
  outline: 2px solid var(--forest);
  outline-offset: 3px;
}

.form-wrap input:focus-visible,
.form-wrap select:focus-visible,
.form-wrap textarea:focus-visible {
  border-bottom-color: var(--forest);
  box-shadow: 0 2px 0 0 var(--forest);
  outline: none;
}
```

### 6. Motor & Touch Accessibility (WCAG 2.5.5 / 2.5.8)
All interactive buttons and navigation triggers meet or exceed the **44 × 44px minimum touch target size**, preventing misclicks on touchscreens and supporting users with motor impairments:

```css
.button {
  min-height: 44px;
  padding: 0 20px;
  ...
}
```

### 7. Vestibular Disorder & Reduced Motion Support
Smooth scrolling and heavy animations can cause discomfort or disorientation for users with motion sensitivity. Still honors user system preferences via `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 8. High Color Contrast & Readability
- Deep ink (`#21342d`) and forest green (`#102e26`) text set against warm paper (`#fffdf7`) and cream (`#f7f2e8`).
- Contrast ratios exceed **10:1**, comfortably exceeding WCAG AAA requirements (7:1 for regular text, 4.5:1 for large text).
- Avoids conveying information solely through color (e.g. role badges pair distinctive letter initials with descriptive text).

### 9. Zero-JS Mobile Navigation Drawer
The mobile navigation menu is implemented using an accessible CSS checkbox toggle pattern (`#menu-toggle` with `label[for="menu-toggle"]` and `:checked ~ .nav`). It functions 100% reliably even when JavaScript is disabled, blocked, or fails to load.

---

## 🎨 Design System & Tokens

Still employs an editorial palette inspired by vintage family photo albums and botanical tones:

| Token | Value | Preview / Usage |
| :--- | :--- | :--- |
| `--forest` | `#183e32` | Primary buttons, active states, brand tone |
| `--deep` | `#102e26` | Deep accents, dark contrast backgrounds |
| `--ink` | `#21342d` | Primary body typography (high contrast) |
| `--paper` | `#fffdf7` | Main canvas background |
| `--cream` | `#f7f2e8` | Card background, warm containers |
| `--sage` | `#9eb7a5` | Soft borders and natural accents |
| `--peach` | `#e7a486` | Warm interactive highlights, focus rings |
| `--serif` | `"Instrument Serif", Georgia, serif` | Editorial headlines & titles |
| `--sans` | `"DM Sans", Arial, sans-serif` | Clean, legible body text |

---

## 📁 Project Structure

```text
Still/
├── index.html              # Semantic, accessible HTML5 single-page archive
├── styles.css              # Vanilla CSS3 styles, CSS variables, responsive grid
├── README.md               # Documentation and accessibility showcase
├── public/
│   └── images/             # Modern AVIF compressed imagery
│       ├── collage-big-photo.avif
│       ├── collage-small-photo.avif
│       └── family-main.avif
└── .github/
    └── workflows/
        └── static.yml      # Automated GitHub Pages static deployment
```

---

## 🚀 Quick Start

Because Still has **zero dependencies** and requires **no build step**, you can preview and run it immediately:

### Option 1: Open Directly
Double-click `index.html` in your file manager to open it in any modern web browser.

### Option 2: Local Static Server (Recommended)
Using VS Code:
Right-click `index.html` and select **"Open with Live Server"**.

Visit: **`http://localhost:8080`**

---

## 🧪 Accessibility Testing Checklist

You can verify Still's accessibility implementation using the following tools and techniques:

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

## 🤝 Contributing

Contributions that further improve accessibility, add new micro-interactions, or enhance performance are warmly welcomed!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/a11y-enhancement`)
3. Commit your changes (`git commit -m 'feat: enhance form error announcements'`)
4. Push to the branch (`git push origin feature/a11y-enhancement`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — feel free to use the layout, styles, and accessibility patterns in your own projects.
