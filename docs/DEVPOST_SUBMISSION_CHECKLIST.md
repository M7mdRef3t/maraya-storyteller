# Devpost Submission Checklist

Track mandatory and bonus items for Gemini Live Agent Challenge.

## Category and positioning

- [x] Category selected: **Creative Storyteller**
- [x] Positioning statement ready:
  - "Maraya is a live multimodal storytelling director that interleaves narrative text, generated visuals, and branching decisions from emotion or space context."

## Mandatory technical requirements

- [x] Uses a Gemini model.
- [x] Uses Google GenAI SDK (`@google/genai` in `server/services/`).
- [x] Uses Google Cloud service (Cloud Run backend).
- [x] Uses mixed/interleaved multimodal flow (`interleaved_blocks` + streamed scene image updates).
- [x] Backend deployed on Cloud Run:
  - `https://maraya-storyteller-n737gn34oq-ew.a.run.app`
- [x] Final pre-submit secrets audit completed.

## Required submission materials

- [x] Text description final:
  - `docs/DEVPOST_DESCRIPTION_FINAL.md`
- [x] Public code repository.
- [x] README spin-up instructions.
- [x] Architecture diagram:
  - `docs/ARCHITECTURE.md`
- [x] Cloud proof guide and references:
  - `docs/GCP_DEPLOYMENT_PROOF.md`
- [ ] Cloud proof recording captured and uploaded.
- [x] Demo video script:
  - `docs/DEMO_VIDEO_SCRIPT.md`
- [ ] Demo video recorded with real product footage (< 4 min).
- [x] English narration/subtitles finalized.

## Bonus points opportunities

- [x] Automated cloud deployment code present:
  - `main.tf`
  - `server/cloud-deploy.ps1`
  - `server/cloud-deploy.sh`
  - `server/cloudbuild.yaml`
- [x] Publish technical article/video with required challenge disclosure.
- [x] Add social post link with `#GeminiLiveAgentChallenge`.
- [ ] Add GDG public profile link (if available).

## Quality gates before final submit

- [x] End-to-end demo from clean environment.
- [x] Failure path demo (API timeout/network interruption).
- [x] Mobile and desktop smoke test.
- [x] Secret scan before publishing.
- [ ] Final verification of all links in Devpost form.

## Deadline lock (absolute dates)

- Submission closes: **March 16, 2026 at 5:00 PM PT**.
- Equivalent local time: **March 17, 2026 at 2:00 AM GMT+2**.
- Recommended internal freeze: **March 15, 2026 at 11:00 PM GMT+2**.
