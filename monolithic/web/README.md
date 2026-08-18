# DomainDrop Web

React and Vite frontend for the DomainDrop marketing site and account
authentication flow.

## Routes

- `/` - product overview
- `/pricing` - plans aligned with the API quota constants
- `/developer` - REST and Node SDK design preview
- `/about` - product story and principles
- `/login` - login with rotating refresh-session support
- `/signup` - registration and six-digit email verification

## Local development

Run the API on port `3000`:

```powershell
cd monolithic/api
npm.cmd run dev
```

Run the web app:

```powershell
cd monolithic/web
npm.cmd run dev
```

Vite proxies `/api` to `http://localhost:3000`. For a deployed API, copy the
shape of `.env.example` and set `VITE_API_URL` to the API's base URL.

## Checks

```powershell
npm.cmd run lint
npm.cmd run build
```

The access token lives in React memory. On reload, the app restores the session
through the rotating HttpOnly refresh-token cookie.
