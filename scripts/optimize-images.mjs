import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch (e) {
  console.error("❌ The 'sharp' package is required. Run 'npm install -D sharp' first.");
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, '../public');

async function optimizeImages() {
  console.log('🍋 Lemon Quiz Image Optimizer');
  console.log('Scanning public/ directory for unoptimized images...\n');

  try {
    const files = await fs.readdir(PUBLIC_DIR);
    const targetExts = ['.png', '.jpg', '.jpeg'];

    let totalSaved = 0;
    let count = 0;
    
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (targetExts.includes(ext)) {
        const inputPath = path.join(PUBLIC_DIR, file);
        const stats = await fs.stat(inputPath);
        
        // Process files larger than 100KB
        if (stats.size > 100 * 1024) {
          const baseName = path.basename(file, ext);
          const outputPath = path.join(PUBLIC_DIR, `${baseName}.webp`);
          
          console.log(`⏳ Optimizing: ${file} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
          
          try {
            await sharp(inputPath)
              .webp({ quality: 80, effort: 6 }) // High quality, good compression WebP
              .toFile(outputPath);
              
            const outStats = await fs.stat(outputPath);
            const saved = stats.size - outStats.size;
            totalSaved += saved;
            count++;
            
            console.log(`  ✅ Converted to WebP: ${(outStats.size / 1024).toFixed(2)} KB (Saved ${(saved / 1024 / 1024).toFixed(2)} MB)`);
          } catch (err) {
            console.error(`  ❌ Failed to optimize ${file}:`, err.message);
          }
        }
      }
    }
    
    console.log(`\n🎉 Optimization complete! Processed ${count} images.`);
    console.log(`Total space saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`);
    console.log(`\n⚠️  IMPORTANT: You must now update your code to point to the new .webp extensions!`);
    console.log(`Example: Replace src="/texture-subtle-grain.png" with src="/texture-subtle-grain.webp"`);
  } catch (err) {
    console.error('Error scanning directory:', err);
  }
}

optimizeImages();
