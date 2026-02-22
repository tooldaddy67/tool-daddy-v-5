const fs = require('fs');
const d = JSON.parse(fs.readFileSync('lighthousetest.json', 'utf8'));
const audit = d.audits['robots-txt'];
console.log(JSON.stringify(audit, null, 2));
