import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// HardFit no WhatsApp: recebe mensagens da API oficial da Meta, entende com o Claude,
// registra no banco do app e responde confirmando.
const env = (k: string) => Deno.env.get(k) || "";
const GRAPH = "https://graph.facebook.com/v21.0";
const sb = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

const EX: Record<string, string> = {
  agach: "Agachamento livre", sup_incl_maq: "Supino inclinado máquina", remada_tri: "Remada baixa com triângulo", flexora: "Cadeira flexora",
  elev_lat: "Elevação lateral com halteres", triceps_corda: "Tríceps com corda", pant_sent: "Panturrilha sentado", stiff: "Stiff com barra",
  puxada: "Puxada frontal pronada", sup_reto_h: "Supino reto com halteres", extensora: "Cadeira extensora", mesa_flex: "Mesa flexora",
  rosca_alt: "Rosca alternada banco inclinado", cruc_inv: "Crucifixo inverso máquina", legpress: "Leg press 45°", desenv_maq: "Desenvolvimento máquina",
  crossover: "Crossover polia alta", elev_uni: "Elevação unilateral no cross", scott: "Rosca Scott barra W", triceps_testa: "Tríceps testa polia corda",
  abd_infra: "Abdominal infra deitado", abd_supra: "Abdominal supra no solo",
};
const REG = "ombro, peito, biceps, antebraco, abdomen, obliquo, quad, joelho, canela, trapezio, ombro_post, dorsal, lombar, triceps, gluteo, posterior, panturrilha (acrescente _d ou _e para lado direito/esquerdo quando houver lado)";

function today() {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return p; // AAAA-MM-DD
}
const uid = (p: string) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

async function hmacOk(raw: string, sig: string | null) {
  const secret = env("WA_APP_SECRET");
  if (!secret) return true; // assinatura opcional
  if (!sig) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw)));
  const hex = [...mac].map((b) => b.toString(16).padStart(2, "0")).join("");
  return sig === "sha256=" + hex;
}

async function reply(to: string, body: string) {
  await fetch(`${GRAPH}/${env("WA_PHONE_ID")}/messages`, {
    method: "POST",
    headers: { Authorization: "Bearer " + env("WA_TOKEN"), "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: body.slice(0, 4000) } }),
  });
}

async function media(id: string): Promise<{ b64: string; mime: string } | null> {
  const h = { Authorization: "Bearer " + env("WA_TOKEN") };
  const meta = await (await fetch(`${GRAPH}/${id}`, { headers: h })).json();
  if (!meta.url) return null;
  const bin = new Uint8Array(await (await fetch(meta.url, { headers: h })).arrayBuffer());
  let s = "";
  for (let i = 0; i < bin.length; i += 0x8000) s += String.fromCharCode(...bin.subarray(i, i + 0x8000));
  return { b64: btoa(s), mime: meta.mime_type || "application/octet-stream" };
}

async function claude(content: any[]) {
  if (!env("ANTHROPIC_API_KEY")) return gemini(content);
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": env("ANTHROPIC_API_KEY"), "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-5-5", max_tokens: 3000, messages: [{ role: "user", content }] }),
  });
  const o = await r.json();
  if (!r.ok) throw new Error(o?.error?.message || "Erro na API do Claude");
  return (o.content || []).filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("");
}

// Gemini gratuito do Google (GEMINI_API_KEY), usado quando não há chave do Claude
async function gemini(content: any[]) {
  const parts = content.map((c) => c.type === "text" ? { text: c.text } : { inline_data: { mime_type: c.source.media_type, data: c.source.data } });
  const model = env("GEMINI_MODEL") || "gemini-3.6-flash";
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": env("GEMINI_API_KEY"), "content-type": "application/json" },
    body: JSON.stringify({ contents: [{ role: "user", parts }], generationConfig: { maxOutputTokens: 6000 } }),
  });
  const o = await r.json();
  if (!r.ok) throw new Error(o?.error?.message || "Erro na API do Gemini");
  return (o.candidates?.[0]?.content?.parts || []).map((p: { text?: string }) => p.text || "").join("");
}

function parseJSON(t: string) {
  try { return JSON.parse(t); } catch { /* segue */ }
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  if (a >= 0 && b > a) { try { return JSON.parse(t.slice(a, b + 1)); } catch { /* segue */ } }
  return null;
}

const PROMPT = (hoje: string, texto: string, temArquivo: string) => `Você é o assistente do app de treino HardFit do Luiz (CrossFit, força A/B/C, corrida, bike, natação, dieta). Ele mandou uma mensagem no WhatsApp para registrar algo. Hoje é ${hoje} (America/Sao_Paulo).
Mensagem: """${texto || "(sem texto)"}"""${temArquivo}

Transforme em ações. Responda SOMENTE com JSON:
{"acoes":[...],"resposta":"confirmação curta em português, como um coach, até 3 linhas, sem emojis"}
Tipos de ação (use só o que a mensagem disser; datas em AAAA-MM-DD, padrão hoje; "ontem" = dia anterior):
- {"tipo":"agua","ml":500,"data":"..."}
- {"tipo":"refeicao","n":0,"feita":true,"opcao":0,"data":"..."}  n: 0 café da manhã, 1 almoço, 2 lanche da tarde, 3 jantar, 4 ceia. opcao: 0 principal, 1 alternativa (só se ele disser)
- {"tipo":"cardio","mod":"z2|corrida|bike|natacao|crossfit","min":40,"km":0,"fc":0,"kcal":0,"pse":0,"notas":"","data":"..."}  natação em km (1500 m = 1.5)
- {"tipo":"forca","sessao":"A|B|C","min":60,"series":[{"ex":"agach","kg":40,"reps":10,"set":2}],"data":"..."}  set: 0 aquecimento, 1 feeder, 2/3/4 work sets; se ele não disser o tipo, use 2,3,4 em sequência. ex válidos: ${Object.entries(EX).map(([k, v]) => k + "=" + v).join("; ")}
- {"tipo":"checkin","fadiga":1-5,"sono":1-5,"dor":1-5,"estresse":1-5,"humor":1-5,"obs":"","dores":[{"regiao":"joelho_d","nivel":1-3,"nota":""}],"data":"..."}  5 = melhor estado; preencha o que der para inferir e use 3 no que ele não falou; regiões: ${REG}
- {"tipo":"peso","kg":82.4,"data":"..."}
- {"tipo":"exame","r":{"tipo":"","data_coleta":"","laboratorio":"","legivel":true,"itens":[{"nome":"","valor":"","unidade":"","referencia":"","status":"normal|baixo|alto|limítrofe|sem referência","explicacao":""}],"resumo":"","atencao":[],"treino_e_dieta":"","perguntar_ao_medico":[]}}  só quando o arquivo for um exame/laudo
- {"tipo":"foto_refeicao","n":2,"descricao":"","data":"..."}  foto de comida: compare com a dieta e marque a refeição se fizer sentido
Se for só uma pergunta, devolva "acoes":[] e responda como coach na "resposta" (não faça diagnóstico médico). Se não der para entender, peça para ele reformular.`;

Deno.serve(async (req) => {
  const url = new URL(req.url);
  if (req.method === "GET") {
    if (url.searchParams.get("hub.mode") === "subscribe" && url.searchParams.get("hub.verify_token") === env("WA_VERIFY_TOKEN") && env("WA_VERIFY_TOKEN"))
      return new Response(url.searchParams.get("hub.challenge") || "", { status: 200 });
    return new Response("forbidden", { status: 403 });
  }
  if (req.method !== "POST") return new Response("ok");
  const raw = await req.text();
  if (!(await hmacOk(raw, req.headers.get("x-hub-signature-256")))) return new Response("bad signature", { status: 401 });
  let body: any;
  try { body = JSON.parse(raw); } catch { return new Response("ok"); }
  const msgs = body?.entry?.flatMap((e: any) => e.changes || []).flatMap((c: any) => c.value?.messages || []) || [];
  for (const m of msgs) {
    try { await handle(m); } catch (e) {
      console.error(e);
      try { await reply(m.from, "Não consegui registrar agora (" + String((e as Error).message || e).slice(0, 120) + "). Tente de novo em instantes."); } catch { /* ignora */ }
    }
  }
  return new Response("ok");
});

async function handle(m: any) {
  const owner = env("WA_OWNER").replace(/\D/g, "");
  if (!owner || m.from.replace(/\D/g, "") !== owner) return; // só o dono
  const { data: seen } = await sb.from("wa_log").select("id").eq("id", m.id).maybeSingle();
  if (seen) return; // mensagem repetida pela Meta
  await sb.from("wa_log").insert({ id: m.id, kind: m.type, body: m.text?.body || m.image?.caption || m.document?.caption || "" });
  if (!env("ANTHROPIC_API_KEY") && !env("GEMINI_API_KEY")) return reply(m.from, "A IA do HardFit ainda não foi ativada: falta a chave GEMINI_API_KEY (grátis) no Supabase.");
  if (m.type === "audio") return reply(m.from, "Ainda não entendo áudio. Mande em texto: no teclado do iPhone, toque no microfone e fale que ele digita.");

  const { data: users } = await sb.auth.admin.listUsers({ page: 1, perPage: 1 });
  const userId = users?.users?.[0]?.id;
  if (!userId) return reply(m.from, "Crie primeiro seu acesso no app HardFit (Você, Conta e sincronização).");

  const hoje = today();
  const texto = m.text?.body || m.image?.caption || m.document?.caption || "";
  const content: unknown[] = [];
  let fileNote = "", stored: string | null = null;
  const mid = m.image?.id || m.document?.id;
  if (mid) {
    const f = await media(mid);
    if (f) {
      const isPdf = /pdf/.test(f.mime), isImg = /^image\//.test(f.mime);
      if (isPdf) content.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: f.b64 } });
      else if (isImg) content.push({ type: "image", source: { type: "base64", media_type: f.mime.replace("image/jpg", "image/jpeg"), data: f.b64 } });
      fileNote = `\nEle também mandou um arquivo (${isPdf ? "PDF" : "imagem"}). Veja se é exame, foto de refeição ou outra coisa.`;
      const ext = isPdf ? "pdf" : "jpg";
      const path = `${userId}/wa_${m.id.replace(/[^\w]/g, "").slice(-20)}.${ext}`;
      const bin = Uint8Array.from(atob(f.b64), (c) => c.charCodeAt(0));
      const up = await sb.storage.from("hardfit").upload(path, bin, { contentType: f.mime, upsert: true });
      if (!up.error) stored = "sb:" + path;
    }
  }
  content.push({ type: "text", text: PROMPT(hoje, texto, fileNote) });
  const out = parseJSON(await claude(content));
  if (!out) return reply(m.from, "Não entendi. Pode mandar de outro jeito? Ex.: \"tomei 500 ml\" ou \"bike 40 min FC 125\".");

  const rows: { user_id: string; path: string; data: unknown; deleted: boolean }[] = [];
  const dayActs: unknown[] = [];
  for (const a of out.acoes || []) {
    const d = a.data && /^\d{4}-\d{2}-\d{2}$/.test(a.data) ? a.data : hoje;
    if (a.tipo === "cardio") {
      const id = uid("C");
      rows.push({ user_id: userId, path: "cardio/" + id, deleted: false, data: { id, t: Date.now(), date: d, mod: a.mod || "z2", min: +a.min || 0, km: +a.km || 0, fc: +a.fc || 0, kcal: +a.kcal || 0, pse: +a.pse || null, notes: a.notas || "", src: "whatsapp" } });
    } else if (a.tipo === "forca") {
      const id = uid("L"), end = Date.now(), start = end - (+a.min || 60) * 60000;
      const sets = (a.series || []).filter((s: any) => EX[s.ex]).map((s: any, i: number) => ({ id: s.ex, kg: +s.kg || 0, reps: +s.reps || 0, pse: null, t: start + i * 60000, set: Number.isFinite(+s.set) ? +s.set : 2 }));
      if (sets.length) rows.push({ user_id: userId, path: "logs/" + id, deleted: false, data: { id, sess: ["A", "B", "C"].includes(a.sessao) ? a.sessao : "A", date: d, start, end, sets, src: "whatsapp" } });
    } else if (a.tipo === "peso") {
      const id = uid("B");
      rows.push({ user_id: userId, path: "body/" + id, deleted: false, data: { id, t: Date.now(), date: d, peso: +a.kg } });
    } else if (a.tipo === "exame" && a.r) {
      const id = uid("X");
      const dc = a.r.data_coleta && /^\d{4}-\d{2}-\d{2}$/.test(a.r.data_coleta) ? a.r.data_coleta : hoje;
      rows.push({ user_id: userId, path: "exams/" + id, deleted: false, data: { id, t: Date.now(), date: dc, r: a.r, pages: stored ? [stored] : [], src: "whatsapp" } });
    } else if (["agua", "refeicao", "checkin", "foto_refeicao"].includes(a.tipo)) {
      dayActs.push({ ...a, data: d });
    }
  }
  if (dayActs.length) {
    const id = uid("I");
    rows.push({ user_id: userId, path: "inbox/" + id, deleted: false, data: { id, t: Date.now(), acoes: dayActs, foto: stored } });
  }
  if (rows.length) {
    const { error } = await sb.from("docs").upsert(rows, { onConflict: "user_id,path" });
    if (error) throw new Error(error.message);
  }
  await sb.from("wa_log").update({ result: out }).eq("id", m.id);
  await reply(m.from, out.resposta || (rows.length ? "Registrado." : "Ok."));
}
