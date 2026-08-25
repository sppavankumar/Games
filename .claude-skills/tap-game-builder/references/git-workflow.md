# Git / PR workflow for the Games repo

This repo is `github.com/sppavankumar/Games`. Every new game needs to land via a
pull request, on its own branch — never as a direct commit to `main`.

## Why the branch check matters

In an earlier session, a `git push -u origin` was run without a branch name while
still checked out on `main` (a leftover `git checkout -b ...` from a prior step had
been skipped). Git happily pushed straight to `main` since that was the current
branch, and the change went live with no PR, no review step, and no way to compare
before/after. It caused no real harm that time — but it means this workflow needs a
hard checkpoint before every push, not just an instruction to "make a branch."

**Before running any push, always run `git branch --show-current` and confirm the
output is the new feature branch, not `main`.** Do this check explicitly, out loud
in your response — don't assume the earlier `checkout -b` "took." If it shows
`main`, run `git checkout -b <branch-name>` again before touching push.

## Two operating modes

You'll be in one of two situations depending on how you're connected to the user's
files. Detect which one applies and follow the matching steps.

### Mode A — You have direct shell + git access (e.g. a sandboxed clone)

1. Clone the repo (or use the existing checkout) and confirm you're starting from
   an up-to-date `main`:
   ```bash
   git fetch origin
   git checkout main
   git pull origin main
   ```
2. Create a descriptive feature branch, e.g. `add-<theme>-tap-game`:
   ```bash
   git checkout -b add-<theme>-tap-game
   ```
3. Add the new game folder and the hub-page/README updates, then commit:
   ```bash
   git add <theme>-tap-game/ index.html README.md
   git commit -m "Add <Theme> Tap Game"
   ```
4. **Confirm the branch before pushing:**
   ```bash
   git branch --show-current
   # must print add-<theme>-tap-game, NOT main — if it prints main, stop and
   # re-run `git checkout -b add-<theme>-tap-game` before continuing
   ```
5. Push the named branch explicitly (never a bare `git push` or `git push -u origin`
   with no branch argument — always spell out the branch name so there's no
   ambiguity about what's being pushed):
   ```bash
   git push -u origin add-<theme>-tap-game
   ```
6. Open the PR. Prefer the `gh` CLI if it's available:
   ```bash
   gh pr create --title "Add <Theme> Tap Game" \
     --body "Adds a new toddler tap game for <theme>, following the existing pattern. Placeholder tiles show until real images/<slug>.jpg photos are dropped in." \
     --base main --head add-<theme>-tap-game
   ```
   If `gh` isn't installed or isn't authenticated, fall back to pushing (steps
   above) and then give the user the compare URL so they can open the PR in their
   browser:
   ```
   https://github.com/sppavankumar/Games/compare/main...add-<theme>-tap-game
   ```

### Mode B — You only have file access to the user's machine (e.g. a device bridge, no git/gh here)

You can write files onto the user's disk, but you can't run `git`/`gh` yourself.
Write every new/changed file locally exactly as you would in Mode A, then hand the
user a copy-pasteable terminal script — don't make them assemble commands from
prose. Always include the branch-check line, and always spell out the branch name
in the push:

```bash
cd ~/Documents/Claude/Games   # adjust if their local clone lives elsewhere
git checkout main
git pull origin main
git checkout -b add-<theme>-tap-game
git add <theme>-tap-game/ index.html README.md
git commit -m "Add <Theme> Tap Game"
git branch --show-current   # confirm this prints add-<theme>-tap-game, not main
git push -u origin add-<theme>-tap-game
```

Then tell them to either follow the URL git prints after the push (GitHub shows a
direct "Create pull request" link for a freshly pushed branch), or visit:
```
https://github.com/sppavankumar/Games/compare/main...add-<theme>-tap-game
```
and click **Create pull request** there.

## Common mistake this workflow exists to prevent

Running `git push -u origin` (or plain `git push`) with no branch name, while not
verifying which branch is currently checked out. If `main` is checked out — even
by accident, even because an earlier step in the same session silently failed —
this pushes straight to `main` with no PR. Always name the branch on the push
command itself, and always confirm the current branch immediately beforehand.
