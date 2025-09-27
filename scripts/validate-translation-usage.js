#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Translation Usage Validator
 * 
 * This script ensures:
 * 1. Components use safeTranslate() instead of direct t() calls
 * 2. All translation keys are properly defined
 * 3. No orphaned translation keys exist
 */

const COMPONENT_DIRS = [
  'src/components/**/*.{ts,tsx}',
  'src/pages/**/*.{ts,tsx}'
];

const TRANSLATION_FILES = [
  'src/locales/en/translation.json',
  'src/locales/es/translation.json'
];

class TranslationValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.usedKeys = new Set();
    this.definedKeys = new Map(); // language -> Set of keys
  }

  // Load all translation files
  loadTranslations() {
    TRANSLATION_FILES.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const translations = JSON.parse(content);
        const lang = path.basename(path.dirname(filePath));
        
        this.definedKeys.set(lang, new Set());
        this.extractKeysFromObject(translations, '', this.definedKeys.get(lang));
        
        console.log(`📚 Loaded ${this.definedKeys.get(lang).size} keys for ${lang}`);
      } catch (error) {
        this.errors.push(`Failed to load ${filePath}: ${error.message}`);
      }
    });
  }

  // Recursively extract keys from translation object
  extractKeysFromObject(obj, prefix, keySet) {
    Object.keys(obj).forEach(key => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.extractKeysFromObject(obj[key], fullKey, keySet);
      } else {
        keySet.add(fullKey);
      }
    });
  }

  // Check component files for translation usage
  validateComponents() {
    const componentFiles = [];
    
    COMPONENT_DIRS.forEach(pattern => {
      const files = glob.sync(pattern);
      componentFiles.push(...files);
    });

    console.log(`🔍 Checking ${componentFiles.length} component files...`);

    componentFiles.forEach(filePath => {
      this.validateComponentFile(filePath);
    });
  }

  validateComponentFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for direct t() usage (should use safeTranslate instead)
      const directTUsage = content.match(/(?<!safeTranslate\()\bt\(['"`]([^'"`]+)['"`]\)/g);
      if (directTUsage) {
        directTUsage.forEach(match => {
          this.errors.push(`${filePath}: Direct t() usage found: ${match}. Use safeTranslate() instead.`);
        });
      }

      // Extract translation keys being used
      const keyMatches = content.match(/(?:safeTranslate\(t,\s*['"`]([^'"`]+)['"`]|t\(['"`]([^'"`]+)['"`]\))/g);
      if (keyMatches) {
        keyMatches.forEach(match => {
          const keyMatch = match.match(/['"`]([^'"`]+)['"`]/);
          if (keyMatch) {
            this.usedKeys.add(keyMatch[1]);
          }
        });
      }

      // Check for safeTranslate import
      if (content.includes('safeTranslate') && !content.includes("import { safeTranslate }")) {
        this.warnings.push(`${filePath}: Uses safeTranslate but missing import statement`);
      }

    } catch (error) {
      this.errors.push(`Failed to read ${filePath}: ${error.message}`);
    }
  }

  // Check for missing translation keys
  validateKeyExistence() {
    console.log(`🔑 Validating ${this.usedKeys.size} used translation keys...`);

    this.usedKeys.forEach(key => {
      let foundInAnyLanguage = false;
      
      this.definedKeys.forEach((keySet, lang) => {
        if (keySet.has(key)) {
          foundInAnyLanguage = true;
        } else {
          this.warnings.push(`Missing translation key "${key}" in ${lang}`);
        }
      });

      if (!foundInAnyLanguage) {
        this.errors.push(`Translation key "${key}" not found in any language file`);
      }
    });
  }

  // Check for orphaned translation keys
  validateOrphanedKeys() {
    console.log(`🧹 Checking for orphaned translation keys...`);

    this.definedKeys.forEach((keySet, lang) => {
      keySet.forEach(key => {
        if (!this.usedKeys.has(key)) {
          this.warnings.push(`Orphaned translation key "${key}" in ${lang} (not used in components)`);
        }
      });
    });
  }

  // Generate report
  generateReport() {
    console.log('\n📊 Translation Validation Report');
    console.log('================================');
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ All translation validations passed!');
      return true;
    }

    if (this.errors.length > 0) {
      console.log(`\n❌ Errors (${this.errors.length}):`);
      this.errors.forEach(error => console.log(`  • ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️  Warnings (${this.warnings.length}):`);
      this.warnings.forEach(warning => console.log(`  • ${warning}`));
    }

    console.log(`\n📈 Summary:`);
    console.log(`  • Used keys: ${this.usedKeys.size}`);
    console.log(`  • Defined keys: ${Array.from(this.definedKeys.values()).map(s => s.size).join(', ')} (by language)`);
    console.log(`  • Errors: ${this.errors.length}`);
    console.log(`  • Warnings: ${this.warnings.length}`);

    return this.errors.length === 0;
  }

  // Run all validations
  validate() {
    console.log('🌐 Starting translation validation...\n');
    
    this.loadTranslations();
    this.validateComponents();
    this.validateKeyExistence();
    this.validateOrphanedKeys();
    
    const success = this.generateReport();
    
    if (!success) {
      process.exit(1);
    }
  }
}

// Run validation
const validator = new TranslationValidator();
validator.validate();