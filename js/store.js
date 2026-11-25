/* ===== Armazenamento: local (offline) + banco do Claude (sincroniza entre aparelhos) ===== */
const LKEY='anilha_v2',PKEY='anilha_pending',AKEY='anilha_active';
const COLLS=['days','logs','cardio','body','exams','photos','reports','tech','foods','events'];
function baseState(){return{cfg:{name:'Luiz',flex:true,week:JSON.parse(JSON.stringify(DEFAULT_WEEK)),loads:{},notes:{},shop:{},videos:{}},days:{},logs:{},cardio:{},body:{},exams:{},photos:{},reports:{},tech:{},foods:{},events:{},chat:{msgs:[]}}}
let S=baseState(),ACTIVE=null,PENDING={};
const DB={db:null,assets:null,sample:null,downloads:null,status:'local',ready:false};
function lget(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}}
function lset(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}
function loadLocal(){
 const s=lget(LKEY);
 if(s){S=Object.assign(baseState(),s);S.cfg=Object.assign(baseState().cfg,S.cfg)}
 else migrateV1();
 ACTIVE=lget(AKEY);PENDING=lget(PKEY)||{}}
function migrateV1(){const o=lget('protocolo_lm_v1');if(!o)return;
 try{S.cfg.name=o.name||S.cfg.name;S.cfg.loads=o.loads||{};S.cfg.notes=o.notes||{};S.cfg.shop=o.shop||{};if(o.week)S.cfg.week=o.week;
  (o.logs||[]).forEach(l=>{S.logs[l.id]=l;PENDING['logs/'+l.id]='set'});
  (o.cardio||[]).forEach(c=>{S.cardio[c.id]=c;PENDING['cardio/'+c.id]='set'});
  (o.body||[]).forEach(b=>{S.body[b.id]=b;PENDING['body/'+b.id]='set'});
  const days=new Set([...Object.keys(o.checkins||{}),...Object.keys(o.water||{}),...Object.keys(o.meals||{})]);
  days.forEach(k=>{const c=(o.checkins||{})[k];S.days[k]={water:(o.water||{})[k]||0,meals:(o.meals||{})[k]||{},ci:c?{fadiga:c.score,sono:c.sono?Math.min(5,c.sono+1):3,dor:5,estresse:3,humor:c.score,pain:{},obs:c.notas||''}:null};PENDING['days/'+k]='set'});
  PENDING['cfg/main']='set';saveLocal()}catch(e){}}
function saveLocal(){lset(LKEY,S);lset(PKEY,PENDING)}
function saveActive(){lset(AKEY,ACTIVE)}
function docAt(path){const[c,id]=path.split('/');if(c==='cfg')return S.cfg;if(c==='chat')return S.chat;return(S[c]||{})[id]}
let flushT=null,flushing=false;
function touch(path){PENDING[path]='set';saveLocal();schedule()}
function drop(coll,id){delete S[coll][id];PENDING[coll+'/'+id]='del';saveLocal();schedule()}
function schedule(){clearTimeout(flushT);flushT=setTimeout(flush,700);setSync()}
async function flush(){
 if(!DB.db){if(DB.sb)return sbSync();return}if(flushing)return;flushing=true;
 try{for(const path of Object.keys(PENDING)){
   const op=PENDING[path];const ref=DB.db.doc(path);
   try{if(op==='del')await ref.delete();else{const d=docAt(path);if(d)await ref.set(JSON.parse(JSON.stringify(d)))}
    if(PENDING[path]===op)delete PENDING[path]}
   catch(e){if(e&&e.code==='quota_exceeded'){toast('Banco cheio: apague registros antigos');break}if(e&&(e.code==='invalid_argument')){delete PENDING[path];continue}break}}
 }finally{flushing=false;saveLocal();setSync()}}
function setSync(){const n=Object.keys(PENDING).length;if(DB.db)DB.status=n?'wait':'ok';else if(!DB.sb)DB.status='local';else if(DB.status!=='err')DB.status=!navigator.onLine?'off':n?'wait':'ok';const e=document.getElementById('syncdot');if(e){e.className='sync '+DB.status;e.lastChild.textContent=syncLabel()}}
function syncLabel(){return DB.status==='local'?'Salvo neste aparelho':DB.status==='off'?'Offline, salvo no aparelho':DB.status==='err'?(navigator.onLine?'Erro ao sincronizar':'Offline, salvo no aparelho'):DB.status==='wait'?'Sincronizando…':'Sincronizado'}
const withTimeout=(p,ms=10000)=>Promise.race([p,new Promise((_,r)=>setTimeout(()=>r({code:'timeout'}),ms))]);
async function connectCloud(){
 if(!window.claude||!window.claude.use){if(SB.on){DB.sb=true;setSync();await sbSync()}return}
 try{
  const [db,assets,sample,downloads]=await Promise.all(['db','assets','sample','downloads'].map(n=>window.claude.use(n).catch(()=>null)));
  DB.assets=assets;DB.sample=sample;DB.downloads=downloads;
  if(db){DB.db=db;
   try{
    const cfg=await withTimeout(db.doc('cfg/main').get());if(cfg.exists&&!PENDING['cfg/main'])S.cfg=Object.assign(baseState().cfg,JSON.parse(JSON.stringify(cfg.data())));
    const ch=await withTimeout(db.doc('chat/main').get());if(ch.exists&&!PENDING['chat/main'])S.chat=JSON.parse(JSON.stringify(ch.data()));
    for(const c of COLLS){const q=await withTimeout(db.collection(c).limit(1000).get());q.docs.forEach(d=>{if(!PENDING[c+'/'+d.id])S[c][d.id]=JSON.parse(JSON.stringify(d.data()))})}
    DB.ready=true;saveLocal();
   }catch(e){toast('Sem conexão com a nuvem agora. Seus registros ficam salvos aqui e sobem depois.')}
  }
 }catch(e){}
 setSync();if(typeof render==='function')render();flush()}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)flush()});
window.addEventListener('online',flush);
async function uploadAsset(blob){if(!DB.assets&&DB.sb&&SB.on){const ext=(blob.type||'').includes('video')?(blob.type.includes('quicktime')?'mov':'mp4'):(blob.type||'').includes('pdf')?'pdf':'jpg';return{id:'sb:'+await SB.upload(blob,ext)}}if(!DB.assets)throw{code:'no_assets',message:'Envio de arquivos disponível só abrindo pelo Claude.'};return await DB.assets.upload(blob)}

