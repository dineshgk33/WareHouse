import * as xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');
const trackerDir = path.join(rootDir, 'src', 'assets', 'project-tracker');

const files = [
    { name: 'Project_Tracker.xlsx', path: path.join(rootDir, 'Project_Tracker.xlsx') },
    { name: 'HAATZA_Project_Tracker.xlsx', path: path.join(trackerDir, 'HAATZA_Project_Tracker.xlsx') },
    { name: 'HAATZA_Project_Tracker_v2.xlsx', path: path.join(trackerDir, 'HAATZA_Project_Tracker_v2.xlsx') },
    { name: 'HAATZA_Project_Tracker_v3.xlsx', path: path.join(trackerDir, 'HAATZA_Project_Tracker_v3.xlsx') },
    { name: 'HAATZA_Test_Cases.xlsx', path: path.join(trackerDir, 'HAATZA_Test_Cases.xlsx') }
];

files.forEach(file => {
    if (!fs.existsSync(file.path)) {
        console.log(`File does not exist: ${file.path}`);
        return;
    }
    
    try {
        const fileData = fs.readFileSync(file.path);
        const workbook = xlsx.read(fileData, { type: 'buffer' });
        workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const json = xlsx.utils.sheet_to_json(worksheet);
            const outPath = path.join(__dirname, `${file.name}_${sheetName}.json`);
            fs.writeFileSync(outPath, JSON.stringify(json, null, 2));
            console.log(`Wrote sheet ${sheetName} of ${file.name} to ${outPath}`);
            if (json.length > 0) {
                console.log(`Keys for ${sheetName}:`, Object.keys(json[0]));
            }
        });
    } catch (err) {
        console.error(`Error reading ${file.name}:`, err.message);
    }
});
