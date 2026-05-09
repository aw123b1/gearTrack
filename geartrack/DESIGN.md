# GearTrack — Design System

All tokens are defined in `src/index.css` inside the Tailwind v4 `@theme` block and are available as Tailwind utility classes throughout the project (e.g. `bg-primary`, `text-accent`, `font-heading`, `rounded-base`).

---

## Colors

### Primary — Deep Blue
Used for the sidebar background, headings, primary buttons, and key UI elements.

| Token            | Hex       | Tailwind class examples                        |
|------------------|-----------|------------------------------------------------|
| `primary`        | `#003366` | `bg-primary` `text-primary` `border-primary`   |
| `primary-light`  | `#00478a` | `bg-primary-light` (hover states on dark bg)   |
| `primary-dark`   | `#002244` | `bg-primary-dark` (pressed / active states)    |

### Secondary — Sky Blue
Used for active nav states, input focus rings, and informational highlights.

| Token              | Hex       | Tailwind class examples                            |
|--------------------|-----------|----------------------------------------------------|
| `secondary`        | `#4A90E2` | `bg-secondary` `text-secondary` `ring-secondary`   |
| `secondary-light`  | `#72aaeb` | `bg-secondary-light`                               |
| `secondary-dark`   | `#2a70c2` | `bg-secondary-dark`                                |

### Accent — Warm Orange
Used for the ScanCTA button, low-stock alerts, and attention-drawing elements.

| Token          | Hex       | Tailwind class examples                        |
|----------------|-----------|------------------------------------------------|
| `accent`       | `#FF8C00` | `bg-accent` `text-accent` `shadow-accent/30`   |
| `accent-light` | `#ffaa3d` | `bg-accent-light`                              |
| `accent-dark`  | `#cc7000` | `bg-accent-dark` (hover states)                |

### Neutrals
Used for backgrounds, surfaces, body text, muted text, and borders.

| Token         | Hex       | Tailwind class examples         | Usage                          |
|---------------|-----------|---------------------------------|--------------------------------|
| `background`  | `#F5F7FA` | `bg-background`                 | App-level page background      |
| `surface`     | `#FFFFFF` | `bg-surface`                    | Cards, modals, form containers |
| `text`        | `#1A1A1A` | `text-text`                     | Primary body text              |
| `text-muted`  | `#6B7280` | `text-text-muted`               | Secondary / helper text        |
| `border`      | `#E2E8F0` | `border-border` `divide-border` | Dividers, input borders        |

### Opacity variants
Tailwind's `/` modifier works with all tokens:
```
bg-primary/10      → primary at 10% opacity (icon backgrounds)
bg-accent/10       → accent at 10% opacity
shadow-accent/30   → accent shadow at 30% opacity
bg-secondary/10    → secondary at 10% opacity (info banners)
```

---

## Typography

Fonts are imported from Google Fonts and configured as Tailwind `font-*` utilities.

| Token         | Family      | Weights loaded       | Tailwind class  | Usage                              |
|---------------|-------------|----------------------|-----------------|------------------------------------|
| `font-heading`| **Heebo**   | 400, 500, 600, 700, 800 | `font-heading` | Page titles, card values, buttons |
| `font-body`   | **Assistant**| 300, 400, 600, 700  | `font-body`    | Labels, paragraphs, input text     |

```css
/* Google Fonts import in src/index.css */
@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700;800&family=Assistant:wght@300;400;600;700&display=swap');
```

The `body` element defaults to `font-body` (Assistant). Heading elements (`h1`–`h6`) default to `font-heading` (Heebo) via the base styles.

---

## Border Radius

| Token         | Value  | Tailwind class   | Usage                              |
|---------------|--------|------------------|------------------------------------|
| `radius-sm`   | `8px`  | `rounded-sm`     | Small chips, badges                |
| `radius-base` | `12px` | `rounded-base`   | Cards, inputs, buttons (default)   |
| `radius-lg`   | `16px` | `rounded-lg`     | Large panels                       |
| `radius-xl`   | `24px` | `rounded-xl`     | Modals, bottom sheets              |

---

## Accessibility Notes

- Primary `#003366` on white `#FFFFFF`: contrast ratio **~12.6:1** (AAA)
- Secondary `#4A90E2` on white `#FFFFFF`: contrast ratio **~3.2:1** (AA large text)
- Accent `#FF8C00` on white `#FFFFFF`: contrast ratio **~3.1:1** — always pair with a text label, never use alone as the only indicator
- Text `#1A1A1A` on Background `#F5F7FA`: contrast ratio **~18.1:1** (AAA)

---

## Where tokens are defined

```
src/
└── index.css   ← @theme block with all --color-*, --font-*, --radius-* tokens
```

No `tailwind.config.js` exists — this project uses **Tailwind CSS v4** which is configured entirely via CSS.
