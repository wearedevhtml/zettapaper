# Deploy To Cloudflare Pages

This project is static and can be deployed directly to Cloudflare Pages.

## Option 1: Cloudflare Dashboard (Git-connected)

1. Push this repo to GitHub.
2. In Cloudflare Dashboard, go to `Workers & Pages` -> `Create` -> `Pages` -> `Connect to Git`.
3. Select this repository.
4. Build settings:
   - Framework preset: `None`
   - Build command: *(leave empty)*
   - Build output directory: `.`
5. Click `Save and Deploy`.

## Option 2: Wrangler CLI

1. Install Wrangler:
   - `npm install -g wrangler`
2. Login:
   - `wrangler login`
3. Deploy:
   - `wrangler pages deploy . --project-name zettapapers`

`wrangler.toml` is already included with `pages_build_output_dir = "."`.

## Notes

- `_headers` is included for cache/security headers.
- `_redirects` is included for clean URLs (`/gallery`, `/category`, etc.).
- Legacy PHP count endpoints (`like.php`, `download_count.php`) now gracefully fall back to local browser storage on static hosting, so the UI and downloads keep working on Pages.

