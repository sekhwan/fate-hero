// ===== 운명의 용사 · 엔진 =====
const RACES = [
  {name:'인간', w:30, mod:{str:0,int:0,con:0,agi:0,cha:2,luk:0}, mult:1.0, note:'평범하지만 적응이 빠르다', p:{xp:0.2,talk:0.05}},
  {name:'엘프', w:14, mod:{str:-1,int:2,con:-1,agi:3,cha:2,luk:0}, mult:1.0, note:'민첩하고 말솜씨가 좋다', p:{talk:0.1,flee:0.1}},
  {name:'드워프', w:14, mod:{str:2,int:0,con:4,agi:-2,cha:-1,luk:0}, mult:1.0, note:'단단하고 손재주가 좋다', p:{hp:0.2,enh:0.05}},
  {name:'오크', w:12, mod:{str:5,int:-3,con:2,agi:0,cha:-3,luk:0}, mult:1.1, note:'힘이 넘치지만 말은 안 통한다', p:{talk:-0.1}},
  {name:'하플링', w:12, mod:{str:-3,int:1,con:0,agi:4,cha:2,luk:3}, mult:0.95, note:'작지만 운이 좋고 발이 빠르다', p:{flee:0.15}},
  {name:'고블린', w:8, mod:{str:-2,int:2,con:-2,agi:3,cha:-4,luk:1}, mult:0.88, note:'약하지만 셈이 빠르다', p:{gold:0.4,discount:0.1}},
  {name:'용인족', w:5, mod:{str:4,int:1,con:3,agi:0,cha:0,luk:0}, mult:1.12, note:'용의 피가 흐른다', p:{hp:0.1}},
  {name:'반천사', w:3, mod:{str:1,int:3,con:1,agi:1,cha:4,luk:0}, mult:1.15, note:'악마에게 천적이다', p:{boss:0.05}},
  {name:'망자', w:2, mod:{str:1,int:1,con:5,agi:-2,cha:-5,luk:-1}, mult:1.05, note:'한 번 더 죽을 수 있다', revive:1, p:{hp:0.15}},
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
  {name:'장사꾼 기질', w:5, gold:0.3, discount:0.05, good:true},
  {name:'손재주', w:4, enh:0.05, good:true},
  {name:'겁쟁이', w:9, mult:0.9, flee:0.15, good:false},
  {name:'길치', w:8, flee:-0.15, good:false},
  {name:'허약 체질', w:8, hp:-0.25, good:false},
  {name:'저주받은 운명', w:4, luk:-4, good:false},
  {name:'술고래', w:10, mult:0.95, good:false},
];
const HIDDEN = [
  {title:'전생한 마왕', race:'마족', note:'한때 악마들의 왕이었다. 악마들이 옛 주인을 알아본다.', job:'마왕', gender:'m', alt:'바알', boost:{str:8,int:10,con:8,agi:6,cha:12,luk:4}, mult:3.2, talk:0.35},
  {title:'검성', race:'인간', note:'천 년에 한 번 나는 검의 성인.', job:'검성', gender:'m', alt:'무영', boost:{str:14,int:4,con:8,agi:12,cha:4,luk:4}, mult:3.6},
  {title:'용왕의 후계자', race:'용인족', note:'고룡의 심장을 이어받았다.', job:'용기사', gender:'m', alt:'드라칸', boost:{str:12,int:6,con:16,agi:4,cha:6,luk:4}, mult:3.3, hp:1.0, revive:1},
  {title:'별에서 온 아이', race:'성인(星人)', note:'이 세계의 법칙이 잘 통하지 않는다.', job:'성운술사', gender:'f', alt:'스텔라', boost:{str:6,int:14,con:8,agi:8,cha:8,luk:14}, mult:3.0, revive:2},
];
const HEROINES=[
  {name:'성녀 엘리나', d:'지역을 넘을 때마다 생명력 30% 회복, 죽음에서 1회 구원', regen:0.3, save:1, meet:'마물에게 쫓기던 성녀 엘리나를 발견했다.'},
  {name:'마녀 릴리스', d:'회유 성공률 +15%p, 전투력 +10%', talk:0.15, mult:1.1, meet:'마녀 사냥꾼들에게 포위된 마녀 릴리스를 발견했다.'},
  {name:'여기사 세라', d:'전투력 +20%', mult:1.2, meet:'홀로 오우거와 싸우는 여기사 세라를 발견했다.'},
  {name:'엘프 궁수 아리엔', d:'전투력 +12%, 도망 성공률 +10%p', mult:1.12, flee:0.1, meet:'덫에 걸린 엘프 궁수 아리엔을 발견했다.'},
  {name:'무희 카르멘', d:'금화 +50%, 회유 성공률 +10%p', goldp:0.5, talk:0.1, meet:'노예 상인에게 끌려가는 무희 카르멘을 발견했다.'},
  {name:'성검의 무녀 하루', d:'지배자전 승률 +6%p, 전투력 +8%', boss:0.06, mult:1.08, meet:'봉인을 지키다 쓰러진 무녀 하루를 발견했다.'},
  {name:'용의 공주 이브', d:'최대 생명력 +30%, 전투력 +15%', hp:0.3, mult:1.15, meet:'쇠사슬에 묶인 용의 공주 이브를 발견했다.'},
];
const FRIENDS=[
  {name:'떠돌이 검사 카일', d:'전투력 +12%, 죽음의 일격을 1회 대신 막아줌', mult:1.12, save:1, meet:'주점에서 떠돌이 검사 카일이 함께 가자고 한다.'},
  {name:'드워프 대장장이 브론', d:'지역 10개를 넘을 때마다 무작위 능력치 +1', forge:1, meet:'드워프 대장장이 브론이 네 무기를 보더니 혀를 찬다.'},
  {name:'도둑 레오', d:'도망 성공률 +20%p, 금화 획득 2배', flee:0.2, gold:2, meet:'도둑 레오가 네 지갑을 훔치려다 붙잡혔다.'},
  {name:'수도사 한', d:'전투력 +5%, 승리할 때마다 생명력 10% 회복', mult:1.05, heal:0.1, meet:'길 위에서 탁발하는 수도사 한을 만났다.'},
  {name:'현자 오르빈', d:'경험치 +40%, 강화 확률 +5%p', xp:0.4, enh:0.05, meet:'길가 바위에 앉은 노현자 오르빈이 말을 건다.'},
];
const PETS=[
  {name:'아기 드래곤 루비', d:'전투력 +8%, 지역 10개마다 +5%씩 성장 (최대 +40%)', mult:1.08, grow:0.05, growCap:0.4, meet:'부서진 알 껍질 옆에서 아기 드래곤이 울고 있다.'},
  {name:'늑대 회색이', d:'전투력 +6%, 도망 실패 시 1회 구출', mult:1.06, fleeSave:1, meet:'덫에 다리가 걸린 회색 늑대가 으르렁거린다.'},
  {name:'요정 반딧불', d:'행운 +4, 함정을 피하게 해줌', luk:4, trap:1, meet:'유리병에 갇힌 요정이 창을 두드린다.'},
  {name:'검은 고양이 망토', d:'승리확률 30% 미만 싸움에서 승리확률 +6%p', underdog:0.06, meet:'검은 고양이 한 마리가 계속 뒤를 따라온다.'},
  {name:'황금 두꺼비 금복이', d:'금화 +30%, 행운 +2', goldp:0.3, luk:2, meet:'금화 더미 위에 앉은 두꺼비가 눈을 끔뻑인다.'},
];
const SPOUSES=[
  {name:'영주의 딸 리아', d:'전투력 +15%, 최대 생명력 +20%', mult:1.15, hp:0.2},
  {name:'길드장의 제자 노엘', d:'경험치 +30%, 회유 성공률 +10%p', xp:0.3, talk:0.1},
  {name:'공주 이사벨', d:'전투력 +20%, 금화 +30%', mult:1.2, goldp:0.3},
  {name:'성녀 마리엘', d:'최대 생명력 +40%, 지배자전 승률 +4%p', hp:0.4, boss:0.04},
  {name:'대장장이의 딸 미라', d:'강화 확률 +8%p', enh:0.08},
  {name:'상단주의 딸 로사', d:'금화 +60%, 상점 가격 -10%', goldp:0.6, discount:0.1},
  {name:'사냥꾼 카야', d:'전투력 +10%, 도망 성공률 +15%p', mult:1.1, flee:0.15},
  {name:'점성술사 시엘', d:'행운 +6, 모든 전투 승률 +3%p', luk:6, win:0.03},
  {name:'검성의 손녀 유나', d:'전투력 +25%', mult:1.25},
  {name:'해적 여왕 바네사', d:'금화 +40%, 전투력 +10%', goldp:0.4, mult:1.1},
];
const HEROES_M=[
  {name:'성기사 가브리엘', d:'최대 생명력 +25%, 지배자전 승률 +4%p', hp:0.25, boss:0.04, meet:'언데드 무리에 홀로 맞서는 성기사 가브리엘을 발견했다.'},
  {name:'흑마법사 모르간', d:'경험치 +25%, 회유 성공률 +10%p', xp:0.25, talk:0.1, meet:'금서를 품고 쫓기는 흑마법사 모르간을 발견했다.'},
  {name:'용병대장 바르크', d:'전투력 +10%, 모든 전투 승률 +3%p', mult:1.1, win:0.03, meet:'부하를 모두 잃고 쓰러진 용병대장 바르크를 발견했다.'},
  {name:'레인저 테론', d:'도망 성공률 +20%p, 행운 +3', flee:0.2, luk:3, meet:'숲 가장자리에서 레인저 테론이 활을 겨눈다.'},
  {name:'음유시인 로웰', d:'회유 성공률 +15%p, 금화 +25%', talk:0.15, goldp:0.25, meet:'광장에서 노래하던 음유시인 로웰이 따라나선다.'},
  {name:'봉인의 수호자 진', d:'지배자전 승률 +7%p', boss:0.07, meet:'무너진 봉인 앞을 지키는 수호자 진을 발견했다.'},
  {name:'용의 왕자 아르칸', d:'전투력 +20%, 최대 생명력 +15%', mult:1.2, hp:0.15, meet:'쇠사슬에 묶인 용의 왕자 아르칸을 발견했다.'},
];
const SPOUSES_M=[
  {name:'영주의 아들 레온', d:'지배자전 승률 +5%p, 전투력 +12%', boss:0.05, mult:1.12},
  {name:'길드장의 제자 에른', d:'강화 확률 +5%p, 경험치 +15%', enh:0.05, xp:0.15},
  {name:'왕자 이사크', d:'금화 +40%, 회유 성공률 +10%p', goldp:0.4, talk:0.1},
  {name:'성기사 단장 미카엘', d:'최대 생명력 +35%, 모든 전투 승률 +2%p', hp:0.35, win:0.02},
  {name:'대장장이의 아들 토르발', d:'강화 확률 +6%p, 상점 가격 -5%', enh:0.06, discount:0.05},
  {name:'상단주의 아들 마르코', d:'금화 +50%, 행운 +3', goldp:0.5, luk:3},
  {name:'사냥꾼 우르', d:'도망 성공률 +20%p, 행운 +2', flee:0.2, luk:2},
  {name:'점성술사 오리온', d:'경험치 +40%', xp:0.4},
  {name:'검성의 손자 한', d:'전투력 +18%, 최대 생명력 +10%', mult:1.18, hp:0.1},
  {name:'해적 선장 드레이크', d:'금화 +35%, 전투력 +8%, 도망 성공률 +5%p', goldp:0.35, mult:1.08, flee:0.05},
];
// 희귀 동료: 그 종류의 동료가 나올 때 1% 확률로 대신 나온다. 효과는 일반 동료의 약 2배.
const RARE_P=0.01;
const RARE={
  pet:{name:'고룡의 새끼 아우룸', d:'전투력 +16%, 행운 +3', mult:1.16, luk:3, rare:1, meet:'황금빛 알이 갈라지며 고룡의 새끼가 눈을 떴다.'},
  friend:{name:'은둔한 대장장이 볼칸', d:'전투력 +15%, 경험치 +40%, 강화 확률 +8%p', mult:1.15, xp:0.4, enh:0.08, rare:1, meet:'화산 기슭의 대장간에서 전설의 대장장이 볼칸이 망치를 내려놓는다.'},
  heroine_m:{name:'여신의 화신 세레스', d:'전투력 +25%, 지역을 넘을 때마다 생명력 20% 회복', mult:1.25, regen:0.2, rare:1, meet:'빛기둥 속에서 여신의 화신 세레스가 내려왔다.'},
  heroine_f:{name:'봉인된 천사 루시엘', d:'지배자전 승률 +12%p, 모든 전투 승률 +4%p', boss:0.12, win:0.04, rare:1, meet:'부서진 성당 제단에서 봉인된 천사 루시엘이 눈을 떴다.'},
  spouse_m:{name:'망국의 공주 아델라', d:'전투력 +30%, 금화 +50%', mult:1.3, goldp:0.5, rare:1},
  spouse_f:{name:'기사왕 알렉', d:'최대 생명력 +40%, 지배자전 승률 +5%p', hp:0.4, boss:0.05, rare:1},
};
const RARE_ALL=[RARE.heroine_m,RARE.heroine_f,RARE.friend,RARE.pet,RARE.spouse_m,RARE.spouse_f];
// 용사 성별에 따라 히로인 자리·배우자가 바뀐다 (남성 용사 → 여성 동료, 여성 용사 → 남성 동료). 희귀 동료는 목록 맨 끝.
function heroList(s){return s.hero.gender==='f'?HEROES_M:HEROINES;}
function spList(s){return s.hero.gender==='f'?[...SPOUSES_M,RARE.spouse_f]:[...SPOUSES,RARE.spouse_m];}
function rareNames(s){return [s.comp.heroine,s.comp.friend,s.comp.pet,s.spouseC].filter(c=>c&&c.rare).map(c=>c.name);}
function spOf(s,n){return spList(s)[n.sp||0];}
function rareOf(s,k){return k==='heroine'?(s.hero.gender==='f'?RARE.heroine_f:RARE.heroine_m):RARE[k];}
// 동료·배우자의 신분·종족 제한. minW/maxW는 신분 순서(0 빈털터리 … 5 왕족), no는 받아주지 않는 종족, only는 이 종족(또는 minW 이상)만.
const WEALTH_IX=n=>Math.max(0,WEALTH.findIndex(w=>w.name===n));
// 신분이 높을수록 만날 수 있는 동료가 많고 강하다. 나쁜 특성은 일부 동료가 거부하고, 합류 확률도 깎는다.
const COMP_REQ={
  '성기사 가브리엘':{minW:2,no:['망자','마족'],why:'중산층 이상 · 망자·마족 거부'},
  '음유시인 로웰':{minW:1,why:'서민 이상 · 노래값을 낼 수 있어야 한다'},
  '봉인의 수호자 진':{minW:3,no:['망자','마족'],why:'부유층 이상 · 망자·마족 거부'},
  '용의 왕자 아르칸':{minW:4,orRace:['용인족'],why:'귀족 이상 또는 용인족'},
  '여기사 세라':{minW:1,noTr:['겁쟁이'],why:'서민 이상 · 겁쟁이와는 검을 나란히 하지 않는다'},
  '마녀 릴리스':{no:['반천사'],why:'반천사 거부'},
  '엘프 궁수 아리엔':{no:['오크','고블린'],noTr:['술고래'],why:'오크·고블린 거부 · 술 냄새를 싫어한다'},
  '무희 카르멘':{minW:2,why:'중산층 이상 · 몸값을 치를 수 있어야 한다'},
  '성녀 엘리나':{minW:2,no:['망자','마족'],noTr:['저주받은 운명'],why:'중산층 이상 · 망자·마족 거부 · 저주받은 운명을 꺼린다'},
  '성검의 무녀 하루':{minW:3,no:['망자','마족'],noTr:['겁쟁이'],why:'부유층 이상 · 망자·마족 거부 · 겁쟁이 거부'},
  '용의 공주 이브':{minW:4,orRace:['용인족'],why:'귀족 이상 또는 용인족'},
  '떠돌이 검사 카일':{noTr:['겁쟁이'],why:'겁쟁이와는 같이 다니지 않는다'},
  '드워프 대장장이 브론':{minW:1,no:['엘프'],why:'서민 이상 · 엘프 거부(오랜 앙숙)'},
  '수도사 한':{no:['망자'],noTr:['술고래'],why:'망자 거부 · 술고래 거부'},
  '현자 오르빈':{minW:2,why:'중산층 이상 · 배움에 투자할 수 있는 자만 가르친다'},
  '영주의 딸 리아':{minW:2,no:['오크','고블린'],why:'중산층 이상 · 오크·고블린 거부'},
  '길드장의 제자 노엘':{minW:1,why:'서민 이상'},
  '공주 이사벨':{minW:4,no:['오크','드워프','고블린','망자'],why:'귀족 이상 · 오크·드워프·고블린·망자 거부'},
  '성녀 마리엘':{minW:2,no:['망자','마족'],noTr:['술고래'],why:'중산층 이상 · 망자·마족 거부 · 술고래 거부'},
  '상단주의 딸 로사':{minW:3,why:'부유층 이상'},
  '사냥꾼 카야':{noTr:['겁쟁이'],why:'겁쟁이 거부'},
  '점성술사 시엘':{noTr:['저주받은 운명'],why:'저주받은 운명은 별이 허락하지 않는다'},
  '검성의 손녀 유나':{minW:3,noTr:['겁쟁이','허약 체질'],why:'부유층 이상 · 겁쟁이·허약 체질 거부'},
};
function compOk(s,c){const q=COMP_REQ[c.name];if(!q)return true;const w=WEALTH_IX(s.hero.wealth.name),r=s.hero.race.name;
  if(q.no&&q.no.includes(r))return false;if(q.noTr&&q.noTr.some(t=>hasTrait(s.hero,t)))return false;
  if(q.minW!=null&&w<q.minW&&!(q.orRace&&q.orRace.includes(r)))return false;return true;}
// 합류 확률 보정: 신분 한 단계마다 +5%p(빈털터리 -5%p … 왕족 +20%p), 나쁜 특성 하나마다 -8%p
function compJoinAdj(s){const w=WEALTH_IX(s.hero.wealth.name);const bad=s.hero.traits.filter(t=>t.good===false).length;return (w-1)*0.05-bad*0.08;}
function compPool(s,list){return list.filter(c=>compOk(s,c));}
const QPICK=[['str','무기 (힘)'],['con','방패 (체력)'],['agi','장화 (민첩)'],['int','마법서 (지능)'],['cha','장신구 (매력)'],['luk','행운 부적 (행운)'],['mult','인장 (전투력)'],['win','깃발 (승리 확률)'],['flee','도주 장비 (도망)']];
let QUEST_E=3.5;
const QUESTS=[
  {giver:'영주', rel:'영주의 딸 리아', task:'영지를 습격하는 오우거 군단', min:30},
  {giver:'마법사 길드장', rel:'길드장의 제자 노엘', task:'금서를 훔친 리치', min:50},
  {giver:'왕', rel:'공주 이사벨', task:'왕도를 위협하는 마룡', min:80},
  {giver:'대주교', rel:'대성당의 성녀 마리엘', task:'대성당 지하의 고위 악마', min:110},
];
const FAME_TITLES=[[-1e9,'악명 높은 자'],[0,'무명'],[20,'마을의 이름'],[60,'지방의 영웅'],[150,'왕국의 영웅'],[400,'살아있는 전설']];
function fameTitle(f){let t=FAME_TITLES[0][1];for(const [m,n] of FAME_TITLES) if(f>=m) t=n; return t;}
const DEMON_W=1.12;
let HUNT_START=0.3; let FINAL_X=0.8; let FINAL_TRIES=3; let LVL_B=0.015; let BASE_K=1.86; let INT_XP=0.03, INT_SK=0.01; let ITEM_MULT=1/6; const MERC_K=0.5; let FLOOR=0.12; let LATE=1; let BOSS_X=0.82;
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
  {id:3,name:'전설',cls:'g3',stat:30,mult:1.75,gold:1400,fame:180}, // 기본은 영웅의 약 2.7~3배, +7은 +6의 약 1.8배
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
const TIER_STAT=[1,1.2,1.4,1.6,1.85];
function tierOf(s){return Math.min(worldOf(s.stage),4);}
function itemNameOf(k,grade,tier){return tier?`${TIER_PRE[tier][grade]} ${TIER_NOUN[tier][k]}`:ITEM_NAMES[k][grade];}
// 전설 추가 옵션: 기본 옵션(주 능력치) 외에 무작위 1~2개. 전투력에 직접 곱해지지 않는 것만 둔다(인플레 방지)
// [키, 이름, 최소, 최대, 단위('%p' 또는 '%'), 착용 전설 합계 상한]
const AFF=[['boss','지배자전 승률',0.02,0.05,'%p',0.15],['xp','경험치',0.05,0.15,'%',0.6],['gold','금화 획득',0.08,0.20,'%',0.6],['fame','명성 획득',0.08,0.20,'%',0.6],
  ['talk','회유 확률',0.03,0.08,'%p',0.2],['flee','도망 확률',0.04,0.10,'%p',0.25],['enh','강화 성공률',0.02,0.05,'%p',0.1],['leg','전설 발견',0.10,0.25,'%',0.75],
  ['sk','스킬 공격',0.02,0.05,'%p',0.12],['dmg','패배 피해 감소',0.05,0.12,'%',0.3]];
const AFF_BY={};AFF.forEach(a=>AFF_BY[a[0]]=a);
function rollAff(r){const n=r()<0.5?1:2;const pool=AFF.map(a=>a[0]);const out=[];for(let i=0;i<n;i++){const k=pool.splice(Math.floor(r()*pool.length),1)[0];const a=AFF_BY[k];const v=Math.round((a[2]+(a[3]-a[2])*r())*1000)/1000;out.push({k,v});}return out;}
function affTxt1(x){const a=AFF_BY[x.k];if(!a)return '';const pv=x.v*100;return `${a[1]} ${x.k==='dmg'?'-':'+'}${pv<10?pv.toFixed(1).replace(/\.0$/,''):Math.round(pv)}${a[4]}`;}
function affTxt(it){return it&&it.aff&&it.aff.length?it.aff.map(affTxt1).join(' · '):'';}
// 착용 중인(예비 아닌) 전설의 추가 옵션 합계(상한 적용)
function affSum(s,k){if(!s||!s.items)return 0;let v=0;for(const it of s.items){if(it.spare||!it.aff)continue;for(const x of it.aff)if(x.k===k)v+=x.v;}const a=AFF_BY[k];return a?Math.min(v,a[5]):v;}
function makeItem(r,grade,kind,tier){const it=makeItem0(r,grade,kind,tier);if((it.grade||0)===3&&slotOf(it))it.aff=rollAff(r);return it;}
function makeItem0(r,grade,kind,tier){
  tier=tier||0; const g=GRADES[grade];
  if(kind==='heal') return {name:'성수 한 병',grade:0,heal:1,d:'쓰러질 때 생명력 40% 회복'};
  if(kind==='revive') return {name:'부활의 깃털',grade:Math.max(1,grade),revive:1,d:'사망 시 1회 부활'};
  const keys=['str','con','agi','int','cha','luk','mult','win','flee'];
  const k=kind||keys[Math.floor(r()*keys.length)];
  const base={grade,tier}; const q=grade>=2?Math.round((0.8+r()*0.4)*100)/100:1; if(q!==1)base.q=q;
  if(k==='mult'){const m=1+(g.mult-1)*(1+0.45*tier)*q;return Object.assign(base,{name:itemNameOf('mult',grade,tier),mult:m,d:`전투력 +${pctTxt((m-1)*ITEM_MULT)}%`});}
  if(k==='win'){const v=[0.02,0.04,0.06,0.10][grade]*q;return Object.assign(base,{name:itemNameOf('win',grade,tier),win:v,d:`승리확률 +${Math.round(v*100)}%p`});}
  if(k==='flee'){const v=[0.05,0.12,0.22,0.40][grade]*q;return Object.assign(base,{name:itemNameOf('flee',grade,tier),flee:v,d:`도망 확률 +${Math.round(v*100)}%p`});}
  const sv=Math.max(1,Math.round(((k==='cha'||k==='luk')?[1,3,6,11][grade]:g.stat*TIER_STAT[tier])*q));
  return Object.assign(base,{name:itemNameOf(k,grade,tier),stat:k,v:sv,d:`${STAT_NAMES[k]} +${sv}`});
}
function rollGrade(r,bonus,lm){const b=clamp(bonus||0,0,1);const w=[70*(1-0.5*b),26+6*b,GW[0]+GW[1]*b,(GW[2]+GW[3]*b)*(1+(lm||0))];let v=r()*w.reduce((a,c)=>a+c,0);for(let i=0;i<4;i++){if((v-=w[i])<=0)return i;}return 0;}
const SHOP_LEG_LATE=0.01; // 상점 하나에 전설이 나올 확률 약 2%
function makeShop(s){
  const r=s.r, sc=econ(s,1.3), out=[];
  const tr=tierOf(s);
  if(r()<0.5) out.push({item:makeItem(r,0,'heal'),cur:'gold',price:Math.round(110*sc*Math.max(0.35,1-SKV.discount*sk(s,'merchant')-tsum(s,'discount',0)))});
  const dc=Math.max(0.35,1-SKV.discount*sk(s,'merchant')-tsum(s,'discount',0));
  for(let i=0;i<2;i++){const g=rollGrade(r,0.1+SKV.appraise*sk(s,'appraise')+cmb(s,'gradeB',0),cmb(s,'legend',0));out.push({item:makeItem(r,g,null,tr),cur:'gold',price:Math.round(GRADES[g].gold*sc*dc)});}
  // 명성 상점 전설: 본 세계 칸당 0.3%, 사냥터·끝없는 전장 칸당 1% (신화 합성 재료용)
  const lp=(STAGES[s.stage].endless||STAGES[s.stage].hunt!=null)?SHOP_LEG_LATE:0.003;
  for(let i=0;i<2;i++){const x=r();const gg=x<lp*(1+cmb(s,"legend",0))?3:x<0.12?2:1;out.push({item:makeItem(r,gg,null,tr),cur:'fame',price:Math.round(GRADES[gg].fame*(1+s.stage*0.5)*(gg===3?2.5:1))});} // 전설은 명성 가격 2.5배
  if(r()<0.12) out.push({item:makeItem(r,1,'revive'),cur:'fame',price:Math.round(80*(1+s.stage*0.5))});
  return out;
}
function slotOf(it){return it.stat||(it.mult?'mult':it.win?'win':it.flee?'flee':null);}
// 강화: +10이면 기본 수치의 3배
const ENH_BONUS=[0,0.15,0.35,1.5,3,5,8,12,18,26,40];
// 전설 전용 강화 곡선: +6까지는 완만(같은 강화의 영웅보다 약 1.5배), +7부터 급격히 뛴다
// 전설 강화 배율(×0.3 적용 전). 공허 전설 능력치 장비 기준 +6 ≈111, +7 ≈200, +9 ≈300, +10 ≈400
const ENH_BONUS_LEG=[0,0.33,0.67,1.17,1.67,2.33,3.33,8.67,11.67,14.67,20.67]; // +7은 +6의 약 1.8배
const ENH_RATE=[0.9,0.8,0.7,0.6,0.5,0.4,0.33,0.26,0.2,0.15];
const ENH_BREAK={1:1,2:1,3:1,4:1,5:1,6:1,7:1,8:1,9:1};
const GRADE_ENH=[0.15,0.35,0.7,1.0]; // 등급별 강화 효율: 일반 15%, 희귀 35%, 영웅 70%, 전설 100%
let ENH_SCALE=0.3;
function enhB(it){return ((it.grade||0)===3?ENH_BONUS_LEG:ENH_BONUS)[it.plus||0]*GRADE_ENH[it.grade||0]*ENH_SCALE;}
function enhF(it){return 1+enhB(it);}
function effV(it){const b=it.boost||1;if(b!==1&&it.v){const r=effVRaw(it);return Math.max(r,Math.round(r*b));}return effVRaw(it);}
function effVRaw(it){if(!it.v)return 0;const pl=it.plus||0,soft=it.stat==='cha'||it.stat==='luk';return Math.max(it.v+pl,Math.round(it.v*(soft?1+enhB(it)*0.2:enhF(it))));} // 강화 1단계마다 최소 +1
// 장비 전투력% 효과는 ITEM_MULT(1/3)만 반영한다 (설명에 나오는 수치도 이 값)
function effMult(it){const m=effMultRaw(it);return 1+(m-1)*(it.boost||1)*ITEM_MULT;}
function effMultRaw(it){if(!it.mult)return 1;const pl=it.plus||0;return 1+Math.max((it.mult-1)*enhF(it),(it.mult-1)+0.01*pl);}
function effWin(it){return effWinRaw(it)*(it.boost||1);}
function effWinRaw(it){if(!it.win)return 0;const pl=it.plus||0;return Math.max(it.win*(1+enhB(it)*0.2),it.win+0.005*pl);}
function effFlee(it){return effFleeRaw(it)*(it.boost||1);}
function effFleeRaw(it){if(!it.flee)return 0;const pl=it.plus||0;return Math.max(it.flee*enhF(it),it.flee+0.01*pl);}
function itemVal(it){return it.v?effV(it):it.mult?effMult(it)-1:it.win?effWin(it):it.flee?effFlee(it):0;}
function itemName(it){return (it.plus?`+${it.plus} `:'')+it.name;}
// 실제로 착용했을 때의 수치 (재물 숙련의 장비 효과 보너스 포함)
function itemTxt(s,it){if(!slotOf(it))return it.d;const b=1+SKV.mItem[mastery(s,'재물')];return itemDesc(Object.assign({},it,{boost:b}))+(b>1?` (재물 숙련 +${Math.round((b-1)*100)}% 포함)`:'');}
// 10% 미만은 소수점 한 자리까지 보여 준다 (강화 1단계 차이도 보이게)
function pctTxt(v){const p=v*100;return p<10?(Math.round(p*10)/10).toFixed(1):String(Math.round(p));}
function itemDescAt(it,plus){const c=Object.assign({},it,{plus});return itemDesc(c);}
function itemDesc(it){const ad=affTxt(it);return ad?itemDesc0(it)+' · '+ad:itemDesc0(it);}
function itemDesc0(it){if(it.heal||it.revive)return it.d;if(it.stat)return `${STAT_NAMES[it.stat]} +${effV(it)}`;if(it.mult)return `전투력 +${pctTxt(effMult(it)-1)}%`;if(it.win)return `승리확률 +${(effWin(it)*100).toFixed(it.plus?1:0)}%p`;return `도망 확률 +${(effFlee(it)*100).toFixed(it.plus?1:0)}%p`;}
const ENH_BASE=[20,35,60,100];
// 전설 장비 강화는 강화비에 보유 금화의 10%가 더해진다
const ENH_TAX_FROM=5, ENH_TAX=0; // 금화 경제 재조정 뒤 전설 강화의 보유 금화 비례 비용은 없앴다
function enhCostParts(s,it){const P=econP(s);const base=Math.round(ENH_BASE[it.grade||0]*(1+0.6*(it.plus||0))*econ(s,1.22)*Math.pow(1.105/1.077,Math.max(0,P-14)));const tax=(it.grade||0)>=3?Math.floor(Math.max(0,s.gold)*ENH_TAX):0;return {base,tax,total:base+tax};}
function enhCost(s,it){return enhCostParts(s,it).total;}
// 실제 강화 성공 확률과 그 구성 (화면에 그대로 보여 준다)
function enhRate(s,from){const parts=[['기본',ENH_RATE[from]]];const a=SKV.smith*sk(s,'smith'),b=SKV.mEnh[mastery(s,'재물')],c=tsum(s,'enh',0);
  if(a)parts.push(['대장장이 스킬',a]);if(b)parts.push(['재물 숙련',b]);if(c)parts.push(['종족·특성',c]);
  const raw=parts.reduce((x,y)=>x+y[1],0);return {rate:Math.min(0.95,raw),parts,capped:raw>0.95};}
function canEnhance(it){return !!slotOf(it)&&(it.plus||0)<10;}
function enhance(s,idx){
  const it=s.items[idx]; if(!it||!canEnhance(it)) return null;
  const cost=enhCost(s,it); if(s.gold<cost) return null;
  s.gold-=cost; const from=it.plus||0; const rate=enhRate(s,from).rate; const roll=s.r();
  applyItem(s,it,-1);
  let res;
  if(roll<rate){ it.plus=from+1; res={ok:true,from,to:it.plus}; if(it.plus>=COMBO_PLUS&&COMBO_ITEMS.has(it.name)){noteGot(s,it);checkCombos(s,null);} }
  else if(ENH_BREAK[from] && s.r()<ENH_BREAK[from] && !(sk(s,'ward')&&s.r()<wardP(sk(s,'ward')))){ s.items.splice(idx,1); normSlots(s,applyItem); return {ok:false,destroyed:true,from,cost,name:it.name}; }
  else if(from>=3||(ENH_BREAK[from]&&sk(s,'ward'))){ it.plus=Math.max(0,from-1); res={ok:false,from,to:it.plus,warded:from<3||undefined}; }
  else res={ok:false,from,to:from};
  applyItem(s,it,1); normSlots(s,applyItem); res.cost=cost; res.name=it.name; res.it=it; return res;
}
function applyItem(s,it,sign){ if(it.spare) return; // 예비 전설은 효과 없음
  if(it.stat){s.stats[it.stat]=Math.max(1,s.stats[it.stat]+sign*effV(it)); if(it.stat==='con'){const o=s.maxHp;s.maxHp=hpMax(s);s.hp=sign>0?s.hp+(s.maxHp-o):Math.min(s.hp,s.maxHp);}}
  if(it.mult){const m=effMult(it); s.multItems*=sign>0?m:1/m;}
}
// 같은 부위(능력치·전투력·승률·도망)는 하나만 착용한다. 더 좋은 것이 들어오면 기존 것은 자동으로 판다.
function wouldUpgrade(s,it){const slot=slotOf(it);if(!slot)return true;it.boost=1+SKV.mItem[mastery(s,'재물')];const old=s.items.find(x=>slotOf(x)===slot&&!x.spare);return !old||(!old.pin&&itemVal(it)>itemVal(old));}
// 전설은 착용품보다 약하거나 같은 부위가 있어도 예비로 보관한다 (신화 합성 재료로 모을 수 있게)
const SPARE_MAX=12;function spareCount(s){return s.items.filter(x=>x.spare).length;}
function canKeepSpare(s,it){return (it.grade||0)===3&&!!slotOf(it)&&(spareCount(s)<SPARE_MAX||!!s.spareForce||!!s.buyKeep);}
// 상점의 전설 장비는 보유품과 예비 칸 수에 관계없이 언제나 살 수 있다(사면 예비로 보관된다)
function shopLegend(it){return (it.grade||0)===3&&!!slotOf(it);}
// 같은 부위에서 가장 좋은 것을 착용하고 나머지 전설은 예비로 둔다
function normSlots(o,ap){const by={};for(const it of o.items){const sl=slotOf(it);if(sl)(by[sl]=by[sl]||[]).push(it);}
  for(const sl in by){const a=by[sl];if(a.length<2&&!a[0].spare)continue;let best=a[0];for(const it of a)if(itemVal(it)>itemVal(best)||(itemVal(it)===itemVal(best)&&!it.spare&&best.spare))best=it;{const pn=a.find(x=>x.pin);if(pn)best=pn;}
    for(const it of a){if(it===best&&it.spare){it.spare=false;ap(o,it,1);}else if(it!==best&&!it.spare){ap(o,it,-1);it.spare=true;}}}}
function equip(s,it){
  s.lastEquipNote=null; if(!it.uid){s.uidN=(s.uidN||0)+1;it.uid=s.uidN;}
  if((it.heal&&s.items.some(x=>x.heal))||(it.revive&&revives(s)>=REVIVE_MAX)){const g=sellPrice(s,it);s.gold+=g;s.lastEquipNote=`${it.name}은(는) 더 지닐 수 없어 금화 ${g}에 팔았다`;return false;} const slot=slotOf(it); if(slot) it.boost=1+SKV.mItem[mastery(s,'재물')];
  if(slot){ const idx=s.items.findIndex(x=>slotOf(x)===slot&&!x.spare);
    if(idx>=0){ const old=s.items[idx];
      if(old.pin||itemVal(it)<=itemVal(old)){ if(canKeepSpare(s,it)){it.spare=true;s.items.push(it);s.lastEquipNote=old.pin?`📌 고정한 ${old.name}을(를) 착용 중이라 ${it.name}은(는) 예비 전설로 보관했다`:`${it.name}은(는) 착용품보다 약해 예비 전설로 보관했다 (신화 합성 재료)`;return true;}
        if((it.grade||0)===3&&slotOf(it)){const sw=spareSwap(s,it);if(sw)return true;const g=sellPrice(s,it); s.gold+=g; s.lastEquipNote=`예비 전설 칸 ${SPARE_MAX}개가 가득 찼고 ${it.name}이(가) 그중 가장 약해 금화 ${g}에 팔았다`; return false;}
        const g=sellPrice(s,it); s.gold+=g; s.lastEquipNote=old.pin?`📌 고정한 ${old.name}을(를) 착용 중이라 ${it.name}은(는) 금화 ${g}에 팔았다`:`이미 더 좋은 ${old.name}을(를) 착용 중이라 금화 ${g}에 팔았다`; return false; }
      if(canKeepSpare(s,old)){ applyItem(s,old,-1); old.spare=true; s.lastEquipNote=`${old.name}을(를) 예비 전설로 돌리고 새 장비를 착용했다`; }
      else { applyItem(s,old,-1); s.items.splice(idx,1); const g=sellPrice(s,old); s.gold+=g; s.lastEquipNote=`${old.name}을(를) 교체하고 금화 ${g}에 팔았다`; } } }
  applyItem(s,it,1); s.items.push(it); return true;
}
// 예비 전설 칸이 가득 찼을 때: 새 전설이 가장 약한 예비보다 좋으면(강화 수치 우선) 그 예비를 팔고 새 전설을 보관한다
function spareSwap(s,it){const sp=s.items.filter(x=>x.spare);if(!sp.length)return false;const key=x=>(x.plus||0)*1e6+itemVal(x);let w=sp[0];for(const x of sp)if(key(x)<key(w))w=x;if(key(it)<=key(w))return false;
  s.items.splice(s.items.indexOf(w),1);const g=sellPrice(s,w);s.gold+=g;it.spare=true;s.items.push(it);s.lastEquipNote=`예비 전설 칸이 가득 차 가장 약한 ${w.name}(+${w.plus||0})을(를) 금화 ${g}에 팔고 ${it.name}을(를) 예비로 보관했다`;return true;}
// 예비 전설을 직접 착용한다(📌 고정: 더 높은 수치가 들어와도 자동 교체하지 않는다)
function wearSpare(s,idx){const it=s.items[idx];if(!it||!it.spare||(it.grade||0)!==3)return false;const sl=slotOf(it);if(!sl)return false;
  const cur=s.items.find(x=>slotOf(x)===sl&&!x.spare);
  if(cur){applyItem(s,cur,-1);cur.pin=0;if((cur.grade||0)===3){cur.spare=true;}else{s.items.splice(s.items.indexOf(cur),1);s.gold+=sellPrice(s,cur);}}
  it.spare=false;it.pin=1;applyItem(s,it,1);return true;}
// 고정을 푼다: 같은 부위에서 수치가 가장 높은 것으로 다시 자동 착용한다
function unpinItem(s,idx){const it=s.items[idx];if(!it||!it.pin||it.spare)return false;it.pin=0;normSlots(s,applyItem);return true;}
function holdFull(s,it){return !!((it.heal&&s.items.some(x=>x.heal))||(it.revive&&revives(s)>=REVIVE_MAX));}
function sellPrice(s,it){const sc=econ(s,1.3);return Math.max(5,Math.round((it.heal?110:GRADES[it.grade||0].gold)*sc*0.4*(1+0.6*(it.plus||0))*GOLD_IN));}
function sell(s,idx){
  const it=s.items[idx]; if(!it) return null;
  applyItem(s,it,-1);
  const g=sellPrice(s,it); s.items.splice(idx,1); s.gold+=g; normSlots(s,applyItem); return {it,g};
}
function buy(s,idx){
  const o=s.shop&&s.shop[idx]; if(!o||o.sold) return null; if(holdFull(s,o.item)) return null;
  const have=o.cur==='gold'?s.gold:s.fame; if(have<o.price||!(wouldUpgrade(s,o.item)||canKeepSpare(s,o.item)||shopLegend(o.item))) return null;
  if(o.cur==='gold') s.gold-=o.price; else s.fame-=o.price;
  o.sold=true; noteGot(s,o.item); o.item.src=o.cur==='gold'?'상점 구매 (금화)':'상점 구매 (명성)'; o.item.where=placeName(s); s.buyKeep=shopLegend(o.item); equip(s,o.item); delete s.buyKeep; checkCombos(s,s.comboOut||null); return o.item;
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
  {name:'지상계', sub:'인간 세상에 숨어든 악마들', total:6660000, base:32, growth:1.18, regions:[
    ['동네 뒷산','임프 대장'],['시골 마을','타락한 촌장'],['항구 도시','바다 마귀'],['동아시아','구미호'],['동남아시아','정글의 락샤사'],
    ['남아시아','라바나의 후예'],['중동 사막','이프리트'],['북아프리카','모래 골렘왕'],['동유럽','흡혈 백작'],['서유럽','타락한 성기사장'],
    ['북유럽','서리 거인'],['시베리아','설원의 마왕'],['아메리카 대륙','웬디고'],['남극 빙하 아래','고대 악마'],['지옥문','케르베로스']]},
  {name:'지하 세계', sub:'지옥문 너머, 죽은 자의 땅', total:13320000, base:30, growth:1.068, regions:[
    ['망각의 강','뱃사공의 망령'],['비명의 숲','자살나무 정령'],['재의 평원','재의 기사'],['불타는 도시 디스','이단 심문관'],['얼음 호수','배신자들의 군주'],
    ['피의 강','켄타우로스 왕'],['역병의 늪','파리 대왕'],['거짓의 골짜기','기만의 대공'],['탐욕의 금고','금고지기'],['분노의 투기장','지옥 검투사'],
    ['교만의 첨탑','루시퍼의 그림자'],['지하 세계 왕좌','하데스의 섭정']]},
  {name:'마계', sub:'악마들이 태어나는 근원', total:26640000, base:30, growth:1.045, regions:[
    ['마계 1층 · 색욕','아스모데우스'],['마계 2층 · 탐식','벨제붑'],['마계 3층 · 탐욕','맘몬'],['마계 4층 · 나태','벨페고르'],
    ['마계 5층 · 질투','레비아탄'],['마계 6층 · 분노','사탄'],['마계 7층 · 교만','루시퍼'],['마계 핵','칠대죄의 합일체']]},
  {name:'심연', sub:'이름조차 없는 것들이 사는 곳', total:66600000, base:30, growth:1.05, regions:[
    ['무저갱의 가장자리','이름 없는 자'],['끝없는 낙하','공허 포식자'],['시간이 멈춘 곳','종말의 시계공'],['별이 꺼진 하늘','별을 삼킨 자'],
    ['심연의 눈','바라보는 자'],['원초의 혼돈','태초의 악']]},
  {name:'공허의 옥좌', sub:'모든 악의 시작과 끝', total:666000000, base:36, growth:1.15, regions:[
    ['옥좌로 가는 계단','최후의 근위대장'],['거울의 방','또 하나의 나'],['공허의 옥좌','악의 근원']]},
  {name:'끝없는 전장', sub:'쓰러뜨린 악들이 끝없이 되살아나는 곳', endless:true, total:1, base:70, growth:1.115, regions:[]},
];
// 끝없는 전장의 새 몬스터: 20층마다 하나씩 (그 층의 수문장으로 처음 나오고, 그 뒤 층부터는 일반 몬스터로도 섞여 나온다)
const ENDLESS_MON=['피에 젖은 검투사왕','사슬에 묶인 거인','뼈의 용','일곱 머리 히드라','천 개의 팔 아수라','몰락한 대천사','무덤의 여왕','혼돈의 기수','시간을 먹는 벌레','거꾸로 선 성의 주인','피의 달','마지막 신의 시체','세계수를 갉는 뱀','무(無)의 사도','끝없는 전장의 주인'];
{ // 끝없는 전장: 300층. 층마다 이전 세계 지배자들의 망령이 수문장으로 나온다 (20층마다는 새 몬스터).
  const bosses=[];for(let k=0;k<5;k++) STAGES[k].regions.forEach(rg=>bosses.push(rg[1]));
  for(let f=1;f<=300;f++) STAGES[5].regions.push([`끝없는 전장 ${f}층`,f%20===0?ENDLESS_MON[f/20-1]:`${bosses[(f*7)%bosses.length]}의 망령`+(f>=bosses.length?` (${Math.floor(f/bosses.length)+1}회차)`:'')]);
}
// 세계별 사냥터: 지배자를 쓰러뜨린 세계에 남아 더 강해지는 곳. stage 6~9 = 지상계~심연 사냥터
const HUNT_BASE=6;
for(let k=0;k<4;k++){
  const W=STAGES[k], regs=[];
  for(let f=1;f<=300;f++){const rg=W.regions[(f-1)%W.regions.length];regs.push([`${W.name} 사냥터 ${f}층`,`되살아난 ${rg[1]}`+(f>W.regions.length?` (${Math.ceil(f/W.regions.length)}회차)`:'')]);}
  STAGES.push({name:`${W.name} 사냥터`,sub:'쓰러뜨린 악마들이 다시 몰려드는 곳. 원할 때 다음 세계로 떠날 수 있다',endless:true,hunt:k,total:1,base:W.base,growth:1.076,regions:regs});
}
function worldOf(stIdx){const st=STAGES[stIdx];return st.hunt!=null?st.hunt:stIdx;}

function rng(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function pick(r,arr){const tot=arr.reduce((s,x)=>s+x.w,0);let v=r()*tot;for(const x of arr){if((v-=x.w)<=0)return x;}return arr[arr.length-1];}
function d6(r,n){let s=0;for(let i=0;i<n;i++)s+=1+Math.floor(r()*6);return s;}
function gauss(r){return Math.sqrt(-2*Math.log(r()+1e-12))*Math.cos(2*Math.PI*r());}
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

// ===== 스킬 =====
// 레벨업과 지배자 처치 때마다 3개 중 1개를 고른다. 같은 스킬은 3랭크까지.
let SKV={blade:0.16,giant:0.15,boss:0.10,command:0.05,cmdcap:2,cmdHire:3,grit:0.6,flee:0.5,talk:0.5,camp:0.5,scholar:0.3,fame:1.2,famecap:0.15,lucky:6,charm:9,treasure:2.0,appraise:0.25,smith:0.04,ward:0.45,merchant:2.0,discount:0.12,startPicks:0,conquerPicks:1,pickFrom:3,pickEvery:2,mT1:3,mT2:6,mPow:[0,0.12,0.5],mGold:[0,0.3,0.8],mEnh:[0,0.03,0.06],mStat:[0,5,15],mDmg:[0,0.5,0.8],mXp:[0,0.5,1.5],mItem:[0,0,0],mGrit:[0,0.15,0.4],mRetry:[1.05,0.88,0.75]};
const ROLES=['전투','생존','성장','재물'];
const MASTERY={'전투':t=>`전투력 +${Math.round(SKV.mPow[t]*100)}%`,'생존':t=>`부활 +1(이미 1회면 최대 생명력 +25%), 받는 피해 -${Math.round(SKV.mDmg[t]*100)}%, 최종 지배자 재도전 +${t}, 재도전마다 지배자 약화 ${Math.round((1-SKV.mRetry[t])*100)}%, 생명력 절반 이하일 때 전투력 +${Math.round(SKV.mGrit[t]*100)}%`,'성장':t=>`모든 능력치 +${SKV.mStat[t]}, 경험치 +${Math.round(SKV.mXp[t]*100)}%`,'재물':t=>`금화 +${Math.round(SKV.mGold[t]*100)}%, 강화 확률 +${Math.round(SKV.mEnh[t]*100)}%p`};
function roleRanks(s,role){let v=0;for(const k in (s.skills||{})) if(SKILL_BY[k]&&SKILL_BY[k].role===role) v+=s.skills[k];return v;}
function mastery(s,role){const v=roleRanks(s,role);return v>=SKV.mT2?2:v>=SKV.mT1?1:0;}
let GW=[2,5,0.03,0.25]; // 영웅·전설 가중치(기본, 보너스 비례)
let FRESH_SK=[1,0.754,0.742,0.963,0.373,1];
let DIFF=[0.51,0.72,0.618,0.493,0.473,0.7];
const SKILLS=[
  {id:'blade',role:'전투',name:'검술',d:r=>`전투력 +${Math.round(SKV.blade*r*100)}%`},
  {id:'giant',role:'전투',name:'거인 사냥',d:r=>`승률 60% 미만인 싸움에서 승률 +${Math.round(SKV.giant*r*100)}%p`},
  {id:'boss',role:'전투',name:'지배자 사냥',d:r=>`지배자전 승률 최대 +${Math.round(SKV.boss*r*100)}%p (적보다 약할수록 줄어든다)`},
  {id:'command',role:'전투',name:'지휘',d:r=>`즉시 용병 ${SKV.cmdHire}명 합류, 용병 1명당 전투력 +${+(MERC_K*(4+SKV.command*r*100)).toFixed(1)}% (기본 ${+(MERC_K*4).toFixed(1)}%, 지능이 높으면 더 오른다), 용병 상한 +${SKV.cmdcap*r}`},
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
  {id:'ward',role:'재물',name:'수호 각인',d:r=>`강화 실패로 부서질 때 ${Math.round(wardP(r)*100)}% 확률로 파괴 대신 1단계 하락`},
  {id:'merchant',role:'재물',name:'상인',d:r=>`금화 +${Math.round(SKV.merchant*r*100)}%, 상점 가격 -${Math.round(SKV.discount*r*100)}%`},
];
const SKILL_BY={};SKILLS.forEach(x=>SKILL_BY[x.id]=x);
const SK_MAX=3, ROLE_MAX=3;
function canLearn(s,id){const r=sk(s,id);if(r>=SK_MAX)return false;if(r>0)return true;const role=SKILL_BY[id].role;return SKILLS.filter(x=>x.role===role&&sk(s,x.id)>0).length<ROLE_MAX;}
const WARD_P=[0,0.2,0.25,0.3];
function wardP(r){return WARD_P[Math.min(3,r||0)];}
const PERK_TXT={xp:v=>`경험치 ${v>0?'+':''}${Math.round(v*100)}%`,talk:v=>`회유 확률 ${v>0?'+':''}${Math.round(v*100)}%p`,flee:v=>`도망 확률 ${v>0?'+':''}${Math.round(v*100)}%p`,hp:v=>`최대 생명력 ${v>0?'+':''}${Math.round(v*100)}%`,enh:v=>`강화 확률 +${Math.round(v*100)}%p`,gold:v=>`금화 획득 +${Math.round(v*100)}%`,discount:v=>`상점 가격 -${Math.round(v*100)}%`,boss:v=>`지배자전 승률 +${Math.round(v*100)}%p`,revive:v=>`부활 +${v}`,luk:v=>`행운 ${v>0?'+':''}${v}`};
function multTxt(m){return m&&m!==1?`전투력 ${m>1?'+':''}${Math.round((m-1)*100)}%`:'';}
function raceInfo(race){const o=[];const m=multTxt(race.mult);if(m)o.push(m);for(const k in (race.p||{}))if(PERK_TXT[k])o.push(PERK_TXT[k](race.p[k]));if(race.revive)o.push(`부활 +${race.revive}`);
  const st=STAT_KEYS.filter(k=>race.mod&&race.mod[k]).map(k=>`${STAT_NAMES[k]} ${race.mod[k]>0?'+':''}${race.mod[k]}`);return {perks:o,stats:st};}
function traitInfo(t){const o=[];const m=multTxt(t.mult);if(m)o.push(m);for(const k of ['hp','xp','talk','flee','luk','revive','gold','discount','enh'])if(t[k])o.push(PERK_TXT[k](t[k]));return o.length?o:['특별한 효과 없음'];}
function wealthInfo(w){const g=START_GEAR[w.name];return [`시작 금화 ${w.gold}`,`기본 장비로 전투력 기반 +${Math.round(w.gear*1.6)}`,...(g?[`가문의 유산: 시작 장비 ${g.length}개 (${g.map(x=>GRADES[x].name).join(', ')})`]:[]),...(START_KNIGHTS[w.name]?[`가문의 기사 ${START_KNIGHTS[w.name]}명이 용병으로 동행`]:[]),`시작 명성 +${WEALTH.indexOf(w)*5}`];}
// 스킬 습득 레벨: 10레벨까지 2레벨마다(2·4·6·8·10), 그 뒤로 3레벨마다(13·16·19…)
function isPickLevel(l){return l<=10?l%2===0:(l-10)%3===0;}
function nextPickLevel(l){let x=l+1;while(!isPickLevel(x))x++;return x;}
function sk(s,id){return (s&&s.skills&&s.skills[id])||0;}
// 세계 특성: 같은 빌드가 끝까지 통하지 않게 한다
const WORLD_TRAITS=[null,
  {id:'wraith',name:'망령',d:'일반 전투의 절반에서 도망칠 수 없다'},
  {id:'sin',name:'대죄',d:'회유 확률이 절반으로 줄어든다'},
  {id:'elder',name:'고위 악마',d:'행운과 매력 저항이 두 배다'},
  {id:'curse',name:'저주',d:'장비 효과가 15% 줄어든다'},
  {id:'curse',name:'저주',d:'장비 효과가 15% 줄어든다'}];

// ===== 조합: 종족 + 스킬 + 특정 아이템(세계마다 다름). 한 판에서 세 조건을 모두 갖추면 영구히 각성한다 =====
// it:[계열, 등급, 세계] → 이름은 itemNameOf로 정해진다. 아이템은 한 번이라도 손에 넣으면 조건을 채운 것으로 친다.
const COMBOS=[
 {id:'arden',race:'인간',name:'건국왕 아르덴의 깃발',sk:'command',it:['win',3,0],e:{cmd:1.0,mult:1.2},d:'용병 1명당 전투력 2배, 전투력 +20%'},
 {id:'lucien',race:'인간',name:'성기사 루시엔의 맹세',sk:'boss',it:['mult',3,2],e:{boss:0.15,mult:1.3},d:'지배자전 승률 +15%p, 전투력 +30%'},
 {id:'ethan',race:'인간',name:'최후의 인간 에단의 등불',tr:'전술의 천재',sk:'scholar',it:['int',3,2],e:{xp:10,all:150,mult:6},d:'전투력 +500%, 경험치 +1000%, 모든 능력치 +150',god:1},
 {id:'sylvanel',race:'엘프',name:'숲의 여왕 실바넬의 노래',sk:'talk',it:['cha',3,0],e:{mult:1.3,win:0.06},d:'전투력 +30%, 모든 전투 승률 +6%p'},
 {id:'eirin',race:'엘프',name:'달그림자 에이린의 화살',sk:'flee',it:['flee',3,1],e:{mult:1.35,xp:0.6},d:'전투력 +35%, 경험치 +60%'},
 {id:'eloas',race:'엘프',name:'별의 현자 엘로아스의 눈',tr:'달변가',sk:'lucky',it:['int',3,3],e:{win:0.3,mult:6,luk:50},d:'전투력 +500%, 모든 전투 승률 +30%p, 행운 +50',god:1},
 {id:'brom',race:'드워프',name:'철산 군주 브롬의 보물지도',sk:'appraise',it:['flee',3,0],e:{legend:2,gold:0.6},d:'전설 아이템 확률 +200%, 금화 +60%'},
 {id:'gorden',race:'드워프',name:'대장장이왕 고르덴의 모루',tr:'손재주',sk:'smith',it:['con',3,2],e:{enh:0.15,hp:20,mult:4},d:'강화 확률 +15%p, 생명력 +2000%, 전투력 +300%',god:1},
 {id:'kazrum',race:'드워프',name:'심연을 판 자 카즈룸의 곡괭이',sk:'grit',it:['con',3,3],e:{hp:1.0,mult:1.35},d:'생명력 +100%, 전투력 +35%'},
 {id:'belzar',race:'마족',name:'마왕군 대원수 벨자르의 군기',sk:'command',it:['win',3,2],e:{cmd:1.0,mult:1.3},d:'용병 1명당 전투력 2배, 전투력 +30%'},
 {id:'asmodeus',race:'마족',name:'옛 마왕 아스모데우스의 옥좌',tr:'전생한 마왕',sk:'talk',it:['cha',3,3],e:{mult:8,talk:0.3,win:0.15},d:'전투력 +700%, 회유 확률 +30%p, 모든 전투 승률 +15%p',god:1},
 {id:'orion',race:'성인(星人)',name:'성운의 방랑자 오리온의 나침반',sk:'lucky',it:['luk',3,4],e:{mult:1.35,luk:30},d:'전투력 +35%, 행운 +30'},
 {id:'cassio',race:'성인(星人)',name:'별을 삼킨 자 카시오페아의 핵',tr:'별에서 온 아이',sk:'scholar',it:['mult',3,3],e:{mult:8,xp:5,all:80},d:'전투력 +700%, 경험치 +500%, 모든 능력치 +80',god:1},
 {id:'keltua',race:'오크',name:'오크왕 켈투아의 의지',tr:'타고난 검술가',sk:'blade',it:['str',3,2],e:{mult:21},d:'전투력 +2000%',god:1},
 {id:'urgak',race:'오크',name:'피의 족장 우르각의 함성',sk:'giant',it:['str',3,1],e:{mult:1.4,win:0.06},d:'전투력 +40%, 모든 전투 승률 +6%p'},
 {id:'garmuk',race:'오크',name:'종말의 전사 가르무크의 뿔나팔',sk:'command',it:['win',3,3],e:{cmd:1.0,mult:1.3},d:'용병 1명당 전투력 2배, 전투력 +30%'},
 {id:'toby',race:'하플링',name:'꼬마 영웅 토비 말굽의 기적',sk:'lucky',it:['luk',3,0],e:{luk:12,win:0.08},d:'행운 +12, 모든 전투 승률 +8%p'},
 {id:'mirt',race:'하플링',name:'그림자 발 미르트의 동전',sk:'flee',it:['agi',3,1],e:{legend:1.5,gold:0.6},d:'전설 아이템 확률 +150%, 금화 +60%'},
 {id:'pero',race:'하플링',name:'운명을 속인 자 페로의 주사위',tr:'저주받은 운명',sk:'treasure',it:['luk',3,2],e:{legend:3,win:0.15,mult:3},d:'전설 아이템 확률 +300%, 모든 전투 승률 +15%p, 전투력 +200%',god:1},
 {id:'grix',race:'고블린',name:'탐욕왕 그릭스의 금고',tr:'장사꾼 기질',sk:'merchant',it:['cha',3,2],e:{gold:10,discount:0.5,mult:9},d:'금화 +1000%, 상점 가격 -50%, 전투력 +800%',god:1},
 {id:'nyax',race:'고블린',name:'지하 시장의 왕 냑스의 저울',sk:'appraise',it:['cha',3,1],e:{legend:1.5,discount:0.2},d:'전설 아이템 확률 +150%, 상점 가격 -20%'},
 {id:'krax',race:'고블린',name:'공허의 고리대금업자 크락스',sk:'fame',it:['luk',3,3],e:{gold:2,mult:1.35},d:'금화 +200%, 전투력 +35%'},
 {id:'baharg',race:'용인족',name:'고룡 바하르크의 심장',sk:'giant',it:['str',3,0],e:{mult:1.4,hp:0.4},d:'전투력 +40%, 생명력 +40%'},
 {id:'ignas',race:'용인족',name:'화염 군주 이그나스의 비늘',sk:'grit',it:['con',3,2],e:{hp:0.8,mult:1.35},d:'생명력 +80%, 전투력 +35%'},
 {id:'aurel',race:'용인족',name:'용신 아우렐의 각성',tr:'용사의 혈통',sk:'blade',it:['str',3,3],e:{mult:16,hp:10},d:'전투력 +1500%, 생명력 +1000%',god:1},
 {id:'serafiel',race:'반천사',name:'심판자 세라피엘의 날개',sk:'boss',it:['mult',3,0],e:{boss:0.2},d:'지배자전 승률 +20%p'},
 {id:'azriel',race:'반천사',name:'타락을 거부한 자 아즈리엘의 성흔',sk:'talk',it:['cha',3,2],e:{mult:1.3,boss:0.1},d:'전투력 +30%, 지배자전 승률 +10%p'},
 {id:'oriel',race:'반천사',name:'새벽의 대천사 오리엘의 관',tr:'신의 가호',sk:'fame',it:['win',3,4],e:{boss:0.4,win:0.2,mult:4},d:'전투력 +300%, 모든 전투 승률 +20%p, 지배자전 승률 +40%p',god:1},
 {id:'mordein',race:'망자',name:'명계의 문지기 모르데인의 계약',sk:'grit',it:['con',3,0],e:{hp:0.6,mult:1.35},d:'생명력 +60%, 전투력 +35%'},
 {id:'velkar',race:'망자',name:'사령왕 벨카르의 서',tr:'불굴의 의지',sk:'scholar',it:['int',3,2],e:{mult:6,hp:20,xp:3},d:'전투력 +500%, 생명력 +2000%, 경험치 +300%',god:1},
 {id:'nocturn',race:'망자',name:'영원한 밤 녹투른의 왕관',sk:'charm',it:['cha',3,3],e:{cha:15,mult:1.4},d:'매력 +15, 전투력 +40%'},
];
// 전설 조합(god)은 효과를 절반으로 (배수는 증가분의 절반)
const COMBO_FX={mult:v=>`전투력 +${Math.round((v-1)*100)}%`,hp:v=>`생명력 +${Math.round(v*100)}%`,xp:v=>`경험치 +${Math.round(v*100)}%`,all:v=>`모든 능력치 +${v}`,win:v=>`모든 전투 승률 +${Math.round(v*100)}%p`,boss:v=>`지배자전 승률 +${Math.round(v*100)}%p`,luk:v=>`행운 +${v}`,enh:v=>`강화 확률 +${Math.round(v*100)}%p`,talk:v=>`회유 확률 +${Math.round(v*100)}%p`,legend:v=>`전설 아이템 확률 +${Math.round(v*100)}%`,gold:v=>`금화 +${Math.round(v*100)}%`,discount:v=>`상점 가격 -${Math.round(v*100)}%`};
const GOD_K=0.5;
COMBOS.forEach(c=>{if(!c.god)return;const e={};for(const k in c.e){const v=c.e[k];e[k]=k==='mult'?1+(v-1)*GOD_K:k==='all'||k==='luk'?Math.round(v*GOD_K):Math.round(v*GOD_K*1000)/1000;}c.e=e;c.d=Object.keys(e).map(k=>COMBO_FX[k]?COMBO_FX[k](e[k]):'').filter(Boolean).join(', ');});
// 조합 아이템은 +5 이상으로 강화해 본 적이 있어야 조건을 채운다
const COMBO_PLUS=5;
const COMBO_BY={};COMBOS.forEach(c=>{c.item=itemNameOf(c.it[0],c.it[1],c.it[2]);COMBO_BY[c.id]=c;});
const COMBO_ITEMS=new Set(COMBOS.map(c=>c.item));
// ===== 신화 아이템: 끝없는 전장에서 +7 이상 전설 4개(서로 다른 계열)와 명성으로 합성. 성공 25%, 실패하면 재료 소멸. 종류는 무작위(중복 가능) =====
const MYTHS=[
 {id:'apollo',slot:'월계관',name:'그리스도의 부활',e:{hp:50,enh:0.15},pvp:'rev',d:'최대 생명력 +5000%, 아이템 강화 확률 +15%p, PvP 부활 +10~20'},
 {id:'freyja',slot:'목걸이',name:'제우스의 암살',e:{mult:26,win:0.1},pvp:'ass',d:'전투력 +2500%, 모든 전투 승률 +10%p, PvP 암살 +10~20'},
 {id:'odin',slot:'반지',name:'오딘의 저주',e:{gold:30,legend:5,mult:6},pvp:'cur',d:'금화 +3000%, 전설 아이템 확률 +500%, 전투력 +500%, PvP 저주 +10~20'},
 {id:'hecate',slot:'귀걸이',name:'석가모니의 축복',e:{boss:0.25,xp:10,mult:6},pvp:'bls',d:'지배자·수문장전 승률 +25%p, 경험치 +1000%, 전투력 +500%, PvP 축복 +10~20'},
];
const MYTH_BY={};MYTHS.forEach(m=>MYTH_BY[m.id]=m);
const MYTH_RATE=0.70, MYTH_PLUS=7, MYTH_FAME=50000;
// ===== PvP 전용 스탯: 몬스터 전투에는 영향 없음 =====
const PVP_KEYS=['ass','rev','bls','cur'], PVP_NAME={ass:'암살',rev:'부활',bls:'축복',cur:'저주'}, PVP_GAIN=0.001, PVP_CAP=40, PVP_MIN=5, MYTH_PVP=20;
// 상성 고리: 암살 > 부활 > 축복 > 저주 > 암살
const PVP_BEATS={ass:'rev',rev:'bls',bls:'cur',cur:'ass'};
// 종족 상성 고리: 화살표 방향이 이긴다. 진 쪽은 PvP 스탯 4개가 20% 줄어든다
const RACE_RING=['반천사','망자','인간','고블린','드워프','오크','엘프','하플링','용인족'];
const RACE_WHY={'반천사':'성스러운 빛이 언데드를 태운다','망자':'죽음의 공포와 역병','인간':'질서가 잡배를 누른다','고블린':'땅굴 기습, 광산의 숙적','드워프':'대대로 이어진 원수','오크':'숲을 불태운다','엘프':'숲의 감시자는 숨어 다니는 자를 먼저 본다','하플링':'작은 영웅이 용의 허를 찌른다','용인족':'용의 불길이 날개를 태운다'};
function raceBeats(a,b){const i=RACE_RING.indexOf(a);return i>=0&&RACE_RING[(i+1)%RACE_RING.length]===b;}
function raceRel(name){const i=RACE_RING.indexOf(name);if(i<0)return null;const n=RACE_RING.length;return {strong:RACE_RING[(i+1)%n],weak:RACE_RING[(i+n-1)%n],why:RACE_WHY[name]};}
const PVP_DESC={ass:'부활을 이긴다. 저주에 진다.',rev:'축복을 이긴다. 암살에 진다.',bls:'저주를 이긴다. 부활에 진다.',cur:'암살을 이긴다. 축복에 진다.'};
const PVP_RULE='5 이상인 스탯만 유효하다. 한쪽만 상성이면 상대 전투력 80% 감소. 둘 다 상성이면(꼬임) 유효 스탯 개수가 많은 쪽이 상대 전투력 80% 감소, 같으면 상성에 안 쓰인 나머지 스탯 총합(없으면 전체 총합) 차이 1점당 +10%. 상성이 없으면 가장 높은 스탯 차이 1점당 +10%. 한쪽만 유효 스탯이 있으면 그쪽 총합 1점당 +10%. 마지막은 체급(전투력^0.7 × 최대 생명력^0.3) 승률 (10~90%).';
function pvpRaw(s){const b=s.pvp||{};return PVP_KEYS.reduce((a,k)=>a+(b[k]||0),0);}
function pvpStats(s){const o={ass:0,rev:0,bls:0,cur:0};const b=s.pvp||{};for(const k of PVP_KEYS)o[k]=b[k]||0;for(const id of (s.mythics||[])){const m=MYTH_BY[id];if(m&&m.pvp)o[m.pvp]+=((s.mythV||{})[id]||MYTH_PVP);}return o;}
function pvpCard(s){return {name:s.hero.name,race:s.hero.race.name,power:Math.round(power(s)/s.stageCarry*10),hp:s.maxHp,...pvpStats(s)};}
// PvP 체급 = 전투력^0.7 × 최대 생명력^0.3 (생명력이 클수록 오래 버틴다)
const PVP_PW=0.7,PVP_HPW=0.3;
function pvpMight(c){return Math.pow(Math.max(1,c.power),PVP_PW)*Math.pow(Math.max(1,c.hp||100),PVP_HPW);}
function duelPlan(A0,B0){const L=[];let A=A0,B=B0;
  const cut=c=>{const o={...c};for(const k of PVP_KEYS)o[k]=Math.floor((c[k]||0)*0.8);return o;};
  if(A.race&&B.race&&raceBeats(A.race,B.race)){B=cut(B);L.push(`종족 상성: ${A.race} > ${B.race} (${RACE_WHY[A.race]}) → ${B.name}의 PvP 스탯 20% 감소`);}
  else if(A.race&&B.race&&raceBeats(B.race,A.race)){A=cut(A);L.push(`종족 상성: ${B.race} > ${A.race} (${RACE_WHY[B.race]}) → ${A.name}의 PvP 스탯 20% 감소`);}const ef=c=>PVP_KEYS.filter(k=>c[k]>=PVP_MIN);const eA=ef(A),eB=ef(B);
  const ctr=(me,op)=>me.filter(k=>op.includes(PVP_BEATS[k]));
  const cA=ctr(eA,eB),cB=ctr(eB,eA);let mA=1,mB=1,how;
  const sum=(c,ks)=>ks.reduce((a,k)=>a+c[k],0);
  if(cA.length&&!cB.length){mB=0.2;how='상성';L.push(`${A.name}의 ${cA.map(k=>PVP_NAME[k]).join('·')}  >  ${B.name}의 ${cA.map(k=>PVP_NAME[PVP_BEATS[k]]).join('·')} (상성) → ${B.name} 전투력 80% 감소`);}
  else if(cB.length&&!cA.length){mA=0.2;how='상성';L.push(`${B.name}의 ${cB.map(k=>PVP_NAME[k]).join('·')}  >  ${A.name}의 ${cB.map(k=>PVP_NAME[PVP_BEATS[k]]).join('·')} (상성) → ${A.name} 전투력 80% 감소`);}
  else if(cA.length&&cB.length){how='꼬임';
    if(eA.length!==eB.length){const aw=eA.length>eB.length;if(aw)mB=0.2;else mA=0.2;
      L.push(`상성이 꼬였다 → 유효 스탯 ${eA.length}개 대 ${eB.length}개 → ${aw?B.name:A.name} 전투력 80% 감소`);}
    else{const usedA=new Set([...cA,...cB.map(k=>PVP_BEATS[k])]),usedB=new Set([...cB,...cA.map(k=>PVP_BEATS[k])]);
      let rA=sum(A,PVP_KEYS.filter(k=>!usedA.has(k))),rB=sum(B,PVP_KEYS.filter(k=>!usedB.has(k))),lab='나머지 스탯 총합';
      if(!rA&&!rB){rA=sum(A,PVP_KEYS);rB=sum(B,PVP_KEYS);lab='모든 상성이 꼬였다 → 전체 스탯 총합';}
      L.push(`상성이 꼬였다 (유효 스탯 ${eA.length}개 대 ${eB.length}개) → ${lab} ${rA} 대 ${rB}`);if(rA>rB){mA=1+0.1*(rA-rB);L.push(`${A.name} 전투력 +${(rA-rB)*10}%`);}else if(rB>rA){mB=1+0.1*(rB-rA);L.push(`${B.name} 전투력 +${(rB-rA)*10}%`);}}}
  else if(eA.length&&eB.length){how='최고 스탯';const hA=Math.max(...eA.map(k=>A[k])),hB=Math.max(...eB.map(k=>B[k]));
    L.push(`상성 없음 → 가장 높은 스탯 ${hA} 대 ${hB}`);if(hA>hB){mA=1+0.1*(hA-hB);L.push(`${A.name} 전투력 +${(hA-hB)*10}%`);}else if(hB>hA){mB=1+0.1*(hB-hA);L.push(`${B.name} 전투력 +${(hB-hA)*10}%`);}}
  else if(eA.length||eB.length){how='스탯 우위';const w=eA.length?A:B,t=sum(w,PVP_KEYS);if(eA.length)mA=1+0.1*t;else mB=1+0.1*t;L.push(`${w.name}만 유효 스탯(5 이상)이 있다 → 총합 ${t} → 전투력 +${t*10}%`);}
  else {how='전투력';L.push('양쪽 모두 유효 스탯이 없다');}
  const pA=pvpMight(A0)*mA,pB=pvpMight(B0)*mB;const p=Math.min(0.9,Math.max(0.1,1/(1+Math.pow(pB/pA,2))));
  L.push(`체급(전투력·생명력) ${Math.round(pA).toLocaleString()} 대 ${Math.round(pB).toLocaleString()} → ${A.name} 승률 ${Math.round(p*100)}%`);
  return {p,log:L,how};}
function duel(A,B,r){const d=duelPlan(A,B);return {win:r()<d.p,log:d.log,how:d.how,p:d.p};}
function mythFx(s){return [...(s.combos||[]).map(id=>COMBO_BY[id].e),...(s.mythics||[]).map(id=>MYTH_BY[id].e),...(s.hidFx?[s.hidFx]:[]),...(s.hbFx?[s.hbFx]:[])];}
// 가문 순위 효과: 지난주 가문 점수 순위로 이번 주 가문원 모두의 판에 붙는다 (h1 1위, h2 2위, h3 3위, h4 4~10위)
const HBUFF={h1:{mult:1.10,legend:0.5,name:'1위 가문'},h2:{mult:1.07,legend:0.35,name:'2위 가문'},h3:{mult:1.05,legend:0.25,name:'3위 가문'},h4:{mult:1.03,legend:0.10,name:'10대 가문'}};
function applyHouseBuff(s,code){const b=HBUFF[code];if(!b||s.hbuff)return false;s.hbuff=code;s.hbFx={mult:b.mult,legend:b.legend};return true;}
function cmb(s,key,base){let v=base;for(const e of mythFx(s)){if(e[key]!=null)v=key==='mult'?v*e[key]:v+e[key];}return v;}
// 같은 부위에 재료 후보가 여럿이면 강화 수치가 가장 낮은 것을 바친다(같으면 예비 전설 우선). 높은 것은 남아 착용된다.
function mythMats(s){const by={};s.items.forEach((it,i)=>{const sl=slotOf(it);if(!(sl&&it.grade===3&&(it.plus||0)>=MYTH_PLUS))return;const cur=by[sl]==null?null:s.items[by[sl]];
  if(!cur||(it.plus||0)<(cur.plus||0)||((it.plus||0)===(cur.plus||0)&&it.spare&&!cur.spare))by[sl]=i;});return Object.values(by).slice(0,4);}
function mythCheck(s){const st=STAGES[s.stage];const where=!!(st&&st.endless&&st.hunt==null);const mats=mythMats(s);
  return {where,mats,fame:s.fame>=MYTH_FAME,ok:where&&mats.length>=4&&s.fame>=MYTH_FAME&&!s.dead};}
function mythFuse(s){const c=mythCheck(s);if(!c.ok)return null;s.fame-=MYTH_FAME;
  const used=c.mats.map(i=>s.items[i]);const names=used.map(it=>itemName(it));
  for(const it of used){applyItem(s,it,-1);s.items.splice(s.items.indexOf(it),1);}normSlots(s,applyItem);
  const ok=s.r()<MYTH_RATE;if(!ok)return {ok:false,names};
  const m=MYTHS[Math.floor(s.r()*MYTHS.length)];const v=10+Math.floor(s.r()*11);s.mythics=s.mythics||[];s.mythV=s.mythV||{};
  if(s.mythics.includes(m.id)){const old=s.mythV[m.id]||MYTH_PVP;if(v>old){s.mythV[m.id]=v;return {ok:true,upgrade:true,m,v,old,names};}
    // 같은 신화가 더 낮게 나오면 흩어지는 대신 가진 신화를 +1 단련한다 (최대 20)
    const nv=Math.min(20,old+1);s.mythV[m.id]=nv;return {ok:true,dup:true,m,v,old,nv,names};}
  s.mythics.push(m.id);s.mythV[m.id]=v;if(m.e.hp){const o=s.maxHp;s.maxHp=hpMax(s);s.hp+=Math.max(0,s.maxHp-o);}return {ok:true,m,v,names};}
const AFF_T={boss:1,xp:1,gold:1,talk:1,flee:1,enh:1};
function tsum(s,key,base){const v=traitSum(s.hero,key,base);return key==='mult'?v*cmb(s,'mult',1):v+cmb(s,key,0)+(key==='hp'?(s.hpBonus||0):0)+(COMP_KEYS[key]?compAdd(s,COMP_KEYS[key]):0)+(AFF_T[key]?affSum(s,key):0);}
const COMP_KEYS={hp:'hp',xp:'xp',enh:'enh',boss:'boss',discount:'discount',gold:'goldp'};
function hasTrait(h,n){return h.traits.some(t=>t.name===n);}
function comboState(s,c){return {race:s.hero.race.name===c.race,trait:!c.tr||hasTrait(s.hero,c.tr),skill:sk(s,c.sk)>0,item:!!(s.got5&&s.got5.includes(c.item))};}
function noteGot(s,it){if(it&&COMBO_ITEMS.has(it.name)){s.got=s.got||[];if(!s.got.includes(it.name))s.got.push(it.name);if((it.plus||0)>=COMBO_PLUS){s.got5=s.got5||[];if(!s.got5.includes(it.name))s.got5.push(it.name);}}}
function checkCombos(s,out){for(const c of COMBOS){if(s.combos&&s.combos.includes(c.id))continue;const st=comboState(s,c);if(!(st.race&&st.trait&&st.skill&&st.item))continue;
  s.combos=s.combos||[];s.combos.push(c.id);const e=c.e;
  if(e.revive)for(let z=0;z<e.revive;z++)addRevive(s,out); if(e.luk)s.stats.luk+=e.luk; if(e.cha)s.stats.cha+=e.cha; if(e.all)STAT_KEYS.forEach(k=>s.stats[k]+=e.all);
  if(e.hp||e.all){const o=s.maxHp;s.maxHp=hpMax(s);s.hp+=Math.max(0,s.maxHp-o);}
  s.comboNews=s.comboNews||[];s.comboNews.push(c.id);
  if(out)out.push({t:'item g3',x:`조합 각성: 「${c.name}」 (${c.d})`});}}
function comboList(s){return COMBOS.filter(c=>c.race===s.hero.race.name).map(c=>{const st=comboState(s,c);return {...c,st,done:!!(s.combos&&s.combos.includes(c.id))};});}
// 스킬 습득 확률: 기본 70%, 행운 5당 +2%p, 깨달음 1개당 +5%p (최대 95%)
function skillRate(s,base){const b=base==null?0.70:base;const l=Math.max(0,Math.floor(s.stats.luk/5))*0.02,i=(s.insight||0)*0.05;const raw=b+l+i;return {rate:Math.min(0.95,raw),luck:l,insight:i,base:b};}
function offerRates(r,k){const a=[];for(let z=0;z<k;z++)a.push(+(0.55+0.05*Math.floor(r()*7)).toFixed(2));return a;}
function wtrait(s){const t=WORLD_TRAITS[worldOf(s.stage)];return t?t.id:null;}
function queueSkill(s){
  if(s.dead||s.over||!(s.pendingPicks>0)) return;
  if(s.queue.length&&s.queue[0].type==='skill') return;
  const pool=SKILLS.filter(x=>canLearn(s,x.id)).map(x=>x.id); if(!pool.length){s.pendingPicks=0;return;}
  const offers=[];while(offers.length<Math.min(3,pool.length)){const id=pool[Math.floor(s.r()*pool.length)];if(!offers.includes(id))offers.push(id);}
  s.queue.unshift({type:'skill',offers,rates:offerRates(s.r,offers.length),auto:offers[Math.floor(s.r()*offers.length)]});
}
function learnSkill(s,id,out){
  s.skills=s.skills||{}; const role=SKILL_BY[id].role, m0=mastery(s,role); s.skills[id]=(s.skills[id]||0)+1; s.pendingPicks--; const m1=mastery(s,role);
  if(id==='lucky') s.stats.luk+=SKV.lucky; if(id==='charm') s.stats.cha+=SKV.charm;
  if(id==='grit') s.gritLeft=(s.gritLeft||0)+1;
  if(id==='command'){const add=Math.min(SKV.cmdHire,mercCap(s)-s.allies);if(add>0){s.allies+=add;out.push({t:'good',x:`용병 ${add}명 합류 (총 ${s.allies}명)`});}}
  out.push({t:'item g2',x:`스킬 습득: ${SKILL_BY[id].name} ${s.skills[id]}랭크 (${SKILL_BY[id].d(s.skills[id])})`});
  if(m1>m0&&role==='재물'){ for(const it of s.items){ if(!slotOf(it)) continue; applyItem(s,it,-1); it.boost=1+SKV.mItem[m1]; applyItem(s,it,1);} }
  if(m1>m0){ if(role==='생존') addRevive(s,out); if(role==='성장'){const v=SKV.mStat[m1]-SKV.mStat[m0];STAT_KEYS.forEach(k=>s.stats[k]+=v);const o=s.maxHp;s.maxHp=hpMax(s);s.hp+=Math.max(0,s.maxHp-o);}
    out.push({t:'item g3',x:`${role} 숙련 ${m1}단계 달성: ${MASTERY[role](m1)}`}); }
}
function curseF(s){return wtrait(s)==='curse'?0.85:1;}
function itemStatSum(s,k){let v=0;for(const it of s.items) if(it.stat===k&&!it.spare) v+=effV(it);return v;}

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
  // 성별은 따로 굴린다(능력치·종족 등 다른 결과는 바뀌지 않는다). 이름은 성별에 맞는 음절로 짓는다.
  const gender=rng(mixSeed(seed,0x6e6e))()<0.5?'f':'m';
  // 이름: 성별에 맞는 음절 2~3개. 이름 전용 난수를 따로 써서 다른 결과(능력치·히든 등)는 바뀌지 않게 하고, 예전과 같은 횟수(2번)만 r()를 소비한다.
  const NM=gender==='f'?[['아리','벨','세','루','미','엘','소','유','하','라','이','나','시','레','에','로','셀','카','다','비','리','티','에일','세레','오','아일','플','크리','마리','엘레','이사','릴','메','제','니','로제','아델','비비','세실','올'],
      ['나','아','린','엘','라','니','샤','리아','시아','렌','미','루','네','아나','엔','벨','델','렛','사','티아','제','니아','레아','리스','로아','엘라','나르','비아','세','디아','린느','아라','엘린','나엘','베스','란','에나','리엔','솔','아스'],
      ['','','','','','','','','','','나','아','엘','린','리','사','네','루','티','라']]
    :[['아르','카이','도','진','타','누','오','바','가','케','로','그','하','볼','레','드','마','에드','라','세','브','칼','토르','베','헬','자','울','이반','가렌','모르','테오','할','로드','다르','빅','제','아론','레온','크로','발'],
      ['델','온','혼','크','토','빈','람','스','칸','드','론','간','록','윤','렉','란','무스','르','가','반','딘','렌','마르','로스','탄','곤','릭','안','웰','드릭','라스','빈스','루스','테','갈','돈','렘','윈','크스','로우'],
      ['','','','','','','','','','','스','드','크','론','르','안','토','간','록','탄']];
  const nr=rng(mixSeed(seed,0x4e41));r();r();
  const n1=NM[0][Math.floor(nr()*NM[0].length)],n2=NM[1][Math.floor(nr()*NM[1].length)];let n3=NM[2][Math.floor(nr()*NM[2].length)];
  if((n1+n2).length>=4||(n3&&n2.slice(-1)===n3[0]))n3=''; // 너무 길거나 같은 소리가 겹치면 두 음절로
  const name=n1+n2+n3;
  if(r()<0.001){ // 히든 영웅 0.1%
    const H=HIDDEN[Math.floor(r()*HIDDEN.length)];
    for(const k of STAT_KEYS) stats[k]=Math.max(stats[k],10)+H.boost[k];
    const ht={name:H.title,w:0,mult:H.mult,talk:H.talk||0,hp:H.hp||0,revive:H.revive||0,good:'hidden'};
    return {seed,name:H.gender&&H.gender!==gender?H.alt:name,gender:H.gender||gender,race:{...race,name:H.race,note:H.note,mult:1,revive:0,p:{}},wealth:WEALTH[5],stats,traits:[ht,...traits.filter(t=>t.good!==false)],job:H.job,hidden:H};
  }
  return {seed,name,gender,race,wealth,stats,traits,job:jobs[top]};
}
function traitSum(h,key,base){let v=base;for(const t of h.traits){if(t[key]!=null)v=(key==='mult')?v*t[key]:v+t[key];}if(key!=='mult'&&key!=='revive'&&h.race.p&&h.race.p[key]!=null)v+=h.race.p[key];return v;}

// ----- Run state -----
function newRun(hero, stageIdx, seed){
  const r=rng(seed);
  const s={hero,stage:stageIdx,r,stats:{...hero.stats},items:[],allies:0,lvl:1,xp:0,gold:hero.wealth.gold,
    revive:Math.min(REVIVE_MAX,(hero.race.revive||0)+traitSum(hero,'revive',0)),hpBonus:0.25*Math.max(0,(hero.race.revive||0)+traitSum(hero,'revive',0)-REVIVE_MAX),region:-1,queue:[],killed:0,regionKilled:[],dead:false,cleared:false,
    stageCarry:Math.pow(2.5,stageIdx), multItems:1, decisions:0, wins:0, upsets:0,
    fame:WEALTH.indexOf(hero.wealth)*5+(hero.hidden?50:0), comp:{heroine:null,friend:null,pet:null}, saves:{}, petGrow:1, spouse:null, quests:0,
    skills:{}, pendingPicks:SKV.startPicks, gritLeft:0, prog:14*stageIdx-1};
  if(stageIdx>0){ s.enemyCarry=s.stageCarry*FRESH[stageIdx]*FRESH_SK[stageIdx]; s.carryBase=s.enemyCarry; }
  s.maxHp=hpMax(s); s.hp=s.maxHp;
  startGear(s);
  nextRegion(s); queueSkill(s);
  return prime(s);
}
// 부유한 집안은 처음부터 장비를 갖고 시작한다
const START_GEAR={'부유층':[1,1],'귀족':[2,1],'왕족':[3,2,1]};
// 귀족·왕족은 가문의 기사가 용병으로 함께 출정한다
const START_KNIGHTS={'귀족':2,'왕족':1};
function startGear(s){const gs=START_GEAR[s.hero.wealth.name];if(!gs)return;
  for(const g of gs){let it,t=0;do{it=makeItem(s.r,g,null,0);}while(t++<8&&!wouldUpgrade(s,it));it.src='가문의 유산';it.where='출정 전';noteGot(s,it);equip(s,it);}checkCombos(s,null);
  s.allies+=START_KNIGHTS[s.hero.wealth.name]||0;
  s.hp=s.maxHp;}
// 용병 1명당 전투력 (MERC_K로 절반)
function mercPer(s){return MERC_K*(0.04+SKV.command*sk(s,'command')*skAmp(s))*cmb(s,'cmd',1);}
// 지능: 10을 넘는 1점마다 경험치 +3%, 전투 스킬(검술·거인 사냥·지배자 사냥·지휘) 효과 +1% (최대 +150%)
function intXp(s){return Math.max(-0.3,(s.stats.int-10)*INT_XP);}
function skAmp(s){return 1+Math.min(1.5,Math.max(0,(s.stats.int-10)*INT_SK));}
function hpMax(s){return Math.round((40+s.stats.con*6)*(1+tsum(s,'hp',0))*(1+0.05*(s.lvl-1)));}
function power(s){
  const t=s.stats;
  const cf=curseF(s); const ic=k=>cf<1?(1-cf)*itemStatSum(s,k):0;
  const base=((t.str-ic('str'))*1.3+(t.agi-ic('agi'))*1.05)*BASE_K+s.hero.wealth.gear*1.6; // 힘·민첩만 전투력 (체력=생명력, 지능=경험치·스킬)
  const mi=cf<1?1+(s.multItems-1)*cf:s.multItems; // 저주: 장비 배수의 증가분을 정확히 15% 깎는다
  return base*s.hero.race.mult*tsum(s,'mult',1)*mi*(1+LVL_B*(s.lvl-1))*(1+mercPer(s)*s.allies)*compMult(s)*s.stageCarry*(1+SKV.blade*sk(s,'blade')*skAmp(s))*(1+SKV.mPow[mastery(s,'전투')])*(s.hp<s.maxHp*0.5?1+SKV.mGrit[mastery(s,'생존')]:1)*Math.pow(0.9,s.fleeDebuff||0)*(s.pact?PACT_POW:1);
}
function compMult(s){let m=1;for(const k in s.comp){const c=s.comp[k];if(c&&c.mult)m*=c.mult;}m*=s.petGrow;if(s.spouse)m*=(s.spouseC?(s.spouseC.mult||1):1.15);return m;}
function compAdd(s,key){let v=0;for(const k in s.comp){const c=s.comp[k];if(c&&c[key])v+=c[key];}if(s.spouseC&&s.spouseC[key])v+=s.spouseC[key];return v;}
function compSum(s,key){return compAdd(s,key);}
function regionShare(s,i){const st=STAGES[s.stage];const w=st.regions.map((_,k)=>Math.pow(DEMON_W,k));const sum=w.reduce((a,b)=>a+b,0);return 100*w[i]/sum;}
function nextRegion(s){
  const st=STAGES[s.stage]; if(s.progE==null&&(st.endless||s.huntFrom===5))s.progE=Math.max(0,s.prog||0); s.region++; if(st.endless&&st.hunt==null){s.maxFloorE=Math.max(s.maxFloorE||0,s.region+1);if(s.region>0&&s.region%50===0)s.doneQ=[];} /* 끝없는 전장 51·101…층마다 의뢰인 다시 등장 */ s.prog=(s.prog==null?-1:s.prog)+1;
  if(s.region>=st.regions.length){s.over=true;s.cleared=st.regions.every((_,k)=>s.pacified&&s.pacified[k]);return;}
  const i=s.region, r=s.r, D=regionShare(s,i);
  s.transit=[];
  if(s.oath&&s.huntFrom!==5){s.oath.left--;if(s.oath.left<=0){s.oath=null;s.oathBoss=1;s.transit.push({t:'comp',x:`맹세한 기사가 달려왔다 · 이 지역 지배자전 승률 +${Math.round(OATH_BOSS*100)}%p`});}}
  if(i>0){
    const h=s.comp.heroine; if(h&&h.regen){const v=Math.round(s.maxHp*h.regen);s.hp=Math.min(s.maxHp,s.hp+v);s.transit.push({t:'good',x:`${h.name}의 기도로 생명력 +${v}`});}
    const f=s.comp.friend; if(f&&f.forge&&(s.forgeN=(s.forgeN||0)+1)%10===0){const k=STAT_KEYS[Math.floor(r()*6)];s.stats[k]++;s.transit.push({t:'good',x:`${f.name}이(가) 장비를 손봤다(지역 10개째): ${STAT_NAMES[k]} +1`});}
    const pt=s.comp.pet; if(pt&&pt.grow&&(s.petN=(s.petN||0)+1)%10===0&&(s.petGrow||1)<1+(pt.growCap||0.4)-1e-9){s.petGrow=Math.min(1+(pt.growCap||0.4),(s.petGrow||1)+pt.grow);s.transit.push({t:'comp',x:`${pt.name}이(가) 자랐다 · 성장 +${Math.round((s.petGrow-1)*100)}%`});} // 복리 대신 더하기, 상한 있음 (예전: 지역마다 2% 복리로 끝없는 전장에서 수십 배)
  }
  // 상점은 새 지역(층)에 도착할 때만 바뀐다. 끝없는 전장 ↔ 사냥터 왕복으로는 새로 나오지 않는다(왕복 새로고침 방지).
  s.shop=s.keepShop||makeShop(s); s.keepShop=null;
  if(s.huntFrom===5&&STAGES[s.stage].hunt!=null)(s.huntShops=s.huntShops||{})[STAGES[s.stage].hunt]=s.shop;
  const share=[0.15,0.2,0.25]; // boss gets remainder 0.4
  // 전투 → 탐험 → 전투 → 휴식 → 전투 → 탐험 → 지배자
  s.queue=[makeBattle(s,i,D*share[0],false),{type:'explore'},makeBattle(s,i,D*share[1],false),...(i%2===1?[{type:'rest'}]:[]),makeBattle(s,i,D*share[2],false),{type:'explore'}];
  {const b=makeBattle(s,i,D*0.4,true); if(b.final) s.queue.push({type:'prep',boss:b},b); else s.queue.push(b);}
  s.regionKilled[i]=0; s.regionTotal=D;
}
function battleBaseE(s,i){const st=STAGES[s.stage];let E;const N=st.regions.length,late=Math.max(0,i-Math.floor(N*0.55));
  if(st.hunt!=null){const W=STAGES[st.hunt];E=W.base*Math.pow(W.growth,W.regions.length-1)*HUNT_START*Math.pow(st.growth,i)*(s.enemyCarry||s.stageCarry);}
  else E=st.base*Math.pow(st.growth,i)*Math.pow(LATE,late)*(s.enemyCarry||s.stageCarry);
  return E*DIFF[worldOf(s.stage)];}
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
  const pool=(st.endless&&st.hunt==null)?[...MINIONS[4],...ENDLESS_MON.slice(0,Math.floor((i+1)/20))]:MINIONS[worldOf(s.stage)]; const mname=pool[Math.min(pool.length-1,Math.floor(r()*Math.min(pool.length,2+i)))];
  const count=boss?1:Math.max(3,Math.round(size*(5+i*2.5)*(1+s.stage*0.6)*(0.7+r()*0.6)));
  const noFlee=!boss&&WORLD_TRAITS[worldOf(s.stage)]&&WORLD_TRAITS[worldOf(s.stage)].id==='wraith'&&r()<0.5;
  return {type:'battle',boss,final:finalBoss,E,share,count,name:boss?st.regions[i][1]:mname,place:st.regions[i][0],noFlee};
}
function makeEvent(s){
  return {type:'event',kind:null};
}
// 신분별 히든 이벤트: 탐험 사건 1만 번에 1번꼴 (0.01%)
const HIDDEN_P=0.0001;
// 정답이 안 보이는 갈림길: 저주받은 보물 · 기사의 맹세 · 악마의 거래 · 갈림길
const CURSE_BOSS=0.20, OATH_BOSS=0.10, OATH_AFTER=3, PACT_POW=1.35, PACT_PEN=0.2, PACT_HP=0.1;
function dealAdj(s){return (s.oathBoss?OATH_BOSS:0)-(s.bossCurse||0);}
// 지배자 전투가 끝났을 때(승리·회유·도망·더 이상 재도전 없음) 걸어 둔 약속을 정산한다
function bossDeal(s,n,out){if(!n.boss||s.keepNode)return;const won=['win','talk','talkFailWin'].includes(s.lastOutcome);
  if(s.pact){s.pact=0;if(won)out.push({t:'good',x:'악마와의 계약을 지켜냈다 · 계약 종료'});else if(!s.dead){STAT_KEYS.forEach(k=>s.stats[k]=Math.max(1,Math.floor(s.stats[k]*(1-PACT_PEN))));out.push({t:'bad',x:`계약 불이행: 악마가 대가를 거둬 갔다 · 모든 능력치 -${Math.round(PACT_PEN*100)}%`});}}
  if(s.bossCurse){s.bossCurse=0;out.push({t:'good',x:'보물의 저주가 풀렸다'});}
  if(s.oathBoss){s.oathBoss=0;out.push({t:'comp',x:'맹세를 지킨 기사가 인사하고 떠났다'});}}
// 명성 도박꾼(야바위): 명성 3000 이상, 지역마다 최대 1번. 컵 3개 중 하나, 맞히면 건 명성의 3배를 돌려받는다(기대값 0).
const GAMBLE_MIN=3000, GAMBLE_CONT=1000, GAMBLE_W=1.5, GAMBLE_P=1/3, GAMBLE_PAY=3, GAMBLE_BETS=[10,30,100];
function gambleStake(s,pct){return Math.max(0,Math.floor(Math.max(0,s.fame)*pct/100));}
const HIDDEN_EV={
  '왕족':{name:'왕의 칙령',title:'왕좌의 현자가 시험을 낸다. 맞히면 왕의 칙령이 내려진다.',reward:'지배자전 승률 +10%p, 전투력 +50%'},
  '귀족':{name:'기사단 서임',title:'가문의 기사단장이 문답으로 그대의 자격을 묻는다.',reward:'용병 상한 +5, 용병이 상한까지 즉시 합류'},
  '부유층':{name:'가문의 보물창고',title:'보물창고 문지기가 수수께끼를 낸다.',reward:'+7 전설 장비 10개 (예비 보관 한도를 넘어도 모두 보관)'},
  '중산층':{name:'길드 투자 대박',title:'상인 길드장이 투자 시험을 낸다.',reward:'금화 획득량 +500%, 명성 획득량 +500%'},
  '서민':{name:'민중의 영웅',title:'마을 원로가 영웅의 자격을 묻는다.',reward:'PvP 스탯 4종 모두 +7, 명성 획득량 +300%'},
  '빈털터리':{name:'잃을 것 없는 자의 각성',title:'떠돌이 은자가 깨달음의 문답을 건넨다.',reward:'강화 확률 +20%p, 전설 아이템 확률 +500%, 금화 획득량 +500%'},
};
// 이 게임에 대한 객관식 퀴즈. 정답은 엔진 상수에서 바로 가져와 수치가 바뀌어도 틀리지 않는다.
function hiddenQuiz(){return [
  ['신화 합성의 성공 확률은?',Math.round(MYTH_RATE*100)+'%',['25%','50%','90%','70%','40%']],
  ['신화 합성에 필요한 명성은?',fmtExact(MYTH_FAME),['2,000','5,000','30,000','10,000','20,000']],
  ['신화 합성 재료는 몇 강 이상 전설 장비인가?','+'+MYTH_PLUS,['+5','+6','+8','+10','+7']],
  ['PvP에서 암살이 상성으로 이기는 스탯은?','부활',['축복','저주','부활']],
  ['PvP에서 축복이 상성으로 이기는 스탯은?','저주',['암살','부활','저주']],
  ['PvP 스탯이 효과를 내기 시작하는 최소 수치는?',String(PVP_MIN),['3','10','1','5']],
  ['부활은 최대 몇 회까지 지닐 수 있나?',REVIVE_MAX+'회',['2회','3회','5회','1회']],
  ['지휘 스킬 없이 용병은 최대 몇 명인가?',MERC_CAP+'명',['8명','10명','20명','12명']],
  ['예비 전설은 최대 몇 개까지 보관하나?',SPARE_MAX+'개',['8개','10개','15개','20개']],
  ['끝없는 전장은 몇 층마다 자동 저장되나?','5층',['3층','10층','1층','5층']],
  ['히든 영웅이 태어날 확률은?','0.1%',['1%','0.01%','5%','0.1%']],
  ['공허의 옥좌는 몇 번째 세계인가?','5번째',['3번째','4번째','6번째','5번째']],
];}
function baseStat(s,k){return Math.max(1,s.stats[k]-itemStatSum(s,k));}
function rollEvent(s,n){
  if(HIDDEN_EV[s.hero.wealth.name]&&s.r()<HIDDEN_P){n.kind='hidden';const r=s.r;const Q=hiddenQuiz();const q=Q[Math.floor(r()*Q.length)];
    const wrong=[...new Set(q[2].filter(x=>x!==q[1]))];const pick=[];while(pick.length<3&&wrong.length)pick.push(wrong.splice(Math.floor(r()*wrong.length),1)[0]);
    const ch=[q[1],...pick];for(let a=ch.length-1;a>0;a--){const b=Math.floor(r()*(a+1));[ch[a],ch[b]]=[ch[b],ch[a]];}n.quiz={q:q[0],ch,ans:ch.indexOf(q[1])};return;}
  const r=s.r, opts=[['merchant',14],['altar',12],['knight',10],['chest',10],['train',8]];
  if(!s.comp.heroine && s.fame>=30 && compPool(s,heroList(s)).length) opts.push(['heroine',1.6]);
  if(!s.comp.friend && compPool(s,FRIENDS).length) opts.push(['friend',2.2]);
  if(!s.comp.pet) opts.push(['pet',2.2]);
  if(!s.activeQuest){const avail=QUESTS.filter(q=>s.fame>=q.min&&!(s.doneQ||[]).includes(q.giver)); if(avail.length) opts.push(['quest',STAGES[s.stage].endless&&STAGES[s.stage].hunt==null?1:6]);}
  if(s.fame>=150 && !s.tomb) opts.push(['tomb',4]);
  opts.push(['cursed',2],['fork',3]); if(!s.oath&&!s.oathBoss) opts.push(['oath',2]); if(!s.pact) opts.push(['pact',1.5]);
  const gk=s.stage+':'+s.region; if(s.fame>=GAMBLE_MIN && s.gambleAt!==gk) opts.push(['gambler',GAMBLE_W]);
  const tot=opts.reduce((a,b)=>a+b[1],0); let v=r()*tot; let k=opts[0][0];
  for(const [name,w] of opts){if((v-=w)<=0){k=name;break;}}
  n.kind=k;
  if(k==='heroine'){const P=compPool(s,heroList(s));n.c=P[Math.floor(r()*P.length)];}
  if(k==='friend'){const P=compPool(s,FRIENDS);n.c=P[Math.floor(r()*P.length)];}
  if(k==='pet') n.c=PETS[Math.floor(r()*PETS.length)];
  if(k==='heroine'||k==='friend'||k==='pet'){if(r()<RARE_P){n.c=rareOf(s,k);}}
  if(k==='gambler') s.gambleAt=gk;
  if(k==='quest'){const avail=QUESTS.filter(q=>s.fame>=q.min&&!(s.doneQ||[]).includes(q.giver)); n.q=avail[avail.length-1];}
}
function winParts(s,E){const ratio=power(s)/E;const tt=Math.tanh(Math.log(ratio)*1.15); const base=0.70+(tt<0?0.58:0.22)*tt;const luck=clamp((effLuk(s)-10)*0.005,-0.05,0.10);const under=base<0.55?compSum(s,'underdog'):0;
  // 전투력 차이가 클수록 보너스가 덜 통한다 (적보다 크게 약하면 운과 명성만으로는 이길 수 없다)
  const pw=clamp(ratio,BONUS_MIN,1);
  return {ratio,base,pw,luck:luck>0?luck*pw:luck,under:under*pw,fame:Math.min(FAME_CAP+SKV.famecap*sk(s,'fame'),fameBonus(s))*pw,item:Math.min(ITEM_CAP,itemSum(s,'win')*curseF(s))*pw};}
function winProb(s,E,floor){const w=winParts(s,E);return clamp(w.base+w.luck+w.under+w.fame+w.item+cmb(s,'win',0)+compAdd(s,'win'),floor==null?FLOOR:floor,0.95);}
function unpacified(s){let k=0;for(let j=0;j<s.region;j++) if(!(s.pacified&&s.pacified[j])) k++;return k;}
let UNP_PEN=0.04; let CARRY_ADJ=1.0; let BONUS_MIN=0.15; let CARRY_STEP=[1,7.4,2.95,2.5,2.6,0.6]; let CARRY_REF=[0,350,750,1300,2300,4400]; let CARRY_ALPHA=0.5; let FRESH=[1,1.6,1.6,1.65,1.8,1]; let FAME_CAP=0.1, ITEM_CAP=0.2;
const PROC_PTS=[[8,0],[10,0.015],[20,0.08],[30,0.18],[35,0.30],[40,0.50]];
function procCurve(v){if(v<=PROC_PTS[0][0])return 0;for(let i=1;i<PROC_PTS.length;i++){const [x1,y1]=PROC_PTS[i-1],[x2,y2]=PROC_PTS[i];if(v<=x2)return y1+(y2-y1)*(v-x1)/(x2-x1);}return 0.5;}
const RESIST=[0,6,12,18,24,30];
function resistOf(s){return RESIST[worldOf(s.stage)]*(wtrait(s)==='elder'?2:1);}
function effLuk(s){return s.stats.luk-Math.max(0,resistOf(s)-SKV.lucky*sk(s,'lucky'));}
function effCha(s){return s.stats.cha-Math.max(0,resistOf(s)-SKV.charm*sk(s,'charm'));}
function luckProc(s,n){return n.final?0:procCurve(effLuk(s));}
function charmProc(s,n){return n.final?0:procCurve(effCha(s));}
const MERC_CAP=12;
function mercCap(s){return MERC_CAP+SKV.cmdcap*sk(s,'command')+(s.mercCapB||0);}
function addAlly(s,out){ const cap=mercCap(s); if(s.allies>=cap){ s.gold+=30; out.push({t:'good',x:`용병단이 가득 차 합류 대신 금화를 받았다 (최대 ${cap}명)`}); return; } s.allies++; out.push({t:'good',x:`용병 합류 (총 ${s.allies}/${cap}명)`}); }
function loseAllies(s,out,k){ if(!s.allies||s.dead) return; k=Math.max(0,k-sk(s,'command')); if(!k) return; const n=Math.min(s.allies,k); s.allies-=n; out.push({t:'bad',x:`용병 ${n}명이 쓰러졌다 (남은 ${s.allies}명)`}); }
function teamBonus(s){let k=0;for(const x in s.comp) if(s.comp[x]) k++; if(s.spouse) k++; return k*0.04+Math.min(0.05,s.allies*0.005);}
function fameBonus(s){return Math.max(0,s.fame)/100*0.01;}
function revives(s){return s.revive+s.items.filter(i=>i.revive).length;}
const REVIVE_MAX=1;
function addRevive(s,out){if(revives(s)<REVIVE_MAX){s.revive++;if(out)out.push({t:'good',x:'부활 +1'});}else{s.hpBonus=(s.hpBonus||0)+0.25;const o=s.maxHp;s.maxHp=hpMax(s);s.hp+=Math.max(0,s.maxHp-o);if(out)out.push({t:'good',x:'부활은 1회까지라 대신 최대 생명력 +25%'});}}
function itemSum(s,key){let v=0;for(const it of s.items){if(it.spare)continue;if(key==='win')v+=effWin(it);else if(key==='flee')v+=effFlee(it);else if(it[key])v+=it[key];}return v;}
function fleeProb(s,boss){return clamp((0.38+(s.stats.agi-10)*0.04+(s.stats.luk-10)*0.01+tsum(s,'flee',0)+compSum(s,'flee')+itemSum(s,'flee')*curseF(s)+SKV.flee*sk(s,'flee'))*(boss?0.65:1),0.04,0.97);}
function talkProb(s,node){ return talkProbRaw(s,node)*clamp(power(s)/node.E,0.25,1)*(wtrait(s)==='sin'?0.5:1); }
function talkProbRaw(s,node){
  const big=Math.log10(Math.max(10,(node.count||1)*30));
  return clamp((0.06+clamp((effCha(s)-10)*0.03,-0.15,0.30)+(s.stats.int-10)*0.012+tsum(s,'talk',0)+compSum(s,'talk')+clamp(s.fame/400,-0.05,0.25)-big*0.012+SKV.talk*sk(s,'talk'))*(node.final?0.06:node.boss?0.25:1),0.005,0.7);
}

// Current choice with options
// ===== 전투 선택지: 스킬 공격 · 약점 공략 =====
const WK=['dull','glass','mana','vital'];
const WK_NAME={dull:'둔함',glass:'유리몸',mana:'마력 취약',vital:'급소 노출'}, WK_STAT={dull:'agi',glass:'str',mana:'int',vital:'luk'}, WK_ICON={dull:'🐢',glass:'🥚',mana:'🔮',vital:'🎯'};
const WK_HOW={dull:'빠르게 파고든다(민첩)',glass:'힘으로 부순다(힘)',mana:'주문으로 꿰뚫는다(지능)',vital:'운에 맡겨 급소를 찌른다(행운)'};
// 지배자 단서 (간접적). 각 약점마다 여러 문구
const WK_CLUE={dull:['놈이 지나간 자리마다 바닥이 깊게 패어 있다','놈은 돌아설 때마다 한 박자 늦는다','놈의 그림자가 몸보다 늦게 따라온다','부서진 기둥 사이로 놈이 비집고 들어오지 못한다'],
  glass:['쓰러진 기사의 검끝에 놈의 비늘 조각이 걸려 있다','놈의 몸 곳곳에 아물지 않은 상처가 벌어져 있다','놈이 벽에 부딪히자 몸에서 무언가 바스러지는 소리가 났다','놈은 맨몸으로 받아낸 화살에도 움찔한다'],
  mana:['놈이 다가오자 횃불이 꺼졌다 켜지기를 반복한다','놈의 발밑 마법진이 금이 간 채 희미하게 깜빡인다','놈은 성수 냄새에 코를 찡그린다','놈이 지나간 자리의 룬 문자가 일그러져 있다'],
  vital:['놈은 싸우는 내내 왼쪽 옆구리를 감싼다','놈의 숨결이 일정하지 않다. 무언가를 숨기고 있다','놈의 갑옷에서 한 군데만 빛이 반사되지 않는다','놈은 등 뒤로 다가오는 것을 유난히 경계한다']};
const SK_USES=2;
function hashRng(s,k){return rng(mixSeed((s.hero.seed>>>0)||1,k>>>0));}
// 일반 몬스터의 약점은 이름으로 정해진다 (모든 판에서 같다)
function monWeak(name){let h=0;const x=String(name).replace(/ \(\d+회차\)$/,'').replace(/^되살아난 /,'').replace(/(의 망령)+$/,'');for(let i=0;i<x.length;i++)h=(h*31+x.charCodeAt(i))>>>0;return WK[h%4];}
// 지배자의 기만: 그 시점 용사들의 보통 지능 정도. 단서 신뢰도 = 40% + 30% × (지능/기만 − 1), 25~70%
function deceit(s){const st=STAGES[s.stage];if(st.endless&&st.hunt==null)return Math.round(100+(s.region+1));if(st.hunt!=null)return [20,40,60,90,120][st.hunt]||60;return [15,30,45,70,100][s.stage]||60;}
function clueAcc(s){return clamp(0.4+0.3*(s.stats.int/Math.max(1,deceit(s))-1),0.25,0.7);}
function bossWeak(s,n){if(n.wk&&n.wkKey===s.stage*1e4+s.region*10+(n.tries||0))return;const key=s.stage*1e4+s.region*10+(n.tries||0);const r=hashRng(s,0x57000000+key);
  n.wkKey=key;n.wk=WK[Math.floor(r()*4)];const acc=clueAcc(s);n.clues=[0,1].map(()=>{const real=r()<acc;let w=n.wk;if(!real){const o=WK.filter(x=>x!==n.wk);w=o[Math.floor(r()*3)];}const L=WK_CLUE[w];return L[Math.floor(r()*L.length)];});n.acc=acc;}
// 스킬 공격: 익힌 전투 스킬로 승률을 올린다 (지능이 효과를 키운다). 지역(층)마다 2번
function skillAtk(s,n){const b=(0.08*sk(s,'blade')+0.05*sk(s,'giant')+(n.boss?0.06*sk(s,'boss'):0)+0.03*sk(s,'command'))*skAmp(s);return b>0?Math.min(0.25,b)+affSum(s,'sk'):0;}
// 일반 몬스터 약점 공략: 그 능력치가 기만보다 높을수록 이득, 낮으면 손해. 모르는 약점이면 효과 절반
function weakAdj(s,n){const w=monWeak(n.name);const v=s.stats[WK_STAT[w]]||0;const b=clamp(0.2*(v/Math.max(1,deceit(s))-1),-0.15,0.2);return (s.mk&&s.mk[n.name]>=3)?b:b*0.5;}
function current(s){
  if(s.dead||s.over) return null;
  if(!s.queue.length){ nextRegion(s); if(s.over) return null; }
  const n=s.queue[0];
  if(n.type==='battle'){
    const unp=n.final?unpacified(s):0; n.unp=unp;
    const fw=winParts(s,n.E); const pRaw=n.final?clamp((STAGES[s.stage].fx||FINAL_X)*clamp(fw.base+fw.luck+fw.under+(fw.fame+fw.item)*0.5,0.12,0.95)-UNP_PEN*unp,0.02,0.6):n.boss?clamp(winProb(s,n.E)*BOSS_X,0.2,0.85):winProb(s,n.E);
    const adj=n.boss?((n.bonus||0)+teamBonus(s))*clamp(pRaw/0.35,0.2,1)+(s.stage===0?(s.legBoss||0):0):0; n.skAdj=((pRaw<0.6?SKV.giant*sk(s,'giant')*skAmp(s):0)+(n.boss?SKV.boss*sk(s,'boss')*skAmp(s)*fw.pw+tsum(s,'boss',0):0))*fw.pw; n.deal=n.boss?dealAdj(s):0; const p=clamp(pRaw+adj+n.skAdj+n.deal,0.03,0.92); n.adj=adj; n.pRaw=pRaw; const pf=fleeProb(s,n.boss), pt=talkProb(s,n);
    const count=n.count;
    {const rr=power(s)/n.E; n.rr=rr; n.lp=luckProc(s,n)*clamp(rr,BONUS_MIN,1); n.cp=charmProc(s,n)*clamp(rr,BONUS_MIN,1);} n.pBase=p; n.ptBase=pt;
    n.p=clamp(p+(1-p)*n.lp,0.03,0.97); n.pf=pf; n.pt=clamp(pt+(1-pt)*n.cp,0.005,0.9); n.parts=winParts(s,n.E);
    const title=n.boss?(n.tries?`${n.name}에게 다시 도전한다. (${n.tries}번째 도전, 최대 ${n.final?finalTries(s):BOSS_TRIES}번)`:`${n.place}의 지배자, ${n.name}이(가) 앞을 막았다.`):`${n.name} ${fmtK(count)}마리의 무리를 마주했다.`;
    const hint=n.p>=0.8?'충분히 이길 만하다.':n.p>=0.68?'해볼 만한 싸움이다.':n.p>=0.55?'만만치 않은 상대다.':'이길 가능성은 떨어진다.';
    // 스킬 공격·약점 공략
    const skB=skillAtk(s,n),skLeft=SK_USES-((s.skUse&&s.skUse.r===s.stage*1e4+s.region)?s.skUse.n:0);n.pSk=clamp(n.p+skB,0.03,0.95);
    const skOpt={id:'skill',label:'스킬 공격',prob:n.pSk,disabled:skB<=0||skLeft<=0,desc:skB<=0?'검술·거인 사냥·지배자 사냥·지휘 중 하나라도 익혀야 쓸 수 있다.':`익힌 전투 스킬로 몰아친다. 승률 +${Math.round(skB*100)}%p${skAmp(s)>1.0001?` (지능 증폭 +${Math.round((skAmp(s)-1)*100)}% 포함)`:''}. 이 지역에서 ${skLeft}번 남음.`};
    let wkOpts;
    if(n.boss){bossWeak(s,n);n.pWkHit=clamp(n.p*3,0.03,0.95);n.pWkMiss=clamp(n.p*0.5,0.01,0.95);
      n.wkInfo=`단서 1: "${n.clues[0]}" · 단서 2: "${n.clues[1]}" · 눈썰미: 놈의 기만 ${deceit(s)} / 내 지능 ${s.stats.int} → 단서 하나가 진짜일 확률 약 ${Math.round(n.acc*100)}%`;
      wkOpts=WK.map(w=>({id:'wk:'+w,label:`${WK_ICON[w]} ${WK_NAME[w]} 공략`,prob:null,wk:1,desc:`${WK_HOW[w]}. 맞히면 승률 ${Math.round(n.pWkHit*100)}%, 틀리면 ${Math.round(n.pWkMiss*100)}%.`}));}
    else {const adjW=weakAdj(s,n);n.pWk=clamp(n.p+adjW,0.03,0.95);const w=monWeak(n.name);const known=s.mk&&s.mk[n.name]>=3;
      wkOpts=[{id:'wk',label:known?`${WK_ICON[w]} ${WK_NAME[w]} 공략`:'❔ 약점 공략',prob:n.pWk,desc:known?`${WK_HOW[w]}. 그 능력치가 놈보다 높을수록 유리하고, 낮으면 오히려 불리하다.`:'아직 약점을 모른다. 효과가 절반이고, 이득일지 손해일지는 해 봐야 안다.'}];}
    if(n.boss&&STAGES[s.stage].endless) return {node:n,title:`${n.place}의 수문장, ${n.name}이(가) 길을 막았다.`+(n.tries?` (${n.tries}번째 도전)`:''),hint:hint+' 수문장을 쓰러뜨려야만 다음 층으로 오를 수 있다.',wkInfo:n.wkInfo,options:[
      {id:'fight',label:'기본 공격',prob:n.p,desc:'이기면 다음 층으로 오른다. 두 번 지면 여정이 끝난다.'},skOpt,...wkOpts]};
    if(n.final) return {node:n,title,hint:hint+' 마지막 지배자 앞에서는 물러설 곳도, 말로 넘어갈 길도 없다.',wkInfo:n.wkInfo,options:[
      {id:'fight',label:'기본 공격',prob:n.p,desc:`이기면 이 세계를 정복한다. 지면 재정비 후 다시 도전할 수 있다(최대 ${finalTries(s)}번).`},skOpt,...wkOpts]};
    return {node:n,title,hint,wkInfo:n.wkInfo,options:[
      {id:'fight',label:'기본 공격',prob:n.p,desc:`승리 시 무리를 섬멸한다. 패배하면 큰 부상을 입는다.${n.lp>=0.005?` 행운의 일격 ${(n.lp*100).toFixed(1)}% 포함.`:''}`},skOpt,
      {id:'flee',label:'도망간다',prob:pf,disabled:!!n.noFlee,desc:n.noFlee?'망령이 길을 막아 도망칠 수 없다.':(n.boss?'성공하면 이 지역을 포기하고 다음 지역으로 간다.':'성공하면 무리를 피해 지나간다.')+` 도망치면 사기 저하로 전투력 -10%(지배자를 쓰러뜨릴 때까지 누적${s.fleeDebuff?`, 지금 ${s.fleeDebuff}회`:''}). 실패 시 부상.`},
      {id:'talk',label:'회유한다',prob:n.pt,desc:`성공하면 싸움 없이 굴복시키고 용병으로 삼는다. 실패하면 분노한 적과 불리하게 싸운다.${n.cp>=0.005?` 매혹 ${(n.cp*100).toFixed(1)}% 포함.`:''}`},
      ...wkOpts,
    ]};
  }
  if(n.type==='skill'){return {node:n,title:n.sure?'의뢰인이 비전을 전수한다.':'새로운 기술을 익힐 때가 왔다.',hint:n.sure?'셋 중 하나를 고른다. 이번 습득은 반드시 성공한다.':`셋 중 하나를 고른다. 기본 확률은 기술마다 55~85%로 다르다. 여기에 행운 5당 +2%p(지금 +${Math.round(skillRate(s).luck*100)}%p)${s.insight?`, 깨달음 ${s.insight}개 +${s.insight*5}%p`:''}가 더해진다(최대 95%). 실패하면 기회는 사라지고 깨달음이 쌓인다. 같은 기술은 ${SK_MAX}랭크까지, 한 계열에서는 서로 다른 기술 ${ROLE_MAX}종까지 익힐 수 있다.${WORLD_TRAITS[worldOf(s.stage)]?` 이 세계의 특성: ${WORLD_TRAITS[worldOf(s.stage)].name} (${WORLD_TRAITS[worldOf(s.stage)].d}).`:''}`,
    options:n.offers.map((id,oi)=>{const k=SKILL_BY[id],r=sk(s,id);const b=n.rates?n.rates[oi]:0.70;return {id:'sk:'+id,label:`${k.name} ${r?`${r}→${r+1}랭크`:'습득'}`,prob:n.sure?1:skillRate(s,b).rate,desc:`[${k.role}] ${k.d(r+1)}${n.sure?'':` · 기본 ${Math.round(b*100)}%`}`};})};}
  if(n.type==='explore'){const tr=clamp(0.3-(s.stats.int-10)*0.012-(s.stats.agi-10)*0.008,0.08,0.45);n.trap=tr;
    if(n.title==null){const L=EXPLORE_TXT[worldOf(s.stage)];n.title=L[Math.floor(s.r()*L.length)];}
    return {node:n,title:n.title,hint:`샅샅이 뒤질수록 귀한 것을 찾지만 함정도 많다. (함정 확률 약 ${Math.round(tr*100)}%)`,options:[
      {id:'deep',label:'샅샅이 탐험한다',desc:'아이템, 기연, 뜻밖의 만남 확률이 높다. 함정에 빠질 위험도 높다.'},
      {id:'careful',label:'조심스럽게 둘러본다',desc:'위험은 적지만 발견도 적다.'},
      {id:'skip',label:'탐험하지 않고 지나간다',desc:'아무 일도 일어나지 않는다.'}]};}
  if(n.type==='prep'){const b=n.boss;
    n.wp=clamp(1/3+(s.stats.luk-10)*0.004,0.25,0.5); n.gb=b.final?0.10:0.08; n.cb=b.final?0.06:0.05;
    const tb=teamBonus(s);
    return {node:n,title:`${b.name}이(가) 기다리는 ${b.place}의 심장부. 운명의 여신이 내기를 건다.`,hint:`가위바위보로 운을 시험할 수 있다. 이기면 축복(이번 지배자전 승률 +${Math.round(n.gb*100)}%p), 지면 저주(-${Math.round(n.cb*100)}%p), 비기면 아무 일도 없다. 행운이 높을수록 이길 확률이 오른다(지금 ${Math.round(n.wp*100)}%).${tb>0?` 동료와 용병은 합동 공격으로 승률 +${Math.round(tb*100)}%p를 보탠다.`:''}`,options:[
      {id:'rps',label:'운명의 내기에 응한다',prob:n.wp,desc:`이기면 축복 +${Math.round(n.gb*100)}%p · 지면 저주 -${Math.round(n.cb*100)}%p · 비기면 그대로`},
      {id:'go',label:'내기를 거절하고 맞선다',desc:'아무 일도 일어나지 않는다.'}]};}
  if(n.type==='rest'){return {node:n,title:'해가 저물어 야영할 곳을 찾았다.',hint:`지금 생명력은 ${Math.max(0,s.hp)} / ${s.maxHp}이다.`,options:[
      {id:'sleep',label:'불을 피우고 푹 잔다',desc:'생명력 +45%. 밤중에 습격당할 수 있다.'},
      {id:'guard',label:'경계하며 쉰다',desc:'생명력 +25%. 안전하다.'},
      {id:'drill',label:'잠을 줄이고 수련한다',desc:'생명력 +10%, 힘·민첩·지능 중 하나 +1.'}]};}
  // events
  if(!n.kind) rollEvent(s,n);
  const k=n.kind;
  if(k==='heroine'){return {node:n,title:n.c.meet,hint:`구해주면 동행할지도 모른다. (${n.c.d})`,options:[
      {id:'rescue',label:'구하러 뛰어든다',prob:clamp(winProb(s,(n.rescueE=n.rescueE||makeBattle(s,s.region,0,false).E)*1.2)+0.1+compJoinAdj(s),0.1,0.95),desc:'성공하면 동행한다. 실패하면 부상을 입는다.'},
      {id:'pass',label:'못 본 척 지나간다',desc:'명성 -1.'}]};}
  if(k==='friend'){return {node:n,title:n.c.meet,hint:`마음이 맞으면 친구가 된다. (${n.c.d})`,options:[
      {id:'befriend',label:'함께 가자고 한다',prob:clamp(0.45+(s.stats.cha-10)*0.04+s.fame/500+compJoinAdj(s),0.15,0.92),desc:'성공하면 친구로 동행한다.'},
      {id:'pass',label:'거절한다',desc:'아무 일도 일어나지 않는다.'}]};}
  if(k==='pet'){return {node:n,title:n.c.meet,hint:`돌봐주면 따를지도 모른다. (${n.c.d})`,options:[
      {id:'tame',label:'돌봐준다',prob:clamp(0.55+(s.stats.cha-10)*0.03+(s.stats.luk-10)*0.02+compJoinAdj(s),0.2,0.92),desc:'생명력 -10%. 성공하면 펫이 된다.'},
      {id:'pass',label:'지나친다',desc:'아무 일도 일어나지 않는다.'}]};}
  if(k==='quest'){const q=n.q;n.qE=n.qE0||(n.qE0=Math.max(battleBaseE(s,s.region)*QUEST_E,power(s)*1.8));
    return {node:n,title:`명성을 들은 ${q.giver}이(가) ${q.task} 토벌을 의뢰했다.`,hint:`성공하면 명성 +40과 함께 'PvP 스탯 +1' 또는 '영웅~전설 아이템' 중 하나를 고른다. 의뢰 대상은 매우 강하다. 지금 이 싸움의 승리확률은 약 ${Math.round(winProb(s,n.qE)*100)}%다.`,options:[
      {id:'accept',label:'의뢰를 수락한다',desc:'바로 토벌에 나선다. 실패하면 명성 -5.'},
      {id:'decline',label:'정중히 거절한다',desc:'명성 -1. 이 의뢰인은 이 세계에서 다시 찾아오지 않는다.'}]};}
  if(k==='qreward'){const q=n.q;return {node:n,title:`${q.giver}이(가) 약속한 보상을 내밀었다.`,hint:'둘 중 하나를 고른다.',options:[
      {id:'qpvp',label:'비전 전수: PvP 스탯 +1',disabled:pvpRaw(s)>=PVP_CAP,desc:`암살·부활·축복·저주 중 하나가 무작위로 +1 오른다. (신화를 뺀 PvP 스탯 총합 ${pvpRaw(s)}/${PVP_CAP})`},
      {id:'qitem',label:'보물고 열람: 영웅~전설 아이템',desc:'아이템 계열을 직접 고른다. 이 세계의 영웅 등급(95%) 또는 전설 등급(5%)이 나온다.'}]};}
  if(k==='qpick'){const tr=tierOf(s);return {node:n,title:`${n.q.giver}의 보물고. 어떤 계열을 가져갈까?`,hint:'고른 계열의 이 세계 아이템이 영웅(95%) 또는 전설(5%) 등급으로 나온다. 조합에 필요한 전설 아이템을 노릴 수 있다.',
    options:QPICK.map(([k,lab])=>({id:'qk:'+k,label:lab,desc:`영웅: ${itemNameOf(k,2,tr)} · 전설: ${itemNameOf(k,3,tr)}`}))};}
  if(k==='proposal'){const q=n.q,sp=spOf(s,n);return {node:n,title:`${q.giver}이(가) ${sp.name}와(과)의 혼담을 주선했다.`,hint:`혼인하면 배우자가 평생 곁을 지킨다. (${sp.d}, 명성 +30) 상대의 마음은 매력과 명성에 달렸다.`,options:[
      {id:'marry',label:'청혼한다',prob:clamp(0.4+(s.stats.cha-10)*0.03+s.fame/1000+compJoinAdj(s),0.15,0.9),desc:'성공하면 배우자가 생긴다. 실패하면 명성 -3.'},
      {id:'refuse',label:'토벌이 먼저라며 거절한다',desc:'명성 -3.'}]};}
  if(k==='hidden'){const H=HIDDEN_EV[s.hero.wealth.name];const z=n.quiz;
    return {node:n,title:`[히든] ${H.name} · ${H.title}`,hint:`문제: ${z.q} · 맞히면 ${H.reward}. 틀리면 기회는 사라진다.`,options:z.ch.map((c,ix)=>({id:'hq_'+ix,label:c,desc:''}))};}
  if(k==='cursed'){return {node:n,title:'[저주받은 보물] 피 묻은 제단 위에 전설의 무구가 놓여 있다.',hint:`가져가면 전설 장비를 얻는다. 대신 저주가 따라붙어 다음 지배자전 승률이 ${Math.round(CURSE_BOSS*100)}%p 줄어든다.${s.bossCurse?' (이미 저주를 지고 있다. 겹친다)':''}`,options:[
      {id:'ctake',label:'가져간다',desc:`영웅(80%) 또는 전설(20%) 장비 획득 · 다음 지배자전 승률 -${Math.round(CURSE_BOSS*100)}%p`},
      {id:'cleave',label:'손대지 않는다',desc:'아무 일도 일어나지 않는다.'}]};}
  if(k==='oath'){return {node:n,title:'[기사의 맹세] 쓰러진 기사가 피를 흘리며 도움을 청한다.',hint:`치료하면 생명력 20%를 잃는다. 대신 기사가 맹세한다: ${OATH_AFTER}지역 뒤 지배자전에 달려와 함께 싸운다(승률 +${Math.round(OATH_BOSS*100)}%p).`,options:[
      {id:'oheal',label:'치료해 준다',desc:`생명력 -20% · ${OATH_AFTER}지역 뒤 지배자전 승률 +${Math.round(OATH_BOSS*100)}%p`},
      {id:'opass',label:'갈 길이 바쁘다',desc:'아무 일도 일어나지 않는다.'}]};}
  if(k==='pact'){return {node:n,title:'[악마의 거래] 그림자 속에서 악마가 손을 내민다.',hint:`계약하면 다음 지배자를 쓰러뜨릴 때까지 전투력이 ${Math.round((PACT_POW-1)*100)}% 오른다. 계약금으로 최대 생명력 ${Math.round(PACT_HP*100)}%를 영원히 바친다. 그 지배자에게 끝내 지거나 도망치면 악마가 모든 능력치의 ${Math.round(PACT_PEN*100)}%를 더 가져간다.`,options:[
      {id:'psign',label:'계약한다',desc:`전투력 +${Math.round((PACT_POW-1)*100)}% · 최대 생명력 영구 -${Math.round(PACT_HP*100)}% · 못 꺾으면 모든 능력치 -${Math.round(PACT_PEN*100)}%`},
      {id:'ppass',label:'거절한다',desc:'아무 일도 일어나지 않는다.'}]};}
  if(k==='fork'){return {node:n,title:'[갈림길] 길이 둘로 갈라진다.',hint:`지금 생명력 ${Math.max(0,s.hp)} / ${s.maxHp}. 험한 산길에는 적과 보물이, 강길에는 쉴 곳이 있다.`,options:[
      {id:'fmount',label:'험한 산길',desc:'전투 1번 추가 · 이기면 영웅 등급 이상 상자'},
      {id:'friver',label:'안전한 강길',desc:'휴식 1번 추가 (생명력 회복)'}]};}
  if(k==='gambler'){return {node:n,title:n.again?`[명성 도박꾼] "한 판 더 하겠나?" (${n.again+1}번째 판)`:'[명성 도박꾼] 컵 세 개를 늘어놓은 사내가 씩 웃는다.',hint:`"공이 든 컵을 맞히면 건 명성의 3배를 돌려주지." 맞힐 확률은 1/3이다. 틀리면 건 명성을 잃는다. 명성이 ${fmtG(GAMBLE_CONT)} 이상이면 계속할 수 있다. 지금 명성은 ${fmtG(s.fame)}이다.`,
    options:[...GAMBLE_BETS.map(p=>{const st=gambleStake(s,p);return {id:'gb:'+p,label:p===100?`명성 전부 건다 (${fmtG(st)})`:`명성 ${p}% 건다 (${fmtG(st)})`,prob:GAMBLE_P,disabled:st<1,desc:`맞히면 명성 +${fmtG(st*(GAMBLE_PAY-1))} · 틀리면 -${fmtG(st)}`};}),
      {id:'gpass',label:'판에 끼지 않는다',desc:'아무 일도 일어나지 않는다.'}]};}
  if(k==='tomb'){return {node:n,title:'전설 속 영웅의 무덤이 네 명성에 응답해 문을 열었다.',hint:'명성 150 이상인 자에게만 열리는 곳이다.',options:[
      {id:'inherit',label:'유산을 계승한다',desc:'모든 능력치 +3, 생명력 -20%.'},
      {id:'pass',label:'경의만 표하고 떠난다',desc:'명성 +10.'}]};}
  if(k==='merchant'){const cost=Math.round(30*econ(s,1.3));n.cost=cost;
    return {node:n,title:'길가에서 떠돌이 상인을 만났다.',hint:`성수 한 병에 금화 ${fmtG(cost)}닢. 지금 가진 금화는 ${fmtG(s.gold)}닢이다.`,options:[
      {id:'buy',label:'성수를 산다',desc:'체력을 모두 회복한다.',disabled:s.gold<cost},
      {id:'rob',label:'물건을 빼앗는다',prob:clamp(0.3+(s.stats.str-10)*0.04,0.05,0.85),desc:'성공하면 무작위 장비를 얻는다. 실패하면 상인의 호위에게 다친다.'},
      {id:'pass',label:'지나친다',desc:'아무 일도 일어나지 않는다.'}]};}
  if(k==='altar'){return {node:n,title:'핏자국이 남은 수상한 제단을 발견했다.',hint:'무언가가 기도를 기다리는 듯하다.',options:[
      {id:'pray',label:'기도한다',prob:clamp(0.5+(s.stats.luk-10)*0.03,0.15,0.85),desc:'성공하면 능력치가 크게 오른다. 실패하면 저주를 받는다.'},
      {id:'smash',label:'제단을 부순다',desc:'힘 +1, 체력이 조금 깎인다.'},
      {id:'pass',label:'지나친다',desc:'아무 일도 일어나지 않는다.'}]};}
  if(k==='knight'){return {node:n,title:'쓰러진 기사가 도움을 청한다.',hint:'치료하려면 시간과 체력이 든다.',options:[
      {id:'heal',label:'치료해준다',prob:clamp(0.55+(s.stats.cha-10)*0.03,0.2,0.9),desc:'체력 -15%. 성공하면 기사가 용병으로 합류한다.'},
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
// 큰 수는 만·억·조·경·해·자·양·구·간·정·재·극·항하사·아승기·나유타·불가사의·무량대수 단위로 줄여 쓴다 (10만 이상)
const BIG_UNITS=[[1e68,'무량대수'],[1e64,'불가사의'],[1e60,'나유타'],[1e56,'아승기'],[1e52,'항하사'],[1e48,'극'],[1e44,'재'],[1e40,'정'],[1e36,'간'],[1e32,'구'],[1e28,'양'],[1e24,'자'],[1e20,'해'],[1e16,'경'],[1e12,'조'],[1e8,'억'],[1e4,'만']];
function fmtExact(n){return Math.round(n).toLocaleString('ko-KR');}
function fmtG(n){if(!isFinite(n))return String(n);const a=Math.abs(n);if(a<1e5)return fmtExact(n);
  if(a>=1e72){const ex=Math.floor(Math.log10(a/1e68));return (n/1e68/Math.pow(10,ex)).toFixed(2)+'×10^'+ex+' 무량대수';}
  for(const[v,u]of BIG_UNITS)if(a>=v){const x=n/v;return (Math.abs(x)>=100?Math.round(x).toLocaleString('ko-KR'):x.toFixed(1).replace(/\.0$/,''))+u;}return fmtExact(n);}
function fmtK(n){return fmtG(n);}

function lossRisk(s,n){ // 패배 시 예상 피해(읽기 전용, 판정에 영향 없음)
  const f=k=>n.final?Math.min(0.5,(0.2+0.4*(1-n.p))*k):(0.22+0.8*(1-n.p))*k*(n.boss?1.25:1);
  const lo0=n.final?0.8:0.7, hi0=n.final?1.2:1.3;
  const d=k=>Math.max(1,Math.round(s.maxHp*f(k)*(1-SKV.mDmg[mastery(s,'생존')])*(1-affSum(s,'dmg'))/Math.max(0.5,1+tsum(s,'hp',0))));
  const lo=d(lo0), hi=d(hi0), hp=s.hp;
  const fall=hi>=hp?(lo>=hp?1:(hp-lo)<=0?1:(hi-hp+1)/(hi-lo+1)):0;
  let save=null; if(fall>0){
    if(s.items.some(it=>it.heal)) save='성수';
    else if(['heroine','friend'].map(k=>s.comp[k]).find(c=>c&&c.save&&!s.saves[c.name])) save='동료의 구원';
    else if(s.gritLeft>0) save='질긴 목숨';
    else if(s.revive>0||s.items.some(it=>it.revive)) save='부활';
  }
  return {lo,hi,hp,fall:Math.min(1,fall),save,death:save?0:Math.min(1,fall)};
}
function hurt(s,frac,out){
  frac*=(1-SKV.mDmg[mastery(s,'생존')])*(1-affSum(s,'dmg'));
  const dmg=Math.max(1,Math.round(s.maxHp*frac/Math.max(0.5,1+tsum(s,'hp',0)))); s.hp-=dmg; out.push({t:'bad',x:`체력 -${dmg}`});
  if(s.hp<=0){
    const feather=s.items.findIndex(it=>it.revive);
    const potion=s.items.findIndex(it=>it.heal);
    const saver=['heroine','friend'].map(k=>s.comp[k]).find(c=>c&&c.save&&!s.saves[c.name]);
    if(potion>=0){s.items.splice(potion,1);s.hp=Math.round(s.maxHp*0.4);out.push({t:'good',x:'쓰러지기 직전 성수를 마셨다. 생명력 40% 회복',near:'potion'});}
    else if(saver){s.saves[saver.name]=1;s.hp=Math.round(s.maxHp*0.6);out.push({t:'comp',x:`${saver.name}이(가) 몸을 던져 구해냈다`,near:'saver'});}
    else if(s.gritLeft>0){s.gritLeft--;s.hp=Math.max(1,Math.round(s.maxHp*SKV.grit));out.push({t:'good',x:'질긴 목숨: 쓰러지지 않고 버텼다',near:'grit'});}
    else if(s.revive>0||feather>=0){ if(feather>=0)s.items.splice(feather,1); else s.revive--; s.hp=Math.round(s.maxHp*0.5); out.push({t:'good',x:'죽음의 문턱에서 되살아났다',near:'revive'}); }
    else {s.dead=true;s.hp=0;}
  }
}
// 금화·가격 배율: 지역을 지날 때마다 오르고, 세계를 넘어가도 내려가지 않는다
// 경제 배수: 본 세계에서는 지역마다 커지고, 끝없는 전장 진입 뒤에는 층마다 1.1%씩만 커진다 (금화 숫자 폭주 방지)
let GOLD_IN=0.2; const ECON_LATE=1.011;
function econP(s){const P=Math.max(0,s.prog||0);return s.progE!=null?Math.min(P,s.progE):P;}
function econLate(s){const P=Math.max(0,s.prog||0);return s.progE!=null&&P>s.progE?Math.pow(ECON_LATE,P-s.progE):1;}
function econRaw(s,b){const P=econP(s);return Math.pow(b,Math.min(P,14))*Math.pow(1+(b-1)*0.35,Math.max(0,P-14))*econLate(s);}
// 금화 인플레 억제: 모든 금화 수입·가격에 같은 비율(ECON_K)을 곱해 숫자만 작게 한다 (구매력은 그대로). 마계에서 약 1/100.
const ECON_K=0.14;
function econ(s,b){return econRaw(s,b)*Math.pow(econRaw(s,1.3),ECON_K-1);}
function rs(s,b){return Math.pow(b,Math.min(Math.max(0,s.region),14));}
function placeName(s){const st=STAGES[s.stage];const rg=st.regions[Math.max(0,s.region)];return rg?rg[0]:st.name;}
function gainItem(s,out,bonus,src){
  const g=rollGrade(s.r,(bonus||0)+SKV.appraise*sk(s,'appraise')+cmb(s,'gradeB',0),cmb(s,'legend',0)+affSum(s,'leg')); const roll=s.r(); const it=roll<0.05?makeItem(s.r,0,'heal'):roll<0.06?makeItem(s.r,g,'revive'):makeItem(s.r,g,null,tierOf(s));
  it.src=src||'획득'; it.where=placeName(s);
  noteGot(s,it); equip(s,it); checkCombos(s,out); s.fame+=2+it.grade*4; out.push({t:'item g'+it.grade,x:`${GRADES[it.grade].name} 아이템: ${it.name} (${itemTxt(s,it)})`,got:{name:it.name,d:itemTxt(s,it),grade:it.grade,src:it.src,spare:!!it.spare,kept:s.items.includes(it),slot:slotOf(it),heal:!!it.heal,revive:!!it.revive}}); if(s.lastEquipNote) out.push({t:'good',x:s.lastEquipNote}); return;

}
function gainXp(s,amt,out){
  s.xp+=amt*(1+intXp(s)+tsum(s,'xp',0)+SKV.scholar*sk(s,'scholar')+SKV.mXp[mastery(s,'성장')]);
  while(s.xp>=s.lvl*10){s.xp-=s.lvl*10;levelUp(s,out);}
}
// 레벨업 한 번: 스킬 선택권(해당 레벨이면), 최대 생명력 갱신, 생명력 10% 회복. 경험치와 기연 모두 이 길을 탄다.
function levelUp(s,out){s.lvl++;if(isPickLevel(s.lvl))s.pendingPicks=(s.pendingPicks||0)+1;const o=s.maxHp;s.maxHp=hpMax(s);s.hp=Math.min(s.maxHp,s.hp+(s.maxHp-o)+Math.round(s.maxHp*0.1));out.push({t:'good',x:`레벨 ${s.lvl} 달성`});}
function kill(s,n,out){s.killed+=n.share;s.regionKilled[s.region]+=n.share;s.kills=(s.kills||0)+n.count;}
function winRewards(s,n,p,out){
  if(n.forkChest){const g=s.r()<0.05?3:2;const it=makeItem(s.r,g,null,tierOf(s));it.src='험한 산길의 상자';it.where=placeName(s);noteGot(s,it);equip(s,it);checkCombos(s,out);s.fame+=2+g*4;
    out.push({t:'item g'+g,x:`${GRADES[g].name} 아이템: ${it.name} (${itemTxt(s,it)})`,got:{name:it.name,d:itemTxt(s,it),grade:g,src:it.src,spare:!!it.spare,kept:s.items.includes(it),slot:slotOf(it),heal:false,revive:false}});if(s.lastEquipNote)out.push({t:'good',x:s.lastEquipNote});}
  if(s.r()<PVP_GAIN&&PVP_KEYS.reduce((a,k)=>a+((s.pvp||{})[k]||0),0)<PVP_CAP){const k=PVP_KEYS[Math.floor(s.r()*4)];s.pvp=s.pvp||{};s.pvp[k]=(s.pvp[k]||0)+1;out.push({t:'item g3',x:`PvP 스탯 획득: ${PVP_NAME[k]} +1`});s.lastEvent={ok:true,head:`PvP ${PVP_NAME[k]} +1`,sub:'몬스터 전투 승리 중 0.1% 확률'};}
  if(!n.quest) kill(s,n,out); s.wins++;
  const fg=Math.round(((n.boss?20:4)+(Math.min(s.region,20)*0.6)+40*(1-p)*(1-p))*(1+SKV.fame*sk(s,'fame'))*(1+cmb(s,'fame',0))*(1+affSum(s,'fame'))); s.fame+=fg; out.push({t:'fame',x:`명성 +${fg}`});
  if(s.comp.friend&&s.comp.friend.heal){const v=Math.round(s.maxHp*s.comp.friend.heal);s.hp=Math.min(s.maxHp,s.hp+v);}
  s.gold+=Math.round((1+SKV.merchant*sk(s,'merchant')+SKV.mGold[mastery(s,'재물')]+tsum(s,'gold',0))*(s.comp.friend&&s.comp.friend.gold?2:1)*Math.round((16+30*s.r())*econ(s,1.3)*(n.boss?3:1)*GOLD_IN));
  gainXp(s,(n.boss?8:3)*(1+2*(1-p)),out);
  const under=1-p;
  if(p<0.6){ s.upsets++; }
  if(s.r()< (0.05+under*under*0.9)*(1+SKV.treasure*sk(s,'treasure'))) gainItem(s,out,under*1.2+(n.boss?0.25:0),n.boss?'지배자 처치':n.quest?'의뢰 토벌':'전투 승리');
  if(p<0.5&&s.r()<0.5){ const k=STAT_KEYS[Math.floor(s.r()*6)]; const v=2+Math.floor(s.r()*3); s.stats[k]+=v;
    if(k==='con'){const o=s.maxHp;s.maxHp=hpMax(s);s.hp+=s.maxHp-o;}
    out.push({t:'item',x:`불리한 싸움을 이겨내고 각성했다: ${STAT_NAMES[k]} +${v}`}); }
  if(n.quest){ const q=n.q; s.lastEvent={ok:true,head:'의뢰 완수',sub:q.task}; s.activeQuest=null; s.quests++; (s.doneQ=s.doneQ||[]).push(q.giver);
    {const qf=Math.round(40*(1+affSum(s,'fame')));s.fame+=qf; out.push({t:'fame',x:`의뢰 완수 · 명성 +${qf}`});}
    s.queue.splice(1,0,{type:'event',kind:'qreward',q});
    if(!s.spouse && s.fame>=q.min+60 && s.stats.cha>=11){ const L=spList(s);const P=L.map((x,ix)=>ix).filter(ix=>!L[ix].rare&&compOk(s,L[ix])); if(P.length){let sp=P[Math.floor(s.r()*P.length)]; if(s.r()<RARE_P) sp=L.length-1; s.queue.splice(2,0,{type:'event',kind:'proposal',q,sp});} }
    else if(!s.spouse) out.push({t:'bad',x:`명성이 ${q.min+60} 이상이고 매력이 11 이상이었다면 혼담이 오갔을지 모른다`});
  }
  if(n.final){ s.conquered=true; s.pendingPicks=(s.pendingPicks||0)+SKV.conquerPicks; out.push({t:'item g3',x:`${STAGES[s.stage].name} 정복`}); }
  if(n.boss){ const endless=STAGES[s.stage].endless; if(endless||s.r()<0.5) gainItem(s,out,endless?Math.min(1,0.3+0.025*s.region):0.35,endless?'전장 수문장 처치':'지배자 처치'); (s.pacified=s.pacified||[])[s.region]=true; // pacify region: remaining demons scatter
    s.fame+=10; out.push({t:'fame',x:'지역 평정 · 명성 +10'}); if(s.fleeDebuff){s.fleeDebuff=0;out.push({t:'good',x:'사기 회복: 도망으로 깎인 전투력이 돌아왔다'});}
    const rest=s.regionTotal-s.regionKilled[s.region]; if(rest>1e-9){s.killed+=rest;s.regionKilled[s.region]+=rest;out.push({t:'good',x:`지배자가 쓰러지자 남은 악마가 흩어졌다 (+${rest.toFixed(2)}%)`});}
    s.hp=Math.min(s.maxHp,s.hp+Math.round(s.maxHp*0.5));
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
function questFail(s,n,out){ if(n.quest&&!s.dead){ s.lastEvent={ok:false,head:'의뢰 실패',sub:n.q.task}; s.activeQuest=null; (s.doneQ=s.doneQ||[]).push(n.q.giver); s.fame-=5; out.push({t:'bad',x:`의뢰 실패 · 명성 -5`}); } }
function joinComp(s,slot,c,out){ s.comp[slot]=c; if(c.luk){s.stats.luk+=c.luk;} s.fame+=5; out.push({t:'comp',x:`${c.name} 동행 (${c.d})`}); }
// returns {text, effects[]}
function choose(s,optId){
  const c=current(s); const n=c.node; const r=s.r; const out=[]; let text='';
  s.decisions++;
  let roll=r();
  if(n.type==='skill'){ const id=String(optId).slice(3); const oi=n.offers.indexOf(id); const sr=n.sure?1:skillRate(s,n.rates&&oi>=0?n.rates[oi]:0.70).rate; if(n.sure)s.pendingPicks=(s.pendingPicks||0)+1;
    if(s.r()<sr){ s.insight=0; learnSkill(s,id,out); checkCombos(s,out); text=`${SKILL_BY[id].name}을(를) 익혔다.`; s.lastEvent={ok:true,head:'스킬 습득',sub:`${SKILL_BY[id].name} ${sk(s,id)}랭크`}; }
    else { s.pendingPicks--; s.insight=(s.insight||0)+1; text=`${SKILL_BY[id].name}을(를) 익히려 했지만 실패했다. 깨달음이 쌓였다.`; out.push({t:'bad',x:`스킬 습득 실패: ${SKILL_BY[id].name} (깨달음 ${s.insight}, 다음 습득 +${s.insight*5}%p)`}); s.lastEvent={ok:false,head:'스킬 습득 실패',sub:`${SKILL_BY[id].name} · 깨달음 +1 (다음 +${s.insight*5}%p)`}; } }
  else if(n.type==='battle'){
    if(optId==='skill'||optId==='wk'||String(optId).startsWith('wk:')){
      if(optId==='skill'){const key=s.stage*1e4+s.region;if(!s.skUse||s.skUse.r!==key)s.skUse={r:key,n:0};s.skUse.n++;n.p=n.pSk;out.push({t:'good',x:`스킬 공격 (승률 ${Math.round(n.pSk*100)}%)`});}
      else if(optId==='wk'){n.p=n.pWk;const w=monWeak(n.name);out.push({t:n.pWk>=n.pBase?'good':'bad',x:`약점 공략: ${WK_NAME[w]} (승률 ${Math.round(n.pWk*100)}%)`});}
      else {const g=String(optId).slice(3);const hit=g===n.wk;n.p=hit?n.pWkHit:n.pWkMiss;s.wkTry=(s.wkTry||0)+1;if(hit)s.wkHit=(s.wkHit||0)+1;
        out.push(hit?{t:'item g3',x:`약점을 꿰뚫었다! ${WK_ICON[g]} ${WK_NAME[g]} → 승률 ${Math.round(n.p*100)}%`}:{t:'bad',x:`빗나갔다… 약점은 ${WK_ICON[n.wk]} ${WK_NAME[n.wk]}였다 → 승률 ${Math.round(n.p*100)}%`});s.lastWk={hit,guess:g,real:n.wk};}
      optId='fight';n.lp=0;
    }
    if(optId==='fight'){
      if(roll<n.p){ s.lastOutcome='win'; const lucky=roll<n.lp; text=lucky?`행운의 일격! 빗나갈 칼날이 ${n.name}의 급소에 꽂혔다.`:n.pBase<0.55?`힘겨운 싸움 끝에 ${n.name}을(를) 쓰러뜨렸다.`:`${n.name}을(를) 무찔렀다.`; if(lucky) out.push({t:'item g2',x:'행운의 일격'});
        winRewards(s,n,n.p,out); hurt(s,(0.06+0.3*(1-n.p))*(0.6+r()*0.8),out); out.unshift({t:'kill',x:`+${n.share.toFixed(2)}%`}); if(!n.boss){s.mk=s.mk||{};s.mk[n.name]=(s.mk[n.name]||0)+1;if(s.mk[n.name]===3)out.push({t:'good',x:`${n.name}의 약점을 알아냈다: ${WK_ICON[monWeak(n.name)]} ${WK_NAME[monWeak(n.name)]}`,weakFound:n.name});} }
      else { s.lastOutcome='lose'; text=`${n.name}에게 패해 물러났다.`; {const fl=n.boss?2:1; s.fame-=fl; out.push({t:'bad',x:`명성 -${fl}`});} hurt(s,n.final?Math.min(0.5,(0.2+0.4*(1-n.p))*(0.8+r()*0.4)):(0.22+0.8*(1-n.p))*(0.7+r()*0.6)*(n.boss?1.25:1),out); loseAllies(s,out,1+Math.floor(r()*(n.boss?3:2))); bossRetry(s,n,out); questFail(s,n,out); }
    } else if(optId==='flee'){
      const fl=sk(s,'flee')?0:n.boss?3:1; s.fame-=fl;
      if(roll<n.pf){ s.lastOutcome='flee'; s.fleeDebuff=(s.fleeDebuff||0)+1; out.push({t:'bad',x:`사기 저하: 전투력 -10% (누적 ${s.fleeDebuff}회 · 지배자를 쓰러뜨리면 회복)`}); text=n.boss?'지배자를 피해 다음 지역으로 도망쳤다. 이 지역의 남은 악마는 그대로 남는다.':'무리를 피해 몰래 지나갔다.'; out.push({t:'bad',x:`명성 -${fl}`}); }
      else if(s.comp.pet&&s.comp.pet.fleeSave&&!s.saves[s.comp.pet.name]){ s.saves[s.comp.pet.name]=1; text=`붙잡히기 직전, ${s.comp.pet.name}이(가) 적에게 달려들어 길을 열었다.`; out.push({t:'comp',x:`${s.comp.pet.name}의 구출`},{t:'bad',x:`명성 -${fl}`}); }
      else { s.lastOutcome='fleeFail'; text='도망치다 붙잡혔다.'; out.push({t:'bad',x:`명성 -${fl}`}); hurt(s,0.3+0.5*(1-n.p)*(0.5+r()),out); }
      questFail(s,n,out);
    } else {
      if(roll<n.pt){ s.lastOutcome='talk'; if(roll<n.cp) out.push({t:'comp',x:'매혹'}); text=roll<n.cp?`${n.name}이(가) 네 매력에 넋을 잃고 스스로 무릎을 꿇었다.`:n.boss?`말로 ${n.name}을(를) 굴복시켰다. 믿기 힘든 일이다.`:`${n.name} 무리가 설득당해 무기를 내려놓았다.`;
        addAlly(s,out); winRewards(s,n,Math.min(n.p,0.5),out);
        {const tf=Math.round((n.boss?30:8)*(1+affSum(s,'fame'))), tx=n.boss?12:5; s.fame+=tf; gainXp(s,tx,out); out.push({t:'fame',x:`회유 성공 · 명성 +${tf}`},{t:'good',x:`경험치 +${tx}`});} out.unshift({t:'kill',x:`+${(n.share||0).toFixed(2)}% 굴복`}); }
      else { const p2=n.p*0.7; s.lastOutcome='talkFail'; text='회유가 실패해 적이 분노했다.';
        if(r()<p2){ s.lastOutcome='talkFailWin'; text+=` 그래도 싸움에서 이겼다.`; winRewards(s,n,p2,out); hurt(s,0.35*(1-p2),out); out.unshift({t:'kill',x:`+${(n.share||0).toFixed(2)}%`}); }
        else { text+=' 분노한 적에게 크게 당했다.'; hurt(s,0.45+0.5*(1-n.p)*(0.6+r()*0.7),out); bossRetry(s,n,out); questFail(s,n,out); } }
    }
    bossDeal(s,n,out);
  } else {
    let o=c.options.find(x=>x.id===optId);
    switch(optId){
      case 'buy': s.gold-=n.cost; s.hp=s.maxHp; text='성수를 마시고 상처가 아물었다.'; out.push({t:'good',x:'체력 전부 회복'}); break;
      case 'rob': if(roll<o.prob){s.lastEvent={ok:true,head:'약탈 성공'};text='상인의 짐을 빼앗았다.';gainItem(s,out,0,'상인 약탈');s.fame-=3;out.push({t:'bad',x:'명성 -3'});s.stats.cha=Math.max(1,s.stats.cha-1);out.push({t:'bad',x:'매력 -1'});} else {s.lastEvent={ok:false,head:'약탈 실패'};text='호위에게 두들겨 맞았다.';hurt(s,0.3,out);} break;
      case 'pray': if(roll<o.prob){s.lastEvent={ok:true,head:'제단의 축복'};const k=STAT_KEYS[Math.floor(r()*6)];const v=2+Math.floor(r()*3);s.stats[k]+=v;if(k==='con'){const ox=s.maxHp;s.maxHp=hpMax(s);s.hp+=s.maxHp-ox;}text='제단이 붉게 빛났다.';out.push({t:'item',x:`${STAT_NAMES[k]} +${v}`});}
        else {s.lastEvent={ok:false,head:'제단의 저주'};const k=STAT_KEYS[Math.floor(r()*6)];s.stats[k]=Math.max(1,s.stats[k]-2);text='제단에서 검은 연기가 피어올랐다.';out.push({t:'bad',x:`저주: ${STAT_NAMES[k]} -2`});hurt(s,0.15,out);} break;
      case 'smash': s.stats.str++; text='제단을 산산조각 냈다.'; out.push({t:'good',x:'힘 +1'}); hurt(s,0.08,out); break;
      case 'heal': hurt(s,0.15,out); if(!s.dead){ if(roll<o.prob){s.lastEvent={ok:true,head:'용병 합류',sub:'은혜를 입은 기사'};s.fame+=4;text='기사가 은혜를 갚겠다며 따라나섰다.';addAlly(s,out);} else {s.lastEvent={ok:false,head:'용병 합류 실패',sub:'기사는 떠났다'};text='기사는 고맙다는 말만 남기고 떠났다.';} } else text='치료하다 힘이 다했다.'; break;
      case 'loot': {const g=Math.round(40*econ(s,1.3)*GOLD_IN);s.gold+=g;s.stats.cha=Math.max(1,s.stats.cha-1);s.fame-=2;text='기사의 주머니를 털었다.';out.push({t:'bad',x:'명성 -2'});out.push({t:'good',x:`금화 +${fmtG(g)}`},{t:'bad',x:'매력 -1'});} break;
      case 'tstr': case 'tagi': {const k=optId==='tstr'?'str':'agi';const v=1+Math.floor(r()*2);s.stats[k]+=v;text='땀 흘려 수련했다.';out.push({t:'good',x:`${STAT_NAMES[k]} +${v}`});hurt(s,0.1,out);} break;
      case 'rest': {const h=Math.round(s.maxHp*0.4);s.hp=Math.min(s.maxHp,s.hp+h);text='오랜만에 깊이 잠들었다.';out.push({t:'good',x:'체력 +40%'});} break;
      case 'open': if(roll<o.prob||(s.comp.pet&&s.comp.pet.trap)){s.lastEvent={ok:true,head:'보물 발견'};text='상자 안에서 무언가가 빛났다.';gainItem(s,out,0,'보물상자');} else {s.lastEvent={ok:false,head:'함정'};text='독침 함정이 튀어나왔다.';hurt(s,0.25,out);} break;
      case 'rescue': if(roll<o.prob){s.lastEvent={ok:true,head:'동료 합류',sub:n.c.name};text=`${n.c.name}을(를) 구해냈다. ${n.c.rare?'운명이 이끈 만남이다. ':''}함께 가겠다고 한다.`;joinComp(s,'heroine',n.c,out);} else {s.lastEvent={ok:false,head:'구출 실패'};text='구하러 뛰어들었지만 역부족이었다.';hurt(s,0.35,out);} break;
      case 'befriend': if(roll<o.prob){s.lastEvent={ok:true,head:'동료 합류',sub:n.c.name};text=`${n.c.name}와(과) 의기투합했다.`;joinComp(s,'friend',n.c,out);} else {s.lastEvent={ok:false,head:'동행 거절'};text='서로 갈 길이 다르다며 헤어졌다.';} break;
      case 'tame': hurt(s,0.1,out); if(!s.dead){ if(roll<o.prob){s.lastEvent={ok:true,head:'펫 합류',sub:n.c.name};text=`${n.c.name}이(가) 곁을 떠나지 않는다.`;joinComp(s,'pet',n.c,out);} else {s.lastEvent={ok:false,head:'길들이기 실패'};text='상처가 낫자 숲으로 사라졌다.';} } else text='돌보다 힘이 다했다.'; break;
      case 'accept': s.activeQuest=n.q; text=`${n.q.task} 토벌에 나섰다.`; s.queue.splice(1,0,{type:'battle',quest:true,q:n.q,boss:false,E:n.qE,share:0,count:1,name:n.q.task,place:STAGES[s.stage].regions[s.region][0]}); break;
      case 'decline': s.fame-=1; (s.doneQ=s.doneQ||[]).push(n.q.giver); text='의뢰를 거절했다. 이 의뢰인은 이 세계에서 다시 찾아오지 않는다.'; out.push({t:'bad',x:'명성 -1'}); break;
      case 'qpvp': {const k=PVP_KEYS[Math.floor(r()*4)];s.pvp=s.pvp||{};s.pvp[k]=(s.pvp[k]||0)+1;text=`${n.q.giver}이(가) 비전을 전수했다.`;out.push({t:'item g3',x:`PvP 스탯 획득: ${PVP_NAME[k]} +1`});s.lastEvent={ok:true,head:`PvP ${PVP_NAME[k]} +1`,sub:`${n.q.giver}의 비전 전수`};} break;
      case 'qskill': {const pool=SKILLS.filter(x=>canLearn(s,x.id)).map(x=>x.id);const offers=[];while(offers.length<Math.min(3,pool.length)){const id=pool[Math.floor(r()*pool.length)];if(!offers.includes(id))offers.push(id);}
        s.queue.splice(1,0,{type:'skill',offers,auto:offers[Math.floor(r()*offers.length)],sure:true});text=`${n.q.giver}이(가) 비전을 전수해 주겠다고 한다.`;} break;
      case 'qitem': s.queue.splice(1,0,{type:'event',kind:'qpick',q:n.q}); text=`${n.q.giver}의 보물고 문이 열렸다.`; break;
      case 'qk:str': case 'qk:con': case 'qk:agi': case 'qk:int': case 'qk:cha': case 'qk:luk': case 'qk:mult': case 'qk:win': case 'qk:flee': {const k=String(optId).slice(3);const g=r()<0.05?3:2;const it=makeItem(r,g,k,tierOf(s));it.src=`의뢰 보상 (${n.q.giver})`;it.where=placeName(s);noteGot(s,it);equip(s,it);checkCombos(s,out);s.fame+=2+g*4;
        out.push({t:'item g'+g,x:`${GRADES[g].name} 아이템: ${it.name} (${itemTxt(s,it)})`});if(s.lastEquipNote)out.push({t:'good',x:s.lastEquipNote});s.lastEvent={ok:true,head:`${GRADES[g].name} 아이템 획득`,sub:it.name};text=`${n.q.giver}의 보물고에서 ${it.name}을(를) 골랐다.`;} break;

      case 'marry': {const sp=spOf(s,n); if(roll>=o.prob){s.lastEvent={ok:false,head:'혼인 실패',sub:sp.name};s.fame-=3;text=`${sp.name}은(는) 정중히 거절했다.`;out.push({t:'bad',x:'명성 -3'});break;}
        s.lastEvent={ok:true,head:'혼인',sub:sp.name}; s.spouse=sp.name; s.spouseC=sp; if(sp.luk)s.stats.luk+=sp.luk; {const o2=s.maxHp; s.maxHp=hpMax(s); s.hp+=Math.max(0,s.maxHp-o2);} s.fame+=30; text=`${sp.name}와(과) 혼인했다. 왕국 전체가 축하했다.`; out.push({t:'comp',x:`배우자: ${sp.name} (${sp.d})`},{t:'fame',x:'명성 +30'});} break;
      case 'refuse': s.fame-=3; text='혼담을 거절했다.'; out.push({t:'bad',x:'명성 -3'}); break;
      case 'gb:10': case 'gb:30': case 'gb:100': { const pct=+String(optId).slice(3); const st=gambleStake(s,pct); const win=r()<GAMBLE_P;
        s.gambles=(s.gambles||0)+1;
        if(win){ s.fame+=st*(GAMBLE_PAY-1); s.gambleWins=(s.gambleWins||0)+1; text=`공이 든 컵을 정확히 짚었다! 도박꾼이 이를 갈며 명성을 내놓았다.`; out.push({t:'fame',x:`도박 적중 · 명성 +${fmtG(st*(GAMBLE_PAY-1))}`,gamble:{win:true,stake:st,pct,gain:st*(GAMBLE_PAY-1)}}); }
        else { s.fame-=st; text=`빈 컵이었다. 도박꾼이 명성을 쓸어 담고 사라졌다.`; out.push({t:'bad',x:`도박 실패 · 명성 -${fmtG(st)}`,gamble:{win:false,stake:st,pct,gain:-st}}); }
        if(s.fame>=GAMBLE_CONT) s.queue.splice(1,0,{type:'event',kind:'gambler',again:(n.again||0)+1}); else out.push({t:'bad',x:`명성이 ${fmtG(GAMBLE_CONT)} 아래로 떨어져 도박꾼이 판을 접었다`});
        break; }
      case 'gpass': text='도박꾼을 무시하고 지나갔다.'; break;
      case 'ctake': {s.bossCurse=(s.bossCurse||0)+CURSE_BOSS;const g=s.r()<0.2?3:2;const it=makeItem(s.r,g,null,tierOf(s));it.src='저주받은 제단';it.where=placeName(s);noteGot(s,it);equip(s,it);checkCombos(s,out);s.fame+=2+g*4;
        out.push({t:'item g'+g,x:`${GRADES[g].name} 아이템: ${it.name} (${itemTxt(s,it)})`,got:{name:it.name,d:itemTxt(s,it),grade:g,src:it.src,spare:!!it.spare,kept:s.items.includes(it),slot:slotOf(it),heal:false,revive:false}});if(s.lastEquipNote)out.push({t:'good',x:s.lastEquipNote});
        out.push({t:'bad',x:`저주: 다음 지배자전 승률 -${Math.round(s.bossCurse*100)}%p`});text='무구를 집어 들자 등골이 서늘해졌다.';s.lastEvent={ok:true,head:'저주받은 보물',sub:it.name};break;}
      case 'cleave': text='불길한 제단을 그냥 지나쳤다.'; break;
      case 'oheal': hurt(s,0.2,out); if(!s.dead){s.oath={left:OATH_AFTER};text=`기사가 무릎을 꿇었다. "${OATH_AFTER}지역 뒤, 반드시 곁에서 싸우겠습니다."`;out.push({t:'comp',x:`맹세: ${OATH_AFTER}지역 뒤 지배자전에 기사 합류`});s.lastEvent={ok:true,head:'기사의 맹세',sub:`${OATH_AFTER}지역 뒤 합류`};} else text='치료하다 힘이 다했다.'; break;
      case 'opass': text='기사를 두고 길을 재촉했다.'; break;
      case 'psign': s.pact=1; s.hpBonus=(s.hpBonus||0)-PACT_HP; {s.maxHp=hpMax(s);s.hp=Math.min(s.hp,s.maxHp);} text='악마가 웃으며 손을 맞잡았다. 몸에 검은 힘이 흐른다.'; out.push({t:'good',x:`악마의 힘: 다음 지배자를 꺾을 때까지 전투력 +${Math.round((PACT_POW-1)*100)}%`},{t:'bad',x:`계약금: 최대 생명력 영구 -${Math.round(PACT_HP*100)}%`},{t:'bad',x:`못 꺾으면 모든 능력치 -${Math.round(PACT_PEN*100)}%`}); s.lastEvent={ok:true,head:'악마의 계약',sub:`전투력 +${Math.round((PACT_POW-1)*100)}%`}; break;
      case 'ppass': text='악마의 손을 뿌리쳤다.'; break;
      case 'fmount': {const b=makeBattle(s,s.region,regionShare(s,s.region)*0.08,false);b.forkChest=1;s.queue.splice(1,0,b);text='험한 산길로 들어섰다. 앞에서 적의 기척이 느껴진다.';break;}
      case 'friver': s.queue.splice(1,0,{type:'rest'}); text='강을 따라 걷다 쉴 만한 곳을 찾았다.'; break;
      case 'hq_0': case 'hq_1': case 'hq_2': case 'hq_3': { const w=s.hero.wealth.name; const H=HIDDEN_EV[w]; const ix=+String(optId).slice(3);
        if(ix!==n.quiz.ans){ s.lastEvent={ok:false,head:'히든 이벤트 · 오답',sub:`정답은 "${n.quiz.ch[n.quiz.ans]}"`}; text=`틀렸다. 정답은 "${n.quiz.ch[n.quiz.ans]}". ${H.name}의 기회가 사라졌다.`; out.push({t:'bad',x:'히든 이벤트 실패'}); break; }
        s.hiddenDone=(s.hiddenDone||0)+1; s.lastEvent={ok:true,head:'히든 이벤트 · '+H.name,sub:H.reward}; const fx=s.hidFx=s.hidFx||{};
        if(w==='왕족'){fx.boss=(fx.boss||0)+0.10;fx.mult=(fx.mult||1)*1.5;text='정답이다. 왕의 칙령이 온 세상에 울려 퍼졌다.';}
        else if(w==='귀족'){s.mercCapB=(s.mercCapB||0)+5;s.allies=mercCap(s);text='정답이다. 가문의 기사단이 깃발 아래 모였다.';}
        else if(w==='부유층'){s.spareForce=true;for(let z=0;z<10;z++){const it=makeItem(s.r,3,null,tierOf(s));it.plus=7;it.src='가문의 보물창고';it.where=placeName(s);noteGot(s,it);equip(s,it);}delete s.spareForce;checkCombos(s,out);text='정답이다. 보물창고에는 전설의 무구가 가득했다.';}
        else if(w==='중산층'){fx.gold=(fx.gold||0)+5;fx.fame=(fx.fame||0)+5;text='정답이다. 길드에서 막대한 배당이 들어오기 시작했다.';}
        else if(w==='서민'){s.pvp=s.pvp||{};for(const k2 of PVP_KEYS)s.pvp[k2]=(s.pvp[k2]||0)+7;fx.fame=(fx.fame||0)+3;text='정답이다. 민중의 함성이 너의 이름을 부른다.';}
        else if(w==='빈털터리'){fx.enh=(fx.enh||0)+0.20;fx.legend=(fx.legend||0)+5;fx.gold=(fx.gold||0)+5;text='정답이다. 잃을 것이 없기에 두려울 것도 없다.';}
        out.push({t:'item g3',x:`히든 이벤트 성공: ${H.reward}`}); break; }
      case 'inherit': s.lastEvent={ok:true,head:'영웅의 유산 계승'}; s.tomb=1; STAT_KEYS.forEach(k=>s.stats[k]+=3); text='고대 영웅의 힘이 몸에 스며들었다.'; out.push({t:'item',x:'모든 능력치 +3'}); hurt(s,0.2,out); break;
      case 'deep': case 'careful': {
        const deep=optId==='deep'; const tr=n.trap*(deep?1:0.4);
        const w=deep?{trap:tr,item:0.22,fortune:0.07,gold:0.14,meet:0.3}:{trap:tr,item:0.12,fortune:0.02,gold:0.24,meet:0.2};
        let v=r(),k='nothing'; for(const key in w){ if((v-=w[key])<0){k=key;break;} }
        if(k==='trap'){ if(s.comp.pet&&s.comp.pet.trap){text=`${s.comp.pet.name}이(가) 함정을 먼저 알아채 피했다.`;out.push({t:'comp',x:'함정 회피'});} else {text=TRAPS[Math.floor(r()*TRAPS.length)];hurt(s,deep?0.22+r()*0.12:0.1+r()*0.08,out);} }
        else if(k==='item'){text='먼지 속에서 무언가가 빛났다.';gainItem(s,out,deep?0.2:0,'탐험 발견');}
        else if(k==='fortune'){const f=FORTUNES[Math.floor(r()*FORTUNES.length)];text='기연. '+f.t;
          if(f.mult)s.multItems*=f.mult; if(f.all)STAT_KEYS.forEach(k2=>s.stats[k2]+=f.all); if(f.con){s.stats.con+=f.con;} if(f.revive)for(let z=0;z<f.revive;z++)addRevive(s,out); if(f.lvl){for(let z=0;z<f.lvl;z++)levelUp(s,out);}
          {const o2=s.maxHp;s.maxHp=hpMax(s);s.hp+=Math.max(0,s.maxHp-o2);} s.fame+=15; out.push({t:'item',x:f.x},{t:'fame',x:'명성 +15'});}
        else if(k==='gold'){const g=Math.round((15+30*r())*econ(s,1.3)*GOLD_IN);s.gold+=g;text='누군가 숨겨둔 금화 주머니를 찾았다.';out.push({t:'good',x:`금화 +${fmtG(g)}`});}
        else if(k==='meet'){const ev={type:'event',kind:null};rollEvent(s,ev);s.queue.splice(1,0,ev);text='탐험하던 중 무언가와 마주쳤다.';}
        else text=deep?'샅샅이 뒤졌지만 아무것도 없었다.':'조용히 둘러보고 지나갔다.';
      } break;
      case 'skip': text='탐험하지 않고 길을 재촉했다.'; break;
      case 'rps': {const H=['가위','바위','보'];const me=Math.floor(r()*3);const res=roll<n.wp?'win':roll<n.wp+(1-n.wp)/2?'draw':'lose';const fate=res==='win'?(me+2)%3:res==='draw'?me:(me+1)%3;
        text=`너는 ${H[me]}, 운명의 여신은 ${H[fate]}.`;
        if(res==='win'){s.lastEvent={ok:true,head:'운명의 내기 · 축복',sub:text};n.boss.bonus=(n.boss.bonus||0)+n.gb;text+=' 여신이 미소 지었다.';out.push({t:'item g2',x:`축복: 이번 지배자전 승률 +${Math.round(n.gb*100)}%p`});}
        else if(res==='lose'){s.lastEvent={ok:false,head:'운명의 내기 · 저주',sub:text};n.boss.bonus=(n.boss.bonus||0)-n.cb;text+=' 여신이 등을 돌렸다.';out.push({t:'bad',x:`저주: 이번 지배자전 승률 -${Math.round(n.cb*100)}%p`});}
        else {text+=' 비겼다. 아무 일도 일어나지 않았다.';s.lastEvent={ok:null,head:'운명의 내기 · 비김',sub:text};}} break;
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
  if(!s.dead&&!s.over){ autoEssentials(s).forEach(it=>out.push({t:'item g'+it.grade,x:`자동 구매: ${it.name} (${itemTxt(s,it)})`})); }
  prime(s);
  const outcome=s.lastOutcome, event=s.lastEvent; s.lastOutcome=null; s.lastEvent=null;
  return {text,effects:out,node:n,outcome,event};
}
function advanceStage(s){
  if(!s.conquered||s.stage>=5) return false;
  s.carryBase=(s.carryBase||s.stageCarry)*CARRY_STEP[s.stage+1]; s.stage++; if(s.stage===5&&s.progE==null)s.progE=Math.max(0,s.prog||0);
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
  if(s.huntFrom===5){ // 끝없는 전장에서 온 여행: 떠났던 층으로 돌아간다
    s.keepShop=s.endShop||null; s.endShop=null;
    s.stage=5; s.region=Math.max(-1,(s.endRegion||0)-1); s.queue=[]; s.killed=0; s.regionKilled=[]; s.pacified=[]; s.over=false; s.cleared=false; s.conquered=false; s.activeQuest=null; s.huntFrom=null;
    s.hp=Math.max(s.hp,Math.round(s.maxHp*0.6)); s.gritLeft=sk(s,'grit'); nextRegion(s); queueSkill(s); prime(s); return true; }
  s.stage=s.huntFrom; s.conquered=true; return advanceStage(s);
}
// 끝없는 전장에서 이전 세계(지상계~심연)의 사냥터로 떠난다
function canTravel(s){const st=STAGES[s.stage];return !!(st&&st.endless&&st.hunt==null&&!s.dead&&!s.over);}
function travelHunt(s,k){if(!canTravel(s)||!(k>=0&&k<=3))return false;
  s.endRegion=s.region; s.endShop=s.shop; s.keepShop=(s.huntShops||{})[k]||null; s.huntFrom=5; s.stage=HUNT_BASE+k;
  s.region=-1; s.queue=[]; s.killed=0; s.regionKilled=[]; s.pacified=[]; s.over=false; s.cleared=false; s.conquered=false; s.activeQuest=null;
  s.hp=Math.max(s.hp,Math.round(s.maxHp*0.6)); s.gritLeft=sk(s,'grit'); nextRegion(s); queueSkill(s); prime(s); return true;}
// ---- 랭킹 검증용: 결정적 시드, 저장/불러오기, 재현 ----
const ENGINE_VERSION='1.13.0';
// 다음 결정의 무작위 요소(사건 종류, 탐험 문구)를 즉시 굴려 둔다. 화면이 current()를 몇 번 부르든 결과가 같아진다.
function prime(s){ if(s&&!s.dead&&!s.over) current(s); return s; }
function mixSeed(a,b){let h=((a>>>0)^Math.imul((b>>>0)+0x9e3779b9,0x85ebca6b))>>>0;h^=h>>>16;h=Math.imul(h,0x7feb352d)>>>0;h^=h>>>15;h=Math.imul(h,0x846ca68b)>>>0;h^=h>>>16;return h>>>0;}
// 저장 지점 보정: 강화·신화 합성 결과는 저장 지점에도 즉시 반영한다 (불러오기로 되돌릴 수 없다)
function snapApply(snap,it,sign){if(it.spare)return;if(it.stat){snap.stats[it.stat]=Math.max(1,snap.stats[it.stat]+sign*effV(it));}if(it.mult){const m=effMult(it);snap.multItems*=sign>0?m:1/m;}}
function snapEnhance(snap,uid,r){if(!snap||!uid||!r)return;const j=(snap.items||[]).findIndex(x=>x.uid===uid);if(j<0)return;const it=snap.items[j];
  snapApply(snap,it,-1);if(r.destroyed){snap.items.splice(j,1);normSlots(snap,snapApply);return;}it.plus=r.to;snapApply(snap,it,1);normSlots(snap,snapApply);}
function snapFuse(snap,uids,r,s){if(!snap||!r)return;for(const u of uids){const j=(snap.items||[]).findIndex(x=>x.uid===u);if(j>=0){snapApply(snap,snap.items[j],-1);snap.items.splice(j,1);}}normSlots(snap,snapApply);
  snap.fame=(snap.fame||0)-MYTH_FAME;snap.mythics=(s.mythics||[]).slice();snap.mythV=Object.assign({},s.mythV||{});}
function enhanceSync(s,idx,snap){const it=s.items[idx];const uid=it&&it.uid;const r=enhance(s,idx);snapEnhance(snap,uid,r);return r;}
function mythFuseSync(s,snap){const c=mythCheck(s);const uids=c.ok?c.mats.map(i=>s.items[i].uid).filter(Boolean):[];const r=mythFuse(s);if(r)snapFuse(snap,uids,r,s);return r;}
// 월드 보스 보상: 서버가 정한 등급 코드(h 영웅 · l +7 전설 · m 신화)를 받아 지금 용사에게 준다.
// 아이템 세부(부위·이름·수치)는 엔진 난수로 정하므로 서버 재생 검증에서 똑같이 나온다. 같은 번호(n)는 한 번만 받는다.
const WB_REWARD_RE=/^(\d{1,6}):([hlm]{1,3})$/;
function wbReward(s,arg){const m=WB_REWARD_RE.exec(String(arg));if(!m||s.dead||s.over)return null;const n=+m[1];s.wbGot=s.wbGot||[];if(s.wbGot.includes(n))return null;s.wbGot.push(n);
  const out=[],got=[];
  for(const k of m[2]){
    if(k==='m'){const my=MYTHS[Math.floor(s.r()*MYTHS.length)];const v=10+Math.floor(s.r()*11);s.mythics=s.mythics||[];s.mythV=s.mythV||{};
      if(s.mythics.includes(my.id)){const old=s.mythV[my.id]||MYTH_PVP;const nv=v>old?v:Math.min(20,old+1);s.mythV[my.id]=nv;got.push({myth:my.id,name:my.name,v:nv,old});}
      else{s.mythics.push(my.id);s.mythV[my.id]=v;if(my.e.hp){const o=s.maxHp;s.maxHp=hpMax(s);s.hp+=Math.max(0,s.maxHp-o);}got.push({myth:my.id,name:my.name,v});}
      continue;}
    const g=k==='l'?3:2;const it=makeItem(s.r,g,null,tierOf(s));if(g===3)it.plus=7;it.src='월드 보스 보상';it.where=placeName(s);noteGot(s,it);
    const kept=equip(s,it);checkCombos(s,out);got.push({it,kept:s.items.includes(it),spare:!!it.spare,note:s.lastEquipNote});}
  return {n,got,out};}
// 저장 지점에도 즉시 반영한다 (불러와도 보상이 사라지지 않게)
function wbRewardSync(s,arg,snap){const r=wbReward(s,arg);if(!r||!snap)return r;
  for(const g of r.got){if(g.it&&g.kept){const c=JSON.parse(JSON.stringify(g.it));c.spare=true;(snap.items=snap.items||[]).push(c);}}
  normSlots(snap,snapApply);snap.items=snap.items.filter(x=>!(x.spare&&(x.grade||0)<3));
  snap.mythics=(s.mythics||[]).slice();snap.mythV=Object.assign({},s.mythV||{});snap.uidN=s.uidN;snap.wbGot=(s.wbGot||[]).slice();return r;}
// 가문 유산: 출정할 때 한 번만 받는다 (기록 두 번째 줄 ['G','v3a2b2t2n1']). 서버는 그 계정이 산 유산 단계를 넘지 않는지 확인한다.
const LEG_KEYS=['vault','arms','bless','train','name'];
const LEGACY={vault:{max:3,gold:[0,10,20,30]},arms:{max:2,plus:[0,1,2]},bless:{max:2,v:[0,0.005,0.01]},train:{max:2,xp:[0,5,10]},name:{max:1,fame:[0,30]}};
function legacyParse(code){const m=/^v([0-3])a([0-2])b([0-2])t([0-2])n([01])$/.exec(String(code||''));if(!m)return null;const o={};LEG_KEYS.forEach((k,i)=>o[k]=+m[i+1]);return o;}
function legacyCode(o){o=o||{};return `v${o.vault|0}a${o.arms|0}b${o.bless|0}t${o.train|0}n${o.name|0}`;}
function legacySum(code){const L=legacyParse(code);return L?LEG_KEYS.reduce((a,k)=>a+L[k],0):0;}
function applyLegacy(s,code){const L=legacyParse(code);if(!L||s.legacy)return false;s.legacy=code;const out=[];
  s.gold+=LEGACY.vault.gold[L.vault];s.fame+=LEGACY.name.fame[L.name];s.legBoss=LEGACY.bless.v[L.bless];
  if(L.train)gainXp(s,LEGACY.train.xp[L.train],out);
  // 물려받은 무구: 처음 가진 장비를 +1 / +2 강화된 채로 시작한다
  if(L.arms)for(const it of s.items){if(it.spare||it.heal||it.revive||!canEnhance(it))continue;applyItem(s,it,-1);it.plus=(it.plus||0)+LEGACY.arms.plus[L.arms];applyItem(s,it,1);}
  return true;}
function snapshotRun(s){const o={};for(const k in s){if(k==='r'||k==='queue'||k==='shop'||k==='transit'||k==='hero')continue;o[k]=s[k];}return JSON.parse(JSON.stringify(o));}
function restoreRun(snap,hero,seed,fromStart){const run=JSON.parse(JSON.stringify(snap));run.hero=hero;run.r=rng(seed);
  const keepFloor=STAGES[run.stage]&&STAGES[run.stage].endless&&STAGES[run.stage].hunt==null&&snap.region>0&&!fromStart; // 끝없는 전장 5층 저장: 그 층에서 다시 시작 (fromStart면 1층부터)
  Object.assign(run,{region:keepFloor?snap.region-1:-1,queue:[],killed:keepFloor?run.killed:0,regionKilled:keepFloor?run.regionKilled:[],pacified:[],over:false,dead:false,cleared:false,conquered:false,kills:run.kills||0});
  run.maxHp=hpMax(run);run.hp=run.maxHp;run.gritLeft=sk(run,'grit');run.prog=Math.max(-1,(run.prog||0)-1);nextRegion(run);queueSkill(run);prime(run);return run;}
function previewPowerAt(s,idx){const it=s.items[idx];if(!it)return null;const c=Object.assign({},s,{stats:Object.assign({},s.stats)});
  const p0=power(c);const nx=Object.assign({},it,{plus:(it.plus||0)+1,spare:false});
  if(it.spare){const old=s.items.find(x=>x!==it&&!x.spare&&slotOf(x)===slotOf(it));if(old&&itemVal(nx)<=itemVal(old))return [p0,p0];if(old)applyItem(c,old,-1);applyItem(c,nx,1);return [p0,power(c)];}
  applyItem(c,it,-1);applyItem(c,nx,1);return [p0,power(c)];}
function runSummary(s){const st=STAGES[s.stage];const w=worldOf(s.stage);const fl=st.endless?floorOf(s):0;
  let label,score;
  if(st.endless&&st.hunt==null){label=`끝없는 전장 ${fl}층`;score=5000+fl;}
  else if(st.hunt!=null){label=`${STAGES[w].name} 정복 · 사냥터 ${fl}층`;score=w*1000+990+Math.min(fl,9)/1000;}
  else {const p=pct(s);label=`${st.name} ${p>=100?'100':p.toFixed(2)}%`+(s.conquered?' 정복':'');score=w*1000+(s.conquered?990:Math.min(989,p*9.8));}
  return {hero:s.hero.name,race:s.hero.race.name,kills:s.kills||0,power:Math.round(power(s)/s.stageCarry*10),reach:label,reachScore:Math.round(score*1000)/1000,stage:s.stage,floor:fl,dead:!!s.dead,maxFloorE:s.maxFloorE||0,card:pvpCard(s),rare:rareNames(s)};}
function replayLog(log){
  if(!Array.isArray(log)||!log.length||log[0][0]!=='start') throw new Error('기록이 start로 시작하지 않는다');
  let hero=null,s=null,snap=null,loads=0,seed=0;
  for(let i=0;i<log.length;i++){const a=log[i];const op=a[0];
    if(op==='start'){ if(i!==0) throw new Error('start가 두 번 나왔다'); seed=a[1]>>>0; hero=makeHero(seed); s=newRun(hero,a[2]|0,mixSeed(seed,1)); continue; }
    if(op==='G'){ if(i!==1||!applyLegacy(s,a[1])) throw new Error(`${i}번째 행동: 유산은 출정 직후에 한 번만 받는다`); continue; }
    if(op==='H'){ if(!(i===1||(i===2&&log[1][0]==='G'))||!applyHouseBuff(s,a[1])) throw new Error(`${i}번째 행동: 가문 순위 효과는 출정 직후에 한 번만 받는다`); continue; }
    if(op==='S'){ snap=snapshotRun(s); continue; }
    if(op==='L'){ if(!snap) throw new Error('저장 없이 불러오기'); loads++; s=restoreRun(snap,hero,mixSeed(seed,100+loads),a[1]===1); continue; }
    if(s.dead) throw new Error(`${i}번째 행동: 이미 끝난 판`);
    if(op==='c'){ if(s.over) throw new Error(`${i}번째 행동: 이미 끝난 판`); const c=current(s); if(!c) throw new Error(`${i}번째 행동: 결정할 것이 없다`);
      const o=c.options.find(x=>x.id===a[1]); if(!o||o.disabled) throw new Error(`${i}번째 행동: 고를 수 없는 선택지 ${a[1]}`); choose(s,a[1]); continue; }
    let ok=true;
    if(op==='b') ok=!!buy(s,a[1]|0); else if(op==='s') ok=!!sell(s,a[1]|0); else if(op==='e') ok=!!enhanceSync(s,a[1]|0,snap); else if(op==='w') ok=wearSpare(s,a[1]|0); else if(op==='u') ok=unpinItem(s,a[1]|0);
    else if(op==='M') ok=!!mythFuseSync(s,snap); else if(op==='W') ok=!!wbRewardSync(s,a[1],snap); else if(op==='T') ok=travelHunt(s,a[1]|0); else if(op==='n') ok=advanceStage(s); else if(op==='h') ok=enterHunt(s); else if(op==='l') ok=leaveHunt(s);
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
    const opts=c.options;const skOk=opts.some(o=>o.id==='skill'&&!o.disabled);
    // 지배자: 승률이 30% 미만이면 단서를 따라 약점 공략 (두 단서가 같으면 그것, 다르면 첫 단서)
    if(n.boss&&n.wk&&n.p<0.30){const pick=w=>WK.find(x=>WK_CLUE[x].includes(w));return 'wk:'+(pick(n.clues[0])||'dull');}
    if(skOk&&n.p<0.75&&(n.boss||n.p<0.6)) return 'skill';
    if(!n.boss&&n.pWk!=null&&s.mk&&s.mk[n.name]>=3&&n.pWk>n.p+0.03) return 'wk';
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
  if(n.type==='prep') return 'rps';
  if(n.type==='explore') return hpf>0.55?'deep':hpf>0.3?'careful':'skip';
  if(n.type==='rest') return hpf<0.75?'sleep':hpf<0.9?'guard':'drill';
  if(n.kind==='heroine') return opts[0].prob>0.35?'rescue':'pass';
  if(n.kind==='friend') return 'befriend';
  if(n.kind==='pet') return hpf>0.3?'tame':'pass';
  if(n.kind==='quest') return winProb(s,n.qE)>0.45?'accept':'decline';
  if(n.kind==='proposal') return 'marry';
  if(n.kind==='qreward') return 'qitem';
  if(n.kind==='qpick') return 'qk:mult';
  if(n.kind==='tomb') return hpf>0.35?'inherit':'pass';
  if(n.kind==='hidden') return 'hq_'+n.quiz.ans;
  if(n.kind==='gambler') return 'gpass';
  if(n.kind==='cursed') return 'ctake'; // 자동 진행에서는 전설 보물을 항상 받는다
  if(n.kind==='oath') return hpf>0.6?'oheal':'opass';
  if(n.kind==='pact') return 'ppass';
  if(n.kind==='fork') return hpf>0.6?'fmount':'friver';
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
  if(n.type!=='battle') return ['heroine','friend','pet','quest','proposal','tomb','qreward','qpick','hidden','gambler','cursed','oath','pact','fork'].includes(n.kind);
  if(n.quest) return true;
  if(mode==='boss') return n.boss;
  return n.boss || n.p<0.6 || (s.hp/s.maxHp<0.35 && n.p<0.8);
}
function autoRun(hero,stage,seed){const s=newRun(hero,stage,seed);let g=0;while(!s.dead&&!s.over&&g++<800){const c=current(s);if(!c)break;if(c.node.type==='rest')autoShop(s);choose(s,autoChoice(s,c));}return s;}
globalThis.FateEngine={AFF,AFF_BY,affSum,affTxt,wearSpare,unpinItem,WK,WK_NAME,WK_STAT,WK_ICON,monWeak,deceit,clueAcc,ENDLESS_MON,HBUFF,applyHouseBuff,intXp,skAmp,mercPer,COMBO_PLUS,itemTxt,HEROES_M,SPOUSES_M,RARE,RARE_ALL,RARE_P,heroList,spList,spOf,rareNames,GAMBLE_CONT,GAMBLE_P,GAMBLE_PAY,GAMBLE_MIN,gambleStake,COMP_REQ,compOk,fmtG,fmtExact,canKeepSpare,spareCount,SPARE_MAX,rng,pvpMight,enhanceSync,mythFuseSync,wbRewardSync,applyLegacy,legacyParse,legacyCode,legacySum,LEGACY,LEG_KEYS,travelHunt,canTravel,isPickLevel,nextPickLevel,pvpRaw,RACE_RING,raceRel,raceBeats,PVP_KEYS,PVP_NAME,pvpStats,pvpCard,duel,duelPlan,MYTHS,MYTH_BY,mythCheck,mythFuse,enhCostParts,holdFull,COMBOS,COMBO_BY,comboList,skillRate,cmb,enhRate,raceInfo,traitInfo,wealthInfo,wardP,ROLES,MASTERY,mastery,roleRanks,SKV,SKILL_BY,SKILLS,WORLD_TRAITS,sk,ENGINE_VERSION,mixSeed,snapshotRun,restoreRun,previewPowerAt,runSummary,replayLog,makeHero,newRun,current,choose,buy,sell,enhance,advanceStage,enterHunt,leaveHunt,STAGES};
if(typeof module!=='undefined') module.exports={lossRisk,AFF,AFF_BY,affSum,affTxt,wearSpare,unpinItem,WK,WK_NAME,monWeak,deceit,clueAcc,ENDLESS_MON,HBUFF,applyHouseBuff,HEROINES,FRIENDS,PETS,SPOUSES,hpMax,HEROES_M,SPOUSES_M,RARE,RARE_ALL,RARE_P,heroList,spList,spOf,rareNames,COMP_REQ,compOk,canKeepSpare,spareCount,SPARE_MAX,pvpMight,enhanceSync,mythFuseSync,wbRewardSync,applyLegacy,legacyParse,legacyCode,legacySum,LEGACY,LEG_KEYS,travelHunt,canTravel,isPickLevel,PVP_KEYS,pvpStats,pvpCard,duel,duelPlan,MYTHS,mythCheck,mythFuse,COMBOS,COMBO_BY,comboList,skillRate,cmb,MINIONS,raceInfo,traitInfo,wealthInfo,ROLES,mastery,roleRanks,SKILLS,SKILL_BY,WORLD_TRAITS,sk,SKV,setSKV:o=>Object.assign(SKV,o),setDiff:a=>{DIFF=a},setQuestE:v=>{QUEST_E=v},setGoldIn:v=>{GOLD_IN=v},winProb,setGW:a=>{GW=a},setFreshSk:a=>{FRESH_SK=a},setEnhScale:v=>{ENH_SCALE=v},setFinalTries:v=>{FINAL_TRIES=v},wtrait,ENGINE_VERSION,mixSeed,snapshotRun,restoreRun,previewPowerAt,runSummary,replayLog,enterHunt,leaveHunt,worldOf,HUNT_BASE,setHuntStart:v=>{HUNT_START=v},setFresh:a=>{FRESH=a},setCarryRef:(a,al)=>{CARRY_REF=a;if(al!=null)CARRY_ALPHA=al;},powerOf:s=>power(s),GRADE_ENH,setBonusMin:v=>{BONUS_MIN=v},floorOf,setStep:a=>{CARRY_STEP=a},effLuk,effCha,RESIST,TIER_NAME,tierOf,setLvl:v=>{LVL_B=v},setBaseK:v=>{BASE_K=v},itemDescAt,enhance,enhCost,canEnhance,itemName,itemDesc,ENH_RATE,ENH_BREAK,wouldUpgrade,slotOf,procCurve,nextRegion,rng,luckProc,charmProc,setCarry:v=>{CARRY_ADJ=v},unpacified,setUnp:v=>{UNP_PEN=v},advanceStage,setLate:v=>{LATE=v},teamBonus,autoEssentials,revives,winParts,sell,sellPrice,fameBonus,buy,autoShop,GRADES,setFinal:v=>{FINAL_X=v},autoChoice,fameTitle,regionShare,isImportant,makeHero,newRun,current,choose,autoRun,pct,STAGES};
