/* ===== Ilustrações animadas de execução (desenho próprio, sem fotos de terceiros) ===== */
const MV_L={t:40,u:23,f:21,th:33,sh:33};
const rd=a=>a*Math.PI/180,sn=a=>Math.sin(rd(a)),cs=a=>Math.cos(rd(a));
const P=(x,y)=>({x,y}),add=(p,l,a,b)=>P(p.x+l*a,p.y+l*b);
function fkSide(q){let hip,knee,ankle;
 if(q.ax!=null){ankle=P(q.ax,q.ay);knee=add(ankle,MV_L.sh,sn(q.s),-cs(q.s));hip=add(knee,MV_L.th,-sn(q.th),-cs(q.th))}
 else{hip=P(q.hx,q.hy);knee=add(hip,MV_L.th,sn(q.tha),cs(q.tha));ankle=add(knee,MV_L.sh,sn(q.sa),cs(q.sa))}
 const sh=add(hip,MV_L.t,sn(q.t),-cs(q.t)),head=add(sh,13,sn(q.t+(q.hd||0)),-cs(q.t+(q.hd||0)));
 const el=add(sh,MV_L.u,sn(q.ua),cs(q.ua)),wr=add(el,MV_L.f,sn(q.fa),cs(q.fa));
 const fo=q.fo||0,toe=add(ankle,10,cs(fo),sn(fo));return{hip,knee,ankle,toe,sh,head,el,wr}}
function fkFront(q){const k=q.len==null?1:q.len;const arm=(sx,dir,ab,eb)=>{const s=P(sx,56);const e=P(s.x+dir*MV_L.u*sn(ab)*k,s.y+MV_L.u*cs(ab));const w=P(e.x+dir*MV_L.f*sn(ab+eb)*k,e.y+MV_L.f*cs(ab+eb));return{s,e,w}};
 return{R:arm(115,1,q.ab,q.eb||0),Lf:arm(85,-1,q.abL==null?q.ab:q.abL,q.ebL==null?(q.eb||0):q.ebL)}}
const lerp=(a,b,t)=>{const o={};for(const k in a)o[k]=typeof a[k]==='number'&&typeof b[k]==='number'?a[k]+(b[k]-a[k])*t:a[k];return o};
const LN=(a,b,w,c)=>`<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${c||'#d9d6cf'}" stroke-width="${w}" stroke-linecap="round"/>`;
const CIR=(p,r,c,st)=>`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r}" fill="${c}"${st?` stroke="${st}" stroke-width="2"`:''}/>`;
const EQ='#59616b',PL='#e0402f';
const plate=p=>CIR(p,13,PL,'#9c2a1f')+CIR(p,3,'#c9ccd1');
const dumb=p=>LN(P(p.x-6,p.y),P(p.x+6,p.y),3,EQ)+`<rect x="${(p.x-9).toFixed(1)}" y="${(p.y-5).toFixed(1)}" width="5" height="10" rx="1.5" fill="${EQ}"/><rect x="${(p.x+4).toFixed(1)}" y="${(p.y-5).toFixed(1)}" width="5" height="10" rx="1.5" fill="${EQ}"/>`;
const handle=p=>`<rect x="${(p.x-4).toFixed(1)}" y="${(p.y-4).toFixed(1)}" width="8" height="8" rx="2" fill="${EQ}"/>`;
const roll=p=>CIR(p,6,EQ);
const R=(x,y,w,h,rx=3)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="#2f343a"/>`;
const Lst=(x1,y1,x2,y2,w=4)=>LN(P(x1,y1),P(x2,y2),w,'#2f343a');
const bench=(x1,x2,y)=>R(x1,y,x2-x1,6)+Lst(x1+6,y+6,x1+6,140,4)+Lst(x2-6,y+6,x2-6,140,4);
const back=(hx,hy,t,len=50)=>LN(P(hx-4*cs(t),hy+3),add(P(hx-4*cs(t),hy+3),len,sn(t),-cs(t)),7,'#2f343a');
/* posições: p0 = início, p1 = fim; eq(pts) desenha o equipamento que acompanha o corpo */
const MOVES={
 agach:{v:'s',p0:{ax:104,ay:138,s:0,th:0,t:4,ua:-40,fa:-170},p1:{ax:104,ay:138,s:36,th:86,t:40,ua:0,fa:-130},eq:p=>plate(P(p.sh.x-3,p.sh.y+3)),st:''},
 sup_incl_maq:{v:'s',p0:{hx:92,hy:104,tha:85,sa:5,t:-35,ua:-15,fa:115},p1:{hx:92,hy:104,tha:85,sa:5,t:-35,ua:110,fa:112},eq:p=>handle(p.wr),st:()=>back(92,104,-35,52)+R(70,108,46,6)+Lst(92,114,92,140)},
 remada_tri:{v:'s',p0:{hx:78,hy:116,tha:78,sa:96,t:18,ua:82,fa:84},p1:{hx:78,hy:116,tha:78,sa:96,t:-6,ua:-45,fa:75},eq:p=>LN(p.wr,P(178,112),1.5,'#8a9099')+handle(p.wr),st:()=>R(60,120,40,6)+Lst(80,126,80,140)+R(138,100,6,30)+CIR(P(178,112),4,EQ)},
 flexora:{v:'s',p0:{hx:88,hy:94,tha:88,sa:82,t:-12,ua:15,fa:60},p1:{hx:88,hy:94,tha:88,sa:-15,t:-12,ua:15,fa:60},eq:p=>roll(P(p.ankle.x+2,p.ankle.y-5)),st:()=>back(88,94,-12,48)+R(66,98,52,6)+Lst(90,104,90,140)},
 elev_lat:{v:'f',p0:{ab:8,eb:4},p1:{ab:88,eb:4},eq:p=>dumb(p.R.w)+dumb(p.Lf.w)},
 triceps_corda:{v:'s',p0:{ax:96,ay:138,s:6,th:6,t:12,ua:8,fa:-150},p1:{ax:96,ay:138,s:6,th:6,t:12,ua:8,fa:8},eq:p=>LN(p.wr,P(132,8),1.5,'#8a9099')+handle(p.wr),st:()=>CIR(P(132,8),4,EQ)+R(150,4,6,136)},
 pant_sent:{v:'s',p0:{hx:86,hy:96,tha:90,sa:0,t:-4,ua:40,fa:80,fo:12},p1:{hx:86,hy:89,tha:90,sa:0,t:-4,ua:40,fa:80,fo:48},eq:p=>roll(P(p.knee.x,p.knee.y-7)),st:()=>R(64,100,40,6)+Lst(84,106,84,140)+R(112,140,26,4,1)},
 stiff:{v:'s',p0:{ax:104,ay:138,s:2,th:4,t:2,ua:2,fa:2},p1:{ax:104,ay:138,s:6,th:22,t:82,ua:0,fa:0},eq:p=>plate(p.wr)},
 puxada:{v:'s',p0:{hx:94,hy:110,tha:86,sa:8,t:-12,ua:168,fa:174},p1:{hx:94,hy:110,tha:86,sa:8,t:-12,ua:-28,fa:-160},eq:p=>LN(p.wr,P(106,4),1.5,'#8a9099')+LN(P(p.wr.x-12,p.wr.y),P(p.wr.x+12,p.wr.y),3,EQ),st:()=>R(72,114,44,6)+Lst(94,120,94,140)+roll(P(126,102))+CIR(P(106,4),4,EQ)},
 sup_reto_h:{v:'s',p0:{hx:112,hy:95,tha:68,sa:2,t:-90,hd:0,ua:2,fa:178},p1:{hx:112,hy:95,tha:68,sa:2,t:-90,hd:0,ua:178,fa:180},eq:p=>dumb(p.wr),st:()=>bench(56,126,100)},
 extensora:{v:'s',p0:{hx:88,hy:94,tha:88,sa:4,t:-12,ua:15,fa:60},p1:{hx:88,hy:94,tha:88,sa:88,t:-12,ua:15,fa:60},eq:p=>roll(P(p.ankle.x+2,p.ankle.y+4)),st:()=>back(88,94,-12,48)+R(66,98,52,6)+Lst(90,104,90,140)},
 mesa_flex:{v:'s',p0:{hx:96,hy:96,tha:90,sa:90,t:-90,hd:-20,ua:-92,fa:-90},p1:{hx:96,hy:96,tha:90,sa:205,t:-90,hd:-20,ua:-92,fa:-90},eq:p=>roll(P(p.ankle.x,p.ankle.y-6)),st:()=>bench(44,132,103)},
 rosca_alt:{v:'s',p0:{hx:94,hy:104,tha:85,sa:5,t:-38,ua:-4,fa:-4},p1:{hx:94,hy:104,tha:85,sa:5,t:-38,ua:-4,fa:165},eq:p=>dumb(p.wr),st:()=>back(94,104,-38,52)+R(72,108,46,6)+Lst(94,114,94,140)},
 cruc_inv:{v:'f',p0:{ab:90,eb:0,len:.25},p1:{ab:90,eb:0,len:1},eq:p=>handle(p.R.w)+handle(p.Lf.w)},
 legpress:{v:'s',p0:{hx:66,hy:112,tha:150,sa:78,t:-55,ua:30,fa:60},p1:{hx:66,hy:112,tha:126,sa:126,t:-55,ua:30,fa:60},eq:p=>{const a=126,c=P(p.ankle.x+4,p.ankle.y);return`<rect x="${(c.x-3).toFixed(1)}" y="${(c.y-16).toFixed(1)}" width="7" height="32" rx="2" fill="${EQ}" transform="rotate(${-(90-a)} ${c.x.toFixed(1)} ${c.y.toFixed(1)})"/>`},st:()=>back(66,112,-55,52)+R(46,116,40,6)+LN(P(80,125),P(170,52),4,'#2f343a')},
 desenv_maq:{v:'s',p0:{hx:94,hy:106,tha:85,sa:5,t:-8,ua:100,fa:178},p1:{hx:94,hy:106,tha:85,sa:5,t:-8,ua:172,fa:176},eq:p=>handle(p.wr),st:()=>back(94,106,-8,56)+R(72,110,46,6)+Lst(94,116,94,140)},
 crossover:{v:'f',p0:{ab:118,eb:-8},p1:{ab:24,eb:-14},eq:p=>LN(p.R.w,P(186,12),1.5,'#8a9099')+LN(p.Lf.w,P(14,12),1.5,'#8a9099')+handle(p.R.w)+handle(p.Lf.w),st:()=>CIR(P(186,12),4,EQ)+CIR(P(14,12),4,EQ)},
 elev_uni:{v:'f',p0:{ab:6,eb:4,abL:6,ebL:0},p1:{ab:86,eb:4,abL:6,ebL:0},eq:p=>LN(p.R.w,P(20,136),1.5,'#8a9099')+handle(p.R.w),st:()=>CIR(P(20,136),4,EQ)},
 scott:{v:'s',p0:{hx:92,hy:108,tha:85,sa:5,t:14,ua:48,fa:62},p1:{hx:92,hy:108,tha:85,sa:5,t:14,ua:48,fa:172},eq:p=>LN(P(p.wr.x-2,p.wr.y-12),P(p.wr.x+2,p.wr.y+12),3,EQ),st:()=>LN(P(110,72),P(136,96),8,'#2f343a')+Lst(126,98,126,140)+R(72,112,40,6)+Lst(92,118,92,140)},
 triceps_testa:{v:'s',p0:{hx:120,hy:95,tha:68,sa:2,t:-90,hd:0,ua:196,fa:262},p1:{hx:120,hy:95,tha:68,sa:2,t:-90,hd:0,ua:196,fa:188},eq:p=>LN(p.wr,P(28,132),1.5,'#8a9099')+handle(p.wr),st:()=>bench(64,134,100)+CIR(P(28,132),4,EQ)},
 abd_infra:{v:'s',p0:{hx:112,hy:130,tha:96,sa:96,t:-90,hd:0,ua:88,fa:88,fo:-80},p1:{hx:112,hy:130,tha:178,sa:178,t:-90,hd:0,ua:88,fa:88,fo:-100},st:()=>R(40,136,120,4,1)},
 abd_supra:{v:'s',p0:{hx:112,hy:130,tha:140,sa:24,t:-90,hd:0,ua:150,fa:150},p1:{hx:112,hy:130,tha:140,sa:24,t:-58,hd:6,ua:118,fa:108},st:()=>R(40,136,120,4,1)}};
function moveFrame(id,u){const m=MOVES[id];if(!m)return'';const q=lerp(m.p0,m.p1,u);let s=`<line x1="10" y1="140.5" x2="190" y2="140.5" stroke="#2d3238" stroke-width="1"/>`+(m.st?m.st():'');
 if(m.v==='f'){const f=fkFront(q);const b='#d9d6cf';
  s+=LN(P(92,92),P(88,138),8,b)+LN(P(108,92),P(112,138),8,b)+LN(P(100,92),P(100,54),12,b)+LN(P(85,56),P(115,56),9,b)+CIR(P(100,38),9,b);
  [f.R,f.Lf].forEach(a=>{s+=LN(a.s,a.e,7,b)+LN(a.e,a.w,6,b)});s+=m.eq?m.eq(f):'';return s}
 const p=fkSide(q);const b='#d9d6cf';
 s+=LN(p.hip,p.knee,9,b)+LN(p.knee,p.ankle,8,b)+LN(p.ankle,p.toe,5,b)+LN(p.hip,p.sh,11,b)+CIR(p.head,8,b)+LN(p.sh,p.el,7,b)+LN(p.el,p.wr,6,b)+(m.eq?m.eq(p):'');return s}
const ease=x=>.5-.5*Math.cos(Math.PI*x);
function moveSVG(id,cls=''){if(!MOVES[id])return'';return`<svg class="mv ${cls}" data-mv="${id}" viewBox="0 0 200 150" role="img" aria-label="Animação da execução">${moveFrame(id,0)}</svg>`}
let mvRAF=null;
function animateMoves(){cancelAnimationFrame(mvRAF);const els=[...document.querySelectorAll('svg.mv[data-mv]')];if(!els.length)return;const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;const t0=performance.now();
 const tick=t=>{const ph=((t-t0)/2600)%1;const u=reduce?1:ease(ph<.5?ph*2:2-ph*2);els.forEach(e=>{if(e.isConnected)e.innerHTML=moveFrame(e.dataset.mv,u)});if(els.some(e=>e.isConnected)&&!reduce)mvRAF=requestAnimationFrame(tick)};mvRAF=requestAnimationFrame(tick)}
