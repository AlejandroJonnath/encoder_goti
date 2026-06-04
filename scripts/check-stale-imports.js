const fs = require('fs');
const path = require('path');
const stale = [];
function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (!['node_modules','.git','.expo','dist','android'].includes(f)) walk(full);
    } else if (f.endsWith('.ts') || f.endsWith('.tsx')) {
      const lines = fs.readFileSync(full,'utf8').split('\n');
      lines.forEach((l,i) => {
        const isStale = /from ['"](\.\.\/)+(logic|lib|styles)\//.test(l) || /require\(['"](\.\.\/)+(logic|lib|styles)\//.test(l);
        if (isStale) {
          stale.push(full.replace(process.cwd()+path.sep,'') + ':' + (i+1) + ' => ' + l.trim());
        }
      });
    }
  }
}
walk('.');
console.log(stale.length ? stale.join('\n') : 'ALL CLEAN');
