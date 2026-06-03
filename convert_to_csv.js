import fs from 'fs';
import path from 'path';
import * as xlsx from 'xlsx';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dir = path.join(__dirname, 'src', 'assets', 'project-tracker');

// Function to convert xlsx to csv
function convertToCSV(filename) {
    const filePath = path.join(dir, filename);
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }
    
    try {
        const fileData = fs.readFileSync(filePath);
        const workbook = xlsx.read(fileData, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const csvContent = xlsx.utils.sheet_to_csv(worksheet);
        
        const csvPath = path.join(dir, filename.replace('.xlsx', '.csv'));
        fs.writeFileSync(csvPath, csvContent);
        console.log(`Successfully created CSV: ${csvPath}`);
    } catch (error) {
        console.error(`Error converting ${filename}:`, error.message);
    }
}

convertToCSV('HAATZA_Project_Tracker_v2.xlsx');
convertToCSV('HAATZA_Test_Cases.xlsx');
