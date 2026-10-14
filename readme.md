# DAMCF Realty Frontend

Static SPA (plain HTML + ES modules + Tailwind CDN) that consumes the
DAMCF Realty API at `/damcf/api/v1/`.

## Local Development

### Option A — Python's built-in server (simplest)

From this folder:

\`\`\`bash
python -m http.server 5173
\`\`\`

Open http://localhost:5173/

The frontend automatically hits `http://127.0.0.1:8000/damcf/api/v1` when
running on `localhost`.

### Option B — Served by Django

Copy this folder into your Django project's `static/` directory and access it at
`http://127.0.0.1:8000/static/damcf/index.html`.

## Configuration

Edit `config.js` to change the API base URL. Currently auto-detects:

- `localhost` → `http://127.0.0.1:8000/damcf/api/v1`
- anywhere else → `https://digitallife11.pythonanywhere.com/damcf/api/v1`

## Deploying to GitHub Pages

1. Push this folder to a GitHub repository.
2. Go to **Settings → Pages** → source = `main` branch, root `/`.
3. Wait ~1 minute.
4. Visit `https://<your-username>.github.io/<repo-name>/`.

The frontend will automatically use the production API URL.

## Backend CORS

The Django backend must allow your GitHub Pages origin. In `settings.py`:

\`\`\`python
CORS_ALLOWED_ORIGIN_REGEXES = [r"^https://[\w-]+\.github\.io$"]
\`\`\`

(Already included in the Batch 1 settings I provided.)