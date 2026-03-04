# Google Cloud Platform Integration Proof (Maraya PAEF)

This document serves as proof of our usage of Google Cloud Platform (GCP) services for the Gemini Live Agent Challenge, specifically detailing the integration of the Progressive Awareness Expansion Framework (PAEF) with Firestore.

## Components & Roles
- **Service Account (Cloud Run):** The application runs on Cloud Run, utilizing its default Compute Engine Service Account. This service account requires the `roles/datastore.user` IAM role to write to the database.
- **Collection Name:** `paef_sessions`
- **File Location:** The Firestore initialization and read/write logic is located entirely within `server/services/paef.js`.

## How to Reproduce Locally
1. Ensure you have the Google Cloud CLI installed.
2. Run `gcloud auth application-default login` to generate local Application Default Credentials (ADC) for an account with Firestore permissions on the target GCP project.
3. Start the server locally using `npm run dev` in the `server` directory.
4. Open the client (`http://localhost:5180/`). The moment a WebSocket connection is established, the backend extracts the `sessionId` and uses ADC to interact with Firestore.

## Logging & Verification
When the session document is successfully created in GCP, you will see the following line in the server execution logs:
`[paef] PAEF Firestore write ok: Created doc anonymous_<sessionId>`

*Please refer to the accompanying screenshots of the GCP Console showing the `paef_sessions` collection populated with documents containing `FieldValue.serverTimestamp()` fields.*
