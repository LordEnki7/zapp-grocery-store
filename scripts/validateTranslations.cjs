#!/usr/bin/env node

/**
 * Translation Validation Script
 * 
 * This script validates that all translation files have the same structure
 * and that no translation keys are missing across different languages.
 * 
 * Run with: node scripts/validateTranslations.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const LOCALES_DIR = path.join(__dirname, '../src/locales');
const SUPPORTED_LANGUAGES = ['en', 'es'];
const REFERENCE_LANGUAGE = 'en'; // Use English as the reference

/**
 * Recursively get all keys from a nested object
 * @param {Object} obj - The object to extract keys from
 * @param {string} prefix - Current key prefix
 * @returns {string[]} Array of dot-notation keys
 */
function getAllKeys(obj, prefix = '') {
  const keys = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}

/**
 * Load translation file for a specific language
 * @param {string} language - Language code (e.g., 'en', 'es')
 * @returns {Object|null} Translation object or null if file doesn't exist
 */
function loadTranslationFile(language) {
  const filePath = path.join(LOCALES_DIR, language, 'translation.json');
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Error loading ${language} translation file:`, error.message);
    return null;
  }
}

/**
 * Validate translation completeness
 */
function validateTranslations() {
  console.log('🌐 Validating translation files...\n');
  
  // Load reference translation (English)
  const referenceTranslation = loadTranslationFile(REFERENCE_LANGUAGE);
  if (!referenceTranslation) {
    console.error(`❌ Could not load reference language: ${REFERENCE_LANGUAGE}`);
    process.exit(1);
  }
  
  const referenceKeys = getAllKeys(referenceTranslation);
  console.log(`📋 Reference language (${REFERENCE_LANGUAGE}) has ${referenceKeys.length} keys`);
  
  let hasErrors = false;
  
  // Validate each supported language
  for (const language of SUPPORTED_LANGUAGES) {
    if (language === REFERENCE_LANGUAGE) continue;
    
    console.log(`\n🔍 Validating ${language}...`);
    
    const translation = loadTranslationFile(language);
    if (!translation) {
      hasErrors = true;
      continue;
    }
    
    const languageKeys = getAllKeys(translation);
    
    // Find missing keys
    const missingKeys = referenceKeys.filter(key => !languageKeys.includes(key));
    
    // Find extra keys (keys that exist in this language but not in reference)
    const extraKeys = languageKeys.filter(key => !referenceKeys.includes(key));
    
    if (missingKeys.length === 0 && extraKeys.length === 0) {
      console.log(`✅ ${language}: All keys match (${languageKeys.length} keys)`);
    } else {
      hasErrors = true;
      
      if (missingKeys.length > 0) {
        console.log(`❌ ${language}: Missing ${missingKeys.length} keys:`);
        missingKeys.forEach(key => console.log(`   - ${key}`));
      }
      
      if (extraKeys.length > 0) {
        console.log(`⚠️  ${language}: Extra ${extraKeys.length} keys:`);
        extraKeys.forEach(key => console.log(`   + ${key}`));
      }
    }
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (hasErrors) {
    console.log('❌ Translation validation failed!');
    console.log('Please fix the missing or extra keys before proceeding.');
    process.exit(1);
  } else {
    console.log('✅ All translation files are valid!');
    console.log('All languages have matching key structures.');
  }
}

/**
 * Generate missing keys template for a language
 * @param {string} language - Target language code
 */
function generateMissingKeysTemplate(language) {
  const referenceTranslation = loadTranslationFile(REFERENCE_LANGUAGE);
  const targetTranslation = loadTranslationFile(language);
  
  if (!referenceTranslation || !targetTranslation) {
    console.error('Could not load translation files for template generation');
    return;
  }
  
  const referenceKeys = getAllKeys(referenceTranslation);
  const targetKeys = getAllKeys(targetTranslation);
  const missingKeys = referenceKeys.filter(key => !targetKeys.includes(key));
  
  if (missingKeys.length === 0) {
    console.log(`✅ No missing keys for ${language}`);
    return;
  }
  
  console.log(`\n📝 Missing keys template for ${language}:`);
  console.log('Copy and translate the following keys:\n');
  
  missingKeys.forEach(key => {
    // Get the value from reference language
    const value = getNestedValue(referenceTranslation, key);
    console.log(`"${key}": "${value}",`);
  });
}

/**
 * Get nested value from object using dot notation
 * @param {Object} obj - Source object
 * @param {string} path - Dot notation path
 * @returns {any} Value at path
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Translation Validation Script

Usage:
  node scripts/validateTranslations.js              Validate all translation files
  node scripts/validateTranslations.js --template es Generate missing keys template for Spanish

Options:
  --template <lang>  Generate missing keys template for specified language
  --help, -h         Show this help message
    `);
    process.exit(0);
  }
  
  if (args.includes('--template')) {
    const langIndex = args.indexOf('--template') + 1;
    const language = args[langIndex];
    
    if (!language || !SUPPORTED_LANGUAGES.includes(language)) {
      console.error('❌ Please specify a valid language code after --template');
      console.error(`Supported languages: ${SUPPORTED_LANGUAGES.join(', ')}`);
      process.exit(1);
    }
    
    generateMissingKeysTemplate(language);
  } else {
    validateTranslations();
  }
}