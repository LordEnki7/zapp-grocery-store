/**
 * ZAPP Backup Script
 * Creates ZIP archives of the project at key development milestones
 * 
 * Usage: 
 *   node scripts/create-backup.js milestone-name
 * 
 * Example:
 *   node scripts/create-backup.js initial-setup
 *   node scripts/create-backup.js auth-feature
 *   node scripts/create-backup.js pre-production
 */

import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get the directory name using ES modules pattern
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get milestone name from command line arguments
const milestoneName = process.argv[2];

if (!milestoneName) {
  console.error('Error: Please provide a milestone name');
  console.error('Usage: node scripts/create-backup.js milestone-name');
  process.exit(1);
}

// Create formatted date string (YYYY-MM-DD)
const currentDate = new Date().toISOString().split('T')[0];

// Create backup directory if it doesn't exist
const backupDir = path.join(__dirname, '..', 'backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

// Define ZIP filename
const zipFilename = `zapp-${milestoneName}-${currentDate}.zip`;
const zipPath = path.join(backupDir, zipFilename);

// Create a file to stream archive data to
const output = fs.createWriteStream(zipPath);
const archive = archiver('zip', {
  zlib: { level: 9 } // Best compression
});

// Listen for all archive data to be written
output.on('close', function() {
  console.log(`✅ Successfully created backup: ${zipFilename}`);
  console.log(`📦 Total size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📂 Location: ${zipPath}`);
  
  // Get current git commit hash if in a git repository
  try {
    const gitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    console.log(`🔍 Git commit: ${gitHash}`);
    
    // Create a metadata file with backup information
    const metadataPath = path.join(backupDir, `${zipFilename}.meta.json`);
    fs.writeFileSync(metadataPath, JSON.stringify({
      milestone: milestoneName,
      date: currentDate,
      gitCommit: gitHash,
      fileSize: archive.pointer()
    }, null, 2));
    
    console.log(`📝 Metadata saved to: ${metadataPath}`);
  } catch (err) {
    console.log('⚠️ Not a git repository or git not installed');
  }
});

// Handle warnings and errors
archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn(`⚠️ Warning: ${err.message}`);
  } else {
    throw err;
  }
});

archive.on('error', function(err) {
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Define files and directories to exclude from the backup
const excludePatterns = [
  'node_modules',
  'dist',
  '.git',
  'backups',
  'coverage'
];

// Add files and directories to the archive
const rootDir = path.join(__dirname, '..');
archive.glob('**/*', {
  cwd: rootDir,
  ignore: excludePatterns,
  dot: true // Include hidden files
});

// Finalize the archive
archive.finalize(); 