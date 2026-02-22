const fs = require('fs');
try {
    const d = JSON.parse(fs.readFileSync('lighthousetest.json', 'utf8'));
    let out = '--- Categories ---\n';
    for (const key in d.categories) {
        const c = d.categories[key];
        out += `${c.title}: ${c.score}\n`;
    }
    out += '\n--- Top Failing Audits ---\n';
    const audits = Object.values(d.audits)
        .filter(a => a.score !== null && a.score < 0.9)
        .sort((a, b) => (a.score || 0) - (b.score || 0))
        .slice(0, 15);
    audits.forEach(a => {
        out += `${a.title} (${a.id}): score=${a.score}, value=${a.displayValue || 'null'}, details=${a.details && a.details.items ? a.details.items.length + ' items' : 'none'}\n`;
        if (a.details && a.details.type === 'opportunity') {
            a.details.items.forEach(item => {
                out += `  - ${item.url || item.node?.snippet || 'unknown'}: ${item.wastedMs}ms wasted\n`;
            });
        }
    });
    fs.writeFileSync('results.txt', out, 'utf8');
} catch (e) {
    console.error(e);
}
