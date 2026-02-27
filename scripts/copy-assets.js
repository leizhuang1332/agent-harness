import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const assets = [
  { src: 'src/templates', dest: 'dist/templates' },
  { src: 'src/skills', dest: 'dist/skills' }
];

function copyDirRecursive(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(source, entry.name);
    const destPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Copying assets...');
for (const asset of assets) {
  const srcPath = path.join(rootDir, asset.src);
  const destPath = path.join(rootDir, asset.dest);
  
  if (fs.existsSync(srcPath)) {
    copyDirRecursive(srcPath, destPath);
    console.log(`  ✓ Copied ${asset.src} -> ${asset.dest}`);
  } else {
    console.warn(`  ⚠ Source not found: ${asset.src}`);
  }
}
console.log('Assets copied successfully.');
