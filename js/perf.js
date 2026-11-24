/* ===== Performance: metas, análise automática (sem internet) e análise do coach (IA) ===== */
const GROUPS={peito:'Peito',quad:'Coxa (frente)',gluteo:'Glúteo',posterior:'Posterior de coxa',dorsal:'Costas',ombro:'Ombros',biceps:'Bíceps',triceps:'Tríceps',panturrilha:'Panturrilha',abdomen:'Abdômen'};
const GOAL_DEF={peso_meta:null,gordura_meta:null,data_meta:null,prioridades:['peito','quad','gluteo'],forca_sem:4,crossfit_sem:2};
const goals=()=>Object.assign({},GOAL_DEF,S.cfg.goals||{});
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
function bodyTrend(){const B=Object.values(S.body).filter(b=>b.peso).sort(by('date'));if(!B.length)return null;const last=B[B.length-1];const g=goals();
 const prev=B.filter(b=>(parseDk(last.date)-parseDk(b.date))/864e5>=6).pop();const rate=prev?Math.round((last.peso-prev.peso)/((parseDk(last.date)-parseDk(prev.date))/(7*864e5))*100)/100:null;
 let need=null,weeksLeft=null;if(g.peso_meta){const tgt=g.data_meta?parseDk(g.data_meta):null;weeksLeft=tgt?Math.max(1,(tgt-new Date())/(7*864e5)):null;need=weeksLeft?Math.round((g.peso_meta-last.peso)/weeksLeft*100)/100:null}
 return{atual:last.peso,data:last.date,gordura:(B.filter(b=>b.gordura).pop()||{}).gordura,rate,need,weeksLeft,falta:g.peso_meta?Math.round((g.peso_meta-last.peso)*10)/10:null}}
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
V.metas=()=>{const g=goals();return`${hdr('Minhas metas')}
 <div class="g2"><div class="field"><label>Peso meta (kg)</label><input id="g_p" inputmode="decimal" value="${g.peso_meta!=null?fmtKg(g.peso_meta):''}"></div><div class="field"><label>Até quando</label><input id="g_d" type="date" value="${g.data_meta||''}"></div></div>
 <div class="field"><label>Gordura meta (%) · opcional</label><input id="g_g" inputmode="decimal" value="${g.gordura_meta!=null?fmtKg(g.gordura_meta):''}"></div>
 <div class="field"><label>Pontos que quer melhorar</label><div class="chips" id="g_pr">${Object.entries(GROUPS).map(([k,n])=>`<button class="chip ${g.prioridades.includes(k)?'on':''}" data-k="${k}" onclick="this.classList.toggle('on')">${n}</button>`).join('')}</div></div>
 <div class="g2"><div class="field"><label>Treinos de academia por semana</label><div class="seg" id="g_f">${[3,4,5].map(n=>`<button class="${g.forca_sem===n?'on':''}" onclick="segPick(this)">${n}</button>`).join('')}</div></div>
 <div class="field"><label>CrossFit por semana</label><div class="seg" id="g_c">${[0,1,2,3].map(n=>`<button class="${g.crossfit_sem===n?'on':''}" onclick="segPick(this)">${n}</button>`).join('')}</div></div></div>
 <p class="small mut">Com 4 ou mais treinos de academia, a sequência vira A, B, C, D. O Treino D é focado em peito, coxa e glúteo.</p>
 <button class="btn" style="margin-top:10px" onclick="saveGoals()">Salvar metas</button>`};
function segPick(b){b.parentNode.querySelectorAll('button').forEach(x=>x.classList.remove('on'));b.classList.add('on')}
function saveGoals(){const on=id=>+(($(id+' .on')||{}).textContent||0);S.cfg.goals={peso_meta:num($('#g_p').value)||null,data_meta:$('#g_d').value||null,gordura_meta:num($('#g_g').value)||null,prioridades:[...document.querySelectorAll('#g_pr .chip.on')].map(b=>b.dataset.k),forca_sem:on('#g_f')||4,crossfit_sem:on('#g_c')};touch('cfg/main');pop();toast('Metas salvas')}
/* ---- avaliação física por foto: antes × agora ---- */
let AV={};
V.avaliacao=()=>{const ev=Object.values(S.reports).filter(r=>r.kind==='foto').sort(by('t')).reverse();
 return`${hdr('Avaliação física')}<p class="small" style="margin-top:-6px">Mande de 1 a 3 fotos de hoje. O coach compara cada uma com a sua primeira foto na mesma pose e com a última, e diz o que mudou por região.</p>
 <div class="panel small mut" style="margin-top:10px">Mesmo lugar, mesma luz e distância, de manhã, em jejum, roupa de treino. Corpo inteiro no quadro.</div>
 <div class="g3" style="margin-top:12px">${['Frente','Lado','Costas'].map(p=>`<label class="drop" style="padding:14px 6px;${DB.assets||DB.sb?'':'opacity:.5;pointer-events:none'}">${AV[p]?`<img src="${AV[p].url}" style="width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:10px">`:I.cam}<b style="margin-top:6px">${p}</b><input type="file" accept="image/*" style="display:none" onchange="avPick('${p}',this.files[0])"></label>`).join('')}</div>
 <button class="btn" style="margin-top:12px" onclick="runAvaliacao()" ${aiOn()&&Object.keys(AV).length?'':'disabled'}>Avaliar meu físico</button>
 <div id="avout"></div>
 ${ev.length?`<div class="sec"><h3>Avaliações</h3></div><div class="rows">${ev.map(r=>`<button class="row" onclick="push('avaliacaoVer','${r.id}')"><div class="grow"><div class="t">${fmtD(dk(new Date(r.t)))}</div><div class="d">${(r.poses||[]).join(', ')}</div></div><span class="chev"></span></button>`).join('')}</div>`:''}`};
async function avPick(pose,f){if(!f)return;const blob=await shrink(await fileToImg(f),1600);AV[pose]={blob,url:URL.createObjectURL(blob)};render()}
async function runAvaliacao(){const o=$('#avout');const poses=Object.keys(AV);o.innerHTML='<div class="panel small"><span class="spin"></span> Guardando fotos…</div>';
 try{const items=[];for(const p of poses){const a=await uploadAsset(AV[p].blob);const all=Object.values(S.photos).filter(x=>x.pose===p).sort(by('t'));const first=all[0],prev=all[all.length-1];const id=uid('P');S.photos[id]={id,t:Date.now(),date:dk(),pose:p,asset:a.id,ai:''};touch('photos/'+id);items.push({p,id,blob:AV[p].blob,first,prev:prev&&prev!==first?prev:null})}
  o.innerHTML='<div class="panel md ai" id="avai"><span class="spin"></span> Coach comparando antes e agora…</div>';
  const imgs=[],lab=[];for(const it of items){if(it.first){try{imgs.push(await assetBlob(it.first.asset));lab.push(`${it.p}: primeira foto (${fmtD(it.first.date)})`)}catch(e){}}if(it.prev){try{imgs.push(await assetBlob(it.prev.asset));lab.push(`${it.p}: foto anterior (${fmtD(it.prev.date)})`)}catch(e){}}imgs.push(it.blob);lab.push(`${it.p}: hoje (${fmtD(dk())})`)}
  const t=await aiAsk(`Contexto (JSON): ${ctx(28)}
Metas e performance (JSON): ${JSON.stringify(perfSummary())}

Tarefa: avaliação física por foto. As ${imgs.length} imagens estão nesta ordem: ${lab.map((l,i)=>(i+1)+') '+l).join('; ')}.
Prioridades do atleta: ${goals().prioridades.map(p=>GROUPS[p]).join(', ')}. Avalie de forma objetiva e respeitosa, como um treinador experiente. Use estes títulos com "## ":
## Como você está hoje
## Antes × agora
## Região por região
## O que priorizar nas próximas 4 semanas
Em "Região por região", para peito, ombros, braços, costas, abdômen, coxas, glúteos e panturrilhas diga: melhorou, igual ou piorou desde a primeira foto, e uma frase do porquê. Diga quando a diferença pode ser luz, ângulo ou pump. Não chute percentual de gordura exato. Conecte as prioridades com treino (Treino D, séries por grupo) e dieta. Tópicos curtos com "- ".`,{images:imgs,tier:'complex',onText:streamInto('#avai')});
  const id=uid('R');S.reports[id]={id,t:Date.now(),kind:'foto',text:t,poses,items:items.map(it=>({pose:it.p,hoje:S.photos[it.id].asset,primeira:it.first&&it.first.asset,primeira_d:it.first&&it.first.date}))};touch('reports/'+id);AV={};push('avaliacaoVer',id)}
 catch(e){o.innerHTML=`<div class="panel small">${e&&e.code?aiErr(e):esc(e&&e.message||'Não deu certo. Tente de novo.')}</div>`}}
V.avaliacaoVer=id=>{const r=S.reports[id];if(!r)return hdr('Avaliação');
 return`${hdr('Avaliação de '+fmtD(dk(new Date(r.t))))}${(r.items||[]).map(it=>`<div class="sec" style="margin-top:8px"><h3>${it.pose}</h3></div><div class="${it.primeira?'g2':''}">${it.primeira?`<div><img class="media" ${assetAttr(it.primeira)} alt="Primeira foto"><div class="tiny mut" style="margin-top:4px">Antes, ${fmtD(it.primeira_d)}</div></div>`:''}<div><img class="media" ${assetAttr(it.hoje)} alt="Foto de hoje"><div class="tiny mut" style="margin-top:4px">Hoje</div></div></div>`).join('')}
 <div class="panel md ai" style="margin-top:14px">${md(r.text)}</div>`};
