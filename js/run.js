/* ===== Plano de corrida: ritmos Jack Daniels (VDOT), 80/20 (Seiler/Fitzgerald),
   base antes de velocidade (Lydiard), semanas de alívio a cada 4 (Pfitzinger) ===== */
const vo2v=v=>-4.60+0.182258*v+0.000104*v*v;
const pctT=t=>0.8+0.1894393*Math.exp(-0.012778*t)+0.2989558*Math.exp(-0.1932605*t);
const vdotOf=(m,min)=>vo2v(m/min)/pctT(min);
const velAt=vo=>(-0.182258+Math.sqrt(0.182258**2+4*0.000104*(vo+4.60)))/(2*0.000104);
function raceTime(vd,m){let lo=m/600,hi=m/40;for(let i=0;i<80;i++){const mid=(lo+hi)/2;vdotOf(m,mid)>vd?lo=mid:hi=mid}return(lo+hi)/2}
const fmtPace=x=>{const s=Math.round(x*60);return Math.floor(s/60)+':'+pad(s%60)};
const fmtTime=min=>{const s=Math.round(min*60);const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return(h?h+':'+pad(m):m)+':'+pad(x)};
const parseTime=t=>{const p=String(t).trim().split(':').map(Number);if(p.some(isNaN)||!p.length)return 0;return p.length===3?p[0]*60+p[1]+p[2]/60:p.length===2?p[0]+p[1]/60:p[0]};
function paces(vd){const k=v=>1000/v;return{
 E:{n:'Leve',d:'Conversa fácil. A maior parte da semana.',a:k(velAt(vd*.70)),b:k(velAt(vd*.62)),c:'var(--grn)'},
 M:{n:'Maratona',d:'Firme e sustentável.',a:raceTime(vd,42195)/42.195,c:'var(--blue)'},
 T:{n:'Limiar',d:'Confortavelmente difícil. Frases curtas.',a:k(velAt(vd*.88)),c:'var(--yel)'},
 I:{n:'Intervalado',d:'Duro, ritmo de prova de 3 a 5 km.',a:k(velAt(vd*.975)),c:'#e07a2f'},
 R:{n:'Repetição',d:'Rápido e solto, tiros curtos.',a:k(velAt(vd*1.05)),c:'var(--red)'}}}
const paceTxt=(P,z)=>z==='E'?fmtPace(P.E.a)+'–'+fmtPace(P.E.b):z==='rec'||z==='cam'?'trote ou caminhada':fmtPace(P[z].a);
const RUN_GOALS={'5k':{n:'5 km',m:5000,weeks:[8,10,12],taper:1,peakL:[45,55,65]},'10k':{n:'10 km',m:10000,weeks:[10,12,14],taper:1,peakL:[60,70,80]},'21k':{n:'Meia maratona',m:21097.5,weeks:[12,14,16],taper:2,peakL:[90,105,115]}};
const lvlOf=vd=>vd<35?0:vd<45?1:2;
const st=(z,min,l)=>({z,min,l});
const reps=(n,z,min,rec,l)=>{const a=[];for(let i=0;i<n;i++){a.push(st(z,min,l+' '+(i+1)+'/'+n));if(i<n-1&&rec)a.push(st('rec',rec,'Recuperação'))}return a};
const wu=m=>st('E',m,'Aquecimento leve'),cd=m=>st('E',m,'Desaquecimento');
// Monta o plano inteiro de forma determinística a partir das escolhas (nada pesado fica salvo)
function buildPlan(R){
 const G=RUN_GOALS[R.goal],N=R.weeks,lv=lvlOf(R.vdot),tp=G.taper,core=N-tp;
 const nb=Math.max(2,Math.round(core*.35)),nbu=Math.round(core*.4),np=core-nb-nbu;
 const L0=[30,40,50][lv],Lp=G.peakL[lv],E0=[25,30,35][lv];
 const T_PROG=[[3,6],[3,8],[4,8],[3,10],[2,15],[3,12]],I_PROG=[[5,2],[5,3],[6,3],[4,4],[5,4]];
 const W=[];let tI=0,iI=0,bi=0;
 for(let w=0;w<N;w++){
  const phase=w<nb?'Base':w<nb+nbu?'Construção':w<core?'Específico':'Polimento';
  const cut=w<core&&w%4===3;const p=core>1?Math.min(1,w/(core-1)):1;const vol=cut?.75:1;
  const longMin=Math.round((w>=core?(L0+(Lp-L0)*.55)*(w===N-1?.0:1):(L0+(Lp-L0)*p))*vol/5)*5;
  const easyMin=Math.round((E0+10*p)*(cut?.8:1)/5)*5;
  let q;
  if(w===N-1)q={t:'Prova: '+G.n,k:'race',steps:[wu(12),st('race',0,'Prova '+G.n+' no seu melhor ritmo'),cd(8)],note:'Saia controlado no primeiro terço e acelere no final. Meta pelo VDOT atual: '+fmtTime(raceTime(R.vdot,G.m))+'.'};
  else if(cut&&w>=3&&w<core)q={t:'Teste de 3 km',k:'test',steps:[wu(12),st('test',0,'3 km no melhor ritmo que sustentar'),cd(8)],note:'Atualiza seus ritmos. Registre o tempo exato dos 3 km.'};
  else if(phase==='Base')q=w%2===0?{t:'Leve com acelerações',k:'Q',steps:[wu(10),st('E',Math.max(10,easyMin-15),'Leve'),...reps(6,'R',1/3,1,'Aceleração de 20 s'),cd(5)],note:'Acelerações soltas, sem tiro máximo. Prepara a mecânica para a velocidade.'}
   :{t:'Fartlek leve',k:'Q',steps:[wu(10),...reps(6,'T',1,1.5,'1 min forte'),cd(8)],note:'Primeiro contato com o ritmo de limiar.'};
  else if(phase==='Construção'){if(bi++%2===0){const[n,m]=T_PROG[Math.min(tI++,T_PROG.length-1)];q={t:`Limiar ${n}×${m} min`,k:'Q',steps:[wu(12),...reps(n,'T',m,Math.max(1,Math.round(m/5)),'Limiar'),cd(8)],note:'Ritmo T: forte, controlado, sem virar prova.'}}
   else{const[n,m]=I_PROG[Math.min(iI++,I_PROG.length-1)];q={t:`Intervalado ${n}×${m} min`,k:'Q',steps:[wu(15),...reps(n,'I',m,m,'Intervalo'),cd(8)],note:'Recuperação trotando o mesmo tempo do tiro.'}}}
  else if(phase==='Específico'){
   if(R.goal==='5k')q=w%2?{t:'Tiros de 1 km',k:'Q',steps:[wu(15),...reps(lv?5:4,'I',paces(R.vdot).I.a,3,'1 km'),cd(8)],note:'Ritmo I por 1 km cada, 3 min de trote entre eles.'}:{t:'Limiar + velocidade',k:'Q',steps:[wu(12),st('T',15,'Limiar contínuo'),st('rec',3,'Trote'),...reps(6,'R',2/3,1.5,'200 m rápidos'),cd(6)],note:''};
   else if(R.goal==='10k')q={t:'Combinado limiar + intervalado',k:'Q',steps:[wu(12),...reps(2,'T',10,2,'Limiar'),st('rec',3,'Trote'),...reps(4,'I',2,2,'Intervalo'),cd(8)],note:'Treino-chave dos 10 km.'};
   else q=w%2?{t:'Limiar longo 2×15 min',k:'Q',steps:[wu(12),...reps(2,'T',15,3,'Limiar'),cd(10)],note:''}:{t:'Ritmo de prova 3×12 min',k:'Q',steps:[wu(12),...reps(3,'M',12,2,'Ritmo de meia'),cd(8)],note:'Ritmo um pouco mais forte que M: ritmo de meia maratona.'}}
  else q={t:'Polimento: limiar curto',k:'Q',steps:[wu(12),...reps(3,'T',5,2,'Limiar'),cd(8)],note:'Volume baixo, mantém a perna afiada.'};
  const sess=[{...q,id:'q'}];
  if(R.runs===3&&w!==N-1)sess.push({t:`Leve ${easyMin} min`,k:'E',id:'e',steps:[st('E',easyMin,'Leve, conversa fácil')],note:'Pode trocar por bike ou natação leve se as pernas estiverem pesadas do CrossFit.'});
  if(w!==N-1&&longMin>0){const mFin=R.goal==='21k'&&phase==='Específico'?Math.min(30,Math.round(longMin*.3/5)*5):0;sess.push({t:`Longão ${longMin} min`,k:'L',id:'l',steps:mFin?[st('E',longMin-mFin,'Leve'),st('M',mFin,'Final em ritmo M')]:[st('E',longMin,'Leve e contínuo')],note:mFin?'Termine forte: os últimos minutos em ritmo de maratona.':'Mantenha a conversa possível do início ao fim.'})}
  W.push({w,phase,cut,sess})}
 return W}
const runMin=s=>s.steps.reduce((a,x)=>a+(x.min||0),0);
function runState(){const R=S.cfg.run;if(!R)return null;const plan=buildPlan(R);const days=Math.floor((parseDk(dk())-parseDk(R.start))/864e5);let cw=Math.floor(days/7)-(R.offset||0);cw=Math.max(0,Math.min(plan.length-1,cw));
 const done=Object.values(S.cardio).filter(c=>c.plan&&c.plan.g===R.id);const isDone=(w,id)=>done.find(c=>c.plan.w===w&&c.plan.s===id);
 const next=plan[cw].sess.find(s=>!isDone(cw,s.id));return{R,plan,cw,isDone,next,P:paces(R.vdot),done}}
