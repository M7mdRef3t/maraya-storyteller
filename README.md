# Maraya Storyteller

Maraya is a multimodal AI storytelling agent built for the **Gemini Live Agent Challenge** in the **Creative Storyteller** category.

It turns emotion or space context into a branching cinematic narrative with interleaved text blocks, generated imagery, and adaptive audio mood.

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
- `PORT` (defaults to `3002` in local development and `8080` in production/Cloud Run)
- `LOG_LEVEL` (`info` or `debug`)

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

Health:

- `http://localhost:3002/health`

### 5. Use judge mode

At launch, set **Narrative Mode** to `Judge Mode (English)` for English UI + English story output.

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

### Terraform (IaC)

```bash
terraform init
terraform apply -var="project_id=<YOUR_PROJECT_ID>" -var="region=europe-west1" -var="gemini_api_key=<YOUR_GEMINI_API_KEY>"
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
- `docs/` - Devpost-ready submission assets

## Submission package

- `docs/DEVPOST_DESCRIPTION_FINAL.md`
- `docs/DEVPOST_FORM_READY.md`
- `docs/DEVPOST_SUBMISSION_CHECKLIST.md`
- `docs/ARCHITECTURE.md`
- `docs/GCP_DEPLOYMENT_PROOF.md`
- `docs/DEMO_VIDEO_SCRIPT.md`
