# Design QA — Technology Partners optical pass v14

## Status

Final result: **passed**.

## Visual references

- User source screenshot:
  `/Users/dextermacpro/.codex/attachments/6f478288-a39c-43d7-aa32-1e97a70ba3c0/스크린샷 2026-08-04 오후 2.23.01.png`
- Same-state before/after comparison:
  `/private/tmp/studio-v-partners-design-qa-2048.png`
- Final browser captures:
  `/private/tmp/studio-v-actual-{2048,1280,1000,780,390}.png`
- Final full-section mobile capture:
  `/private/tmp/studio-v-actual-390-section.png`

## Iteration history

1. The original five-column wall allowed wide cards to span columns. That made the
   reading order look irregular and clipped Sewon at 390px. The transparent section
   also exposed the fixed truss photograph behind the logos.
2. The wall was changed to a stable row-major 6 / 3 / 2-column grid, all spans were
   removed, plaque widths were capped to their cells, and the partner section received
   an opaque near-black surface.
3. Eight source-baked deskew corrections were added in v14 for SAeKI, Myungin ENC,
   PetaData, BX Media, LIVELAB, Leader, HM Vision, and Funomad. Uniform transforms and
   `object-fit: contain` preserve each artwork's aspect ratio.
4. A final optical-size pass increased the compact SAeKI, DHAV, LIVELAB, Doohyun Tech,
   and Epic Games marks without enlarging the already-wide wordmarks.

## Responsive verification

| Viewport | Supporting grid | Rows | Wall width | Clipped logos |
| --- | ---: | ---: | ---: | --- |
| 2048px | 6 columns | 3 | 1180px | none |
| 1280px | 6 columns | 3 | 1180px | none |
| 1000px | 3 columns | 6 | 840px | none |
| 780px | 3 columns | 6 | 744px | none |
| 390px | 2 columns | 9 | 354px | none |

- All 24 partner images load successfully.
- `document` and `body` widths match the viewport at every tested size; there is no
  horizontal overflow.
- The logo order remains row-major while resizing, with centered cards and consistent
  row spacing.
- No artwork is stretched, cropped, clipped, or transformed by CSS.
- The computed partner background contains only the radial and dark linear gradients;
  it contains no image URL, and the truss is absent in every final capture.
- Browser console errors, runtime exceptions, and HTTP 4xx/5xx responses: none.

## Static verification

- `npm run check`: passed (JavaScript syntax and all 68 local asset references).
- `git diff --check`: passed.

