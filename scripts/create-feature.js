/**
 * ZAPP Feature Creation Script
 * Creates scaffolding for a new feature following the modular architecture
 * 
 * Usage: 
 *   node scripts/create-feature.js feature-name
 * 
 * Example:
 *   node scripts/create-feature.js product-reviews
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get the directory name using ES modules pattern
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get feature name from command line arguments
const featureName = process.argv[2];

if (!featureName) {
  console.error('Error: Please provide a feature name');
  console.error('Usage: node scripts/create-feature.js feature-name');
  process.exit(1);
}

// Convert feature name to different formats
const kebabCase = featureName.toLowerCase();
const camelCase = kebabCase.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
const pascalCase = camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
const titleCase = kebabCase.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

// Create feature directories
const componentDir = path.join('src', 'components', kebabCase);
const pageDir = path.join('src', 'pages', kebabCase);
const hookDir = path.join('src', 'hooks', 'use' + pascalCase);

// Create directories if they don't exist
for (const dir of [componentDir, pageDir, hookDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
}

// Create component template
const componentContent = `import React from 'react';
import { use${pascalCase} } from '../../hooks/use${pascalCase}';

interface ${pascalCase}Props {
  // Define your props here
}

export function ${pascalCase}({ ...props }: ${pascalCase}Props) {
  const { state, actions } = use${pascalCase}();
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">${titleCase}</h2>
      {/* Your component implementation */}
    </div>
  );
}

export default ${pascalCase};
`;

// Create page template
const pageContent = `import React from 'react';
import { ${pascalCase} } from '../components/${kebabCase}/${pascalCase}';
import { use${pascalCase} } from '../hooks/use${pascalCase}';

export function ${pascalCase}Page() {
  const { state, actions } = use${pascalCase}();
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">${titleCase}</h1>
      
      <${pascalCase} />
      
      {/* Additional page content */}
    </div>
  );
}

export default ${pascalCase}Page;
`;

// Create custom hook template
const hookContent = `import { useState, useEffect } from 'react';

// Define your state types
interface ${pascalCase}State {
  // Add state properties
  loading: boolean;
  error: string | null;
}

// Define your action types
interface ${pascalCase}Actions {
  // Add actions
}

export function use${pascalCase}(): { state: ${pascalCase}State; actions: ${pascalCase}Actions } {
  // Initialize state
  const [state, setState] = useState<${pascalCase}State>({
    loading: false,
    error: null
  });
  
  // Define actions
  const actions: ${pascalCase}Actions = {
    // Implement your actions here
  };
  
  // Effects
  useEffect(() => {
    // Add your side effects here
  }, []);
  
  return { state, actions };
}
`;

// Write files
fs.writeFileSync(path.join(componentDir, `${pascalCase}.tsx`), componentContent);
console.log(`✅ Created component: ${path.join(componentDir, `${pascalCase}.tsx`)}`);

fs.writeFileSync(path.join(pageDir, `index.tsx`), pageContent);
console.log(`✅ Created page: ${path.join(pageDir, `index.tsx`)}`);

fs.writeFileSync(path.join('src', 'hooks', `use${pascalCase}.ts`), hookContent);
console.log(`✅ Created hook: ${path.join('src', 'hooks', `use${pascalCase}.ts`)}`);

// Check if a git repository exists
let isGitRepo = false;
try {
  execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
  isGitRepo = true;
} catch (e) {
  // Not a git repository
}

// Create feature branch if in a git repository
if (isGitRepo) {
  try {
    console.log(`🔍 Creating git branch for feature: feature/${kebabCase}`);
    execSync(`git checkout -b feature/${kebabCase}`, { stdio: 'inherit' });
    console.log(`✅ Switched to branch: feature/${kebabCase}`);
  } catch (e) {
    console.error(`❌ Failed to create git branch: ${e.message}`);
  }
}

console.log(`\n🎉 Successfully created ${titleCase} feature scaffolding!`);
console.log('\nNext steps:');
console.log(`1. Update the App.tsx to add routes for the new ${pascalCase}Page`);
console.log(`2. Implement your feature logic in use${pascalCase}.ts`);
console.log(`3. Design your UI in the ${pascalCase} component`);
console.log(`4. Run 'npm run analyze' to verify architecture compliance`); 