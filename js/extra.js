/* ===== Extras: calorias por foto/texto, preparação para eventos, visão de qualquer dia, diário e contexto pessoal ===== */

/* --- kcal estimadas das opções da dieta (TACO / rótulos), na ordem de DIET.meals --- */
const MEAL_K=[[{k:405,p:30},{k:550,p:45}],[{k:540,p:45}],[{k:490,p:40},{k:395,p:32}],[{k:420,p:45}],[{k:105,p:2}]];
const MEAL_N=['Café da manhã','Almoço','Lanche da tarde','Jantar','Ceia','Fora de hora / extra'];
const NIVEL={dentro:{n:'Dentro do plano',c:'var(--grn)'},leve:{n:'Escape leve',c:'var(--yel)'},moderado:{n:'Escape moderado',c:'#e07a2f'},alto:{n:'Escape pesado',c:'var(--red)'}};
const mealPlan=(k,i)=>{const m=((S.days[k]||{}).meals)||{};const o=Math.min(m['o'+i]||0,MEAL_K[i].length-1);return MEAL_K[i][o]};
const foodsOn=k=>Object.values(S.foods||{}).filter(f=>f.date===k).sort(by('t'));
const kgNow=()=>{const b=typeof bodyTrend==='function'?bodyTrend():null;return b&&b.atual||100};

function dayKcal(k){const m=((S.days[k]||{}).meals)||{};const F=foodsOn(k);let kcal=0,p=0,alvo=0,reg=false;
 for(let i=0;i<5;i++){const pl=mealPlan(k,i);if(i<4)alvo+=pl.k;const fs=F.filter(f=>f.meal===i);
  if(fs.length){fs.forEach(f=>{kcal+=f.r.kcal||0;p+=f.r.p||0});reg=true}else if(m[i]){kcal+=pl.k;p+=pl.p;reg=true}}
 F.filter(f=>f.meal===5||f.meal==null).forEach(f=>{kcal+=f.r.kcal||0;p+=f.r.p||0;reg=true});
 return{kcal:Math.round(kcal),p:Math.round(p),alvo,reg,saldo:Math.round(kcal-alvo),furos:F.filter(f=>f.r.fora_do_plano).length}}
function weekKcal(){const ks=lastDays(7).filter(k=>k!==dk()||dayKcal(k).reg);let ex=0,n=0;ks.forEach(k=>{const d=dayKcal(k);if(!d.reg)return;n++;ex+=Math.max(0,d.saldo)});
 const kcalMin=6*3.5*kgNow()/200;return{dias:n,excesso:Math.round(ex),gordura_g:Math.round(ex/7.7),z2_min:Math.round(ex/kcalMin)}}

/* --- painel de calorias dentro da aba Dieta --- */
function kcalPanel(k){const d=dayKcal(k);const F=foodsOn(k);const pct=Math.min(130,d.kcal/d.alvo*100);const over=d.saldo>0;const w=weekKcal();
 return`<div class="sec"><h3>Calorias</h3><button onclick="push('prato','${k}')">Registrar prato</button></div>
 <div class="panel"><div class="between" style="align-items:flex-end"><div><div class="x n" style="font-size:32px;font-weight:850;line-height:1">${d.kcal}<span class="small mut"> kcal</span></div><div class="small mut" style="margin-top:4px">plano ${d.alvo} kcal${d.p?', '+d.p+' g de proteína':''}</div></div>
 <span class="tag"><i style="background:${!d.reg?'var(--steel2)':over?(d.saldo>500?'var(--red)':'var(--yel)'):'var(--grn)'}"></i>${!d.reg?'Sem registro':over?'+'+d.saldo+' kcal':d.saldo===0?'No alvo':d.saldo+' kcal'}</span></div>
 <div class="bar" style="margin:14px 0 4px;position:relative"><i style="width:${pct/1.3}%;background:${over?(d.saldo>500?'var(--red)':'var(--yel)'):'var(--grn)'}"></i><b style="position:absolute;left:${100/1.3}%;top:-3px;bottom:-3px;width:2px;background:var(--chalk)"></b></div>
 <p class="tiny mut" style="margin:6px 0 0">Refeição marcada conta o valor do plano. Prato registrado substitui a refeição.</p>
 ${F.length?`<div class="rows" style="margin-top:12px">${F.map(foodRow).join('')}</div>`:''}
 <button class="btn ghost" style="margin-top:12px" onclick="push('prato','${k}')">${I.cam} Foto do prato ou furo de dieta</button></div>
 ${w.excesso>0?`<div class="panel small"><b>Últimos 7 dias:</b> ${w.excesso} kcal acima do plano em ${w.dias} dia(s) registrados. Isso equivale a cerca de ${w.gordura_g} g de gordura, ou ${w.z2_min} min de cardio Z2 para empatar.</div>`:''}`}
function foodRow(f){const n=NIVEL[f.r.nivel]||NIVEL[f.r.fora_do_plano?'moderado':'dentro'];return`<button class="row" onclick="push('pratoVer','${f.id}')">${f.asset?`<img ${assetAttr(f.asset)} alt="" style="width:44px;height:44px;border-radius:10px;object-fit:cover;flex:none">`:`<span class="sw" style="background:${n.c}"></span>`}<div class="grow"><div class="t">${esc(f.r.titulo||f.desc||'Refeição')}</div><div class="d">${MEAL_N[f.meal??5]}, ${Math.round(f.r.kcal||0)} kcal${f.r.fora_do_plano?', '+n.n.toLowerCase():''}</div></div><span class="chev"></span></button>`}

/* --- registrar prato --- */
let PR={k:null,meal:null,desc:'',file:null,url:null};
function guessMeal(){const h=new Date().getHours();return h<11?0:h<15?1:h<19?2:h<22?3:4}
V.prato=(k)=>{if(PR.k!==(k||dk())){PR={k:k||dk(),meal:k&&k!==dk()?5:guessMeal(),desc:'',file:null,url:null}}
 const can=aiOn();
 return`${hdr('Registrar prato')}<p class="small mut" style="margin-top:-6px">${PR.k===dk()?'Hoje':fmtD(PR.k)}. Mande a foto, escreva o que comeu, ou os dois. A IA estima as calorias e compara com o plano.</p>
 <div class="field" style="margin-top:14px"><label>Qual refeição</label><div class="chips">${MEAL_N.map((n,i)=>`<button class="chip ${PR.meal===i?'on':''}" onclick="PR.meal=${i};render()">${n}</button>`).join('')}</div></div>
 <label class="drop">${PR.url?`<img src="${PR.url}" alt="Prato" style="max-height:240px;border-radius:12px;margin:0 auto 8px;display:block">`:I.cam}<b>${PR.url?'Trocar foto':'Foto do prato'}</b>${PR.url?'':'De cima, com o prato inteiro no quadro'}<input type="file" accept="image/*" style="display:none" onchange="prPick(this.files[0])"></label>
 <div class="field" style="margin-top:14px"><label>O que comeu e quanto</label><textarea id="prd" rows="3" oninput="PR.desc=this.value" placeholder="Ex.: 3 fatias de pizza calabresa e 1 lata de Coca. Ou: hambúrguer duplo com batata média">${esc(PR.desc)}</textarea></div>
 ${can?'':`<div class="field"><label>Sem IA agora: informe as calorias</label><input id="prk" inputmode="numeric" placeholder="kcal"></div>`}
 <button class="btn" onclick="prSend()">${can?'Calcular calorias':'Salvar'}</button><div id="prout" style="margin-top:12px"></div>`};
function prPick(f){if(!f)return;PR.file=f;if(PR.url)URL.revokeObjectURL(PR.url);PR.url=URL.createObjectURL(f);render()}
async function prSend(){const o=$('#prout');PR.desc=($('#prd')||{}).value||PR.desc;
 if(!PR.file&&!PR.desc.trim()){toast('Mande a foto ou escreva o que comeu');return}
 if(!aiOn()){const kc=num(($('#prk')||{}).value);if(!kc){toast('Informe as calorias');return}saveFood({titulo:PR.desc.slice(0,60),itens:[],kcal:kc,p:0,c:0,g:0,fora_do_plano:PR.meal===5||kc>(PR.meal<5?mealPlan(PR.k,PR.meal).k*1.2:0),nivel:''},null);return}
 o.innerHTML='<div class="panel small"><span class="spin"></span> Olhando o prato e calculando…</div>';
 try{let blob=null;if(PR.file)blob=await shrink(await fileToImg(PR.file),1280);
  const r=await aiFood(blob,PR.desc,PR.meal,PR.k);let asset=null;if(blob){try{asset=(await uploadAsset(blob)).id}catch(e){}}saveFood(r,asset)}
 catch(e){o.innerHTML=`<div class="panel small">${e&&e.code?aiErr(e):esc(e&&e.message||'Não consegui calcular.')}</div>`}}
function saveFood(r,asset){const id=uid('F');const k=PR.k;S.foods[id]={id,t:Date.now(),date:k,meal:PR.meal,desc:PR.desc,asset,r};touch('foods/'+id);
 if(PR.meal<5){const d=day(k);d.meals=d.meals||{};d.meals[PR.meal]=!r.fora_do_plano;d.wt=Date.now();touch('days/'+k)}
 PR={k:null};STACK.pop();push('pratoVer',id)}
async function aiFood(blob,desc,meal,k){const d=dayKcal(k);const ml=meal<5?DIET.meals[meal]:null;const pl=meal<5?mealPlan(k,meal):null;const g=goals();
 const t=await aiAsk(`Contexto do atleta (JSON): ${ctx(7)}

Tarefa: estimar as calorias do que ele comeu${blob?' (foto anexada)':''} e comparar com o plano.
Refeição: ${MEAL_N[meal]}${ml?'. Prescrição do plano: '+ml.opts.map(o=>o.n+': '+o.i.join('; ')).join(' | ')+'. Valor do plano: cerca de '+pl.k+' kcal e '+pl.p+' g de proteína':'. Fora das refeições do plano'}.
Descrição dele: """${desc||'(sem texto, use a foto)'}"""
Já consumido no dia antes disto: ${d.kcal} kcal de um plano de ${d.alvo} kcal. Peso atual ~${kgNow()} kg${g.peso_meta?', meta '+g.peso_meta+' kg':''}.
Estime porções pelo tamanho visível (prato, talher, embalagem) e use a tabela TACO e rótulos brasileiros. Bebidas contam (refrigerante, suco, álcool).
Responda SOMENTE com JSON válido:
{"titulo":"nome curto do prato","itens":[{"nome":"","porcao":"ex. 150 g ou 2 fatias","kcal":0,"p":0,"c":0,"g":0}],"kcal":0,"p":0,"c":0,"g":0,"fora_do_plano":true,"nivel":"dentro|leve|moderado|alto","vs_plano":"comparação com a refeição prescrita, 1 frase com a diferença em kcal","impacto":"o que isso representa no dia e na meta de peso, 1 a 2 frases, honesto e sem drama","proximo_passo":"o que fazer na próxima refeição e no treino para seguir em frente, sem jejum compensatório nem punição","confianca":"alta|media|baixa"}
nivel: dentro = até ~15% acima do plano e alimentos parecidos; leve = até ~300 kcal acima; moderado = 300 a 700; alto = acima de 700 ou álcool em quantidade.`,{images:blob?[blob]:undefined,tier:'default'});
 const r=parseJSON(t);if(!r||r.kcal==null)throw{message:'A IA não devolveu um cálculo legível. Tente outra foto ou descreva o prato.'};
 ['kcal','p','c','g'].forEach(x=>r[x]=Math.round(+r[x]||0));return r}
V.pratoVer=id=>{const f=S.foods[id];if(!f)return hdr('Prato');const r=f.r;const n=NIVEL[r.nivel]||(r.fora_do_plano?NIVEL.moderado:NIVEL.dentro);const d=dayKcal(f.date);
 return`${hdr(esc(r.titulo||'Prato'))}<p class="small mut" style="margin-top:-6px">${MEAL_N[f.meal??5]}, ${fmtD(f.date)}</p>
 ${f.asset?`<img class="media" ${assetAttr(f.asset)} alt="Foto do prato" style="margin-top:10px">`:''}
 <div class="panel" style="margin-top:12px"><div class="between" style="align-items:flex-end"><div class="x n" style="font-size:38px;font-weight:850;line-height:1">${r.kcal}<span class="small mut"> kcal</span></div><span class="tag"><i style="background:${n.c}"></i>${n.n}</span></div>
 <div class="strip" style="margin-top:14px;border:0;background:none"><div><b>${r.p}</b><span>proteína g</span></div><div><b>${r.c}</b><span>carbo g</span></div><div><b>${r.g}</b><span>gordura g</span></div><div><b>${d.kcal}</b><span>kcal no dia</span></div></div></div>
 ${(r.vs_plano||r.impacto||r.proximo_passo)?`<div class="panel ai">${r.vs_plano?`<p style="margin:0 0 8px">${esc(r.vs_plano)}</p>`:''}${r.impacto?`<p style="margin:0 0 8px">${esc(r.impacto)}</p>`:''}${r.proximo_passo?`<p style="margin:0"><b>Próximo passo:</b> ${esc(r.proximo_passo)}</p>`:''}</div>`:''}
 ${(r.itens||[]).length?`<div class="sec"><h3>Itens</h3>${r.confianca?`<span class="small mut">confiança ${esc(r.confianca)}</span>`:''}</div><div class="panel" style="padding:6px 14px"><table class="lab">${r.itens.map(i=>`<tr><td><b>${esc(i.nome)}</b><div class="tiny mut">${esc(i.porcao||'')}</div></td><td class="v">${Math.round(i.kcal||0)} <span class="tiny mut">kcal</span></td></tr>`).join('')}</table></div>`:''}
 <div class="field" style="margin-top:14px"><label>Ajustar calorias, se souber o valor certo</label><div class="flex"><input id="pk" inputmode="numeric" value="${r.kcal}"><button class="btn sm" onclick="S.foods['${id}'].r.kcal=num($('#pk').value);touch('foods/${id}');render();toast('Atualizado')">Salvar</button></div></div>
 <button class="txtbtn" style="margin-top:8px;color:var(--red)" onclick="ask('Apagar este registro?',()=>{drop('foods','${id}');pop()},'Apagar')">Apagar registro</button>`};

/* ===== Preparação para eventos ===== */
const EVT={
 legendarios:{n:'Legendários (TOP)',d:'Cerca de 3 a 4 dias ao ar livre: caminhadas longas com mochila, esforço físico prolongado, pouco sono, alimentação restrita e em horários imprevisíveis, calor, frio ou chuva, desafios em grupo e forte carga emocional.'},
 corrida:{n:'Prova de corrida',d:'Distância: . Tempo alvo: .'},
 crossfit:{n:'Competição de CrossFit',d:'Formato, número de WODs e categoria: .'},
 trilha:{n:'Trilha ou travessia',d:'Distância, desnível e se vai com mochila: .'},
 outro:{n:'Outro desafio',d:''}};
const nextEvent=()=>Object.values(S.events||{}).filter(e=>(e.end||e.date)>=dk()).sort(by('date'))[0];
const daysTo=k=>Math.round((parseDk(k)-parseDk(dk()))/864e5);
function eventCard(){const e=nextEvent();if(!e||daysTo(e.date)>45)return'';const n=daysTo(e.date);const p=e.plan;const hoje=p&&p.dias&&p.dias.find(x=>x.data===dk());
 return`<button class="panel" style="margin-top:16px;width:100%;text-align:left;border-color:var(--yel)" onclick="push('evento','${e.id}')"><div class="between"><h3>${esc(e.name)}</h3><span class="tag"><i style="background:var(--yel)"></i>${n>0?'faltam '+n+' dia'+(n>1?'s':''):n===0?'é hoje':'em andamento'}</span></div>
 <p class="small ${hoje?'':'mut'}" style="margin:8px 0 0">${hoje?'<b>Hoje:</b> '+esc(hoje.titulo||'')+(hoje.treino?'. '+esc(hoje.treino):''):p?'Abrir o plano de preparação':'Gere o plano de preparação com o coach'}</p></button>`}
V.eventos=()=>{const E=Object.values(S.events||{}).sort(by('date')).reverse();
 return`${hdr('Preparar para um evento')}<p class="small mut" style="margin-top:-6px">Legendários, prova, competição ou trilha. O coach monta o que fazer em cada dia até lá: treino, comida, sono, o que levar e como recuperar depois.</p>
 <button class="btn" style="margin:14px 0" onclick="push('eventoNovo')">Novo evento</button>
 ${E.length?`<div class="rows">${E.map(e=>`<button class="row" onclick="push('evento','${e.id}')"><span class="sw" style="background:${(e.end||e.date)>=dk()?'var(--yel)':'var(--steel2)'}"></span><div class="grow"><div class="t">${esc(e.name)}</div><div class="d">${fmtD(e.date)}${e.end&&e.end!==e.date?' a '+fmtD(e.end):''}${(e.end||e.date)>=dk()?', faltam '+Math.max(0,daysTo(e.date))+' dias':''}</div></div><span class="chev"></span></button>`).join('')}</div>`:''}`};
let EV={tipo:'legendarios'};
V.eventoNovo=()=>{const t=EVT[EV.tipo];const d=new Date();d.setDate(d.getDate()+3);
 return`${hdr('Novo evento')}<div class="field"><label>Tipo</label><div class="chips">${Object.entries(EVT).map(([k,v])=>`<button class="chip ${EV.tipo===k?'on':''}" onclick="EV.tipo='${k}';render()">${v.n}</button>`).join('')}</div></div>
 <div class="field"><label>Nome</label><input id="ev_n" value="${esc(EV.tipo==='outro'?'':t.n)}" placeholder="Ex.: Meia de Rio Preto"></div>
 <div class="g2"><div class="field"><label>Começa</label><input id="ev_d" type="date" value="${dk(d)}" min="${dk()}"></div><div class="field"><label>Termina</label><input id="ev_e" type="date" value="${EV.tipo==='legendarios'?dk(new Date(d.getTime()+3*864e5)):dk(d)}"></div></div>
 <div class="field"><label>Como é o evento</label><textarea id="ev_x" rows="4">${esc(t.d)}</textarea><p class="tiny mut" style="margin:6px 0 0">Quanto mais detalhe (distância, carga da mochila, clima, objetivo), melhor o plano.</p></div>
 <div class="field"><label>Seu objetivo</label><input id="ev_o" placeholder="Ex.: chegar inteiro, sem lesão, aproveitar a experiência"></div>
 <button class="btn" onclick="saveEvent()">Salvar e gerar plano</button>`};
function saveEvent(){const name=$('#ev_n').value.trim()||EVT[EV.tipo].n,date=$('#ev_d').value,end=$('#ev_e').value||date;if(!date){toast('Informe a data');return}
 const id=uid('E');S.events[id]={id,t:Date.now(),tipo:EV.tipo,name,date,end:end<date?date:end,desc:$('#ev_x').value,obj:$('#ev_o').value,plan:null,done:{}};touch('events/'+id);STACK.pop();push('evento',id);if(aiOn())setTimeout(()=>genEvent(id),50)}
async function aiEvent(e){const n=Math.max(0,daysTo(e.date));
 const t=await aiAsk(`Contexto do atleta (JSON): ${ctx(21)}

Tarefa: ele vai participar de "${e.name}" (${EVT[e.tipo].n}) de ${e.date} a ${e.end}. Faltam ${n} dia(s). Descrição: ${e.desc||'-'}. Objetivo: ${e.obj||'chegar bem e com boa performance'}.
Monte a preparação como coach e nutricionista esportivo, considerando a carga recente, o check-in, as dores, o sono e o contexto pessoal dele. Regra de ouro: perto do evento não se ganha condicionamento, se ganha frescor. Nada de treino novo ou pesado nos últimos dias, nada de comida diferente na véspera, chegar descansado e hidratado.
Responda SOMENTE com JSON válido:
{"resumo":"2 a 3 frases motivadoras e realistas sobre como ele chega e qual a estratégia","dias":[{"data":"AAAA-MM-DD","titulo":"foco do dia em poucas palavras","treino":"o que fazer (ou descanso), com duração e intensidade","comida":"ajuste da dieta do plano nesse dia","sono":"meta de sono e recuperação"}],"levar":["itens de equipamento, roupa, pés, alimentação e hidratação para levar"],"vespera":["checklist da noite anterior e da manhã"],"durante":["estratégia durante o evento: ritmo, comida, água, eletrólitos, pés, cabeça"],"depois":["recuperação nos 3 dias seguintes"],"alertas":["sinais para parar ou procurar ajuda"]}
Inclua um item em "dias" para cada dia de hoje (${dk()}) até a véspera (${n} itens no total, ou 1 se for hoje). Use a dieta escrita como base.`,{tier:'complex'});
 const r=parseJSON(t);if(!r)throw{message:'A IA não devolveu o plano. Tente de novo.'};return r}
async function genEvent(id){const e=S.events[id];const o=$('#evout');if(o)o.innerHTML='<div class="panel small"><span class="spin"></span> Montando sua preparação dia a dia…</div>';
 try{e.plan=await aiEvent(e);e.planAt=Date.now();e.done={};touch('events/'+id);render()}catch(x){const o2=$('#evout');if(o2)o2.innerHTML=`<div class="panel small">${x&&x.code?aiErr(x):esc(x&&x.message||'Erro')}</div>`}}
function evTog(id,key){const e=S.events[id];e.done=e.done||{};e.done[key]=!e.done[key];touch('events/'+id);render()}
const evList=(e,arr,key)=>`<div class="rows">${(arr||[]).map((t,i)=>{const kk=key+i;const on=(e.done||{})[kk];return`<button class="row" onclick="evTog('${e.id}','${kk}')"><span style="width:22px;height:22px;border-radius:7px;border:2px solid ${on?'var(--grn)':'var(--line2)'};background:${on?'var(--grn)':'none'};flex:none"></span><div class="grow" style="${on?'text-decoration:line-through;color:var(--steel2)':''}">${esc(t)}</div></button>`}).join('')}</div>`;
V.evento=id=>{const e=(S.events||{})[id];if(!e)return hdr('Evento');const p=e.plan;const n=daysTo(e.date);
 return`${hdr(esc(e.name))}<p class="small mut" style="margin-top:-6px">${fmtD(e.date)}${e.end!==e.date?' a '+fmtD(e.end):''}${n>0?', faltam '+n+' dias':n===0?', é hoje':''}</p>
 <div id="evout">${!p?`<div class="panel"><p class="small mut" style="margin:0 0 12px">${aiOn()?'Ainda sem plano.':'A IA precisa de internet para montar o plano.'}</p><button class="btn sm blue" onclick="genEvent('${id}')" ${aiOn()?'':'disabled'}>Gerar plano de preparação</button></div>`:''}</div>
 ${p?`<div class="panel ai" style="margin-top:12px"><p style="margin:0">${esc(p.resumo||'')}</p></div>
 <div class="sec"><h3>Dia a dia</h3></div>${(p.dias||[]).map((d,i)=>{const kk='d'+i;const on=(e.done||{})[kk];const today=d.data===dk();return`<div class="panel" style="${today?'border-color:var(--yel)':''}"><div class="between"><h3>${today?'Hoje':esc(d.data?DOW[parseDk(d.data).getDay()]+', '+fmtD(d.data):'Dia '+(i+1))}: ${esc(d.titulo||'')}</h3><button onclick="evTog('${id}','${kk}')" aria-label="Feito" style="width:30px;height:30px;border-radius:9px;border:2px solid ${on?'var(--grn)':'var(--line2)'};background:${on?'var(--grn)':'none'};flex:none"></button></div>
  <div class="small" style="margin-top:8px;line-height:1.6">${d.treino?`<div><b>Treino:</b> ${esc(d.treino)}</div>`:''}${d.comida?`<div><b>Comida:</b> ${esc(d.comida)}</div>`:''}${d.sono?`<div><b>Sono:</b> ${esc(d.sono)}</div>`:''}</div></div>`}).join('')}
 ${[['vespera','Véspera e manhã do evento'],['levar','O que levar'],['durante','Durante'],['depois','Depois: recuperação'],['alertas','Sinais para parar']].map(([k,t])=>(p[k]||[]).length?`<div class="sec"><h3>${t}</h3></div>${evList(e,p[k],k)}`:'').join('')}
 <button class="btn ghost" style="margin-top:18px" onclick="ask('Refazer o plano com os dados de hoje?',()=>genEvent('${id}'),'Refazer')" ${aiOn()?'':'disabled'}>Refazer plano com os dados de hoje</button>`:''}
 <button class="txtbtn" style="margin-top:14px;color:var(--red)" onclick="ask('Apagar este evento?',()=>{drop('events','${id}');pop()},'Apagar')">Apagar evento</button>`};

/* ===== Qualquer dia: o que aconteceu e como foi ===== */
function dayUnits(k){let u=0;Object.values(S.logs).filter(l=>l.date===k).forEach(l=>{const p=l.sets.filter(s=>s.pse).map(s=>s.pse);u+=Math.round((l.end-l.start)/6e4)*(p.length?p.reduce((a,b)=>a+b,0)/p.length:7)});Object.values(S.cardio).filter(c=>c.date===k).forEach(c=>u+=num(c.min)*(c.pse||(c.mod==='crossfit'?8:5)));return Math.round(u)}
V.dia=k=>{k=k||dk();const D=S.days[k]||{};const r=readiness(k);const acts=doneOn(k);const kc=dayKcal(k);const h=D.health;const N=D.notes||[];const c=D.ci;
 const prev=parseDk(k);prev.setDate(prev.getDate()-1);const nx=parseDk(k);nx.setDate(nx.getDate()+1);
 const avgU=Math.round(lastDays(28).reduce((s,x)=>s+dayUnits(x),0)/28);
 return`${hdr(k===dk()?'Hoje':DOW[parseDk(k).getDay()]+', '+fmtD(k))}
 <div class="between" style="margin:-4px 0 12px"><button class="ib" onclick="STACK[STACK.length-1][1]=['${dk(prev)}'];render()" aria-label="Dia anterior">${I.back}</button><input type="date" value="${k}" max="${dk()}" style="width:auto" onchange="if(this.value){STACK[STACK.length-1][1]=[this.value];render()}"><button class="ib" ${k>=dk()?'disabled style="opacity:.3;transform:scaleX(-1)"':'style="transform:scaleX(-1)"'} onclick="STACK[STACK.length-1][1]=['${dk(nx)}'];render()" aria-label="Próximo dia">${I.back}</button></div>
 <div class="strip"><div><b>${r?r.score:'–'}</b><span>prontidão</span></div><div><b>${dayUnits(k)}</b><span>carga (média ${avgU})</span></div><div><b>${kc.reg?kc.kcal:'–'}</b><span>kcal</span></div><div><b>${fmtKg((D.water||0)/1000)}</b><span>L de água</span></div></div>
 <div id="diaai" class="panel md ai" style="margin-top:12px;${D.dia_ai?'':'display:none'}">${D.dia_ai?md(D.dia_ai):''}</div>
 <button class="btn ${D.dia_ai?'ghost':'blue'}" style="margin-top:12px" onclick="genDay('${k}')" ${aiOn()?'':'disabled'}>${D.dia_ai?'Refazer leitura do coach':'Como foi meu dia? Leitura do coach'}</button>
 <div class="sec"><h3>Treinos</h3></div>${acts.length?`<div class="rows">${acts.map(a=>`<button class="row" onclick="${a.ed}"><span class="sw" style="background:${a.c}"></span><div class="grow"><div class="t">${a.t}</div><div class="d">${a.d}</div></div><span class="chev"></span></button>`).join('')}</div>`:`<div class="panel small mut">Nenhum treino registrado.</div>`}
 <div class="sec"><h3>Check-in</h3></div>${c?`<div class="panel small">${SCALES.map(s=>`<div class="between" style="padding:3px 0"><span class="mut">${s.n}</span><b style="color:${SCALE_COL[c[s.k]||3]}">${c[s.k]||3}/5</b></div>`).join('')}${Object.keys(c.pain||{}).length?`<p style="margin:8px 0 0"><b>Dores:</b> ${Object.entries(c.pain).map(([g,v])=>regName(g)+' '+PAIN[v.l].n.toLowerCase()).join(', ')}</p>`:''}${c.obs?`<p style="margin:8px 0 0">${esc(c.obs)}</p>`:''}</div>`:`<div class="panel small mut">Sem check-in neste dia.</div>`}
 <div class="sec"><h3>Comida</h3><button onclick="DK='${k}';go('dieta')">Abrir dieta</button></div><div class="panel small">${kc.reg?`${kc.kcal} kcal de ${kc.alvo} do plano (${kc.saldo>0?'+':''}${kc.saldo}). ${dietDone(k)}/4 refeições do plano${kc.furos?', '+kc.furos+' fora do plano':''}.`:'Nada registrado.'}</div>${foodsOn(k).length?`<div class="rows">${foodsOn(k).map(foodRow).join('')}</div>`:''}
 ${h?`<div class="sec"><h3>Apple Saúde</h3></div><div class="panel small">${HK.filter(([x])=>h[x]).map(([x,n,u])=>`<div class="between" style="padding:3px 0"><span class="mut">${n}</span><b>${h[x]} ${u}</b></div>`).join('')}</div>`:''}
 <div class="sec"><h3>Anotações</h3></div>${N.length?`<div class="panel small">${N.map(n=>`<p style="margin:0 0 6px"><span class="tiny mut">${new Date(n.t).toTimeString().slice(0,5)}${n.src==='wa'?' · WhatsApp':''}</span> ${esc(n.txt)}</p>`).join('')}</div>`:''}
 <div class="flex"><input id="dnote" placeholder="Anotar algo deste dia"><button class="btn sm" onclick="addNote('${k}',$('#dnote').value)">Anotar</button></div>`};
async function genDay(k){const o=$('#diaai');o.style.display='';o.innerHTML='<span class="spin"></span> Lendo o dia…';
 try{const t=await aiAsk(`Contexto (JSON): ${ctx(21)}

Detalhe do dia ${k} (JSON): ${JSON.stringify(dayDetail(k))}

Tarefa: o atleta quer saber como foi o dia ${k}${k===dk()?' (hoje)':''}. Como coach, em até 10 linhas:
- desempenho do dia: compare cargas, reps, PSE, pace ou FC com as sessões parecidas anteriores e com a média de carga dele;
- o que explica o resultado: sono, check-in, estresse, comida, água, anotações e contexto pessoal;
- comida e calorias do dia em relação ao plano;
- uma frase de motivação verdadeira, baseada no que ele fez de bom;
- o ajuste para o próximo treino.
Tópicos curtos com "- ".`,{tier:'default',onText:streamInto('#diaai')});
  day(k).dia_ai=t;touch('days/'+k)}catch(e){o.innerHTML=`<p class="mut">${aiErr(e)}</p>`}}
function dayDetail(k){const D=S.days[k]||{};return{checkin:D.ci||null,prontidao:readiness(k),carga_sRPE:dayUnits(k),
 forca:Object.values(S.logs).filter(l=>l.date===k).map(l=>({sessao:SESS[l.sess].name,min:Math.round((l.end-l.start)/6e4),series:l.sets.map(s=>(EX[s.id]?EX[s.id].n:s.id)+' '+fmtKg(s.kg)+'×'+s.reps+(s.pse?'@'+s.pse:''))})),
 cardio:Object.values(S.cardio).filter(c=>c.date===k).map(c=>({tipo:ACT[c.mod].n,min:c.min,km:c.km||undefined,fc:c.fc||undefined,pse:c.pse||undefined,obs:c.notes||undefined})),
 comida:dayKcal(k),pratos:foodsOn(k).map(f=>({refeicao:MEAL_N[f.meal??5],prato:f.r.titulo||f.desc,kcal:f.r.kcal,fora_do_plano:f.r.fora_do_plano})),agua_l:(D.water||0)/1000,saude_apple:D.health||null,anotacoes:(D.notes||[]).map(n=>n.txt)}}

/* ===== Diário: anote qualquer coisa, a IA organiza ===== */
function addNote(k,txt){txt=(txt||'').trim();if(!txt)return;const d=day(k);d.notes=d.notes||[];d.notes.push({t:Date.now(),txt});d.wt=Date.now();touch('days/'+k);render();toast('Anotado');if(aiOn())organize(k,txt)}
function noteBox(){return`<div class="sec"><h3>Anotar</h3><button onclick="push('dia','${dk()}')">Ver o dia</button></div>
 <div class="panel"><textarea id="qnote" rows="2" placeholder="Qualquer coisa: dormi mal, bebi 2 cervejas, comi um pastel, treinei 40 min de bike, reunião tensa"></textarea>
 <div class="flex" style="margin-top:10px;justify-content:space-between"><span class="tiny mut">${aiOn()?'A IA registra o que der (água, comida com kcal, treino, peso, check-in)':'Fica salvo no diário do dia'}</span><button class="btn sm" onclick="addNote(dk(),$('#qnote').value)">Anotar</button></div><div id="qout"></div></div>`}
async function organize(k,txt){try{const t=await aiAsk(`Contexto (JSON): ${ctx(3)}

O atleta anotou no diário do dia ${k}: """${txt}"""
Transforme em registros do app quando fizer sentido. Responda SOMENTE com JSON:
{"acoes":[...],"resposta":"resposta curta de coach, até 2 linhas, acolhedora e motivadora quando ele estiver mal"}
Tipos: {"tipo":"agua","ml":500} | {"tipo":"refeicao","n":0,"feita":true} (n: 0 café, 1 almoço, 2 lanche, 3 jantar, 4 ceia; só quando ele disser que seguiu o plano) | {"tipo":"alimento","n":5,"titulo":"","kcal":0,"p":0,"c":0,"g":0,"fora_do_plano":true,"nivel":"dentro|leve|moderado|alto","impacto":"1 frase","proximo_passo":"1 frase"} (comida ou bebida fora do plano, inclusive álcool; n 0-4 se substituiu uma refeição, 5 se foi extra) | {"tipo":"cardio","mod":"z2|corrida|bike|natacao|crossfit","min":0,"km":0,"fc":0,"pse":0} | {"tipo":"peso","kg":0} | {"tipo":"checkin","fadiga":1-5,"sono":1-5,"dor":1-5,"estresse":1-5,"humor":1-5,"obs":""} (só se ele falar de como está; 5 = melhor; use 3 no que não falou).
Se for só desabafo ou observação, "acoes":[] e responda.`,{tier:'quick'});
 const r=parseJSON(t);if(!r)return;applyActions(k,r.acoes||[],'app');const o=$('#qout');if(o&&r.resposta)o.innerHTML=`<p class="small" style="margin:10px 0 0">${esc(r.resposta)}</p>`;render();const o2=$('#qout');if(o2&&r.resposta)o2.innerHTML=`<p class="small ai" style="margin:10px 0 0">${esc(r.resposta)}</p>`}catch(e){}}
function applyActions(k0,acts,src){acts.forEach(a=>{const k=/^\d{4}-\d{2}-\d{2}$/.test(a.data||'')?a.data:k0;
 if(a.tipo==='alimento'||(a.tipo==='foto_refeicao'&&a.kcal)){const id=uid('F');const meal=a.n!=null&&+a.n>=0&&+a.n<=5?+a.n:5;S.foods[id]={id,t:Date.now(),date:k,meal,desc:a.descricao||a.titulo||'',asset:a.foto||null,src,r:{titulo:a.titulo||a.descricao||'Refeição',itens:a.itens||[],kcal:Math.round(+a.kcal||0),p:Math.round(+a.p||0),c:Math.round(+a.c||0),g:Math.round(+a.g||0),fora_do_plano:a.fora_do_plano!==false,nivel:a.nivel||'',vs_plano:a.vs_plano||'',impacto:a.impacto||'',proximo_passo:a.proximo_passo||''}};touch('foods/'+id);
  if(meal<5){const d=day(k);d.meals=d.meals||{};d.meals[meal]=a.fora_do_plano===false;touch('days/'+k)}}
 else if(a.tipo==='cardio'&&+a.min){const id=uid('C');S.cardio[id]={id,t:Date.now(),date:k,mod:ACT[a.mod]?a.mod:'z2',min:+a.min,km:+a.km||0,fc:+a.fc||0,kcal:+a.kcal||0,pse:+a.pse||null,notes:a.notas||'',src};touch('cardio/'+id)}
 else if(a.tipo==='peso'&&+a.kg){const id=uid('B');S.body[id]={id,t:Date.now(),date:k,peso:+a.kg};touch('body/'+id)}
 else if(a.tipo==='nota'&&a.texto&&src!=='app'){const d=day(k);d.notes=d.notes||[];d.notes.push({t:Date.now(),txt:a.texto,src:'wa'});touch('days/'+k)}
 else if(['agua','refeicao','checkin'].includes(a.tipo))applyInbox({t:Date.now(),acoes:[{...a,data:k}],silent:true})})}

/* ===== O que o coach precisa saber sobre você ===== */
V.contexto=()=>`${hdr('O que o coach sabe de você')}<p class="small mut" style="margin-top:-6px">Vai junto em toda leitura da IA. Rotina de trabalho, horários, remédios que você toma, como reage a noites mal dormidas, o que te motiva, o que te trava. Escreva do seu jeito e atualize quando mudar.</p>
 <textarea id="ctxt" rows="10" style="margin-top:12px" maxlength="3000" placeholder="Ex.: Tenho agência, rotina de reuniões de manhã. Treino no fim da tarde. Quando durmo mal fico sem energia e tendo a desistir do treino, preciso de um empurrão. Tomo ... receitado pelo médico.">${esc(S.cfg.contexto||'')}</textarea>
 <button class="btn" style="margin-top:12px" onclick="S.cfg.contexto=$('#ctxt').value;touch('cfg/main');pop();toast('Salvo. O coach vai considerar isso.')">Salvar</button>`;
