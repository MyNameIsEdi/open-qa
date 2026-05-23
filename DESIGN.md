---
version: alpha
name: open-qa
description: Open-source, multi-agent AI framework for Playwright test automation.
colors:
  primary: '#1a3a8f'
  primary-dark: '#4F72D4'
  bg-body: '#EEE8DC'
  bg-body-dark: '#1C1814'
  bg-card: '#FAF7F2'
  bg-card-dark: '#252018'
  bg-muted: '#E4DDD3'
  text-main: '#1A1714'
  text-muted: '#6B6560'
  border: '#D8D2C6'
  success: '#34C759'
  warning: '#E8A728'
  error: '#EF4444'
typography:
  h1:
    fontFamily: Inter
    fontWeight: 800
    letterSpacing: -0.03em
  h2:
    fontFamily: Inter
    fontWeight: 700
    letterSpacing: -0.02em
  body-md:
    fontFamily: Inter
    fontWeight: 400
    lineHeight: 1.6
  code-md:
    fontFamily: JetBrains Mono
    fontWeight: 400
  label-pixel:
    fontFamily: Silkscreen
    fontWeight: 400
  hebrew-rtl:
    fontFamily: Heebo
    fontWeight: 400
rounded:
  md: 6px
  lg: 8px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  navbar: 56px
  sidebar-collapsed: 56px
  sidebar-expanded: 224px
  chat-panel: 320px
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '#ffffff'
    rounded: '{rounded.lg}'
  card:
    backgroundColor: '{colors.bg-card}'
    rounded: '{rounded.lg}'
  chip:
    rounded: '{rounded.md}'
---

## Overview

**OPEN-QA** is an open-source, multi-agent AI framework for Playwright test automation, running as a single Vite + React SPA.

The interface must feel professional, calm, and highly engineered—never toy-like, despite featuring a 2D pixel-art office. The design accommodates QA engineers, SDETs, and frontend developers who want AI-augmented Playwright testing. It is strictly accessible, supports full light and dark themes, and treats Hebrew RTL users as first-class citizens.

## Colors

The palette relies heavily on warm parchment-like neutrals (Sand) for structure, offset by a strict brand blue (Primary) and semantic status colors.

- **Primary (#1a3a8f):** Brand primary blue. Used for the `-QA` suffix in the logo and primary actions. Switches to `#4F72D4` in dark mode.
- **Sand / Backgrounds:**
  - `--bg-body` (#EEE8DC): Warm parchment base.
  - `--bg-card` (#FAF7F2): Floating card/panel surfaces.
  - `--bg-muted` (#E4DDD3): Subtle backgrounds.
  - `--border` (#D8D2C6): Dividers and borders.
- **Text:** `#1A1714` (Main) and `#6B6560` (Muted/Helper).
- **Semantic Accent Colors:**
  - **Success (Sage):** `#34C759` / `#16A34A` for passing tests.
  - **Warning (Amber):** `#E8A728` / `#D97706` for flaky tests.
  - **Error (Coral):** `#EF4444` / `#DC2626` for failing tests.
- **Canvas Floor:** `#1a1a2e` (always dark, regardless of theme).

## Typography

Typography establishes hierarchy and differentiates structural text, code, and playful elements.

- **UI / Body:** `Inter` (Weights: 400–900). Default font for all standard UI.
- **Hebrew RTL:** `Heebo` (Weights: 400–900). Automatically applied via the `[dir="rtl"]` CSS rule.
- **Code / Mono:** `JetBrains Mono` (Weights: 400–500). Used strictly in `<pre>` and `<code>` blocks, such as Playwright test outputs.
- **Pixel-art labels:** `Silkscreen` (Weights: 400, 700). Used sparingly for agent names and office context.

## Layout

The shell layout employs a fixed navbar, an expanding/collapsing sidebar, and a flex-based main content area. Never use fixed heights on flex children; prefer `flex-1`, `min-h-0`, and `overflow-hidden`.

### Shell Structure

- **Navbar:** `h-14` (56px), sticky top, backdrop-blur, frosted glass background.
- **Sidebar:** Always dark `bg-zinc-900`. Expanded `w-56` (224px) / collapsed `w-14` (56px). Moves to the right in Hebrew RTL mode.
- **Main Area:** Fills remaining space, uses `--bg-body`, scrollable.
- **Chat Sidebar (OfficePage):** Fixed `w-80` (320px). Do not shrink it, as it requires room for TypeScript code blocks.

### Canvas Sizing Rules

- Container width is dictated by `100%` from flex.
- Height is computed at runtime via aspect ratio: `cssH = cssW * rows / cols`.
- Guard against ResizeObserver loops with dirty-checks before setting layout styles.

## Elevation & Depth

The UI relies heavily on flat, 1px outlined borders using `--border` instead of heavy drop shadows.

- **Cards and Panels:** Flat, zero elevation (`elevation: 0` in MUI), wrapped in a 1px solid border.
- **Focus / Active States:** A custom brand glow shadow is used sparingly to draw attention to focused cards or active AI agents: `boxShadow: '0 0 20px rgba(26, 58, 143, 0.18)'`.

## Shapes

Shapes are highly structured and slightly rounded to maintain an engineered yet accessible feel.

- **Cards, Buttons, Inputs:** 8px border radius (`rounded-lg`).
- **Badges, Chips:** 6px border radius (`rounded-md`).
- **Avatars, Status dots:** Fully rounded (`rounded-full`).

## Components

The design leverages Material UI v5 heavily customized to match Tailwind utility tokens.

- **Buttons:** Never use uppercase text (`textTransform: 'none'`). Font weight is always 600. `disableElevation` is true.
- **TextFields:** Outlined variant by default, size "small". Background is slightly tinted (`Sand 100`). Hover and focus states subtly shift the border color.
- **Chips:** Used for test statuses and agent roles. Success, Warning, and Error variants use a 15% opacity background of their respective semantic color with a solid text color.
- **Tooltips:** Dark grey background (`#2D2823`), high contrast text, standard 0.78rem text size, arrow enabled.

## State Management & Configuration

- **SettingsContext:** Manages LLM Provider (Gemini/Ollama), API Keys, and default models.
- **ThemeContext:** Toggles `.dark` class on the `<html>` root.
- **RTL Context:** Toggles `dir="rtl"` automatically.

## Do's and Don'ts

- **Do** use `var(--token)` for colors in CSS to respect theme swapping.
- **Don't** hardcode hex values directly into component styles.
- **Do** read `layout.cols`/`rows` at runtime for accurate canvas sizing.
- **Don't** use `h-[Xpx]` or other fixed heights on containers holding the canvas.
- **Do** test both light AND dark mode extensively before shipping UI.
- **Don't** assume light mode looks fine if dark mode does (and vice versa).
- **Do** ensure WCAG AA contrast (≥ 4.5:1 for normal text).
- **Don't** use `text-transform: uppercase` on buttons. Keep them sentence case.
- **Do** use `rtl:` / `ltr:` variants and logical properties (`start`/`end`) instead of hardcoding `left` or `right` margins and padding.
