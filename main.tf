provider "google" {
  project = var.project_id
  region  = var.region
}

variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region"
  type        = string
  default     = "europe-west1"
}

variable "gemini_api_key" {
  description = "The Gemini API Key"
  type        = string
  sensitive   = true
}

# ------------------------------------------------------------------------------
# ENABLE REQUIRED GOOGLE CLOUD APIS
# ------------------------------------------------------------------------------
resource "google_project_service" "cloudrun_api" {
  service            = "run.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "vertexai_api" {
  service            = "aiplatform.googleapis.com"
  disable_on_destroy = false
}

# ------------------------------------------------------------------------------
# CLOUD RUN SERVICE
# ------------------------------------------------------------------------------
resource "google_cloud_run_service" "maraya_service" {
  name     = "maraya-storyteller"
  location = var.region
  depends_on = [google_project_service.cloudrun_api]

  template {
    metadata {
      annotations = {
        "run.googleapis.com/sessionAffinity" = "true"
      }
    }
    spec {
      timeout_seconds = 900
      containers {
        image = "gcr.io/${var.project_id}/maraya-storyteller"

        env {
          name  = "GEMINI_API_KEY"
          value = var.gemini_api_key
        }
        env {
          name  = "LOG_LEVEL"
          value = "info"
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

resource "google_cloud_run_service_iam_member" "public_access" {
  service  = google_cloud_run_service.maraya_service.name
  location = google_cloud_run_service.maraya_service.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

output "service_url" {
  value = google_cloud_run_service.maraya_service.status[0].url
}
