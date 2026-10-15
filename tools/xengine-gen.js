// 무작위 선택·구매·강화·판매·다음 세계·사냥터까지 섞어 플레이 (같은 시드 난수로 행동을 고른다)
const E=require(process.argv[2]);const out=[];let q=12345;const R=()=>{q=(Math.imul(q,1103515245)+12345)>>>0;return q/4294967296;};
for(let t=1;t<=600;t++){const seed=(t*2246822519)>>>0;let s=E.newRun(E.makeHero(seed),0,E.mixSeed(seed,1));const log=[['start',seed,0]];let g=0;
 while(g++<6000){ if(s.dead) break; if(s.over){ if(s.conquered){ if(s.stage<4&&R()<0.3){if(E.enterHunt(s)){log.push(['h']);continue;}} if(E.advanceStage(s)){log.push(['n']);continue;} } break; }
  const x=R();
  if(x<0.05&&s.shop){const i=Math.floor(R()*s.shop.length);if(E.buy(s,i))log.push(['b',i]);}
  else if(x<0.09&&s.items.length){const i=Math.floor(R()*s.items.length);if(E.enhance(s,i))log.push(['e',i]);}
  else if(x<0.10&&s.items.length){const i=Math.floor(R()*s.items.length);if(E.sell(s,i))log.push(['s',i]);}
  if(E.STAGES[s.stage].hunt!=null&&R()<0.02){if(E.leaveHunt(s)){log.push(['l']);continue;}}
  const c=E.current(s);if(!c)break;const ok=c.options.filter(o=>!o.disabled);const o=R()<0.6?{id:E.autoChoice(s,c)}:ok[Math.floor(R()*ok.length)];E.choose(s,o.id);log.push(['c',o.id]);}
 out.push({log,sum:E.runSummary(s)});}
require('fs').writeFileSync(process.argv[3],JSON.stringify(out));console.log('runs',out.length,'max stage',Math.max(...out.map(o=>o.sum.stage)),'avg acts',Math.round(out.reduce((a,o)=>a+o.log.length,0)/out.length));
