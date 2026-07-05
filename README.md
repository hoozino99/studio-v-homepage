# Studio V Homepage

Static Studio V homepage prepared for Cloudflare Pages.

## Local Preview

Serve the repository root as static files:

```sh
python3 -m http.server 4178
```

Then open:

```text
http://127.0.0.1:4178/
```

## Checks

Run the static deployment check before committing:

```sh
npm run check
```

The check validates JavaScript syntax and confirms local HTML/asset references used by the static site.

## Cloudflare Pages

Create the Pages project from the GitHub repository:

- Project name: `studio-v-homepage`
- Production branch: `main`
- Framework preset: `None` or `Static HTML`
- Build command: leave empty
- Build output directory: `/` or `.`

The repository also includes `wrangler.toml` with:

```toml
name = "studio-v-homepage"
compatibility_date = "2026-07-05"
pages_build_output_dir = "."
```

## Media Notes

Large source videos are intentionally excluded from git under `assets/video/source/`.
Use the web-ready assets in `assets/video/` and `assets/videos/` for deployment.
