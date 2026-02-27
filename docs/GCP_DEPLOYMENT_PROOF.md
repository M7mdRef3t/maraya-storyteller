# Google Cloud Deployment Proof Guide

Use this as the required **separate cloud proof recording** for Devpost.

## Goal

Show that the backend is deployed and running on Google Cloud Run, not local-only.

## Option A (recommended): 60-90 second recording

Record these exact steps:

1. Open Google Cloud Console -> Cloud Run.
2. Open service: `maraya-storyteller`.
3. Show:
   - service URL
   - region
   - latest revision
4. Open Logs tab and show recent request entries.
5. Open terminal and run:

```bash
curl -s https://maraya-storyteller-n737gn34oq-ew.a.run.app/health
```

6. Show `OK` response.

This is enough to satisfy "proof of backend running on Google Cloud."

## Option B: repository proof links (backup)

If recording is not possible, include direct repository links to:

- `server/cloud-deploy.ps1`
- `server/cloud-deploy.sh`
- `server/cloudbuild.yaml`
- `server/cloudbuild-buildonly.yaml`
- `main.tf`

Suggested sentence for Devpost:

"The backend is deployed on Google Cloud Run with automated Cloud Build and Terraform workflows included in the repository."

## Recording safety checklist

- Hide secrets and API keys before recording.
- Keep service URL and logs clearly readable.
- Do not merge this clip into the product demo; upload separately.
