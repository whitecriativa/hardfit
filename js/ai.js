/* ===== IA (Claude) — coach + nutricionista: leitura de check-in, exames, fotos, técnica, relatório, chat ===== */
const COACH=`Você é o coach de força e condicionamento e nutricionista esportivo do Luiz Henrique, atleta amador de CrossFit em Araçatuba-SP que também corre, pedala e nada, e usa iPhone + Apple Watch.
Método do app: séries tipadas (aquecimento, feeder e 3 work sets de 6 a 10 reps), dupla progressão guiada por PSE (esforço 1–10), prontidão diária pelo check-in (fadiga, sono, dor, estresse, humor e mapa de dor), carga interna sRPE (minutos × PSE) com razão aguda:crônica (7 d vs média de 28 d), cardio aeróbio em zona 2 (FC 115–130 bpm) e a dieta escrita do protocolo, com 5 L de água por dia.
Regras: escreva em português do Brasil, direto e prático, como um treinador falando com o atleta. Use só os dados do contexto; se faltar dado, diga qual. Não faça diagnóstico médico nem prescreva remédio. Dor forte, dor que piora, dor articular persistente ou exame muito alterado: oriente procurar médico ou fisioterapeuta. Nada de emojis.`;
const aiOn=()=>!!DB.sample;
function aiErr(e){const c=e&&e.code;if(c==='not_granted')return'Você não liberou a IA neste app. Para usar, abra pelo Claude e aceite o pedido de acesso.';if(c==='rate_limited')return'Muitas consultas seguidas. Espere um minuto e tente de novo.';return'A IA não respondeu agora ('+(e&&e.message||c||'erro')+'). Tente de novo.'}
async function aiAsk(prompt,o={}){
 if(!DB.sample)throw{code:'unavailable',message:'IA disponível só abrindo pelo Claude'};
 const opts={modelTier:o.tier||'default',cache:false};if(o.onText)opts.onText=o.onText;if(o.images&&o.images.length)opts.images=o.images;
 const r=await DB.sample(COACH+'\n\n'+prompt,opts);return r.text||''}
function parseJSON(t){try{return JSON.parse(t)}catch(e){}const a=t.indexOf('{'),b=t.lastIndexOf('}');if(a>=0&&b>a){try{return JSON.parse(t.slice(a,b+1))}catch(e){}}return null}
async function canImages(){try{const l=await DB.sample.limits();return!!(l&&l.images)}catch(e){return true}}

/* --- contexto compacto que vai junto em toda pergunta --- */
function ctx(days=14){
 const ks=lastDays(days);
 const ci=ks.map(k=>{const d=S.days[k]||{};const c=d.ci;return c?{d:k,fadiga:c.fadiga,sono:c.sono,dor:c.dor,estresse:c.estresse,humor:c.humor,dores:Object.entries(c.pain||{}).map(([r,v])=>regName(r)+' '+PAIN[v.l].n+(v.note?' ('+v.note+')':'')),obs:c.obs||undefined}:null}).filter(Boolean);
 const logs=Object.values(S.logs).sort(by('start')).slice(-6).map(l=>{const ex={};l.sets.forEach(s=>{if(s.set>=2||s.bi){const e=ex[s.id]=ex[s.id]||[];e.push(fmtKg(s.kg)+'×'+s.reps+(s.pse?'@'+s.pse:''))}});return{d:l.date,sessao:SESS[l.sess].name,min:Math.round((l.end-l.start)/6e4),work_sets:Object.fromEntries(Object.entries(ex).map(([k,v])=>[EX[k]?EX[k].n:k,v.join(' ')]))}});
 const card=Object.values(S.cardio).filter(c=>ks.includes(c.date)).map(c=>({d:c.date,tipo:ACT[c.mod].n,min:c.min,km:c.km||undefined,fc:c.fc||undefined,pse:c.pse||undefined,obs:c.notes||undefined}));
 const diet=lastDays(7).map(k=>({d:k,refeicoes:dietDone(k)+'/4',agua_l:((S.days[k]||{}).water||0)/1000}));
 const hl=lastDays(7).map(k=>(S.days[k]||{}).health).filter(Boolean);
 const body=Object.values(S.body).sort(by('date')).slice(-3);
 const ex=Object.values(S.exams).sort(by('date')).slice(-3).map(x=>({d:x.date,tipo:x.r&&x.r.tipo,atencao:x.r&&x.r.atencao}));
 const r=readiness(dk());const rs=runState();
 return JSON.stringify({plano_corrida:rs?{objetivo:RUN_GOALS[rs.R.goal].n,semana:(rs.cw+1)+' de '+rs.plan.length,fase:rs.plan[rs.cw].phase,vdot:rs.R.vdot,previsao_prova:fmtTime(raceTime(rs.R.vdot,RUN_GOALS[rs.R.goal].m)),ritmos_min_km:Object.fromEntries(Object.keys(rs.P).map(z=>[z,paceTxt(rs.P,z)])),proximo:rs.next&&rs.next.t}:null,hoje:dk(),dia_semana:DOW[new Date().getDay()],modo:S.cfg.flex?'livre, sem dia fixo; meta A, B e C 1x por semana; próximo de força: '+SESS[nextSession()].name:'dias fixos',plano_hoje:todayActs().map(a=>ACT[a].n),prontidao_hoje:r?{score:r.score,status:r.label}:null,carga:loadStats(),checkins:ci,sessoes_forca:logs,cardio:card,dieta:diet,saude_apple:hl,medidas:body,exames:ex,semana_planejada:S.cfg.flex?null:Object.fromEntries(Object.entries(S.cfg.week).map(([d,a])=>[DOW[d],a.map(x=>ACT[x].n)]))})}

/* --- imagens: redimensiona; PDF vira páginas --- */
function fileToImg(file){return new Promise((res,rej)=>{const u=URL.createObjectURL(file);const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=u})}
function canvasBlob(cv,q=.86){return new Promise(r=>cv.toBlob(r,'image/jpeg',q))}
async function shrink(src,max=1568){const w=src.naturalWidth||src.videoWidth||src.width,h=src.naturalHeight||src.videoHeight||src.height;const s=Math.min(1,max/Math.max(w,h));const cv=document.createElement('canvas');cv.width=Math.round(w*s);cv.height=Math.round(h*s);cv.getContext('2d').drawImage(src,0,0,cv.width,cv.height);return canvasBlob(cv)}
function loadScript(u){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${u}"]`))return res();const s=document.createElement('script');s.src=u;s.onload=res;s.onerror=rej;document.head.appendChild(s)})}
async function pdfPages(file,maxPages=6){
 const base='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
 await loadScript(base+'pdf.worker.min.js');await loadScript(base+'pdf.min.js');
 const lib=window.pdfjsLib;lib.GlobalWorkerOptions.workerSrc=base+'pdf.worker.min.js';
 const pdf=await lib.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;const out=[];
 for(let p=1;p<=Math.min(pdf.numPages,maxPages);p++){const pg=await pdf.getPage(p);const vp0=pg.getViewport({scale:1});const vp=pg.getViewport({scale:Math.min(2.2,1500/vp0.width)});const cv=document.createElement('canvas');cv.width=vp.width;cv.height=vp.height;await pg.render({canvasContext:cv.getContext('2d'),viewport:vp}).promise;out.push(await canvasBlob(cv,.85))}
 return{pages:out,total:pdf.numPages}}
async function toImages(files){const out=[];let note='';for(const f of files){if(/pdf/i.test(f.type)||/\.pdf$/i.test(f.name)){const r=await pdfPages(f);out.push(...r.pages);if(r.total>6)note='Li as 6 primeiras páginas de '+r.total+'.'}else if(/^image\//.test(f.type)){out.push(await shrink(await fileToImg(f)))}}return{imgs:out.slice(0,8),note}}
async function videoFrames(file,n=6){
 const v=document.createElement('video');v.muted=true;v.playsInline=true;v.preload='auto';v.src=URL.createObjectURL(file);
 await new Promise((res,rej)=>{v.onloadeddata=res;v.onerror=()=>rej({message:'Não consegui abrir o vídeo'});setTimeout(res,6000)});
 const d=v.duration||1;const out=[];
 for(let i=0;i<n;i++){const t=d*(i+.5)/n;await new Promise(r=>{const done=()=>{v.removeEventListener('seeked',done);r()};v.addEventListener('seeked',done);v.currentTime=t;setTimeout(done,2500)});out.push(await shrink(v,1024))}
 return out}

/* --- tarefas --- */
async function aiCheckin(k,onText){
 const t=await aiAsk(`Contexto (JSON): ${ctx(10)}

Tarefa: o atleta acabou de responder o check-in de hoje (${k}). Escreva a leitura do coach em 3 a 5 frases curtas, sem título:
1) como ele está hoje comparado aos últimos dias;
2) o que as dores marcadas sugerem (relacione com os treinos recentes quando fizer sentido);
3) a decisão para hoje: treinar como planejado, reduzir para 2 work sets e PSE até 7, trocar por cardio Z2 leve, ou descansar;
4) um cuidado prático (mobilidade, sono, hidratação ou alimentação).`,{tier:'quick',onText});
 return t}
async function aiReport(onText){
 return aiAsk(`Contexto (JSON): ${ctx(14)}

Tarefa: relatório semanal do coach. Use exatamente estes títulos em linhas começando com "## ":
## Como você se sentiu
## Dores e recuperação
## Treino de força
## Cardio e CrossFit
## Dieta e hidratação
## Ajustes para a próxima semana
Em cada seção, 2 a 4 tópicos curtos com "- ", citando números do contexto (médias de check-in, cargas, minutos, adesão). Em ajustes, dê ações concretas (carga alvo por exercício quando a dupla progressão indicar, minutos de Z2, distribuição de corrida/bike/natação em relação ao CrossFit).`,{tier:'complex',onText})}
async function aiExam(files,onStep){
 onStep&&onStep('Preparando páginas…');const{imgs,note}=await toImages(files);
 if(!imgs.length)throw{message:'Envie foto (JPG/PNG/HEIC) ou PDF do exame.'};
 onStep&&onStep('Lendo e traduzindo o exame…');
 const t=await aiAsk(`Contexto do atleta (JSON): ${ctx(7)}

Tarefa: as imagens são páginas de um exame (laboratório, bioimpedância, ergoespirometria, imagem ou laudo). Leia TODOS os valores visíveis e traduza para linguagem simples.
Responda SOMENTE com JSON válido neste formato:
{"tipo":"","data_coleta":"AAAA-MM-DD ou vazio","laboratorio":"","legivel":true,"itens":[{"nome":"","valor":"","unidade":"","referencia":"","status":"normal|baixo|alto|limítrofe|sem referência","explicacao":"o que é e o que esse valor significa, 1 frase"}],"resumo":"3 a 4 frases em linguagem simples","atencao":["itens fora da faixa ou que merecem acompanhamento"],"treino_e_dieta":"como isso conversa com o treino de CrossFit/força e com a dieta atual, 2 a 3 frases, sem prescrever remédio","perguntar_ao_medico":["perguntas objetivas para levar à consulta"]}
Use a faixa de referência impressa no próprio laudo. Se algo estiver ilegível, marque "legivel": false e diga o que faltou no resumo. Não dê diagnóstico.`,{images:imgs,tier:'complex'});
 const r=parseJSON(t);if(!r)throw{message:'A IA não devolveu um resultado legível. Tente uma foto mais nítida.'};
 if(note)r.resumo=(r.resumo||'')+' '+note;
 return{r,imgs}}
async function aiPhoto(blob,pose,prevBlob,onText){
 const imgs=prevBlob?[prevBlob,blob]:[blob];
 return aiAsk(`Contexto (JSON): ${ctx(14)}

Tarefa: ${prevBlob?'a primeira imagem é a foto de progresso anterior e a segunda é a de hoje':'esta é a primeira foto de progresso'} (pose: ${pose}). Faça uma avaliação física objetiva e respeitosa, como treinador:
- composição aparente e definição por região (peito, ombros, braços, abdômen, coxas, glúteos, panturrilhas), sem chutar % de gordura exato;
${prevBlob?'- o que mudou entre as duas fotos, região por região (diga quando a diferença pode ser só de luz, ângulo ou pump);\n':''}- pontos fortes e pontos a priorizar, conectando com o protocolo atual;
- 1 dica para padronizar as próximas fotos.
Texto corrido em tópicos curtos com "- ", máximo 12 linhas.`,{images:imgs,tier:'default',onText})}
async function aiTech(frames,exName,onText){
 return aiAsk(`Tarefa: as ${frames.length} imagens são quadros em sequência de um vídeo do atleta executando "${exName}". Analise a técnica como treinador:
- fase por fase (início, descida/excêntrica, ponto baixo, subida), o que está bom e o que corrigir;
- riscos de lesão visíveis (coluna, joelhos, ombros);
- 2 ou 3 dicas de execução fáceis de lembrar durante a série.
Se o ângulo da câmera não permitir avaliar algo, diga qual ângulo filmar. Tópicos curtos com "- ", máximo 14 linhas.`,{images:frames,tier:'default',onText})}
async function aiChat(text,onText){
 const hist=(S.chat.msgs||[]).slice(-12).map(m=>(m.r==='u'?'Atleta: ':'Coach: ')+m.t).join('\n');
 return aiAsk(`Contexto (JSON): ${ctx(14)}

Conversa até agora:
${hist}
Atleta: ${text}

Responda como o coach, curto e prático (até 8 linhas), em texto simples.`,{tier:'default',onText})}
function md(t){let h='',inL=false;const il=s=>esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
 String(t||'').split('\n').forEach(l=>{const x=l.trim();if(/^[-•*] /.test(x)){if(!inL){h+='<ul>';inL=true}h+='<li>'+il(x.slice(2))+'</li>';return}if(inL){h+='</ul>';inL=false}
  if(/^#{1,4} /.test(x))h+='<h4>'+il(x.replace(/^#+ /,''))+'</h4>';else if(x)h+='<p>'+il(x.replace(/^\d+\)\s*/,''))+'</p>'});
 if(inL)h+='</ul>';return h}
