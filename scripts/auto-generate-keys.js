#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Auto-generate translation keys from component usage
 * This tool scans components for safeTranslate() calls and generates
 * missing translation keys with placeholder values
 */

const PROJECT_ROOT = path.resolve(__dirname, '..');
const LOCALES_DIR = path.join(PROJECT_ROOT, 'src', 'locales');
const COMPONENTS_DIR = path.join(PROJECT_ROOT, 'src', 'components');

// Language files
const LANGUAGES = ['en', 'es'];

/**
 * Extract translation keys from component files
 */
function extractKeysFromComponents() {
  const componentFiles = glob.sync('**/*.{tsx,ts,jsx,js}', {
    cwd: COMPONENTS_DIR,
    absolute: true
  });

  const extractedKeys = new Set();
  const safeTranslateRegex = /safeTranslate\s*\(\s*t\s*,\s*['"`]([^'"`]+)['"`]\s*\)/g;

  componentFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let match;
      
      while ((match = safeTranslateRegex.exec(content)) !== null) {
        extractedKeys.add(match[1]);
      }
    } catch (error) {
      console.warn(`⚠️  Could not read file: ${filePath}`);
    }
  });

  return Array.from(extractedKeys).sort();
}

/**
 * Load existing translation file
 */
function loadTranslationFile(language) {
  const filePath = path.join(LOCALES_DIR, language, 'translation.json');
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(`⚠️  Could not load ${language} translations, creating new file`);
    return {};
  }
}

/**
 * Generate human-readable placeholder from key
 */
function generatePlaceholder(key) {
  // Split by dots and take the last part
  const parts = key.split('.');
  const lastPart = parts[parts.length - 1];
  
  // Convert camelCase to Title Case
  return lastPart
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Set nested object value using dot notation
 */
function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  const lastKey = keys[keys.length - 1];
  if (!(lastKey in current)) {
    current[lastKey] = value;
  }
}

/**
 * Get nested object value using dot notation
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * Generate missing translation keys
 */
function generateMissingKeys() {
  console.log('🔍 Scanning components for translation keys...');
  
  const extractedKeys = extractKeysFromComponents();
  console.log(`📝 Found ${extractedKeys.length} translation keys in components`);
  
  let totalGenerated = 0;
  
  LANGUAGES.forEach(language => {
    console.log(`\n🌐 Processing ${language} translations...`);
    
    const translations = loadTranslationFile(language);
    const missingKeys = [];
    
    extractedKeys.forEach(key => {
      if (getNestedValue(translations, key) === undefined) {
        missingKeys.push(key);
        
        // Generate appropriate placeholder based on language
        let placeholder;
        if (language === 'es') {
          // For Spanish, add a prefix to indicate it needs translation
          placeholder = `[ES] ${generatePlaceholder(key)}`;
        } else {
          // For English, use the generated placeholder
          placeholder = generatePlaceholder(key);
        }
        
        setNestedValue(translations, key, placeholder);
      }
    });
    
    if (missingKeys.length > 0) {
      console.log(`✨ Generated ${missingKeys.length} missing keys for ${language}:`);
      missingKeys.forEach(key => {
        console.log(`   • ${key}`);
      });
      
      // Save updated translations
      const filePath = path.join(LOCALES_DIR, language, 'translation.json');
      const dir = path.dirname(filePath);
      
      // Ensure directory exists
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(filePath, JSON.stringify(translations, null, 2) + '\n');
      console.log(`💾 Updated ${filePath}`);
      
      totalGenerated += missingKeys.length;
    } else {
      console.log(`✅ No missing keys found for ${language}`);
    }
  });
  
  console.log(`\n🎉 Generation complete! Added ${totalGenerated} translation keys total.`);
  
  if (totalGenerated > 0) {
    console.log('\n📋 Next steps:');
    console.log('1. Review the generated keys and update placeholders with proper translations');
    console.log('2. For Spanish keys marked with [ES], provide proper Spanish translations');
    console.log('3. Run "npm run validate:translations" to verify everything is working');
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Auto-generating translation keys from component usage...\n');
  
  try {
    generateMissingKeys();
  } catch (error) {
    console.error('❌ Error during key generation:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { extractKeysFromComponents, generateMissingKeys };