# NaiveStream: Project Overview

## Project Mission
NaiveStream is a high-bandwidth, high-fidelity media system designed for a premium streaming experience without the need for authentication.

## Tech Stack
- **Framework**: Next.js 16 (App Router + Turbopack)
- **Styling**: Tailwind CSS v4 (Alpha/Edge)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Theme**: `next-themes` with manual class toggling
- **API**: Sanka Vollerei Anime API (multi-source: Otakudesu & Samehadaku)

## Brand Identity: "Professional Cyberpunk"
- **Typography**: Orbitron (Headings), Exo 2 (Body)
- **Color Palette**: Neon Green (#22C55E) accents on Deep Space Blue (#020617) or Slate White.
- **UI Logic**: Blocky, angular elements created with CSS `clip-path`. Solid, high-contrast typography. No tech-jargon in user-facing copy.

## Core Features
1. **Intelligent Playback**: Resume from the last watched episode or start from Episode 1 automatically. (carousel)
2. **Local History**: Progress tracked directly in `localStorage` for privacy and ease of use.
3. **Resilient Data Mapping**: Multi-provider fallback and robust property extraction (poster, episodes, synopsis).
4. **Dynamic Library**: Advanced pagination thanks to api.

## Handover Instructions
1. Refer to `PLAN.md` for immediate next steps.
2. Respect the `@custom-variant dark` in `globals.css`.
3. Use the professional brand voice (Standard English).
4. Maintain the 5-column grid layout for desktop.

## API SOURCE
- https://www.sankavollerei.com/anime/ has 50 limit request per minute. so for now we limit to 45 request per minute to make sure we don't get rate limited and banned. 


