/* Kantor AI — office_config.js (Tahap 2: 5 Divisi + 2 Area Bersama)
 *
 * Struktur divisi baru sesuai permintaan pengguna:
 *   Divisi 1: Keuangan & Investasi        (finance)        -> agen 1-8
 *   Divisi 2: Marketing, Konten & Komersial (marketing_content) -> agen 9,10,12,14
 *   Divisi 3: IT & Otomasi                (it_automation)  -> agen 11,15,16
 *   Divisi 4: Riset & Intelijen           (research_intelligence) -> agen 13
 *   Divisi 5: HR & Administrasi           (hr_admin)       -> (belum ada agen aktif)
 *
 * Area bersama:
 *   meeting_room (id 0) = Ruang Meeting
 *   social_hub   (id 17) = Social Hub (Lounge/Café, Ping Pong, Catur, Arcade, Taman)
 *
 * Farm & Operasional DIHAPUS (tidak ada dalam 5 divisi).
 */

export const CONFIG_VERSION = '2.0.0-tahap2';
export const NOT_SET = 'not_configured';

export const DEPARTMENTS = [
  { departmentId: 'finance',               name: 'Divisi 1 — Keuangan & Investasi',          headAgentId: null },
  { departmentId: 'marketing_content',     name: 'Divisi 2 — Marketing, Konten & Komersial', headAgentId: null },
  { departmentId: 'it_automation',         name: 'Divisi 3 — IT & Otomasi',                  headAgentId: null },
  { departmentId: 'research_intelligence', name: 'Divisi 4 — Riset & Intelijen',             headAgentId: null },
  { departmentId: 'hr_admin',              name: 'Divisi 5 — HR & Administrasi',             headAgentId: null },
];

// Area bersama: bukan departemen dan tidak punya path Firebase.
export const SHARED_AREAS = [
  { areaId: 'meeting_room', id: 0, name: 'Area Bersama 1 — Ruang Meeting', kind: 'shared', firebase: false },
  { areaId: 'social_hub',   id: 17, name: 'Area Bersama 2 — Social Hub',  kind: 'shared', firebase: false },
];

const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
const A = (id, name, departmentId, roleTitle, specialtyKey, avatarKey, legacyAvatar, runtimeMode, triggerType, configurationStatus, toolAllowlist, extra = {}) => ({
  id, agentId: 'ag_' + String(id).padStart(2, '0') + '_' + slug(name), name, departmentId, roleTitle, specialtyKey,
  avatarKey, legacyAvatar, providerKey: NOT_SET, modelKey: NOT_SET, runtimeMode, triggerType, toolAllowlist,
  enabled: true, configurationStatus, legacy: id <= 15, firebaseKey: String(id), ...extra,
});
const R = (...x) => x.map(t => 'read:' + t);

export const AGENTS = [
  // --- Divisi 1: Keuangan & Investasi (finance) ---
  A(1, 'Trading Saham', 'finance', 'Analis Trading Saham', 'stock_trading_signal', 'avatar_ai_stock_analyst_v3', 'finance', '24h', 'schedule', 'active', R('google_finance', 'screener_results', 'alert_rules')),
  A(2, 'Invest Saham', 'finance', 'Analis Investasi Saham', 'stock_investing', 'avatar_ai_stock_analyst_v3', 'finance', '24h', 'schedule', 'active', R('google_finance', 'sheet_portfolio')),
  A(3, 'Invest Dividen Saham', 'finance', 'Analis Dividen', 'dividend_investing', 'avatar_ai_finance_v2', 'finance', '24h', 'schedule', 'active', R('google_finance', 'sheet_portfolio')),
  A(4, 'Bibit Reksadana', 'finance', 'Analis Reksadana', 'mutual_fund', 'avatar_ai_finance_v2', 'finance', 'on_demand', 'schedule', 'active', R('sheet_bibit')),
  A(5, 'Bitcoin Indodax', 'finance', 'Spesialis Crypto (Indodax)', 'crypto_indodax', 'avatar_ai_crypto_trader_v3', 'finance', '24h', 'schedule', 'active', R('indodax_public', 'indodax_account_readonly')),
  A(6, 'Bitcoin Toko Crypto', 'finance', 'Spesialis Crypto (Toko Crypto / Bot Linux)', 'crypto_tokocrypto', 'avatar_ai_crypto_trader_v3', 'finance', '24h', 'schedule', 'active', R('tokocrypto_public', 'bot_status'), { webhookSources: ['bot.py'] }),
  A(7, 'Emas Logam Mulia', 'finance', 'Pemantau Emas', 'gold_watch', 'avatar_ai_finance_v2', 'finance', '24h', 'schedule', 'active', R('logammulia_page')),
  A(8, 'Pencatat Keuangan', 'finance', 'Pencatat Keuangan', 'bookkeeping', 'avatar_ai_ledger_v3', 'finance', 'on_demand', 'schedule', 'partial', R('sheet_ledger')),

  // --- Divisi 2: Marketing, Konten & Komersial (marketing_content) ---
  A(9, 'Multimedia Video', 'marketing_content', 'Produser Video', 'video_production', 'avatar_ai_video_producer_v3', 'creator', 'on_demand', 'schedule', 'partial', R('sheet_board')),
  A(10, 'Multimedia Grafis', 'marketing_content', 'Desainer Grafis', 'graphic_design', 'avatar_ai_graphic_artist_v3', 'creator', 'on_demand', 'schedule', 'partial', R('sheet_board')),
  A(12, 'Online Shop', 'marketing_content', 'Spesialis Toko Online', 'online_shop', 'avatar_ai_creator_v2', 'creator', 'on_demand', 'schedule', 'partial', R('sheet_board')),
  A(14, 'Resep Masakan & Minuman', 'marketing_content', 'Spesialis Konten Resep', 'recipe_content', 'avatar_ai_recipe_chef_v3', 'creator', 'on_demand', 'schedule', 'partial', R('sheet_board')),

  // --- Divisi 3: IT & Otomasi (it_automation) ---
  A(11, 'Coding', 'it_automation', 'Engineer Coding', 'coding', 'avatar_ai_it_v2', 'analyst', 'on_demand', 'schedule', 'partial', R('sheet_board')),
  A(15, 'AI Chatbot', 'it_automation', 'Koordinator Chatbot & Routing', 'chatbot_routing', 'avatar_ai_chatbot_v3', 'analyst', 'on_demand', 'schedule', 'active', R('agent_status', 'event_log')),
  A(16, 'Automation Worker', 'it_automation', 'Pekerja Otomasi Upload & Monitor', 'upload_monitor', 'avatar_ai_content_publisher_v3', 'analyst', '24h', 'schedule', 'active', R('sheet_board', 'pipeline_queue', 'youtube_stats'), { webhookSources: ['n8n:pipeline', 'n8n:social_metrics'] }),

  // --- Divisi 4: Riset & Intelijen (research_intelligence) ---
  A(13, 'Viral / Trend News', 'research_intelligence', 'Pemantau Tren & Berita', 'trend_radar', 'avatar_ai_trend_scout_v3', 'analyst', '24h', 'schedule', 'active', R('google_trends', 'google_news')),

  // --- Divisi 5: HR & Administrasi (hr_admin) — direncanakan, belum ada agen aktif ---
  { id: null, agentId: 'ag_hr_admin_planned_1', name: 'Pekerja HR (direncanakan)', departmentId: 'hr_admin', roleTitle: 'Staf HR & Administrasi', specialtyKey: 'hr_admin',
    avatarKey: 'avatar_ai_hr_v2', legacyAvatar: null, providerKey: NOT_SET, modelKey: NOT_SET, runtimeMode: 'planned', triggerType: 'manual', toolAllowlist: [], enabled: false, configurationStatus: 'planned', legacy: false, firebaseKey: null },
];

// Job backend = salinan SCHED_DEFAULT di Code.gs (scheduleId, division, taskType).
const J = (scheduleId, id, taskType, trigger, priority, params = {}) => ({
  jobId: 'job_' + taskType + (params.group ? '_' + params.group : params.division ? '_d' + params.division : '') + (scheduleId === 'S01b' ? '_daily' : scheduleId === 'S15b' ? '_daily' : scheduleId === 'S25' ? '_final' : scheduleId === 'S27' ? '_midday' : ''),
  scheduleId, division: id, agentId: AGENTS.find(a => a.id === id).agentId, taskType, trigger, priority, params,
});
export const JOBS = [
  J('S01', 1,  'refresh_stocks',   { everyMinutes: 10 }, 2, { group: 'trading' }),
  J('S02', 2,  'refresh_stocks',   { everyMinutes: 10 }, 2, { group: 'invest' }),
  J('S03', 3,  'refresh_stocks',   { everyMinutes: 10 }, 2, { group: 'dividen' }),
  J('S05', 5,  'refresh_indodax',  { everyMinutes: 10 }, 2),
  J('S06', 6,  'refresh_tokocrypto',{ everyMinutes: 10 }, 2),
  J('S07', 7,  'refresh_gold',     { everyMinutes: 60 }, 3),
  J('S13', 13, 'refresh_trend',    { everyMinutes: 30 }, 3),
  J('S01b',1,  'screen_stocks',    { dailyHourWib: 16 }, 2), // refresh hasil di UI setelah bursa tutup
  J('S17', 1,  'screen_stocks_telegram', { dailyHourWib: 15 }, 1), // screener + kirim Telegram jam 3 sore WIB
  J('S15a',15, 'healthcheck',      { everyMinutes: 30 }, 1),
  J('S15b',15, 'daily_report',     { dailyHourWib: 17 }, 1),
  J('S08', 8,  'finance_summary',  { everyMinutes: 30 }, 3),
  J('S09', 9,  'board_summary',    { everyMinutes: 30 }, 3, { division: 9 }),
  J('S10', 10, 'board_summary',    { everyMinutes: 30 }, 3, { division: 10 }),
  J('S11', 11, 'board_summary',    { everyMinutes: 30 }, 3, { division: 11 }),
  J('S12', 12, 'board_summary',    { everyMinutes: 30 }, 3, { division: 12 }),
  J('S14', 14, 'board_summary',    { everyMinutes: 30 }, 3, { division: 14 }),
  J('S16', 16, 'pipeline_summary', { everyMinutes: 15 }, 2),
  J('S18', 2,  'portfolio_stocks', { everyMinutes: 60 }, 3, { group: 'invest' }),
  J('S19', 3,  'portfolio_stocks', { everyMinutes: 60 }, 3, { group: 'dividen' }),
  J('S20', 4,  'portfolio_bibit',  { dailyHourWib: 9 }, 3),
  J('S21', 5,  'portfolio_crypto', { everyMinutes: 30 }, 2),
  J('S22', 13, 'trend_to_ideas',   { everyMinutes: 360 }, 3),
  J('S23', 16, 'social_metrics',   { everyMinutes: 180 }, 3),
  J('S24', 8,  'portfolio_digest', { dailyHourWib: 17 }, 2),
  J('S25', 1,  'screen_stocks_telegram', { dailyHourWib: 16 }, 1), // pesan FINAL setelah bursa tutup
  J('S26', 1,  'universe_scan', { dailyHourWib: 9 }, 1),  // pindai semua saham saat bursa buka -> ScreenUniverse
  J('S27', 1,  'universe_scan', { dailyHourWib: 13 }, 1), // hitung ulang siang hari
];

export const FIREBASE_PATHS = ['offices/{kode}/messages/{id}', 'offices/{kode}/modes/{id}', 'offices/{kode}/feed/{id}', 'offices/{kode}/runs/{id}'];
export const firebasePathsFor = (id, kode = '{kode}') => FIREBASE_PATHS.map(p => p.replace('{kode}', kode).replace('{id}', id));

export const OFFICE = { version: CONFIG_VERSION, departments: DEPARTMENTS, sharedAreas: SHARED_AREAS, agents: AGENTS, jobs: JOBS };
export const agentByLegacyId = id => AGENTS.find(a => a.id === id) || null;
export const departmentOfLegacyId = id => (agentByLegacyId(id) || {}).departmentId || null;

export function validateOfficeConfig(c = OFFICE) {
  const e = [], dep = new Set(c.departments.map(d => d.departmentId)), uniq = (arr, what) => { if (new Set(arr).size !== arr.length) e.push('duplikat ' + what); };
  if (c.departments.length !== 5) e.push('departemen harus tepat 5, ada ' + c.departments.length);
  uniq([...dep], 'departmentId'); uniq(c.agents.map(a => a.agentId), 'agentId'); uniq(c.jobs.map(j => j.jobId), 'jobId'); uniq(c.jobs.map(j => j.scheduleId), 'scheduleId');
  uniq(c.agents.filter(a => a.id != null).map(a => a.id), 'id legacy');
  c.agents.forEach(a => {
    if (!dep.has(a.departmentId)) e.push(a.agentId + ': departmentId tidak dikenal');
    if (a.id != null && a.firebaseKey !== String(a.id)) e.push(a.agentId + ': firebaseKey harus sama dengan id');
    if (a.id == null && (a.enabled || a.configurationStatus !== 'planned' || a.firebaseKey !== null)) e.push(a.agentId + ': worker planned tidak boleh aktif/punya path');
    if (a.providerKey === undefined || a.modelKey === undefined) e.push(a.agentId + ': providerKey/modelKey wajib');
    if (/trade|write|withdraw/.test((a.toolAllowlist || []).join(','))) e.push(a.agentId + ': allowlist memuat aksi tulis/trading');
  });
  c.jobs.forEach(j => { const a = c.agents.find(x => x.agentId === j.agentId); if (!a || a.id !== j.division) e.push(j.jobId + ': agent/division tidak cocok'); });
  return e;
}
