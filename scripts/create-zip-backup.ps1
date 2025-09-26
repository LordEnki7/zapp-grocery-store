param(
    [string]$Type = "source",
    [string]$Milestone = "",
    [switch]$Help
)

if ($Help) {
    Write-Host @"
ZAPP E-commerce ZIP Backup Script
================================

Usage: .\create-zip-backup.ps1 [options]

Options:
  -Type <string>      Backup type: 'source' (default) or 'full'
  -Milestone <string> Optional milestone name for special backups
  -Help              Show this help message

Examples:
  .\create-zip-backup.ps1                           # Standard source backup
  .\create-zip-backup.ps1 -Type "full"             # Full project backup
  .\create-zip-backup.ps1 -Milestone "auth-fix"    # Milestone backup
  .\create-zip-backup.ps1 -Type "full" -Milestone "v1.0"  # Full milestone backup

Backup Types:
  source: Source code only (~5-15 MB) - excludes node_modules, images, build files
  full:   Complete project (~50-200 MB) - includes all assets except node_modules

"@
    exit 0
}

# Generate timestamp and filename
$timestamp = Get-Date -Format 'yyyy-MM-dd-HHmm'
$baseName = "zapp-ecommerce"

if ($Milestone) {
    $fileName = "$baseName-milestone-$Milestone-$timestamp.zip"
    Write-Host "Creating milestone backup: $Milestone" -ForegroundColor Green
} else {
    $fileName = "$baseName-$Type-$timestamp.zip"
    Write-Host "Creating $Type backup..." -ForegroundColor Green
}

# Define exclusion patterns based on backup type
switch ($Type.ToLower()) {
    "source" {
        Write-Host "Backup type: Source code only" -ForegroundColor Yellow
        $exclude = @(
            'node_modules',
            'sitephoto', 
            '\.git',
            'backups',
            'dist',
            'build',
            'coverage',
            '\.env',
            '\.env\.local',
            '\.env\.production',
            '\.log$'
        )
        $expectedSizeMB = "5-15"
    }
    "full" {
        Write-Host "Backup type: Full project" -ForegroundColor Yellow
        $exclude = @(
            'node_modules',
            '\.git',
            'backups',
            'dist',
            'build',
            'coverage',
            '\.env',
            '\.env\.local',
            '\.env\.production',
            '\.log$'
        )
        $expectedSizeMB = "50-200"
    }
    default {
        Write-Host "Error: Invalid backup type '$Type'. Use 'source' or 'full'." -ForegroundColor Red
        exit 1
    }
}

Write-Host "Excluding: $($exclude -join ', ')" -ForegroundColor Gray
Write-Host "Expected size: $expectedSizeMB MB" -ForegroundColor Gray

try {
    # Create the backup
    Write-Host "Compressing files..." -ForegroundColor Yellow
    
    $excludePattern = $exclude -join '|'
    Get-ChildItem -Path "." -Recurse | 
        Where-Object { $_.FullName -notmatch $excludePattern } | 
        Compress-Archive -DestinationPath $fileName -Force
    
    # Verify and display results
    if (Test-Path $fileName) {
        Write-Host "✅ Backup created successfully!" -ForegroundColor Green
        
        $fileInfo = Get-Item $fileName
        $sizeMB = [math]::Round($fileInfo.Length / 1MB, 2)
        
        Write-Host "`nBackup Details:" -ForegroundColor Cyan
        Write-Host "  File: $fileName" -ForegroundColor White
        Write-Host "  Size: $sizeMB MB" -ForegroundColor White
        Write-Host "  Created: $($fileInfo.CreationTime)" -ForegroundColor White
        
        # Size validation
        switch ($Type.ToLower()) {
            "source" {
                if ($sizeMB -gt 50) {
                    Write-Host "⚠️  Warning: Source backup is larger than expected ($sizeMB MB). Consider excluding more files." -ForegroundColor Yellow
                }
            }
            "full" {
                if ($sizeMB -gt 500) {
                    Write-Host "⚠️  Warning: Full backup is very large ($sizeMB MB). This may be difficult to share or store." -ForegroundColor Yellow
                }
            }
        }
        
        # Show recent backups
        Write-Host "`nRecent Backups:" -ForegroundColor Cyan
        Get-ChildItem "zapp-ecommerce-*.zip" | 
            Sort-Object CreationTime -Descending | 
            Select-Object -First 5 | 
            Select-Object Name, @{Name="Size(MB)";Expression={[math]::Round($_.Length/1MB,2)}}, CreationTime |
            Format-Table -AutoSize
            
    } else {
        Write-Host "❌ Error: Backup file was not created." -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "❌ Error creating backup: $($_.Exception.Message)" -ForegroundColor Red
    
    # Common troubleshooting suggestions
    Write-Host "`nTroubleshooting:" -ForegroundColor Yellow
    Write-Host "  • Try using 'source' backup type instead of 'full'" -ForegroundColor Gray
    Write-Host "  • Ensure you have write permissions in the current directory" -ForegroundColor Gray
    Write-Host "  • Check available disk space" -ForegroundColor Gray
    Write-Host "  • Close any applications that might be using project files" -ForegroundColor Gray
    
    exit 1
}

# Cleanup suggestion
$allBackups = Get-ChildItem "zapp-ecommerce-*.zip" | Sort-Object CreationTime -Descending
if ($allBackups.Count -gt 10) {
    Write-Host "`n💡 Tip: You have $($allBackups.Count) backup files. Consider cleaning up old backups:" -ForegroundColor Blue
    Write-Host "   Remove-Item 'zapp-ecommerce-*.zip' | Where-Object { `$_.CreationTime -lt (Get-Date).AddDays(-30) }" -ForegroundColor Gray
}

Write-Host "`n🎉 Backup process completed!" -ForegroundColor Green