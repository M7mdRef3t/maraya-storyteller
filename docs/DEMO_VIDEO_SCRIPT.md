# Demo Video Script (<= 4 minutes)

Target length: **3:45**

## 0:00-0:20 - Hook

Narration:
"What if an AI storyteller behaved like a live creative director instead of a chat box?"

Show:

- Landing screen
- Narrative mode selector (Judge Mode English)
- Emotion buttons + space upload option

## 0:20-0:45 - Problem and value

Narration:
"Most story bots output plain text. Maraya creates a live mixed-media story flow from emotion and environment."

Show:

- One sentence overlay: "Beyond text: Story + Visual + Branching + Live state"

## 0:45-1:45 - Live demo 1 (emotion path)

Actions:

- Set mode to `Judge Mode (English)`
- Pick one emotion
- Show status transition
- Show first scene text blocks appearing
- Enable narration voice toggle and let one line be spoken live
- Show delayed scene image arriving
- Show scene progress indicator (`Scene x/7`)
- Choose a branch and show next scene

Narration points:

- "WebSocket streaming keeps the experience live."
- "Gemini returns structured scene JSON."
- "Image generation arrives asynchronously without blocking narration."

## 1:45-2:35 - Live demo 2 (space image path)

Actions:

- Restart
- Upload room image
- Show space reading output
- Show inferred mood and first generated scene
- Switch to Egyptian mode briefly to prove localized narrative style

Narration points:

- "The story can start from visual grounding, not only typed text."
- "The same engine supports English judging and Arabic audience delivery."

## 2:35-3:05 - Architecture + cloud proof

Show:

- `docs/ARCHITECTURE.md` diagram
- Cloud Run service page (service name and region visible)
- Cloud logs
- Terminal call: `curl -s https://maraya-storyteller-n737gn34oq-ew.a.run.app/health`

Narration:
"The backend runs on Google Cloud Run and is reproducible via Cloud Build and Terraform."

## 3:05-3:30 - Technical credibility

Show:

- `server/services/gemini.js` (schema output + model fallback)
- `server/services/imagen.js` (Imagen and Gemini image fallback)
- `server/prompts/storyteller.js` (output modes)
- `server/cloud-deploy.ps1` and `main.tf`

Narration:
"This uses Google GenAI SDK end-to-end with robust fallback and deployment automation."

## 3:30-3:45 - Closing

Narration:
"Maraya delivers an immersive, context-aware storytelling experience that combines language, vision, and live interaction in one coherent flow."
