const E=require(process.argv[2]);const runs=JSON.parse(require('fs').readFileSync(process.argv[3]));let bad=0,first=null;
for(const r of runs){try{const x=E.replayLog(r.log);if(x.kills!==r.sum.kills||x.power!==r.sum.power){bad++;first=first||'mismatch';}}catch(e){bad++;first=first||e.message;}}
console.log('replayed in node:',runs.length,'bad',bad,first||'');
