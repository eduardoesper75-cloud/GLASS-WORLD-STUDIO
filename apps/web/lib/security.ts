/**
 * GWS · Seguridad local (cliente) — FP-05 defensa en profundidad.
 * Los secretos de sesión viven en cookies httpOnly manejadas por el
 * servidor (app/api/gateway). Esto complementa para datos locales que
 * la app decide persistir: cifrado AES-GCM (WebCrypto) con una clave
 * aleatoria, re-cifrado rotando la clave (antiguos descifrables).
 */


const LS_KEY = 'gws_vault';
const LS_SECRET = 'gws_vault_secret_v1';
const ROTATION = 4;

function concat(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a);
  out.set(b, a.length);
  return out;
}

async function getOrCreateKey(secret: string): Promise<CryptoKey> {
  const raw = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret.padEnd(32, '0').slice(0, 32)),
    'AES-GCM',
    false,
    ['encrypt', 'decrypt'],
  );
  return raw;
}

function randomSecret(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return [...bytes].map((b) => b.toString(36).padStart(2, '0')).join('');
}

export async function secureSet(key: string, value: unknown): Promise<void> {
  if (typeof window === 'undefined' || !crypto?.subtle) return;
  let secret = window.localStorage.getItem(LS_SECRET);
  if (!secret) {
    secret = randomSecret();
    window.localStorage.setItem(LS_SECRET, secret);
  }
  const cryptoKey = await getOrCreateKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    new TextEncoder().encode(JSON.stringify(value)),
  );
  const box = concat(iv, new Uint8Array(enc));
  const vault = JSON.parse(window.localStorage.getItem(LS_KEY) ?? '{}') as Record<string, string>;
  vault[key] = [...box].map((b) => b.toString(36)).join('');
  window.localStorage.setItem(LS_KEY, JSON.stringify(vault));
}

export async function secureGet<T>(key: string): Promise<T | null> {
  if (typeof window === 'undefined' || !crypto?.subtle) return null;
  const vault = JSON.parse(window.localStorage.getItem(LS_KEY) ?? '{}') as Record<string, string>;
  const payload = vault[key];
  if (!payload) return null;

  const secret = window.localStorage.getItem(LS_SECRET);
  if (!secret) return null;

  const cryptoKey = await getOrCreateKey(secret);
  const arr = [...payload].map((c) => parseInt(c, 36));
  const box = new Uint8Array(arr);
  const iv = box.slice(0, 12);
  const data = box.slice(12);

  try {
    const dec = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, data);
    return JSON.parse(new TextDecoder().decode(dec)) as T;
  } catch {
    return null;
  }
}

export async function secureRemove(key: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const vault = JSON.parse(window.localStorage.getItem(LS_KEY) ?? '{}') as Record<string, string>;
  delete vault[key];
  window.localStorage.setItem(LS_KEY, JSON.stringify(vault));
}

/** Rotación de clave: re-cifra todo el vault con un secreto nuevo. */
export async function rotateLocalVault(): Promise<void> {
  if (typeof window === 'undefined' || !crypto?.subtle) return;
  const old = window.localStorage.getItem(LS_SECRET);
  const vault = JSON.parse(window.localStorage.getItem(LS_KEY) ?? '{}') as Record<string, string>;
  if (!old || !Object.keys(vault).length) return;

  // Se conserva el secreto anterior para descifrar, y se re-cifra con el nuevo.
  for (let i = 0; i < ROTATION; i++) {
    const next = randomSecret();
    const oldKey = await getOrCreateKey(old);
    const newKey = await getOrCreateKey(next);
    for (const [k, payload] of Object.entries(vault)) {
      const arr = [...payload].map((c) => parseInt(c, 36));
      const box = new Uint8Array(arr);
      const iv = box.slice(0, 12);
      const data = box.slice(12);
      try {
        const dec = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, oldKey, data);
        const encIv = crypto.getRandomValues(new Uint8Array(12));
        const enc = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv: encIv },
          newKey,
          dec,
        );
        const newBox = concat(encIv, new Uint8Array(enc));
        vault[k] = [...newBox].map((b) => b.toString(36)).join('');
      } catch {
        delete vault[k];
      }
    }
    window.localStorage.setItem(LS_KEY, JSON.stringify(vault));
    window.localStorage.setItem(LS_SECRET, next);
  }
}