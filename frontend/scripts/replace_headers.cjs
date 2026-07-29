const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src/features');
const headerComponentPath = path.join(__dirname, '../src/components/common/Header');

function walk(dir, done) {
  let results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.join(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          if (file.endsWith('.tsx')) {
            results.push(file);
          }
          if (!--pending) done(null, results);
        }
      });
    });
  });
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find instances of tags containing just SahaVest
  // e.g. <h1 className="...">SahaVest</h1> or <div ...>SahaVest</div>
  const regex = /<([a-zA-Z0-9]+)\s+[^>]*\bclassName\s*=\s*["'][^"']*["'][^>]*>\s*SahaVest\s*<\/\1>/g;
  
  // also find elements without className but this is rare in this prototype
  
  if (regex.test(content)) {
    // Determine relative path to Header
    let relPath = path.relative(path.dirname(filePath), headerComponentPath);
    relPath = relPath.replace(/\\/g, '/'); // Windows support
    if (!relPath.startsWith('.')) relPath = './' + relPath;

    // Inject import if not present
    if (!content.includes('Header')) {
      const importStatement = `import { Header } from '${relPath}';\n`;
      // Find the last import
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        const nextNewline = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, nextNewline + 1) + importStatement + content.slice(nextNewline + 1);
      } else {
        content = importStatement + content;
      }
    }

    // Replace all instances
    content = content.replace(regex, '<Header />');
    
    // Also catch some that might be split across lines like
    // <div className="...">
    //   SahaVest
    // </div>
    const multilineRegex = /<([a-zA-Z0-9]+)\s+[^>]*>[\s\n]*SahaVest[\s\n]*<\/\1>/g;
    content = content.replace(multilineRegex, '<Header />');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${path.basename(filePath)}`);
  }
}

walk(srcDir, function(err, results) {
  if (err) throw err;
  results.forEach(processFile);
  console.log('Done replacing headers.');
});
