# Studio V Private Media Delivery Plan

Updated: 2026-08-20 KST

## Purpose

This is the phase-2 design for replacing publicly shared Google Drive previews and the current public R2 hero object with revocable, short-lived Cloudflare media access.

It is not DRM. Any viewer who can play a video can still record the screen or save received bytes. The goal is to stop permanent public URLs, reduce casual redistribution, and let the owner revoke future access quickly.

## Current Temporary Model

- Showreel playback uses 13 website-only copies in Google Drive folder:
  `[VP LAB] Studio V 홈페이지 공개영상`
- Folder ID: `1JVXTeoW27UihVQjzEktdy7VS29qVIqRX`
- Public state is controlled only at folder level.
- Public permission must be `anyone / reader`; never `writer`.
- Removing the folder's `anyoneWithLink` permission blocks future unauthenticated Drive previews.
- Source files and their existing permissions are not managed by this folder.
- The Studio and Showreel hero still use the public R2 URL and are outside the Drive toggle.

## Target Architecture

1. Store web-ready transcodes in a private R2 bucket or private prefix.
2. Keep source masters outside the delivery bucket.
3. Serve media through a Cloudflare Worker endpoint such as `/media/:key`.
4. The Worker validates a short-lived signed token or an authorized session before reading R2.
5. The Worker supports `GET`, `HEAD`, and byte `Range` requests so browser seeking works.
6. The static site never contains an R2 access key, signing secret, or permanent object URL.
7. Signed playback URLs should expire in about 10–15 minutes and be refreshed only while the site is allowed to serve media.
8. CORS should allow only the Studio V production origin and approved preview origins.

## Recommended Control Modes

### Published

- The site requests a short-lived playback URL from the Worker.
- The Worker returns a URL or streams the object after signature validation.
- R2 objects remain private.

### Paused

- A Worker-side allowlist or global media switch returns `403` for protected keys.
- The site shows `영상 공개가 일시 중지되었습니다` instead of a broken player.
- Existing signed URLs naturally expire within their short TTL.

### Emergency Revocation

- Disable the affected object key or global media switch.
- Rotate the signing secret if token leakage is suspected.
- Purge only the relevant cache keys.

## Security Requirements

- Never commit Cloudflare API tokens, R2 credentials, or HMAC secrets.
- Put secrets in Worker secrets / Hermes runtime secrets only.
- Use least privilege. No DNS edit permission is required for the first implementation.
- Suggested Cloudflare token capabilities: Account Read, Workers Scripts Edit, R2 Storage Edit, and Pages Edit only if Pages settings must change.
- Do not use long-lived signed query strings embedded in `showreel.js`.
- Log object key, result, and timestamp without recording user credentials or full signed URLs.

## Migration Order

1. Restore Cloudflare authentication in the Hermes runtime.
2. Create a private R2 prefix for web-ready media.
3. Transcode oversized MOV/MP4 masters to approved web copies before upload.
4. Upload one test video and implement Range-capable Worker delivery.
5. Verify desktop/mobile playback, seeking, CORS, expiration, and paused mode.
6. Migrate Showreel items in small batches with rollback to the controlled Drive copies.
7. Move the public R2 hero to the same protected model only after autoplay behavior is verified.
8. Move the 3D Tour LED test video separately; Three.js video textures need reliable direct media responses and CORS.

## Verification Checklist

- Private R2 object cannot be fetched directly.
- Valid signed playback succeeds.
- Expired or altered signature returns `403`.
- Range requests return `206` with correct headers.
- Desktop and mobile can seek without re-downloading the full file.
- Paused mode blocks every protected key.
- No secret appears in Git, built HTML, browser source, logs, or documentation.
- Revocation does not require deleting or moving source files.
