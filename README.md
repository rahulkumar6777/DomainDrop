# DomainDrop

DomainDrop is a developer-focused object storage platform for uploading, organizing, and delivering files through a web dashboard, REST API, or Node.js package.

The project started as **Devload**, a small file-upload service. As it grew into a complete storage system with isolated buckets, direct uploads, delivery policies, API keys, and developer tooling, it was renamed to **DomainDrop**.

![DomainDrop object storage](./monolithic/web/src/assets/domaindrop-hero.jpg)

> DomainDrop is under active development. The core storage flow works, but APIs and configuration may still change.

## What DomainDrop does

Every user receives one dedicated MinIO/AIStor bucket. Files inside that bucket are separated into logical **Spaces**, and nested object paths provide familiar folder-like organization without creating folder records in the database.

For example:

```text
Space: production
Path:  products/images/cover.webp
```

The real object is stored under a generated key prefix belonging to that Space. Users work with the Space ID and relative path instead of the internal storage key.

## Features

### Accounts and authentication

- Email OTP registration and verification
- Automatic storage provisioning after verification
- Short-lived JWT access tokens
- Rotating refresh-token sessions stored in Redis
- HttpOnly refresh cookies and session revocation on logout
- Password hashing and account status checks

### Storage and organization

- One isolated object-storage bucket per user
- A default Space created for every account
- Custom Spaces for separating applications or projects
- Nested object paths such as `users/rahul/avatar.webp`
- File metadata stored in MongoDB
- Storage, object-count, and per-file quotas
- Reserved quota while an upload is pending

### Uploads and file delivery

- Direct uploads to object storage using presigned URLs
- Automatic multipart uploads for files larger than 64 MiB
- Signed multipart part URLs and ordered ETag completion
- Expired-upload cleanup with reserved-quota release
- Idempotent file deletion
- Private delivery through expiring signed URLs
- Public delivery through stable CDN URLs

### Bucket controls

- `private` and `public-read` visibility modes
- Visibility applies to the complete user bucket
- Per-bucket CORS configuration
- DomainDrop's dashboard origin remains in every bucket's CORS rules
- Custom origins, methods, headers, exposed headers, and preflight cache duration

### Developer experience

- Scoped API keys that are displayed only once
- API keys stored as SHA-256 hashes rather than raw values
- Redis-backed API-key authentication cache
- One REST API for both JWT and API-key authentication
- Scope checks for files, Spaces, storage, policy, and CORS operations
- Node.js package with automatic single and multipart upload handling
- Developer documentation and examples for Node.js, Java, Go, Python, Rust, and cURL
- React dashboard for files, Spaces, API keys, usage, visibility, and CORS

## How an upload works

1. The client sends a Space ID, object path, MIME type, and file size to the API.
2. The API validates ownership, checks for duplicate paths, and reserves quota.
3. DomainDrop creates a pending file record and returns a signed upload plan.
4. The client uploads the bytes directly to MinIO/AIStor. File bytes do not pass through the API server.
5. Small files use one signed PUT operation. Large files automatically use multipart upload.
6. The client sends the uploaded part ETags to the completion endpoint.
7. The API verifies the final object, marks the file as ready, and moves reserved quota into used quota.

If an upload is abandoned, the cleanup worker later aborts the storage upload, removes the pending record, and releases its reservation.

## Delivery model

Bucket visibility is intentionally simple:

- **Private:** files are delivered through temporary signed URLs.
- **Public read:** every object in the user's bucket can be read through the configured CDN domain.

Spaces do not have separate visibility rules. Changing visibility affects every Space and object inside the bucket.

CORS and visibility solve different problems. CORS controls which browser origins may read responses or upload using JavaScript; it does not make a private object public.

## Technology

| Area | Technology |
| --- | --- |
| Web application | React, React Router, Vite |
| API | Node.js, Express |
| Database | MongoDB, Mongoose |
| Cache and sessions | Redis, ioredis |
| Object storage | MinIO / MinIO AIStor |
| Upload signing | MinIO SDK, AWS SDK for JavaScript |
| Background work | BullMQ, interval-based upload cleanup |
| Email | Nodemailer |
| Security | JWT, bcrypt, Helmet, HPP, scoped API keys |

## Repository layout

```text
DomainDrop/
|-- monolithic/
|   |-- api/                 Express API, workers, and storage services
|   `-- web/                 React website, dashboard, and developer docs
`-- README.md
```

The API is organized by feature. Each module keeps its routes, validators, controllers, and services together.

## Requirements

Before running the project, install or provide:

- Node.js 20 or newer
- MongoDB
- Redis
- An HTTPS MinIO or MinIO AIStor endpoint
- SMTP credentials for registration emails

## Local setup

### 1. Clone the repository

```bash
git clone https://github.com/rahulkumar6777/DomainDrop.git
cd DomainDrop
```

### 2. Configure the API

Install the API dependencies:

```bash
cd monolithic/api
npm install
```

Create `monolithic/api/.env` with the following values:

```env
NODE_ENV=development
PORT=3000
FRONTEND_URI=http://localhost:5173

ADMIN_EMAIL=admin@example.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=replace_with_a_strong_password

MONGODB_URI=mongodb://username:password@localhost:27017/domaindrop?authSource=admin
REDIS_URI=redis://localhost:6379

EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_smtp_user
EMAIL_PASS=your_smtp_password

ACCESS_TOKEN_SECRET=replace_with_a_long_random_secret
ACCESS_TOKEN_EXPIRATION=15m
REFRESH_TOKEN_SECRET=replace_with_another_long_random_secret
REFRESH_TOKEN_EXPIRATION=7d

MINIO_ENDPOINT=storage.example.com
MINIO_PORT=443
MINIO_ACCESS_KEY=your_minio_access_key
MINIO_SECRET_KEY=your_minio_secret_key
MINIO_CDN_URL=https://cdn.example.com
```

`MINIO_ENDPOINT` must contain the host only, without `http://` or `https://`. The current storage clients connect using TLS. `MINIO_CDN_URL` must be a complete public URL.

Start the API:

```bash
npm start
```

The API runs at `http://localhost:3000`, and its health endpoint is available at `GET /health`.

### 3. Configure the web application

Open another terminal:

```bash
cd monolithic/web
npm install
npm run dev
```

Vite serves the web application at `http://localhost:5173` and proxies `/api` requests to `http://localhost:3000` during local development.

When the frontend and API are hosted on different origins, create `monolithic/web/.env`:

```env
VITE_API_URL=https://api.example.com/api
```

## Authentication

Dashboard requests use a bearer access token:

```http
Authorization: Bearer <access-token>
```

Server integrations use an API key:

```http
x-api-key: dd_live_...
```

Send only one credential type per request. API keys are server credentials and must never be included in browser bundles or committed to Git.

Available API-key scopes are:

```text
files:read
files:write
spaces:read
spaces:write
storage:read
policy:write
cors:write
```

## API overview

All versioned routes start with `/api/v1`.

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/auth/register/init` | Start registration and send an OTP |
| `POST` | `/auth/register/verify` | Verify the OTP and provision storage |
| `POST` | `/auth/login` | Create an access and refresh session |
| `GET` | `/auth/refresh-token` | Rotate the session and return an access token |
| `POST` | `/auth/logout` | Revoke the current session |
| `POST` | `/api-keys` | Create a scoped API key |
| `GET` | `/api-keys` | List safe API-key metadata |
| `DELETE` | `/api-keys/:apiKeyId` | Revoke an API key |
| `POST` | `/spaces` | Create a Space |
| `GET` | `/spaces` | List Spaces |
| `GET` | `/spaces/:spaceId` | Get one Space |
| `PATCH` | `/spaces/:spaceId` | Update a custom Space |
| `DELETE` | `/spaces/:spaceId` | Delete an empty custom Space |
| `POST` | `/files/upload-url` | Create a signed upload plan |
| `POST` | `/files/:fileId/parts` | Sign multipart part URLs |
| `POST` | `/files/:fileId/complete` | Complete an upload |
| `GET` | `/files` | List file metadata |
| `GET` | `/files/:fileId` | Get one file record |
| `POST` | `/files/:fileId/signed-url` | Create a private or public delivery URL |
| `DELETE` | `/files/:fileId` | Delete a file |
| `GET` | `/storage` | Read bucket, policy, usage, quota, and CORS state |
| `PATCH` | `/storage/policy` | Change bucket visibility |
| `PUT` | `/storage/cors` | Replace custom bucket CORS rules |

The web application also includes a multi-page developer section at `/developer` with full request and response examples.

## Node.js package

Install the server-side package:

```bash
npm install @domaindrop/node
```

Create a client and upload a file:

```js
import { DomainDrop } from '@domaindrop/node'

const drop = new DomainDrop({
  apiKey: process.env.DOMAIN_DROP_API_KEY,
  // Use this while developing against a local API:
  // baseUrl: 'http://localhost:3000/api/v1',
})

const space = await drop.spaces.getDefault()

const file = await drop.files.upload({
  spaceId: space.id,
  path: 'products/images/cover.webp',
  file: './cover.webp',
  onProgress: ({ percent }) => console.log(`${percent}%`),
})

const delivery = await drop.files.getUrl(file.id)
console.log(delivery.url)
```

The package accepts local file paths, `Buffer`, `Uint8Array`, `ArrayBuffer`, and `Blob`. It selects single or multipart upload automatically.

Available resources:

- `drop.spaces` for listing and managing Spaces
- `drop.files` for listing, uploading, delivering, and deleting files
- `drop.storage` for bucket state, visibility, and CORS
- `drop.request` for authenticated access to routes not yet wrapped by the package

## Security notes

- Raw API keys are returned only when they are created.
- Only hashes and safe prefixes are stored by DomainDrop.
- Signed URLs are temporary bearer URLs. Anyone holding one can use it until it expires.
- Public-read applies to the entire bucket, not one file or one Space.
- CORS is a browser policy and is not a replacement for storage authorization.
- Secrets, `.env` files, and raw API keys should never be committed.

## Current status

DomainDrop is being built in public as a learning and portfolio project. The main account, storage, upload, delivery, API-key, CORS, SDK, and dashboard flows are implemented. Production hardening, monitoring, billing, tests, and operational tooling will continue to evolve.

Issues and focused pull requests are welcome. For larger changes, open an issue first so the design can be discussed before implementation.

---

Built by [Rahul Kumar](https://github.com/rahulkumar6777).
