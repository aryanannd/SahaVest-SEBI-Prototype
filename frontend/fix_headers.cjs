const fs = require('fs');
const path = require('path');

const featuresDir = path.join(__dirname, 'src', 'features');

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('<Header') && !content.includes('import { Header }') && !content.includes('import Header')) {
        const headerPath = path.join(__dirname, 'src', 'components', 'common', 'Header');
        let importPath = path.relative(path.dirname(fullPath), headerPath).replace(/\\/g, '/');
        if (!importPath.startsWith('.')) importPath = './' + importPath;
        
        // Add import after the first import React statement, or just at the top
        const importLine = `import { Header } from '${importPath}';\n`;
        content = importLine + content;
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${file}`);
      }
    }
  }
}
traverse(featuresDir);
console.log("Done");
