/* ===== Performance: metas, análise automática (sem internet) e análise do coach (IA) ===== */
const GROUPS={peito:'Peito',quad:'Coxa (frente)',gluteo:'Glúteo',posterior:'Posterior de coxa',dorsal:'Costas',ombro:'Ombros',biceps:'Bíceps',triceps:'Tríceps',panturrilha:'Panturrilha',abdomen:'Abdômen'};
const GOAL_DEF={etapas:[{kg:98,data:'2026-12-31'},{kg:95,data:null}],gordura_meta:null,prioridades:['peito','quad','gluteo'],forca_sem:4,crossfit_sem:2};
function goals(){const g=Object.assign({},GOAL_DEF,S.cfg.goals||{});if((!g.etapas||!g.etapas.length)&&g.peso_meta)g.etapas=[{kg:g.peso_meta,data:g.data_meta}];g.etapas=(g.etapas||[]).filter(e=>e&&e.kg);
 const st=curStage(g.etapas);g.peso_meta=st?st.kg:null;g.data_meta=st?st.data:null;g.etapa=st?st.i:null;return g}
function weights(){return Object.values(S.body).filter(b=>b.peso).sort(by('date'))}
function curStage(et){if(!et||!et.length)return null;const W=weights();const now=W.length?W[W.length-1].peso:null;const start=W.length?W[0].peso:null;
 const dir=start!=null?Math.sign(et[et.length-1].kg-start)||-1:-1;
 for(let i=0;i<et.length;i++){if(now==null||(now-et[i].kg)*dir<0)return{...et[i],i}}return{...et[et.length-1],i:et.length-1,done:true}}
const e1rm=(kg,r)=>kg*(1+r/30); // Epley
function weekOf(k){return weekDays(parseDk(k))[0]}
function lastWeeks(n){return[...Array(n)].map((_,i)=>{const r=new Date();r.setDate(r.getDate()-7*(n-1-i));return weekDays(r)})}
// Séries efetivas (work sets) por grupo muscular: principal conta 1, secundário 0,5
function weeklySets(days){const g={};Object.keys(GROUPS).forEach(k=>g[k]=0);
 Object.values(S.logs).filter(l=>days.includes(l.date)).forEach(l=>l.sets.forEach(x=>{if(!(x.set>=2||x.bi))return;const e=EX[x.id];if(!e)return;e.m.forEach(m=>{if(g[m]!=null)g[m]+=1});e.s.forEach(m=>{if(g[m]!=null)g[m]+=.5})}));
 Object.keys(g).forEach(k=>g[k]=Math.round(g[k]*10)/10);return g}
function strengthTrend(){const out=[];Object.keys(EX).forEach(id=>{const pts=Object.values(S.logs).sort(by('start')).map(l=>{const w=l.sets.filter(x=>x.id===id&&x.set>=2&&x.reps>0);return w.length?{d:l.date,v:Math.max(...w.map(x=>e1rm(x.kg,x.reps)))}:null}).filter(Boolean);
  if(!pts.length)return;const last=pts[pts.length-1];const cut=new Date();cut.setDate(cut.getDate()-28);const old=pts.find(p=>parseDk(p.d)>=cut)||pts[0];
  const stall=pts.length>=3&&pts.slice(-3).every((p,i,a)=>!i||p.v<=a[0].v*1.01);
  out.push({id,n:EX[id].n,now:Math.round(last.v*10)/10,ch:old===last?0:Math.round((last.v/old.v-1)*1000)/10,stall,sessions:pts.length,sug:suggestion(id)})});return out.sort((a,b)=>b.ch-a.ch)}
function bodyTrend(){const B=weights();if(!B.length)return null;const last=B[B.length-1];const g=goals();
 const prev=B.filter(b=>(parseDk(last.date)-parseDk(b.date))/864e5>=6).pop();const rate=prev?Math.round((last.peso-prev.peso)/((parseDk(last.date)-parseDk(prev.date))/(7*864e5))*100)/100:null;
 let need=null,weeksLeft=null,sugData=null;if(g.peso_meta!=null){const falta=g.peso_meta-last.peso;if(g.data_meta){weeksLeft=Math.max(1,(parseDk(g.data_meta)-new Date())/(7*864e5));need=Math.round(falta/weeksLeft*100)/100}else{const w=Math.ceil(Math.abs(falta)/0.6);const d=new Date();d.setDate(d.getDate()+w*7);sugData=dk(d);weeksLeft=w}}
 return{atual:last.peso,inicio:B[0].peso,data:last.date,gordura:(B.filter(b=>b.gordura).pop()||{}).gordura,rate,need,weeksLeft,sugData,falta:g.peso_meta!=null?Math.round((g.peso_meta-last.peso)*10)/10:null}}
function mixWeeks(n=4){return lastWeeks(n).map(w=>({w:w[0],forca:Object.values(S.logs).filter(l=>w.includes(l.date)).length,crossfit:Object.values(S.cardio).filter(c=>w.includes(c.date)&&c.mod==='crossfit').length,cardio:Object.values(S.cardio).filter(c=>w.includes(c.date)&&c.mod!=='crossfit').reduce((a,c)=>a+num(c.min),0)}))}
function avg(a){a=a.filter(x=>x!=null&&!isNaN(x));return a.length?a.reduce((x,y)=>x+y,0)/a.length:null}
/* Recomendações por regra: funcionam offline e entram no contexto da IA */
function recommendations(){const g=goals(),R=[];const w=weekDays(),l7=lastDays(7),l14=lastDays(14);
 const mix=mixWeeks(4),cur=mix[3],avgCF=avg(mix.map(m=>m.crossfit)),avgF=avg(mix.map(m=>m.forca));
 if(avgCF!=null&&(avgCF>g.crossfit_sem||cur.crossfit>g.crossfit_sem))R.push({c:'var(--yel)',t:`Menos CrossFit, mais academia`,d:`Média de ${fmtKg(Math.round(avgCF*10)/10)} CrossFit e ${fmtKg(Math.round(avgF*10)/10)} treinos de força por semana. Sua meta é ${g.crossfit_sem} CrossFit e ${g.forca_sem} de força: troque ${Math.max(1,Math.round(avgCF-g.crossfit_sem))} CrossFit pelo Treino D, focado em peito, coxa e glúteo.`});
 else if(cur.forca<g.forca_sem&&new Date().getDay()>=3)R.push({c:'var(--blue)',t:`Faltam ${g.forca_sem-cur.forca} treinos de força nesta semana`,d:`Próximo da sequência: ${SESS[nextSession()].full}.`});
 const ws=weeklySets(l7);g.prioridades.forEach(m=>{if(!GROUPS[m])return;const v=ws[m]||0;if(v<10)R.push({c:v<6?'var(--red)':'var(--yel)',t:`${GROUPS[m]}: ${fmtKg(v)} séries na semana`,d:`Para um ponto que você quer melhorar, o alvo é de 10 a 20 séries efetivas por semana. ${m==='peito'?'Supino inclinado, supino com halteres e crossover':m==='quad'?'Agachamento, leg press, búlgaro e extensora':m==='gluteo'?'Elevação pélvica, búlgaro, stiff e leg press':'Os exercícios do grupo'} somam rápido; o Treino D cobre os três.`})});
 strengthTrend().filter(s=>s.stall).slice(0,2).forEach(s=>R.push({c:'var(--yel)',t:`${s.n} parado há 3 sessões`,d:`Força estimada estável em ${fmtKg(s.now)} kg. Durma bem antes, mantenha a carga e busque +1 rep, ou baixe 5% e reconstrua.`}));
 const b=bodyTrend();if(b&&g.peso_meta!=null&&b.rate!=null){const dir=Math.sign(g.peso_meta-b.atual);if(dir&&Math.sign(b.rate)!==dir&&Math.abs(b.rate)>.1)R.push({c:'var(--red)',t:`Peso indo na direção contrária da meta`,d:`${b.rate>0?'+':''}${fmtKg(b.rate)} kg/semana; a meta pede ${dir>0?'ganhar':'perder'} ${fmtKg(Math.abs(b.falta))} kg. Peça ao coach um ajuste da dieta.`});else if(b.need!=null&&Math.abs(b.need)>1)R.push({c:'var(--yel)',t:`Ritmo da meta de peso está agressivo`,d:`Para chegar em ${fmtKg(g.peso_meta)} kg na data, precisaria de ${fmtKg(Math.abs(b.need))} kg por semana. O saudável é até 0,5 a 1% do peso por semana.`})}
 else if(g.peso_meta!=null&&!b)R.push({c:'var(--blue)',t:`Registre seu peso`,d:`Pese-se em jejum, 1 a 2 vezes por semana, para o app acompanhar a meta.`});
 const dd=avg(l7.map(dietDone));if(dd!=null&&dd<3)R.push({c:'var(--yel)',t:`Dieta: ${Math.round(dd/4*100)}% das refeições`,d:`Média de ${fmtKg(Math.round(dd*10)/10)} de 4 refeições nos últimos 7 dias. A meta de físico depende mais disso do que do treino.`});
 const wa=avg(l7.map(k=>(S.days[k]||{}).water||null));if(wa!=null&&wa<4000)R.push({c:'var(--blue)',t:`Água: média de ${fmtKg(Math.round(wa/100)/10)} L`,d:`A meta é 5 L. Deixe uma garrafa de 1 L à vista e bata 5 dela por dia.`});
 const sl=avg(l14.map(k=>((S.days[k]||{}).ci||{}).sono||null));if(sl!=null&&sl<3)R.push({c:'var(--red)',t:`Sono baixo nas últimas 2 semanas`,d:`Média ${fmtKg(Math.round(sl*10)/10)} de 5. Sem sono a carga não sobe e a composição corporal trava.`});
 const L=loadStats();if(L.ratio!=null&&L.ratio>1.5)R.push({c:'var(--red)',t:`Pico de carga`,d:`Razão aguda:crônica ${fmtKg(L.ratio)}. Segure a intensidade 3 a 4 dias.`});
 return R}
function perfSummary(){const g=goals();return{metas:g,peso:bodyTrend(),series_semana:weeklySets(lastDays(7)),forca:strengthTrend().slice(0,10).map(s=>({exercicio:s.n,forca_estimada_kg:s.now,variacao_4sem_pct:s.ch,parado:s.stall,proxima:s.sug&&s.sug.t})),mix_4_semanas:mixWeeks(4),recomendacoes:recommendations().map(r=>r.t+': '+r.d)}}
/* ---- telas ---- */
V.perf=()=>{const g=goals(),b=bodyTrend(),ws=weeklySets(lastDays(7)),st=strengthTrend(),mix=mixWeeks(4),R=recommendations();const rep=Object.values(S.reports).filter(r=>r.kind==='perf').sort(by('t')).pop();
 const pct=b&&g.peso_meta?Math.max(0,Math.min(100,100-Math.abs(b.falta)/Math.max(1,Math.abs(g.peso_meta-(Object.values(S.body).filter(x=>x.peso).sort(by('date'))[0]||{}).peso||b.atual))*100)):0;
 return`${hdr('Performance',`<button class="btn sm ghost" onclick="push('metas')">Metas</button>`)}
 <div class="panel"><div class="between"><h3>Meta de peso</h3><span class="small mut">${g.data_meta?'até '+fmtD(g.data_meta):''}</span></div>
 ${g.peso_meta==null?`<p class="small mut" style="margin:8px 0 12px">Defina quanto quer pesar e até quando. O app calcula o ritmo e avisa se estiver fora do caminho.</p><button class="btn sm blue" onclick="push('metas')">Definir meta</button>`:
 `<div class="between" style="margin-top:12px;align-items:flex-end"><div><div class="small mut">Agora</div><div class="x n" style="font-size:34px;font-weight:850">${b?fmtKg(b.atual):'–'}<span class="small mut"> kg</span></div></div><div style="text-align:right"><div class="small mut">Meta</div><div class="x n" style="font-size:34px;font-weight:850">${fmtKg(g.peso_meta)}<span class="small mut"> kg</span></div></div></div>
 <div class="bar" style="margin:12px 0 8px"><i style="width:${pct}%;background:var(--grn)"></i></div>
 <p class="small mut" style="margin:0">${b?`${b.falta===0?'Meta atingida.':(b.falta>0?'Faltam ganhar ':'Faltam perder ')+fmtKg(Math.abs(b.falta))+' kg.'}${b.rate!=null?' Ritmo atual: '+(b.rate>0?'+':'')+fmtKg(b.rate)+' kg/semana.':''}${b.need!=null?' Necessário: '+(b.need>0?'+':'')+fmtKg(b.need)+' kg/semana.':''}`:'Registre seu peso em Você, Medidas e peso.'}</p>`}</div>
 <div class="sec"><h3>O que fazer agora</h3><span class="small mut">${R.length} ponto(s)</span></div>
 ${R.length?`<div class="rows">${R.map(r=>`<div class="row" style="align-items:flex-start"><span class="sw" style="background:${r.c};margin-top:6px"></span><div class="grow"><div class="t">${r.t}</div><div class="d">${r.d}</div></div></div>`).join('')}</div>`:`<div class="panel small mut">Nada fora do lugar nos seus dados. Siga o plano.</div>`}
 <button class="btn" style="margin-top:6px" onclick="genPerf()" ${aiOn()?'':'disabled'}>Análise completa do coach</button>
 <div id="perfout" class="panel md ai" style="margin-top:10px;${rep?'':'display:none'}">${rep?`<p class="tiny mut">${fmtD(dk(new Date(rep.t)))}</p>`+md(rep.text):''}</div>
 <div class="sec"><h3>Séries efetivas na semana</h3><span class="small mut">últimos 7 dias</span></div>
 <div class="panel">${Object.entries(GROUPS).map(([k,n])=>{const v=ws[k]||0,pri=g.prioridades.includes(k),tgt=pri?12:8;return`<div style="margin-bottom:10px"><div class="between small"><span>${pri?'<b>':''}${n}${pri?'</b> <span class="tag" style="padding:1px 7px;font-size:10.5px">prioridade</span>':''}</span><span class="n mut">${fmtKg(v)} / ${tgt}+</span></div><div class="bar" style="margin-top:5px"><i style="width:${Math.min(100,v/20*100)}%;background:${v>=tgt?'var(--grn)':v>=tgt/2?'var(--yel)':'var(--red)'}"></i></div></div>`}).join('')}<p class="tiny mut" style="margin:4px 0 0">Work sets: exercício principal conta 1, músculo secundário conta meia série.</p></div>
 <div class="sec"><h3>Academia × CrossFit</h3><span class="small mut">últimas 4 semanas</span></div>
 <div class="panel"><div class="flex" style="align-items:flex-end;gap:12px;height:90px">${mix.map(m=>`<div style="flex:1;display:flex;gap:4px;align-items:flex-end;height:100%">${[['forca','var(--red)'],['crossfit','var(--yel)']].map(([f,c])=>`<i style="flex:1;border-radius:4px;background:${c};height:${Math.max(4,m[f]*16)}px"></i>`).join('')}</div>`).join('')}</div>
 <div class="flex" style="gap:12px;margin-top:6px">${mix.map(m=>`<span class="tiny mut" style="flex:1;text-align:center">${fmtD(m.w)}</span>`).join('')}</div>
 <div class="legend" style="justify-content:flex-start"><span><i class="sw" style="background:var(--red)"></i>Academia (meta ${g.forca_sem})</span><span><i class="sw" style="background:var(--yel)"></i>CrossFit (meta ${g.crossfit_sem})</span></div></div>
 <div class="sec"><h3>Força</h3><span class="small mut">estimativa de 1 repetição máxima</span></div>
 ${st.length?`<div class="rows">${st.map(s=>`<button class="row" onclick="EVO='${s.id}';push('evo')"><div class="grow"><div class="t">${s.n}</div><div class="d">${s.sug?s.sug.t:''}</div></div><div style="text-align:right"><b class="n">${fmtKg(s.now)} kg</b><div class="tiny n" style="color:${s.ch>0?'var(--grn)':s.ch<0?'var(--red)':'var(--steel)'}">${s.ch>0?'+':''}${fmtKg(s.ch)}% em 4 sem.${s.stall?' · parado':''}</div></div></button>`).join('')}</div>`:`<div class="panel small mut">Registre treinos de força para ver a evolução aqui.</div>`}`};
async function genPerf(){const o=$('#perfout');o.style.display='';o.innerHTML='<span class="spin"></span> Coach analisando metas, treinos, corpo e dieta…';
 try{const t=await aiAsk(`Contexto (JSON): ${ctx(28)}

Resumo de performance calculado pelo app (JSON): ${JSON.stringify(perfSummary())}

Tarefa: análise de performance para o atleta, que quer um físico melhor com prioridade em ${goals().prioridades.map(p=>GROUPS[p]).join(', ')} e pediu para reduzir CrossFit e ir mais para a academia. Use exatamente estes títulos em linhas com "## ":
## Onde você está
## Sua meta e o que ela exige
## O que está funcionando
## O que mudar já
## Sua próxima semana
Seja concreto com números: cargas-alvo por exercício (da dupla progressão), séries por grupo, quantos treinos de força e de CrossFit, minutos de Z2, ajuste de dieta em gramas se o peso estiver fora do ritmo. Na próxima semana, monte a ordem dos treinos (A, B, C, D, CrossFit, cardio) sem dia fixo, com descanso entre treinos que repetem o mesmo grupo. Tópicos curtos com "- ".`,{tier:'complex',onText:streamInto('#perfout')});
  const id=uid('R');S.reports[id]={id,t:Date.now(),kind:'perf',text:t};touch('reports/'+id)}catch(e){o.innerHTML=`<p class="mut">${aiErr(e)}</p>`}}
let ETAPAS=null;
V.metas=()=>{const g=goals();if(!ETAPAS)ETAPAS=JSON.parse(JSON.stringify(g.etapas.length?g.etapas:[{kg:'',data:''}]));return`${hdr('Minhas metas')}
 <div class="field"><label>Meta de peso em etapas</label>${ETAPAS.map((e,i)=>`<div class="flex" style="gap:8px;margin-bottom:8px"><span class="small mut" style="width:52px;flex:none">Etapa ${i+1}</span><input inputmode="decimal" placeholder="kg" value="${e.kg!==''&&e.kg!=null?fmtKg(e.kg):''}" oninput="ETAPAS[${i}].kg=num(this.value)||''" style="padding:10px"><input type="date" value="${e.data||''}" oninput="ETAPAS[${i}].data=this.value||null" style="padding:10px"><button class="ib" style="width:38px;height:38px;flex:none" aria-label="Remover etapa" onclick="ETAPAS.splice(${i},1);render()">${I.x}</button></div>`).join('')}
 <button class="txtbtn" onclick="ETAPAS.push({kg:'',data:null});render()">+ Adicionar etapa</button><p class="tiny mut" style="margin:4px 0 0">Data é opcional. Sem data, o app sugere uma no ritmo saudável de cerca de 0,6 kg por semana.</p></div>
 <div class="field"><label>Gordura meta (%) · opcional</label><input id="g_g" inputmode="decimal" value="${g.gordura_meta!=null?fmtKg(g.gordura_meta):''}"></div>
 <div class="field"><label>Pontos que quer melhorar</label><div class="chips" id="g_pr">${Object.entries(GROUPS).map(([k,n])=>`<button class="chip ${g.prioridades.includes(k)?'on':''}" data-k="${k}" onclick="this.classList.toggle('on')">${n}</button>`).join('')}</div></div>
 <div class="g2"><div class="field"><label>Academia por semana</label><div class="seg" id="g_f">${[3,4,5].map(n=>`<button class="${g.forca_sem===n?'on':''}" onclick="segPick(this)">${n}</button>`).join('')}</div></div>
 <div class="field"><label>CrossFit por semana</label><div class="seg" id="g_c">${[0,1,2,3].map(n=>`<button class="${g.crossfit_sem===n?'on':''}" onclick="segPick(this)">${n}</button>`).join('')}</div></div></div>
 <p class="small mut">Com 4 ou mais treinos de academia, a sequência vira A, B, C, D. O Treino D é focado em peito, coxa e glúteo.</p>
 <button class="btn" style="margin-top:10px" onclick="saveGoals()">Salvar metas</button>`};
function segPick(b){b.parentNode.querySelectorAll('button').forEach(x=>x.classList.remove('on'));b.classList.add('on')}
function saveGoals(){const on=id=>+(($(id+' .on')||{}).textContent||0);const et=(ETAPAS||[]).filter(e=>e.kg).map(e=>({kg:+e.kg,data:e.data||null}));S.cfg.goals={etapas:et,gordura_meta:num($('#g_g').value)||null,prioridades:[...document.querySelectorAll('#g_pr .chip.on')].map(b=>b.dataset.k),forca_sem:on('#g_f')||4,crossfit_sem:on('#g_c')};ETAPAS=null;touch('cfg/main');pop();toast('Metas salvas')}
/* ---- avaliação física por foto: nota por região, comparada com a primeira e com a anterior ---- */
const G2R={peito:['peito'],quad:['quad','joelho'],gluteo:['gluteo'],posterior:['posterior'],dorsal:['dorsal','trapezio','lombar'],ombro:['ombro','ombro_post'],biceps:['biceps'],triceps:['triceps'],panturrilha:['panturrilha','canela'],abdomen:['abdomen','obliquo']};
const regGroup=id=>{const b=baseOf(id);return Object.keys(G2R).find(g=>G2R[g].includes(b))};
const evals=()=>Object.values(S.reports).filter(r=>r.kind==='foto'&&r.j).sort(by('t'));
const notaCor=n=>n==null?null:n>=7?'var(--grn)':n>=5?'var(--yel)':'var(--red)';
const tendTxt=t=>({melhorou:'▲ melhorou',piorou:'▼ piorou',igual:'= igual'}[t]||'sem base');
const tendCor=t=>t==='melhorou'?'var(--grn)':t==='piorou'?'var(--red)':'var(--steel)';
let AV={};
V.avaliacao=()=>{const E=evals().reverse();const pts=E.slice().reverse().map(r=>({x:dk(new Date(r.t)),y:r.j.nota_geral}));
 return`${hdr('Avaliação física')}<p class="small" style="margin-top:-6px">Mande frente, lado e costas. O coach dá nota de 1 a 10 por região e compara com a sua primeira foto e com a avaliação anterior, sempre na mesma régua.</p>
 ${pts.length>1?`<div class="panel"><h3>Nota geral do físico</h3>${lineChart(pts)}</div>`:''}
 <div class="panel small mut" style="margin-top:10px">Para comparar certo: mesmo lugar, mesma luz e distância, de manhã, em jejum, corpo inteiro no quadro. Repita a cada 2 a 4 semanas.</div>
 <div class="g3" style="margin-top:12px">${['Frente','Lado','Costas'].map(p=>`<label class="drop" style="padding:14px 6px;${DB.assets||DB.sb?'':'opacity:.5;pointer-events:none'}">${AV[p]?`<img src="${AV[p].url}" style="width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:10px">`:I.cam}<b style="margin-top:6px">${p}</b><input type="file" accept="image/*" style="display:none" onchange="avPick('${p}',this.files[0])"></label>`).join('')}</div>
 <button class="btn" style="margin-top:12px" onclick="runAvaliacao()" ${aiOn()&&Object.keys(AV).length?'':'disabled'}>Avaliar meu progresso</button>
 ${aiOn()?'':'<p class="tiny mut" style="margin-top:8px">A avaliação usa a IA: precisa de internet e da chave configurada.</p>'}
 <div id="avout"></div>
 ${E.length?`<div class="sec"><h3>Avaliações</h3></div><div class="rows">${E.map((r,i)=>{const pv=E[i+1];const d=pv?Math.round((r.j.nota_geral-pv.j.nota_geral)*10)/10:null;return`<button class="row" onclick="push('avaliacaoVer','${r.id}')"><div class="ib x" style="font-weight:850;color:${notaCor(r.j.nota_geral)}">${fmtKg(r.j.nota_geral)}</div><div class="grow"><div class="t">${fmtD(dk(new Date(r.t)))}</div><div class="d">${(r.poses||[]).join(', ')}${d!=null?` · ${d>0?'+':''}${fmtKg(d)} vs anterior`:''}</div></div><span class="chev"></span></button>`}).join('')}</div>`:''}`};
async function avPick(pose,f){if(!f)return;const blob=await shrink(await fileToImg(f),1600);AV[pose]={blob,url:URL.createObjectURL(blob)};render()}
async function runAvaliacao(){const o=$('#avout');const poses=Object.keys(AV);o.innerHTML='<div class="panel small"><span class="spin"></span> Guardando fotos…</div>';
 try{const items=[];for(const p of poses){const all=Object.values(S.photos).filter(x=>x.pose===p).sort(by('t'));const first=all[0],prev=all[all.length-1];const a=await uploadAsset(AV[p].blob);const id=uid('P');S.photos[id]={id,t:Date.now(),date:dk(),pose:p,asset:a.id,ai:''};touch('photos/'+id);items.push({p,id,blob:AV[p].blob,first,prev:prev&&prev!==first?prev:null})}
  o.innerHTML='<div class="panel small"><span class="spin"></span> Coach comparando suas fotos…</div>';
  const imgs=[],lab=[];for(const it of items){if(it.first){try{imgs.push(await assetBlob(it.first.asset));lab.push(`${it.p} · primeira foto (${fmtD(it.first.date)})`)}catch(e){}}if(it.prev){try{imgs.push(await assetBlob(it.prev.asset));lab.push(`${it.p} · foto anterior (${fmtD(it.prev.date)})`)}catch(e){}}imgs.push(it.blob);lab.push(`${it.p} · hoje (${fmtD(dk())})`)}
  const E=evals(),first=E[0],last=E[E.length-1];const b=bodyTrend();
  const t=await aiAsk(`Contexto (JSON): ${ctx(28)}
Metas e performance (JSON): ${JSON.stringify(perfSummary())}
Peso: ${b?b.atual+' kg (início '+b.inicio+' kg)':'sem registro'}.
${last?`Avaliação anterior (${fmtD(dk(new Date(last.t)))}), mesma régua que você deve manter: ${JSON.stringify({nota_geral:last.j.nota_geral,regioes:Object.fromEntries(Object.entries(last.j.regioes||{}).map(([k,v])=>[k,v.nota]))})}`:'Esta é a primeira avaliação: ela vira a linha de base.'}
${first&&first!==last?`Primeira avaliação (${fmtD(dk(new Date(first.t)))}): nota geral ${first.j.nota_geral}.`:''}

Tarefa: avaliação física por foto, como um treinador experiente e objetivo. As ${imgs.length} imagens estão nesta ordem: ${lab.map((l,i)=>(i+1)+') '+l).join('; ')}.
Prioridades do atleta: ${goals().prioridades.map(p=>GROUPS[p]).join(', ')}. Notas de 1 a 10 combinam volume muscular e definição visíveis. Mantenha a mesma régua da avaliação anterior: só mude uma nota quando a diferença for visível nas fotos, e diga quando pode ser luz, ângulo ou pump. Não diagnostique nada de saúde.
Responda SOMENTE com JSON válido:
{"nota_geral":0,"gordura_faixa":"faixa estimada visualmente, ex. 18 a 22%","confianca":"alta|média|baixa","motivo_confianca":"","resumo":"2 a 3 frases de como ele está hoje","comparacao":"3 a 5 frases: antes × agora, citando datas","regioes":{${Object.keys(GROUPS).map(k=>`"${k}":{"nota":0,"tendencia":"melhorou|igual|piorou|sem base","obs":"1 frase"}`).join(',')}},"prioridades":["3 ações para as próximas 4 semanas ligando treino (Treino D, séries por grupo) e dieta"]}`,{images:imgs,tier:'complex'});
  const j=parseJSON(t);if(!j||j.nota_geral==null)throw{message:'A IA não devolveu a avaliação no formato esperado. Tente de novo.'};
  const id=uid('R');S.reports[id]={id,t:Date.now(),kind:'foto',j,poses,items:items.map(it=>({pose:it.p,hoje:S.photos[it.id].asset,primeira:it.first&&it.first.asset,primeira_d:it.first&&it.first.date}))};
  items.forEach(it=>{S.photos[it.id].ai=j.resumo;S.photos[it.id].ev=id;touch('photos/'+it.id)});touch('reports/'+id);AV={};push('avaliacaoVer',id)}
 catch(e){o.innerHTML=`<div class="panel small">${e&&e.code?aiErr(e):esc(e&&e.message||'Não deu certo. Tente de novo.')}</div>`}}
let EVV='front';
V.avaliacaoVer=id=>{const r=S.reports[id];if(!r)return hdr('Avaliação');if(!r.j)return`${hdr('Avaliação')}<div class="panel md ai">${md(r.text||'')}</div>`;
 const E=evals(),i=E.findIndex(x=>x.id===id),pv=i>0?E[i-1]:null,fs=E[0]!==r?E[0]:null,j=r.j;
 const fill=rid=>{const g=regGroup(rid);const v=g&&j.regioes&&j.regioes[g];return v?notaCor(v.nota):null};
 return`${hdr('Avaliação de '+fmtD(dk(new Date(r.t))))}
 <div class="panel"><div class="between" style="align-items:flex-end"><div><div class="small mut">Nota geral</div><div class="x n" style="font-size:44px;font-weight:850;color:${notaCor(j.nota_geral)}">${fmtKg(j.nota_geral)}</div></div><div style="text-align:right" class="small">${pv?`<div class="mut">anterior ${fmtKg(pv.j.nota_geral)}</div>`:''}${fs?`<div class="mut">primeira ${fmtKg(fs.j.nota_geral)}</div>`:'<div class="mut">linha de base</div>'}${j.gordura_faixa?`<div style="margin-top:4px">Gordura ${esc(j.gordura_faixa)}</div>`:''}</div></div>
 <p style="margin:10px 0 0">${esc(j.resumo||'')}</p><p class="tiny mut" style="margin:6px 0 0">Confiança ${esc(j.confianca||'')}${j.motivo_confianca?': '+esc(j.motivo_confianca):''}</p></div>
 <div class="seg" style="max-width:220px;margin:8px auto 10px"><button class="${EVV==='front'?'on':''}" onclick="EVV='front';render()">Frente</button><button class="${EVV==='back'?'on':''}" onclick="EVV='back';render()">Costas</button></div>
 <div class="bodymap">${bodySVG(EVV,fill)}</div>
 <div class="legend"><span><i class="sw" style="background:var(--grn)"></i>7 a 10</span><span><i class="sw" style="background:var(--yel)"></i>5 a 6,9</span><span><i class="sw" style="background:var(--red)"></i>até 4,9</span></div>
 <div class="sec"><h3>Região por região</h3><span class="small mut">${pv?'vs anterior':''}</span></div>
 <div class="rows">${Object.entries(GROUPS).map(([k,n])=>{const v=(j.regioes||{})[k];if(!v)return'';const pn=pv&&pv.j.regioes&&pv.j.regioes[k]?pv.j.regioes[k].nota:null;const d=pn!=null?Math.round((v.nota-pn)*10)/10:null;return`<div class="row" style="align-items:flex-start"><span class="sw" style="background:${notaCor(v.nota)};margin-top:6px"></span><div class="grow"><div class="t">${n}${goals().prioridades.includes(k)?' <span class="tag" style="padding:1px 7px;font-size:10.5px">prioridade</span>':''}</div><div class="d">${esc(v.obs||'')}</div><div class="tiny" style="color:${tendCor(v.tendencia)};margin-top:3px">${tendTxt(v.tendencia)} desde o início</div></div><div style="text-align:right"><b class="x n" style="font-size:20px">${fmtKg(v.nota)}</b>${d!=null?`<div class="tiny n" style="color:${d>0?'var(--grn)':d<0?'var(--red)':'var(--steel)'}">${d>0?'+':''}${fmtKg(d)}</div>`:''}</div></div>`}).join('')}</div>
 ${j.comparacao?`<div class="sec"><h3>Antes × agora</h3></div><div class="panel"><p style="margin:0">${esc(j.comparacao)}</p></div>`:''}
 ${(r.items||[]).map(it=>`<div class="sec" style="margin-top:10px"><h3>${it.pose}</h3></div><div class="${it.primeira?'g2':''}">${it.primeira?`<div><img class="media" ${assetAttr(it.primeira)} alt="Primeira foto"><div class="tiny mut" style="margin-top:4px">Antes, ${fmtD(it.primeira_d)}</div></div>`:''}<div><img class="media" ${assetAttr(it.hoje)} alt="Foto de hoje"><div class="tiny mut" style="margin-top:4px">${fmtD(dk(new Date(r.t)))}</div></div></div>`).join('')}
 ${(j.prioridades||[]).length?`<div class="sec"><h3>Próximas 4 semanas</h3></div><div class="panel"><ul style="margin:0;padding-left:18px">${j.prioridades.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:''}
 <button class="txtbtn" style="margin-top:14px;color:var(--red)" onclick="ask('Apagar esta avaliação? As fotos continuam guardadas.',()=>{drop('reports','${id}');pop()},'Apagar')">Apagar avaliação</button>`};

/* ---- painel do topo da tela Hoje ---- */
let DASHV='fisico',DASHS='front';
function dashCard(){const g=goals(),b=bodyTrend(),E=evals(),ev=E[E.length-1],pv=E[E.length-2];const w=weekDays(),l7=lastDays(7),ws=weeklySets(l7);
 const forca=Object.values(S.logs).filter(l=>w.includes(l.date)).length,cf=Object.values(S.cardio).filter(c=>w.includes(c.date)&&c.mod==='crossfit').length,card=Object.values(S.cardio).filter(c=>w.includes(c.date)&&c.mod!=='crossfit').reduce((a,c)=>a+num(c.min),0);
 const diet=avg(l7.map(dietDone)),agua=avg(l7.map(k=>(S.days[k]||{}).water||null)),pr=avg(l7.map(k=>{const r=readiness(k);return r?r.score:null}));
 const mode=DASHV==='fisico'&&ev?'fisico':'treino';
 const fill=rid=>{const gk=regGroup(rid);if(!gk)return null;if(mode==='fisico'){const v=ev.j.regioes&&ev.j.regioes[gk];return v?notaCor(v.nota):null}const v=ws[gk]||0,t=g.prioridades.includes(gk)?12:8;return v>=t?'var(--grn)':v>=t/2?'var(--yel)':v>0?'var(--red)':null};
 // barra de peso com as etapas
 let wbar='';if(b&&g.etapas.length){const lo=Math.min(b.inicio,b.atual,...g.etapas.map(e=>e.kg))-.5,hi=Math.max(b.inicio,b.atual,...g.etapas.map(e=>e.kg))+.5;const X=v=>((hi-v)/(hi-lo)*100).toFixed(1);
  wbar=`<div style="position:relative;height:30px;margin:14px 4px 2px"><div class="bar" style="position:absolute;left:0;right:0;top:12px"><i style="width:${X(b.atual)}%;background:var(--grn)"></i></div>${g.etapas.map((e,i)=>`<div style="position:absolute;left:${X(e.kg)}%;top:6px;transform:translateX(-50%);text-align:center"><div style="width:3px;height:18px;margin:0 auto;border-radius:2px;background:${i===g.etapa?'var(--chalk)':'var(--line2)'}"></div><div class="tiny n" style="margin-top:2px;color:${i===g.etapa?'var(--chalk)':'var(--steel2)'}">${fmtKg(e.kg)}</div></div>`).join('')}</div>`}
 return`<div class="panel" style="margin-top:16px;padding:16px">
 <div class="between"><h3>Painel</h3><span class="small mut">semana de ${fmtD(w[0])}</span></div>
 ${b?`<div class="between" style="margin-top:12px;align-items:flex-end"><div><div class="small mut">Peso agora</div><div class="x n" style="font-size:36px;font-weight:850;line-height:1.05">${fmtKg(b.atual)}<span class="small mut"> kg</span></div></div>
  ${g.peso_meta!=null?`<div style="text-align:right"><div class="small mut">Etapa ${g.etapa+1}${g.data_meta?' até '+fmtD(g.data_meta):''}</div><div class="x n" style="font-size:36px;font-weight:850;line-height:1.05">${fmtKg(g.peso_meta)}<span class="small mut"> kg</span></div></div>`:''}</div>${wbar}
  <p class="small mut" style="margin:10px 0 0">${b.falta?`Faltam ${fmtKg(Math.abs(b.falta))} kg`:'Etapa atingida'}${b.need!=null?`, ${fmtKg(Math.abs(b.need))} kg por semana`:''}${b.sugData?`, previsão ${fmtD(b.sugData)} no ritmo saudável`:''}.${b.rate!=null?` Seu ritmo: ${b.rate>0?'+':''}${fmtKg(b.rate)} kg/semana${b.need!=null&&b.rate!=null?(Math.abs(b.rate)>=Math.abs(b.need)&&Math.sign(b.rate)===Math.sign(b.need)?', no caminho':', abaixo do necessário'):''}.`:''}</p>`
 :`<p class="small mut" style="margin:10px 0 12px">Registre seu peso para acompanhar as etapas: ${g.etapas.map(e=>fmtKg(e.kg)+' kg').join(' → ')}.</p><button class="btn sm ghost" onclick="push('corpo')">Registrar peso</button>`}
 <div style="border-top:1px solid var(--line);margin:16px -16px 0;padding:14px 16px 0">
  <div class="between"><div class="seg" style="flex:1;max-width:240px"><button class="${mode==='fisico'?'on':''}" onclick="DASHV='fisico';render()">Físico</button><button class="${mode==='treino'?'on':''}" onclick="DASHV='treino';render()">Treino</button></div><button class="chip" style="padding:7px 11px" onclick="DASHS=DASHS==='front'?'back':'front';render()">${DASHS==='front'?'Ver costas':'Ver frente'}</button></div>
  <div class="flex" style="gap:14px;margin-top:12px;align-items:center"><div class="bodymap" style="flex:none;width:120px">${bodySVG(DASHS,fill)}</div>
  <div style="flex:1;min-width:0">${mode==='fisico'?`<div class="small mut">Avaliação por foto de ${fmtD(dk(new Date(ev.t)))}</div><div class="x n" style="font-size:30px;font-weight:850;color:${notaCor(ev.j.nota_geral)}">${fmtKg(ev.j.nota_geral)}<span class="small mut"> / 10</span></div>${pv?`<div class="small n" style="color:${ev.j.nota_geral>=pv.j.nota_geral?'var(--grn)':'var(--red)'}">${ev.j.nota_geral-pv.j.nota_geral>=0?'+':''}${fmtKg(Math.round((ev.j.nota_geral-pv.j.nota_geral)*10)/10)} vs anterior</div>`:'<div class="small mut">linha de base</div>'}
   <div class="small" style="margin-top:8px">${g.prioridades.map(k=>{const v=(ev.j.regioes||{})[k];return v?`<div class="between"><span>${GROUPS[k]}</span><b class="n" style="color:${notaCor(v.nota)}">${fmtKg(v.nota)} <span class="tiny" style="color:${tendCor(v.tendencia)}">${v.tendencia==='melhorou'?'▲':v.tendencia==='piorou'?'▼':'='}</span></b></div>`:''}).join('')}</div>`
   :`<div class="small mut">${ev?'':'Sem avaliação por foto ainda. '}Séries efetivas nos últimos 7 dias</div><div class="small" style="margin-top:8px">${g.prioridades.map(k=>`<div class="between"><span>${GROUPS[k]}</span><b class="n">${fmtKg(ws[k]||0)} / 12</b></div>`).join('')}</div>`}
   ${!ev||(Date.now()-ev.t)/864e5>14?`<button class="btn sm blue" style="margin-top:10px" onclick="push('avaliacao')">${ev?'Hora de nova avaliação':'Fazer avaliação por foto'}</button>`:`<button class="txtbtn" onclick="push('avaliacaoVer','${ev.id}')">Ver avaliação</button>`}</div></div>
 </div>
 <div class="strip" style="margin-top:14px;grid-template-columns:repeat(3,1fr)">
  <div><b>${forca}/${g.forca_sem}</b><span>academia</span></div><div><b style="color:${cf>g.crossfit_sem?'var(--yel)':'var(--chalk)'}">${cf}/${g.crossfit_sem}</b><span>CrossFit</span></div><div><b>${Math.round(card)}</b><span>min cardio</span></div>
 </div>
 <div class="strip" style="margin-top:8px;grid-template-columns:repeat(3,1fr)">
  <div><b>${diet!=null?Math.round(diet/4*100)+'%':'–'}</b><span>dieta</span></div><div><b>${agua!=null?fmtKg(Math.round(agua/100)/10)+' L':'–'}</b><span>água/dia</span></div><div><b style="color:${pr==null?'var(--chalk)':pr>=70?'var(--grn)':pr>=50?'var(--yel)':'var(--red)'}">${pr!=null?Math.round(pr):'–'}</b><span>prontidão</span></div>
 </div>
 <button class="txtbtn" style="margin-top:8px" onclick="push('perf')">Ver performance completa</button></div>`}
