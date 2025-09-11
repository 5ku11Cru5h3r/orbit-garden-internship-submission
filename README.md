# Orbit Garden Healthcare MERN App

A full-stack app where patients upload dental images and admins annotate them and generate PDF reports. Optional AWS S3 storage.

## Features
- Auth with HTTP-only cookies, roles: patient, admin
- Patient: upload image with details; view their submissions and report links
- Admin: list all, annotate (rect/circle/arrow/freehand), save, generate PDF
- PDF includes patient details, uploaded date/time, notes, and links to images
- Storage: Local filesystem by default (uploads/, reports/) or AWS S3

## Tech
- Frontend: React + Vite + Tailwind
- Backend: Node + Express + Mongoose
- PDF: pdfkit
- Uploads: multer

## Getting Started

1. Install deps

```bash
pnpm install
```

2. Create .env in project root

```
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=super-secure-random-string
# Optional S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=your-bucket-name
```

3. Run dev

```bash
pnpm dev
```

The app runs on the provided Builder port. API routes are mounted under the same origin.

## API Overview
- POST /auth/register
- POST /auth/login
- POST /auth/logout
- GET /api/me
- POST /api/submissions (patient, multipart: image, name, patientId, email, note)
- GET /api/submissions/mine (patient)
- GET /api/submissions (admin)
- GET /api/submissions/:id (admin or owner)
- POST /api/submissions/:id/annotate (admin, multipart: annotatedImage, annotationJson)
- POST /api/submissions/:id/report (admin)

## Notes
- If MONGODB_URI is not set, API will log a warning; DB operations will fail. Configure MongoDB for full functionality.
- In local mode, uploaded files are saved under /uploads and reports under /reports and are served statically.
- For S3, objects are uploaded public-read and links are embedded in PDFs.
