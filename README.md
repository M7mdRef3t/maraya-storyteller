# Maraya Storyteller

Maraya is a multimodal AI storytelling agent built for the **Gemini Live Agent Challenge** in the **Creative Storyteller** category.

It turns emotion or space context into a branching cinematic narrative with interleaved text blocks, generated imagery, and adaptive audio mood.

## Live demo

- Production: `https://maraya-storyteller-880073923613.europe-west1.run.app`
- Judge rail: `https://maraya-storyteller-880073923613.europe-west1.run.app/?judge=1`
- Health: `https://maraya-storyteller-880073923613.europe-west1.run.app/health`

## What makes Maraya different

- Starts from emotion, not a prompt template: the opening question is emotional, not transactional.
- Bends the story live: judges can redirect the narrative inside the scene, not only between scenes.
- Treats storytelling as cinema: generated visuals, adaptive sound, ambient color sync, and motion work as one system.
- Remembers prior journeys: `Mirror Memory` lets the product feel personal across sessions.
- Leaves behind shareable artifacts: reel export, poster cover, and square social cover.

## Judge demo rail

Use the production judge rail for the fastest evaluation path:

1. Open `/?judge=1`
2. Start the guided judge journey
3. Watch the mirror echo after the whisper
4. Trigger a live redirect during the story
5. End on the transformation rail and share artifact

Expected wow moments in under 3 minutes:

- `The mirror understood me`
- `The feeling became a world`
- `The story bent live`
- `The mirror remembered`
- `I can share what I just felt`

## Why this can win

- Breaks the text-box pattern with live scene streaming over WebSocket.
- Uses multimodal input: emotion selection or room image upload.
- Uses mixed output flow: structured narration blocks + generated visuals.
- Adds optional live narration voice output (Web Speech TTS) synced with interleaved story blocks.
- Includes an English-first judge mode and Arabic variants (Fusha + Egyptian colloquial).
- Backend is deployed on Google Cloud Run with automation scripts and Terraform.

## Judge quick start (5 minutes)

### 1. Prerequisites

- Node.js 20+
- npm 10+
- Gemini API key

### 2. Configure environment

From repository root:

```powershell
Copy-Item .env.example server/.env
```

Edit `server/.env`:

```dotenv
GEMINI_API_KEY=YOUR_KEY
GEMINI_TEXT_MODEL=gemini-2.5-flash
```

Optional:

- `IMAGEN_MODEL` (default `imagen-3.0-generate-002`)
- `GEMINI_IMAGE_MODEL` (fallback default `gemini-2.5-flash-image`)
- `GEMINI_REQUEST_TIMEOUT_MS` (default `15000`)
- `GEMINI_MAX_RETRIES` (default `2`)
- `PORT` (defaults to `3002` in local development and `8080` in production/Cloud Run)
- `LOG_LEVEL` (`info` or `debug`)
- `PERSISTENCE_BACKEND` (`auto`, `firestore`, or `file`)
- `DUO_RECONNECT_GRACE_MS` (default `60000`)
- `ENABLE_PAEF` (`true` by default; set `false` to disable Firestore-backed PAEF explicitly)

Local PAEF note:

- In local development, `PAEF` auto-disables if neither `GOOGLE_APPLICATION_CREDENTIALS` nor `FIRESTORE_EMULATOR_HOST` is set.
- This keeps the WebSocket story flow and local tests working even without Firestore credentials.
- To enable local Firestore-backed PAEF, run `gcloud auth application-default login` or configure `FIRESTORE_EMULATOR_HOST`.

### 3. Install dependencies

```powershell
cd server; npm install
cd ../client; npm install
```

### 4. Run locally (two terminals)

Terminal A:

```powershell
cd server
npm run dev
```

Terminal B:

```powershell
cd client
npm run dev
```

Open:

- `http://localhost:5180`
- `http://localhost:5180/?design-system=1` for the visual design system preview

Health:

- `http://localhost:3002/health`

Observability:

- In production builds, client Web Vitals automatically post to `/telemetry/client`.
- `/health` now returns JSON with Gemini timeout/retry settings plus active persistence backend information.

### 5. Use judge mode

At launch, set **Narrative Mode** to `Judge Mode (English)` for English UI + English story output.

Direct shortcut:

```text
http://localhost:5180/?judge=1
```

## Deployment

### Cloud Run (scripted, recommended)

Windows:

```powershell
.\server\cloud-deploy.ps1 -ProjectId "<YOUR_PROJECT_ID>" -Region "europe-west1" -ServiceName "maraya-storyteller" -GeminiApiKey "<YOUR_GEMINI_API_KEY>"
```

Linux/macOS:

```bash
PROJECT_ID=<YOUR_PROJECT_ID> REGION=europe-west1 SERVICE_NAME=maraya-storyteller GEMINI_API_KEY=<YOUR_GEMINI_API_KEY> ./server/cloud-deploy.sh
```

Notes:

- Run both commands from the repository root.
- The scripts build from the repo root so the multi-stage Docker build can package both `client/` and `server/`.
- `server/cloudbuild.yaml` expects a Secret Manager secret named `GEMINI_API_KEY`. Use the scripts above if you want a direct one-command deploy without pre-creating that secret.
- The deploy scripts now also pass `GEMINI_REQUEST_TIMEOUT_MS`, `GEMINI_MAX_RETRIES`, `PERSISTENCE_BACKEND`, and `DUO_RECONNECT_GRACE_MS` to Cloud Run.

### Terraform (IaC)

```bash
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform apply -var-file="terraform.tfvars"
```

Edit `terraform.tfvars` before applying:

```hcl
project_id        = "<YOUR_PROJECT_ID>"
region            = "europe-west1"
service_name      = "maraya-storyteller"
gemini_api_key    = "<YOUR_GEMINI_API_KEY>"
gemini_text_model = "gemini-2.5-flash"
log_level         = "info"
```

Current deployed health endpoint:

- `https://maraya-storyteller-n737gn34oq-ew.a.run.app/health`

## Tech stack

- Frontend: React + Vite
- Backend: Node.js + Express + WebSocket (`ws`)
- AI SDK: `@google/genai`
- Text generation: Gemini (`gemini-2.5-flash` with fallback support)
- Image generation: Imagen + Gemini image fallback
- Cloud: Cloud Run, Cloud Build, Terraform

## Repository map

- `client/` - frontend UI and live scene renderer
- `server/` - orchestration, prompts, model services, WebSocket server
- `main.tf` - Terraform provisioning for Google Cloud
- `terraform.tfvars.example` - editable Terraform input template
- `docs/` - Devpost-ready submission assets

## Submission package

- `docs/DEVPOST_DESCRIPTION_FINAL.md`
- `docs/DEVPOST_FORM_READY.md`
- `docs/DEVPOST_SUBMISSION_CHECKLIST.md`
- `docs/ARCHITECTURE.md`
- `docs/GCP_DEPLOYMENT_PROOF.md`
- `docs/DEMO_VIDEO_SCRIPT.md`

## Design Ops Handoff

- `docs/design-system/10-brand-identity-book.md`
- `docs/design-system/11-ux-design-spec.md`
- `docs/design-system/12-figma-spec.md`
- `docs/design-system/12-ux-implementation-checklist.md`
- `docs/design-system/13-ux-gap-report.md`
- `docs/design-system/14-design-qa-report.md`
- `docs/design-system/14-design-trends-2026.md`
- `docs/design-system/15-implementation-priority.md`
- `docs/design-system/16-execution-roadmap-2026.md`
