/* ===== Utilidades ===== */
const $=s=>document.querySelector(s);
const pad=n=>String(n).padStart(2,'0');
const dk=(d=new Date())=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const parseDk=k=>{const[a,b,c]=k.split('-').map(Number);return new Date(a,b-1,c)};
const DOW=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
const DOW3=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const MON=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const fmtD=k=>{const d=parseDk(k);return d.getDate()+' '+MON[d.getMonth()].slice(0,3)};
const mmss=s=>{s=Math.max(0,Math.round(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return h?h+':'+pad(m)+':'+pad(x):m+':'+pad(x)};
const num=v=>{let t=String(v??'').trim();if(/^\d{1,3}(\.\d{3})+$/.test(t))t=t.replace(/\./g,'');const n=parseFloat(t.replace(',','.'));return isNaN(n)?0:n};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtKg=v=>String(Math.round(v*100)/100).replace('.',',');
const by=f=>(a,b)=>a[f]<b[f]?-1:a[f]>b[f]?1:0;
const uid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
function lastDays(n){return[...Array(n)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-(n-1)+i);return dk(d)})}
function weekDays(ref=new Date()){const d=new Date(ref);d.setDate(d.getDate()-(d.getDay()+6)%7);return[...Array(7)].map((_,i)=>{const x=new Date(d);x.setDate(d.getDate()+i);return dk(x)})}
function toast(t){const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.appendChild(e);setTimeout(()=>e.remove(),2600)}
const day=k=>S.days[k]=S.days[k]||{water:0,meals:{}};
const I={
 home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3"/></svg>',
 bar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M2.5 12h19"/><rect x="5" y="6" width="3" height="12" rx="1"/><rect x="16" y="6" width="3" height="12" rx="1"/></svg>',
 coach:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H8z"/><path d="M8.5 10.5h7M8.5 13h4"/></svg>',
 food:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M7 3v8M4.5 3v5a2.5 2.5 0 0 0 5 0V3M7 11v10M17 3c-2 0-3 3-3 7h3v11"/></svg>',
 me:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5"/></svg>',
 back:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
 x:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
 play:'<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M7 4.5v15l12.5-7.5z"/></svg>',
 cam:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
 mic:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>'};

/* ===== Cálculos (metodologia) ===== */
const todayActs=(d=new Date())=>S.cfg.flex?[nextSession()]:(S.cfg.week[d.getDay()]||[]);
function nextSession(){if(ACTIVE)return ACTIVE.sess;const l=Object.values(S.logs).sort(by('start')).pop();return l?{A:'B',B:'C',C:'A'}[l.sess]:'A'}
function doneOn(k){return[...Object.values(S.logs).filter(l=>l.date===k).map(l=>({t:SESS[l.sess].full,d:Math.round((l.end-l.start)/6e4)+' min, '+l.sets.length+' séries',c:'var(--red)'})),...Object.values(S.cardio).filter(c=>c.date===k).map(c=>({t:ACT[c.mod].n,d:c.min+' min'+(c.km?', '+(c.mod==='natacao'?Math.round(c.km*1000)+' m':fmtKg(c.km)+' km'):''),c:c.mod==='crossfit'?'var(--yel)':'var(--blue)'}))]}
function dietDone(k){const m=(S.days[k]||{}).meals||{};return[0,1,2,3].filter(i=>m[i]).length}
function activeSet(){const s=new Set();Object.values(S.logs).forEach(l=>s.add(l.date));Object.values(S.cardio).forEach(c=>s.add(c.date));return s}
function streak(){const a=activeSet();let n=0;const d=new Date();if(!a.has(dk(d)))d.setDate(d.getDate()-1);while(a.has(dk(d))){n++;d.setDate(d.getDate()-1)}return n}
// Prontidão: média das 5 escalas → 0–100, menos penalidade de dor e de FC de repouso elevada
function readiness(k){
 const c=(S.days[k]||{}).ci;if(!c)return null;
 const vals=SCALES.map(s=>c[s.k]||3);let score=(vals.reduce((a,b)=>a+b,0)/5-1)/4*100;
 const pain=Object.values(c.pain||{}).reduce((a,p)=>a+[0,4,8,14][p.l],0);score-=Math.min(30,pain);
 const h=(S.days[k]||{}).health;let fcNote='';
 if(h&&h.fc_repouso){const prev=lastDays(8).slice(0,7).map(x=>(S.days[x]||{}).health).filter(x=>x&&x.fc_repouso).map(x=>x.fc_repouso);if(prev.length>=3){const b=prev.reduce((a,v)=>a+v,0)/prev.length;if(h.fc_repouso-b>=5){score-=10;fcNote='FC de repouso '+Math.round(h.fc_repouso-b)+' bpm acima da sua média.'}}}
 score=Math.round(Math.max(0,Math.min(100,score)));
 const st=score>=70?{label:'Pronto',c:'var(--grn)',rec:'Treine como planejado. Se as cargas subirem bem, siga a sugestão de progressão.'}:score>=50?{label:'Atenção',c:'var(--yel)',rec:'Treine, mas faça 2 work sets em vez de 3 e pare em PSE 7. Cardio só em zona 2.'}:{label:'Recuperar',c:'var(--red)',rec:'Hoje é dia de recuperar: 30–40 min de Z2 bem leve ou mobilidade. Volte a pesar amanhã.'};
 return{score,...st,fcNote}}
// Carga interna (sRPE = minutos × PSE) e razão aguda:crônica
function loadStats(){
 const ua={};const add=(d,v)=>ua[d]=(ua[d]||0)+v;
 Object.values(S.logs).forEach(l=>{const p=l.sets.filter(s=>s.pse).map(s=>s.pse);const pse=p.length?p.reduce((a,b)=>a+b,0)/p.length:7;add(l.date,Math.round((l.end-l.start)/6e4)*pse)});
 Object.values(S.cardio).forEach(c=>add(c.date,num(c.min)*(c.pse||(c.mod==='crossfit'?8:5))));
 const a=lastDays(7).reduce((s,k)=>s+(ua[k]||0),0),c28=lastDays(28).reduce((s,k)=>s+(ua[k]||0),0)/4;
 const first=Object.keys(ua).sort()[0];const enough=first&&(new Date()-parseDk(first))/864e5>=21;const ratio=c28&&enough?Math.round(a/c28*100)/100:null;
 return{aguda:Math.round(a),cronica:Math.round(c28),ratio,zona:ratio==null?'Calibrando (3 semanas)':ratio<0.8?'Abaixo do seu normal':ratio<=1.3?'Faixa ideal':ratio<=1.5?'Subindo rápido':'Pico de carga — risco maior'}}
function lastFor(id,i){const L=S.cfg.loads[id];if(L){if(L[i])return L[i];const ks=Object.keys(L);if(ks.length)return L[ks[ks.length-1]]}const s=SEED[id];return s?{kg:s[0],reps:s[1],seed:1}:{kg:0,reps:0,seed:1}}
// Dupla progressão: 3 work sets no topo da faixa (10 reps) com PSE ≤ 8 → sobe carga
function suggestion(id){
 const logs=Object.values(S.logs).sort(by('start')).reverse();
 for(const l of logs){const w=l.sets.filter(s=>s.id===id&&s.set>=2);if(!w.length)continue;
  const top=Math.max(...w.map(s=>s.kg));const minR=Math.min(...w.map(s=>s.reps));const p=w.filter(s=>s.pse).map(s=>s.pse);const pse=p.length?p.reduce((a,b)=>a+b,0)/p.length:null;const st=(EX[id]||{}).step||2.5;
  if(w.length>=3&&minR>=10&&(pse==null||pse<=8))return{kg:top+st,t:`Subir para ${fmtKg(top+st)} kg nos work sets`,why:`Você fez ${w.map(s=>s.reps).join('/')} reps com ${fmtKg(top)} kg${pse?' e PSE '+fmtKg(Math.round(pse*10)/10):''}.`,c:'var(--grn)'};
  if(minR<6)return{kg:Math.max(0,top-st),t:`Baixar para ${fmtKg(Math.max(0,top-st))} kg`,why:`Na última vez caiu para ${minR} reps. Volte para a faixa de 6 a 10.`,c:'var(--red)'};
  return{kg:top,t:`Manter ${fmtKg(top)} kg e buscar +1 rep`,why:`Último: ${w.map(s=>fmtKg(s.kg)+'×'+s.reps).join(', ')}.`,c:'var(--yel)'}}
 const s=SEED[id];return s?{kg:s[0],t:'Comece pela referência do coach',why:`Última carga registrada no app antigo: ${fmtKg(s[0])} kg × ${s[1]}.`,c:'var(--steel)'}:null}
function weekSummary(){const w=weekDays();const tre=Object.values(S.logs).filter(l=>w.includes(l.date)).length+Object.values(S.cardio).filter(c=>w.includes(c.date)&&c.mod==='crossfit').length;const cmin=Object.values(S.cardio).filter(c=>w.includes(c.date)&&c.mod!=='crossfit').reduce((a,c)=>a+num(c.min),0);const diet=w.filter(k=>dietDone(k)>=3).length;const act=activeSet();return{w,tre,cmin,diet,ativos:w.filter(k=>act.has(k)).length}}

/* ===== Navegação ===== */
let TAB='hoje',STACK=[];
const TABS=[['hoje','Hoje',I.home],['treinar','Treinar',I.bar],['coach','Coach',I.coach],['dieta','Dieta',I.food],['mais','Você',I.me]];
function renderTabs(){$('#tabs').innerHTML=TABS.map(([k,n,ic])=>`<button class="${TAB===k&&!STACK.length?'on':TAB===k?'on':''}" onclick="go('${k}')" aria-label="${n}">${ic}<span>${n}</span></button>`).join('')}
function go(t){TAB=t;STACK=[];render();scrollTo(0,0)}
function push(v,...a){STACK.push([v,a]);render();scrollTo(0,0)}
function pop(){STACK.pop();render()}
let after=[];
function render(){renderTabs();const[v,a]=STACK.length?STACK[STACK.length-1]:[TAB,[]];$('#view').innerHTML=V[v](...a);const h=after;after=[];h.forEach(f=>f());if(typeof hydrateAssets==='function')hydrateAssets()}
const hdr=(t,right='')=>`<div class="top"><button class="ib" onclick="pop()" aria-label="Voltar">${I.back}</button><h2>${t}</h2>${right}</div>`;
function openSheet(h){$('#sheetc').innerHTML=h;$('#ov').classList.add('show');$('#sheet').classList.add('show')}
function closeSheet(){$('#ov').classList.remove('show');$('#sheet').classList.remove('show')}
function ask(msg,cb,ok='Confirmar'){window._ask=cb;openSheet(`<h2 style="font-size:19px">${esc(msg)}</h2><div class="g2" style="margin-top:18px"><button class="btn ghost" onclick="closeSheet()">Cancelar</button><button class="btn" onclick="closeSheet();_ask&&_ask()">${ok}</button></div>`)}
const V={};

/* ===== Placa de prontidão (anilha) ===== */
function plateSVG(score,color){
 const r=78,C=2*Math.PI*r,p=score==null?0:score/100;
 return`<svg viewBox="0 0 176 176"><circle cx="88" cy="88" r="86" fill="#202328"/><circle cx="88" cy="88" r="${r}" fill="none" stroke="#30353b" stroke-width="14"/><circle cx="88" cy="88" r="${r}" fill="none" stroke="${color}" stroke-width="14" stroke-dasharray="${C*p} ${C}" transform="rotate(-90 88 88)" stroke-linecap="butt"/><circle cx="88" cy="88" r="62" fill="#1a1c20"/><circle cx="88" cy="88" r="61" fill="none" stroke="#2d3238"/>${[0,1,2,3,4,5,6,7].map(i=>`<circle cx="${88+70*Math.cos(i*Math.PI/4)}" cy="${88+70*Math.sin(i*Math.PI/4)}" r="1.6" fill="#17191c"/>`).join('')}</svg>`}

/* ===== HOJE ===== */
V.hoje=()=>{
 const d=new Date(),k=dk(),h=d.getHours();const D=S.days[k]||{};const r=readiness(k);
 const greet=h<12?'Bom dia':h<18?'Boa tarde':'Boa noite';
 const acts=todayActs();const ws=weekSummary();const act=activeSet();const L=loadStats();
 const water=D.water||0,dd=dietDone(k);
 const aiTxt=D.ai;
 return`<div class="between" style="margin:8px 0 18px"><div class="brand">${plateMark()} HardFit</div><span id="syncdot" class="sync ${DB.status}"><i></i>${syncLabel()}</span></div>
 <h1>${greet}, ${esc(S.cfg.name)}</h1><div class="lead">${DOW[d.getDay()]}, ${d.getDate()} de ${MON[d.getMonth()]}</div>
 ${!IS_CLAUDE()&&!SB.on?`<button class="panel" style="margin:16px 0 0;width:100%;text-align:left;border-color:var(--blue)" onclick="push('conta')"><div class="between"><h3>Ative a sincronização</h3><span class="chev"></span></div><p class="small mut" style="margin:6px 0 0">Crie seu acesso uma vez para salvar na nuvem e liberar a IA.</p></button>`:''}
 <div class="panel" style="margin-top:18px;padding:18px">
  <div class="flex" style="gap:16px;align-items:center">
   <div class="plate" style="width:132px;height:132px">${plateSVG(r?r.score:null,r?r.c:'#30353b')}<div class="c"><b style="font-size:38px">${r?r.score:'–'}</b><span>prontidão</span></div></div>
   <div style="flex:1;min-width:0">${r?`<span class="tag"><i style="background:${r.c}"></i>${r.label}</span><p class="small" style="margin:10px 0 0">${r.rec}</p>${r.fcNote?`<p class="tiny mut" style="margin:6px 0 0">${r.fcNote}</p>`:''}`:`<h3>Como você chegou hoje?</h3><p class="small mut" style="margin:6px 0 12px">Fadiga, sono, dor, estresse e humor. Leva 30 segundos e ajusta o treino do dia.</p><button class="btn sm blue" onclick="startCheckin()">Fazer check-in</button>`}</div>
  </div>
  ${r?`<div id="aibox" style="margin-top:16px;border-top:1px solid var(--line);padding-top:14px">${aiTxt?`<div class="ai md">${md(aiTxt)}</div>`:aiOn()?`<button class="txtbtn" onclick="runCheckinAI()">Gerar leitura do coach</button>`:''}</div><div class="flex" style="margin-top:10px;gap:16px"><button class="txtbtn" onclick="startCheckin()">Editar check-in</button>${Object.keys((D.ci||{}).pain||{}).length?`<span class="small mut">${Object.keys(D.ci.pain).length} ponto(s) de dor</span>`:''}</div>`:''}
 </div>
 ${S.cfg.flex?flexToday(k):`<div class="sec"><h3>No plano de hoje</h3><button onclick="push('semana')">Editar semana</button></div>
 <div class="rows">${acts.length?acts.map(a=>actRow(a,k)).join(''):`<div class="row"><div class="grow mut">Nada planejado.</div></div>`}</div>`}
 <div class="g2">
  <div class="panel" style="margin:0"><div class="between"><h3>Água</h3><span class="small mut n">${fmtKg(water/1000)} / 5 L</span></div><div class="bar" style="margin:12px 0"><i style="width:${Math.min(100,water/50)}%;background:var(--blue)"></i></div><div class="flex" style="gap:6px;flex-wrap:wrap"><button class="chip" onclick="addWater(500)">+500 ml</button><button class="chip" onclick="waterSheet()">Outro valor</button></div></div>
  <div class="panel" style="margin:0" onclick="go('dieta')"><div class="between"><h3>Dieta</h3><span class="small mut n">${dd} de 4</span></div><div class="bar" style="margin:12px 0"><i style="width:${dd*25}%;background:var(--grn)"></i></div><span class="txtbtn">Marcar refeições</span></div>
 </div>
 <div class="sec"><h3>Sua semana</h3><span class="small mut">${streak()} dia(s) seguidos</span></div>
 <div class="panel"><div class="week">${ws.w.map((x,i)=>`<div><div class="d">${'STQQSSD'[i]}</div><div class="p ${act.has(x)?'on':''} ${x===k?'today':''}">${parseDk(x).getDate()}</div></div>`).join('')}</div>
  <div class="strip" style="margin-top:14px;border:0;background:none"><div><b>${ws.tre}</b><span>treinos</span></div><div><b>${Math.floor(ws.cmin/60)}h${pad(Math.round(ws.cmin%60))}</b><span>cardio</span></div><div><b>${ws.diet}</b><span>dias dieta</span></div><div><b>${ws.ativos}/7</b><span>ativos</span></div></div></div>
${IS_CLAUDE()?`<div class="rows"><button class="row" onclick="push('sync')"><div class="grow"><div class="t">Treinou com o app offline?</div><div class="d">Cole os registros aqui para a IA enxergar</div></div><span class="chev"></span></button></div>`:''}
 <div class="panel" onclick="push('metodo')"><div class="between"><h3>Carga de treino</h3><span class="tag"><i style="background:${L.ratio==null?'var(--steel2)':L.ratio<0.8?'var(--blue)':L.ratio<=1.3?'var(--grn)':L.ratio<=1.5?'var(--yel)':'var(--red)'}"></i>${L.zona}</span></div>
  <p class="small mut" style="margin:8px 0 0">Últimos 7 dias: <b class="n" style="color:var(--chalk)">${L.aguda}</b> UA · média semanal do mês: <b class="n" style="color:var(--chalk)">${L.cronica}</b> UA${L.ratio!=null?` · razão <b class="n" style="color:var(--chalk)">${fmtKg(L.ratio)}</b>`:''}</p></div>`};
function flexToday(k){const nx=nextSession();const w=weekDays();const forca=Object.values(S.logs).filter(l=>w.includes(l.date)).map(l=>l.sess);const done=doneOn(k);
 return`<div class="sec"><h3>Treinar hoje</h3><span class="small mut">sem dia fixo</span></div>
 <div class="rows">${actRow(nx,k).replace('<div class="d">','<div class="d">Próximo da sequência A, B, C. ')}</div>
 ${(()=>{const r=runState();if(!r||!r.next)return'';const s=r.next;return`<div class="rows"><button class="row" onclick="runSession(${r.cw},'${s.id}')"><span class="sw" style="background:var(--grn)"></span><div class="grow"><div class="t">Corrida: ${s.t}</div><div class="d">Semana ${r.cw+1} de ${r.plan.length} do plano de ${RUN_GOALS[r.R.goal].n}${s.k==='Q'&&readiness(k)&&readiness(k).score<50?'. Prontidão baixa: faça só leve hoje':''}</div></div><span class="chev"></span></button></div>`})()}
 <div class="chips" style="margin:2px 0 10px">${['A','B','C'].filter(x=>x!==nx).map(x=>`<button class="chip" onclick="openSession('${x}')">${SESS[x].name}</button>`).join('')}${MODS.map(m=>`<button class="chip" onclick="startCardio('${m}')">${ACT[m].n}</button>`).join('')}<button class="chip" onclick="cardioForm()">Lançar com outra data</button></div>
 ${done.length?`<div class="sec"><h3>Feito hoje</h3></div><div class="rows">${done.map(x=>`<div class="row"><span class="sw" style="background:${x.c}"></span><div class="grow"><div class="t">${x.t}</div><div class="d">${x.d}</div></div></div>`).join('')}</div>`:''}
 <div class="panel"><div class="between"><h3>Força na semana</h3><span class="small mut n">${forca.length} de 3</span></div><div class="g3" style="margin-top:12px">${['A','B','C'].map(x=>`<div class="tag" style="justify-content:center;padding:8px;background:${forca.includes(x)?'var(--chalk)':'var(--s2)'};color:${forca.includes(x)?'#141518':'var(--steel)'}">${SESS[x].name}</div>`).join('')}</div><p class="tiny mut" style="margin:10px 0 0">Meta do protocolo: A, B e C uma vez cada por semana, com pelo menos um dia entre eles quando der.</p></div>`}
function plateMark(){return`<svg width="26" height="26" viewBox="0 0 26 26"><circle cx="13" cy="13" r="12" fill="var(--red)"/><circle cx="13" cy="13" r="7.5" fill="var(--floor)"/><circle cx="13" cy="13" r="3" fill="var(--chalk)"/></svg>`}
function actRow(a,k){const A=ACT[a];
 if(A.k==='forca'){const done=Object.values(S.logs).some(l=>l.date===k&&l.sess===a);const live=ACTIVE&&ACTIVE.sess===a;return`<button class="row" onclick="openSession('${a}')"><span class="sw" style="background:var(--red)"></span><div class="grow"><div class="t">${SESS[a].full}</div><div class="d">${SESS[a].ex.length} exercícios, séries tipadas</div></div>${done?'<span class="tag"><i style="background:var(--grn)"></i>Feito</span>':live?'<span class="tag"><i style="background:var(--blue)"></i>Em andamento</span>':'<span class="chev"></span>'}</button>`}
 if(A.k==='off')return`<div class="row"><span class="sw" style="background:var(--steel2)"></span><div class="grow"><div class="t">Descanso</div><div class="d">Recupere: sono, água e dieta em dia</div></div></div>`;
 const done=Object.values(S.cardio).some(c=>c.date===k&&c.mod===a);
 return`<button class="row" onclick="startCardio('${a}')"><span class="sw" style="background:${A.k==='wod'?'var(--yel)':'var(--blue)'}"></span><div class="grow"><div class="t">${A.n}</div><div class="d">${A.alvo}</div></div>${done?'<span class="tag"><i style="background:var(--grn)"></i>Feito</span>':'<span class="chev"></span>'}</button>`}
function waterSheet(k=dk()){const w=(S.days[k]||{}).water||0;openSheet(`<h2>Água</h2><p class="small mut" style="margin:4px 0 14px">${k===dk()?'Hoje':fmtD(k)}: <b class="n" style="color:var(--chalk)">${w.toLocaleString('pt-BR')} ml</b> de 5.000 ml</p>
 <div class="chips">${[150,200,250,300,350,500,600,750,1000].map(v=>`<button class="chip" onclick="addWater(${v},'${k}');waterSheet('${k}')">+${v} ml</button>`).join('')}</div>
 <div class="field" style="margin-top:16px"><label>Outra quantidade (ml)</label><input id="w_ml" inputmode="numeric" placeholder="ex. 450"></div>
 <div class="g2"><button class="btn ghost" onclick="const v=Math.round(num($('#w_ml').value));if(v){addWater(-v,'${k}');waterSheet('${k}')}">Remover</button><button class="btn" onclick="const v=Math.round(num($('#w_ml').value));if(v){addWater(v,'${k}');closeSheet()}else toast('Digite os ml')">Adicionar</button></div>`)}
function addWater(ml,k=dk()){const d=day(k);d.wt=Date.now();d.water=Math.max(0,(d.water||0)+ml);touch('days/'+k);render();if(d.water>=5000&&ml>0&&d.water-ml<5000)toast('Meta de 5 L batida')}

/* ===== CHECK-IN (3 etapas, tela cheia) ===== */
let CI=null,CIstep=0,CIview='front';
function startCheckin(){const c=(S.days[dk()]||{}).ci;CI=c?JSON.parse(JSON.stringify(c)):{fadiga:0,sono:0,dor:0,estresse:0,humor:0,pain:{},obs:''};CIstep=0;CIview='front';$('#flow').classList.add('show');drawFlow()}
function closeFlow(){$('#flow').classList.remove('show');stopDict()}
function drawFlow(){
 const st=`<div class="steps">${[0,1,2].map(i=>`<i class="${i<=CIstep?'on':''}"></i>`).join('')}</div>`;
 const head=`<div class="between" style="padding:6px 0 10px"><button class="ib" onclick="${CIstep?'ciStep(-1)':'closeFlow()'}" aria-label="${CIstep?'Voltar':'Fechar'}">${CIstep?I.back:I.x}</button><span class="small mut">Etapa ${CIstep+1} de 3</span><span style="width:40px"></span></div>`;
 let body='',foot='';
 if(CIstep===0){
  body=`<h1 style="font-size:26px">Como foi o seu dia?</h1><p class="lead">Responda todo dia, inclusive na folga. É isso que deixa a prontidão e o relatório confiáveis.</p>
  ${SCALES.map(s=>`<div class="panel" style="margin-top:12px"><h3 style="font-size:15px">${s.n}</h3><div class="scale">${[1,2,3,4,5].map(v=>`<button class="${CI[s.k]===v?'on':''}" style="${CI[s.k]===v?'background:'+SCALE_COL[v]:''}" onclick="ciSet('${s.k}',${v})">${v}</button>`).join('')}</div><div class="ends"><span>${s.lo}</span><span>${s.hi}</span></div></div>`).join('')}`;
  foot=`<button class="btn" onclick="ciStep(1)" ${SCALES.every(s=>CI[s.k])?'':'disabled'}>Continuar</button>`}
 if(CIstep===1){
  const pain=CI.pain;const f=id=>pain[id]?PAIN[pain[id].l].c:null;
  body=`<h1 style="font-size:26px">Alguma dor específica?</h1><p class="lead">Toque onde dói. Cada toque sobe a intensidade: leve, moderada, forte e volta para sem dor.</p>
  <button class="btn ghost" style="margin:14px 0" onclick="CI.pain={};ciStep(1)">Não, nada dói hoje</button>
  <div class="seg" style="max-width:220px;margin:0 auto 10px"><button class="${CIview==='front'?'on':''}" onclick="CIview='front';drawFlow()">Frente</button><button class="${CIview==='back'?'on':''}" onclick="CIview='back';drawFlow()">Costas</button></div>
  <div class="bodymap">${bodySVG(CIview,f,'ciTap')}</div>
  <div class="legend">${[1,2,3].map(l=>`<span><i class="sw" style="background:${PAIN[l].c}"></i>${PAIN[l].n}</span>`).join('')}</div>
  ${Object.keys(pain).map(id=>`<div class="panel" style="margin-top:12px"><div class="between"><h3 style="font-size:15px">${regName(id)}</h3><button class="tiny mut" onclick="delete CI.pain['${id}'];drawFlow()">remover</button></div><div class="seg" style="margin-top:10px">${[1,2,3].map(l=>`<button class="${pain[id].l===l?'on':''}" style="${pain[id].l===l?'background:'+PAIN[l].c+';color:#141518':''}" onclick="CI.pain['${id}'].l=${l};drawFlow()">${PAIN[l].n}</button>`).join('')}</div><input style="margin-top:10px" placeholder="Quando começou, em que movimento dói…" value="${esc(pain[id].note||'')}" oninput="CI.pain['${id}'].note=this.value"></div>`).join('')}
  ${Object.keys(pain).length?`<p class="tiny mut" style="margin-top:12px">Dor forte, que piora ou que não passa precisa de avaliação de um profissional. O app não substitui isso.</p>`:''}`;
  foot=`<button class="btn ghost" style="width:auto;padding:15px 20px" onclick="ciStep(-1)">Voltar</button><button class="btn" onclick="ciStep(1)">Continuar</button>`}
 if(CIstep===2){
  body=`<h1 style="font-size:26px">Quer acrescentar algo?</h1><p class="lead">Opcional. Dormiu mal, semana puxada, fome fora de hora, algo diferente no treino.</p>
  <textarea id="ciobs" rows="6" style="margin-top:14px" maxlength="2000" oninput="CI.obs=this.value" placeholder="Escreva ou use o microfone do teclado">${esc(CI.obs||'')}</textarea>
  ${DICT?`<button class="btn ghost" id="dictbtn" style="margin-top:10px" onclick="toggleDict()">${I.mic} Ditar</button>`:''}
  ${aiOn()?`<p class="small mut" style="margin-top:14px">Ao salvar, o coach lê seu check-in junto com treinos, cardio e dieta dos últimos dias e diz como ajustar o treino de hoje.</p>`:''}`;
  foot=`<button class="btn ghost" style="width:auto;padding:15px 20px" onclick="ciStep(-1)">Voltar</button><button class="btn" onclick="saveCheckin()">Salvar check-in</button>`}
 $('#flow').innerHTML=`<div class="fb">${head}${st}${body}</div><div class="ff">${foot}</div>`}
function ciSet(k,v){CI[k]=v;const y=$('#flow .fb').scrollTop;drawFlow();$('#flow .fb').scrollTop=y}
function ciStep(n){CIstep=Math.max(0,Math.min(2,CIstep+n));stopDict();drawFlow();$('#flow .fb').scrollTop=0}
function ciTap(id){const p=CI.pain[id];if(!p)CI.pain[id]={l:1,note:''};else if(p.l<3)p.l++;else delete CI.pain[id];const y=$('#flow .fb').scrollTop;drawFlow();$('#flow .fb').scrollTop=y}
function saveCheckin(){const k=dk();const d=day(k);d.ci={...CI,t:Date.now()};d.ai=null;touch('days/'+k);closeFlow();go('hoje');toast('Check-in salvo');if(aiOn())runCheckinAI()}
async function runCheckinAI(){const k=dk();const box=$('#aibox');if(box)box.innerHTML=`<div class="small mut"><span class="spin"></span> Coach lendo seu dia…</div>`;
 try{const t=await aiCheckin(k,({text})=>{const b=$('#aibox');if(b)b.innerHTML=`<div class="ai md">${md(text)}</div>`});day(k).ai=t;touch('days/'+k);if(TAB==='hoje'&&!STACK.length)render()}
 catch(e){const b=$('#aibox');if(b)b.innerHTML=`<p class="small mut">${aiErr(e)}</p><button class="txtbtn" onclick="runCheckinAI()">Tentar de novo</button>`}}
let DICT=null,dictOn=false;
async function initDict(){try{DICT=window.claude&&await window.claude.use('dictation')}catch(e){DICT=null}if(DICT){DICT.onFinal(({text})=>{CI.obs=((CI.obs||'')+' '+text).trim();const t=$('#ciobs');if(t)t.value=CI.obs});DICT.onState(({state})=>{dictOn=state==='listening';const b=$('#dictbtn');if(b)b.innerHTML=I.mic+(dictOn?' Parar':' Ditar')})}}
function toggleDict(){if(!DICT)return;if(dictOn){DICT.stop().catch(()=>{})}else DICT.start().catch(e=>toast(e&&e.code==='not_granted'?'Microfone não liberado':'Ditado indisponível'))}
function stopDict(){if(DICT&&dictOn)DICT.stop().catch(()=>{})}

/* ===== TREINAR ===== */
let TMODE='forca';
V.treinar=()=>`<h1 style="margin-top:8px">Treinar</h1><div class="seg" style="margin:16px 0 4px"><button class="${TMODE==='forca'?'on':''}" onclick="TMODE='forca';render()">Força</button><button class="${TMODE==='cardio'?'on':''}" onclick="TMODE='cardio';render()">Cardio e CrossFit</button></div>${TMODE==='forca'?forcaView():cardioView()}`;
function forcaView(){
 const p0=parseDk(PROGRAM.start),p1=parseDk(PROGRAM.end),now=new Date();const pct=Math.max(0,Math.min(100,Math.round((now-p0)/(p1-p0)*100)));const left=Math.max(0,Math.ceil((p1-now)/864e5));
 return`<div class="panel" style="margin-top:12px"><div class="between"><h2>${PROGRAM.name}</h2><span class="small mut">${left?left+' dias restantes':'Ciclo concluído'}</span></div><div class="bar" style="margin:12px 0 6px"><i style="width:${pct}%;background:var(--chalk)"></i></div><div class="small mut">${fmtD(PROGRAM.start)} a ${fmtD(PROGRAM.end)}. Aquecimento, feeder e 3 work sets por exercício.</div></div>
 ${ACTIVE?`<button class="btn blue" style="margin-bottom:10px" onclick="openSession('${ACTIVE.sess}')">${I.play} Continuar ${SESS[ACTIVE.sess].name}</button>`:''}
 <div class="sec"><h3>Sessões</h3></div>
 <div class="rows">${Object.entries(SESS).map(([k,s])=>{const last=Object.values(S.logs).filter(l=>l.sess===k).sort(by('start')).pop();return`<button class="row" onclick="openSession('${k}')"><div class="ib" style="font-weight:850;font-variation-settings:'wdth' 125">${k}</div><div class="grow"><div class="t">${s.full}</div><div class="d">${S.cfg.flex?(last?'Último em '+fmtD(last.date):'Ainda não feito'):DOW[s.day]+(last?', último em '+fmtD(last.date):'')}</div></div><span class="chev"></span></button>`}).join('')}</div>
 <div class="sec"><h3>Análise</h3></div>
 <div class="rows"><button class="row" onclick="push('evo')"><div class="grow"><div class="t">Evolução de carga</div><div class="d">Maior carga dos work sets por exercício</div></div><span class="chev"></span></button><button class="row" onclick="push('hist')"><div class="grow"><div class="t">Histórico de sessões</div><div class="d">${Object.keys(S.logs).length} registradas</div></div><span class="chev"></span></button><button class="row" onclick="push('tecnica')"><div class="grow"><div class="t">Vídeos de execução</div><div class="d">Grave a série e receba correção de técnica</div></div><span class="chev"></span></button></div>`}

/* ---- sessão ---- */
let sessIv=null,PSE={};
const exList=k=>SESS[k].ex.map(e=>e==='BISET'?BISET_ABS:{type:'std',id:e,name:EX[e].n});
function openSession(k){const open=()=>{ACTIVE={sess:k,start:null,done:{},cur:0,date:dk()};saveActive();TAB='treinar';STACK=[['sessao',[k]]];render();scrollTo(0,0)};
 if(ACTIVE&&ACTIVE.sess===k){TAB='treinar';STACK=[['sessao',[k]]];render();return}
 if(ACTIVE&&Object.keys(ACTIVE.done).length){ask(`Você tem o ${SESS[ACTIVE.sess].name} em andamento. Descartar e abrir o ${SESS[k].name}?`,open,'Descartar e abrir');return}open()}
V.sessao=k=>{
 const A=ACTIVE;if(!A)return'';const list=exList(k);const e=list[A.cur];
 after.push(()=>{clearInterval(sessIv);sessIv=setInterval(()=>{const c=$('#sclock');if(!c){clearInterval(sessIv);return}if(ACTIVE&&ACTIVE.start)c.textContent=mmss((Date.now()-ACTIVE.start)/1000)},1000);const n=$('.exnav .on');n&&n.scrollIntoView({inline:'center',block:'nearest'})});
 return`${hdr(SESS[k].name,`<span class="clock ${A.start?'run':''}" id="sclock">${A.start?mmss((Date.now()-A.start)/1000):'0:00'}</span>`)}
 <div class="flex" style="margin:-8px 0 12px;gap:8px"><span class="small mut">Data do treino</span><input type="date" value="${A.date||dk()}" max="${dk()}" style="width:auto;padding:7px 10px;font-size:14px" onchange="ACTIVE.date=this.value||dk();saveActive()"></div>
 <div class="exnav">${list.map((x,i)=>{const d=(A.done[x.id]||[]).length,tot=x.type==='biset'?x.sets*2:5;return`<button class="${i===A.cur?'on':''} ${d>=tot&&i!==A.cur?'ok':''}" onclick="ACTIVE.cur=${i};saveActive();render()">${x.type==='biset'?'Abs':i+1}</button>`}).join('')}</div>
 <div class="panel">${e.type==='biset'?bisetCard(e):stdCard(e,list.length)}</div>
 <div class="g2" style="margin-top:4px"><button class="btn ghost" onclick="moveEx(-1)" ${A.cur?'':'disabled'}>Anterior</button><button class="btn ghost" onclick="moveEx(1)" ${A.cur<list.length-1?'':'disabled'}>Próximo</button></div>
 ${A.start?`<div class="g2" style="margin-top:10px"><button class="btn ghost" onclick="cancelSession()">Descartar</button><button class="btn" onclick="finishSession()">Finalizar sessão</button></div>`:`<div style="height:70px"></div><div class="startbar"><button class="btn blue" onclick="ACTIVE.start=Date.now();saveActive();render();toast('Sessão iniciada')">${I.play} Iniciar sessão</button></div>`}`};
function moveEx(n){ACTIVE.cur+=n;saveActive();render();scrollTo(0,0)}
function vidLinks(id,name){const mine=Object.values(S.tech).filter(t=>t.ex===id).length;return`<div class="flex" style="gap:8px;margin-top:12px;flex-wrap:wrap"><a class="tag" style="text-decoration:none;padding:7px 11px" href="https://www.youtube.com/results?search_query=${encodeURIComponent(name+' execução correta')}" target="_blank" rel="noopener">${I.play} Ver execução</a><button class="tag" style="padding:7px 11px" onclick="push('tecnica','${id}')">${I.cam.replace('width="20" height="20"','width="14" height="14"')} ${mine?'Meus vídeos ('+mine+')':'Filmar minha série'}</button></div>`}
function numEntry(id,kg,reps){const st=(EX[id]||{}).step||2.5;return`<div class="entry"><div class="num"><label>Carga (kg)</label><div class="ctl"><button onclick="stepIn('kg_${id}',-${st||1})" aria-label="Menos carga">−</button><input id="kg_${id}" inputmode="decimal" value="${fmtKg(kg)}"><button onclick="stepIn('kg_${id}',${st||1})" aria-label="Mais carga">+</button></div></div><div class="num"><label>Repetições</label><div class="ctl"><button onclick="stepIn('rp_${id}',-1)" aria-label="Menos reps">−</button><input id="rp_${id}" inputmode="numeric" value="${reps}"><button onclick="stepIn('rp_${id}',1)" aria-label="Mais reps">+</button></div></div></div>`}
function pseRow(id){return`<div class="between" style="margin-top:14px"><span class="small mut">Esforço da série (PSE)</span><span class="tiny mut2">10 = falha</span></div><div class="pse">${[...Array(10)].map((_,i)=>`<button class="${PSE[id]===i+1?'on':''}" onclick="pickPse('${id}',${i+1},this)">${i+1}</button>`).join('')}</div>`}
function pickPse(id,v,b){PSE[id]=PSE[id]===v?null:v;b.parentNode.querySelectorAll('button').forEach((x,i)=>x.classList.toggle('on',PSE[id]===i+1))}
function stepIn(id,d){const e=document.getElementById(id);e.value=fmtKg(Math.max(0,num(e.value)+d))}
function stdCard(e,tot){
 const A=ACTIVE;const done=A.done[e.id]||[];const cur=done.length;const fin=cur>=5;const set=SETS_STD[Math.min(cur,4)];
 const prev=lastFor(e.id,Math.min(cur,4));const sug=suggestion(e.id);
 let kg=prev.kg,reps=prev.reps;if(set.work){if(cur>2&&done[cur-1])kg=done[cur-1].kg;else if(sug)kg=sug.kg}
 return`<div class="exhero"><div><div class="small mut">Exercício ${A.cur+1} de ${tot}</div><h2 style="margin-top:4px">${e.name}</h2></div>${muscleMini(e.id)}</div>
 ${vidLinks(e.id,e.name)}
 ${sug?`<div class="hint"><span class="sw" style="background:${sug.c}"></span><div><b>${sug.t}</b><div class="mut small">${sug.why}</div></div></div>`:''}
 <table class="settbl">${SETS_STD.map((s,j)=>{const d=done[j];return`<tr class="${j===cur?'cur':''} ${d?'done':''}"><td><span class="pl" style="background:${s.c}"></span>${s.t}</td><td>${d?`<b style="color:var(--chalk)">${fmtKg(d.kg)} × ${d.reps}</b>`:s.reps+' reps'}</td><td>${s.rest}s</td><td>${d?(d.pse?'PSE '+d.pse:'✓'):''}</td></tr>`}).join('')}</table>
 ${fin?`<div class="hint"><span class="sw" style="background:var(--grn)"></span><div><b>Exercício concluído</b><div class="mut small">${done.map(d=>fmtKg(d.kg)+'×'+d.reps).join(', ')}</div></div></div><button class="txtbtn" onclick="undoSet('${e.id}')">Desfazer última série</button>`:`
 <div class="between" style="margin-top:16px"><h3><span class="pl" style="background:${set.c}"></span>${set.t}</h3><span class="small mut">${set.reps} reps, descanso ${set.rest}s</span></div>
 <div class="small mut" style="margin-top:4px">Última vez nesta série: ${fmtKg(prev.kg)} kg × ${prev.reps}${prev.seed?' (app do coach)':''}</div>
 ${numEntry(e.id,kg,reps)}${pseRow(e.id)}
 <button class="btn ${ACTIVE.start?'':'ghost'}" style="margin-top:14px" onclick="confirmSet('${e.id}',${set.rest})">Confirmar série ${cur+1} de 5</button>
 ${cur?`<button class="txtbtn" style="margin-top:6px" onclick="undoSet('${e.id}')">Desfazer última série</button>`:''}`}
 <input style="margin-top:14px;font-size:14px" placeholder="Nota do exercício (banco, pegada, ajuste)" value="${esc(S.cfg.notes[e.id]||'')}" onchange="S.cfg.notes['${e.id}']=this.value;touch('cfg/main')">`}
function bisetCard(e){
 const A=ACTIVE;const done=A.done[e.id]||[];const cur=done.length;const tot=e.sets*2;const fin=cur>=tot;const it=e.items[cur%2];const rnd=Math.floor(cur/2);const prev=lastFor(it.id,0);
 return`<div class="exhero"><div><div class="small mut">Bi-set: emende A e B, descanse ${e.rest}s</div><h2 style="margin-top:4px">${e.name}</h2></div>${muscleMini('abd_infra','abd_supra')}</div>
 ${e.items.map((x,j)=>{const mine=done.filter((_,q)=>q%2===j);return`<div style="margin-top:14px"><div class="between"><h3>${'AB'[j]}. ${EX[x.id].n}</h3><a class="tag" style="text-decoration:none" href="https://www.youtube.com/results?search_query=${encodeURIComponent(EX[x.id].n+' execução')}" target="_blank" rel="noopener">${I.play} Ver</a></div><table class="settbl">${[...Array(e.sets)].map((_,r)=>{const d=mine[r];const isC=!fin&&cur%2===j&&rnd===r;return`<tr class="${isC?'cur':''} ${d?'done':''}"><td><span class="pl" style="background:var(--red)"></span>Rodada ${r+1}</td><td>${d?`<b style="color:var(--chalk)">${d.kg?fmtKg(d.kg)+' kg × ':''}${d.reps}</b>`:e.reps+' reps'}</td><td>${j?e.rest+'s':'emende'}</td></tr>`}).join('')}</table></div>`}).join('')}
 ${fin?`<div class="hint"><span class="sw" style="background:var(--grn)"></span><b>Bi-set concluído</b></div>`:`<div class="between" style="margin-top:16px"><h3>${'AB'[cur%2]}. ${EX[it.id].n}</h3><span class="small mut">Rodada ${rnd+1} de ${e.sets}</span></div>${numEntry(it.id,prev.kg,prev.reps||e.reps)}${pseRow(it.id)}<button class="btn ${ACTIVE.start?'':'ghost'}" style="margin-top:14px" onclick="confirmSet('${e.id}',${cur%2?e.rest:0},'${it.id}')">Confirmar</button>`}
 ${cur?`<button class="txtbtn" style="margin-top:6px" onclick="undoSet('${e.id}')">Desfazer última série</button>`:''}`}
function confirmSet(exId,rest,sub){
 const A=ACTIVE;if(!A.start){toast('Toque em Iniciar sessão para começar a contar o tempo');return}const id=sub||exId;
 const kg=num($('#kg_'+id).value),reps=Math.round(num($('#rp_'+id).value));if(!reps){toast('Informe as repetições');return}
 A.done[exId]=A.done[exId]||[];const idx=A.done[exId].length;
 A.done[exId].push({id,kg,reps,pse:PSE[id]||null,t:Date.now(),set:sub?Math.floor(idx/2):idx,bi:sub?1:undefined});PSE[id]=null;saveActive();
 const list=exList(A.sess);const e=list[A.cur];const tot=e.type==='biset'?e.sets*2:5;
 if(A.done[exId].length>=tot&&A.cur<list.length-1){A.cur++;saveActive();toast('Próximo: '+(list[A.cur].name))}
 render();scrollTo(0,0);if(rest)restStart(rest)}
function undoSet(exId){const d=ACTIVE.done[exId];if(d&&d.length){d.pop();saveActive();render()}}
function cancelSession(){ask('Descartar esta sessão? Nada dela será salvo.',()=>{ACTIVE=null;saveActive();restStop();STACK=[];render()},'Descartar')}
function finishSession(){
 const A=ACTIVE;const sets=[];Object.values(A.done).forEach(a=>a.forEach(s=>sets.push(s)));if(!sets.length){toast('Nenhuma série registrada');return}
 sets.forEach(s=>{const L=S.cfg.loads[s.id]=S.cfg.loads[s.id]||{};L[Math.min(s.set,4)]={kg:s.kg,reps:s.reps}});
 const end=Date.now(),id=uid('L');const log={id,sess:A.sess,date:A.date||dk(new Date(A.start||end)),start:A.start||end,end,sets};
 S.logs[id]=log;touch('logs/'+id);touch('cfg/main');ACTIVE=null;saveActive();restStop();STACK=[];render();
 const vol=sets.reduce((a,s)=>a+s.kg*s.reps,0),min=Math.round((end-log.start)/6e4);const p=sets.filter(s=>s.pse).map(s=>s.pse);
 openSheet(`<h2>Sessão salva</h2><div class="strip" style="margin:16px 0;grid-template-columns:repeat(3,1fr)"><div><b>${min}</b><span>minutos</span></div><div><b>${sets.length}</b><span>séries</span></div><div><b>${Math.round(vol).toLocaleString('pt-BR')}</b><span>kg de volume</span></div></div><p class="small mut">${p.length?'PSE médio '+fmtKg(Math.round(p.reduce((a,b)=>a+b,0)/p.length*10)/10)+'. ':''}As sugestões de carga da próxima vez já consideram esta sessão. Se gravou no Watch como Força Funcional, o treino já está no app Saúde.</p><button class="btn" style="margin-top:12px" onclick="closeSheet()">Fechar</button>`)}
let restEnd=0,restTot=0,restIv=null;
function restStart(s){restTot=s;restEnd=Date.now()+s*1000;$('#rest').classList.add('show');clearInterval(restIv);restIv=setInterval(restTick,250);restTick()}
function restAdd(d){restEnd+=d*1000;restTot=Math.max(1,restTot+d);restTick()}
function restStop(){clearInterval(restIv);$('#rest').classList.remove('show')}
function restTick(){const l=(restEnd-Date.now())/1000;$('#restt').textContent=mmss(Math.ceil(l));$('#restbar').style.width=Math.max(0,100-l/restTot*100)+'%';if(l<=0){restStop();beep();toast('Descanso encerrado')}}
function beep(){try{const c=new(window.AudioContext||window.webkitAudioContext)();[0,.2].forEach(t=>{const o=c.createOscillator(),g=c.createGain();o.frequency.value=660;g.gain.setValueAtTime(.0001,c.currentTime+t);g.gain.exponentialRampToValueAtTime(.08,c.currentTime+t+.02);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+t+.18);o.connect(g).connect(c.destination);o.start(c.currentTime+t);o.stop(c.currentTime+t+.2)});navigator.vibrate&&navigator.vibrate(250)}catch(e){}}

/* ---- histórico / evolução ---- */
V.hist=()=>{const L=Object.values(S.logs).sort(by('start')).reverse();return`${hdr('Histórico')}${L.length?`<div class="rows">${L.map(l=>{const vol=l.sets.reduce((a,s)=>a+s.kg*s.reps,0);return`<div class="row"><div class="grow"><div class="t">${SESS[l.sess].full}</div><div class="d">${fmtD(l.date)}, ${Math.round((l.end-l.start)/6e4)} min, ${l.sets.length} séries, ${Math.round(vol).toLocaleString('pt-BR')} kg</div></div><button class="tiny mut" onclick="ask('Apagar esta sessão?',()=>{drop('logs','${l.id}');render()},'Apagar')">apagar</button></div>`}).join('')}</div>`:`<div class="panel mut">Finalize um treino para ver o histórico aqui.</div>`}`};
let EVO='agach';
V.evo=()=>{const pts=Object.values(S.logs).sort(by('start')).map(l=>{const w=l.sets.filter(s=>s.id===EVO&&s.set>=2);return w.length?{x:l.date,y:Math.max(...w.map(s=>s.kg)),r:w.map(s=>s.reps).join('/')}:null}).filter(Boolean);
 return`${hdr('Evolução de carga')}<select onchange="EVO=this.value;render()">${Object.entries(EX).map(([k,e])=>`<option value="${k}" ${k===EVO?'selected':''}>${e.n}</option>`).join('')}</select>
 <div class="panel" style="margin-top:12px"><div class="exhero"><div><h3>${EX[EVO].n}</h3><p class="small mut" style="margin:4px 0 0">${(suggestion(EVO)||{}).t||''}</p></div>${muscleMini(EVO)}</div>${pts.length?lineChart(pts):`<p class="small mut">Sem work sets registrados ainda. Referência do coach: ${fmtKg((SEED[EVO]||[0])[0])} kg.</p>`}</div>
 ${pts.length?`<div class="rows">${pts.slice().reverse().map(p=>`<div class="row"><div class="grow">${fmtD(p.x)}</div><b class="n">${fmtKg(p.y)} kg</b><span class="small mut">${p.r}</span></div>`).join('')}</div>`:''}`};
function lineChart(p,unit=''){if(!p.length)return'';const W=320,H=150,pd=24;const ys=p.map(a=>a.y);let mn=Math.min(...ys),mx=Math.max(...ys);if(mn===mx){mn-=1;mx+=1}
 const X=i=>p.length===1?W/2:pd+i*(W-pd*2)/(p.length-1),Y=v=>H-pd-(v-mn)/(mx-mn)*(H-pd*2-10);
 return`<svg class="chart" viewBox="0 0 ${W} ${H}"><line x1="${pd}" x2="${W-pd}" y1="${H-pd}" y2="${H-pd}" stroke="#30353b"/><path d="${p.map((a,i)=>(i?'L':'M')+X(i).toFixed(1)+' '+Y(a.y).toFixed(1)).join(' ')}" fill="none" stroke="var(--chalk)" stroke-width="2.2" stroke-linejoin="round"/>${p.map((a,i)=>`<circle cx="${X(i)}" cy="${Y(a.y)}" r="3.6" fill="var(--floor)" stroke="var(--chalk)" stroke-width="2"/>${p.length<9||i===p.length-1?`<text x="${X(i)}" y="${Y(a.y)-9}" fill="#c9c7c1" font-size="10" text-anchor="middle" font-family="Archivo,system-ui,sans-serif">${fmtKg(Math.round(a.y*10)/10)}${unit}</text>`:''}`).join('')}<text x="${pd}" y="${H-7}" fill="#6b737c" font-size="9.5" font-family="Archivo,system-ui,sans-serif">${fmtD(p[0].x)}</text><text x="${W-pd}" y="${H-7}" fill="#6b737c" font-size="9.5" text-anchor="end" font-family="Archivo,system-ui,sans-serif">${fmtD(p[p.length-1].x)}</text></svg>`}

/* ---- cardio ---- */
function cardioView(){
 const ws=weekDays(),k=dk();const today=todayActs().filter(a=>['cardio','wod'].includes(ACT[a].k));
 const wk=MODS.map(m=>{const c=Object.values(S.cardio).filter(x=>ws.includes(x.date)&&x.mod===m);return{m,min:c.reduce((a,x)=>a+num(x.min),0),km:c.reduce((a,x)=>a+num(x.km),0)}});const mx=Math.max(60,...wk.map(w=>w.min));
 return`<div class="panel" style="margin-top:12px"><div class="between"><h3>Zona alvo</h3><span class="small mut">definida pelo coach</span></div><div class="x" style="font-size:40px;font-weight:850;margin-top:6px">115–130 <span style="font-size:16px;color:var(--steel);font-weight:600">bpm</span></div><p class="small mut" style="margin:6px 0 0">Corrida, bike e natação nessa faixa contam como o cardio do dia. A intensidade alta da semana fica com o CrossFit.</p></div>
 ${runEntry()}
 ${today.length?`<div class="sec"><h3>Planejado para hoje</h3></div><div class="rows">${today.map(a=>actRow(a,k)).join('')}</div>`:''}
 <div class="sec"><h3>Começar agora</h3></div>
 <div class="rows">${MODS.map(m=>`<button class="row" onclick="startCardio('${m}')"><span class="sw" style="background:${m==='crossfit'?'var(--yel)':'var(--blue)'}"></span><div class="grow"><div class="t">${ACT[m].n}</div><div class="d">${ACT[m].alvo}</div></div><span class="chev"></span></button>`).join('')}<button class="row" onclick="cardioForm()"><span class="sw" style="background:var(--steel2)"></span><div class="grow"><div class="t">Lançar treino do Watch</div><div class="d">Digite tempo, distância e FC média do resumo</div></div><span class="chev"></span></button></div>
 <div class="sec"><h3>Esta semana</h3><button onclick="push('histCardio')">Histórico</button></div>
 <div class="panel">${wk.map(w=>`<div style="margin-bottom:12px"><div class="between small"><b>${ACT[w.m].n}</b><span class="mut n">${Math.round(w.min)} min${w.km?', '+(w.m==='natacao'?Math.round(w.km*1000)+' m':fmtKg(Math.round(w.km*10)/10)+' km'):''}</span></div><div class="bar" style="margin-top:6px"><i style="width:${w.min/mx*100}%;background:${w.m==='crossfit'?'var(--yel)':'var(--blue)'}"></i></div></div>`).join('')}</div>`}
let CR=null,crIv=null,CFM='z2';
const CR_TIP={z2:'Durante a execução, mantenha a frequência cardíaca entre 115 e 130 bpm, ajustando a intensidade para permanecer nessa faixa.',corrida:'Ritmo de conversa, FC até 135 bpm. Se estiver num plano de corrida, prefira o treino guiado do plano.',bike:'Cadência confortável e contínua, FC entre 115 e 130 bpm.',natacao:'Técnica primeiro: nado contínuo leve, com pausas curtas na borda se precisar.',crossfit:'Aqueça bem. Ao finalizar, anote o WOD, as cargas e o resultado.'};
function startCardio(m){const sv=lget('hardfit_cr');CR=sv&&sv.mod===m?sv:{mod:m,meta:ACT[m].min||45,start:null,pause:0,pAt:null,hit:false};lset('hardfit_cr',CR);$('#flow').classList.add('show');clearInterval(crIv);crIv=setInterval(crTick,250);crDraw()}
const crEl=()=>CR&&CR.start?((CR.pAt||Date.now())-CR.start-CR.pause)/1000:0;
function crDraw(){const A=ACT[CR.mod],m=CR.meta*60,e=crEl(),left=m-e;
 $('#flow').innerHTML=`<div class="fb"><div class="between" style="padding:6px 0 4px"><button class="ib" onclick="crClose()" aria-label="Voltar">${I.back}</button></div>
 <div class="small mut" style="margin-top:10px">${A.k==='wod'?'Box':'Cardio'}</div><h1>${A.n}</h1>
 <div style="text-align:center;margin-top:48px"><div class="x n" id="crbig" style="font-size:96px;font-weight:850;line-height:1;color:${left<0?'var(--grn)':'var(--chalk)'}">${left<0?'+'+mmss(-left):mmss(left)}</div><div class="small mut" id="crsub" style="margin-top:10px">${CR.start?(CR.pAt?'Pausado':left<0?'Meta batida, contando o extra':'Restante'):'Pronto para começar'}</div></div>
 <div class="bar" style="margin:28px 0 14px;height:8px"><i id="crbar" style="width:${Math.min(100,e/m*100)}%;background:${left<0?'var(--grn)':'var(--chalk)'}"></i></div>
 <div class="strip"><div><b class="n" id="cre">${mmss(e)}</b><span>decorrido</span></div><div><b class="n" id="crl">${mmss(Math.max(0,left))}</b><span>restante</span></div><div>${CR.start?`<b class="n">${mmss(m)}</b>`:`<div class="flex" style="justify-content:center;gap:6px"><button class="chip" style="padding:3px 10px" onclick="CR.meta=Math.max(5,CR.meta-5);crSave();crDraw()" aria-label="Menos 5 minutos">−</button><b class="n">${CR.meta}</b><button class="chip" style="padding:3px 10px" onclick="CR.meta+=5;crSave();crDraw()" aria-label="Mais 5 minutos">+</button></div>`}<span>meta${CR.start?'':' (min)'}</span></div></div>
 <div class="panel" style="margin-top:16px"><h3 style="font-size:14px;color:var(--steel)">Orientação do coach</h3><p style="margin:6px 0 0">${CR_TIP[CR.mod]||A.alvo}</p></div>
 <p class="tiny mut" style="text-align:center;margin-top:10px">No Watch, inicie ${A.hk} para gravar FC e distância.</p></div>
 <div class="ff">${CR.start?`<button class="btn ghost" style="width:auto;padding:15px 20px" onclick="crPause()">${CR.pAt?'Retomar':'Pausar'}</button><button class="btn" onclick="stopCardio()">Finalizar</button>`:`<button class="btn blue" onclick="CR.start=Date.now();crSave();crDraw()">${I.play} Iniciar sessão</button>`}</div>`}
function crSave(){lset('hardfit_cr',CR)}
function crTick(){if(!CR||!$('#flow.show')||!$('#crbig'))return;const m=CR.meta*60,e=crEl(),left=m-e;$('#crbig').textContent=left<0?'+'+mmss(-left):mmss(left);$('#cre').textContent=mmss(e);$('#crl').textContent=mmss(Math.max(0,left));const b=$('#crbar');b.style.width=Math.min(100,e/m*100)+'%';
 if(left<0&&!CR.hit&&CR.start&&!CR.pAt){CR.hit=true;crSave();beep();crDraw()}}
function crPause(){if(CR.pAt){CR.pause+=Date.now()-CR.pAt;CR.pAt=null}else CR.pAt=Date.now();crSave();crDraw()}
function crClose(){if(CR&&CR.start){ask('Sair sem salvar este cardio?',()=>{clearInterval(crIv);CR=null;lset('hardfit_cr',null);$('#flow').classList.remove('show')},'Sair sem salvar');return}clearInterval(crIv);CR=null;lset('hardfit_cr',null);$('#flow').classList.remove('show')}
function stopCardio(){clearInterval(crIv);const min=Math.max(1,Math.round(crEl()/60));const m=CR.mod;CR=null;lset('hardfit_cr',null);$('#flow').classList.remove('show');cardioForm(m,min)}
function cardioForm(m='z2',min='',keepRef){if(!keepRef)RUNREF=null;CFM=m;PSE.cardio=null;openSheet(`<h2>Registrar atividade</h2><div class="field" style="margin-top:14px"><label>Modalidade</label><div class="chips" id="cmods">${MODS.map(x=>`<button class="chip ${x===m?'on':''}" onclick="CFM='${x}';document.querySelectorAll('#cmods .chip').forEach(c=>c.classList.remove('on'));this.classList.add('on');$('#kml').textContent=CFM==='natacao'?'Distância (m)':'Distância (km)'">${ACT[x].n}</button>`).join('')}</div></div>
 <div class="g2"><div class="field"><label>Duração (min)</label><input id="c_min" inputmode="numeric" value="${min}"></div><div class="field"><label id="kml">${m==='natacao'?'Distância (m)':'Distância (km)'}</label><input id="c_km" inputmode="decimal"></div><div class="field"><label>FC média (bpm)</label><input id="c_fc" inputmode="numeric"></div><div class="field"><label>kcal ativas</label><input id="c_kcal" inputmode="numeric"></div></div>
 <div class="field"><label>Esforço (PSE 1–10)</label><div class="pse">${[...Array(10)].map((_,i)=>`<button onclick="pickPse('cardio',${i+1},this)">${i+1}</button>`).join('')}</div></div>
 ${RUNREF?`<div class="field"><label>Fez como planejado?</label><div class="seg" id="okseg">${[['sim','Sim'],['parcial','Em parte'],['nao','Não']].map(([v,l])=>`<button class="${RUNOK===v?'on':''}" onclick="RUNOK='${v}';document.querySelectorAll('#okseg button').forEach(b=>b.classList.remove('on'));this.classList.add('on')">${l}</button>`).join('')}</div></div>${RUNREF.k==='test'?`<div class="field"><label>Tempo nos 3 km (min:seg)</label><input id="c_test" inputmode="numeric" placeholder="14:30"></div>`:''}`:''}
 <div class="field"><label>Data</label><input id="c_date" type="date" value="${dk()}"></div><div class="field"><label>Notas (WOD, pace, sensação)</label><textarea id="c_n" rows="2"></textarea></div><button class="btn" onclick="saveCardio()">Salvar atividade</button>`)}
function saveCardio(){let km=num($('#c_km').value);if(CFM==='natacao'&&km)km=km/1000;const id=uid('C');const c={id,t:Date.now(),plan:RUNREF&&CFM==='corrida'?{...RUNREF,ok:RUNOK}:undefined,date:$('#c_date').value||dk(),mod:CFM,min:num($('#c_min').value),km,fc:num($('#c_fc').value),kcal:num($('#c_kcal').value),pse:PSE.cardio||null,notes:$('#c_n').value};if(!c.min){toast('Informe a duração');return}
 if(c.plan&&c.plan.k==='test'){const tt=parseTime(($('#c_test')||{}).value||'');if(tt){const v=Math.round(vdotOf(3000,tt)*10)/10;c.plan.vdot=v;const old=S.cfg.run.vdot;S.cfg.run.vdot=v;touch('cfg/main');setTimeout(()=>toast('Ritmos atualizados: VDOT '+fmtKg(old)+' → '+fmtKg(v)),300)}}
 S.cardio[id]=c;touch('cardio/'+id);closeSheet();const ref=RUNREF;RUNREF=null;render();
 if(ref&&(RUNOK==='nao'||(c.pse&&c.pse>=9&&ref.k==='Q'))){setTimeout(()=>ask('Esse treino ficou pesado demais. Repetir esta semana do plano antes de avançar?',()=>{S.cfg.run.offset=(S.cfg.run.offset||0)+1;touch('cfg/main');render();toast('Semana repetida')},'Repetir semana'),400);return}let m='Atividade salva';if(c.fc&&CFM!=='crossfit'){if(c.fc>135)m='Salva. FC média acima da zona alvo';else if(c.fc<110)m='Salva. FC média abaixo da zona alvo'}toast(m)}
V.histCardio=()=>{const weeks=[...Array(8)].map((_,i)=>{const r=new Date();r.setDate(r.getDate()-7*(7-i));const w=weekDays(r);return{x:w[0],y:Object.values(S.cardio).filter(c=>w.includes(c.date)&&c.mod!=='crossfit').reduce((a,c)=>a+num(c.min),0)}});const L=Object.values(S.cardio).sort(by('date')).reverse();
 return`${hdr('Cardio')}<div class="panel"><h3>Minutos de cardio por semana</h3>${lineChart(weeks)}</div>${L.length?`<div class="rows">${L.map(c=>`<div class="row"><span class="sw" style="background:${c.mod==='crossfit'?'var(--yel)':'var(--blue)'}"></span><div class="grow"><div class="t">${ACT[c.mod].n} <span class="mut small">${fmtD(c.date)}</span></div><div class="d">${c.min} min${c.km?', '+(c.mod==='natacao'?Math.round(c.km*1000)+' m':fmtKg(c.km)+' km'):''}${c.fc?', FC '+c.fc:''}${c.km&&c.mod==='corrida'?', pace '+pace(c.min,c.km):''}${c.notes?'. '+esc(c.notes):''}</div></div><button class="tiny mut" onclick="ask('Apagar este registro?',()=>{drop('cardio','${c.id}');render()},'Apagar')">apagar</button></div>`).join('')}</div>`:''}`};
const pace=(m,k)=>{const p=m/k;return Math.floor(p)+"'"+pad(Math.round(p%1*60))+'"/km'};

/* ===== PLANO DE CORRIDA ===== */
let RUNREF=null,RUNOK='sim',RG={goal:'10k',weeks:10,runs:3,dist:'5000',time:''};
function runEntry(){const r=runState();if(!r)return`<button class="panel" style="width:100%;text-align:left;margin-top:12px" onclick="push('corrida')"><div class="between"><h3>Plano de corrida</h3><span class="chev"></span></div><p class="small mut" style="margin:6px 0 0">Monte um plano de 5 km, 10 km ou meia maratona com ritmos calculados pelo seu tempo atual. Ele avança e se ajusta com os seus treinos.</p></button>`;
 const dn=r.plan[r.cw].sess.filter(s=>r.isDone(r.cw,s.id)).length;return`<button class="panel" style="width:100%;text-align:left;margin-top:12px" onclick="push('corrida')"><div class="between"><h3>Plano de ${RUN_GOALS[r.R.goal].n}</h3><span class="small mut">semana ${r.cw+1} de ${r.plan.length}</span></div><div class="bar" style="margin:12px 0 8px"><i style="width:${(r.cw+dn/r.plan[r.cw].sess.length)/r.plan.length*100}%;background:var(--grn)"></i></div><div class="small mut">${r.next?'Próxima: '+r.next.t:'Semana concluída'}</div></button>`}
V.corrida=()=>{const r=runState();if(!r)return runSetup();const{R,plan,cw,P}=r;const wk=plan[cw];
 return`${hdr('Plano de '+RUN_GOALS[R.goal].n)}
 <div class="panel"><div class="between"><span class="tag"><i style="background:var(--grn)"></i>${wk.phase}${wk.cut?', semana de alívio':''}</span><span class="small mut">Semana ${cw+1} de ${plan.length}</span></div>
 <div class="between" style="margin-top:14px;align-items:flex-end"><div><div class="small mut">Previsão de prova hoje</div><div class="x" style="font-size:34px;font-weight:850">${fmtTime(raceTime(R.vdot,RUN_GOALS[R.goal].m))}</div></div><div style="text-align:right"><div class="small mut">VDOT</div><b class="x" style="font-size:22px">${fmtKg(R.vdot)}</b></div></div></div>
 <div class="sec"><h3>Treinos desta semana</h3><span class="small mut">em qualquer dia</span></div>
 <div class="rows">${wk.sess.map(s=>{const d=r.isDone(cw,s.id);return`<button class="row" onclick="runSession(${cw},'${s.id}')"><span class="sw" style="background:${s.k==='E'||s.k==='L'?'var(--grn)':s.k==='Q'?'var(--yel)':'var(--red)'}"></span><div class="grow"><div class="t">${s.t}</div><div class="d">${s.k==='E'?'Leve':s.k==='L'?'Longão':s.k==='Q'?'Qualidade':'Teste'}${runMin(s)?', cerca de '+Math.round(runMin(s))+' min':''}</div></div>${d?'<span class="tag"><i style="background:var(--grn)"></i>Feito</span>':'<span class="chev"></span>'}</button>`}).join('')}</div>
 ${R.runs===3?`<p class="tiny mut" style="margin:-2px 0 0">Ordem sugerida: qualidade, leve, longão, com o CrossFit pesado longe da qualidade.</p>`:''}
 <div class="sec"><h3>Seus ritmos</h3><span class="small mut">min/km</span></div>
 <div class="rows">${Object.entries(P).map(([z,x])=>`<div class="row"><span class="sw" style="background:${x.c}"></span><div class="grow"><div class="t">${z} · ${x.n}</div><div class="d">${x.d}</div></div><b class="n">${paceTxt(P,z)}</b></div>`).join('')}</div>
 <div class="sec"><h3>Plano completo</h3></div>
 <div class="rows">${plan.map(w=>{const dn=w.sess.filter(s=>r.isDone(w.w,s.id)).length;return`<button class="row" onclick="push('corridaSem',${w.w})"><div class="ib" style="width:34px;height:34px;font-weight:800;${w.w===cw?'background:var(--chalk);color:#141518':''}">${w.w+1}</div><div class="grow"><div class="t">${w.phase}${w.cut?' · alívio':''}</div><div class="d">${w.sess.map(s=>s.t).join(', ')}</div></div><span class="small mut n">${dn}/${w.sess.length}</span></button>`}).join('')}</div>
 <div class="rows" style="margin-top:14px"><button class="row" onclick="runUpdate()"><div class="grow"><div class="t">Atualizar ritmos com um tempo recente</div></div><span class="chev"></span></button><button class="row" onclick="ask('Repetir a semana atual antes de avançar?',()=>{S.cfg.run.offset=(S.cfg.run.offset||0)+1;touch('cfg/main');render()},'Repetir')"><div class="grow"><div class="t">Repetir esta semana</div></div><span class="chev"></span></button><button class="row" onclick="ask('Encerrar este plano? Os treinos já registrados continuam no histórico.',()=>{S.cfg.run=null;touch('cfg/main');render()},'Encerrar')"><div class="grow"><div class="t" style="color:var(--red)">Encerrar plano</div></div></button></div>`};
V.corridaSem=w=>{const r=runState();const W=r.plan[w];return`${hdr('Semana '+(w+1))}<p class="small mut" style="margin-top:-6px">${W.phase}${W.cut?', semana de alívio (volume 25% menor)':''}</p><div class="rows">${W.sess.map(s=>`<button class="row" onclick="runSession(${w},'${s.id}')"><div class="grow"><div class="t">${s.t}</div><div class="d">${s.steps.filter(x=>x.z!=='rec').map(x=>x.l.replace(/ \d+\/\d+$/,'')).filter((v,i,a)=>a.indexOf(v)===i).join(', ')}</div></div>${r.isDone(w,s.id)?'<span class="tag"><i style="background:var(--grn)"></i>Feito</span>':'<span class="chev"></span>'}</button>`).join('')}</div>`};
function runSetup(){const G=RUN_GOALS[RG.goal];if(!G.weeks.includes(RG.weeks))RG.weeks=G.weeks[0];
 return`${hdr('Plano de corrida')}<p class="small" style="margin-top:-6px">Ritmos pelo método de Jack Daniels, 80% do volume leve (Seiler e Fitzgerald), base antes da velocidade (Lydiard) e semana de alívio a cada 4 (Pfitzinger). Feito para quem também faz CrossFit.</p>
 <div class="field" style="margin-top:16px"><label>Objetivo</label><div class="chips">${Object.entries(RUN_GOALS).map(([k,g])=>`<button class="chip ${RG.goal===k?'on':''}" onclick="RG.goal='${k}';render()">${g.n}</button>`).join('')}</div></div>
 <div class="field"><label>Duração</label><div class="chips">${G.weeks.map(n=>`<button class="chip ${RG.weeks===n?'on':''}" onclick="RG.weeks=${n};render()">${n} semanas</button>`).join('')}</div></div>
 <div class="field"><label>Corridas por semana</label><div class="seg">${[2,3].map(n=>`<button class="${RG.runs===n?'on':''}" onclick="RG.runs=${n};render()">${n} corridas</button>`).join('')}</div></div>
 <div class="field"><label>Seu tempo mais recente (para calcular os ritmos)</label><div class="g2"><select id="rg_d" onchange="RG.dist=this.value">${[['3000','3 km'],['5000','5 km'],['10000','10 km'],['21097.5','21 km']].map(([v,l])=>`<option value="${v}" ${RG.dist===v?'selected':''}>${l}</option>`).join('')}</select><input id="rg_t" inputmode="numeric" placeholder="min:seg, ex. 28:30" value="${esc(RG.time)}" oninput="RG.time=this.value"></div><p class="tiny mut" style="margin:6px 0 0">Não tem um tempo? Deixe em branco: o plano começa num ritmo conservador e o teste de 3 km da semana 4 acerta tudo.</p></div>
 <button class="btn" onclick="createRun()">Criar plano</button>`}
function createRun(){const t=parseTime(RG.time);const d=num(RG.dist);let vd=t?vdotOf(d,t):33;if(t&&(vd<20||vd>85)){toast('Confira o tempo digitado');return}vd=Math.round(vd*10)/10;
 S.cfg.run={id:uid('G'),goal:RG.goal,weeks:RG.weeks,runs:RG.runs,vdot:vd,start:dk(),offset:0};touch('cfg/main');render();toast('Plano criado: '+RG.weeks+' semanas')}
function runUpdate(){openSheet(`<h2>Atualizar ritmos</h2><p class="small mut">Use uma prova ou treino forte das últimas semanas.</p><div class="g2" style="margin-top:12px"><select id="ru_d">${[['3000','3 km'],['5000','5 km'],['10000','10 km'],['21097.5','21 km']].map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select><input id="ru_t" inputmode="numeric" placeholder="min:seg"></div><button class="btn" style="margin-top:12px" onclick="const t=parseTime($('#ru_t').value);if(!t){toast('Digite o tempo');return}const v=Math.round(vdotOf(num($('#ru_d').value),t)*10)/10;S.cfg.run.vdot=v;touch('cfg/main');closeSheet();render();toast('VDOT '+fmtKg(v))">Recalcular</button>`)}
function runSession(w,id){const r=runState();const s=r.plan[w].sess.find(x=>x.id===id);const P=r.P;const rd=readiness(dk());
 openSheet(`<div class="small mut">Semana ${w+1}, ${r.plan[w].phase}</div><h2>${s.t}</h2>${s.note?`<p class="small" style="margin:8px 0 0">${s.note}</p>`:''}${s.k==='Q'&&rd&&rd.score<50?`<div class="hint"><span class="sw" style="background:var(--red)"></span><div>Prontidão ${rd.score} hoje. Troque por 30 min leves e faça este treino em outro dia.</div></div>`:''}
 <div class="rows" style="margin-top:14px">${s.steps.map(x=>`<div class="row" style="padding:11px 14px"><span class="sw" style="background:${x.z==='rec'?'var(--steel2)':x.z==='race'||x.z==='test'?'var(--red)':P[x.z].c}"></span><div class="grow"><div class="t" style="font-weight:600">${x.l}</div><div class="d">${x.z==='race'||x.z==='test'?'Ritmo máximo sustentável':x.z==='rec'?'Trote ou caminhada':P[x.z].n+', '+paceTxt(P,x.z)+' /km'}</div></div><b class="n small">${x.min?fmtTime(x.min):'—'}</b></div>`).join('')}</div>
 <div class="g2" style="margin-top:12px"><button class="btn ghost" onclick="closeSheet();RUNREF={g:S.cfg.run.id,w:${w},s:'${id}',k:'${s.k}'};RUNOK='sim';cardioForm('corrida','',true)">Já fiz, registrar</button><button class="btn" onclick="closeSheet();startGuided(${w},'${id}')">Começar guiado</button></div>
 <p class="tiny mut" style="margin-top:10px">No Watch: inicie Corrida ao Ar Livre para gravar distância e FC. O guiado aqui avisa com som cada troca de ritmo.</p>`)}
/* corrida guiada: cronômetro por etapa, com aviso sonoro */
let GD=null,gdIv=null;
function startGuided(w,id){const r=runState();const s=r.plan[w].sess.find(x=>x.id===id);GD={w,id,s,P:r.P,i:0,t0:Date.now(),st0:Date.now(),pause:0,pAt:null};$('#flow').classList.add('show');clearInterval(gdIv);gdIv=setInterval(gdTick,250);gdDraw()}
function gdDraw(){const x=GD.s.steps[GD.i],nx=GD.s.steps[GD.i+1];const P=GD.P;const col=x.z==='rec'?'var(--steel2)':x.z==='race'||x.z==='test'?'var(--red)':P[x.z].c;
 $('#flow').innerHTML=`<div class="fb"><div class="between" style="padding:6px 0 10px"><button class="ib" onclick="gdEnd(true)" aria-label="Fechar">${I.x}</button><span class="small mut">Etapa ${GD.i+1} de ${GD.s.steps.length}</span><span class="clock n" id="gdtot">0:00</span></div>
 <div class="steps">${GD.s.steps.map((_,j)=>`<i class="${j<=GD.i?'on':''}"></i>`).join('')}</div>
 <div style="text-align:center;margin-top:30px"><span class="tag"><i style="background:${col}"></i>${x.z==='rec'?'Recuperação':x.z==='race'||x.z==='test'?'Forte':P[x.z].n}</span><h1 style="margin-top:14px">${x.l}</h1><div class="lead">${x.z==='race'||x.z==='test'?'Ritmo máximo sustentável':x.z==='rec'?'Trote ou caminhada':paceTxt(P,x.z)+' min/km'}</div>
 <div class="x n" id="gdt" style="font-size:84px;font-weight:850;margin:26px 0 6px;color:${col}">${x.min?fmtTime(x.min):'0:00'}</div><div class="small mut">${x.min?'restante nesta etapa':'cronômetro'}</div>
 ${nx?`<p class="small mut" style="margin-top:28px">Depois: ${nx.l}${nx.min?', '+fmtTime(nx.min):''}</p>`:''}</div></div>
 <div class="ff"><button class="btn ghost" style="width:auto;padding:15px 18px" onclick="gdPause()" id="gdp">${GD.pAt?'Retomar':'Pausar'}</button><button class="btn" onclick="gdNext()">${nx?(x.min?'Pular etapa':'Concluí esta etapa'):'Terminar'}</button></div>`}
function gdTick(){if(!GD||GD.pAt)return;const x=GD.s.steps[GD.i];const el=(Date.now()-GD.st0)/6e4;const tot=$('#gdtot');if(tot)tot.textContent=fmtTime((Date.now()-GD.t0-GD.pause)/6e4);const e=$('#gdt');
 if(x.min){const left=x.min-el;if(e)e.textContent=fmtTime(Math.max(0,left));if(left<=0){beep();gdNext()}}else if(e)e.textContent=fmtTime(el)}
function gdPause(){if(GD.pAt){const d=Date.now()-GD.pAt;GD.st0+=d;GD.pause+=d;GD.pAt=null}else GD.pAt=Date.now();gdDraw()}
function gdNext(){if(GD.i<GD.s.steps.length-1){GD.i++;GD.st0=Date.now();beep();gdDraw()}else gdEnd()}
function gdEnd(cancel){clearInterval(gdIv);const g=GD;GD=null;$('#flow').classList.remove('show');if(cancel||!g)return;const min=Math.max(1,Math.round((Date.now()-g.t0-g.pause)/6e4));RUNREF={g:S.cfg.run.id,w:g.w,s:g.id,k:g.s.k};RUNOK='sim';cardioForm('corrida',min,true)}

/* ===== COACH (IA) ===== */
V.coach=()=>{
 const rep=Object.values(S.reports).sort(by('t')).pop();const ex=Object.values(S.exams).sort(by('t')).pop();
 return`<h1 style="margin-top:8px">Coach</h1><p class="lead">Leitura dos seus dados, exames e fotos por IA, com o mesmo método do treino.</p>
 ${aiOn()?'':`<div class="panel" style="margin-top:16px"><h3>${SB.on?'Sem internet agora':'Ative a sincronização para usar a IA'}</h3><p class="small mut" style="margin:6px 0 0">${SB.on?'A IA volta assim que o celular pegar sinal. Os registros continuam sendo salvos.':'Em Você, Conta e sincronização, crie seu acesso. Treino, cardio e dieta funcionam sem isso.'}</p>${SB.on?'':`<button class="btn sm blue" style="margin-top:12px" onclick="push('conta')">Criar acesso</button>`}</div>`}
 <div class="rows" style="margin-top:16px">
  <button class="row" onclick="push('report')"><span class="sw" style="background:var(--chalk)"></span><div class="grow"><div class="t">Relatório da semana</div><div class="d">${rep?'Último em '+fmtD(dk(new Date(rep.t))):'Como você se sentiu, dores, cargas, cardio e dieta'}</div></div><span class="chev"></span></button>
  <button class="row" onclick="push('chat')"><span class="sw" style="background:var(--blue)"></span><div class="grow"><div class="t">Conversar com o coach</div><div class="d">Pergunte sobre treino, dor, dieta ou ajuste da semana</div></div><span class="chev"></span></button>
 </div>
 <div class="sec"><h3>Enviar para análise</h3></div>
 <div class="rows">
  <button class="row" onclick="push('exames')"><span class="sw" style="background:var(--red)"></span><div class="grow"><div class="t">Exames</div><div class="d">${ex?'Último: '+esc(ex.r&&ex.r.tipo||'exame')+', '+fmtD(ex.date):'Foto ou PDF. A IA lê, traduz e marca o que está fora da faixa'}</div></div><span class="chev"></span></button>
  <button class="row" onclick="push('fotos')"><span class="sw" style="background:var(--yel)"></span><div class="grow"><div class="t">Fotos de progresso</div><div class="d">${Object.keys(S.photos).length} fotos. Comparação com a anterior na mesma pose</div></div><span class="chev"></span></button>
  <button class="row" onclick="push('tecnica')"><span class="sw" style="background:var(--grn)"></span><div class="grow"><div class="t">Técnica por vídeo</div><div class="d">${Object.keys(S.tech).length} análises. Filme a série e receba correções</div></div><span class="chev"></span></button>
 </div>
 <div class="rows" style="margin-top:20px"><button class="row" onclick="push('metodo')"><div class="grow"><div class="t">Como o app decide</div><div class="d">Prontidão, progressão de carga, zonas e carga semanal</div></div><span class="chev"></span></button></div>`};
function streamInto(sel){return({text})=>{const e=$(sel);if(e)e.innerHTML=md(text)}}

V.report=()=>{const R=Object.values(S.reports).sort(by('t')).reverse();const cur=R[0];
 return`${hdr('Relatório da semana')}<p class="small mut" style="margin-top:-6px">Junta check-ins, mapa de dor, sessões, cargas, cardio, dieta, água e dados do Saúde dos últimos 14 dias.</p>
 <button class="btn" style="margin:14px 0" onclick="genReport()" ${aiOn()?'':'disabled'}>Gerar relatório agora</button>
 <div id="repout" class="panel md ai" style="${cur?'':'display:none'}">${cur?`<p class="tiny mut">${fmtD(dk(new Date(cur.t)))}</p>`+md(cur.text):''}</div>
 ${R.length>1?`<div class="sec"><h3>Anteriores</h3></div><div class="rows">${R.slice(1).map(r=>`<button class="row" onclick="showReport('${r.id}')"><div class="grow">${fmtD(dk(new Date(r.t)))}</div><span class="chev"></span></button>`).join('')}</div>`:''}`};
function showReport(id){openSheet('<div class="md">'+md(S.reports[id].text)+'</div>')}
async function genReport(){const o=$('#repout');o.style.display='';o.innerHTML='<span class="spin"></span> Analisando duas semanas de dados…';
 try{const t=await aiReport(streamInto('#repout'));const id=uid('R');S.reports[id]={id,t:Date.now(),text:t};touch('reports/'+id)}catch(e){o.innerHTML=`<p class="mut">${aiErr(e)}</p>`}}

V.chat=()=>{const M=S.chat.msgs||[];after.push(()=>{const e=$('#chatend');e&&e.scrollIntoView()});
 return`${hdr('Coach')}<div id="chatlog">${M.length?M.map(m=>`<div class="bubble ${m.r==='u'?'me':'co'}">${m.r==='u'?esc(m.t):md(m.t)}</div>`).join(''):`<p class="small mut">Exemplos: “Meu joelho incomodou no agachamento, o que faço no treino C?” · “Como encaixo natação sem atrapalhar o CrossFit?” · “Posso trocar o jantar por macarrão?”</p>`}<div id="chatlive"></div><div id="chatend"></div></div>
 <div class="flex" style="position:sticky;bottom:calc(76px + var(--sb));background:var(--floor);padding:10px 0;margin-top:8px"><input id="chatin" placeholder="Pergunte ao coach" onkeydown="if(event.key==='Enter')sendChat()"><button class="btn sm" onclick="sendChat()" ${aiOn()?'':'disabled'}>Enviar</button></div>
 ${M.length?`<button class="txtbtn" onclick="ask('Apagar a conversa?',()=>{S.chat.msgs=[];touch('chat/main');render()},'Apagar')">Limpar conversa</button>`:''}`};
async function sendChat(){const i=$('#chatin');const t=i.value.trim();if(!t)return;i.value='';S.chat.msgs=S.chat.msgs||[];S.chat.msgs.push({r:'u',t});render();
 const live=$('#chatlive');live.innerHTML='<div class="bubble co" id="cb"><span class="spin"></span></div>';$('#chatend').scrollIntoView();
 try{const a=await aiChat(t,({text})=>{const b=$('#cb');if(b)b.innerHTML=md(text)});S.chat.msgs.push({r:'c',t:a});S.chat.msgs=S.chat.msgs.slice(-60);touch('chat/main');render()}
 catch(e){S.chat.msgs.pop();touch('chat/main');const b=$('#cb');if(b)b.innerHTML=aiErr(e)}}

/* ---- exames ---- */
V.exames=()=>{const X=Object.values(S.exams).sort(by('t')).reverse();
 return`${hdr('Exames')}<label class="drop" ${aiOn()?'':'style="opacity:.5;pointer-events:none"'}><b>Enviar exame</b>Foto do papel, print ou PDF do laboratório. Pode mandar várias páginas juntas.<input type="file" accept="image/*,application/pdf" multiple style="display:none" onchange="handleExam(this.files)"></label>
 <div id="exout"></div>
 ${X.length?`<div class="sec"><h3>Enviados</h3></div><div class="rows">${X.map(x=>{const n=(x.r.itens||[]).filter(i=>i.status&&!/normal|sem ref/i.test(i.status)).length;return`<button class="row" onclick="push('exame','${x.id}')"><span class="sw" style="background:${n?'var(--yel)':'var(--grn)'}"></span><div class="grow"><div class="t">${esc(x.r.tipo||'Exame')}</div><div class="d">${x.r.data_coleta?fmtD(x.r.data_coleta)+', ':''}${(x.r.itens||[]).length} itens${n?', '+n+' para acompanhar':', todos na faixa'}</div></div><span class="chev"></span></button>`}).join('')}</div>`:''}
 <p class="tiny mut" style="margin-top:16px">A leitura é uma tradução do laudo para linguagem simples, não um diagnóstico. Leve as perguntas sugeridas ao seu médico.</p>`};
async function handleExam(files){files=[...files];if(!files.length)return;const o=$('#exout');const step=t=>o.innerHTML=`<div class="panel small"><span class="spin"></span> ${t}</div>`;
 try{const{r,imgs}=await aiExam(files,step);step('Guardando o arquivo…');const ids=[];for(const b of imgs){try{ids.push((await uploadAsset(b)).id)}catch(e){}}
  const id=uid('X');S.exams[id]={id,t:Date.now(),date:r.data_coleta&&/^\d{4}-\d{2}-\d{2}$/.test(r.data_coleta)?r.data_coleta:dk(),r,pages:ids};touch('exams/'+id);push('exame',id)}
 catch(e){o.innerHTML=`<div class="panel small">${e&&e.code?aiErr(e):esc(e&&e.message||'Não foi possível ler o arquivo.')}</div>`}}
const STC=s=>/alto/i.test(s)?'var(--red)':/baixo/i.test(s)?'var(--blue)':/lim/i.test(s)?'var(--yel)':/normal/i.test(s)?'var(--grn)':'var(--steel2)';
V.exame=id=>{const x=S.exams[id];if(!x)return hdr('Exame');const r=x.r;
 return`${hdr(esc(r.tipo||'Exame'))}<p class="small mut" style="margin-top:-6px">${r.data_coleta?'Coleta em '+fmtD(r.data_coleta):'Enviado em '+fmtD(x.date)}${r.laboratorio?', '+esc(r.laboratorio):''}</p>
 <div class="panel ai" style="margin-top:12px"><p style="margin:0">${esc(r.resumo||'')}</p></div>
 ${(r.atencao||[]).length?`<div class="sec"><h3>Para acompanhar</h3></div><div class="panel"><ul style="margin:0;padding-left:18px">${r.atencao.map(a=>`<li>${esc(a)}</li>`).join('')}</ul></div>`:''}
 <div class="sec"><h3>Valores</h3><span class="small mut">${(r.itens||[]).length} itens</span></div>
 <div class="panel" style="padding:6px 14px"><table class="lab">${(r.itens||[]).map(i=>`<tr><td><span class="sw" style="background:${STC(i.status)};margin-right:8px"></span><b>${esc(i.nome)}</b><div class="tiny mut" style="margin:3px 0 0 18px">${esc(i.explicacao||'')}${i.referencia?' Referência: '+esc(i.referencia)+'.':''}</div></td><td class="v">${esc(i.valor)} <span class="tiny mut">${esc(i.unidade||'')}</span><div class="tiny" style="color:${STC(i.status)};font-weight:600">${esc(i.status||'')}</div></td></tr>`).join('')}</table></div>
 ${r.treino_e_dieta?`<div class="sec"><h3>Treino e dieta</h3></div><div class="panel"><p style="margin:0">${esc(r.treino_e_dieta)}</p></div>`:''}
 ${(r.perguntar_ao_medico||[]).length?`<div class="sec"><h3>Perguntas para o médico</h3></div><div class="panel"><ul style="margin:0;padding-left:18px">${r.perguntar_ao_medico.map(a=>`<li>${esc(a)}</li>`).join('')}</ul></div>`:''}
 ${(x.pages||[]).length?`<div class="sec"><h3>Arquivo</h3></div><div class="thumbs">${x.pages.map(p=>`<a ${assetAttr(p,'href')} target="_blank" rel="noopener"><img ${assetAttr(p)} alt="Página do exame"></a>`).join('')}</div>`:''}
 <button class="txtbtn" style="margin-top:16px;color:var(--red)" onclick="ask('Apagar este exame?',()=>{drop('exams','${id}');pop()},'Apagar')">Apagar exame</button>`};

/* ---- fotos de progresso ---- */
let POSE='Frente';
V.fotos=()=>{const P=Object.values(S.photos).sort(by('t')).reverse();
 return`${hdr('Fotos de progresso')}<div class="seg">${['Frente','Lado','Costas'].map(p=>`<button class="${POSE===p?'on':''}" onclick="POSE='${p}';render()">${p}</button>`).join('')}</div>
 <label class="drop" style="margin-top:12px;${DB.assets?'':'opacity:.5;pointer-events:none'}">${I.cam}<b>Nova foto: ${POSE.toLowerCase()}</b>Mesmo lugar, mesma luz, de manhã e em jejum. A IA compara com a última foto desta pose.<input type="file" accept="image/*" style="display:none" onchange="handlePhoto(this.files[0])"></label>
 <div id="phout"></div>
 ${P.length?`<div class="sec"><h3>Linha do tempo</h3></div><div class="thumbs">${P.map(p=>`<button onclick="push('foto','${p.id}')" style="text-align:left"><img ${assetAttr(p.asset)} alt="Foto ${esc(p.pose)} ${fmtD(p.date)}" loading="lazy"><div class="tiny mut" style="margin-top:4px">${fmtD(p.date)}, ${esc(p.pose.toLowerCase())}</div></button>`).join('')}</div>`:''}`};
async function handlePhoto(f){if(!f)return;const o=$('#phout');o.innerHTML='<div class="panel small"><span class="spin"></span> Enviando foto…</div>';
 try{const blob=await shrink(await fileToImg(f),1600);const a=await uploadAsset(blob);const prev=Object.values(S.photos).filter(p=>p.pose===POSE).sort(by('t')).pop();
  const id=uid('P');const rec={id,t:Date.now(),date:dk(),pose:POSE,asset:a.id,ai:''};S.photos[id]=rec;touch('photos/'+id);
  if(aiOn()){o.innerHTML='<div class="panel md ai" id="phai"><span class="spin"></span> Avaliando…</div>';let pb=null;if(prev){try{pb=await assetBlob(prev.asset)}catch(e){}}
   rec.ai=await aiPhoto(blob,POSE,pb,streamInto('#phai'));rec.vs=prev?prev.id:null;touch('photos/'+id)}
  push('foto',id)}catch(e){o.innerHTML=`<div class="panel small">${e&&e.code?aiErr(e):esc(e&&e.message||'Falha ao enviar a foto.')}</div>`}}
V.foto=id=>{const p=S.photos[id];if(!p)return hdr('Foto');const v=p.vs&&S.photos[p.vs];
 return`${hdr(p.pose+', '+fmtD(p.date))}<div class="${v?'g2':''}">${v?`<div><img class="media" ${assetAttr(v.asset)} alt="Foto anterior"><div class="tiny mut" style="margin-top:4px">${fmtD(v.date)}</div></div>`:''}<div><img class="media" ${assetAttr(p.asset)} alt="Foto de ${fmtD(p.date)}">${v?`<div class="tiny mut" style="margin-top:4px">${fmtD(p.date)}</div>`:''}</div></div>
 ${p.ai?`<div class="panel md ai" style="margin-top:12px">${md(p.ai)}</div>`:''}<button class="txtbtn" style="margin-top:14px;color:var(--red)" onclick="ask('Apagar esta foto?',()=>{drop('photos','${id}');pop()},'Apagar')">Apagar foto</button>`};

/* ---- técnica por vídeo ---- */
let TEX='agach';
V.tecnica=(ex)=>{if(ex)TEX=ex;const T=Object.values(S.tech).filter(t=>!ex||t.ex===ex).sort(by('t')).reverse();
 return`${hdr('Técnica por vídeo')}<select onchange="TEX=this.value">${Object.entries(EX).map(([k,e])=>`<option value="${k}" ${k===TEX?'selected':''}>${e.n}</option>`).join('')}</select>
 <label class="drop" style="margin-top:12px;${aiOn()?'':'opacity:.5;pointer-events:none'}">${I.cam}<b>Enviar vídeo da série</b>Celular apoiado, corpo inteiro no quadro, de lado para agachamento e terra, de frente para supino e desenvolvimento. Até 30 s.<input type="file" accept="video/*" style="display:none" onchange="handleTech(this.files[0])"></label>
 <div id="tout"></div>
 ${T.length?`<div class="sec"><h3>Análises</h3></div>${T.map(t=>`<div class="panel"><div class="between"><h3>${EX[t.ex].n}</h3><span class="small mut">${fmtD(t.date)}</span></div>${t.video?`<video class="media" style="margin-top:10px;max-height:360px" ${assetAttr(t.video)} controls playsinline preload="metadata"></video>`:''}<div class="md ai" style="margin-top:10px">${md(t.ai)}</div><button class="tiny mut" style="margin-top:8px" onclick="ask('Apagar esta análise?',()=>{drop('tech','${t.id}');render()},'Apagar')">apagar</button></div>`).join('')}`:''}`};
async function handleTech(f){if(!f)return;const o=$('#tout');o.innerHTML='<div class="panel small"><span class="spin"></span> Separando quadros do vídeo…</div>';
 try{const fr=await videoFrames(f,6);let vid=null;if(f.size<=20*1024*1024){o.innerHTML='<div class="panel small"><span class="spin"></span> Guardando vídeo…</div>';try{vid=(await uploadAsset(f)).id}catch(e){}}
  o.innerHTML='<div class="panel md ai" id="tai"><span class="spin"></span> Analisando técnica…</div>';
  const t=await aiTech(fr,EX[TEX].n,streamInto('#tai'));const id=uid('T');S.tech[id]={id,t:Date.now(),date:dk(),ex:TEX,video:vid,ai:t};touch('tech/'+id);
  if(!vid&&f.size>20*1024*1024)toast('Vídeo acima de 20 MB: analisei, mas não guardei o arquivo');render()}
 catch(e){o.innerHTML=`<div class="panel small">${e&&e.code?aiErr(e):esc(e&&e.message||'Não consegui ler o vídeo.')}</div>`}}

/* ---- método ---- */
V.metodo=()=>`${hdr('Como o app decide')}
 <div class="panel"><h3>1. Prontidão do dia</h3><p class="small" style="margin:8px 0 0">Média das 5 escalas do check-in (fadiga, sono, dor, estresse, humor) convertida para 0 a 100. Cada ponto de dor desconta (leve 4, moderada 8, forte 14, até 30). FC de repouso 5 bpm acima da sua média dos 7 dias anteriores desconta mais 10. Acima de 70 treina normal; de 50 a 69 faz 2 work sets e para em PSE 7; abaixo de 50 é recuperação.</p></div>
 <div class="panel"><h3>2. Séries tipadas</h3><p class="small" style="margin:8px 0 0">Como no protocolo do coach: <span class="pl" style="background:var(--yel)"></span>aquecimento 10–15 reps, <span class="pl" style="background:var(--blue)"></span>feeder 8–12, <span class="pl" style="background:var(--red)"></span>3 work sets 6–10 com 180 s de descanso. As cores seguem as anilhas olímpicas.</p></div>
 <div class="panel"><h3>3. Dupla progressão</h3><p class="small" style="margin:8px 0 0">Se os 3 work sets chegaram a 10 reps com PSE até 8, a carga sobe um degrau (2,5 kg em máquina e barra, 1 kg em halter). Se alguma série caiu abaixo de 6, a carga desce. No meio, mantém e busca +1 rep.</p></div>
 <div class="panel"><h3>4. Carga semanal</h3><p class="small" style="margin:8px 0 0">Cada treino vira unidades de carga: minutos × PSE (sRPE, método de Foster). A soma dos últimos 7 dias dividida pela média semanal dos últimos 28 dá a razão aguda:crônica. Entre 0,8 e 1,3 é a faixa segura; acima de 1,5 o risco de lesão sobe.</p></div>
 <div class="panel"><h3>5. Cardio polarizado</h3><p class="small" style="margin:8px 0 0">O CrossFit já é a parte intensa da semana. Corrida, bike e natação ficam em zona 2 (115–130 bpm), que melhora a base aeróbia sem roubar recuperação.</p></div>
 <div class="panel"><h3>6. Plano de corrida</h3><p class="small" style="margin:8px 0 0">Seu tempo recente vira um VDOT (Jack Daniels), que define 5 ritmos: leve, maratona, limiar, intervalado e repetição. O plano começa com base aeróbia e acelerações (Lydiard), passa para limiar e intervalado, termina com treino específico da prova e polimento. Cerca de 80% do tempo é leve (Seiler, Fitzgerald). A cada 4 semanas o volume cai 25% e há um teste de 3 km que recalcula os ritmos. Treino que não saiu ou ficou com esforço 9 ou 10 oferece repetir a semana.</p></div>
 <div class="panel"><h3>7. Nutrição</h3><p class="small" style="margin:8px 0 0">A dieta escrita do protocolo, marcada por refeição. Dia de dieta conta quando 3 das 4 refeições principais foram feitas. Água: mínimo de 5 L.</p></div>
 <div class="panel"><h3>8. IA como coach</h3><p class="small" style="margin:8px 0 0">O Claude lê os últimos 14 dias de check-ins, mapa de dor, cargas, cardio, dieta e dados do Saúde e devolve leitura diária, relatório semanal, tradução de exames, avaliação de fotos e correção de técnica. Não faz diagnóstico: dor forte ou exame alterado vai para médico ou fisioterapeuta.</p></div>`;

/* ===== DIETA ===== */
let DK=null;
V.dieta=()=>{const k=DK||dk();const D=S.days[k]||{};const m=D.meals||{};const done=dietDone(k);
 const l7=lastDays(7).map(x=>dietDone(x));
 return`<h1 style="margin-top:8px">${DIET.title}</h1><p class="lead">Prescrição contínua de ${DIET.start} a ${DIET.end}</p>
 <div class="between" style="margin:16px 0 12px"><button class="ib" onclick="shiftDay(-1)" aria-label="Dia anterior">${I.back}</button><b>${k===dk()?'Hoje':DOW[parseDk(k).getDay()]+', '+fmtD(k)}</b><button class="ib" onclick="shiftDay(1)" aria-label="Próximo dia" style="transform:scaleX(-1)">${I.back}</button></div>
 <div class="g2"><div class="panel" style="margin:0"><div class="between"><h3>Adesão</h3><span class="n small mut">${done}/4</span></div><div class="flex" style="gap:5px;margin-top:12px;align-items:flex-end;height:34px">${l7.map(v=>`<i style="flex:1;border-radius:4px;height:${6+v*7}px;background:${v>=3?'var(--grn)':v?'var(--yel)':'var(--s3)'}"></i>`).join('')}</div></div>
 <div class="panel" style="margin:0"><div class="between"><h3>Água</h3><span class="n small mut">${fmtKg((D.water||0)/1000)} L</span></div><div class="flex" style="gap:6px;margin-top:14px;flex-wrap:wrap"><button class="chip" onclick="addWater(500,'${k}')">+500 ml</button><button class="chip" onclick="waterSheet('${k}')">Outro valor</button></div></div></div>
 <div class="sec"><h3>Refeições</h3></div>
 ${DIET.meals.map((ml,i)=>{const on=m[i];const op=m['o'+i]||0;const o=ml.opts[Math.min(op,ml.opts.length-1)];return`<div class="panel"><div class="between"><div><h3>${ml.n}</h3><div class="small mut">${ml.h}${ml.opt?', opcional':''}</div></div><button onclick="toggleMeal('${k}',${i})" aria-label="Marcar refeição" style="width:34px;height:34px;border-radius:10px;border:2px solid ${on?'var(--grn)':'var(--line2)'};background:${on?'var(--grn)':'none'};display:grid;place-items:center">${on?'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#141518" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>':''}</button></div>
 ${ml.opts.length>1?`<div class="seg" style="margin-top:12px">${ml.opts.map((x,j)=>`<button class="${op===j?'on':''}" onclick="setOpt('${k}',${i},${j})">${x.n}</button>`).join('')}</div>`:''}
 <ul style="margin:12px 0 0;padding-left:18px;font-size:14.5px;line-height:1.6">${o.i.map(x=>`<li>${x.split(' || ').map(esc).join(' <span style="color:var(--blue);font-weight:700">ou</span> ')}</li>`).join('')}</ul></div>`}).join('')}
 <div class="rows"><button class="row" onclick="push('compras')"><div class="grow"><div class="t">Lista de compras</div><div class="d">Tudo que a dieta usa, por grupo</div></div><span class="chev"></span></button></div>`};
function shiftDay(n){const d=parseDk(DK||dk());d.setDate(d.getDate()+n);if(d>new Date())return;DK=dk(d);render()}
function toggleMeal(k,i){const d=day(k);d.wt=Date.now();d.meals=d.meals||{};d.meals[i]=!d.meals[i];touch('days/'+k);render()}
function setOpt(k,i,j){const d=day(k);d.meals=d.meals||{};d.meals['o'+i]=j;touch('days/'+k);render()}
V.compras=()=>`${hdr('Lista de compras')}${Object.entries(SHOP).map(([g,its])=>`<div class="sec"><h3>${g}</h3></div><div class="rows">${its.map(x=>`<button class="row" onclick="S.cfg.shop['${x}']=!S.cfg.shop['${x}'];touch('cfg/main');render()"><span style="width:22px;height:22px;border-radius:7px;border:2px solid ${S.cfg.shop[x]?'var(--grn)':'var(--line2)'};background:${S.cfg.shop[x]?'var(--grn)':'none'};flex:none"></span><div class="grow" style="${S.cfg.shop[x]?'text-decoration:line-through;color:var(--steel2)':''}">${x}</div></button>`).join('')}</div>`).join('')}<button class="btn ghost" style="margin-top:14px" onclick="S.cfg.shop={};touch('cfg/main');render()">Desmarcar tudo</button>`;

/* ===== VOCÊ ===== */
V.mais=()=>`<h1 style="margin-top:8px">${esc(S.cfg.name)}</h1><p class="lead"><span id="syncdot" class="sync ${DB.status}"><i></i>${syncLabel()}</span></p>
 <div class="sec"><h3>Evolução</h3></div>
 <div class="rows"><button class="row" onclick="push('corpo')"><div class="grow"><div class="t">Medidas e peso</div><div class="d">Peito, coxa, glúteo, cintura e % de gordura</div></div><span class="chev"></span></button><button class="row" onclick="push('fotos')"><div class="grow"><div class="t">Fotos de progresso</div><div class="d">${Object.keys(S.photos).length} fotos</div></div><span class="chev"></span></button><button class="row" onclick="push('bemestar')"><div class="grow"><div class="t">Check-ins</div><div class="d">Histórico de bem-estar e dores</div></div><span class="chev"></span></button><button class="row" onclick="push('exames')"><div class="grow"><div class="t">Exames</div><div class="d">${Object.keys(S.exams).length} enviados</div></div><span class="chev"></span></button></div>
 <div class="sec"><h3>Plano</h3></div>
 <div class="rows"><button class="row" onclick="push('semana')"><div class="grow"><div class="t">Minha semana</div><div class="d">${S.cfg.flex?'Livre, sem dia fixo':'Dias fixos'}</div></div><span class="chev"></span></button><button class="row" onclick="push('metodo')"><div class="grow"><div class="t">Como o app decide</div></div><span class="chev"></span></button></div>
 <div class="sec"><h3>Integrações e dados</h3></div>
 <div class="rows"><button class="row" onclick="push('saude')"><div class="grow"><div class="t">Apple Saúde e Watch</div><div class="d">Importar passos, kcal, FC de repouso e distâncias</div></div><span class="chev"></span></button><button class="row" onclick="push('sync')"><div class="grow"><div class="t">${IS_CLAUDE()?'Sincronizar':'Conta e sincronização'}</div><div class="d">${IS_CLAUDE()?'Trazer treinos do app offline':SB.on?syncLabel():'Ative para salvar na nuvem e usar a IA'}</div></div><span class="chev"></span></button><button class="row" onclick="push('dados')"><div class="grow"><div class="t">Backup</div><div class="d">Exportar ou restaurar seus registros</div></div><span class="chev"></span></button><button class="row" onclick="editName()"><div class="grow"><div class="t">Nome</div><div class="d">${esc(S.cfg.name)}</div></div><span class="chev"></span></button></div>`;
function editName(){openSheet(`<h2>Seu nome</h2><input id="nm" style="margin-top:14px" value="${esc(S.cfg.name)}"><button class="btn" style="margin-top:12px" onclick="S.cfg.name=$('#nm').value.trim()||S.cfg.name;touch('cfg/main');closeSheet();render()">Salvar</button>`)}
V.bemestar=()=>{const ks=Object.keys(S.days).filter(k=>S.days[k].ci).sort();const pts=ks.slice(-30).map(k=>({x:k,y:readiness(k).score}));
 return`${hdr('Check-ins',`<button class="btn sm blue" onclick="startCheckin()">Hoje</button>`)}<div class="panel"><h3>Prontidão</h3>${pts.length?lineChart(pts):'<p class="small mut">Sem check-ins ainda.</p>'}</div>
 ${ks.length?`<div class="rows">${ks.slice().reverse().map(k=>{const c=S.days[k].ci,r=readiness(k);return`<div class="row" style="align-items:flex-start"><span class="sw" style="background:${r.c};margin-top:6px"></span><div class="grow"><div class="t">${fmtD(k)} <span class="mut small">prontidão ${r.score}</span></div><div class="d">${SCALES.map(s=>s.n+' '+c[s.k]).join(', ')}</div>${Object.keys(c.pain||{}).length?`<div class="d">Dor: ${Object.entries(c.pain).map(([id,p])=>regName(id)+' ('+PAIN[p.l].n.toLowerCase()+')').join(', ')}</div>`:''}${c.obs?`<div class="d">“${esc(c.obs)}”</div>`:''}</div></div>`}).join('')}</div>`:''}`};
V.semana=()=>`${hdr('Minha semana')}<div class="seg" style="margin-bottom:12px"><button class="${S.cfg.flex?'on':''}" onclick="S.cfg.flex=true;touch('cfg/main');render()">Livre</button><button class="${S.cfg.flex?'':'on'}" onclick="S.cfg.flex=false;touch('cfg/main');render()">Dias fixos</button></div>${S.cfg.flex?`<div class="panel small">No modo livre, a tela Hoje sugere o próximo treino da sequência A, B, C e você registra CrossFit, corrida, bike ou natação quando fizer. A meta é fechar A, B e C na semana.</div>`:''}<p class="small mut" style="${S.cfg.flex?'display:none':''}">Toque para ligar ou desligar cada atividade. A tela Hoje segue esta semana.</p><div style="${S.cfg.flex?'display:none':''}">
 ${[1,2,3,4,5,6,0].map(d=>`<div class="panel"><div class="between"><h3>${DOW[d]}</h3><span class="small mut">${(S.cfg.week[d]||[]).map(a=>ACT[a].n).join(' + ')||'—'}</span></div><div class="chips" style="margin-top:10px">${Object.keys(ACT).map(a=>`<button class="chip ${(S.cfg.week[d]||[]).includes(a)?'on':''}" onclick="togWeek(${d},'${a}')">${ACT[a].n}</button>`).join('')}</div></div>`).join('')}
 </div><button class="btn ghost" style="${S.cfg.flex?'display:none':''}" onclick="ask('Voltar para a semana padrão?',()=>{S.cfg.week=JSON.parse(JSON.stringify(DEFAULT_WEEK));touch('cfg/main');render()},'Restaurar')">Restaurar padrão</button>`;
function togWeek(d,a){const w=S.cfg.week[d]=S.cfg.week[d]||[];const i=w.indexOf(a);if(i>=0)w.splice(i,1);else{if(a==='descanso')w.length=0;else{const j=w.indexOf('descanso');if(j>=0)w.splice(j,1)}w.push(a)}touch('cfg/main');render()}
const BODYF=[['peso','Peso','kg'],['gordura','Gordura','%'],['peito','Peito','cm'],['cintura','Cintura','cm'],['abdomen','Abdômen','cm'],['braco','Braço','cm'],['coxa','Coxa','cm'],['gluteo','Quadril/glúteo','cm'],['panturrilha','Panturrilha','cm']];
V.corpo=()=>{const B=Object.values(S.body).sort(by('date'));const L=B[B.length-1],F=B[0];const pts=B.filter(x=>x.peso).map(x=>({x:x.date,y:x.peso}));
 return`${hdr('Medidas e peso',`<button class="btn sm" onclick="bodyForm()">Adicionar</button>`)}
 ${L?`<div class="strip" style="margin-bottom:10px">${[['peso','kg'],['gordura','%'],['peito','cm'],['coxa','cm']].map(([f,u])=>`<div><b>${L[f]?fmtKg(L[f]):'–'}</b><span>${BODYF.find(b=>b[0]===f)[1].toLowerCase()} ${u}</span>${F!==L&&L[f]&&F[f]?`<div class="tiny n" style="color:${L[f]-F[f]<=0?'var(--grn)':'var(--yel)'}">${L[f]-F[f]>0?'+':''}${fmtKg(Math.round((L[f]-F[f])*10)/10)}</div>`:''}</div>`).join('')}</div>`:''}
 <div class="panel"><h3>Peso</h3>${pts.length?lineChart(pts):'<p class="small mut">Registre a primeira medida. Bioimpedância? Envie em Exames e copie os valores para cá.</p>'}</div>
 ${B.length?`<div class="rows">${B.slice().reverse().map(x=>`<div class="row"><div class="grow"><div class="t">${fmtD(x.date)}</div><div class="d">${BODYF.filter(([f])=>x[f]).map(([f,n,u])=>n+' '+fmtKg(x[f])+' '+u).join(', ')}</div></div><button class="tiny mut" onclick="ask('Apagar esta medida?',()=>{drop('body','${x.id}');render()},'Apagar')">apagar</button></div>`).join('')}</div>`:''}`};
function bodyForm(){openSheet(`<h2>Nova medida</h2><div class="field" style="margin-top:14px"><label>Data</label><input id="b_date" type="date" value="${dk()}"></div><div class="g2">${BODYF.map(([f,n,u])=>`<div class="field"><label>${n} (${u})</label><input id="b_${f}" inputmode="decimal"></div>`).join('')}</div><button class="btn" onclick="saveBody()">Salvar medida</button>`)}
function saveBody(){const id=uid('B');const x={id,t:Date.now(),date:$('#b_date').value||dk()};BODYF.forEach(([f])=>{const v=num($('#b_'+f).value);if(v)x[f]=v});S.body[id]=x;touch('body/'+id);closeSheet();render()}

/* ---- Apple Saúde ---- */
const HK=[['passos','Passos',''],['kcal_ativas','kcal ativas',''],['fc_repouso','FC de repouso','bpm'],['dist_corrida_km','Caminhada e corrida','km'],['dist_bike_km','Bike','km'],['dist_natacao_m','Natação','m'],['peso_kg','Peso','kg']];
V.saude=()=>{const k=dk();const h=(S.days[k]||{}).health;
 return`${hdr('Apple Saúde e Watch')}<p class="small" style="margin-top:-6px">O Saúde só libera dados para apps nativos da App Store. A ponte aqui é um Atalho do iPhone: ele lê o Saúde (onde o Watch grava tudo) e copia os números; você cola aqui. A FC de repouso entra no cálculo da prontidão.</p>
 <button class="btn" style="margin-top:14px" onclick="pasteHealth()">Colar dados do Saúde</button>
 <a class="btn ghost" style="margin-top:10px;text-decoration:none" href="shortcuts://run-shortcut?name=${encodeURIComponent('Saude HardFit')}">Rodar o Atalho “Saude HardFit”</a>
 ${h?`<div class="sec"><h3>Hoje</h3></div><div class="panel"><div class="g2">${HK.filter(([x])=>h[x]).map(([x,n,u])=>`<div><div class="small mut">${n}</div><b class="n" style="font-size:22px">${fmtKg(h[x])}</b> <span class="small mut">${u}</span></div>`).join('')}</div><div class="chips" style="margin-top:14px">${h.dist_bike_km?`<button class="chip" onclick="cardioForm('bike')">Lançar bike</button>`:''}${h.dist_natacao_m?`<button class="chip" onclick="cardioForm('natacao')">Lançar natação</button>`:''}${h.dist_corrida_km?`<button class="chip" onclick="cardioForm('corrida')">Lançar corrida</button>`:''}${h.peso_kg?`<button class="chip" onclick="const id=uid('B');S.body[id]={id,date:'${k}',peso:${h.peso_kg}};touch('body/'+id);toast('Peso salvo em medidas')">Salvar peso</button>`:''}</div></div>`:''}
 <div class="sec"><h3>Criar o Atalho (uma vez)</h3></div>
 <div class="panel small" style="line-height:1.65"><ol style="margin:0;padding-left:18px"><li>Abra Atalhos, toque em + e dê o nome <b>Saude HardFit</b>.</li><li>Adicione “Buscar Amostras de Saúde”: tipo Passos, data de início é hoje. Em seguida “Calcular Estatísticas”: Soma.</li><li>Repita o par para Energia Ativa (soma), Distância de Caminhada + Corrida (soma), Distância de Ciclismo (soma), Distância de Natação (soma, em metros), Frequência Cardíaca em Repouso (média) e Peso (mais recente, limite 1).</li><li>Adicione “Dicionário” com as chaves <b>passos</b>, <b>kcal_ativas</b>, <b>dist_corrida_km</b>, <b>dist_bike_km</b>, <b>dist_natacao_m</b>, <b>fc_repouso</b> e <b>peso_kg</b>, cada uma com o resultado correspondente.</li><li>Termine com “Copiar para Área de Transferência”.</li><li>Rode uma vez, permita o acesso ao Saúde, volte aqui e toque em Colar.</li></ol><p class="mut" style="margin:10px 0 0">Em Atalhos, na aba Automação, dá para rodar todo dia às 21h.</p></div>
 <div class="sec"><h3>No Apple Watch</h3></div>
 <div class="rows">${[['Treino A, B e C','Força Funcional'],['CrossFit','Treino Cruzado'],['Corrida','Corrida ao Ar Livre'],['Bike','Ciclismo'],['Natação','Natação em Piscina (configure o tamanho)']].map(([a,b])=>`<div class="row"><div class="grow"><div class="t">${a}</div><div class="d">${b}</div></div></div>`).join('')}</div>`};
async function pasteHealth(){let t='';try{t=await navigator.clipboard.readText()}catch(e){}if(t&&parseHealth(t))return;
 openSheet(`<h2>Colar dados</h2><p class="small mut">Toque no campo, segure e escolha Colar.</p><textarea id="h_t" rows="6"></textarea><button class="btn" style="margin-top:10px" onclick="parseHealth($('#h_t').value)">Importar</button>`)}
function parseHealth(txt){let o=null;try{o=JSON.parse(txt)}catch(e){o={};String(txt).split(/\n|,|;/).forEach(l=>{const m=l.match(/"?([\w_]+)"?\s*[:=]\s*"?([\d.,]+)/);if(m)o[m[1]]=m[2]})}
 const r={};let n=0;HK.forEach(([k])=>{if(o&&o[k]!=null&&o[k]!==''){const v=num(o[k]);if(v){r[k]=Math.round(v*100)/100;n++}}});
 if(!n){toast('Não encontrei dados do Saúde nesse texto');return false}const k=dk();day(k).health=r;touch('days/'+k);closeSheet();render();toast(n+' dados importados do Saúde');return true}

/* ---- backup ---- */
V.dados=()=>`${hdr('Backup')}<p class="small" style="margin-top:-6px">${DB.db?'Seus registros ficam salvos na sua conta Claude e aparecem em qualquer aparelho em que você abrir o app.':'Nesta versão os registros ficam só neste aparelho. Exporte de vez em quando.'}</p>
 <button class="btn" style="margin-top:14px" onclick="exportData()">Baixar backup (.json)</button>
 <button class="btn ghost" style="margin-top:10px" onclick="copyBackup()">Copiar backup como texto</button>
 <button class="btn ghost" style="margin-top:10px" onclick="restoreSheet()">Restaurar de texto</button>
 <div class="panel small mut" style="margin-top:14px">${Object.keys(S.logs).length} sessões, ${Object.keys(S.cardio).length} atividades de cardio, ${Object.values(S.days).filter(d=>d.ci).length} check-ins, ${Object.keys(S.exams).length} exames, ${Object.keys(S.photos).length} fotos.</div>`;
async function exportData(){const data=JSON.stringify(S,null,1);const fn='hardfit-backup-'+dk()+'.json';
 if(DB.downloads){try{await DB.downloads.save({filename:fn,data:new Blob([data],{type:'application/json'})});return}catch(e){if(e&&e.code==='declined')return}}
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type:'application/json'}));a.download=fn;document.body.appendChild(a);a.click();a.remove()}
function copyBackup(){const t=JSON.stringify(S);navigator.clipboard.writeText(t).then(()=>toast('Backup copiado. Cole em Notas ou Arquivos')).catch(()=>openSheet(`<h2>Backup</h2><textarea rows="8">${esc(t)}</textarea>`))}
function restoreSheet(){openSheet('<h2>Restaurar backup</h2><textarea id="bk" rows="8" placeholder="Cole o backup aqui"></textarea><button class="btn" style="margin-top:10px" onclick="restoreText()">Restaurar</button>')}
function restoreText(){try{const o=JSON.parse($('#bk').value);if(!o.cfg)throw 0;ask('Substituir os registros atuais pelo backup?',()=>{S=Object.assign(baseState(),o);['cfg/main','chat/main'].forEach(p=>PENDING[p]='set');COLLS.forEach(c=>Object.keys(S[c]).forEach(id=>PENDING[c+'/'+id]='set'));saveLocal();schedule();go('hoje');toast('Backup restaurado')},'Restaurar')}catch(e){toast('Texto de backup inválido')}}

/* ===== Sincronização entre o app offline e a versão do Claude ===== */
const IS_CLAUDE=()=>!!(window.claude&&window.claude.use);
function recT(){const ts=[...Object.values(S.logs).map(l=>l.end||0),...Object.values(S.cardio).map(c=>c.t||0),...Object.values(S.body).map(b=>b.t||0),...Object.values(S.days).map(d=>Math.max((d.ci&&d.ci.t)||0,d.wt||0))];return ts}
function unsent(){const last=S.cfg.lastExport||0;return recT().filter(t=>t>last).length}
function exportPack(){return JSON.stringify({anilha:2,from:IS_CLAUDE()?'claude':'offline',t:Date.now(),cfg:{loads:S.cfg.loads,notes:S.cfg.notes,shop:S.cfg.shop},days:S.days,logs:S.logs,cardio:S.cardio,body:S.body})}
async function sendPack(){const t=exportPack();try{await navigator.clipboard.writeText(t);S.cfg.lastExport=Date.now();touch('cfg/main');render();openSheet(`<h2>Registros copiados</h2><p class="small" style="margin-top:8px">${IS_CLAUDE()?'Agora abra o app offline, vá em Você, Sincronizar e toque em Colar registros.':'Quando tiver internet, abra a versão do Claude, vá em Você, Sincronizar e toque em Colar registros. A IA passa a enxergar esses treinos.'}</p>${IS_CLAUDE()?`<button class="btn" style="margin-top:14px" onclick="closeSheet()">Entendi</button>`:`<a class="btn" style="margin-top:14px;text-decoration:none" href="https://claude.ai/artifact/8YYMtDPdX5tiTHDfCLcDWc" target="_blank" rel="noopener">Abrir HardFit com IA</a><button class="btn ghost" style="margin-top:10px" onclick="closeSheet()">Depois</button>`}`)}
 catch(e){openSheet(`<h2>Copie o texto abaixo</h2><p class="small mut">Toque no campo, Selecionar Tudo e Copiar.</p><textarea rows="8" readonly>${esc(t)}</textarea><button class="btn" style="margin-top:10px" onclick="S.cfg.lastExport=Date.now();touch('cfg/main');closeSheet();render()">Já copiei</button>`)}}
async function receivePack(){let t='';try{t=await navigator.clipboard.readText()}catch(e){}if(t&&tryMerge(t))return;
 openSheet(`<h2>Colar registros</h2><p class="small mut">Toque no campo, segure e escolha Colar.</p><textarea id="pk" rows="6"></textarea><button class="btn" style="margin-top:10px" onclick="tryMerge($('#pk').value,true)">Juntar registros</button>`)}
function tryMerge(t,loud){let o;try{o=JSON.parse(t)}catch(e){}if(!o||o.anilha!==2){if(loud)toast('Esse texto não é um pacote de registros do HardFit');return false}
 let n=0;const mark=p=>{PENDING[p]='set';n++};
 ['logs','cardio','body'].forEach(c=>Object.entries(o[c]||{}).forEach(([id,v])=>{if(!S[c][id]){S[c][id]=v;mark(c+'/'+id)}}));
 Object.entries(o.days||{}).forEach(([k,v])=>{const d=S.days[k];if(!d){S.days[k]=v;mark('days/'+k);return}let ch=false;
  if(v.ci&&(!d.ci||(v.ci.t||0)>(d.ci.t||0))){d.ci=v.ci;d.ai=v.ai||null;ch=true}
  if((v.water||0)>(d.water||0)){d.water=v.water;ch=true}
  d.meals=d.meals||{};Object.entries(v.meals||{}).forEach(([mk,mv])=>{if(mv&&!d.meals[mk]){d.meals[mk]=mv;ch=true}});
  if(v.health&&!d.health){d.health=v.health;ch=true}if(!d.ai&&v.ai){d.ai=v.ai;ch=true}
  if(ch)mark('days/'+k)});
 const c=o.cfg||{};Object.entries(c.notes||{}).forEach(([k,v])=>{if(v&&!S.cfg.notes[k])S.cfg.notes[k]=v});
 const L={};Object.values(S.logs).sort(by('start')).forEach(l=>l.sets.forEach(x=>{L[x.id]=L[x.id]||{};L[x.id][Math.min(x.set,4)]={kg:x.kg,reps:x.reps}}));
 S.cfg.loads=Object.assign({},S.cfg.loads,c.loads||{},L);PENDING['cfg/main']='set';
 saveLocal();schedule();closeSheet();go('hoje');toast(n?n+' registro(s) novos juntados':'Tudo já estava em dia');return true}
V.sync=()=>IS_CLAUDE()?syncClaude():V.conta();
const syncClaude=()=>`${hdr('Sincronizar')}
 <p class="small" style="margin-top:-6px">${IS_CLAUDE()?'Esta é a versão do Claude, com IA. Ela precisa de internet.':'Este é o app offline da academia. Funciona sem internet, mas não tem IA.'} As duas versões trocam registros por copiar e colar: leva 10 segundos.</p>
 <div class="panel" style="margin-top:14px"><h3>${IS_CLAUDE()?'Trazer treinos do app offline':'Mandar treinos para o Claude'}</h3><p class="small mut" style="margin:6px 0 12px">${IS_CLAUDE()?'No app offline, toque em Copiar registros. Depois volte aqui e toque em Colar.':'Toque em Copiar e, com internet, cole na versão do Claude para a IA analisar.'}</p>
 ${IS_CLAUDE()?`<button class="btn" onclick="receivePack()">Colar registros do app offline</button><button class="btn ghost" style="margin-top:10px" onclick="sendPack()">Copiar registros para o app offline</button>`:`<button class="btn" onclick="sendPack()">Copiar registros${unsent()?' ('+unsent()+' novos)':''}</button><button class="btn ghost" style="margin-top:10px" onclick="receivePack()">Colar registros da versão do Claude</button>`}</div>
 <p class="tiny mut">Nada é apagado na troca: registros iguais são ignorados e as cargas são recalculadas a partir de todas as sessões.</p>`;

V.conta=()=>{const on=SB.on;return`${hdr('Conta e sincronização')}
 ${on?`<div class="panel"><div class="between"><div><div class="small mut">Conectado como</div><b>${esc(SB.s.user.email)}</b></div><span id="syncdot" class="sync ${DB.status}"><i></i>${syncLabel()}</span></div>
 <p class="small mut" style="margin:12px 0 0">Tudo que você registra fica salvo no iPhone, inclusive sem internet. Quando o celular pega sinal, o app envia e recebe sozinho. ${DB.lastSync?'Última sincronização: '+new Date(DB.lastSync).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})+'.':''}${DB.status==='err'&&DB.err?' Último erro: '+esc(DB.err):''}</p>
 <button class="btn" style="margin-top:14px" onclick="sbSync().then(()=>toast(DB.status==='ok'?'Sincronizado':'Sem conexão agora: tento de novo sozinho'))">Sincronizar agora</button>
 <button class="btn ghost" style="margin-top:10px" onclick="ask('Sair da conta neste aparelho? Os registros ficam salvos aqui e na nuvem.',()=>{SB.signOut();DB.sb=false;DB.status='local';render()},'Sair')">Sair</button></div>`
 :`<p class="small" style="margin-top:-6px">Crie seu acesso uma vez. Depois disso o app sincroniza sozinho sempre que tiver internet, guarda fotos, exames e vídeos e libera a IA. Só existe uma conta: a sua.</p>
 <div class="field" style="margin-top:14px"><label>E-mail</label><input id="ac_e" type="email" autocomplete="username" inputmode="email"></div>
 <div class="field"><label>Senha (mínimo 6 caracteres)</label><input id="ac_p" type="password" autocomplete="current-password"></div>
 <div class="g2"><button class="btn ghost" onclick="acGo('up')">Criar acesso</button><button class="btn" onclick="acGo('in')">Entrar</button></div>
 <p class="tiny mut" style="margin-top:12px">Já criou o acesso em outro aparelho? Use Entrar com o mesmo e-mail e senha.</p>`}`};
async function acGo(m){const e=$('#ac_e').value.trim(),p=$('#ac_p').value;if(!e||p.length<6){toast('Preencha e-mail e senha de 6+ caracteres');return}
 try{toast(m==='up'?'Criando acesso…':'Entrando…');if(m==='up')await SB.signUp(e,p);else await SB.signIn(e,p);
  DB.sb=true;Object.keys(S.cfg).length&&(PENDING['cfg/main']='set');['days','logs','cardio','body','exams','photos','reports','tech'].forEach(c=>Object.keys(S[c]).forEach(id=>PENDING[c+'/'+id]=PENDING[c+'/'+id]||'set'));saveLocal();
  await sbSync();render();toast('Conta conectada')}
 catch(x){toast(/único|única|database error/i.test(x.message||'')?'Já existe uma conta. Use Entrar.':/invalid/i.test(x.message||'')?'E-mail ou senha incorretos':(x.message||'Não deu certo'))}}

/* ===== Início ===== */
loadLocal();render();{const c=lget('hardfit_cr');if(c&&c.start)startCardio(c.mod)}
connectCloud().then(initDict);
window.addEventListener('online',()=>{sbSync();render()});window.addEventListener('offline',()=>render());
if(!window.claude&&'serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(()=>{});
