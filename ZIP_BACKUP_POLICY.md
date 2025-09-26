# ZIP File Backup Policy & Procedures

## Overview
This document establishes standardized procedures for creating efficient ZIP file backups of the ZAPP e-commerce project, based on successful implementation and lessons learned.

## Backup Strategy

### 1. Two-Tier Backup Approach

#### Tier 1: Source Code Backup (Recommended)
- **Purpose**: Lightweight backup for development and distribution
- **Size**: ~5-15 MB (manageable for sharing and storage)
- **Use Cases**: Code reviews, sharing with developers, version control

#### Tier 2: Full Project Backup (Optional)
- **Purpose**: Complete project archive including all assets
- **Size**: 100+ MB (includes all images and dependencies)
- **Use Cases**: Complete project migration, disaster recovery

## Standard ZIP Creation Commands

### Source Code Backup (Recommended)
```powershell
# Exclude large directories to keep file size manageable
$exclude = @('node_modules', 'sitephoto', '.git', 'backups', 'dist', 'build')
Get-ChildItem -Path "." -Recurse | Where-Object { $_.FullName -notmatch ($exclude -join '|') } | Compress-Archive -DestinationPath "zapp-ecommerce-source-$(Get-Date -Format 'yyyy-MM-dd-HHmm').zip" -Force
```

### Full Project Backup (When Needed)
```powershell
# For complete project backup (use with caution due to size)
Compress-Archive -Path @('src', 'public', 'package.json', 'package-lock.json', 'vite.config.ts', 'tailwind.config.js', 'tsconfig.json', 'index.html', 'README.md', 'docs', 'scripts') -DestinationPath "zapp-ecommerce-full-$(Get-Date -Format 'yyyy-MM-dd-HHmm').zip" -Force
```

## Naming Convention

### Standard Format
```
zapp-ecommerce-[type]-[date]-[time].zip
```

### Examples
- `zapp-ecommerce-source-2025-09-19-1024.zip` (Source code only)
- `zapp-ecommerce-full-2025-09-19-1024.zip` (Complete project)
- `zapp-ecommerce-milestone-auth-complete-2025-09-19-1024.zip` (Milestone backup)

### Type Indicators
- `source`: Source code only (excludes node_modules, images, build files)
- `full`: Complete project including all assets
- `milestone-[name]`: Feature milestone backup
- `release-[version]`: Release version backup

## What to Exclude (Standard Exclusions)

### Always Exclude
- `node_modules/` - Dependencies (can be restored with npm install)
- `.git/` - Version control history (use git for version control)
- `dist/` or `build/` - Build artifacts (can be regenerated)
- `backups/` - Previous backups (avoid recursive backups)

### Conditionally Exclude
- `sitephoto/` - Large image assets (exclude for source backups, include for full backups)
- `.env` files - Environment variables (security risk)
- `*.log` - Log files (temporary data)
- `coverage/` - Test coverage reports (can be regenerated)

## Features of the Automated Script

### ✅ Smart Features
- **Automatic file exclusion** based on backup type
- **Size validation** with warnings for unexpectedly large backups
- **Recent backups display** to track backup history
- **Cleanup suggestions** when you have too many backups
- **Detailed progress reporting** with colored output
- **Error handling** with troubleshooting suggestions
- **Help system** with examples and usage instructions

### ✅ Backup Types
1. **Source** (Default): Code only, ~5-15 MB
   - Excludes: node_modules, images, build files, logs
   - Perfect for: Code sharing, version control, quick backups

2. **Full**: Complete project, ~50-200 MB  
   - Excludes: Only node_modules, git history, build files
   - Perfect for: Complete project transfers, major milestones

### ✅ Naming Convention
- Standard: `zapp-ecommerce-source-2025-01-19-1024.zip`
- Milestone: `zapp-ecommerce-milestone-cart-fix-2025-01-19-1024.zip`
- Full: `zapp-ecommerce-full-2025-01-19-1024.zip`

## Automation Script

We've created an automated PowerShell script that handles all backup scenarios efficiently:

**Location**: `scripts/create-zip-backup.ps1`

### Quick Reference Commands

#### Using the Automated Script (Recommended)
```powershell
# Standard source backup (5-15 MB) - Default
.\scripts\create-zip-backup.ps1

# Full project backup (50-200 MB)
.\scripts\create-zip-backup.ps1 -Type "full"

# Milestone backup with custom name
.\scripts\create-zip-backup.ps1 -Milestone "cart-localization-fix"

# Full milestone backup
.\scripts\create-zip-backup.ps1 -Type "full" -Milestone "v1.0"

# Show help and examples
.\scripts\create-zip-backup.ps1 -Help
```

#### Manual Commands (Fallback)
```powershell
# Quick source backup (5-15 MB)
Get-ChildItem -Path "." -Recurse | 
  Where-Object { $_.FullName -notmatch 'node_modules|sitephoto|\.git|backups|dist|build|coverage|\.env|\.log$' } | 
  Compress-Archive -DestinationPath "zapp-ecommerce-source-$(Get-Date -Format 'yyyy-MM-dd-HHmm').zip" -Force

# Full project backup (50-200 MB)
Get-ChildItem -Path "." -Recurse | 
  Where-Object { $_.FullName -notmatch 'node_modules|\.git|backups|dist|build|coverage|\.env|\.log$' } | 
  Compress-Archive -DestinationPath "zapp-ecommerce-full-$(Get-Date -Format 'yyyy-MM-dd-HHmm').zip" -Force
```

#### Utility Commands
```powershell
# Verify backup created
Get-ChildItem -Name "zapp-ecommerce-*.zip" | Sort-Object CreationTime -Descending | Select-Object -First 3

# Check backup size
Get-ChildItem "zapp-ecommerce-*.zip" | Select-Object Name, @{Name="Size(MB)";Expression={[math]::Round($_.Length/1MB,2)}} | Sort-Object Name -Descending
```

## Automation Script

### Create PowerShell Script: `create-zip-backup.ps1`
```powershell
param(
    [string]$Type = "source",
    [string]$Milestone = ""
)

$timestamp = Get-Date -Format 'yyyy-MM-dd-HHmm'
$baseName = "zapp-ecommerce"

if ($Milestone) {
    $fileName = "$baseName-milestone-$Milestone-$timestamp.zip"
} else {
    $fileName = "$baseName-$Type-$timestamp.zip"
}

switch ($Type) {
    "source" {
        $exclude = @('node_modules', 'sitephoto', '.git', 'backups', 'dist', 'build')
        Get-ChildItem -Path "." -Recurse | Where-Object { $_.FullName -notmatch ($exclude -join '|') } | Compress-Archive -DestinationPath $fileName -Force
    }
    "full" {
        $exclude = @('node_modules', '.git', 'backups')
        Get-ChildItem -Path "." -Recurse | Where-Object { $_.FullName -notmatch ($exclude -join '|') } | Compress-Archive -DestinationPath $fileName -Force
    }
}

Write-Host "Backup created: $fileName"
Get-Item $fileName | Select-Object Name, @{Name="Size(MB)";Expression={[math]::Round($_.Length/1MB,2)}}
```

### Usage Examples
```powershell
# Standard source backup
.\create-zip-backup.ps1

# Full project backup
.\create-zip-backup.ps1 -Type "full"

# Milestone backup
.\create-zip-backup.ps1 -Milestone "cart-localization-fix"
```

## Best Practices

### 1. Regular Backup Schedule
- **Daily**: Source code backups during active development
- **Weekly**: Full project backups
- **Milestone**: After completing major features
- **Pre-deployment**: Before production releases

### 2. Storage Management
- Keep last 5 source backups locally
- Archive older backups to cloud storage
- Delete backups older than 30 days (except milestone/release backups)

### 3. Verification Steps
1. Always verify the ZIP file was created successfully
2. Check file size is reasonable (source: 5-15MB, full: varies)
3. Test extraction on a different machine if critical

### 4. Security Considerations
- Never include `.env` files or API keys
- Exclude sensitive configuration files
- Use secure storage for backup files
- Consider encryption for sensitive projects

## Troubleshooting

### Common Issues & Solutions

#### "Stream was too long" Error
- **Cause**: Trying to compress too much data
- **Solution**: Use source backup instead of full backup, or exclude more directories

#### Large File Sizes
- **Cause**: Including unnecessary files (node_modules, images, build files)
- **Solution**: Review exclusion list, use source backup type

#### PowerShell Execution Policy
- **Cause**: PowerShell script execution disabled
- **Solution**: Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

## File Size Guidelines

### Expected Sizes
- **Source Backup**: 5-15 MB
- **Full Backup (with images)**: 50-200 MB
- **Full Backup (without images)**: 15-50 MB

### Size Optimization Tips
1. Exclude development dependencies
2. Remove build artifacts
3. Compress images separately if needed
4. Use selective inclusion for critical files only

## Recovery Procedures

### From Source Backup
1. Extract ZIP file to desired location
2. Run `npm install` to restore dependencies
3. Copy environment configuration files
4. Run `npm run dev` to start development server

### From Full Backup
1. Extract ZIP file to desired location
2. Run `npm install` (if node_modules was excluded)
3. Verify all assets are present
4. Run `npm run dev` to start development server

## Maintenance

### Monthly Review
- Clean up old backup files
- Review exclusion patterns
- Update automation scripts if needed
- Test recovery procedures

### Documentation Updates
- Update this policy when project structure changes
- Document new exclusion patterns
- Update size guidelines based on project growth

---

**Last Updated**: 2025-09-19  
**Version**: 1.0  
**Next Review**: 2025-10-19