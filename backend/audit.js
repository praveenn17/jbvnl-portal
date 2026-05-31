const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, 'controllers');
const routesDir = path.join(__dirname, 'routes');

const controllers = fs.readdirSync(controllersDir).filter(f => f.endsWith('.js'));
const routes = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));

const controllerExports = {};
const issues = [];

controllers.forEach(file => {
  const content = fs.readFileSync(path.join(controllersDir, file), 'utf8');
  
  // Find module.exports = { ... }
  const match = content.match(/module\.exports\s*=\s*{([^}]*)}/);
  if (match) {
    const exportsList = match[1].split(',').map(s => s.trim()).filter(s => s);
    controllerExports[file] = exportsList;
    
    // check if function definition exists
    exportsList.forEach(exp => {
      // Look for `const name =` or `function name(` or `name:` or `name(`
      const regex = new RegExp(`(?:const|let|var|function|async function)\\s+${exp}\\s*=?\\s*\\(|${exp}\\s*:\\s*(?:async\\s*)?(?:function)?\\s*\\(`, 'g');
      if (!regex.test(content) && !content.includes(`exports.${exp}`)) {
        issues.push(`Exported function ${exp} missing definition in ${file}`);
      }
    });
  }
});

const routeImports = {};
routes.forEach(file => {
  const content = fs.readFileSync(path.join(routesDir, file), 'utf8');
  // simplistic parsing of destructured require
  const requireRegex = /const\s*{([^}]+)}\s*=\s*require\(['"]\.\.\/controllers\/([^'"]+)['"]\)/g;
  let match;
  while ((match = requireRegex.exec(content)) !== null) {
    const imports = match[1].split(',').map(s => s.trim()).filter(s => s);
    const controller = match[2] + '.js';
    if (!routeImports[file]) routeImports[file] = [];
    routeImports[file].push({ imports, controller });
    
    imports.forEach(imp => {
      if (controllerExports[controller] && !controllerExports[controller].includes(imp)) {
        issues.push(`Route ${file} imports ${imp} from ${controller} but it is not exported`);
      }
    });
  }

  // check routes for update operations without protect middleware
  const routeRegex = /router\.(post|put|patch|delete)\(['"]([^'"]+)['"],\s*(.+)\)/g;
  while ((match = routeRegex.exec(content)) !== null) {
    const method = match[1];
    const pth = match[2];
    const handlers = match[3];
    // if it modifies user data, it should probably be protected.
    // simplistic check: if it doesn't contain 'protect' but is in a file that normally requires it, or specifically modifies something.
    if (!handlers.includes('protect')) {
      // just log it as a potential issue, filter later
      // issues.push(`Potential unprotected modifying route: ${method.toUpperCase()} ${pth} in ${file}`);
    }
  }
});

console.log(JSON.stringify(issues, null, 2));
