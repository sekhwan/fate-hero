// ===== 운명의 용사 · 엔진 =====
const RACES = [
  {name:'인간', w:30, mod:{str:0,int:0,con:0,agi:0,cha:2,luk:0}, mult:1.0, note:'평범하지만 말이 잘 통한다'},
  {name:'엘프', w:14, mod:{str:-1,int:2,con:-1,agi:3,cha:2,luk:0}, mult:1.0, note:'민첩하고 마법에 밝다'},
  {name:'드워프', w:14, mod:{str:2,int:0,con:4,agi:-2,cha:-1,luk:0}, mult:1.0, note:'단단하고 고집스럽다'},
  {name:'오크', w:12, mod:{str:5,int:-3,con:2,agi:0,cha:-3,luk:0}, mult:1.0, note:'힘이 넘치지만 말은 안 통한다'},
  {name:'하플링', w:12, mod:{str:-3,int:1,con:0,agi:4,cha:2,luk:3}, mult:0.95, note:'작지만 운이 좋다'},
  {name:'고블린', w:8, mod:{str:-2,int:2,con:-2,agi:3,cha:-4,luk:1}, mult:0.85, note:'약하지만 영악하다'},
  {name:'용인족', w:5, mod:{str:4,int:1,con:3,agi:0,cha:0,luk:0}, mult:1.12, note:'용의 피가 흐른다'},
  {name:'반천사', w:3, mod:{str:1,int:3,con:1,agi:1,cha:4,luk:0}, mult:1.2, note:'악마에게 천적이다'},
  {name:'망자', w:2, mod:{str:1,int:1,con:5,agi:-2,cha:-5,luk:-1}, mult:1.05, note:'한 번 더 죽을 수 있다', revive:1},
];
const WEALTH = [
  {name:'빈털터리', w:38, gear:0, gold:0, desc:'나무 몽둥이 한 자루'},
  {name:'서민', w:34, gear:3, gold:20, desc:'녹슨 철검과 가죽 갑옷'},
  {name:'중산층', w:16, gear:7, gold:60, desc:'대장간 제 강철 장비'},
  {name:'부유층', w:8, gear:12, gold:150, desc:'마법이 깃든 장비'},
  {name:'귀족', w:3.3, gear:19, gold:400, desc:'가문의 보검과 호위 기사'},
  {name:'왕족', w:0.7, gear:30, gold:1000, desc:'전설급 무구와 왕실 금고'},
];
const TRAITS = [
  {name:'용사의 혈통', w:3, mult:1.25, good:true},
  {name:'신의 가호', w:3, revive:1, good:true},
  {name:'타고난 검술가', w:7, mult:1.1, good:true},
  {name:'불굴의 의지', w:7, hp:0.25, good:true},
  {name:'전술의 천재', w:6, xp:0.5, good:true},
  {name:'달변가', w:6, talk:0.08, good:true},
  {name:'평범함', w:30, good:null},
  {name:'겁쟁이', w:9, mult:0.9, flee:0.15, good:false},
  {name:'길치', w:8, flee:-0.15, good:false},
  {name:'허약 체질', w:8, hp:-0.25, good:false},
  {name:'저주받은 운명', w:4, luk:-4, good:false},
  {name:'술고래', w:10, mult:0.95, good:false},
];
const HIDDEN = [
  {title:'전생한 마왕', race:'마족', note:'한때 악마들의 왕이었다. 악마들이 옛 주인을 알아본다.', job:'마왕', boost:{str:8,int:10,con:8,agi:6,cha:12,luk:4}, mult:3.2, talk:0.35},
  {title:'검성', race:'인간', note:'천 년에 한 번 나는 검의 성인.', job:'검성', boost:{str:14,int:4,con:8,agi:12,cha:4,luk:4}, mult:3.6},
  {title:'용왕의 후계자', race:'용인족', note:'고룡의 심장을 이어받았다.', job:'용기사', boost:{str:12,int:6,con:16,agi:4,cha:6,luk:4}, mult:3.3, hp:1.0, revive:1},
  {title:'별에서 온 아이', race:'성인(星人)', note:'이 세계의 법칙이 잘 통하지 않는다.', job:'성운술사', boost:{str:6,int:14,con:8,agi:8,cha:8,luk:14}, mult:3.0, revive:2},
];
const HEROINES=[
  {name:'성녀 엘리나', d:'지역을 넘을 때마다 생명력 30% 회복, 죽음에서 1회 구원', regen:0.3, save:1, meet:'마물에게 쫓기던 성녀 엘리나를 발견했다.'},
  {name:'마녀 릴리스', d:'회유 성공률 +15%p, 전투력 +10%', talk:0.15, mult:1.1, meet:'마녀 사냥꾼들에게 포위된 마녀 릴리스를 발견했다.'},
  {name:'여기사 세라', d:'전투력 +20%', mult:1.2, meet:'홀로 오우거와 싸우는 여기사 세라를 발견했다.'},
  {name:'엘프 궁수 아리엔', d:'전투력 +12%, 도망 성공률 +10%p', mult:1.12, flee:0.1, meet:'덫에 걸린 엘프 궁수 아리엔을 발견했다.'},
];
const FRIENDS=[
  {name:'떠돌이 검사 카일', d:'전투력 +12%, 죽음의 일격을 1회 대신 막아줌', mult:1.12, save:1, meet:'주점에서 떠돌이 검사 카일이 함께 가자고 한다.'},
  {name:'드워프 대장장이 브론', d:'지역을 넘을 때마다 무작위 능력치 +1', forge:1, meet:'드워프 대장장이 브론이 네 무기를 보더니 혀를 찬다.'},
  {name:'도둑 레오', d:'도망 성공률 +20%p, 금화 획득 2배', flee:0.2, gold:2, meet:'도둑 레오가 네 지갑을 훔치려다 붙잡혔다.'},
  {name:'수도사 한', d:'전투력 +5%, 승리할 때마다 생명력 10% 회복', mult:1.05, heal:0.1, meet:'길 위에서 탁발하는 수도사 한을 만났다.'},
];
const PETS=[
  {name:'아기 드래곤 루비', d:'전투력 +8%, 지역마다 2%씩 성장', mult:1.08, grow:0.02, meet:'부서진 알 껍질 옆에서 아기 드래곤이 울고 있다.'},
  {name:'늑대 회색이', d:'전투력 +6%, 도망 실패 시 1회 구출', mult:1.06, fleeSave:1, meet:'덫에 다리가 걸린 회색 늑대가 으르렁거린다.'},
  {name:'요정 반딧불', d:'행운 +4, 함정을 피하게 해줌', luk:4, trap:1, meet:'유리병에 갇힌 요정이 창을 두드린다.'},
  {name:'검은 고양이 망토', d:'승리확률 30% 미만 싸움에서 승리확률 +6%p', underdog:0.06, meet:'검은 고양이 한 마리가 계속 뒤를 따라온다.'},
];
const QUESTS=[
  {giver:'영주', rel:'영주의 딸 리아', task:'영지를 습격하는 오우거 군단', min:30},
  {giver:'마법사 길드장', rel:'길드장의 제자 노엘', task:'금서를 훔친 리치', min:50},
  {giver:'왕', rel:'공주 이사벨', task:'왕도를 위협하는 마룡', min:80},
  {giver:'대주교', rel:'대성당의 성녀 마리엘', task:'대성당 지하의 고위 악마', min:110},
];
const FAME_TITLES=[[-1e9,'악명 높은 자'],[0,'무명'],[20,'마을의 이름'],[60,'지방의 영웅'],[150,'왕국의 영웅'],[400,'살아있는 전설']];
function fameTitle(f){let t=FAME_TITLES[0][1];for(const [m,n] of FAME_TITLES) if(f>=m) t=n; return t;}
const DEMON_W=1.12;
let HUNT_START=0.3; let FINAL_X=0.8; let FINAL_TRIES=3; let LVL_B=0.12; let FLOOR=0.12; let LATE=1; let BOSS_X=0.82;
const EXPLORE_TXT=[
  ['이끼 낀 동굴 입구가 보인다.','무너진 성채의 지하로 내려가는 계단이 있다.','안개 낀 늪지대가 펼쳐져 있다.','버려진 광산 갱도가 입을 벌리고 있다.'],
  ['뼈로 쌓은 탑이 서 있다.','재가 내리는 폐허 도시가 보인다.','망자들의 무덤이 끝없이 이어진다.'],
  ['살아 숨 쉬는 듯한 붉은 숲이 있다.','악마의 궁전 회랑이 끝없이 뻗어 있다.','황금으로 된 미궁의 입구가 보인다.'],
  ['빛이 사라지는 균열이 보인다.','거꾸로 흐르는 강이 있다.'],
  ['깨진 거울 조각들이 공중에 떠 있다.','옥좌로 이어지는 그림자 회랑이 있다.'],
  ['쓰러진 영웅들의 무기가 꽂힌 언덕이 있다.','되살아난 악마들의 둥지가 보인다.','층과 층 사이의 틈이 열려 있다.']];
const TRAPS=['발밑이 꺼지며 가시 함정에 떨어졌다.','독침이 벽에서 튀어나왔다.','천장이 무너져 내렸다.','미믹이 정체를 드러내며 물어뜯었다.','저주받은 안개를 들이마셨다.'];
const FORTUNES=[
  {t:'은둔한 검의 달인을 만나 비기를 전수받았다.', mult:1.12, x:'비기 전수: 전투력 +12%'},
  {t:'샘물을 마시자 몸속 깊은 곳이 뜨거워졌다.', all:2, x:'영천: 모든 능력치 +2'},
  {t:'고대 마법진 위에서 잠들었다 깨어나니 몸이 가볍다.', lvl:2, x:'각성: 레벨 +2'},
  {t:'천 년 묵은 영약을 발견해 삼켰다.', con:5, x:'영약: 체력 +5'},
  {t:'죽은 영웅의 혼이 깃든 반지를 주웠다.', revive:1, x:'영웅의 반지: 부활 1회'}];
const STAT_KEYS=['str','int','con','agi','cha','luk'];
const STAT_NAMES={str:'힘',int:'지능',con:'체력',agi:'민첩',cha:'매력',luk:'행운'};
const GRADES=[
  {id:0,name:'일반',cls:'g0',stat:2,mult:1.04,gold:40,fame:0},
  {id:1,name:'희귀',cls:'g1',stat:5,mult:1.10,gold:130,fame:25},
  {id:2,name:'영웅',cls:'g2',stat:11,mult:1.25,gold:420,fame:70},
  {id:3,name:'전설',cls:'g3',stat:27,mult:1.7,gold:1400,fame:180},
];
const ITEM_NAMES={
  str:['녹슨 장검','기사의 장검','불꽃의 대검','용살검 그람'],
  con:['나무 방패','강철 방패','마귀 뼈 방패','아이기스'],
  agi:['가죽 장화','바람의 장화','그림자 망토','헤르메스의 날개'],
  int:['낡은 마법서','현자의 지팡이','현자의 눈','솔로몬의 열쇠'],
  cha:['깨끗한 망토','은빛 브로치','고블린 왕관','태양왕의 관'],
  luk:['네잎클로버','행운의 금화','요정의 종','운명의 주사위'],
  mult:['사냥꾼의 부적','퇴마사의 인장','악마 사냥꾼의 문장','성검 엑스칼리버'],
  win:['전투의 부적','승리의 깃발','전쟁신의 휘장','니케의 날개'],
  flee:['연막탄 주머니','도망자의 장화','바람의 반지','차원 도약석'],
};
// 세계마다 다른 장비 세트. tier 0 지상계 ~ 4 공허의 옥좌(끝없는 전장도 4)
const TIER_PRE=[null,['망자의','저승의','명계의','하데스의'],['타락한','죄악의','대죄의','루시퍼의'],['공허한','심연의','별을 삼킨','심연왕의'],['원초의','태초의','창세의','신살자의']];
const TIER_NOUN=[null,
  {str:'뼈칼',con:'해골 방패',agi:'그림자 장화',int:'사령서',cha:'창백한 가면',luk:'저승 동전',mult:'영혼 인장',win:'사신의 깃발',flee:'안개 망토'},
  {str:'마검',con:'마갑',agi:'박쥐 날개',int:'금서',cha:'유혹의 반지',luk:'악마의 주사위',mult:'지옥불 인장',win:'마왕의 군기',flee:'연옥의 열쇠'},
  {str:'흑요석 대검',con:'무저갱 방패',agi:'허공 걸음',int:'바라보는 눈',cha:'침묵의 관',luk:'꺼진 별',mult:'혼돈의 핵',win:'종말의 나팔',flee:'균열석'},
  {str:'신검',con:'성벽',agi:'날개',int:'진리서',cha:'왕관',luk:'운명석',mult:'근원 인장',win:'승리의 관',flee:'차원문'}];
const TIER_NAME=['지상계','지하 세계','마계','심연','공허'];
const TIER_STAT=[1,1.9,3.3,5.5,8.5];
function tierOf(s){return Math.min(worldOf(s.stage),4);}
function itemNameOf(k,grade,tier){return tier?`${TIER_PRE[tier][grade]} ${TIER_NOUN[tier][k]}`:ITEM_NAMES[k][grade];}
function makeItem(r,grade,kind,tier){
  tier=tier||0; const g=GRADES[grade];
  if(kind==='heal') return {name:'성수 한 병',grade:0,heal:1,d:'쓰러질 때 생명력 40% 회복'};
  if(kind==='revive') return {name:'부활의 깃털',grade:Math.max(1,grade),revive:1,d:'사망 시 1회 부활'};
  const keys=['str','con','agi','int','cha','luk','mult','win','flee'];
  const k=kind||keys[Math.floor(r()*keys.length)];
  const base={grade,tier};
  if(k==='mult'){const m=1+(g.mult-1)*(1+0.45*tier);return Object.assign(base,{name:itemNameOf('mult',grade,tier),mult:m,d:`전투력 +${Math.round((m-1)*100)}%`});}
  if(k==='win'){const v=[0.02,0.04,0.06,0.10][grade];return Object.assign(base,{name:itemNameOf('win',grade,tier),win:v,d:`승리확률 +${Math.round(v*100)}%p`});}
  if(k==='flee'){const v=[0.05,0.12,0.22,0.45][grade];return Object.assign(base,{name:itemNameOf('flee',grade,tier),flee:v,d:`도망 확률 +${Math.round(v*100)}%p`});}
  const sv=(k==='cha'||k==='luk')?[1,3,6,12][grade]:Math.round(g.stat*TIER_STAT[tier]);
  return Object.assign(base,{name:itemNameOf(k,grade,tier),stat:k,v:sv,d:`${STAT_NAMES[k]} +${sv}`});
}
function rollGrade(r,bonus){const b=clamp(bonus||0,0,1);const w=[70*(1-0.5*b),26+6*b,GW[0]+GW[1]*b,GW[2]+GW[3]*b];let v=r()*w.reduce((a,c)=>a+c,0);for(let i=0;i<4;i++){if((v-=w[i])<=0)return i;}return 0;}
function makeShop(s){
  const r=s.r, sc=rs(s,1.3)*(1+s.stage), out=[];
  const tr=tierOf(s);
  if(r()<0.5) out.push({item:makeItem(r,0,'heal'),cur:'gold',price:Math.round(110*sc*(1-SKV.discount*sk(s,'merchant')))});
  const dc=1-SKV.discount*sk(s,'merchant');
  for(let i=0;i<2;i++){const g=rollGrade(r,0.1+SKV.appraise*sk(s,'appraise'));out.push({item:makeItem(r,g,null,tr),cur:'gold',price:Math.round(GRADES[g].gold*sc*dc)});}
  for(let i=0;i<2;i++){const x=r();const gg=x<0.006?3:x<0.12?2:1;out.push({item:makeItem(r,gg,null,tr),cur:'fame',price:Math.round(GRADES[gg].fame*(1+s.stage*0.5))});}
  if(r()<0.12) out.push({item:makeItem(r,1,'revive'),cur:'fame',price:Math.round(80*(1+s.stage*0.5))});
  return out;
}
function slotOf(it){return it.stat||(it.mult?'mult':it.win?'win':it.flee?'flee':null);}
// 강화: +10이면 기본 수치의 3배
const ENH_BONUS=[0,0.15,0.35,1.5,3,5,8,12,18,26,40];
const ENH_RATE=[0.9,0.8,0.7,0.6,0.5,0.4,0.33,0.26,0.2,0.15];
const ENH_BREAK={1:1,2:1,3:1,4:1,5:1,6:1,7:1,8:1,9:1};
const GRADE_ENH=[0.15,0.35,0.7,1.0]; // 등급별 강화 효율: 일반 15%, 희귀 35%, 영웅 70%, 전설 100%
let ENH_SCALE=0.6;
function enhB(it){return ENH_BONUS[it.plus||0]*GRADE_ENH[it.grade||0]*ENH_SCALE;}
function enhF(it){return 1+enhB(it);}
function effV(it){const b=it.boost||1;if(b!==1&&it.v){const r=effVRaw(it);return Math.max(r,Math.round(r*b));}return effVRaw(it);}
function effVRaw(it){if(!it.v)return 0;const pl=it.plus||0,soft=it.stat==='cha'||it.stat==='luk';return Math.max(it.v+pl,Math.round(it.v*(soft?1+enhB(it)*0.2:enhF(it))));} // 강화 1단계마다 최소 +1
function effMult(it){const m=effMultRaw(it);return 1+(m-1)*(it.boost||1);}
function effMultRaw(it){if(!it.mult)return 1;const pl=it.plus||0;return 1+Math.max((it.mult-1)*enhF(it),(it.mult-1)+0.01*pl);}
function effWin(it){return effWinRaw(it)*(it.boost||1);}
function effWinRaw(it){if(!it.win)return 0;const pl=it.plus||0;return Math.max(it.win*(1+enhB(it)*0.2),it.win+0.005*pl);}
function effFlee(it){return effFleeRaw(it)*(it.boost||1);}
function effFleeRaw(it){if(!it.flee)return 0;const pl=it.plus||0;return Math.max(it.flee*enhF(it),it.flee+0.01*pl);}
function itemVal(it){return it.v?effV(it):it.mult?effMult(it)-1:it.win?effWin(it):it.flee?effFlee(it):0;}
function itemName(it){return (it.plus?`+${it.plus} `:'')+it.name;}
function itemDescAt(it,plus){const c=Object.assign({},it,{plus});return itemDesc(c);}
function itemDesc(it){if(it.heal||it.revive)return it.d;if(it.stat)return `${STAT_NAMES[it.stat]} +${effV(it)}`;if(it.mult)return `전투력 +${Math.round((effMult(it)-1)*100)}%`;if(it.win)return `승리확률 +${(effWin(it)*100).toFixed(it.plus?1:0)}%p`;return `도망 확률 +${(effFlee(it)*100).toFixed(it.plus?1:0)}%p`;}
const ENH_BASE=[20,35,60,100];
function enhCost(s,it){const sc=rs(s,1.22)*(1+s.stage*0.8);return Math.round(ENH_BASE[it.grade||0]*(1+0.6*(it.plus||0))*sc);}
function canEnhance(it){return !!slotOf(it)&&(it.plus||0)<10;}
function enhance(s,idx){
  const it=s.items[idx]; if(!it||!canEnhance(it)) return null;
  const cost=enhCost(s,it); if(s.gold<cost) return null;
  s.gold-=cost; const from=it.plus||0; const rate=Math.min(0.95,ENH_RATE[from]+SKV.smith*sk(s,'smith')+SKV.mEnh[mastery(s,'재물')]); const roll=s.r();
  applyItem(s,it,-1);
  let res;
  if(roll<rate){ it.plus=from+1; res={ok:true,from,to:it.plus}; }
  else if(ENH_BREAK[from] && s.r()<ENH_BREAK[from] && !(sk(s,'ward')&&s.r()<SKV.ward*sk(s,'ward'))){ s.items.splice(idx,1); return {ok:false,destroyed:true,from,cost,name:it.name}; }
  else if(from>=3||(ENH_BREAK[from]&&sk(s,'ward'))){ it.plus=Math.max(0,from-1); res={ok:false,from,to:it.plus,warded:from<3||undefined}; }
  else res={ok:false,from,to:from};
  applyItem(s,it,1); res.cost=cost; res.name=it.name; res.it=it; return res;
}
function applyItem(s,it,sign){
  if(it.stat){s.stats[it.stat]=Math.max(1,s.stats[it.stat]+sign*effV(it)); if(it.stat==='con'){const o=s.maxHp;s.maxHp=hpMax(s);s.hp=sign>0?s.hp+(s.maxHp-o):Math.min(s.hp,s.maxHp);}}
  if(it.mult){const m=effMult(it); s.multItems*=sign>0?m:1/m;}
}
// 같은 부위(능력치·전투력·승률·도망)는 하나만 착용한다. 더 좋은 것이 들어오면 기존 것은 자동으로 판다.
function wouldUpgrade(s,it){const slot=slotOf(it);if(!slot)return true;it.boost=1+SKV.mItem[mastery(s,'재물')];const old=s.items.find(x=>slotOf(x)===slot);return !old||itemVal(it)>itemVal(old);}
function equip(s,it){
  s.lastEquipNote=null; const slot=slotOf(it); if(slot) it.boost=1+SKV.mItem[mastery(s,'재물')];
  if(slot){ const idx=s.items.findIndex(x=>slotOf(x)===slot);
    if(idx>=0){ const old=s.items[idx];
      if(itemVal(it)<=itemVal(old)){ const g=sellPrice(s,it); s.gold+=g; s.lastEquipNote=`이미 더 좋은 ${old.name}을(를) 착용 중이라 금화 ${g}에 팔았다`; return false; }
      applyItem(s,old,-1); s.items.splice(idx,1); const g=sellPrice(s,old); s.gold+=g; s.lastEquipNote=`${old.name}을(를) 교체하고 금화 ${g}에 팔았다`; } }
  applyItem(s,it,1); s.items.push(it); return true;
}
function sellPrice(s,it){const sc=rs(s,1.3)*(1+s.stage);return Math.max(5,Math.round((it.heal?110:GRADES[it.grade||0].gold)*sc*0.4*(1+0.6*(it.plus||0))));}
function sell(s,idx){
  const it=s.items[idx]; if(!it) return null;
  applyItem(s,it,-1);
  const g=sellPrice(s,it); s.items.splice(idx,1); s.gold+=g; return {it,g};
}
function buy(s,idx){
  const o=s.shop&&s.shop[idx]; if(!o||o.sold) return null;
  const have=o.cur==='gold'?s.gold:s.fame; if(have<o.price||!wouldUpgrade(s,o.item)) return null;
  if(o.cur==='gold') s.gold-=o.price; else s.fame-=o.price;
  o.sold=true; o.item.src=o.cur==='gold'?'상점 구매 (금화)':'상점 구매 (명성)'; o.item.where=placeName(s); equip(s,o.item); return o.item;
}
const MINIONS=[
  ['임프','고블린','해골 병사','구울','하피','늑대인간','가고일','오우거','저주받은 기사','서큐버스'],
  ['망령','재의 병사','지옥견','켄타우로스 학살자','역병 파리떼','뼈 거인','불꽃 악귀','고문관'],
  ['색욕의 사도','탐식의 괴물','황금 골렘','나태의 망령','질투의 뱀','분노의 투사','교만의 천사'],
  ['공허 포식자','이름 없는 것','시간의 망령','별을 삼킨 짐승','심연의 눈알'],
  ['최후의 근위병','거울 속의 나','원초의 그림자'],
  ['되살아난 임프 군단','망령 기사단','죄악의 화신','공허 포식자 무리','원초의 그림자','거울 속의 나','지옥견 떼','타락한 성기사단'],
];
const STAGES = [
  {name:'지상계', sub:'인간 세상에 숨어든 악마들', total:6660000, base:32, growth:1.23, regions:[
    ['동네 뒷산','임프 대장'],['시골 마을','타락한 촌장'],['항구 도시','바다 마귀'],['동아시아','구미호'],['동남아시아','정글의 락샤사'],
    ['남아시아','라바나의 후예'],['중동 사막','이프리트'],['북아프리카','모래 골렘왕'],['동유럽','흡혈 백작'],['서유럽','타락한 성기사장'],
    ['북유럽','서리 거인'],['시베리아','설원의 마왕'],['아메리카 대륙','웬디고'],['남극 빙하 아래','고대 악마'],['지옥문','케르베로스']]},
  {name:'지하 세계', sub:'지옥문 너머, 죽은 자의 땅', total:13320000, base:30, growth:1.2, regions:[
    ['망각의 강','뱃사공의 망령'],['비명의 숲','자살나무 정령'],['재의 평원','재의 기사'],['불타는 도시 디스','이단 심문관'],['얼음 호수','배신자들의 군주'],
    ['피의 강','켄타우로스 왕'],['역병의 늪','파리 대왕'],['거짓의 골짜기','기만의 대공'],['탐욕의 금고','금고지기'],['분노의 투기장','지옥 검투사'],
    ['교만의 첨탑','루시퍼의 그림자'],['지하 세계 왕좌','하데스의 섭정']]},
  {name:'마계', sub:'악마들이 태어나는 근원', total:26640000, base:30, growth:1.3, regions:[
    ['마계 1층 · 색욕','아스모데우스'],['마계 2층 · 탐식','벨제붑'],['마계 3층 · 탐욕','맘몬'],['마계 4층 · 나태','벨페고르'],
    ['마계 5층 · 질투','레비아탄'],['마계 6층 · 분노','사탄'],['마계 7층 · 교만','루시퍼'],['마계 핵','칠대죄의 합일체']]},
  {name:'심연', sub:'이름조차 없는 것들이 사는 곳', total:66600000, base:30, growth:1.4, regions:[
    ['무저갱의 가장자리','이름 없는 자'],['끝없는 낙하','공허 포식자'],['시간이 멈춘 곳','종말의 시계공'],['별이 꺼진 하늘','별을 삼킨 자'],
    ['심연의 눈','바라보는 자'],['원초의 혼돈','태초의 악']]},
  {name:'공허의 옥좌', sub:'모든 악의 시작과 끝', total:666000000, base:36, growth:2.0, regions:[
    ['옥좌로 가는 계단','최후의 근위대장'],['거울의 방','또 하나의 나'],['공허의 옥좌','악의 근원']]},
  {name:'끝없는 전장', sub:'쓰러뜨린 악들이 끝없이 되살아나는 곳', endless:true, total:1, base:70, growth:1.12, regions:[]},
];
{ // 끝없는 전장: 300층. 층마다 이전 세계 지배자들의 망령이 수문장으로 나온다.
  const bosses=[];for(let k=0;k<5;k++) STAGES[k].regions.forEach(rg=>bosses.push(rg[1]));
  for(let f=1;f<=300;f++) STAGES[5].regions.push([`끝없는 전장 ${f}층`,`${bosses[(f*7)%bosses.length]}의 망령`+(f>=bosses.length?` (${Math.floor(f/bosses.length)+1}회차)`:'')]);
}
// 세계별 사냥터: 지배자를 쓰러뜨린 세계에 남아 더 강해지는 곳. stage 6~9 = 지상계~심연 사냥터
const HUNT_BASE=6;
for(let k=0;k<4;k++){
  const W=STAGES[k], regs=[];
  for(let f=1;f<=300;f++){const rg=W.regions[(f-1)%W.regions.length];regs.push([`${W.name} 사냥터 ${f}층`,`되살아난 ${rg[1]}`+(f>W.regions.length?` (${Math.ceil(f/W.regions.length)}회차)`:'')]);}
  STAGES.push({name:`${W.name} 사냥터`,sub:'쓰러뜨린 악마들이 다시 몰려드는 곳. 원할 때 다음 세계로 떠날 수 있다',endless:true,hunt:k,total:1,base:W.base,growth:1.08,regions:regs});
}
function worldOf(stIdx){const st=STAGES[stIdx];return st.hunt!=null?st.hunt:stIdx;}

function rng(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function pick(r,arr){const tot=arr.reduce((s,x)=>s+x.w,0);let v=r()*tot;for(const x of arr){if((v-=x.w)<=0)return x;}return arr[arr.length-1];}
function d6(r,n){let s=0;for(let i=0;i<n;i++)s+=1+Math.floor(r()*6);return s;}
function gauss(r){return Math.sqrt(-2*Math.log(r()+1e-12))*Math.cos(2*Math.PI*r());}
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

// ===== 스킬 =====
// 레벨업과 지배자 처치 때마다 3개 중 1개를 고른다. 같은 스킬은 3랭크까지.
let SKV={blade:0.16,giant:0.15,boss:0.10,command:0.05,cmdcap:2,cmdHire:3,grit:0.6,flee:0.5,talk:0.5,camp:0.5,scholar:0.3,fame:1.2,famecap:0.15,lucky:6,charm:9,treasure:2.0,appraise:0.25,smith:0.1,ward:0.45,merchant:2.0,discount:0.12,startPicks:0,conquerPicks:1,pickFrom:3,pickEvery:2,mT1:3,mT2:6,mPow:[0,0.12,0.5],mGold:[0,0.3,0.8],mEnh:[0,0.03,0.1],mStat:[0,5,15],mDmg:[0,0.5,0.8],mXp:[0,0.5,1.5],mItem:[0,0.45,1.1],mGrit:[0,0.15,0.4],mRetry:[1.05,0.88,0.75]};
const ROLES=['전투','생존','성장','재물'];
const MASTERY={'전투':t=>`전투력 +${Math.round(SKV.mPow[t]*100)}%`,'생존':t=>`부활 +1, 받는 피해 -${Math.round(SKV.mDmg[t]*100)}%, 최종 지배자 재도전 +${t}, 재도전마다 지배자 약화 ${Math.round((1-SKV.mRetry[t])*100)}%, 생명력 절반 이하일 때 전투력 +${Math.round(SKV.mGrit[t]*100)}%`,'성장':t=>`모든 능력치 +${SKV.mStat[t]}, 경험치 +${Math.round(SKV.mXp[t]*100)}%`,'재물':t=>`장비 효과 +${Math.round(SKV.mItem[t]*100)}%, 금화 +${Math.round(SKV.mGold[t]*100)}%, 강화 확률 +${Math.round(SKV.mEnh[t]*100)}%p`};
function roleRanks(s,role){let v=0;for(const k in (s.skills||{})) if(SKILL_BY[k]&&SKILL_BY[k].role===role) v+=s.skills[k];return v;}
function mastery(s,role){const v=roleRanks(s,role);return v>=SKV.mT2?2:v>=SKV.mT1?1:0;}
let GW=[2,5,0.06,0.6]; // 영웅·전설 가중치(기본, 보너스 비례)
let FRESH_SK=[1,0.754,0.742,0.963,0.373,1];
let DIFF=[0.934,1.421,1.43,1.099,2.467,0.7];
const SKILLS=[
  {id:'blade',role:'전투',name:'검술',d:r=>`전투력 +${Math.round(SKV.blade*r*100)}%`},
  {id:'giant',role:'전투',name:'거인 사냥',d:r=>`승률 60% 미만인 싸움에서 승률 +${Math.round(SKV.giant*r*100)}%p`},
  {id:'boss',role:'전투',name:'지배자 사냥',d:r=>`지배자전 승률 +${Math.round(SKV.boss*r*100)}%p`},
  {id:'command',role:'전투',name:'지휘',d:r=>`즉시 용병 ${SKV.cmdHire}명 합류, 용병 1명당 전투력 ${4+Math.round(SKV.command*r*100)}%, 용병 상한 +${SKV.cmdcap*r}`},
  {id:'grit',role:'생존',name:'질긴 목숨',d:r=>`세계마다 ${r}번, 쓰러질 때 생명력 ${Math.round(SKV.grit*100)}%로 버틴다`},
  {id:'flee',role:'생존',name:'도주술',d:r=>`도망 확률 +${Math.round(SKV.flee*r*100)}%p, 도망쳐도 명성이 줄지 않는다`},
  {id:'talk',role:'생존',name:'설득',d:r=>`회유 확률 +${Math.round(SKV.talk*r*100)}%p`},
  {id:'camp',role:'생존',name:'야영',d:r=>`휴식 회복 +${Math.round(SKV.camp*r*100)}%p, 밤 습격 없음, 수련 시 능력치 +${1+r}`},
  {id:'scholar',role:'성장',name:'학자',d:r=>`경험치 +${Math.round(SKV.scholar*r*100)}%`},
  {id:'fame',role:'성장',name:'명성가',d:r=>`전투 명성 +${Math.round(SKV.fame*r*100)}%, 명성 승률 상한 +${Math.round(SKV.famecap*r*100)}%p`},
  {id:'lucky',role:'성장',name:'행운아',d:r=>`행운 +${SKV.lucky*r}, 세계의 행운 저항 -${SKV.lucky*r}`},
  {id:'charm',role:'성장',name:'매혹',d:r=>`매력 +${SKV.charm*r}, 세계의 매력 저항 -${SKV.charm*r}`},
  {id:'treasure',role:'재물',name:'보물 사냥',d:r=>`아이템 발견 +${Math.round(SKV.treasure*r*100)}%`},
  {id:'appraise',role:'재물',name:'감정안',d:r=>`발견·상점 아이템 등급 상향 (+${Math.round(SKV.appraise*r*100)}%)`},
  {id:'smith',role:'재물',name:'대장장이',d:r=>`강화 확률 +${Math.round(SKV.smith*r*100)}%p`},
  {id:'ward',role:'재물',name:'수호 각인',d:r=>`강화 실패 시 ${Math.round(SKV.ward*r*100)}% 확률로 파괴 대신 1단계 하락`},
  {id:'merchant',role:'재물',name:'상인',d:r=>`금화 +${Math.round(SKV.merchant*r*100)}%, 상점 가격 -${Math.round(SKV.discount*r*100)}%`},
];
const SKILL_BY={};SKILLS.forEach(x=>SKILL_BY[x.id]=x);
const SK_MAX=3;
function sk(s,id){return (s&&s.skills&&s.skills[id])||0;}
// 세계 특성: 같은 빌드가 끝까지 통하지 않게 한다
const WORLD_TRAITS=[null,
  {id:'wraith',name:'망령',d:'일반 전투의 절반에서 도망칠 수 없다'},
  {id:'sin',name:'대죄',d:'회유 확률이 절반으로 줄어든다'},
  {id:'elder',name:'고위 악마',d:'행운과 매력 저항이 두 배다'},
  {id:'curse',name:'저주',d:'장비 효과가 15% 줄어든다'},
  {id:'curse',name:'저주',d:'장비 효과가 15% 줄어든다'}];
function wtrait(s){const t=WORLD_TRAITS[worldOf(s.stage)];return t?t.id:null;}
function queueSkill(s){
  if(s.dead||s.over||!(s.pendingPicks>0)) return;
  if(s.queue.length&&s.queue[0].type==='skill') return;
  const pool=SKILLS.filter(x=>sk(s,x.id)<SK_MAX).map(x=>x.id); if(!pool.length){s.pendingPicks=0;return;}
  const offers=[];while(offers.length<Math.min(3,pool.length)){const id=pool[Math.floor(s.r()*pool.length)];if(!offers.includes(id))offers.push(id);}
  s.queue.unshift({type:'skill',offers,auto:offers[Math.floor(s.r()*offers.length)]});
}
function learnSkill(s,id,out){
  s.skills=s.skills||{}; const role=SKILL_BY[id].role, m0=mastery(s,role); s.skills[id]=(s.skills[id]||0)+1; s.pendingPicks--; const m1=mastery(s,role);
  if(id==='lucky') s.stats.luk+=SKV.lucky; if(id==='charm') s.stats.cha+=SKV.charm;
  if(id==='grit') s.gritLeft=(s.gritLeft||0)+1;
  if(id==='command'){const add=Math.min(SKV.cmdHire,mercCap(s)-s.allies);if(add>0){s.allies+=add;out.push({t:'good',x:`용병 ${add}명 합류 (총 ${s.allies}명)`});}}
  out.push({t:'item g2',x:`스킬 습득: ${SKILL_BY[id].name} ${s.skills[id]}랭크 (${SKILL_BY[id].d(s.skills[id])})`});
  if(m1>m0&&role==='재물'){ for(const it of s.items){ if(!slotOf(it)) continue; applyItem(s,it,-1); it.boost=1+SKV.mItem[m1]; applyItem(s,it,1);} }
  if(m1>m0){ if(role==='생존') s.revive++; if(role==='성장'){const v=SKV.mStat[m1]-SKV.mStat[m0];STAT_KEYS.forEach(k=>s.stats[k]+=v);const o=s.maxHp;s.maxHp=hpMax(s);s.hp+=Math.max(0,s.maxHp-o);}
    out.push({t:'item g3',x:`${role} 숙련 ${m1}단계 달성: ${MASTERY[role](m1)}`}); }
}
function curseF(s){return wtrait(s)==='curse'?0.85:1;}
function itemStatSum(s,k){let v=0;for(const it of s.items) if(it.stat===k) v+=effV(it);return v;}

function makeHero(seed){
  const r=rng(seed);
  const race=pick(r,RACES), wealth=pick(r,WEALTH);
  const stats={};
  for(const k of STAT_KEYS) stats[k]=Math.max(1,d6(r,3)+(race.mod[k]||0));
  if(r()<0.06){const k=STAT_KEYS[Math.floor(r()*6)];stats[k]+=4+Math.floor(r()*5);}
  const traits=[];const n=r()<0.35?2:1;
  while(traits.length<n){const t=pick(r,TRAITS);if(!traits.includes(t)&&!(t.name==='평범함'&&n===2))traits.push(t);}
  for(const t of traits) if(t.luk) stats.luk=Math.max(1,stats.luk+t.luk);
  const jobs={str:'전사',int:'마법사',agi:'도적',con:'성기사',cha:'음유시인',luk:'도박사'};
  const top=STAT_KEYS.slice().sort((a,b)=>stats[b]-stats[a])[0];
  const n1=['아르','벨','카이','루','세','오','미','타','엘','도','하','진','라','누','이','소','유'];
  const n2=['델','린','온','라','안','렌','스','아','혼','윤','크','엘','미르','토','빈'];
  const name=n1[Math.floor(r()*n1.length)]+n2[Math.floor(r()*n2.length)];
  if(r()<0.001){ // 히든 영웅 0.1%
    const H=HIDDEN[Math.floor(r()*HIDDEN.length)];
    for(const k of STAT_KEYS) stats[k]=Math.max(stats[k],10)+H.boost[k];
    const ht={name:H.title,w:0,mult:H.mult,talk:H.talk||0,hp:H.hp||0,revive:H.revive||0,good:'hidden'};
    return {seed,name,race:{...race,name:H.race,note:H.note,mult:1,revive:0},wealth:WEALTH[5],stats,traits:[ht,...traits.filter(t=>t.good!==false)],job:H.job,hidden:H};
  }
  return {seed,name,race,wealth,stats,traits,job:jobs[top]};
}
function traitSum(h,key,base){let v=base;for(const t of h.traits){if(t[key]!=null)v=(key==='mult')?v*t[key]:v+t[key];}return v;}

// ----- Run state -----
function newRun(hero, stageIdx, seed){
  const r=rng(seed);
  const s={hero,stage:stageIdx,r,stats:{...hero.stats},items:[],allies:0,lvl:1,xp:0,gold:hero.wealth.gold,
    revive:(hero.race.revive||0)+traitSum(hero,'revive',0),region:-1,queue:[],killed:0,regionKilled:[],dead:false,cleared:false,
    stageCarry:Math.pow(2.5,stageIdx), multItems:1, decisions:0, wins:0, upsets:0,
    fame:WEALTH.indexOf(hero.wealth)*5+(hero.hidden?50:0), comp:{heroine:null,friend:null,pet:null}, saves:{}, petGrow:1, spouse:null, quests:0,
    skills:{}, pendingPicks:SKV.startPicks, gritLeft:0};
  if(stageIdx>0){ s.enemyCarry=s.stageCarry*FRESH[stageIdx]*FRESH_SK[stageIdx]; s.carryBase=s.enemyCarry; }
  s.maxHp=hpMax(s); s.hp=s.maxHp;
  nextRegion(s); queueSkill(s);
  return prime(s);
}
function hpMax(s){return Math.round((40+s.stats.con*6)*(1+traitSum(s.hero,'hp',0))*(1+0.05*(s.lvl-1)));}
function power(s){
  const t=s.stats;
  const cf=curseF(s); const ic=k=>cf<1?(1-cf)*itemStatSum(s,k):0;
  const base=(t.str-ic('str'))*1.3+(t.agi-ic('agi'))*1.05+(t.int-ic('int'))*1.15+(t.con-ic('con'))*0.95+s.hero.wealth.gear*1.6;
  const mi=cf<1?Math.pow(s.multItems,cf):s.multItems;
  return base*s.hero.race.mult*traitSum(s.hero,'mult',1)*mi*(1+LVL_B*(s.lvl-1))*(1+(0.04+SKV.command*sk(s,'command'))*s.allies)*compMult(s)*s.stageCarry*(1+SKV.blade*sk(s,'blade'))*(1+SKV.mPow[mastery(s,'전투')])*(s.hp<s.maxHp*0.5?1+SKV.mGrit[mastery(s,'생존')]:1);
}
function compMult(s){let m=1;for(const k in s.comp){const c=s.comp[k];if(c&&c.mult)m*=c.mult;}m*=s.petGrow;if(s.spouse)m*=1.15;return m;}
function compSum(s,key){let v=0;for(const k in s.comp){const c=s.comp[k];if(c&&c[key])v+=c[key];}return v;}
function regionShare(s,i){const st=STAGES[s.stage];const w=st.regions.map((_,k)=>Math.pow(DEMON_W,k));const sum=w.reduce((a,b)=>a+b,0);return 100*w[i]/sum;}
function nextRegion(s){
  const st=STAGES[s.stage]; s.region++;
  if(s.region>=st.regions.length){s.over=true;s.cleared=st.regions.every((_,k)=>s.pacified&&s.pacified[k]);return;}
  const i=s.region, r=s.r, D=regionShare(s,i);
  s.transit=[];
  if(i>0){
    const h=s.comp.heroine; if(h&&h.regen){const v=Math.round(s.maxHp*h.regen);s.hp=Math.min(s.maxHp,s.hp+v);s.transit.push({t:'good',x:`${h.name}의 기도로 생명력 +${v}`});}
    const f=s.comp.friend; if(f&&f.forge){const k=STAT_KEYS[Math.floor(r()*6)];s.stats[k]++;s.transit.push({t:'good',x:`${f.name}이(가) 장비를 손봤다: ${STAT_NAMES[k]} +1`});}
    const pt=s.comp.pet; if(pt&&pt.grow){s.petGrow*=1+pt.grow;}
  }
  s.shop=makeShop(s);
  const share=[0.15,0.2,0.25]; // boss gets remainder 0.4
  // 전투 → 탐험 → 전투 → 휴식 → 전투 → 탐험 → 지배자
  s.queue=[makeBattle(s,i,D*share[0],false),{type:'explore'},makeBattle(s,i,D*share[1],false),{type:'rest'},makeBattle(s,i,D*share[2],false),{type:'explore'}];
  {const b=makeBattle(s,i,D*0.4,true); s.queue.push({type:'prep',boss:b},b);}
  s.regionKilled[i]=0; s.regionTotal=D;
}
function makeBattle(s,i,share,boss){
  const st=STAGES[s.stage], r=s.r;
  const size=boss?1.45*Math.exp(gauss(r)*0.15):Math.exp(gauss(r)*0.3);
  const finalBoss=boss&&!st.endless&&i===st.regions.length-1;
  const sizeF=size;
  const N=st.regions.length, late=Math.max(0,i-Math.floor(N*0.55));
  let E;
  if(st.hunt!=null){const W=STAGES[st.hunt];E=W.base*Math.pow(W.growth,W.regions.length-1)*HUNT_START*Math.pow(st.growth,i)*sizeF*(s.enemyCarry||s.stageCarry);}
  else E=st.base*Math.pow(st.growth,i)*Math.pow(LATE,late)*sizeF*(s.enemyCarry||s.stageCarry);
  E*=DIFF[worldOf(s.stage)];
  const pool=MINIONS[worldOf(s.stage)]; const mname=pool[Math.min(pool.length-1,Math.floor(r()*Math.min(pool.length,2+i)))];
  const count=boss?1:Math.max(3,Math.round(size*(5+i*2.5)*(1+s.stage*0.6)*(0.7+r()*0.6)));
  const noFlee=!boss&&WORLD_TRAITS[worldOf(s.stage)]&&WORLD_TRAITS[worldOf(s.stage)].id==='wraith'&&r()<0.5;
  return {type:'battle',boss,final:finalBoss,E,share,count,name:boss?st.regions[i][1]:mname,place:st.regions[i][0],noFlee};
}
function makeEvent(s){
  return {type:'event',kind:null};
}
function rollEvent(s,n){
  const r=s.r, opts=[['merchant',14],['altar',12],['knight',10]];
  if(!s.comp.heroine && s.fame>=30) opts.push(['heroine',1.6]);
  if(!s.comp.friend) opts.push(['friend',2.2]);
  if(!s.comp.pet) opts.push(['pet',2.2]);
  if(!s.activeQuest){const avail=QUESTS.filter(q=>s.fame>=q.min&&!(s.doneQ||[]).includes(q.giver)); if(avail.length) opts.push(['quest',6]);}
  if(s.fame>=150 && !s.tomb) opts.push(['tomb',4]);
  const tot=opts.reduce((a,b)=>a+b[1],0); let v=r()*tot; let k=opts[0][0];
  for(const [name,w] of opts){if((v-=w)<=0){k=name;break;}}
  n.kind=k;
  if(k==='heroine') n.c=HEROINES[Math.floor(r()*HEROINES.length)];
  if(k==='friend') n.c=FRIENDS[Math.floor(r()*FRIENDS.length)];
  if(k==='pet') n.c=PETS[Math.floor(r()*PETS.length)];
  if(k==='quest'){const avail=QUESTS.filter(q=>s.fame>=q.min&&!(s.doneQ||[]).includes(q.giver)); n.q=avail[avail.length-1];}
}
function winParts(s,E){const ratio=power(s)/E;const tt=Math.tanh(Math.log(ratio)*1.15); const base=0.70+(tt<0?0.58:0.22)*tt;const luck=clamp((effLuk(s)-10)*0.005,-0.05,0.10);const under=base<0.55?compSum(s,'underdog'):0;
  // 전투력 차이가 클수록 보너스가 덜 통한다 (적보다 크게 약하면 운과 명성만으로는 이길 수 없다)
  const pw=clamp(ratio,BONUS_MIN,1);
  return {ratio,base,pw,luck:luck>0?luck*pw:luck,under:under*pw,fame:Math.min(FAME_CAP+SKV.famecap*sk(s,'fame'),fameBonus(s))*pw,item:Math.min(ITEM_CAP,itemSum(s,'win')*curseF(s))*pw};}
function winProb(s,E,floor){const w=winParts(s,E);return clamp(w.base+w.luck+w.under+w.fame+w.item,floor==null?FLOOR:floor,0.95);}
function unpacified(s){let k=0;for(let j=0;j<s.region;j++) if(!(s.pacified&&s.pacified[j])) k++;return k;}
let UNP_PEN=0.04; let CARRY_ADJ=1.0; let BONUS_MIN=0.15; let CARRY_STEP=[1,6.5,3,2.6,2.6,0.6]; let CARRY_REF=[0,350,750,1300,2300,4400]; let CARRY_ALPHA=0.5; let FRESH=[1,1.6,1.6,1.65,1.8,1]; let FAME_CAP=0.1, ITEM_CAP=0.2;
const PROC_PTS=[[8,0],[10,0.015],[20,0.08],[30,0.18],[35,0.30],[40,0.50]];
function procCurve(v){if(v<=PROC_PTS[0][0])return 0;for(let i=1;i<PROC_PTS.length;i++){const [x1,y1]=PROC_PTS[i-1],[x2,y2]=PROC_PTS[i];if(v<=x2)return y1+(y2-y1)*(v-x1)/(x2-x1);}return 0.5;}
const RESIST=[0,6,12,18,24,30];
function resistOf(s){return RESIST[worldOf(s.stage)]*(wtrait(s)==='elder'?2:1);}
function effLuk(s){return s.stats.luk-Math.max(0,resistOf(s)-SKV.lucky*sk(s,'lucky'));}
function effCha(s){return s.stats.cha-Math.max(0,resistOf(s)-SKV.charm*sk(s,'charm'));}
function luckProc(s,n){return n.final?0:procCurve(effLuk(s));}
function charmProc(s,n){return n.final?0:procCurve(effCha(s));}
const MERC_CAP=12;
function mercCap(s){return MERC_CAP+SKV.cmdcap*sk(s,'command');}
function addAlly(s,out){ const cap=mercCap(s); if(s.allies>=cap){ s.gold+=30; out.push({t:'good',x:`용병단이 가득 차 합류 대신 금화를 받았다 (최대 ${cap}명)`}); return; } s.allies++; out.push({t:'good',x:`용병 합류 (총 ${s.allies}/${cap}명)`}); }
function loseAllies(s,out,k){ if(!s.allies||s.dead) return; k=Math.max(0,k-sk(s,'command')); if(!k) return; const n=Math.min(s.allies,k); s.allies-=n; out.push({t:'bad',x:`용병 ${n}명이 쓰러졌다 (남은 ${s.allies}명)`}); }
function teamBonus(s){let k=0;for(const x in s.comp) if(s.comp[x]) k++; if(s.spouse) k++; return k*0.04+Math.min(0.05,s.allies*0.005);}
function fameBonus(s){return Math.max(0,s.fame)/100*0.01;}
function revives(s){return s.revive+s.items.filter(i=>i.revive).length;}
function itemSum(s,key){let v=0;for(const it of s.items){if(key==='win')v+=effWin(it);else if(key==='flee')v+=effFlee(it);else if(it[key])v+=it[key];}return v;}
function fleeProb(s,boss){return clamp((0.38+(s.stats.agi-10)*0.04+(s.stats.luk-10)*0.01+traitSum(s.hero,'flee',0)+compSum(s,'flee')+itemSum(s,'flee')*curseF(s)+SKV.flee*sk(s,'flee'))*(boss?0.65:1),0.04,0.97);}
function talkProb(s,node){ return talkProbRaw(s,node)*clamp(power(s)/node.E,0.25,1)*(wtrait(s)==='sin'?0.5:1); }
function talkProbRaw(s,node){
  const big=Math.log10(Math.max(10,(node.count||1)*30));
  return clamp((0.06+clamp((effCha(s)-10)*0.03,-0.15,0.30)+(s.stats.int-10)*0.012+traitSum(s.hero,'talk',0)+compSum(s,'talk')+clamp(s.fame/400,-0.05,0.25)-big*0.012+SKV.talk*sk(s,'talk'))*(node.final?0.06:node.boss?0.25:1),0.005,0.7);
}

// Current choice with options
function current(s){
  if(s.dead||s.over) return null;
  if(!s.queue.length){ nextRegion(s); if(s.over) return null; }
  const n=s.queue[0];
  if(n.type==='battle'){
    const unp=n.final?unpacified(s):0; n.unp=unp;
    const fw=winParts(s,n.E); const pRaw=n.final?clamp((STAGES[s.stage].fx||FINAL_X)*clamp(fw.base+fw.luck+fw.under+(fw.fame+fw.item)*0.5,0.12,0.95)-UNP_PEN*unp,0.02,0.6):n.boss?clamp(winProb(s,n.E)*BOSS_X,0.2,0.85):winProb(s,n.E);
    const adj=n.boss?((n.bonus||0)+teamBonus(s))*clamp(pRaw/0.35,0.2,1):0; n.skAdj=((pRaw<0.6?SKV.giant*sk(s,'giant'):0)+(n.boss?SKV.boss*sk(s,'boss'):0))*fw.pw; const p=clamp(pRaw+adj+n.skAdj,0.03,0.92); n.adj=adj; n.pRaw=pRaw; const pf=fleeProb(s,n.boss), pt=talkProb(s,n);
    const count=n.count;
    {const rr=power(s)/n.E; n.rr=rr; n.lp=luckProc(s,n)*clamp(rr,BONUS_MIN,1); n.cp=charmProc(s,n)*clamp(rr,BONUS_MIN,1);} n.pBase=p; n.ptBase=pt;
    n.p=clamp(p+(1-p)*n.lp,0.03,0.97); n.pf=pf; n.pt=clamp(pt+(1-pt)*n.cp,0.005,0.9); n.parts=winParts(s,n.E);
    const title=n.boss?(n.tries?`${n.name}에게 다시 도전한다. (${n.tries}번째 도전, 최대 ${n.final?finalTries(s):BOSS_TRIES}번)`:`${n.place}의 지배자, ${n.name}이(가) 앞을 막았다.`):`${n.name} ${fmtK(count)}마리의 무리를 마주했다.`;
    const hint=n.p>=0.8?'충분히 이길 만하다.':n.p>=0.68?'해볼 만한 싸움이다.':n.p>=0.55?'만만치 않은 상대다.':'이길 가능성은 떨어진다.';
    if(n.boss&&STAGES[s.stage].endless) return {node:n,title:`${n.place}의 수문장, ${n.name}이(가) 길을 막았다.`+(n.tries?` (${n.tries}번째 도전)`:''),hint:hint+' 수문장을 쓰러뜨려야만 다음 층으로 오를 수 있다.',options:[
      {id:'fight',label:'싸운다',prob:n.p,desc:'이기면 다음 층으로 오른다. 두 번 지면 여정이 끝난다.'}]};
    if(n.final) return {node:n,title,hint:hint+' 마지막 지배자 앞에서는 물러설 곳도, 말로 넘어갈 길도 없다.',options:[
      {id:'fight',label:'싸운다',prob:n.p,desc:`이기면 이 세계를 정복한다. 지면 재정비 후 다시 도전할 수 있다(최대 ${finalTries(s)}번).`}]};
    return {node:n,title,hint,options:[
      {id:'fight',label:'싸운다',prob:n.p,desc:`승리 시 무리를 섬멸한다. 패배하면 큰 부상을 입는다.${n.lp>=0.005?` 행운의 일격 ${(n.lp*100).toFixed(1)}% 포함.`:''}`},
      {id:'flee',label:'도망간다',prob:pf,disabled:!!n.noFlee,desc:n.noFlee?'망령이 길을 막아 도망칠 수 없다.':n.boss?'성공하면 이 지역을 포기하고 다음 지역으로 간다. 실패 시 부상.':'성공하면 무리를 피해 지나간다. 실패 시 부상.'},
      {id:'talk',label:'회유한다',prob:n.pt,desc:`성공하면 싸움 없이 굴복시키고 용병으로 삼는다. 실패하면 분노한 적과 불리하게 싸운다.${n.cp>=0.005?` 매혹 ${(n.cp*100).toFixed(1)}% 포함.`:''}`},
    ]};
  }
  if(n.type==='skill'){return {node:n,title:'새로운 기술을 익힐 때가 왔다.',hint:`셋 중 하나를 고른다. 같은 기술은 ${SK_MAX}랭크까지 올릴 수 있다.${WORLD_TRAITS[worldOf(s.stage)]?` 이 세계의 특성: ${WORLD_TRAITS[worldOf(s.stage)].name} (${WORLD_TRAITS[worldOf(s.stage)].d}).`:''}`,
    options:n.offers.map(id=>{const k=SKILL_BY[id],r=sk(s,id);return {id:'sk:'+id,label:`${k.name} ${r?`${r}→${r+1}랭크`:'습득'}`,desc:`[${k.role}] ${k.d(r+1)}`};})};}
  if(n.type==='explore'){const tr=clamp(0.3-(s.stats.int-10)*0.012-(s.stats.agi-10)*0.008,0.08,0.45);n.trap=tr;
    if(n.title==null){const L=EXPLORE_TXT[worldOf(s.stage)];n.title=L[Math.floor(s.r()*L.length)];}
    return {node:n,title:n.title,hint:`샅샅이 뒤질수록 귀한 것을 찾지만 함정도 많다. (함정 확률 약 ${Math.round(tr*100)}%)`,options:[
      {id:'deep',label:'샅샅이 탐험한다',desc:'아이템, 기연, 뜻밖의 만남 확률이 높다. 함정에 빠질 위험도 높다.'},
      {id:'careful',label:'조심스럽게 둘러본다',desc:'위험은 적지만 발견도 적다.'},
      {id:'skip',label:'탐험하지 않고 지나간다',desc:'아무 일도 일어나지 않는다.'}]};}
  if(n.type==='prep'){const b=n.boss, st=STAGES[s.stage];
    n.fcost=Math.round((30+s.region*5)*(1+s.stage*0.5)*(b.final?1.5:1)); n.gcost=Math.round(GRADES[1].gold*1.4*rs(s,1.3)*(1+s.stage)*(b.final?1.5:1));
    n.fb=b.final?0.15:0.12; n.gb=b.final?0.1:0.08;
    const tb=teamBonus(s);
    return {node:n,title:`${b.name}이(가) 기다리는 ${b.place}의 심장부에 다다랐다. 결전을 준비한다.`,hint:`준비 하나를 고를 수 있다.${tb>0?` 동료와 용병이 합동 공격으로 승리확률 +${Math.round(tb*100)}%p를 보탠다.`:''}${b.final?' 이 세계의 마지막 지배자다.':''}`,options:[
      {id:'bless',label:'신전에서 축복을 받는다',desc:`명성 ${n.fcost} 소모 · 이번 지배자전 승리확률 +${Math.round(n.fb*100)}%p`,disabled:s.fame<n.fcost},
      {id:'hire',label:'용병단을 고용한다',desc:`금화 ${fmtK(n.gcost)} 소모 · 이번 지배자전 승리확률 +${Math.round(n.gb*100)}%p`,disabled:s.gold<n.gcost},
      {id:'go',label:'그대로 맞선다',desc:'아무것도 쓰지 않는다.'}]};}
  if(n.type==='rest'){return {node:n,title:'해가 저물어 야영할 곳을 찾았다.',hint:`지금 생명력은 ${Math.max(0,s.hp)} / ${s.maxHp}이다.`,options:[
      {id:'sleep',label:'불을 피우고 푹 잔다',desc:'생명력 +45%. 밤중에 습격당할 수 있다.'},
      {id:'guard',label:'경계하며 쉰다',desc:'생명력 +25%. 안전하다.'},
      {id:'drill',label:'잠을 줄이고 수련한다',desc:'생명력 +10%, 힘·민첩·지능 중 하나 +1.'}]};}
  // events
  if(!n.kind) rollEvent(s,n);
  const k=n.kind;
  if(k==='heroine'){return {node:n,title:n.c.meet,hint:`구해주면 동행할지도 모른다. (${n.c.d})`,options:[
      {id:'rescue',label:'구하러 뛰어든다',prob:clamp(winProb(s,(n.rescueE=n.rescueE||makeBattle(s,s.region,0,false).E)*1.2)+0.1,0.1,0.95),desc:'성공하면 히로인이 동행한다. 실패하면 부상을 입는다.'},
      {id:'pass',label:'못 본 척 지나간다',desc:'명성 -1.'}]};}
  if(k==='friend'){return {node:n,title:n.c.meet,hint:`마음이 맞으면 친구가 된다. (${n.c.d})`,options:[
      {id:'befriend',label:'함께 가자고 한다',prob:clamp(0.45+(s.stats.cha-10)*0.04+s.fame/500,0.15,0.92),desc:'성공하면 친구로 동행한다.'},
      {id:'pass',label:'거절한다',desc:'아무 일도 일어나지 않는다.'}]};}
  if(k==='pet'){return {node:n,title:n.c.meet,hint:`돌봐주면 따를지도 모른다. (${n.c.d})`,options:[
      {id:'tame',label:'돌봐준다',prob:clamp(0.55+(s.stats.cha-10)*0.03+(s.stats.luk-10)*0.02,0.2,0.92),desc:'생명력 -10%. 성공하면 펫이 된다.'},
      {id:'pass',label:'지나친다',desc:'아무 일도 일어나지 않는다.'}]};}
  if(k==='quest'){const q=n.q;n.qE=STAGES[s.stage].base*Math.pow(STAGES[s.stage].growth,s.region)*1.55*(s.enemyCarry||s.stageCarry)*DIFF[worldOf(s.stage)];
    return {node:n,title:`명성을 들은 ${q.giver}이(가) ${q.task} 토벌을 의뢰했다.`,hint:`성공하면 큰 보상과 명성을 얻는다. 지금 이 싸움의 승리확률은 약 ${Math.round(winProb(s,n.qE)*100)}%다.`,options:[
      {id:'accept',label:'의뢰를 수락한다',desc:'바로 토벌에 나선다. 실패하면 명성 -5.'},
      {id:'decline',label:'정중히 거절한다',desc:'명성 -1.'}]};}
  if(k==='proposal'){const q=n.q;return {node:n,title:`${q.giver}이(가) ${q.rel}와(과)의 혼인을 청했다.`,hint:'혼인하면 배우자가 평생 곁을 지킨다. (전투력 +15%, 최대 생명력 +20%, 명성 +30)',options:[
      {id:'marry',label:'혼인을 받아들인다',desc:'배우자가 생긴다.'},
      {id:'refuse',label:'토벌이 먼저라며 거절한다',desc:'명성 -3.'}]};}
  if(k==='tomb'){return {node:n,title:'전설 속 영웅의 무덤이 네 명성에 응답해 문을 열었다.',hint:'명성 150 이상인 자에게만 열리는 곳이다.',options:[
      {id:'inherit',label:'유산을 계승한다',desc:'모든 능력치 +3, 생명력 -20%.'},
      {id:'pass',label:'경의만 표하고 떠난다',desc:'명성 +10.'}]};}
  if(k==='merchant'){const cost=Math.round(30*rs(s,1.3)*(1+s.stage));n.cost=cost;
    return {node:n,title:'길가에서 떠돌이 상인을 만났다.',hint:`성수 한 병에 금화 ${fmtK(cost)}닢. 지금 가진 금화는 ${fmtK(s.gold)}닢이다.`,options:[
      {id:'buy',label:'성수를 산다',desc:'체력을 모두 회복한다.',disabled:s.gold<cost},
      {id:'rob',label:'물건을 빼앗는다',prob:clamp(0.3+(s.stats.str-10)*0.04,0.05,0.85),desc:'성공하면 무작위 장비를 얻는다. 실패하면 상인의 호위에게 다친다.'},
      {id:'pass',label:'지나친다',desc:'아무 일도 일어나지 않는다.'}]};}
  if(k==='altar'){return {node:n,title:'핏자국이 남은 수상한 제단을 발견했다.',hint:'무언가가 기도를 기다리는 듯하다.',options:[
      {id:'pray',label:'기도한다',prob:clamp(0.5+(s.stats.luk-10)*0.03,0.15,0.85),desc:'성공하면 능력치가 크게 오른다. 실패하면 저주를 받는다.'},
      {id:'smash',label:'제단을 부순다',desc:'힘 +1, 체력이 조금 깎인다.'},
      {id:'pass',label:'지나친다',desc:'아무 일도 일어나지 않는다.'}]};}
  if(k==='knight'){return {node:n,title:'쓰러진 기사가 도움을 청한다.',hint:'치료하려면 시간과 체력이 든다.',options:[
      {id:'heal',label:'치료해준다',prob:clamp(0.55+(s.stats.cha-10)*0.03,0.2,0.9),desc:'체력 -15%. 성공하면 기사가 동료로 합류한다.'},
      {id:'loot',label:'장비만 챙긴다',desc:'금화를 얻지만 매력 -1.'},
      {id:'pass',label:'지나친다',desc:'아무 일도 일어나지 않는다.'}]};}
  if(k==='train'){return {node:n,title:'버려진 수련장에 도착했다.',hint:'하루를 머물 수 있다.',options:[
      {id:'tstr',label:'검술 수련',desc:'힘 +1~2, 체력 -10%.'},
      {id:'tagi',label:'달리기 수련',desc:'민첩 +1~2, 체력 -10%.'},
      {id:'rest',label:'푹 쉰다',desc:'체력 +40%.'}]};}
  return {node:n,title:'먼지 쌓인 보물상자를 발견했다.',hint:'함정일 수도 있다.',options:[
      {id:'open',label:'연다',prob:clamp(0.55+(s.stats.int-10)*0.03+(s.stats.luk-10)*0.02,0.2,0.92),desc:'성공하면 아이템. 실패하면 함정에 다친다.'},
      {id:'pass',label:'지나친다',desc:'아무 일도 일어나지 않는다.'}]};
}
function fmtK(n){return Math.round(n).toLocaleString('ko-KR');}

function hurt(s,frac,out){
  frac*=1-SKV.mDmg[mastery(s,'생존')];
  const dmg=Math.max(1,Math.round(s.maxHp*frac)); s.hp-=dmg; out.push({t:'bad',x:`체력 -${dmg}`});
  if(s.hp<=0){
    const feather=s.items.findIndex(it=>it.revive);
    const potion=s.items.findIndex(it=>it.heal);
    const saver=['heroine','friend'].map(k=>s.comp[k]).find(c=>c&&c.save&&!s.saves[c.name]);
    if(potion>=0){s.items.splice(potion,1);s.hp=Math.round(s.maxHp*0.4);out.push({t:'good',x:'쓰러지기 직전 성수를 마셨다. 생명력 40% 회복'});}
    else if(saver){s.saves[saver.name]=1;s.hp=Math.round(s.maxHp*0.6);out.push({t:'comp',x:`${saver.name}이(가) 몸을 던져 구해냈다`});}
    else if(s.gritLeft>0){s.gritLeft--;s.hp=Math.max(1,Math.round(s.maxHp*SKV.grit));out.push({t:'good',x:'질긴 목숨: 쓰러지지 않고 버텼다'});}
    else if(s.revive>0||feather>=0){ if(feather>=0)s.items.splice(feather,1); else s.revive--; s.hp=Math.round(s.maxHp*0.5); out.push({t:'good',x:'죽음의 문턱에서 되살아났다'}); }
    else {s.dead=true;s.hp=0;}
  }
}
function rs(s,b){return Math.pow(b,Math.min(Math.max(0,s.region),14));}
function placeName(s){const st=STAGES[s.stage];const rg=st.regions[Math.max(0,s.region)];return rg?rg[0]:st.name;}
function gainItem(s,out,bonus,src){
  const g=rollGrade(s.r,(bonus||0)+SKV.appraise*sk(s,'appraise')); const roll=s.r(); const it=roll<0.05?makeItem(s.r,0,'heal'):roll<0.06?makeItem(s.r,g,'revive'):makeItem(s.r,g,null,tierOf(s));
  it.src=src||'획득'; it.where=placeName(s);
  equip(s,it); s.fame+=2+it.grade*4; out.push({t:'item g'+it.grade,x:`${GRADES[it.grade].name} 아이템: ${it.name} (${it.d})`}); if(s.lastEquipNote) out.push({t:'good',x:s.lastEquipNote}); return;

}
function gainXp(s,amt,out){
  s.xp+=amt*(1+traitSum(s.hero,'xp',0)+SKV.scholar*sk(s,'scholar')+SKV.mXp[mastery(s,'성장')]);
  while(s.xp>=s.lvl*10){s.xp-=s.lvl*10;s.lvl++;if(s.lvl>=SKV.pickFrom&&(s.lvl-SKV.pickFrom)%SKV.pickEvery===0)s.pendingPicks=(s.pendingPicks||0)+1;const o=s.maxHp;s.maxHp=hpMax(s);s.hp=Math.min(s.maxHp,s.hp+(s.maxHp-o)+Math.round(s.maxHp*0.1));out.push({t:'good',x:`레벨 ${s.lvl} 달성`});}
}
function kill(s,n,out){s.killed+=n.share;s.regionKilled[s.region]+=n.share;s.kills=(s.kills||0)+n.count;}
function winRewards(s,n,p,out){
  if(!n.quest) kill(s,n,out); s.wins++;
  const fg=Math.round(((n.boss?20:4)+(Math.min(s.region,20)*0.6)+40*(1-p)*(1-p))*(1+SKV.fame*sk(s,'fame'))); s.fame+=fg; out.push({t:'fame',x:`명성 +${fg}`});
  if(s.comp.friend&&s.comp.friend.heal){const v=Math.round(s.maxHp*s.comp.friend.heal);s.hp=Math.min(s.maxHp,s.hp+v);}
  s.gold+=Math.round((1+SKV.merchant*sk(s,'merchant')+SKV.mGold[mastery(s,'재물')])*(s.comp.friend&&s.comp.friend.gold?2:1)*Math.round((16+30*s.r())*rs(s,1.3)*(1+s.stage)*(n.boss?3:1)));
  gainXp(s,(n.boss?8:3)*(1+2*(1-p)),out);
  const under=1-p;
  if(p<0.6){ s.upsets++; }
  if(s.r()< (0.05+under*under*0.9)*(1+SKV.treasure*sk(s,'treasure'))) gainItem(s,out,under*1.2+(n.boss?0.25:0),n.boss?'지배자 처치':n.quest?'의뢰 토벌':'전투 승리');
  if(p<0.5&&s.r()<0.5){ const k=STAT_KEYS[Math.floor(s.r()*6)]; const v=2+Math.floor(s.r()*3); s.stats[k]+=v;
    if(k==='con'){const o=s.maxHp;s.maxHp=hpMax(s);s.hp+=s.maxHp-o;}
    out.push({t:'item',x:`불리한 싸움을 이겨내고 각성했다: ${STAT_NAMES[k]} +${v}`}); }
  if(n.quest){ const q=n.q; s.activeQuest=null; s.quests++; (s.doneQ=s.doneQ||[]).push(q.giver);
    s.fame+=40; out.push({t:'fame',x:'의뢰 완수 · 명성 +40'}); gainItem(s,out,0.7,`의뢰 보상 (${q.giver})`);
    const ks=STAT_KEYS.slice().sort(()=>s.r()-0.5).slice(0,2); ks.forEach(k=>{const v=3+Math.floor(s.r()*3);s.stats[k]+=v;out.push({t:'item',x:`${q.giver}의 하사품: ${STAT_NAMES[k]} +${v}`});});
    const o=s.maxHp;s.maxHp=hpMax(s);s.hp+=Math.max(0,s.maxHp-o);
    if(!s.spouse && s.fame>=q.min+60 && s.stats.cha>=11){ s.queue.splice(1,0,{type:'event',kind:'proposal',q}); }
    else if(!s.spouse) out.push({t:'bad',x:`명성이 ${q.min+60} 이상이고 매력이 11 이상이었다면 ${q.rel}와(과)의 혼담이 오갔을지 모른다`});
  }
  if(n.final){ s.conquered=true; s.pendingPicks=(s.pendingPicks||0)+SKV.conquerPicks; out.push({t:'item g3',x:`${STAGES[s.stage].name} 정복`}); }
  if(n.boss){ const endless=STAGES[s.stage].endless; if(endless||s.r()<0.5) gainItem(s,out,endless?Math.min(1,0.3+0.025*s.region):0.35,endless?'전장 수문장 처치':'지배자 처치'); (s.pacified=s.pacified||[])[s.region]=true; // pacify region: remaining demons scatter
    s.fame+=10; out.push({t:'fame',x:'지역 평정 · 명성 +10'});
    const rest=s.regionTotal-s.regionKilled[s.region]; if(rest>1e-9){s.killed+=rest;s.regionKilled[s.region]+=rest;out.push({t:'good',x:`지배자가 쓰러지자 남은 악마가 흩어졌다 (+${rest.toFixed(2)}%)`});}
    s.hp=Math.min(s.maxHp,s.hp+Math.round(s.maxHp*0.35));
  }
}
const BOSS_TRIES=2;
function finalTries(s){return FINAL_TRIES+mastery(s,'생존');}
function bossRetry(s,n,out){
  if(!n.boss||s.dead) return;
  n.tries=(n.tries||1)+1; const maxT=n.final?finalTries(s):BOSS_TRIES;
  if(n.tries<=maxT){ s.keepNode=true; const h=Math.round(s.maxHp*(n.final?0.25:0.1)); s.hp=Math.min(s.maxHp,s.hp+h); n.E*=mastery(s,'생존')?SKV.mRetry[mastery(s,'생존')]:1.05;
    out.push({t:'good',x:`물러나 재정비했다 · 생명력 +${h}`},{t:'bad',x:`재도전 ${n.tries-1}/${maxT-1}회째`}); }
  else if(STAGES[s.stage].endless){ s.over=true; out.push({t:'bad',x:`수문장을 넘지 못했다. ${s.region+1}층에서 여정이 끝났다`}); }
  else out.push({t:'bad',x:'다시 패배했다. 이 지역을 평정하지 못하고 떠났다'});
}
function questFail(s,n,out){ if(n.quest&&!s.dead){ s.activeQuest=null; (s.doneQ=s.doneQ||[]).push(n.q.giver); s.fame-=5; out.push({t:'bad',x:`의뢰 실패 · 명성 -5`}); } }
function joinComp(s,slot,c,out){ s.comp[slot]=c; if(c.luk){s.stats.luk+=c.luk;} s.fame+=5; out.push({t:'comp',x:`${c.name} 동행 (${c.d})`}); }
// returns {text, effects[]}
function choose(s,optId){
  const c=current(s); const n=c.node; const r=s.r; const out=[]; let text='';
  s.decisions++;
  const roll=r();
  if(n.type==='skill'){ const id=String(optId).slice(3); learnSkill(s,id,out); text=`${SKILL_BY[id].name}을(를) 익혔다.`; }
  else if(n.type==='battle'){
    if(optId==='fight'){
      if(roll<n.p){ const lucky=roll<n.lp; text=lucky?`행운의 일격! 빗나갈 칼날이 ${n.name}의 급소에 꽂혔다.`:n.pBase<0.55?`힘겨운 싸움 끝에 ${n.name}을(를) 쓰러뜨렸다.`:`${n.name}을(를) 무찔렀다.`; if(lucky) out.push({t:'item g2',x:'행운의 일격'});
        winRewards(s,n,n.p,out); hurt(s,(0.06+0.3*(1-n.p))*(0.6+r()*0.8),out); out.unshift({t:'kill',x:`+${n.share.toFixed(2)}%`}); }
      else { text=`${n.name}에게 패해 물러났다.`; {const fl=n.boss?2:1; s.fame-=fl; out.push({t:'bad',x:`명성 -${fl}`});} hurt(s,n.final?Math.min(0.5,(0.2+0.4*(1-n.p))*(0.8+r()*0.4)):(0.22+0.8*(1-n.p))*(0.7+r()*0.6)*(n.boss?1.25:1),out); loseAllies(s,out,1+Math.floor(r()*(n.boss?3:2))); bossRetry(s,n,out); questFail(s,n,out); }
    } else if(optId==='flee'){
      const fl=sk(s,'flee')?0:n.boss?3:1; s.fame-=fl;
      if(roll<n.pf){ text=n.boss?'지배자를 피해 다음 지역으로 도망쳤다. 이 지역의 남은 악마는 그대로 남는다.':'무리를 피해 몰래 지나갔다.'; out.push({t:'bad',x:`명성 -${fl}`}); }
      else if(s.comp.pet&&s.comp.pet.fleeSave&&!s.saves[s.comp.pet.name]){ s.saves[s.comp.pet.name]=1; text=`붙잡히기 직전, ${s.comp.pet.name}이(가) 적에게 달려들어 길을 열었다.`; out.push({t:'comp',x:`${s.comp.pet.name}의 구출`},{t:'bad',x:`명성 -${fl}`}); }
      else { text='도망치다 붙잡혔다.'; out.push({t:'bad',x:`명성 -${fl}`}); hurt(s,0.3+0.5*(1-n.p)*(0.5+r()),out); }
      questFail(s,n,out);
    } else {
      if(roll<n.pt){ if(roll<n.cp) out.push({t:'comp',x:'매혹'}); text=roll<n.cp?`${n.name}이(가) 네 매력에 넋을 잃고 스스로 무릎을 꿇었다.`:n.boss?`말로 ${n.name}을(를) 굴복시켰다. 믿기 힘든 일이다.`:`${n.name} 무리가 설득당해 무기를 내려놓았다.`;
        addAlly(s,out); winRewards(s,n,Math.min(n.p,0.5),out);
        {const tf=n.boss?30:8, tx=n.boss?12:5; s.fame+=tf; gainXp(s,tx,out); out.push({t:'fame',x:`회유 성공 · 명성 +${tf}`},{t:'good',x:`경험치 +${tx}`});} out.unshift({t:'kill',x:`+${(n.share||0).toFixed(2)}% 굴복`}); }
      else { const p2=n.p*0.7; text='회유가 실패해 적이 분노했다.';
        if(r()<p2){ text+=` 그래도 싸움에서 이겼다.`; winRewards(s,n,p2,out); hurt(s,0.35*(1-p2),out); out.unshift({t:'kill',x:`+${(n.share||0).toFixed(2)}%`}); }
        else { text+=' 분노한 적에게 크게 당했다.'; hurt(s,0.45+0.5*(1-n.p)*(0.6+r()*0.7),out); bossRetry(s,n,out); questFail(s,n,out); } }
    }
  } else {
    const o=c.options.find(x=>x.id===optId);
    switch(optId){
      case 'buy': s.gold-=n.cost; s.hp=s.maxHp; text='성수를 마시고 상처가 아물었다.'; out.push({t:'good',x:'체력 전부 회복'}); break;
      case 'rob': if(roll<o.prob){text='상인의 짐을 빼앗았다.';gainItem(s,out,0,'상인 약탈');s.fame-=3;out.push({t:'bad',x:'명성 -3'});s.stats.cha=Math.max(1,s.stats.cha-1);out.push({t:'bad',x:'매력 -1'});} else {text='호위에게 두들겨 맞았다.';hurt(s,0.3,out);} break;
      case 'pray': if(roll<o.prob){const k=STAT_KEYS[Math.floor(r()*6)];const v=2+Math.floor(r()*3);s.stats[k]+=v;if(k==='con'){const ox=s.maxHp;s.maxHp=hpMax(s);s.hp+=s.maxHp-ox;}text='제단이 붉게 빛났다.';out.push({t:'item',x:`${STAT_NAMES[k]} +${v}`});}
        else {const k=STAT_KEYS[Math.floor(r()*6)];s.stats[k]=Math.max(1,s.stats[k]-2);text='제단에서 검은 연기가 피어올랐다.';out.push({t:'bad',x:`저주: ${STAT_NAMES[k]} -2`});hurt(s,0.15,out);} break;
      case 'smash': s.stats.str++; text='제단을 산산조각 냈다.'; out.push({t:'good',x:'힘 +1'}); hurt(s,0.08,out); break;
      case 'heal': hurt(s,0.15,out); if(!s.dead){ if(roll<o.prob){s.fame+=4;text='기사가 은혜를 갚겠다며 따라나섰다.';addAlly(s,out);} else text='기사는 고맙다는 말만 남기고 떠났다.'; } else text='치료하다 힘이 다했다.'; break;
      case 'loot': {const g=Math.round(40*rs(s,1.3)*(1+s.stage));s.gold+=g;s.stats.cha=Math.max(1,s.stats.cha-1);s.fame-=2;text='기사의 주머니를 털었다.';out.push({t:'bad',x:'명성 -2'});out.push({t:'good',x:`금화 +${fmtK(g)}`},{t:'bad',x:'매력 -1'});} break;
      case 'tstr': case 'tagi': {const k=optId==='tstr'?'str':'agi';const v=1+Math.floor(r()*2);s.stats[k]+=v;text='땀 흘려 수련했다.';out.push({t:'good',x:`${STAT_NAMES[k]} +${v}`});hurt(s,0.1,out);} break;
      case 'rest': {const h=Math.round(s.maxHp*0.4);s.hp=Math.min(s.maxHp,s.hp+h);text='오랜만에 깊이 잠들었다.';out.push({t:'good',x:'체력 +40%'});} break;
      case 'open': if(roll<o.prob||(s.comp.pet&&s.comp.pet.trap)){text='상자 안에서 무언가가 빛났다.';gainItem(s,out,0,'보물상자');} else {text='독침 함정이 튀어나왔다.';hurt(s,0.25,out);} break;
      case 'rescue': if(roll<o.prob){text=`${n.c.name}을(를) 구해냈다. 그녀가 동행하겠다고 한다.`;joinComp(s,'heroine',n.c,out);} else {text='구하러 뛰어들었지만 역부족이었다.';hurt(s,0.35,out);} break;
      case 'befriend': if(roll<o.prob){text=`${n.c.name}와(과) 의기투합했다.`;joinComp(s,'friend',n.c,out);} else text='서로 갈 길이 다르다며 헤어졌다.'; break;
      case 'tame': hurt(s,0.1,out); if(!s.dead){ if(roll<o.prob){text=`${n.c.name}이(가) 곁을 떠나지 않는다.`;joinComp(s,'pet',n.c,out);} else text='상처가 낫자 숲으로 사라졌다.'; } else text='돌보다 힘이 다했다.'; break;
      case 'accept': s.activeQuest=n.q; text=`${n.q.task} 토벌에 나섰다.`; s.queue.splice(1,0,{type:'battle',quest:true,q:n.q,boss:false,E:n.qE,share:0,count:1,name:n.q.task,place:STAGES[s.stage].regions[s.region][0]}); break;
      case 'decline': s.fame-=1; text='의뢰를 거절했다.'; out.push({t:'bad',x:'명성 -1'}); break;
      case 'marry': s.spouse=n.q.rel; {const o2=s.maxHp; s.maxHp=Math.round(hpMax(s)*1.2); s.hp+=s.maxHp-o2;} s.fame+=30; text=`${n.q.rel}와(과) 혼인했다. 왕국 전체가 축하했다.`; out.push({t:'comp',x:`배우자: ${n.q.rel}`},{t:'fame',x:'명성 +30'}); break;
      case 'refuse': s.fame-=3; text='혼담을 거절했다.'; out.push({t:'bad',x:'명성 -3'}); break;
      case 'inherit': s.tomb=1; STAT_KEYS.forEach(k=>s.stats[k]+=3); text='고대 영웅의 힘이 몸에 스며들었다.'; out.push({t:'item',x:'모든 능력치 +3'}); hurt(s,0.2,out); break;
      case 'deep': case 'careful': {
        const deep=optId==='deep'; const tr=n.trap*(deep?1:0.4);
        const w=deep?{trap:tr,item:0.22,fortune:0.07,gold:0.14,meet:0.3}:{trap:tr,item:0.12,fortune:0.02,gold:0.24,meet:0.2};
        let v=r(),k='nothing'; for(const key in w){ if((v-=w[key])<0){k=key;break;} }
        if(k==='trap'){ if(s.comp.pet&&s.comp.pet.trap){text=`${s.comp.pet.name}이(가) 함정을 먼저 알아채 피했다.`;out.push({t:'comp',x:'함정 회피'});} else {text=TRAPS[Math.floor(r()*TRAPS.length)];hurt(s,deep?0.22+r()*0.12:0.1+r()*0.08,out);} }
        else if(k==='item'){text='먼지 속에서 무언가가 빛났다.';gainItem(s,out,deep?0.2:0,'탐험 발견');}
        else if(k==='fortune'){const f=FORTUNES[Math.floor(r()*FORTUNES.length)];text='기연. '+f.t;
          if(f.mult)s.multItems*=f.mult; if(f.all)STAT_KEYS.forEach(k2=>s.stats[k2]+=f.all); if(f.con){s.stats.con+=f.con;} if(f.revive)s.revive+=f.revive; if(f.lvl){for(let z=0;z<f.lvl;z++){s.lvl++;}}
          {const o2=s.maxHp;s.maxHp=hpMax(s);s.hp+=Math.max(0,s.maxHp-o2);} s.fame+=15; out.push({t:'item',x:f.x},{t:'fame',x:'명성 +15'});}
        else if(k==='gold'){const g=Math.round((15+30*r())*rs(s,1.3)*(1+s.stage));s.gold+=g;text='누군가 숨겨둔 금화 주머니를 찾았다.';out.push({t:'good',x:`금화 +${fmtK(g)}`});}
        else if(k==='meet'){const ev={type:'event',kind:null};rollEvent(s,ev);s.queue.splice(1,0,ev);text='탐험하던 중 무언가와 마주쳤다.';}
        else text=deep?'샅샅이 뒤졌지만 아무것도 없었다.':'조용히 둘러보고 지나갔다.';
      } break;
      case 'skip': text='탐험하지 않고 길을 재촉했다.'; break;
      case 'bless': s.fame-=n.fcost; n.boss.bonus=(n.boss.bonus||0)+n.fb; text='신전의 사제가 결전의 축복을 내렸다.'; out.push({t:'fame',x:`명성 -${n.fcost}`},{t:'good',x:`지배자전 승리확률 +${Math.round(n.fb*100)}%p`}); break;
      case 'hire': s.gold-=n.gcost; n.boss.bonus=(n.boss.bonus||0)+n.gb; text='이름난 용병단이 결전에 합류했다.'; out.push({t:'bad',x:`금화 -${fmtK(n.gcost)}`},{t:'good',x:`지배자전 승리확률 +${Math.round(n.gb*100)}%p`}); break;
      case 'go': text='숨을 고르고 결전에 나섰다.'; break;
      case 'sleep': {const h=Math.round(s.maxHp*(0.45+SKV.camp*sk(s,'camp')));s.hp=Math.min(s.maxHp,s.hp+h);text='모닥불 옆에서 깊이 잠들었다.';out.push({t:'good',x:`생명력 +${h}`});
        if(r()<0.18&&!sk(s,'camp')){text+=' 그런데 한밤중에 습격을 받았다.';hurt(s,0.12+r()*0.1,out);} } break;
      case 'guard': {const h=Math.round(s.maxHp*(0.25+SKV.camp*sk(s,'camp')));s.hp=Math.min(s.maxHp,s.hp+h);text='검을 쥔 채 선잠을 잤다.';out.push({t:'good',x:`생명력 +${h}`});} break;
      case 'drill': {const h=Math.round(s.maxHp*0.1);s.hp=Math.min(s.maxHp,s.hp+h);const k=['str','agi','int'][Math.floor(r()*3)];const dv=1+sk(s,'camp');s.stats[k]+=dv;text='달빛 아래서 수련했다.';out.push({t:'good',x:`생명력 +${h}`},{t:'good',x:`${STAT_NAMES[k]} +${dv}`});} break;
      default: if(n.kind==='tomb'){s.tomb=1;s.fame+=10;text='무덤에 경의를 표했다.';out.push({t:'fame',x:'명성 +10'});} else if(n.kind==='heroine'){s.fame-=1;text='못 본 척 지나쳤다.';out.push({t:'bad',x:'명성 -1'});} else text='그냥 지나쳤다.';
    }
  }
  if(s.keepNode){ s.keepNode=false; } else s.queue.shift();
  if(!s.dead && !s.queue.length){ nextRegion(s); if(s.transit&&s.transit.length){out.push(...s.transit);s.transit=[];} }
  queueSkill(s);
  if(!s.dead&&!s.over){ autoEssentials(s).forEach(it=>out.push({t:'item g'+it.grade,x:`자동 구매: ${it.name} (${it.d})`})); }
  prime(s);
  return {text,effects:out,node:n};
}
function advanceStage(s){
  if(!s.conquered||s.stage>=5) return false;
  s.carryBase=(s.carryBase||s.stageCarry)*CARRY_STEP[s.stage+1]; s.stage++;
  // 기준보다 강하게 들어온 용사는 적도 일부(제곱근 비율) 더 강해진다. 강할수록 유리하지만 압도하지는 못한다.
  const pn=power(s)/s.stageCarry, ref=CARRY_REF[s.stage]||1;
  s.enemyCarry=s.carryBase*Math.max(1,Math.pow(pn/ref,CARRY_ALPHA));
  // 이어지는 용사는 이미 강해졌으므로 전투력 배율을 새 세계 기준으로 맞춘다
  s.region=-1; s.queue=[]; s.killed=0; s.regionKilled=[]; s.pacified=[]; s.over=false; s.cleared=false; s.conquered=false; s.doneQ=[]; s.activeQuest=null;
  s.hp=Math.max(s.hp,Math.round(s.maxHp*0.6)); s.carried=(s.carried||0)+1; s.gritLeft=sk(s,'grit');
  nextRegion(s); queueSkill(s); prime(s); return true;
}
function enterHunt(s){
  if(!s.conquered||s.stage>=4) return false;
  s.huntFrom=s.stage; s.stage=HUNT_BASE+s.stage;
  s.region=-1; s.queue=[]; s.killed=0; s.regionKilled=[]; s.pacified=[]; s.over=false; s.cleared=false; s.conquered=false; s.activeQuest=null;
  s.hp=Math.max(s.hp,Math.round(s.maxHp*0.6)); s.gritLeft=sk(s,'grit'); nextRegion(s); queueSkill(s); prime(s); return true;
}
function leaveHunt(s){
  if(STAGES[s.stage].hunt==null||s.dead) return false;
  s.stage=s.huntFrom; s.conquered=true; return advanceStage(s);
}
// ---- 랭킹 검증용: 결정적 시드, 저장/불러오기, 재현 ----
const ENGINE_VERSION='1.2.0';
// 다음 결정의 무작위 요소(사건 종류, 탐험 문구)를 즉시 굴려 둔다. 화면이 current()를 몇 번 부르든 결과가 같아진다.
function prime(s){ if(s&&!s.dead&&!s.over) current(s); return s; }
function mixSeed(a,b){let h=((a>>>0)^Math.imul((b>>>0)+0x9e3779b9,0x85ebca6b))>>>0;h^=h>>>16;h=Math.imul(h,0x7feb352d)>>>0;h^=h>>>15;h=Math.imul(h,0x846ca68b)>>>0;h^=h>>>16;return h>>>0;}
function snapshotRun(s){const o={};for(const k in s){if(k==='r'||k==='queue'||k==='shop'||k==='transit'||k==='hero')continue;o[k]=s[k];}return JSON.parse(JSON.stringify(o));}
function restoreRun(snap,hero,seed){const run=JSON.parse(JSON.stringify(snap));run.hero=hero;run.r=rng(seed);
  Object.assign(run,{region:-1,queue:[],killed:0,regionKilled:[],pacified:[],over:false,dead:false,cleared:false,conquered:false,kills:run.kills||0});
  run.hp=run.maxHp;run.gritLeft=sk(run,'grit');nextRegion(run);queueSkill(run);prime(run);return run;}
function previewPowerAt(s,idx){const it=s.items[idx];if(!it)return null;const c=Object.assign({},s,{stats:Object.assign({},s.stats)});
  const p0=power(c);applyItem(c,it,-1);applyItem(c,Object.assign({},it,{plus:(it.plus||0)+1}),1);return [p0,power(c)];}
function runSummary(s){const st=STAGES[s.stage];const w=worldOf(s.stage);const fl=st.endless?floorOf(s):0;
  let label,score;
  if(st.endless&&st.hunt==null){label=`끝없는 전장 ${fl}층`;score=5000+fl;}
  else if(st.hunt!=null){label=`${STAGES[w].name} 정복 · 사냥터 ${fl}층`;score=w*1000+990+Math.min(fl,9)/1000;}
  else {const p=pct(s);label=`${st.name} ${p>=100?'100':p.toFixed(2)}%`+(s.conquered?' 정복':'');score=w*1000+(s.conquered?990:Math.min(989,p*9.8));}
  return {hero:s.hero.name,race:s.hero.race.name,kills:s.kills||0,power:Math.round(power(s)/s.stageCarry*10),reach:label,reachScore:Math.round(score*1000)/1000,stage:s.stage,floor:fl,dead:!!s.dead};}
function replayLog(log){
  if(!Array.isArray(log)||!log.length||log[0][0]!=='start') throw new Error('기록이 start로 시작하지 않는다');
  let hero=null,s=null,snap=null,loads=0,seed=0;
  for(let i=0;i<log.length;i++){const a=log[i];const op=a[0];
    if(op==='start'){ if(i!==0) throw new Error('start가 두 번 나왔다'); seed=a[1]>>>0; hero=makeHero(seed); s=newRun(hero,a[2]|0,mixSeed(seed,1)); continue; }
    if(op==='S'){ snap=snapshotRun(s); continue; }
    if(op==='L'){ if(!snap) throw new Error('저장 없이 불러오기'); loads++; s=restoreRun(snap,hero,mixSeed(seed,100+loads)); continue; }
    if(s.dead) throw new Error(`${i}번째 행동: 이미 끝난 판`);
    if(op==='c'){ if(s.over) throw new Error(`${i}번째 행동: 이미 끝난 판`); const c=current(s); if(!c) throw new Error(`${i}번째 행동: 결정할 것이 없다`);
      const o=c.options.find(x=>x.id===a[1]); if(!o||o.disabled) throw new Error(`${i}번째 행동: 고를 수 없는 선택지 ${a[1]}`); choose(s,a[1]); continue; }
    let ok=true;
    if(op==='b') ok=!!buy(s,a[1]|0); else if(op==='s') ok=!!sell(s,a[1]|0); else if(op==='e') ok=!!enhance(s,a[1]|0);
    else if(op==='n') ok=advanceStage(s); else if(op==='h') ok=enterHunt(s); else if(op==='l') ok=leaveHunt(s);
    else throw new Error(`${i}번째 행동: 알 수 없는 행동 ${op}`);
    if(!ok) throw new Error(`${i}번째 행동: ${op} 실행 불가`);
  }
  return {seed,startStage:log[0][2]|0,loads,actions:log.length,...runSummary(s)};
}
function pct(s){if(STAGES[s.stage].endless) return Math.max(0,s.region)+(s.dead||s.over?0:0);return s.cleared?100:Math.min(99.99,s.killed);}
function floorOf(s){return STAGES[s.stage].endless?Math.max(1,s.region+1):0;}

// auto policy (for simulation and 자동 결정)
function autoChoice(s,c){
  const n=c.node;
  if(n.type==='battle'){
    if(n.final||(n.boss&&STAGES[s.stage].endless)) return 'fight';
    const hpf=s.hp/s.maxHp;
    const evFight=n.p, evTalk=n.pt+(1-n.pt)*n.p*0.7*0.6;
    if(n.p>=0.55 && !(hpf<0.3 && n.pf>0.6 && !n.boss)) return 'fight';
    if(evTalk>evFight+0.05) return 'talk';
    if(!n.boss && !n.noFlee && n.pf>0.55 && hpf<0.7) return 'flee';
    if(n.boss && n.p<0.45 && hpf<0.4 && n.pf>0.5) return 'flee';
    return 'fight';
  }
  if(n.type==='skill') return 'sk:'+n.auto;
  const opts=c.options.filter(o=>!o.disabled);
  const hpf=s.hp/s.maxHp;
  if(n.type==='prep') return (s.gold>=n.gcost&&(n.boss.final||s.gold>n.gcost*2))?'hire':'go';
  if(n.type==='explore') return hpf>0.55?'deep':hpf>0.3?'careful':'skip';
  if(n.type==='rest') return hpf<0.75?'sleep':hpf<0.9?'guard':'drill';
  if(n.kind==='heroine') return opts[0].prob>0.35?'rescue':'pass';
  if(n.kind==='friend') return 'befriend';
  if(n.kind==='pet') return hpf>0.3?'tame':'pass';
  if(n.kind==='quest') return winProb(s,n.qE)>0.45?'accept':'decline';
  if(n.kind==='proposal') return 'marry';
  if(n.kind==='tomb') return hpf>0.35?'inherit':'pass';
  if(n.kind==='merchant') return (hpf<0.5&&s.gold>=n.cost)?'buy':'pass';
  if(n.kind==='altar') return opts.find(o=>o.id==='pray').prob>0.55?'pray':'smash';
  if(n.kind==='knight') return hpf>0.5?'heal':'loot';
  if(n.kind==='train') return hpf<0.55?'rest':(s.stats.str>=s.stats.agi?'tstr':'tagi');
  return 'open';
}
function autoEssentials(s){ if(!s.shop||s.dead||s.over) return [];
  const got=[];
  s.shop.forEach((o,i)=>{ if(!o.sold&&o.item.revive&&o.cur==='fame'&&revives(s)===0&&s.fame>=o.price){const it=buy(s,i); if(it) got.push(it);} });
  s.shop.forEach((o,i)=>{ if(o.sold||o.cur!=='gold'||s.gold<o.price) return;
    else if(o.item.heal && s.items.filter(x=>x.heal).length<2){const it=buy(s,i); if(it) got.push(it);} });
  return got; }
function autoShop(s){ return []; } // 장비 자동 구매 없음 (성수·부활의 깃털은 autoEssentials)
function isImportant(s,c,mode){
  if(mode==='manual') return true;
  if(mode==='auto') return false;
  const n=c.node;
  if(n.type==='skill') return true;
  if(n.type==='prep') return !!n.boss.final && mode!=='auto';
  if(n.type==='explore'||n.type==='rest') return false;
  if(n.type!=='battle') return ['heroine','friend','pet','quest','proposal','tomb'].includes(n.kind);
  if(n.quest) return true;
  if(mode==='boss') return n.boss;
  return n.boss || n.p<0.6 || (s.hp/s.maxHp<0.35 && n.p<0.8);
}
function autoRun(hero,stage,seed){const s=newRun(hero,stage,seed);let g=0;while(!s.dead&&!s.over&&g++<800){const c=current(s);if(!c)break;if(c.node.type==='rest')autoShop(s);choose(s,autoChoice(s,c));}return s;}
globalThis.FateEngine={ROLES,MASTERY,mastery,roleRanks,SKV,SKILL_BY,SKILLS,WORLD_TRAITS,sk,ENGINE_VERSION,mixSeed,snapshotRun,restoreRun,previewPowerAt,runSummary,replayLog,makeHero,newRun,current,choose,buy,sell,enhance,advanceStage,enterHunt,leaveHunt,STAGES};
if(typeof module!=='undefined') module.exports={ROLES,mastery,roleRanks,SKILLS,SKILL_BY,WORLD_TRAITS,sk,SKV,setSKV:o=>Object.assign(SKV,o),setDiff:a=>{DIFF=a},setGW:a=>{GW=a},setFreshSk:a=>{FRESH_SK=a},setEnhScale:v=>{ENH_SCALE=v},setFinalTries:v=>{FINAL_TRIES=v},wtrait,ENGINE_VERSION,mixSeed,snapshotRun,restoreRun,previewPowerAt,runSummary,replayLog,enterHunt,leaveHunt,worldOf,HUNT_BASE,setHuntStart:v=>{HUNT_START=v},setFresh:a=>{FRESH=a},setCarryRef:(a,al)=>{CARRY_REF=a;if(al!=null)CARRY_ALPHA=al;},powerOf:s=>power(s),GRADE_ENH,setBonusMin:v=>{BONUS_MIN=v},floorOf,setStep:a=>{CARRY_STEP=a},effLuk,effCha,RESIST,TIER_NAME,tierOf,setLvl:v=>{LVL_B=v},itemDescAt,enhance,enhCost,canEnhance,itemName,itemDesc,ENH_RATE,ENH_BREAK,wouldUpgrade,slotOf,procCurve,nextRegion,rng,luckProc,charmProc,setCarry:v=>{CARRY_ADJ=v},unpacified,setUnp:v=>{UNP_PEN=v},advanceStage,setLate:v=>{LATE=v},teamBonus,autoEssentials,revives,winParts,sell,sellPrice,fameBonus,buy,autoShop,GRADES,setFinal:v=>{FINAL_X=v},autoChoice,fameTitle,regionShare,isImportant,makeHero,newRun,current,choose,autoRun,pct,STAGES};
