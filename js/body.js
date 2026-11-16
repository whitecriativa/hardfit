/* ===== Mapa corporal (frente/costas) — usado para dor e para músculos trabalhados ===== */
const REG_N={ombro:'Ombro',peito:'Peito',biceps:'Bíceps',antebraco:'Antebraço',abdomen:'Abdômen',obliquo:'Oblíquo',quad:'Coxa (frente)',joelho:'Joelho',canela:'Canela',trapezio:'Trapézio',ombro_post:'Ombro posterior',dorsal:'Costas (dorsal)',lombar:'Lombar',triceps:'Tríceps',gluteo:'Glúteo',posterior:'Coxa (posterior)',panturrilha:'Panturrilha'};
const E=(cx,cy,rx,ry)=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>`;
const BODY={
 front:{
  nb:[`<circle cx="60" cy="17" r="11"/>`,`<rect x="55" y="27" width="10" height="9" rx="3"/>`,E(25,122,4.2,7),E(95,122,4.2,7),`<path d="M45 101h30l-3 12H48z"/>`,E(50,236,6,4),E(70,236,6,4)],
  rg:{ombro_d:E(38,47,8.5,8),ombro_e:E(82,47,8.5,8),
   peito_d:`<path d="M46 41h13v18q-8 4-15-1q-2-9 2-17z"/>`,peito_e:`<path d="M74 41H61v18q8 4 15-1q2-9-2-17z"/>`,
   biceps_d:E(33,68,5.5,11),biceps_e:E(87,68,5.5,11),antebraco_d:E(28.5,96,5,13),antebraco_e:E(91.5,96,5,13),
   abdomen:`<rect x="51" y="61" width="18" height="39" rx="5"/>`,obliquo_d:`<path d="M44 62l5 1v35l-5-5z"/>`,obliquo_e:`<path d="M76 62l-5 1v35l5-5z"/>`,
   quad_d:E(51,141,8.5,27),quad_e:E(69,141,8.5,27),joelho_d:E(51,174,6,4.5),joelho_e:E(69,174,6,4.5),
   canela_d:E(50.5,204,5.5,21),canela_e:E(69.5,204,5.5,21)}},
 back:{
  nb:[`<circle cx="60" cy="17" r="11"/>`,`<rect x="55" y="27" width="10" height="9" rx="3"/>`,E(25,122,4.2,7),E(95,122,4.2,7),E(50,236,6,4),E(70,236,6,4),E(51,174,6,4.5),E(69,174,6,4.5)],
  rg:{trapezio:`<path d="M60 33l15 12-6 13H51l-6-13z"/>`,ombro_post_e:E(38,47,8.5,8),ombro_post_d:E(82,47,8.5,8),
   dorsal_e:`<path d="M44 57l10 3v26l-8-4q-4-12-2-25z"/>`,dorsal_d:`<path d="M76 57l-10 3v26l8-4q4-12 2-25z"/>`,
   lombar:`<rect x="53" y="84" width="14" height="17" rx="4"/>`,
   triceps_e:E(33,68,5.5,11),triceps_d:E(87,68,5.5,11),antebraco_e:E(28.5,96,5,13),antebraco_d:E(91.5,96,5,13),
   gluteo_e:E(51,112,9.5,10),gluteo_d:E(69,112,9.5,10),posterior_e:E(51,147,8.5,24),posterior_d:E(69,147,8.5,24),
   panturrilha_e:E(50.5,201,6.5,18),panturrilha_d:E(69.5,201,6.5,18)}}};
const baseOf=id=>id.replace(/_(d|e)$/,'');
const sideOf=id=>/_d$/.test(id)?'direito':/_e$/.test(id)?'esquerdo':'';
const regName=id=>REG_N[baseOf(id)]+(sideOf(id)?' · lado '+sideOf(id):'');
// fill(id) -> cor; tap -> nome da função global chamada com o id
function bodySVG(view,fill,tap){
 const v=BODY[view];
 const nb=v.nb.map(s=>s.replace(/^<(\w+)/,'<$1 class="nb"')).join('');
 const rg=Object.entries(v.rg).map(([id,s])=>{const f=fill(id);return s.replace(/^<(\w+)/,`<$1 class="rg${tap?' tap':''}" data-id="${id}"${f?` style="fill:${f}"`:''}${tap?` onclick="${tap}('${id}')"`:''}`)}).join('');
 return`<svg viewBox="0 0 120 246" role="img" aria-label="Mapa corporal ${view==='front'?'frente':'costas'}">${nb}${rg}</svg>`}
// mini-mapas do exercício: primário em vermelho-anilha, secundário em azul
function muscleMini(exId,exId2){
 const e=EX[exId];if(!e)return'';const m=[...e.m,...(exId2?EX[exId2].m:[])],sc=[...e.s,...(exId2?EX[exId2].s:[])].filter(x=>!m.includes(x));
 const f=id=>{const b=baseOf(id);return m.includes(b)?'var(--red)':sc.includes(b)?'#4d6f9e':null};
 return`<div class="mus"><div class="bodymap">${bodySVG('front',f)}${bodySVG('back',f)}</div><ul>${[...new Set(m)].map(x=>`<li><span class="sw" style="background:var(--red);width:8px;height:8px;margin-right:8px"></span>${REG_N[x]}</li>`).join('')}${[...new Set(sc)].map(x=>`<li class="mut"><span class="sw" style="background:#4d6f9e;width:8px;height:8px;margin-right:8px"></span>${REG_N[x]}</li>`).join('')}</ul></div>`}
