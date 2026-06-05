import fs from 'fs';
import path from 'path';

// Read CSS file
const cssContent = fs.readFileSync('./src/pages/Orders/Orders.css', 'utf8');
const jsxContent = fs.readFileSync('./src/pages/Orders/OrdersPage.jsx', 'utf8');

// Extract all CSS class definitions
const cssClassRegex = /^\.([a-zA-Z0-9\-_]+)[\s\{:]/gm;
const cssClasses = new Set();
let match;

while ((match = cssClassRegex.exec(cssContent)) !== null) {
    cssClasses.add(match[1]);
}

console.log('=== CSS CLASSES ANALYSIS ===\n');
console.log(`Total CSS classes defined: ${cssClasses.size}\n`);

// Extract all className attributes used in JSX  
// Only extract valid class names (alphanumeric, dash, underscore)
const classNameRegex = /className=(?:\{`([^`]+)`\}|"([^"]+)")/gm;
const jsxClasses = new Set();
let jsxMatch;

while ((jsxMatch = classNameRegex.exec(jsxContent)) !== null) {
    const classString = jsxMatch[1] || jsxMatch[2];
    // Split by space and only keep valid class names
    const parts = classString.split(/[\s\$\{\}]/);
    parts.forEach(part => {
        if (part && /^[a-zA-Z0-9\-_]+$/.test(part)) {
            jsxClasses.add(part);
        }
    });
}

console.log(`Total unique valid classes used in JSX: ${jsxClasses.size}\n`);

// Find unused CSS classes
const unusedClasses = [];
cssClasses.forEach(cssClass => {
    if (!jsxClasses.has(cssClass)) {
        unusedClasses.push(cssClass);
    }
});

if (unusedClasses.length > 0) {
    console.log('=== UNUSED CSS CLASSES ===\n');
    unusedClasses.sort();
    unusedClasses.forEach((cls, idx) => {
        console.log(`${idx + 1}. .${cls}`);
    });
    console.log(`\nTotal unused: ${unusedClasses.length}`);
} else {
    console.log('✓ No unused CSS classes found!');
}

// Find classes used in JSX but not defined in CSS (excluding utility classes likely from other files)
const knownUtility = new Set(['fade-in', 'toast-icon', 'print-btn-no-print', 'fade-in-up', 'scale-up']);
const undefinedClasses = [];
jsxClasses.forEach(jsxClass => {
    if (!cssClasses.has(jsxClass) && !knownUtility.has(jsxClass)) {
        undefinedClasses.push(jsxClass);
    }
});

if (undefinedClasses.length > 0) {
    console.log('\n=== CLASSES USED IN JSX BUT NOT DEFINED IN CSS ===\n');
    undefinedClasses.sort();
    undefinedClasses.forEach((cls, idx) => {
        console.log(`${idx + 1}. .${cls}`);
    });
    console.log(`\nTotal undefined: ${undefinedClasses.length}`);
}

console.log('\n=== SUMMARY ===');
console.log(`CSS Classes Defined: ${cssClasses.size}`);
console.log(`Valid JSX Classes Used: ${jsxClasses.size}`);
console.log(`Unused CSS Classes: ${unusedClasses.length}`);
console.log(`Undefined Classes (not in Orders.css): ${undefinedClasses.length}`);
