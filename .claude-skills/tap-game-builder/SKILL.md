---
name: tap-game-builder
description: Builds a new toddler tap-to-play game (like car-tap-game, animal-tap-game, flags-tap-game) for Pavan's github.com/sppavankumar/Games repo, matching the repo's existing zero-build React+Tailwind CDN pattern exactly, wires it into the hub page and README, and carries it through to a GitHub pull request. Use this whenever the user wants to add a new tap game to the Games repo — mentions a new game theme/topic (dinosaurs, fruits, space, numbers, shapes, etc.), asks to "make a game like car-tap-game" or "add a new tap game," wants a new game added to the hub page at sppavankumar.github.io/Games, or wants to open a PR for a new game. Also use it for any git/PR question specific to this repo, since it encodes the required safety check (confirm the branch before pushing — never push straight to main).
---

# Tap Game Builder

Pavan maintains `github.com/sppavankumar/Games`, a small collection of
zero-build, toddler-friendly "tap a card, hear its name" games hosted on GitHub
Pages. Every game in the repo follows the same shape closely enough that a new
one can be generated almost entirely from a theme and a list of items — the real
work is picking good items/colors, staying faithful to the existing pattern
exactly, and getting the change safely into a PR.

Read this whole file before starting; it's short. The templates and references
below do the heavy lifting — you're mostly filling in the theme-specific parts and
following the checklist in order.

## The repo's existing pattern (what every game must match)

- The repo root has `index.html`, a small static hub page listing every game as a
  card (emoji + title, linking to that game's folder), and a `README.md` with a
  matching bullet list.
- Each game lives in its own folder, `<theme>-tap-game/`, containing:
  - `index.html` — fully self-contained: React 18, ReactDOM, Babel Standalone, and
    Tailwind all loaded from CDN, with the entire app in one inline
    `<script type="text/babel">`. No build step, no `npm install` — this is
    deliberate so GitHub Pages can serve the folder as-is.
  - `<theme>-tap-game.jsx` — the same component as a portable ES module
    (`import React from "react"`, `import { ... } from "lucide-react"`), kept in
    sync with the `index.html` version. Every game in the repo keeps both forms.
  - `images/` — a folder of `<slug>.jpg` files, one per item, added separately
    (often after the code, once real photos/logos are on hand).
- Each game defines a small data array of items — `{ name, slug, color, accent }` —
  mapped to add an `id` and a `photoUrl` pointing at `images/<slug>.jpg`. A
  `PhotoTile` component tries to load that image and falls back to a colored
  gradient tile with an icon if it 404s, so the game is fully playable before any
  art exists.
- Tapping a card speaks the item's name aloud (`SpeechSynthesis`), pops a brief
  confetti/star burst, shows a random one-word praise ("Yay!", "Woohoo!"), and
  advances a tapped-count progress bar in the header.
- Visual language throughout: big responsive card grid (2 cols on phones, 3-4 on
  larger screens), thick rounded borders, bright saturated colors, large bold
  type, `aria-label`s on every card, no text entry, no ads, no external links
  besides the CDN script tags.

## Step-by-step workflow

### 1. Nail down the theme and item list

Ask (or infer from what the user already said) the game's theme, e.g.
"dinosaurs," "fruits," "space." Then propose a list of 10–24 items — that's the
range every existing game in the repo falls into. Favor items a toddler would
recognize and that have a distinctive color/shape, since the placeholder tile is
often what's visible before real photos arrive.

For each item you need: `name` (the display text, spoken aloud), `slug`
(lowercase, hyphenated, matches the eventual `images/<slug>.jpg` filename — check
this doesn't collide with an existing slug in that same game folder), `color` (a
dark/rich hex the gradient background uses), `accent` (a lighter contrasting hex
the icon and label chip use). Reuse the color/accent pairing style from existing
games — dark saturated `color`, bright complementary `accent` — rather than
inventing a different palette language.

Show the user the proposed list before generating files if there's any ambiguity
about scope or which items to include — it's much cheaper to adjust a list of
names than to regenerate the whole game after the fact.

### 2. Generate the game files from the templates

Use `templates/game-index.html.template` and `templates/game-module.jsx.template`
— don't write these from scratch, they encode a lot of exact-match styling detail
(border colors, animation keyframes, spacing) that's easy to drift from if
hand-written. Fill in the placeholders:

- `{{TITLE}}` — the game's display title, e.g. "Dinosaurs"
- `{{ITEMS_ARRAY}}` — the JS array literal of item objects, indented to match
  the surrounding code
- `{{MAIN_ICON_SVG_PATHS}}` (HTML template) / `{{MAIN_ICON_NAME}}` (JSX
  template) — pick a single lucide-react icon that broadly fits the theme (a paw
  for animals, a rocket for space) to show inside the placeholder tile; for the
  HTML template you need the equivalent inline SVG paths for that icon since
  there's no npm import available there — look up the icon's path data from
  lucide's SVG source rather than guessing
- `{{HEADER_BG}}` / `{{HEADER_ACCENT}}` / `{{SUBTITLE_COLOR}}` — the game's
  overall theme colors (header bar background, active-border/progress-bar
  accent, subtitle text color)
- `{{BACKGROUND_GRADIENT}}` — a CSS radial-gradient string for the page
  background, in the same style as existing games (dark, moody, with a lighter
  glow near one corner)
- `{{ACCENT_1}}` / `{{ACCENT_2}}` / `{{ACCENT_3}}` — three confetti colors

Write the filled-in files to `<theme>-tap-game/index.html` and
`<theme>-tap-game/<theme>-tap-game.jsx` in the user's local clone (or your working
clone, in Mode A — see step 4). Create the `<theme>-tap-game/images/` folder too,
even though it'll start empty.

### 3. Wire the game into the hub page and README

Read `references/hub-page-update.md` for the exact snippet shape and where it
goes. Update the root `index.html` and `README.md` — purely additive, one new
card and one new bullet, matching the existing entries' formatting exactly.
Double-check you haven't touched any other card/bullet in either file; a diff
that only adds lines is the goal.

### 4. Get it into a PR

Read `references/git-workflow.md` in full before touching git — it covers both
operating modes (direct shell/git access vs. file-only access to the user's
machine via a device bridge) and, importantly, the exact branch-check step that
exists because a past run once pushed a change straight to `main` by accident
(a `git push -u origin` with no branch name, run while `main` happened to be
checked out). That file's checklist is the actual safety mechanism here — follow
it in order, and don't skip the "confirm current branch" step even when it feels
redundant, since that's precisely the step that was skipped last time.

### 5. Tell the user what's still needed

Real photos. The placeholder tiles work, but the game only really comes alive
once `images/<slug>.jpg` exists for each item. Remind the user which slugs still
need images (all of them, on a freshly generated game) and that dropping in a
matching-named `.jpg` is all that's required — no code changes.

## Notes on judgment calls

- If the user gives you a theme but no item list, propose one yourself rather
  than asking a clarifying question first — a concrete draft list is easier for
  them to edit than an open-ended question, and matches how this repo's other
  games were built (broad, recognizable items within the theme).
- If they want something that doesn't fit the tap-to-hear-name pattern at all
  (e.g. a game with scoring, levels, or multi-step interaction), say so — this
  skill is specifically for the simple tap/speak/confetti format the rest of the
  repo uses, not a general game generator. Building something structurally
  different from the rest of the repo would make it the odd one out.
- Keep the whole thing lightweight. This is a parent building games for their
  kids in their spare time, not a production codebase — favor getting a working,
  good-looking game out the door over process for its own sake.
