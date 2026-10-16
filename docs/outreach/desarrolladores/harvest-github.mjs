// Cosecha de la Tanda 3 de devs — Glass World Studio (GitHub, API pública).
//
// Ejecutar CUANDO EL RATE LIMIT ESTÉ LIBRE:
//   node docs/outreach/desarrolladores/harvest-github.mjs
//
// Qué hace:
//   1. Lee el rate limit de la API de GitHub y avisa si no hay margen.
//   2. Corre las consultas de búsqueda definidas en QUERIES.
//   3. Deduplica contra los logins ya presentes en prospects_devs.csv.
//   4. Enriquece cada candidato leyendo su PERFIL PÚBLICO (bio, empresa, ubicación).
//   5. Escribe la lista en github-tanda3.csv para tu curación manual.
//
// Sin autenticar: search ~10 req/min, core ~60 req/hora. El script respeta el ritmo.
// Regla: no inventar datos. Lo que no aparece, queda vacío.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// --- Consultas de la Tanda 3 (editable) --------------------------------------
// Enfocadas en: marketplaces B2B, Next.js/React/TypeScript y arquitectura de software.
const QUERIES = [
  'type:user marketplace in:bio language:TypeScript followers:>20',
  'type:user "head of engineering" in:bio language:TypeScript followers:>20',
  'type:user "tech lead" in:bio language:TypeScript followers:>30',
  'type:user graphql in:bio language:TypeScript followers:>30',
  'type:user "event-driven" in:bio language:TypeScript followers:>20',
  'type:user "platform engineer" in:bio language:TypeScript followers:>30',
  'type:user marketplace in:bio language:TypeScript location:Brazil followers:>3',
  'type:user marketplace in:bio language:TypeScript location:Argentina followers:>3',
];

const here = dirname(fileURLToPath(import.meta.url));
const existingCsv = resolve(here, 'prospects_devs.csv');
const outCsv = resolve(here, 'github-tanda3.csv');
const UA = { 'User-Agent': 'gws-prospecting', Accept: 'application/vnd.github+json' };
const HTML_UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function existingLogins() {
  const set = new Set();
  if (!existsSync(existingCsv)) return set;
  const text = readFileSync(existingCsv, 'utf8');
  for (const m of text.matchAll(/github\.com\/([A-Za-z0-9-]+)/g)) set.add(m[1]);
  return set;
}

async function rateLimit() {
  try {
    const r = await fetch('https://api.github.com/rate_limit', { headers: UA });
    const j = await r.json();
    return j.resources;
  } catch {
    return null;
  }
}

async function searchUsers(q) {
  const r = await fetch(
    `https://api.github.com/search/users?q=${encodeURIComponent(q)}&per_page=20&sort=followers`,
    { headers: UA },
  );
  if (r.status !== 200) return { q, status: r.status, items: [] };
  const j = await r.json();
  return { q, total: j.total_count, items: (j.items ?? []).filter((i) => i.type === 'User') };
}

async function enrich(login) {
  try {
    const r = await fetch(`https://github.com/${login}`, { headers: HTML_UA });
    if (r.status !== 200) return { login, status: r.status };
    const html = await r.text();
    const bio = (html.match(/data-bio-text="([^"]*)"/) || [])[1] || '';
    const start = html.indexOf('vcard-details');
    const block = start >= 0 ? html.slice(start, start + 2500) : '';
    const items = {};
    for (const m of block.matchAll(/itemprop="([a-zA-Z]+)"[^>]*>([\s\S]*?)<\/li>/g)) {
      items[m[1]] = m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    return { login, bio: bio.replace(/\s+/g, ' ').trim(), company: items.worksFor || '', location: items.homeLocation || '' };
  } catch (e) {
    return { login, err: String(e).slice(0, 80) };
  }
}

const csvEscape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

async function main() {
  const rl = await rateLimit();
  if (rl) {
    console.log(`GitHub — core: ${rl.core.remaining}/${rl.core.limit} · search: ${rl.search.remaining}/${rl.search.limit}`);
    if (rl.search.remaining < 2) {
      console.log('Sin margen de búsqueda. Reintentar cuando se resetee (~1 min).');
    }
  }

  const seen = existingLogins();
  console.log(`Logins ya conocidos: ${seen.size}`);

  const cands = [];
  for (const q of QUERIES) {
    const { items, status, total } = await searchUsers(q);
    if (status && status !== 200) {
      console.log(`  ! "${q}" → HTTP ${status} (rate limit?)`);
      await sleep(2000);
      continue;
    }
    let added = 0;
    for (const it of items) {
      if (!seen.has(it.login)) {
        seen.add(it.login);
        cands.push({ login: it.login, query: q });
        added += 1;
      }
    }
    console.log(`  · "${q}" → total ${total ?? '?'} · nuevos ${added}`);
    await sleep(2000); // respetar 10 req/min
  }

  console.log(`Candidatos nuevos: ${cands.length}. Enriqueciendo perfiles...`);
  const rows = [];
  for (const c of cands) {
    const e = await enrich(c.login);
    rows.push({ ...c, ...e });
    await sleep(300);
  }

  const lines = ['login,nombre_bio,empresa,ubicacion_bio,url,query'];
  for (const r of rows) {
    lines.push([r.login, r.bio, r.company, r.location, `https://github.com/${r.login}`, r.query].map(csvEscape).join(','));
  }
  writeFileSync(outCsv, `${lines.join('\n')}\n`, 'utf8');

  console.log(`Escrito: ${outCsv}`);
  console.log(`Candidatos con perfil enriquecido: ${rows.filter((r) => r.bio).length}/${rows.length}`);
  console.log('Revisar y curar a mano antes de sumar a prospects_devs.csv.');
}

main();
