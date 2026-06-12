import fs from 'fs';
import path from 'path';

const content = fs.readFileSync('eslint_report_utf8.txt', 'utf8');

const lines = content.split('\n');
let currentFile = '';
const fileIssues = {};
let totalErrors = 0;
let totalWarnings = 0;

for (const line of lines) {
    if (line.trim().startsWith('C:\\')) {
        currentFile = line.trim();
        fileIssues[currentFile] = [];
    } else if (line.trim() && currentFile) {
        // match line:col  warning/error  message  rule
        const match = line.trim().match(/^(\d+):(\d+)\s+(error|warning)\s+(.*?)\s+(\S+)?$/);
        if (match) {
            const [_, row, col, severity, message, rule] = match;
            fileIssues[currentFile].push({
                line: parseInt(row),
                col: parseInt(col),
                severity,
                message,
                rule: rule || 'unknown'
            });
            if (severity === 'error') totalErrors++;
            if (severity === 'warning') totalWarnings++;
        }
    }
}

console.log(`Total Errors: ${totalErrors}`);
console.log(`Total Warnings: ${totalWarnings}`);
console.log('\n--- Files with Errors ---');
for (const [file, issues] of Object.entries(fileIssues)) {
    const errors = issues.filter(i => i.severity === 'error');
    const warnings = issues.filter(i => i.severity === 'warning');
    if (errors.length > 0 || warnings.length > 0) {
        const relativeFile = path.relative(process.cwd(), file);
        console.log(`${relativeFile}: ${errors.length} errors, ${warnings.length} warnings`);
        for (const issue of issues) {
            console.log(`  Line ${issue.line}: [${issue.severity}] [${issue.rule}] ${issue.message}`);
        }
    }
}
