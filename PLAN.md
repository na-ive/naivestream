# NaiveStream Implementation Plan

## Current Status
NaiveStream is a modern, cyberpunk-themed anime streaming platform built with Next.js 16 and Tailwind CSS v4. The rebranding is complete, but UI consistency regarding theme-switching needs optimization.

## Objective: CSS Variable Unification
The primary goal for the next phase is to eliminate all hardcoded hex codes and one-off colors from component files and strictly reuse the CSS variables defined in `globals.css`.

### 1. Global CSS Audit (`src/app/globals.css`)
- [ ] Ensure all semantic colors are defined in the `@theme` and `.dark` blocks.
- [ ] Required variables:
  - `--color-background`
  - `--color-foreground`
  - `--color-muted-text`
  - `--color-card`
  - `--color-border`
  - `--color-secondary` (Neon Green)

### 2. Component Refactoring
Switch from hardcoded Tailwind classes to semantic theme variables for:
- **AnimeCard**: Remove `bg-slate-900`, `border-secondary/20`, etc. Use semantic variables.
- **HeroCarousel**: Ensure all text and overlays use the unified theme system.
- **Navbar**: Refine search bar colors to follow the global theme precisely.
- **SmartWatchButton**: Ensure variants strictly follow theme colors.

### 3. Verification
- [ ] Test every page in both Light and Dark modes.
- [ ] Ensure `suppressHydrationWarning` is used correctly on the `html` tag.
- [ ] Verify production build stability.

---

## Architectural Mandates
- **Next.js 15+ Pattern**: Always `await params` and `await searchParams` in Server Components.
- **Tailwind v4 Native**: Use the `@custom-variant dark` directive for manual toggling.
- **API Resilience**: All fetches must go through the `/api/proxy` to bypass browser CORS.
- **Provider Continuity**: Maintain `source` (Otakudesu/Samehadaku) across navigation.
