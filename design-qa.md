# Design QA — Studio homepage global truss retirement

## Status

Final result: passed

## Comparison target and evidence

- Source visual truth: current production before the fix,
  `/private/tmp/studio-v-truss-audit-2026-08-06/`.
- Rendered implementation: local r5 build after the fix,
  `/private/tmp/studio-v-truss-after-2026-08-06/`.
- Full-view combined comparison — Projects:
  `/private/tmp/studio-v-truss-projects-before-after.png`.
- Focused combined comparison — Stage Overview:
  `/private/tmp/studio-v-truss-stage-before-after.png`.
- Desktop source and implementation captures: 1440 × 900px, CSS viewport
  1440 × 900, device scale factor 1, identical scroll positions.
- Mobile source and implementation captures: 390 × 844px, CSS viewport
  390 × 844, device scale factor 1, identical section-start states.
- Density normalization: none required; paired captures have identical pixel and CSS
  dimensions.

## Findings and iteration history

1. [P1] The production homepage still created one fixed photographic canvas from
   three stage images. Its ceiling-LED silhouette remained visible behind the Stage
   Overview heading and across the entire Projects section, making a content image
   look like an unintended background stain.
2. Fix: the Studio route now keeps the approved depth-layout classes but does not
   create or load the global photographic canvas. Section-local gallery media,
   project cards, use-case imagery, pointer depth, and scroll behavior remain intact.
3. Post-fix evidence: the paired Stage and Projects comparisons show the exact truss
   silhouette removed while the header, type, spacing, cards, crops, and intended
   section images remain unchanged. The local runtime reports no `.depth-canvas--v12`
   element on desktop or mobile.

No actionable P0, P1, or P2 findings remain.

## Responsive and runtime verification

- Desktop 1440 × 900: Stage Overview, gallery midpoint, Projects, Use Cases, and
  Technology Partners captured and inspected.
- Mobile 390 × 844: Stage Overview and Technology Partners captured and inspected.
- Homepage page height and every measured section height are identical before and
  after the change at both viewports.
- Horizontal overflow: 0px at both viewports.
- Primary interactions tested: responsive navigation state, homepage scroll scenes,
  project card layout, use-case scene, and partner-wall rendering.
- Browser console errors and runtime exceptions: none.
- The only failed network events are the intentionally blocked video requests used to
  keep deterministic screenshot states; they are not application failures.

## Required fidelity surfaces

- Fonts and typography: unchanged; weights, line breaks, hierarchy, and antialiasing
  match the source captures.
- Spacing and layout rhythm: unchanged; identical section and page dimensions confirm
  that removing the canvas did not alter layout, crop, alignment, or scroll spacing.
- Colors and visual tokens: the approved near-black section surfaces remain; only the
  unintended cyan-gray photographic silhouette is gone.
- Image quality and asset fidelity: real stage photography remains in the gallery and
  Use Cases scene at its intended crop. No image, logo, or icon was stretched,
  replaced, or approximated.
- Copy and content: unchanged.

## Static verification

- `npm run check`: passed.
- `git diff --check`: passed.
