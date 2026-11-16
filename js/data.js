/* ===== Protocolo (extraído do app do coach, 22/10–21/11/2026) ===== */
const PLATE={red:'var(--red)',blue:'var(--blue)',yel:'var(--yel)',grn:'var(--grn)',wht:'var(--wht)'};
// Tipos de série codificados pelas cores das anilhas
const SETS_STD=[
 {t:'Aquecimento',reps:'10–15',lo:10,hi:15,rest:60,c:'var(--yel)'},
 {t:'Feeder',reps:'8–12',lo:8,hi:12,rest:90,c:'var(--blue)'},
 {t:'Work set 1',reps:'6–10',lo:6,hi:10,rest:180,c:'var(--red)',work:1},
 {t:'Work set 2',reps:'6–10',lo:6,hi:10,rest:180,c:'var(--red)',work:1},
 {t:'Work set 3',reps:'6–10',lo:6,hi:10,rest:180,c:'var(--red)',work:1}];
const BISET_ABS={type:'biset',id:'bs_abs',name:'Bi-set abdominal',items:[{id:'abd_infra'},{id:'abd_supra'}],sets:3,reps:15,rest:60};
const EX={
 agach:{n:'Agachamento livre',m:['quad','gluteo'],s:['posterior','lombar','abdomen'],step:2.5},
 sup_incl_maq:{n:'Supino inclinado máquina',m:['peito','ombro'],s:['triceps'],step:2.5},
 remada_tri:{n:'Remada baixa com triângulo',m:['dorsal'],s:['biceps','ombro_post','trapezio'],step:2.5},
 flexora:{n:'Cadeira flexora',m:['posterior'],s:['panturrilha'],step:2.5},
 elev_lat:{n:'Elevação lateral com halteres',m:['ombro'],s:['trapezio'],step:1},
 triceps_corda:{n:'Tríceps com corda',m:['triceps'],s:[],step:2.5},
 pant_sent:{n:'Panturrilha sentado',m:['panturrilha'],s:[],step:2.5},
 stiff:{n:'Stiff com barra',m:['posterior','gluteo'],s:['lombar'],step:2.5},
 puxada:{n:'Puxada frontal pronada',m:['dorsal'],s:['biceps','ombro_post'],step:2.5},
 sup_reto_h:{n:'Supino reto com halteres',m:['peito'],s:['ombro','triceps'],step:1},
 extensora:{n:'Cadeira extensora',m:['quad'],s:[],step:2.5},
 mesa_flex:{n:'Mesa flexora',m:['posterior'],s:['panturrilha'],step:2.5},
 rosca_alt:{n:'Rosca alternada no banco inclinado',m:['biceps'],s:['antebraco'],step:1},
 cruc_inv:{n:'Crucifixo inverso máquina',m:['ombro_post'],s:['trapezio'],step:2.5},
 legpress:{n:'Leg press 45°',m:['quad','gluteo'],s:['posterior'],step:5},
 desenv_maq:{n:'Desenvolvimento na máquina, pegada pronada',m:['ombro'],s:['triceps','trapezio'],step:2.5},
 crossover:{n:'Crossover polia alta',m:['peito'],s:['ombro'],step:2.5},
 elev_uni:{n:'Elevação unilateral no cross',m:['ombro'],s:[],step:1.25},
 scott:{n:'Rosca Scott barra W',m:['biceps'],s:['antebraco'],step:2.5},
 triceps_testa:{n:'Tríceps testa na polia com corda',m:['triceps'],s:[],step:2.5},
 abd_infra:{n:'Abdominal infra deitado',m:['abdomen'],s:['obliquo'],step:0},
 abd_supra:{n:'Abdominal supra no solo',m:['abdomen'],s:[],step:0}};
const SEED={agach:[40,15],sup_incl_maq:[20,12],remada_tri:[12,18],flexora:[20,12],elev_lat:[16,12],triceps_corda:[10,15],pant_sent:[20,10],stiff:[20,12],puxada:[12,15],sup_reto_h:[28,10],extensora:[12,15],mesa_flex:[20,10],rosca_alt:[24,12],cruc_inv:[0,0],legpress:[50,12],desenv_maq:[12,15],crossover:[10,12],elev_uni:[3.75,10],scott:[15,10],triceps_testa:[5,12],abd_infra:[0,15],abd_supra:[0,15]};
const SESS={
 A:{name:'Treino A',full:'Full body · Treino A',day:3,ex:['agach','sup_incl_maq','remada_tri','flexora','elev_lat','triceps_corda','pant_sent','BISET']},
 B:{name:'Treino B',full:'Full body · Treino B',day:5,ex:['stiff','puxada','sup_reto_h','extensora','mesa_flex','rosca_alt','cruc_inv','pant_sent']},
 C:{name:'Treino C',full:'Full body · Treino C',day:6,ex:['legpress','desenv_maq','remada_tri','flexora','crossover','elev_uni','scott','triceps_testa','BISET']}};
const PROGRAM={name:'Full body A/B/C',start:'2026-10-22',end:'2026-11-21'};
const ACT={
 A:{n:'Treino A',k:'forca'},B:{n:'Treino B',k:'forca'},C:{n:'Treino C',k:'forca'},
 crossfit:{n:'CrossFit',k:'wod',min:60,alvo:'WOD da box',hk:'Treino cruzado'},
 z2:{n:'Cardio Z2',k:'cardio',min:45,alvo:'45 min com FC entre 115 e 130 bpm',hk:'Cardio misto'},
 corrida:{n:'Corrida',k:'cardio',min:35,alvo:'Ritmo de conversa, FC até 135 bpm',hk:'Corrida ao ar livre'},
 bike:{n:'Bike',k:'cardio',min:50,alvo:'Contínuo, FC entre 115 e 130 bpm',hk:'Ciclismo'},
 natacao:{n:'Natação',k:'cardio',min:35,alvo:'Técnica e nado contínuo leve',hk:'Natação em piscina'},
 descanso:{n:'Descanso',k:'off'}};
const MODS=['z2','corrida','bike','natacao','crossfit'];
const DEFAULT_WEEK={0:['natacao'],1:['crossfit','z2'],2:['corrida'],3:['A','z2'],4:['crossfit','bike'],5:['B','z2'],6:['C','z2']};
const DIET={title:'Plano alimentar',start:'22/10/2026',end:'22/11/2026',agua:5000,meals:[
 {n:'Café da manhã',h:'09:00',opts:[
  {n:'Principal',i:['3 fatias de pão integral Wickbold 100% || 70 g de tapioca || 1 pão francês','3 ovos (2 inteiros + 1 clara)','20 g de requeijão light || 1 fatia de queijo muçarela','130 g de mamão || abacaxi','5 g de psyllium']},
  {n:'Alternativa',i:['40 g de whey protein','30 g de aveia em flocos || 50 g de Mucilon de arroz','1 banana-nanica','300 g de iogurte Batavo Pense Zero || 250 ml de leite semidesnatado || água','130 g de mamão || abacaxi','5 g de psyllium']}]},
 {n:'Almoço',h:'13:00',opts:[{n:'Prescrição',i:['200 g de filé de tilápia || 150 g de peito de frango || 160 g de filé mignon suíno || 140 g de carne vermelha magra || 120 g de salmão grelhado','180 g de arroz branco || 200 g de macarrão cozido','50 g de feijão cozido (opcional)','110 g de vegetais','Salada de folhas à vontade, sem azeite: vinagre, sal e limão']}]},
 {n:'Lanche da tarde',h:'16:00',opts:[
  {n:'Principal',i:['40 g de whey protein','30 g de aveia em flocos || 50 g de Mucilon de arroz','1 banana-nanica','300 g de iogurte Batavo Pense Zero || 250 ml de leite semidesnatado || água']},
  {n:'Alternativa',i:['4 fatias de pão integral Wickbold 100% || 90 g de tapioca || 1 pão francês','100 g de frango desfiado || atum sólido','20 g de requeijão light || 1 fatia de queijo muçarela']}]},
 {n:'Jantar',h:'21:00',opts:[{n:'Prescrição',i:['200 g de filé de tilápia || 160 g de peito de frango','150 g de arroz branco || 300 g de batata-doce ou inglesa','110 g de vegetais','Salada de folhas à vontade, sem azeite: vinagre, sal e limão']}]},
 {n:'Ceia',h:'22:00',opt:true,opts:[{n:'Opcional',i:['350 g de melancia || melão']}]}]};
const SHOP={'Proteínas':['Ovos','Whey protein','Filé de tilápia','Peito de frango','Filé mignon suíno','Carne vermelha magra','Salmão','Atum sólido'],'Carboidratos':['Pão integral Wickbold 100%','Tapioca','Pão francês','Aveia em flocos','Mucilon de arroz','Arroz branco','Macarrão','Feijão','Batata-doce ou inglesa'],'Frutas':['Mamão','Abacaxi','Banana-nanica','Melancia','Melão','Limão'],'Laticínios':['Requeijão light','Queijo muçarela','Iogurte Batavo Pense Zero','Leite semidesnatado'],'Outros':['Psyllium','Vegetais variados','Folhas para salada','Vinagre']};
const SCALES=[
 {k:'fadiga',n:'Fadiga',lo:'Exausto',hi:'Sem fadiga'},
 {k:'sono',n:'Sono',lo:'Péssimo',hi:'Excelente'},
 {k:'dor',n:'Dor muscular',lo:'Muita dor',hi:'Sem dor'},
 {k:'estresse',n:'Estresse',lo:'Muito estressado',hi:'Tranquilo'},
 {k:'humor',n:'Humor',lo:'Péssimo',hi:'Ótimo'}];
const SCALE_COL=['','var(--red)','#e07a2f','var(--yel)','#8cc152','var(--grn)'];
const PAIN=[null,{n:'Leve',c:'var(--yel)'},{n:'Moderada',c:'#e07a2f'},{n:'Forte',c:'var(--red)'}];
