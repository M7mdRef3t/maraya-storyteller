param(
  [string]$ProjectId = "",
  [string]$ServiceName = "maraya-storyteller",
  [string]$Region = "europe-west1",
  [string]$GeminiApiKey = "",
  [string]$GeminiTextModel = "gemini-2.5-flash"
)

$ErrorActionPreference = "Stop"

function Resolve-Gcloud {
  if (Get-Command gcloud -ErrorAction SilentlyContinue) {
    return "gcloud"
  }

  $localPath = Join-Path $env:LOCALAPPDATA "Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"
  if (Test-Path $localPath) {
    return $localPath
  }

  throw "gcloud CLI not found. Install Google Cloud SDK first."
}

function Invoke-Gcloud {
  param(
    [string]$Bin,
    [string[]]$GcloudArgs
  )
  & $Bin @GcloudArgs
  if ($LASTEXITCODE -ne 0) {
    throw "gcloud command failed: gcloud $($GcloudArgs -join ' ')"
  }
}

$gcloud = Resolve-Gcloud

if ([string]::IsNullOrWhiteSpace($ProjectId)) {
  $ProjectId = (Invoke-Gcloud -Bin $gcloud -GcloudArgs @("config", "get-value", "project")).Trim()
}

if ([string]::IsNullOrWhiteSpace($ProjectId) -or $ProjectId -eq "(unset)") {
  throw "Project ID is empty. Pass -ProjectId or run: gcloud config set project <PROJECT_ID>"
}

if ([string]::IsNullOrWhiteSpace($GeminiApiKey)) {
  $GeminiApiKey = $env:GEMINI_API_KEY
}

if ([string]::IsNullOrWhiteSpace($GeminiApiKey)) {
  throw "GEMINI_API_KEY is required. Set env var or pass -GeminiApiKey."
}

$activeAccountRaw = Invoke-Gcloud -Bin $gcloud -GcloudArgs @("auth", "list", "--format=value(account)")
$activeAccount = if ($null -eq $activeAccountRaw) { "" } else { ($activeAccountRaw | Select-Object -First 1).ToString().Trim() }
if ([string]::IsNullOrWhiteSpace($activeAccount)) {
  throw "No active gcloud account. Run: gcloud auth login"
}

Write-Host "Deploying to Cloud Run"
Write-Host "  Project: $ProjectId"
Write-Host "  Region:  $Region"
Write-Host "  Service: $ServiceName"

Invoke-Gcloud -Bin $gcloud -GcloudArgs @("config", "set", "project", $ProjectId) | Out-Null

Write-Host "Enabling required APIs..."
Invoke-Gcloud -Bin $gcloud -GcloudArgs @("services", "enable", "run.googleapis.com", "cloudbuild.googleapis.com", "artifactregistry.googleapis.com", "aiplatform.googleapis.com")

$repoRoot = Split-Path -Parent $PSScriptRoot
$image = "gcr.io/$ProjectId/$ServiceName"

Write-Host "Submitting build..."
Push-Location $repoRoot
try {
  Invoke-Gcloud -Bin $gcloud -GcloudArgs @("builds", "submit", "--config", "server/cloudbuild-buildonly.yaml", ".")
}
finally {
  Pop-Location
}

Write-Host "Deploying service..."
Invoke-Gcloud -Bin $gcloud -GcloudArgs @(
  "run", "deploy", $ServiceName,
  "--image", $image,
  "--platform", "managed",
  "--region", $Region,
  "--allow-unauthenticated",
  "--set-env-vars", "GEMINI_API_KEY=$GeminiApiKey,GEMINI_TEXT_MODEL=$GeminiTextModel",
  "--timeout", "900",
  "--session-affinity"
)

$serviceUrl = (Invoke-Gcloud -Bin $gcloud -GcloudArgs @("run", "services", "describe", $ServiceName, "--platform", "managed", "--region", $Region, "--format=value(status.url)")).Trim()

Write-Host "Deployment complete"
Write-Host "SERVICE_URL=$serviceUrl"
Write-Host "HEALTH_CHECK=$serviceUrl/health"
