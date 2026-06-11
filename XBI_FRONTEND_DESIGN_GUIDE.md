# XBI CRM — Frontend Design System Guide

A complete reference for replicating the XBI CRM visual identity in any new project.

> **Two distinct themes exist in this project:**
> - **CRM Light Theme** (sections 1–16) — Used for the main CRM dashboard. White background, MUI v5, Inter font, brand blue `#3D52A0`.
> - **XBI Dark Theme** (sections 17–30) — Used for the XBI Analytics module. Pure black, glassmorphism cards, neon accents, Space Grotesk display font.

---

## 1. Tech Stack

| Layer | Library / Version |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React 18 |
| Component Library | MUI (Material UI) v5.15 |
| CSS-in-JS | Emotion (`@emotion/react`, `@emotion/styled`) |
| Icons (primary) | `lucide-react` v1.7 |
| Icons (secondary) | `@phosphor-icons/react` v2.1 |
| Icons (MUI) | `@mui/icons-material` v6 |
| Language | TypeScript 5 |
| Charts | ApexCharts + MUI X Charts |
| Animation | Framer Motion v12 |

---

## 2. Typography

### Primary Font — Inter
Used for **all body text, UI labels, buttons, and headings**.

```
font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"
```

Install: `@fontsource/inter` (weights 100–900 are imported)

### Secondary Font — Plus Jakarta Sans
Used for **logo/brand wordmarks** and select heading contexts.

```
@fontsource/plus-jakarta-sans  (weights 600, 700)
```

### Monospace Font — Roboto Mono
Used for **code snippets, IDs, tokens**.

```
@fontsource/roboto-mono  (weights 300, 400)
```

### Type Scale

| Variant | Size | Weight | Line Height | Notes |
|---|---|---|---|---|
| `h1` | 3.5rem (56px) | 500 | 1.2 | |
| `h2` | 3rem (48px) | 500 | 1.2 | |
| `h3` | 2.25rem (36px) | 500 | 1.2 | |
| `h4` | 2rem (32px) | 500 | 1.2 | |
| `h5` | 1.5rem (24px) | 500 | 1.2 | |
| `h6` | 1.125rem (18px) | 500 | 1.2 | Card headers |
| `subtitle1` | 1rem (16px) | 500 | 1.57 | |
| `subtitle2` | 0.875rem (14px) | 500 | 1.57 | |
| `body1` | 1rem (16px) | 400 | 1.5 | |
| `body2` | 0.875rem (14px) | 400 | 1.57 | |
| `caption` | 0.75rem (12px) | 400 | 1.66 | |
| `overline` | 0.75rem (12px) | 500 | 2.5 | Uppercase, letter-spacing 0.5px |
| `button` | inherited | 500 | — | |

**Nav item text** uses non-standard sizes (not in MUI variants):
- Parent nav item: `0.8438rem` (13.5px), weight 450 (normal) / 600 (active)
- Child nav item: `0.8125rem` (13px), weight 400 (normal) / 600 (active)
- Section label: `9.5px`, weight 700, letter-spacing 0.1em, uppercase

---

## 3. Color System

The theme supports both **light** and **dark** modes via MUI's `experimental_extendTheme`.

### Brand Palette — Neon Blue (Primary)

```
neonBlue-50:  #ecf0ff    neonBlue-500: #635bff
neonBlue-100: #dde3ff    neonBlue-600: #4e36f5
neonBlue-200: #c2cbff    neonBlue-700: #432ad8
neonBlue-300: #9ca7ff    neonBlue-800: #3725ae
neonBlue-400: #7578ff    neonBlue-900: #302689
                          neonBlue-950: #1e1650
```

### Sidebar Brand — XBI Blue (Sidebar-specific tokens)

The sidebar uses a slightly different, softer blue brand palette:

```
brand:         #3D52A0    (deep navy-blue)
brandMid:      #7091E6    (mid blue)
brandBg:       rgba(61,82,160,0.08)
brandBgHover:  rgba(61,82,160,0.13)
brandGlow:     rgba(61,82,160,0.18)
gradBrand:     linear-gradient(135deg, #3D52A0 0%, #7091E6 100%)
```

### Semantic Colors

| Role | Light main | Dark main | Palette name |
|---|---|---|---|
| Primary | `#635bff` | `#7578ff` | neonBlue |
| Success | `#15b79f` | `#2ed3b8` | kepple |
| Warning | `#fb9c0c` | `#ffbb1f` | california |
| Error | `#f04438` | `#f97970` | redOrange |
| Info | `#04aad6` | `#10bee8` | shakespeare |

### Full Custom Palettes

**kepple** (success / teal):
```
50:#f0fdfa  100:#ccfbef  200:#9af5e1  300:#5fe9ce  400:#2ed3b8
500:#15b79f  600:#0e9382  700:#107569  800:#115e56  900:#134e48  950:#042f2c
```

**california** (warning / amber):
```
50:#fffaea  100:#fff3c6  200:#ffe587  300:#ffd049  400:#ffbb1f
500:#fb9c0c  600:#de7101  700:#b84d05  800:#953b0b  900:#7b310c  950:#471701
```

**redOrange** (error):
```
50:#fef3f2  100:#fee4e2  200:#ffcdc9  300:#fdaaa4  400:#f97970
500:#f04438  600:#de3024  700:#bb241a  800:#9a221a  900:#80231c  950:#460d09
```

**shakespeare** (info / cyan):
```
50:#ecfdff  100:#cff7fe  200:#a4eefd  300:#66e0fa  400:#10bee8
500:#04aad6  600:#0787b3  700:#0d6d91  800:#145876  900:#154964  950:#082f44
```

**nevada** (neutral — dark mode):
```
50:#fbfcfe  100:#f0f4f8  200:#dde7ee  300:#cdd7e1  400:#9fa6ad
500:#636b74  600:#555e68  700:#32383e  800:#202427  900:#121517  950:#090a0b
```

**stormGrey** (neutral — light mode):
```
50:#f9fafb  100:#f1f1f4  200:#dcdfe4  300:#b3b9c6  400:#8a94a6
500:#667085  600:#565e73  700:#434a60  800:#313749  900:#212636  950:#121621
```

### Background Levels

| Token | Light | Dark |
|---|---|---|
| `background.default` | `#ffffff` | `neutral-950` |
| `background.paper` | `#ffffff` | `neutral-900` |
| `background.level1` | `neutral-50` | `neutral-800` |
| `background.level2` | `neutral-100` | `neutral-700` |
| `background.level3` | `neutral-200` | `neutral-600` |

### Text Colors

| Token | Light | Dark |
|---|---|---|
| `text.primary` | `neutral-900` (#212636) | `neutral-100` (#f0f4f8) |
| `text.secondary` | `neutral-500` (#667085) | `neutral-400` (#9fa6ad) |
| `text.disabled` | `neutral-400` | `neutral-600` |

### Sidebar Design Tokens (verbatim)

```ts
bg:           '#FFFFFF'
bgSecondary:  '#F8FAFC'
surface:      '#F1F5F9'
surfaceHover: '#EEF2F7'
border:       'rgba(99,116,156,0.11)'
borderMd:     'rgba(99,116,156,0.22)'
textPrimary:  '#0F172A'
textSecondary:'#475569'
textMuted:    '#94A3B8'
red:          '#DC2626'
redBg:        'rgba(220,38,38,0.07)'
redGlow:      'rgba(220,38,38,0.15)'
gradRed:      'linear-gradient(135deg, #DC2626 0%, #F87171 100%)'
green:        '#059669'
amber:        '#B45309'
purple:       '#6D28D9'
sectionLabel: '#94A3B8'
```

### Top-bar / Main Nav Tokens

```ts
surfaceHover: '#F3F6FA'
border:       'rgba(15, 23, 42, 0.08)'
textMuted:    '#64748B'
```

---

## 4. Spacing & Shape

| Token | Value |
|---|---|
| `shape.borderRadius` | `8px` (global MUI default) |
| Card border radius | `20px` |
| Button border radius | `12px` |
| Tab border radius | `0` (edge-to-edge, horizontal scroll) |
| Dropdown / Menu border radius | `12px` |
| Badge border radius | `4px` |
| Avatar | 36×36px (nav), font 13px, weight 600 |

### Card Padding

```
CardHeader: padding-top 32px, padding-x 24px, padding-bottom 16px
CardContent: padding 32px 24px  (last-child keeps 32px bottom)
```

### Breakpoints

```
xs:  0px
sm:  600px
md:  900px
lg:  1200px
xl:  1440px
```

---

## 5. Shadows

All shadows use `rgba(0,0,0,0.08)` opacity — intentionally subtle.

```
shadow[1]:  0px 1px 2px   rgba(0,0,0,0.08)
shadow[2]:  0px 1px 5px   rgba(0,0,0,0.08)
shadow[3]:  0px 1px 8px   rgba(0,0,0,0.08)
...
shadow[8]:  0px 3px 14px  rgba(0,0,0,0.08)
shadow[12]: 0px 5px 22px  rgba(0,0,0,0.08)
shadow[16]: 0px 6px 30px  rgba(0,0,0,0.08)
shadow[24]: 0px 9px 46px  rgba(0,0,0,0.08)
```

### Card Shadow (elevation 1)

- **Light:** `0 5px 22px 0 rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.06)`
- **Dark:** `0 5px 22px 0 rgba(0,0,0,0.24), 0 0 0 1px rgba(255,255,255,0.12)`

### Sidebar shadow

```
box-shadow: 2px 0 20px rgba(0,0,0,0.05)
```

### Top nav shadow

```
box-shadow: 0 1px 0 rgba(15,23,42,0.03)
backdrop-filter: blur(12px)
background: rgba(255,255,255,0.86)   ← frosted glass effect
```

---

## 6. Layout

### Shell Structure

```
┌──────────────────────────────────────────────────────────┐
│  SideNav  (fixed, 280px expanded / 68px collapsed)        │
│  ─────────────────────────────────────────────────────    │
│  Logo / Header  (56px)                                    │
│  ─────────────────────────────────────────────────────    │
│  Nav Items  (scrollable)                                  │
│  ─────────────────────────────────────────────────────    │
│  Footer: Logout  (40px)                                   │
├──────────────────────────────────────────────────────────┤
│  Main Area  (margin-left: 280px on lg+)                   │
│  ┌────────────────────────────────────────────────────┐   │
│  │  MainNav / TopBar  (sticky, 64px)                  │   │
│  ├────────────────────────────────────────────────────┤   │
│  │  Page Content                                      │   │
│  └────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

| Part | Dimension |
|---|---|
| Sidebar expanded | 280px wide, 100vh, fixed left |
| Sidebar collapsed | 68px wide |
| Top bar height | 64px (min-height), sticky top: 0, z-index: 1100 |
| Sidebar z-index | 1200 |
| Sidebar transition | `width 0.25s cubic-bezier(0.4,0,0.2,1)` |
| Nav item transition | `all 0.22s cubic-bezier(0.4,0,0.2,1)` |
| Nav item height | 40px (parent), 36px (child) |
| Nav item padding | 10px horizontal |
| Nav item border radius | 8px (parent), 7px (child) |

### Sidebar Scrollbar (custom thin scrollbar)

```css
::-webkit-scrollbar        { width: 3px }
::-webkit-scrollbar-track  { background: transparent }
::-webkit-scrollbar-thumb  { background: rgba(99,116,156,0.11); border-radius: 3px }
```

---

## 7. Component Overrides (MUI)

### Button

```ts
borderRadius: '12px'
textTransform: 'none'        // No ALL-CAPS

sizeSmall:  padding 6px 16px
sizeMedium: padding 8px 20px
sizeLarge:  padding 11px 24px
```

### Link

```ts
underline: 'hover'
```

### Tab

```ts
fontSize: '14px'
fontWeight: 500
lineHeight: 1.71
textTransform: 'none'
minWidth: 'auto'
paddingLeft: 0, paddingRight: 0
gap between tabs: marginLeft 24px
```

### Table Head

```ts
backgroundColor: 'var(--mui-palette-background-level1)'
color: 'var(--mui-palette-text-secondary)'
lineHeight: 1
```

### Table Cell

```ts
borderBottom: '1px solid var(--mui-palette-TableCell-border)'
paddingCheckbox: '0 0 0 24px'
```

### Avatar

```ts
fontSize: '14px'
fontWeight: 600
letterSpacing: 0
```

---

## 8. Navigation Badges

Three badge variants shown inline in nav items:

| Label | Background | Text |
|---|---|---|
| `AI` | `linear-gradient(135deg, #3D52A0, #7091E6)` | `#fff` |
| `NEW` | `linear-gradient(135deg, #059669, #34D399)` | `#fff` |
| `BETA` | `linear-gradient(135deg, #B45309, #FBBF24)` | `#fff` |

Badge style: `px 5px`, `py 1px`, `border-radius 4px`, `font-size 9px`, `font-weight 700`, `letter-spacing 0.06em`.

---

## 9. Active State — Nav Item

Active nav items get a left-side accent bar:

```css
::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 22px;
  background: linear-gradient(135deg, #3D52A0 0%, #7091E6 100%);
  border-radius: 0 3px 3px 0;
}
box-shadow: inset 0 0 0 1px rgba(108,142,255,0.15);
```

Child items use a left border tree line instead:

```css
margin-left: 18px;
padding-left: 14px;
border-left: 1px solid rgba(99,116,156,0.11);
```

---

## 10. XBI Button (Dark AI Mode)

The XBI analytics button in the top bar has a distinctive dark/glowing style:

```css
background: #020617
border: 1px solid rgba(125, 211, 252, 0.35)
border-radius: 14px
box-shadow: 0 10px 28px rgba(2,6,23,0.20), inset 0 1px 0 rgba(255,255,255,0.08)

:hover {
  background: #071A34
  border-color: rgba(186, 230, 253, 0.70)
  box-shadow: 0 14px 34px rgba(2,6,23,0.28), 0 0 22px rgba(56,189,248,0.24)
  transform: translateY(-1px)
}
```

Logo inside uses `filter: drop-shadow(0 0 5px rgba(125,211,252,0.34))` for a glow effect.

---

## 11. Global CSS Variables

```css
:root {
  --icon-fontSize-sm: 1rem;     /* 16px */
  --icon-fontSize-md: 1.25rem;  /* 20px */
  --icon-fontSize-lg: 1.5rem;   /* 24px */
}

*:focus-visible {
  outline: 2px solid var(--mui-palette-primary-main);
}
```

---

## 12. Nav Section Groups

Navigation items are grouped under uppercase section labels:

| Section Label | Items |
|---|---|
| `OVERVIEW` | Dashboard |
| `SALES` | Leads, AI Lead Finder, Follow-ups, Customers, Deals |
| `OPERATIONS` | AMS, Project Management, Assets Management, Sales Target |
| `INSIGHTS & AUTOMATION` | Reports, Bulk Email, Notifications |
| `SYSTEM` | Accounts, Settings |

Section labels: `9.5px`, weight 700, letter-spacing `0.1em`, color `#94A3B8`, uppercase, padding-top `16px`.

---

## 13. Lucide Icon Usage

All icons use these default props throughout the UI:

```tsx
// Parent nav items
<Icon size={18} strokeWidth={1.8} />

// Child nav items
<Icon size={14} strokeWidth={1.8} />

// Child nav items (collapsed)
<Icon size={15} strokeWidth={1.8} />

// Logout / footer actions
<Icon size={17} strokeWidth={1.8} />
```

The `strokeWidth={1.8}` is the signature look — slightly thinner than the Lucide default of 2, giving a refined, modern feel.

---

## 14. Animation / Motion Tokens

```ts
transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)'   // General UI transitions
            'width 0.25s cubic-bezier(0.4,0,0.2,1)'      // Sidebar collapse
            'max-height 0.3s cubic-bezier(0.4,0,0.2,1)'  // Dropdown expand
            'opacity 0.2s ease'                           // Dropdown fade
            'transform 0.22s cubic-bezier(0.4,0,0.2,1)'  // Chevron rotate
            'all 160ms ease'                              // XBI button hover
            'opacity 140ms ease, transform 140ms ease'    // Tooltip reveal
```

Chevron rotation on open dropdown: `rotate(90deg)`.

---

## 15. Replication Checklist

When starting a new project in the same style:

- [ ] Install `@fontsource/inter`, `@fontsource/plus-jakarta-sans`, `@fontsource/roboto-mono`
- [ ] Copy `colors.ts`, `typography.ts`, `shadows.ts`, `color-schemes.ts`, `create-theme.ts` and component overrides
- [ ] Set `shape.borderRadius: 8` globally, override cards to `20px`, buttons to `12px`
- [ ] Use `Inter` as `fontFamily` in `createTheme`
- [ ] Use `lucide-react` icons with `strokeWidth={1.8}`
- [ ] Sidebar: white bg `#FFFFFF`, brand blue `#3D52A0` → `#7091E6` gradient for active states
- [ ] Top bar: frosted glass `rgba(255,255,255,0.86)` + `backdrop-filter: blur(12px)`
- [ ] Buttons: `textTransform: none`, `borderRadius: 12px`
- [ ] Keep shadows extremely subtle (`rgba(0,0,0,0.04–0.08)`)
- [ ] Use `rgba` borders (`rgba(0,0,0,0.06–0.08)`) instead of solid grey borders
- [ ] Active nav accent: 3px left bar with brand gradient
- [ ] Section labels: all-caps, `9.5px`, `letter-spacing: 0.1em`, muted grey

---

## 16. Package Install Command

```bash
npm install \
  @mui/material@5.15.20 @mui/system@5.15.20 @mui/icons-material \
  @mui/x-charts @mui/x-data-grid @mui/x-date-pickers \
  @emotion/react @emotion/styled @emotion/cache \
  @fontsource/inter @fontsource/plus-jakarta-sans @fontsource/roboto-mono \
  lucide-react @phosphor-icons/react \
  framer-motion next react react-dom \
  apexcharts react-apexcharts \
  react-hook-form @hookform/resolvers yup zod \
  date-fns dayjs axios
```

---
---

# XBI Dark Theme — Complete Design System

> This section documents the **XBI Analytics** module — a standalone dark-mode experience that lives at `/xbi/*`. It is visually and architecturally separate from the CRM light theme above. You can replicate it entirely on its own.

---

## 17. XBI Tech Stack Differences

| Aspect | XBI Dark |
|---|---|
| Rendering | Inline `style={}` objects only — **no MUI sx** in components |
| Icons | Custom inline `<svg>` with hand-coded path strings (no icon library) |
| Charts | Custom SVG canvas-drawn charts (no ApexCharts / Recharts) |
| Layout | CSS `flex` only — no MUI Grid |
| Theme wrapper | `XbiThemeWrapper` with a custom `createTheme` for any MUI components used |

---

## 18. XBI Font System

Three fonts are used — each has a specific semantic role:

| Role | Font | Used For |
|---|---|---|
| Display | **Space Grotesk** | Widget titles, KPI numbers, section headers, avatar initials, chart labels |
| Body | **Inter** | Nav labels, table data, sub-text, badges, tooltips |
| Mono | **JetBrains Mono** | Numbers in employee rows, rank numbers, chart value labels, pagination |

```ts
FONT.display = 'Space Grotesk, sans-serif'
FONT.body    = 'Inter, sans-serif'
FONT.mono    = 'JetBrains Mono, monospace'
```

Install via Google Fonts CDN in `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet" />
```

---

## 19. XBI Color Tokens

These are the exact values from `tokens.ts`. Every color in the XBI UI derives from this object.

```ts
// Backgrounds (layered dark)
T.bg          = '#000000'     // Page root — pure black
T.surface     = '#0a0a0a'     // Card/panel background
T.surfaceAlt  = '#101010'     // Raised elements, input fills, hover bg
T.raised      = '#161616'     // Topmost surface (rarely used)

// Borders
T.border      = '#2a2a2a'     // Default border
T.borderHi    = '#3a3a3a'     // Hover / emphasis border

// Text
T.text        = '#ffffff'     // Primary text
T.textMid     = '#e2e2e2'     // Secondary text (nav labels, sub-labels)
T.muted       = '#b4b4b4'     // Placeholder, metadata, section labels

// Accent / Neon palette
T.lime        = '#d4ff3a'     // PRIMARY accent — active nav, primary buttons, KPI headers
T.limeDim     = '#9ec926'     // Dimmed lime (used in logo glow)
T.cyan        = '#38f0e8'     // Charts, info, lead conversion
T.magenta     = '#ff3da8'     // Employee performance, chat dot, close button
T.violet      = '#a98aff'     // Conversion rate charts, multi-series
T.orange      = '#ff8a3d'     // Warning states, pending tasks
T.red         = '#ff5470'     // Error, negative delta
T.green       = '#3ddc97'     // Success, high completion
T.yellow      = '#ffd23d'     // Alternative warning / gold

// Skeleton
T.skeleton        = 'rgba(255,255,255,0.04)'
T.skeletonShimmer = 'rgba(255,255,255,0.08)'
```

### Quick Color Reference

| Color | Hex | Role |
|---|---|---|
| Lime | `#d4ff3a` | Active state, primary CTA, KPI card gradient start |
| Cyan | `#38f0e8` | Charts, info widgets, lead conversion |
| Magenta | `#ff3da8` | Employee perf, chat badge, close/danger action |
| Violet | `#a98aff` | Conversion rate, multi-series chart 3rd color |
| Orange | `#ff8a3d` | Pending tasks, medium warning |
| Red | `#ff5470` | Errors, low performance |
| Green | `#3ddc97` | High achievement (≥80%) |
| Yellow | `#ffd23d` | 5th chart series color |

---

## 20. XBI Background System

Surfaces are layered from pure black outward, never using box-shadows to fake depth — instead using `backdrop-filter: blur()` + semi-transparent backgrounds for a glassmorphism effect.

```
Page:      #000000
Sidebar:   rgba(11, 11, 18, 0.65)  + backdrop-filter: blur(16px)
Card:      rgba(16, 16, 26, 0.65)  + backdrop-filter: blur(12px)
Tab group: rgba(255, 255, 255, 0.03) + backdrop-filter: blur(10px)
KPI card:  solid gradient (no glass — fully opaque gradient fill)
```

All panels use `border: 1px solid rgba(255, 255, 255, 0.08)` as the universal glass border.

---

## 21. XBI Layout

```
┌─────────────────────────────────────────────────────────┐
│  XbiSidebar  (flex column, no fixed position)            │
│  240px expanded / 72px collapsed                         │
│  ── Logo (170×58px box, lime glow shadow)                │
│  ── "NAVIGATION" label (10px, weight 600, uppercase)     │
│  ── Nav items (flex column, gap 3px)                     │
│  ── Spacer (flex: 1)                                     │
│  ── Close Tab button (magenta border)                    │
│  ── User footer (avatar gradient + name/role)            │
├─────────────────────────────────────────────────────────┤
│  Main content area  (flex: 1, overflow auto)             │
│  Background: #000000 / T.bg                              │
└─────────────────────────────────────────────────────────┘
```

| Part | Value |
|---|---|
| Sidebar expanded | `240px` |
| Sidebar collapsed | `72px` |
| Sidebar padding (expanded) | `20px 14px` |
| Sidebar padding (collapsed) | `20px 10px` |
| Sidebar background | `rgba(11,11,18,0.65)` + `backdrop-filter: blur(16px)` |
| Sidebar border-right | `1px solid rgba(255,255,255,0.08)` |
| Sidebar transition | `width 0.22s ease, padding 0.22s ease` |
| Collapse toggle button | 22×22px circle, positioned at `right: -12px, top: 22px` |
| Nav item height | `~40px` (padding 10px top + 10px bottom) |
| Nav item border radius | `10px` |
| Nav item gap | `3px` |
| Logo box | 170×58px (expanded), 42×42px (collapsed), border-radius 14px/13px |
| Logo glow | `box-shadow: 0 0 22px -2px rgba(212,255,58,0.5)` |

---

## 22. XBI Sidebar — Active Nav Item

Active items use a **solid lime fill** — completely different from the CRM sidebar's blue left-bar approach:

```css
/* Active state */
background: #d4ff3a
color: #0a0a14          /* near-black text on lime */
font-weight: 700
box-shadow: 0 0 24px -8px #d4ff3a   /* lime glow */

/* Hover (inactive) */
background: #101010     /* T.surfaceAlt */
color: #ffffff

/* Default */
background: transparent
color: #e2e2e2          /* T.textMid */
```

Icon color flips to `#0a0a14` (dark) when active so it's visible on the lime background.

The **Chat** nav item has a magenta notification dot:
```css
width: 6px; height: 6px; border-radius: 99px;
background: #ff3da8;
box-shadow: 0 0 6px #ff3da8;
```

---

## 23. XBI Card Component

The base card is a glassmorphism panel:

```css
background:       rgba(16, 16, 26, 0.65)
backdrop-filter:  blur(12px)
border:           1px solid rgba(255, 255, 255, 0.08)
border-radius:    18px
padding:          18px
overflow:         hidden
```

Hover state adds an inset glow (`.card-hover` class):
```css
transition: border-color 0.2s ease, box-shadow 0.2s ease
:hover {
  border-color: rgba(255,255,255,0.14)
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06), 0 8px 32px -8px rgba(0,0,0,0.4)
}
```

---

## 24. KPI Stat Cards

KPI cards are fully gradient-filled (no glass). Each card gets a `color` + `color2` that forms a `135deg` gradient.

```
background: linear-gradient(135deg, color 0%, color2 100%)
border-radius: 18px (outer) / 17px (inner gradient div)
padding: 6px 14px 4px
```

**Gradient combinations used in the dashboard (from screenshot):**

| Widget | color | color2 |
|---|---|---|
| Total Revenue | `#d4ff3a` (lime) | `#38f0e8` (cyan) |
| Lead Conversion | `#ff3da8` (magenta) | `#a98aff` (violet) |
| Top Product | `#ff3da8` (magenta) | `#a98aff` (violet) |

**Decorative overlay** on every KPI card (adds depth to the gradient):
```css
background: radial-gradient(circle at 85% 110%, rgba(0,0,0,0.28), transparent 55%),
            radial-gradient(circle at 10% -20%, rgba(255,255,255,0.18), transparent 50%)
```

**Text on KPI cards**: `color: #08080c` (near-black) — never white — so it reads on bright gradients.

**Icon container** (top-left of card):
```css
width: 26px; height: 26px; border-radius: 8px;
background: rgba(8,8,14,0.85)
```

**Sub-badge** (top-right, e.g. "from 2 products"):
```css
padding: 4px 10px; border-radius: 99px;
background: rgba(8,8,14,0.12)
border: 1px solid rgba(8,8,14,0.15)
color: #08080c; font-size: 9–11px; font-weight: 700
```

**KPI value number**:
```
font-family: Space Grotesk
font-weight: 700
color: #08080c
letter-spacing: -1.5px
line-height: 0.85
font-size: dynamic — scales with card height (42px min, 84px max)
```

**Delta badge** (bottom of card):
```css
background: rgba(8,8,14,0.85)
color: #f0f0f7; font-size: 10px; font-weight: 700
font-family: JetBrains Mono
padding: 3px 8px; border-radius: 99px
```

---

## 25. Section Header Component

Every widget card starts with a `SectionHeader` — a glow-dot + uppercase title + optional right slot.

```css
/* Glow dot */
width: 6px; height: 6px; border-radius: 99px;
background: <accent color>
box-shadow: 0 0 10px <accent color>

/* Title */
font-family: Space Grotesk
font-size: 11px; font-weight: 600
color: #ffffff
letter-spacing: 1px; text-transform: uppercase
```

Accent colors used per widget:
- Growth Trends → `T.lime` (`#d4ff3a`)
- Lead Status / Lead Conversion → `T.cyan` (`#38f0e8`)
- Employee Performance → `T.magenta` (`#ff3da8`)
- Product Revenue → `T.lime`

---

## 26. Tab Group Component

Used inside widget headers to switch chart views (Pipeline / Revenue / Conversion, Source / Employee, Target / Tasks):

```css
/* Container */
background: rgba(255,255,255,0.03)
backdrop-filter: blur(10px)
border: 1px solid rgba(255,255,255,0.08)
border-radius: 10px; padding: 3px; gap: 2px

/* Active tab */
background: <accent>        /* lime, cyan, or magenta */
color: #08080c              /* dark text on bright bg */
font-weight: 600; border-radius: 7px

/* Inactive tab */
background: transparent
color: #e2e2e2              /* T.textMid */

/* Sizes */
sm: padding 5px 12px, font-size 11px
md: padding 7px 16px, font-size 12px
```

---

## 27. Pill / Badge Component

Used for unit labels like "₹ Lakhs":

```css
display: inline-flex; align-items: center; gap: 4px
padding: 3px 8px; border-radius: 99px
font-size: 11px; font-weight: 600
background: <color>22       /* 13% opacity fill */
color: <color>
border: 1px solid <color>30  /* 19% opacity border */
```

`dim` variant uses `<color>15` (8% opacity) fill instead of `22`.

---

## 28. Progress Bars (Employee Performance)

Progress bars use a color tier based on completion percentage:

```ts
pct >= 100 → T.lime    (#d4ff3a)  // goal met
pct >= 80  → T.green   (#3ddc97)
pct >= 60  → T.cyan    (#38f0e8)
pct >= 40  → T.violet  (#a98aff)
pct >= 20  → T.orange  (#ff8a3d)
pct <  20  → T.red     (#ff5470)
```

Progress bar track: `height: 4px`, `background: T.border (#2a2a2a)`, `border-radius: 99px`

Progress bar fill:
```css
background: linear-gradient(90deg, <barColor>, <barColor>cc)
box-shadow: 0 0 12px <barColor>80
transition: width 0.4s ease, background 0.3s ease
```

---

## 29. Skeleton Loading

Two keyframe animations:

```css
@keyframes xbi-pulse {
  0%   { opacity: 0.5; }
  50%  { opacity: 1;   }
  100% { opacity: 0.5; }
}

@keyframes xbi-shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

Skeleton base color: `rgba(255,255,255,0.04)`
Shimmer overlay: `linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)`

---

## 30. XBI MUI Theme Overrides

When MUI components are used inside XBI pages, this theme is applied via `XbiThemeWrapper`:

```ts
palette: {
  mode: 'dark',
  primary:    { main: '#d4ff3a', contrastText: '#000000' },
  secondary:  { main: '#38f0e8' },
  error:      { main: '#ff5470' },
  warning:    { main: '#ff8a3d' },
  info:       { main: '#38f0e8' },
  success:    { main: '#3ddc97' },
  background: { default: '#000000', paper: '#0a0a0a' },
  text:       { primary: '#ffffff', secondary: '#e2e2e2', disabled: '#b4b4b4' },
  divider:    '#2a2a2a',
}

shape: { borderRadius: 12 }

// Component overrides
MuiPaper:         { backgroundColor: '#0a0a0a', border: '1px solid #2a2a2a' }
MuiCard:          { backgroundColor: '#0a0a0a', border: '1px solid #2a2a2a' }
MuiButton:        { textTransform: 'none', fontWeight: 600 }
  containedPrimary: { boxShadow: '0 0 18px -4px #d4ff3a' }
  :hover:           { boxShadow: '0 0 24px -2px #d4ff3a' }
MuiOutlinedInput: { backgroundColor: '#101010', border: '#2a2a2a', hover: '#3a3a3a' }
MuiChip:          { backgroundColor: '#101010', border: '#2a2a2a' }
MuiLinearProgress:{ track: '#2a2a2a', bar: '#d4ff3a' }
MuiTooltip:       { bg: '#000000', border: '1px solid #3a3a3a', fontSize: 11 }
```

---

## 31. Chart Tooltip Style

The chart hover tooltip uses a **light** popup on the dark canvas — an intentional contrast inversion:

```css
background: rgba(255, 255, 255, 0.98)
backdrop-filter: blur(8px)
border: 1px solid rgba(255, 255, 255, 0.1)
border-radius: 14px
padding: 12px 16px
color: #1a1a1a

/* Title */
font-weight: 700; font-size: 13px; color: #000; letter-spacing: -0.01em

/* Row labels */
color: #666; font-weight: 500

/* Row values */
font-family: JetBrains Mono; font-weight: 700; color: #111

/* Color dot per series */
width: 8px; height: 8px; border-radius: 3px;
box-shadow: 0 0 8px <color>60

box-shadow: 0 12px 32px -8px rgba(0,0,0,0.15), 0 4px 12px -2px rgba(0,0,0,0.08)
animation: xbi-fadeUp 0.2s ease-out
```

---

## 32. XBI User Avatar

The sidebar footer avatar uses a magenta → violet gradient:

```css
width: 34px; height: 34px; border-radius: 10px;
background: linear-gradient(135deg, #ff3da8, #a98aff)
font-family: Space Grotesk; font-weight: 700; color: white; font-size: 13px
```

---

## 33. XBI Replication Checklist

- [ ] Install `Space Grotesk` and `JetBrains Mono` via Google Fonts
- [ ] Define the `T` tokens object (copy from Section 19)
- [ ] Define the `FONT` constant (`display`, `body`, `mono`)
- [ ] Use `background: #000000` as the page root
- [ ] Cards: `rgba(16,16,26,0.65)` + `backdrop-filter: blur(12px)` + `border: 1px solid rgba(255,255,255,0.08)` + `border-radius: 18px`
- [ ] Sidebar: `rgba(11,11,18,0.65)` + `backdrop-filter: blur(16px)` + `border-right: 1px solid rgba(255,255,255,0.08)`
- [ ] Active nav item: solid lime `#d4ff3a` background, dark `#0a0a14` text, lime glow shadow
- [ ] KPI cards: solid gradient fill (not glass), dark `#08080c` text, radial decorative overlay
- [ ] Section headers: 6px glow-dot + Space Grotesk 11px uppercase title
- [ ] Tab group: glass container (`rgba(255,255,255,0.03)`) with solid accent active pill
- [ ] Progress bars: tiered color system based on % completion
- [ ] Skeleton: `xbi-pulse` opacity animation + `xbi-shimmer` translate animation
- [ ] Wrap MUI components with `XbiThemeWrapper`
- [ ] Chart tooltips: white popup (`rgba(255,255,255,0.98)`) on dark canvas — contrast inversion
- [ ] Keep all borders as `#2a2a2a` solid or `rgba(255,255,255,0.08)` glass — never grey

---

## 34. XBI Package Install (additional)

```bash
npm install \
  @fontsource/space-grotesk \
  @fontsource/jetbrains-mono
```

Or use Google Fonts CDN (preferred for XBI since it's a standalone tab/window):
```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
```
