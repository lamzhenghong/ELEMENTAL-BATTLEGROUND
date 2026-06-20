# Project Rules

## Auto-deploy to GitHub

After making any code changes, **always** commit and push to GitHub so that Vercel auto-deploys:

1. Stage all changes: `& "C:\Program Files\Git\cmd\git.exe" add -A`
2. Commit with a descriptive message: `& "C:\Program Files\Git\cmd\git.exe" commit -m "<type>: <description>"`
3. Push to origin: `& "C:\Program Files\Git\cmd\git.exe" push origin main`

Use conventional commit prefixes: `fix:`, `feat:`, `style:`, `refactor:`, `chore:`, etc.
