# Devpost Submission Text (Final)

## Project summary

Maraya is a multimodal storytelling agent that transforms human emotion and space context into a live cinematic narrative experience. Instead of chat-only output, it streams structured scenes with interleaved narration, visual direction, reflection beats, generated images, and branching choices.

This project was built for the Gemini Live Agent Challenge in the **Creative Storyteller** category.

## The problem

Most AI story tools still behave like text chat. They lack atmosphere, visual continuity, and real-time narrative flow. They also ignore the user's physical context and emotional framing.

## Our solution

Maraya acts like a creative director:

- Accepts multimodal input:
  - emotion selection
  - optional room/space image upload
- Generates a structured scene graph using Gemini with schema-constrained output.
- Streams each scene live over WebSocket with ordered interleaved blocks:
  - `narration`
  - `visual`
  - `reflection`
- Generates cinematic scene images and updates them asynchronously.
- Provides optional live narration voice output, synchronized with block progression.
- Supports branching decisions with emotion shifts and scene progress tracking.

## Why this is beyond text

- Live, stateful scene streaming instead of static turn-based chat.
- Story + visual output in one coherent flow.
- Voice + text + image are combined in the same narrative session.
- Context-aware narrative initialization from image-based space analysis.
- English-first judge mode plus Arabic Fusha and Egyptian colloquial modes.

## Technical implementation

- Frontend: React + Vite
- Backend: Node.js + Express + WebSocket (`ws`)
- AI SDK: Google GenAI SDK (`@google/genai`)
- Models:
  - Gemini text (`gemini-2.5-flash`, with fallback handling)
  - Imagen image generation (`imagen-3.0-generate-002` and fallback strategies)
- Cloud:
  - Google Cloud Run (backend hosting)
  - Google Cloud Build (container build/deploy)
  - Terraform (infrastructure as code)

## Data sources

- User-provided data only:
  - selected emotion
  - uploaded image (optional)
- No third-party personal datasets.

## Google Cloud deployment proof

- Live backend URL:
  - `https://maraya-storyteller-n737gn34oq-ew.a.run.app`
- Health endpoint:
  - `https://maraya-storyteller-n737gn34oq-ew.a.run.app/health`
- Deployment and IaC files:
  - `server/cloud-deploy.ps1`
  - `server/cloud-deploy.sh`
  - `server/cloudbuild.yaml`
  - `server/cloudbuild-buildonly.yaml`
  - `main.tf`

## Findings and learnings

- Schema-constrained generation improves scene consistency and reduces malformed outputs.
- Decoupling scene text streaming from image generation improves perceived responsiveness.
- Output mode control (judge English vs Arabic variants) is critical for both evaluation and local audience quality.
- Reliable cloud reproducibility improves judge confidence as much as UX polish.

## What we would improve next

- Native audio voiceover generation synchronized with scene timing.
- Persistent story memory and user profile personalization.
- Automated narrative quality evaluation (coherence, safety, branch quality).
