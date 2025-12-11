/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const resourcesDir = path.join(__dirname, '..', 'data', 'resources');
const dirs = ['app-specific', 'avanzado', 'emergency'];

let totalFiles = 0;
let validFiles = 0;
let invalidFiles = [];
let levelCounts = { basico: 0, intermedio: 0, avanzado: 0, other: 0 };

dirs.forEach(dir => {
  const dirPath = path.join(resourcesDir, dir);
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));

  files.forEach(file => {
    totalFiles++;
    const filePath = path.join(dirPath, file);

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const json = JSON.parse(content);

      // Check level field
      if (json.level) {
        if (json.level === 'basico') levelCounts.basico++;
        else if (json.level === 'intermedio') levelCounts.intermedio++;
        else if (json.level === 'avanzado') levelCounts.avanzado++;
        else levelCounts.other++;
      }

      validFiles++;
      console.log(`✓ ${dir}/${file} (level: ${json.level})`);
    } catch (error) {
      invalidFiles.push({ file: `${dir}/${file}`, error: error.message });
      console.log(`✗ ${dir}/${file} - ${error.message}`);
    }
  });
});

console.log('\n=== VALIDATION SUMMARY ===');
console.log(`Total files: ${totalFiles}`);
console.log(`Valid JSON: ${validFiles}`);
console.log(`Invalid: ${invalidFiles.length}`);
console.log('\n=== LEVEL DISTRIBUTION ===');
console.log(`basico: ${levelCounts.basico}`);
console.log(`intermedio: ${levelCounts.intermedio}`);
console.log(`avanzado: ${levelCounts.avanzado}`);
console.log(`other: ${levelCounts.other}`);

if (invalidFiles.length > 0) {
  console.log('\n=== INVALID FILES ===');
  invalidFiles.forEach(f => console.log(`- ${f.file}: ${f.error}`));
  process.exit(1);
} else {
  console.log('\n✓ All files valid!');
  process.exit(0);
}
