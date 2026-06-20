import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const srcDir = path.resolve('src');

// Helper to recursively list all files
function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            getAllFiles(filePath, fileList);
        } else {
            fileList.push(filePath);
        }
    });
    return fileList;
}

const allFiles = getAllFiles(srcDir);

// Detect duplicates by hash
const duplicates = {};
const fileHashes = {};

allFiles.forEach(file => {
    if (fs.statSync(file).isDirectory()) return;
    const content = fs.readFileSync(file);
    const hash = crypto.createHash('md5').update(content).digest('hex');
    if (fileHashes[hash]) {
        if (!duplicates[hash]) {
            duplicates[hash] = [fileHashes[hash]];
        }
        duplicates[hash].push(file);
    } else {
        fileHashes[hash] = file;
    }
});

// Parse imports from file content
function parseImports(filePath) {
    const ext = path.extname(filePath);
    if (!['.js', '.jsx'].includes(ext)) return [];
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = [];
    
    // Simple regex for ES6 imports: import ... from "..." or import "..."
    const importRegex = /import\s+(?:[\w*\s{},]*\s+from\s+)?['"](.*?)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        imports.push(match[1]);
    }
    
    // Dynamic imports: import(...)
    const dynamicRegex = /import\(['"](.*?)['"]\)/g;
    while ((match = dynamicRegex.exec(content)) !== null) {
        imports.push(match[1]);
    }

    return imports;
}

// Resolve import path to absolute file path
function resolveImport(sourceFile, importPath) {
    if (!importPath.startsWith('.')) {
        // Third-party package or absolute alias (if any)
        return null;
    }
    const sourceDir = path.dirname(sourceFile);
    let resolved = path.resolve(sourceDir, importPath);

    const extensions = ['.jsx', '.js', '.css', '.jpeg', '.png', '.jpg'];
    
    // Try as file directly
    if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
        return resolved;
    }
    
    // Try with extensions
    for (const ext of extensions) {
        const withExt = resolved + ext;
        if (fs.existsSync(withExt) && fs.statSync(withExt).isFile()) {
            return withExt;
        }
    }
    
    // Try as directory index
    for (const ext of extensions) {
        const indexWithExt = path.join(resolved, 'index' + ext);
        if (fs.existsSync(indexWithExt) && fs.statSync(indexWithExt).isFile()) {
            return indexWithExt;
        }
    }

    return null;
}

// Trace dependency graph from roots
const entryPoints = [
    path.resolve('src/main.jsx'),
    path.resolve('src/App.jsx')
];

const visited = new Set();
const queue = [...entryPoints];

while (queue.length > 0) {
    const current = queue.shift();
    if (visited.has(current)) continue;
    visited.add(current);

    const rawImports = parseImports(current);
    rawImports.forEach(imp => {
        const resolved = resolveImport(current, imp);
        if (resolved && !visited.has(resolved)) {
            queue.push(resolved);
        }
    });
}

// Find unreachable files
const unusedFiles = allFiles.filter(file => !visited.has(file));

console.log('========================================================');
console.log('                PROJECT STRUCTURE AUDIT                ');
console.log('========================================================');
console.log(`Total Files in src: ${allFiles.length}`);
console.log(`Reachable/Used Files: ${visited.size}`);
console.log(`Unused/Orphan Files: ${unusedFiles.length}`);

console.log('\n--- Unused / Orphan Files ---');
unusedFiles.forEach(file => {
    console.log(`- ${path.relative(srcDir, file)}`);
});

console.log('\n--- Duplicate Files (Identical Hashes) ---');
Object.values(duplicates).forEach(list => {
    console.log(`Duplicates group (${list.length} files):`);
    list.forEach(file => {
        console.log(`  - ${path.relative(srcDir, file)}`);
    });
});
