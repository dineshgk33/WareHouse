import * as xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Roots to check
const rootDir = path.join(__dirname, '..');
const trackerDir = path.join(rootDir, 'src', 'assets', 'project-tracker');

const files = [
    path.join(rootDir, 'Project_Tracker.xlsx'),
    path.join(trackerDir, 'HAATZA_Project_Tracker.xlsx'),
    path.join(trackerDir, 'HAATZA_Project_Tracker_v2.xlsx'),
    path.join(trackerDir, 'HAATZA_Project_Tracker_v3.xlsx'),
    path.join(trackerDir, 'HAATZA_Test_Cases.xlsx')
];

files.forEach(file => {
    if (!fs.existsSync(file)) {
        console.log(`File does not exist: ${file}`);
        return;
    }
    console.log(`\n=================== FILE: ${path.basename(file)} ===================`);
    try {
        const fileData = fs.readFileSync(file);
        const workbook = xlsx.read(fileData, { type: 'buffer' });
        console.log(`Sheet Names:`, workbook.SheetNames);
        workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const json = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
            console.log(`Sheet: ${sheetName}`);
            console.log(`Rows count: ${json.length}`);
            console.log(`Header row (first 5 rows):`);
            json.slice(0, 5).forEach((row, i) => console.log(`  Row ${i}:`, row));
        });
    } catch (err) {
        console.error(`Error reading ${file}:`, err.message);
    }
});
