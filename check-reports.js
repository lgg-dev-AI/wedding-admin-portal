const fs = require('fs');

const code = fs.readFileSync('scripts/admin-pdf-reports.js', 'utf8');
const lines = code.split('\n');

console.log('--- Scanning admin-pdf-reports.js for hardcoded percentages or mock data ---');
lines.forEach((line, idx) => {
    // Check for hardcoded width percentages like width:78%
    if (/width:\s*\d+%/i.test(line) && !line.includes('${')) {
        console.log(`Line ${idx + 1}: ${line.trim()}`);
    }
    // Check for hardcoded Mexican peso amounts like $340,000 or $850,000 in reports
    if (/\$[0-9]{2,3},[0-9]{3}/.test(line)) {
        console.log(`Hardcoded amount line ${idx + 1}: ${line.trim()}`);
    }
});
