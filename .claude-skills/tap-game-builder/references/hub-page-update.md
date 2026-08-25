# Updating the hub page and README

Two files at the repo root list every game, and both need a new, purely additive
entry whenever a game is added. Never reorder, reword, or restyle the existing
entries — just append.

## index.html (the hub page at the repo root)

This is a small static page (no React/build step) with a `.grid` of `.card`
links. Find the closing `</div>` of the `.grid` and add one more `<a class="card">`
immediately before it, matching the existing markup exactly:

```html
<a class="card" href="<theme>-tap-game/">
  <span class="emoji">{{EMOJI}}</span>
  {{Title}} Tap Game
</a>
```

Pick an emoji that clearly represents the theme (a car for cars, a paw for
animals, a dinosaur for dinosaurs, etc.) — it's the only visual identifier on the
card besides the title, so it should be unambiguous at a glance.

## README.md

Find the `## Games` section's bulleted list and append one more bullet in the
same format as the others:

```markdown
- **{{Title}} Tap Game** — tap a{{n}} {{item-description}} to hear its name; {{N}} {{items}} {{scope, e.g. "from around the world"}}. [Play](https://sppavankumar.github.io/Games/<theme>-tap-game/) · [source](<theme>-tap-game/index.html)
```
