# Studio V Project State

Updated: 2026-08-21 KST

This is the canonical durable handoff for Codex, Main Hermes, and Team Hermes.
Read this file before changing, deploying, or describing the Studio V site. GitHub
`hoozino99/studio-v-homepage` branch `main` is the live source of truth, so always
confirm the current commit instead of treating a hash written in a note as permanent.

## Current Baseline

- Repository: `https://github.com/hoozino99/studio-v-homepage.git`
- Canonical branch: `main`
- Stable production URL: `https://studio-v-homepage.pages.dev/`
- Cloudflare Pages project: `studio-v-homepage`
- Cloudflare R2 bucket: `studio-v-media`
- Last visually verified UI baseline: `e8ac779` (`depth-v12`)
- Current subpage asset version in HTML: `studio-v-lightfield-v13`
- Local Codex workspace: `/Users/dextermacpro/Documents/VibeCoding/master-v1-copyedit`
- Main Hermes workspace: `/opt/data/workspace/studio-v-homepage`
- Team Hermes workspace: `/opt/data/workspace/studio-v-homepage`

Documentation-only commits may follow the UI baseline. The actual latest version is
always `origin/main`; verify it with `git fetch origin` and `git rev-parse`.

## Product Direction

Studio V is the large LED virtual production stage at StudioCube in Daejeon. The
physical stage, its scale, and real work made there are the main subject. The visual
reference family is premium virtual production, VFX, and post-production studio
sites, especially the directness and project presentation of NantStudios, adapted to
Studio V rather than copied.

Durable design decisions:

- The site should feel like one continuous cinematic page, not stacked rectangular
  sections. Avoid visible seams, bars that cover the previous scene, abrupt black
  handoffs, and unrelated sticky layers moving at different speeds.
- Interaction should support the content. Use scroll-driven image changes, restrained
  parallax, and depth from real stage imagery. Do not add generic grids, polygon
  patterns, neon sci-fi decoration, aurora, blobs, or decorative SaaS cards.
- The palette is near-black, white, and restrained silver-cyan. The old brown/amber
  accent is not a brand requirement and should not return without a reason.
- Prefer Pretendard and compact, natural copy. Avoid oversized text, translated-sounding
  marketing copy, feature explanations, and unnecessary call-to-action buttons.
- Actual Studio V photography and actual project frames are preferred. Generated
  imagery is only acceptable for careful cleanup or extension when the real central
  image remains intact.
- Desktop and mobile should share the same tone and narrative. Mobile may simplify
  mechanics, but should not become a static, unrelated version.
- Preserve rollback points for visual experiments. Do not delete older working assets
  or history merely because a newer direction is active.

## Current Site Map

### Studio (`index.html`)

1. Hero
   - Full-viewport `Cube of Memory` main film served from R2.
   - Autoplay, muted, looping, inline playback, no visible controls or play button.
   - Current source:
     `https://pub-a5f89087d1944563a95a0e36722bdac8.r2.dev/video/cube-of-memory-main-film-hq.mp4`
   - The image is intentionally cinematic and restrained; do not restore the earlier
     scrub-only hero or a short compressed preview unless the user asks for rollback.
2. Stage Overview
   - Scroll-driven three-frame gallery: Main LED Wall, Side LED Wall, Ceiling LED.
   - The gallery has responsive outer gutters and subtle corner rounding instead of a
     hard full-bleed rectangle.
   - Current headline: `667평 플로어 위에 펼쳐지는 대형 LED 스테이지.`
3. Projects
   - Continuously moving horizontal project archive on desktop and mobile.
   - Current section copy: `Projects / Made at Studio V.`
   - Thumbnail canvases use a consistent ratio. Restricted automotive projects use
     simple framed disclosure canvases instead of fake imagery.
4. Use Cases
   - Commercial, Film & Drama, Event.
   - Scroll-driven sequence on desktop and mobile-capable scroll scenes; touch fallback
     remains available where the full sticky sequence is disabled.
   - Commercial uses three AION production frames; Film & Drama uses one frame; Event
     uses the StudioCube opening/event frame.
   - The final Event frame must reach full opacity and remain readable before the page
     continues to Technology Partners. Do not shorten this handoff until the image is
     skipped again.
   - Hero, Stage Overview, Projects, and Use Cases have slightly increased breathing
     room. Their real imagery now sits above restrained silver-cyan 2.5D light bridges;
     feathered masks and reduced image opacity prevent hard cropping at section edges.
     The visible right-edge spill uses the approved black-base
     `assets/images/light-fields/led-spill.png` plate with section-specific depth and
     opacity. The plate remains a small accent on the black field rather than a full
     section haze, with a radial feather on its own edges. Hero's film-to-black handoff
     uses a long neutral bottom feather; no extra Use Cases light overlay is active in
     the rollback baseline.
5. Technology Partners
   - `Powered by / Technology Partners`, using leveled v13 plaque-derived marks.
   - Main vendors are visually larger; supporting vendors are centered as a complete
     group, not left-stranded on the last row.
   - The section is restored to a pure-black background with a centered title and
     borderless logo wall. No pastel field, organic glass panel, grid, rings, or
     decorative stage structure is used. Desktop and mobile keep the same centered
     hierarchy, with a two-column logo rhythm on mobile and no horizontal overflow.
   - The Use Cases handoff overlaps the Partner surface by 2px and uses a neutral black
     upward feather. Do not restore a top border, cyan strip, radial color bloom, or
     blurred light band at this boundary.
   - The Partner-to-footer handoff also has no border line; the neutral background tone
     shift alone separates the footer.
   - Supporting partner marks use stable responsive optical cells: six columns on wide
     screens, four on tablet, three on narrow tablet, and two on mobile. Epic Games is
     placed at the beginning of the supporting wall; wide marks such as Vidente and
     BATECH use contain-based sizing with visible overflow protection.
6. Footer
   - Operational logos are ordered: Ministry of Culture, Sports and Tourism; KOCCA;
     Dexter Studios; XON Studios.
   - PGK was intentionally removed. Marks should share a consistent optical height.

### 3D Tour (`tour.html`)

- Three.js stage preview with responsive desktop/mobile control panels.
- Studio specs: 667평 / 2,204m2, Main LED 60m x 8m, resolution 21K x 3K.
- OptiTrack was intentionally removed from the compact spec cards.
- View presets: Overview, LED Wall, Stage, Plan, plus Auto Rotate.
- One vehicle and one person are scale references. They can move left/right and
  front/back and rotate horizontally; vertical positioning is intentionally absent.
- Vehicle and person dimensions remain visible as scale labels.
- The person scale reference now loads the RenderPeople Eric rigged FBX at 1.75m,
  with a procedural-person fallback if the asset fails. Its shoulder pose is adjusted
  toward a relaxed, closer-to-body stance rather than the source A-pose; the committed
  2048px texture derivatives and reduced render settings keep the reference light.
  The person asset is scaled inside a dedicated body group so its raw FBX offset is
  scaled together with the geometry and the feet remain on the wrapper floor pivot.
  Both reference wrappers use a floor-centered x/z pivot and start at `0°` rotation so
  the vehicle and person face the default camera direction. Attribution is recorded in
  `assets/models/renderpeople-eric/ATTRIBUTION.md`; the FBX uses the shared
  `assets/models/sourceimages/` texture path.
- The Mercedes model should be the only vehicle representation after load. Do not show
  an early box/proxy car while the model is loading.
- LED video supports play/stop, scale, X/Y position, and reset.
- Video belongs only on the front-facing LED surface. Back faces must remain dark.
- The main LED wall is modeled with an approximately 5m rear service gap rather than
  being flush to the studio boundary.
- Orbit controls use damping, zoom-to-cursor, and event isolation so scrolling the
  control panel does not move the 3D camera. The camera must be able to approach and
  enter the LED volume without an arbitrary distant stop.

### Portfolio (`portfolio.html`)

- Direct project index with compact filtering and no oversized hero narrative.
- Public projects: Cube of Memory, 서울이야기, AION 2, Hyundai TUCSON, Dealer,
  LE SSERAFIM x Overwatch, StudioCube Opening, Beyond the Set, Genesis GV90 1/2,
  Avante DN8, and the current technology demonstration entry.
- No Portfolio project is currently using the restricted disclosure canvas.
- Restricted projects must not display private production frames. Use the framed
  restricted canvas and short disclosure copy.
- `LE SSERAFIM x Overwatch` is one project; do not split Overwatch into another title.
- AION, Dealer, LE SSERAFIM, and showcase thumbnails must come from their actual
  project footage, preferably readable wide/full-stage frames.
- Portfolio cards show clean thumbnails with compact category and title below; image format labels,
  sequence numbers, and long detail descriptions are intentionally omitted. Archive page
  headings and card titles use a quieter editorial scale rather than oversized display text.
- Portfolio is a static representative-image project record. Public cards do not play
  videos; playable content belongs to Showreel. Restricted projects remain non-interactive.
- Hyundai TUCSON is a Print & Web Campaign entry based on the confirmed 2026-07-09~10
  catalogue/web advertising image shoot. It is Portfolio-only and has no Showreel item.
- 서울이야기 appears in Portfolio as a static Drama Shoot record using the verified
  camera/crew/Studio V stage frame. Its making video remains playable only in Showreel.
- Genesis GV90 1/2 remain separate project records. GV90 1 uses the overhead open-door
  view; GV90 2 uses the owner-supplied side-profile open-door image with the reflecting pool.
- Avante DN8 uses the owner-supplied rooftop rear three-quarter image. Its original
  download UI icon is excluded by the approved 16:9 crop.

### Showreel (`showreel.html`)

- Looping R2 hero and a separate content library below it.
- The old hero description sentence and `영상 목록` / `촬영 문의` hero buttons were
  intentionally removed.
- Landscape videos and portrait shorts have separate sections and native thumbnail
  ratios.
- Clicking a showreel item opens playable video content. Mapping lives in
  `assets/showreel.js`.
- The homepage Showreel mapping contains 14 video entries: 13 website-only copies inside
  the Shared Drive folder `[VP LAB] Studio V 홈페이지 공개영상`
  (`1JVXTeoW27UihVQjzEktdy7VS29qVIqRX`) and one separately shared Series BTS file.
  Public access is controlled with `anyone / reader`, never `writer`.
- Showreel cards display the thumbnail, category/type, and title only; thumbnail sequence
  numbers and long detail descriptions are intentionally omitted. The video modal is
  centered in the viewport and contains the player plus title metadata without a detail
  paragraph.
- Thumbnails should be selected from the mapped video, favoring full-stage or complete
  production views over arbitrary close-ups, title cards, or setup-only frames.
- `서울이야기 Making` uses the externally viewable Drive file
  `17CK3T7C4hXcof0id6YeZZD4_Yq30F9tw`. Portfolio and Showreel use the clean stage/set
  frame `seoul-story-stage-alt.jpg` extracted from the verified making video.
- The presentation deck supplied by the owner is the editorial source for showreel and
  making-video titles/descriptions. Do not copy its internal production notes into the
  public Portfolio page.

### Contact (`contact.html`)

- Intentionally minimal. Show only the practical inquiry destination and essential
  contact details in compact type.
- Do not restore the long preparation checklist, response promise, email-draft tool,
  or redundant inquiry buttons.

## Media And Rights

- The R2 bucket is for web-ready large media; source masters stay local/private.
- `cube-of-memory-main-film-hq.mp4` is the current public hero file in R2.
- The controlled Drive folder is the temporary publishing model for Showreel. Phase 2
  is documented in `docs/STUDIO_V_PRIVATE_MEDIA_PLAN.md`: private R2 objects, a
  Range-capable Worker, short-lived signed playback, and a global pause switch.
- The Drive copies total 17,270,391,629 bytes. Source files were copied, not moved, and
  source permissions were not changed during the migration.
- Never publish the 2.1GB source MOV or raw source folders.
- Cloudflare Pages has a 25 MiB per-static-file limit. Git-tracked files must remain
  below that limit.
- `.gitignore` intentionally excludes:
  - `assets/video/source/`
  - `assets/video/*-hq.mp4`
  - `assets/videos/*-hq.mp4`
  - `*.mov`
  - `.wrangler/`
- Do not delete ignored local masters when removing them from Git tracking.
- The owner-supplied Avante DN8 image is approved for its Portfolio record.
- The two owner-supplied Genesis GV90 images are approved for their respective GV90 records.
- The supplied Hyundai TUCSON representative image is approved for the Portfolio entry;
  no TUCSON video is published.
- Avoid identifiable faces in public thumbnails when another approved frame is
  available.

## Partner Logo Source Of Truth

- Current normalized assets:
  `assets/images/partners-plaque-leveled-v14/`
- These marks were reconstructed from the photographed supplier plaque, then cropped
  and optically leveled. Preserve the actual wordmarks and do not substitute typed
  approximations.
- LG Electronics is the exception: its primary-row mark uses LG Electronics' official
  Korean white PNG at `assets/images/partners-official/lg-electronics-ko-white.png`.
  Source: `https://www.lge.co.kr/company/info/brandAsset` (Korean logo, mono white PNG).
  Do not restore the plaque-derived LG PNG; its final `자` stroke and overall lockup
  proportions are visibly degraded.
- The v14 plaque PNGs preserve the v13 transparent bounds and aspect ratios while
  baking small source-photo deskew corrections into eight marks.
  Keep plaque artwork proportional and normalize it by rendered height, never by
  forcing both width and height.
- Both partner tiers use stable row-major grids: six columns on wide screens, three
  on tablet widths, and two on mobile. No logo spans columns or opts out of the card
  width cap, so resizing cannot reorder, overlap, or crop the marks.
- Compact marks (SAeKI, DHAV, LIVELAB, Doohyun Tech, and Epic Games) use small
  per-logo height adjustments so their visible area matches the wider wordmarks;
  these remain uniform scales and have mobile-specific caps.
- Technology Partners has its own opaque near-black surface. The Studio homepage no
  longer creates a fixed photographic depth canvas, so no stage or truss photograph
  can leak into the partner wall or any other homepage section.
- Current primary row: LG Electronics, Brompton Technology, ARRI, AV Stumpfl,
  MBC C&I, OptiTrack.
- Supporting vendors include SAEKI P&C, KOL Corporation, PetaData, 명인이앤씨,
  Vision&Tech, 비엣스미디어, Sewon / SP Studio Perspective, GMS, LiveLab,
  미디어빌리지테크, Leader, HM vision, DHAV, Funomad, vidente, BATECH,
  Doohyun Tech, and Epic Games.
- Before adjusting CSS size, inspect the PNG transparency bounds. A mark that looks
  small or crooked may have uneven internal whitespace; fix the asset crop first.

## Interaction Architecture

- `assets/main.js` owns the header state, reveal behavior, hero playback recovery,
  Projects marquee, Stage Overview scroll scene, Use Cases scroll scene, partner wall,
  local Partner soft-field motion, ambient variables, and card-level pointer parallax.
- `assets/styles.css` contains cumulative visual-version blocks. The active Technology Partners composition is the scoped `partner soft-field v23` block beginning at `.partner-strip`; edit that block rather than stacking another one-line override.
- No page uses the former global photographic depth canvas. Stage, ceiling/truss, and rig
  photographs may appear only inside their intended content sections, never as a fixed
  page-wide silhouette. Portfolio, Showreel, and Contact use an image-free CSS light field
  plus card-level pointer parallax; reduced-motion keeps a static fallback.
- Respect `prefers-reduced-motion` and retain usable static fallbacks.
- Sticky scenes must consume their own scroll space. A following section must never
  rise over an unfinished image transition or leave a blank hold unrelated to content.

## Version Timeline

- `ba89dc2` depth-v02: stronger parallax and improved 3D Tour controls.
- `7491c01` depth-v03: stabilized Projects and rebuilt parallax.
- `70a5f9e` depth-v04: restored continuous marquee and unified color system.
- `68427c8` depth-v05: unified homepage flow and partner marks.
- `857517a` depth-v06: replaced segmented grid decoration with a layered light field.
- `6a94e03` depth-v07: rectified photographed partner marks.
- `b0d106a` depth-v08: refined immersive field and 3D Tour geometry.
- `82adf28` depth-v09: aligned mobile layouts and controls.
- `7606d99` depth-v10: corrected partner marks and mobile scroll scenes.
- `e08140a` depth-v11: leveled partner marks and stage silhouettes.
- `3e1caf7` depth-v11.1: restored hero autoplay and looping without controls.
- `e8ac779` depth-v12: strengthened photographic parallax, normalized v13 marks,
  finished the Event hold, and established the shared GitHub-first workflow.
- `5975197` depth-v19: replaced the generic Technology Partners grid/rings with the
  pastel soft-field composition; rollback baseline remains `7152b52`.
- `pending v23`: preserved the restored Technology Partners composition and corrected
  optical sizing/alignment for uneven partner marks; rollback baseline remains `4cb1266`
  until the new commit is created.

The branch `codex/depth-v05-seamless` currently points at the verified depth-v12
baseline as an additional rollback reference. Git history remains the primary rollback
mechanism.

## Collaboration Workflow

1. Start in the correct clone and read `AGENTS.md` plus this file.
2. Run `git fetch origin`.
3. If the worktree is clean and `main` is only behind, fast-forward. If it is dirty or
   diverged, preserve the work and reconcile deliberately.
4. Make a scoped change. Do not overwrite another person's uncommitted work.
5. Run `npm run check`.
6. Visually inspect every affected desktop and mobile view. For 3D changes, verify the
   canvas is nonblank and the model/video faces behave correctly.
7. Commit intentionally and push `main` after validation. GitHub `main` is the shared
   handoff point; do not leave a completed change only in one Hermes workspace.
8. Git-connected Cloudflare Pages deploys from `main`. Verify both the deployment and
   `https://studio-v-homepage.pages.dev/` before claiming it is live.

Never use `git reset --hard`, force-push, delete a project/bucket, rotate credentials,
or change DNS without explicit owner approval.

## Operational Commands

```sh
git fetch origin
git status --short --branch
git pull --ff-only origin main
npm run check
git push origin main
gh repo view hoozino99/studio-v-homepage
wrangler whoami
wrangler pages project list
wrangler pages deployment list --project-name studio-v-homepage
wrangler r2 bucket list
```

Routine publishing should use the Git-connected flow. A direct `wrangler pages deploy
.` from a working directory can accidentally include ignored local source media, so do
not use it against the raw workspace without staging only Git-tracked files.

## Current Access Model

- Main Hermes and Team Hermes are both explicitly authorized by the owner to work on
  this project and share its durable project context.
- Both Hermes instances use authenticated GitHub CLI over HTTPS and may manage this
  repository, including normal repository, issue, and PR workflows.
- Both receive the same read-only Cloudflare credential source through Docker. A fresh
  owner OAuth login or a narrowly scoped shared API token is required whenever that
  credential expires.
- Never put GitHub or Cloudflare credentials in this repository, Obsidian, chat, or
  agent memory.

## Cloudflare Access Verification

Owner OAuth approval was renewed on 2026-07-15. `wrangler whoami`, Pages project
listing, and R2 bucket listing succeeded on the host, Main Hermes, and Team Hermes.
Re-verify live if a future command reports an expired credential.
