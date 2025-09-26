/**
 * ZAPP Architecture Analysis Script
 * Analyzes project dependencies to ensure modular architecture is maintained
 * 
 * Usage: 
 *   node scripts/analyze-architecture.js
 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

// Get the directory name using ES modules pattern
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);

// Define core modules that should be protected
const CORE_MODULES = [
  { path: 'src/context', name: 'Context' },
  { path: 'src/services', name: 'Services' },
  { path: 'src/utils', name: 'Utils' },
  { path: 'src/hooks', name: 'Hooks' }
];

// Define feature modules
const FEATURE_MODULES = [
  { path: 'src/pages', name: 'Pages' },
  { path: 'src/components', name: 'Components' }
];

// File extensions to analyze
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

// Dependency graph
const dependencyGraph = {};

// Helper to check if a file is a source file we want to analyze
const isSourceFile = (file) => {
  const ext = path.extname(file).toLowerCase();
  return EXTENSIONS.includes(ext);
};

// Helper to extract import statements from a file
const extractImports = async (filePath) => {
  try {
    const content = await readFile(filePath, 'utf8');
    const imports = [];
    
    // Regular expression to match ES6 imports
    const importRegex = /import\s+(?:{[\s\w,]*}|\w+|\*\s+as\s+\w+)\s+from\s+['"]([^'"]+)['"]/g;
    
    let match;
    while (match = importRegex.exec(content)) {
      imports.push(match[1]);
    }
    
    return imports;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return [];
  }
};

// Helper to normalize relative imports
const normalizeImport = (importPath, currentFile) => {
  if (!importPath.startsWith('.')) {
    return importPath; // External package
  }
  
  const dir = path.dirname(currentFile);
  const absolutePath = path.resolve(dir, importPath);
  const relativePath = path.relative(process.cwd(), absolutePath);
  
  return relativePath.replace(/\\/g, '/'); // Normalize for Windows
};

// Recursive function to walk directory and collect files
const walkDir = async (dir) => {
  let files = [];
  const entries = await readdir(dir);
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const entryStat = await stat(fullPath);
    
    if (entryStat.isDirectory()) {
      const subFiles = await walkDir(fullPath);
      files = [...files, ...subFiles];
    } else if (isSourceFile(entry)) {
      files.push(fullPath);
    }
  }
  
  return files;
};

// Find module for a file
const findModule = (filePath) => {
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  // Check core modules
  for (const module of CORE_MODULES) {
    if (normalizedPath.includes(module.path)) {
      return { ...module, isCore: true };
    }
  }
  
  // Check feature modules
  for (const module of FEATURE_MODULES) {
    if (normalizedPath.includes(module.path)) {
      return { ...module, isCore: false };
    }
  }
  
  return null;
};

// Find module for an import
const findImportModule = (importPath) => {
  // Skip external packages
  if (!importPath.startsWith('src/')) {
    return null;
  }
  
  // Check core modules
  for (const module of CORE_MODULES) {
    if (importPath.startsWith(module.path)) {
      return { ...module, isCore: true };
    }
  }
  
  // Check feature modules
  for (const module of FEATURE_MODULES) {
    if (importPath.startsWith(module.path)) {
      return { ...module, isCore: false };
    }
  }
  
  return null;
};

// Main function
async function main() {
  console.log('🔍 Analyzing ZAPP project architecture...');
  
  // Step 1: Collect all source files
  console.log('📂 Collecting source files...');
  const sourceFiles = await walkDir('src');
  console.log(`Found ${sourceFiles.length} source files to analyze`);
  
  // Step 2: Build dependency graph
  console.log('🧩 Building dependency graph...');
  for (const file of sourceFiles) {
    const relativePath = path.relative(process.cwd(), file).replace(/\\/g, '/');
    const imports = await extractImports(file);
    const normalizedImports = imports.map(imp => normalizeImport(imp, file));
    
    dependencyGraph[relativePath] = {
      imports: normalizedImports,
      module: findModule(relativePath)
    };
  }
  
  // Step 3: Analyze module dependencies
  console.log('📊 Analyzing module dependencies...');
  
  const violations = [];
  const moduleUsage = {};
  
  // Initialize module usage tracking
  for (const module of [...CORE_MODULES, ...FEATURE_MODULES]) {
    moduleUsage[module.name] = {
      usedBy: new Set(),
      uses: new Set()
    };
  }
  
  // Check for violations
  for (const [file, data] of Object.entries(dependencyGraph)) {
    const fileModule = data.module;
    
    if (!fileModule) continue;
    
    for (const importPath of data.imports) {
      const importModule = findImportModule(importPath);
      
      if (!importModule) continue;
      
      // Track module usage
      moduleUsage[fileModule.name].uses.add(importModule.name);
      moduleUsage[importModule.name].usedBy.add(fileModule.name);
      
      // Check for violations: non-core modules should not modify core modules
      if (importModule.isCore && !fileModule.isCore) {
        // Detect modifications to core modules (assume import that ends with '/something')
        const isModifying = /\/[^\/]+$/.test(importPath) && !importPath.endsWith('.json');
        
        if (isModifying) {
          violations.push({
            file,
            import: importPath,
            fromModule: fileModule.name,
            toModule: importModule.name
          });
        }
      }
    }
  }
  
  // Step 4: Print results
  console.log('\n📝 Module Dependency Report:');
  console.log('===========================');
  
  for (const module of [...CORE_MODULES, ...FEATURE_MODULES]) {
    const usage = moduleUsage[module.name];
    console.log(`\n${module.isCore ? '🔒 Core' : '🧩 Feature'} Module: ${module.name}`);
    console.log(`- Used by: ${Array.from(usage.usedBy).join(', ') || 'None'}`);
    console.log(`- Uses: ${Array.from(usage.uses).join(', ') || 'None'}`);
  }
  
  console.log('\n⚠️ Architecture Violations:');
  console.log('===========================');
  
  if (violations.length === 0) {
    console.log('✅ No violations found! Architecture is clean.');
  } else {
    console.log(`Found ${violations.length} violations:`);
    
    for (const v of violations) {
      console.log(`- ${v.file} imports from ${v.import}`);
      console.log(`  (${v.fromModule} should not modify ${v.toModule})`);
    }
    
    console.log('\n⚙️ Recommendation:');
    console.log('- Use proper interfaces or hooks to interact with core modules');
    console.log('- Do not directly modify core module implementation');
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
}); 