# Maraya Auto-Sync Script
# This script monitors for file changes and automatically pushes to GitHub.

$targetDir = "c:\Users\ty\Downloads\maraya-storyteller"
Set-Location $targetDir

Write-Host "Maraya Auto-Sync is ACTIVE." 
Write-Host "Watching for changes in: $targetDir"
Write-Host "Press Ctrl+C to stop."

while ($true) {
    # Check if there are any changes (modified, deleted, or new files)
    $status = git status --porcelain
    
    if ($status) {
        Write-Host "Changes detected at $(Get-Date -Format 'HH:mm:ss')"
        
        # Add all changes
        git add .
        
        # Commit with a generic auto-sync message
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        git commit -m "auto-sync: updates at $timestamp"
        
        # Push to origin main
        Write-Host "Pushing to GitHub..."
        git push origin main
        
        Write-Host "Sync complete."
    }
    
    # Wait for 10 seconds before checking again to avoid CPU spike
    Start-Sleep -Seconds 10
}
