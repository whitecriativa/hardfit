/* ===== Nuvem própria (Supabase): conta, sincronização automática, arquivos e IA ===== */
const SB={url:'https://vynwypbrtrktnofwdlkc.supabase.co',key:'sb_publishable_5Eal8371fOoSIgnOEB7Fhg_w4dMRV7_',s:null,
 load(){this.s=lget('hardfit_session')},save(){lset('hardfit_session',this.s)},
 get on(){return!!(this.s&&this.s.refresh_token)},get uid(){return this.s&&this.s.user&&this.s.user.id},
 async req(path,o={}){const h=Object.assign({apikey:this.key},o.headers||{});if(o.auth!==false)h.Authorization='Bearer '+await this.token();
  const r=await fetch(this.url+path,{method:o.method||'GET',headers:h,body:o.body});
  if(!r.ok){let e={};try{e=await r.json()}catch(x){}throw{code:e.code||e.error_code||e.error||('http_'+r.status),message:e.msg||e.message||e.error_description||('Erro '+r.status),status:r.status}}
  return o.raw?r:(r.status===204||r.headers.get('content-length')==='0'?null:r.json().catch(()=>null))},
 async auth(grant,body){const r=await this.req('/auth/v1/token?grant_type='+grant,{method:'POST',auth:false,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  this.s={access_token:r.access_token,refresh_token:r.refresh_token,expires_at:Date.now()/1000+(r.expires_in||3600),user:{id:r.user.id,email:r.user.email}};this.save();return this.s},
 async signIn(email,password){return this.auth('password',{email,password})},
 async signUp(email,password){await this.req('/auth/v1/signup',{method:'POST',auth:false,headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});return this.signIn(email,password)},
 async token(){if(!this.s)throw{code:'no_session',message:'Entre na sua conta'};if(this.s.expires_at-90<Date.now()/1000){try{await this.auth('refresh_token',{refresh_token:this.s.refresh_token})}catch(e){if(e.status===400||e.status===401){this.s=null;this.save()}throw e}}return this.s.access_token},
 signOut(){this.s=null;this.save();lset('hardfit_pull',null)},
 async push(rows){for(let i=0;i<rows.length;i+=40){await this.req('/rest/v1/docs?on_conflict=user_id,path',{method:'POST',headers:{'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(rows.slice(i,i+40))})}},
 async pull(since){const out=[];let from=since||'1970-01-01T00:00:00Z';for(let k=0;k<20;k++){const q=await this.req('/rest/v1/docs?select=path,data,deleted,updated_at&updated_at=gt.'+encodeURIComponent(from)+'&order=updated_at.asc&limit=500');out.push(...q);if(q.length<500)break;from=q[q.length-1].updated_at}return out},
 async upload(blob,ext){const name=this.uid+'/'+uid('f')+'.'+ext;await this.req('/storage/v1/object/hardfit/'+name,{method:'POST',headers:{'Content-Type':blob.type||'application/octet-stream','x-upsert':'true'},body:blob});return name},
 async blob(path){const r=await this.req('/storage/v1/object/authenticated/hardfit/'+path,{raw:true});return r.blob()},
 async ai(prompt,images,tier){return this.req('/functions/v1/coach',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt,images,tier})})}};
SB.load();
const blobToB64=b=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(',')[1]);r.onerror=rej;r.readAsDataURL(b)});
/* arquivos privados: carrega com a sua conta e mostra como blob */
const ASSET_CACHE={};
async function assetBlob(id){if(String(id).startsWith('sb:'))return SB.blob(id.slice(3));return(await fetch('/_blob/'+id)).blob()}
function assetAttr(id,attr='src'){return String(id).startsWith('sb:')?`data-asset="${esc(id)}" data-attr="${attr}"${ASSET_CACHE[id]?` ${attr}="${ASSET_CACHE[id]}"`:''}`:`${attr}="/_blob/${esc(id)}"`}
function hydrateAssets(){document.querySelectorAll('[data-asset]').forEach(async el=>{const id=el.dataset.asset,a=el.dataset.attr||'src';if(el.getAttribute(a))return;try{if(!ASSET_CACHE[id])ASSET_CACHE[id]=URL.createObjectURL(await assetBlob(id));el.setAttribute(a,ASSET_CACHE[id])}catch(e){}})}
/* sincronização */
let sbBusy=false,sbAgain=false;
/* registros que chegaram pelo WhatsApp: soma no dia sem apagar o que já foi lançado no app */
function applyInbox(x){(x.acoes||[]).forEach(a=>{const k=/^\d{4}-\d{2}-\d{2}$/.test(a.data||'')?a.data:dk();const d=day(k);d.wt=Date.now();
 if(a.tipo==='agua'&&+a.ml){d.water=Math.max(0,(d.water||0)+ +a.ml);d.wlog=d.wlog||[];d.wlog.push({t:x.t||Date.now(),ml:+a.ml,src:'wa'})}
 else if((a.tipo==='refeicao'||a.tipo==='foto_refeicao')&&a.n!=null){d.meals=d.meals||{};d.meals[a.n]=a.feita!==false;if(a.opcao!=null)d.meals['o'+a.n]=+a.opcao}
 else if(['alimento','nota','cardio','peso'].includes(a.tipo)||(a.tipo==='foto_refeicao'&&a.kcal)){if(typeof applyActions==='function')applyActions(k,[{...a,foto:a.foto||x.foto}],'wa');return}
 else if(a.tipo==='checkin'){const pain={};(a.dores||[]).forEach(p=>{if(p.regiao&&REG_N[baseOf(p.regiao)])pain[p.regiao]={l:Math.max(1,Math.min(3,+p.nivel||1)),note:p.nota||''}});
  d.ci={fadiga:+a.fadiga||3,sono:+a.sono||3,dor:+a.dor||3,estresse:+a.estresse||3,humor:+a.humor||3,pain,obs:a.obs||'',t:x.t||Date.now(),src:'wa'};d.ai=null}
 touch('days/'+k)});if(!x.silent&&typeof toast==='function')toast('Registros do WhatsApp recebidos')}
async function sbSync(){if(!SB.on||sbBusy||!navigator.onLine)return;sbBusy=true;DB.status='wait';setSync();
 try{const paths=Object.keys(PENDING);if(paths.length){const rows=paths.map(p=>{const del=PENDING[p]==='del';const d=del?null:docAt(p);return{path:p,data:d?JSON.parse(JSON.stringify(d)):null,deleted:del||!d}});const snap={...PENDING};await SB.push(rows);paths.forEach(p=>{if(PENDING[p]===snap[p])delete PENDING[p]})}
  const since=lget('hardfit_pull');const rows=await SB.pull(since);let ch=0;
  let newLogs=false;
  rows.forEach(r=>{if(PENDING[r.path])return;const[c,id]=r.path.split('/');ch++;
   if(c==='inbox'){if(!r.deleted&&r.data){applyInbox(r.data);PENDING[r.path]='del'}return}
   if(c==='logs'&&!r.deleted)newLogs=true;
   if(r.deleted||!r.data){if(S[c]&&id&&S[c][id])delete S[c][id];return}
   if(c==='cfg')S.cfg=Object.assign(baseState().cfg,r.data);else if(c==='chat')S.chat=r.data;else if(S[c])S[c][id]=r.data});
  if(rows.length)lset('hardfit_pull',rows[rows.length-1].updated_at);
  if(newLogs&&typeof rebuildLoads==='function')rebuildLoads();
  if(Object.keys(PENDING).length&&!sbAgain){sbAgain=true;setTimeout(()=>{sbAgain=false;sbSync()},300)}
  saveLocal();DB.status=Object.keys(PENDING).length?'wait':'ok';DB.lastSync=Date.now();if(ch&&typeof render==='function'&&!$('#sheet.show')&&!$('#flow.show'))render()}
 catch(e){DB.status='err';DB.err=e.message;if(e.code==='no_session'||e.status===401)DB.status='local'}
 finally{sbBusy=false;setSync()}}
setInterval(()=>{if(!document.hidden)sbSync()},45000);
