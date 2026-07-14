# Studio V Collaboration Rules

## Required Context

- Before any Studio V work, read `docs/STUDIO_V_STATE.md`. It is the canonical durable
  product, design, media, version, and operations handoff shared by Codex, Main Hermes,
  and Team Hermes.
- Do not rely on an older session summary when it conflicts with the repository state
  file or current `origin/main`.

## Source Of Truth

- GitHub `hoozino99/studio-v-homepage` on branch `main` is the canonical shared version.
- Before editing, run `git fetch origin`. If the worktree is clean and `main` can fast-forward, update it from `origin/main`.
- If local work is dirty or branches have diverged, preserve the work. Do not hard reset, force-push, or delete another contributor's changes; inspect and reconcile them first.

## Finishing A Change

- Keep edits scoped and retain a rollback path for visual experiments.
- Run `npm run check` and inspect the affected desktop and mobile views before publishing.
- After a validated change, commit it intentionally and push `main` so every Codex and Hermes session starts from the same version.
- Cloudflare Pages is Git-connected to `main`. Verify the resulting deployment before reporting that publishing is complete.

## Deployment Safety

- Never print or commit GitHub, Cloudflare, OAuth, or API credentials.
- Keep large source video outside Git and Cloudflare Pages static assets; use R2 for web-ready large media.
- Ask before force pushes, DNS changes, project deletion, token rotation, or destructive cleanup.
