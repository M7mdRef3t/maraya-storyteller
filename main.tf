terraform {
  required_version = ">= 1.5.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 6.0.0"
    }
  }
}

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

variable "service_name" {
  description = "Cloud Run service name"
  type        = string
  default     = "maraya-storyteller"
}

variable "gemini_api_key" {
  description = "The Gemini API Key"
  type        = string
  sensitive   = true
}

variable "gemini_text_model" {
  description = "Gemini text model used by the storytelling backend"
  type        = string
  default     = "gemini-2.5-flash"
}

variable "log_level" {
  description = "Application log level"
  type        = string
  default     = "info"
}

# ------------------------------------------------------------------------------
# ENABLE REQUIRED GOOGLE CLOUD APIS
# ------------------------------------------------------------------------------
resource "google_project_service" "cloudrun_api" {
  service            = "run.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "cloudbuild_api" {
  service            = "cloudbuild.googleapis.com"
  disable_on_destroy = false
}

# ------------------------------------------------------------------------------
# CLOUD RUN SERVICE
# ------------------------------------------------------------------------------
resource "google_cloud_run_service" "maraya_service" {
  name     = var.service_name
  location = var.region
  depends_on = [
    google_project_service.cloudrun_api,
    google_project_service.cloudbuild_api,
  ]

  template {
    metadata {
      annotations = {
        "run.googleapis.com/sessionAffinity" = "true"
      }
    }
    spec {
      timeout_seconds = 900
      containers {
        image = "gcr.io/${var.project_id}/${var.service_name}"

        env {
          name  = "GEMINI_API_KEY"
          value = var.gemini_api_key
        }
        env {
          name  = "GEMINI_TEXT_MODEL"
          value = var.gemini_text_model
        }
        env {
          name  = "LOG_LEVEL"
          value = var.log_level
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

output "service_name" {
  value = google_cloud_run_service.maraya_service.name
}
