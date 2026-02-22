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
        .sort((a, b) => (a.score || 0) - (b.score || 0));

    audits.forEach(a => {
        out += `${a.title} (${a.id}): score=${a.score}, value=${a.displayValue || 'null'}\n`;
        if (a.details && a.details.items) {
            a.details.items.slice(0, 5).forEach(item => {
                if (a.id === 'errors-in-console') {
                    out += `  - Error: ${item.source} | ${item.description}\n`;
                } else if (a.id === 'link-name') {
                    out += `  - Link Node: ${item.node?.snippet}\n`;
                } else if (a.id === 'heading-order') {
                    out += `  - Node: ${item.node?.snippet}\n`;
                } else if (a.id === 'color-contrast') {
                    out += `  - Node: ${item.node?.snippet} | Ratio: ${item.contrastRatio}\n`;
                } else if (a.id === 'unused-javascript' || a.id === 'unused-css-rules') {
                    out += `  - URL: ${item.url} | Wasted: ${item.wastedBytes || item.wastedMs}\n`;
                }
            });
        }
    });
    fs.writeFileSync('results_detail.txt', out, 'utf8');
} catch (e) {
    console.error(e);
}
