'use client';

import { useEffect, useState, type ReactNode } from 'react';

export type ConsentCategory = 'necessary' | 'functional' | 'analytics' | 'marketing';

export interface ConsentPreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  doNotSell: boolean;
  updatedAt: number;
}

interface PrivacyConsentProps {
  /** Ruta a la política de privacidad (por defecto /privacy) */
  privacyHref?: string;
  /** Ruta a la declaración de cookies (por defecto /cookies) */
  cookiesHref?: string;
  /** Ruta a los términos (por defecto /terms) */
  termsHref?: string;
  /** Callback al guardar preferencias */
  onSave?: (prefs: ConsentPreferences) => void;
  /** Mostrar opción "Do Not Sell" (CCPA/CPRA) — por defecto true */
  showDoNotSell?: boolean;
}

const STORAGE_KEY = 'gws.privacy.consent.v1';

const DEFAULT_PREFS: ConsentPreferences = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
  doNotSell: false,
  updatedAt: 0,
};

export function PrivacyConsent({
  privacyHref = '/privacy',
  cookiesHref = '/cookies',
  termsHref = '/terms',
  onSave,
  showDoNotSell = true,
}: PrivacyConsentProps): ReactNode {
  const [isOpen, setIsOpen] = useState(false);
  const [prefs, setPrefs] = useState<ConsentPreferences>(DEFAULT_PREFS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ConsentPreferences>;
        setPrefs({ ...DEFAULT_PREFS, ...parsed });
        // Si ya existe consentimiento válido (necessary true + timestamp), no mostrar banner
        if (parsed.necessary && typeof parsed.updatedAt === 'number' && parsed.updatedAt > 0) {
          setIsOpen(false);
          return;
        }
      }
    } catch {
      // Ignorar errores de parsing
    }
    setIsOpen(true);
  }, []);

  function save(p: ConsentPreferences) {
    const next = { ...p, necessary: true, updatedAt: Date.now() };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignorar errores de almacenamiento
    }
    setPrefs(next);
    setIsOpen(false);
    onSave?.(next);
  }

  function acceptAll() {
    save({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
      doNotSell: prefs.doNotSell,
      updatedAt: 0,
    });
  }

  function rejectNonEssential() {
    save({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      doNotSell: prefs.doNotSell,
      updatedAt: 0,
    });
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="privacy-consent"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-consent-title"
      aria-describedby="privacy-consent-desc"
    >
      <div className="privacy-consent__backdrop" aria-hidden="true" />
      <div className="privacy-consent__panel">
        <header className="privacy-consent__header">
          <h2 id="privacy-consent-title">Preferencias de Privacidad · Glass World Studio</h2>
        </header>
        <div className="privacy-consent__body">
          <p id="privacy-consent-desc">
            Utilizamos cookies y tecnologías similares para operar la plataforma, mantener la
            seguridad y, solo con su consentimiento explícito, habilitar funcionalidades analíticas
            o de marketing. Para residentes de California (CCPA/CPRA), puede ejercer su derecho a
            "Do Not Sell My Personal Information".
          </p>

          <div className="privacy-consent__links">
            <a href={termsHref}>Términos de Servicio Globales</a>
            <a href={privacyHref}>Política de Privacidad Internacional</a>
            <a href={cookiesHref}>Declaración de Cookies</a>
          </div>

          <form
            className="privacy-consent__form"
            onSubmit={(e) => {
              e.preventDefault();
              save(prefs);
            }}
          >
            <fieldset className="privacy-consent__group">
              <legend>Categorías de cookies</legend>
              <label className="privacy-consent__item">
                <input type="checkbox" checked disabled />
                <span>
                  <strong>Estrictamente necesarias</strong> — Requeridas para funcionamiento y
                  seguridad (no revocables).
                </span>
              </label>

              <label className="privacy-consent__item">
                <input
                  type="checkbox"
                  checked={prefs.functional}
                  onChange={(e) =>
                    setPrefs((prev) => ({ ...prev, functional: e.target.checked }))
                  }
                />
                <span>
                  <strong>Funcionales</strong> — Preferencias de idioma/región y experiencia de
                  usuario.
                </span>
              </label>

              <label className="privacy-consent__item">
                <input
                  type="checkbox"
                  checked={prefs.analytics}
                  onChange={(e) =>
                    setPrefs((prev) => ({ ...prev, analytics: e.target.checked }))
                  }
                />
                <span>
                  <strong>Analíticas</strong> — Medición de rendimiento y uso agregado (anónimo
                  cuando sea viable).
                </span>
              </label>

              <label className="privacy-consent__item">
                <input
                  type="checkbox"
                  checked={prefs.marketing}
                  onChange={(e) =>
                    setPrefs((prev) => ({ ...prev, marketing: e.target.checked }))
                  }
                />
                <span>
                  <strong>Marketing</strong> — Solo con consentimiento explícito. Desactivado por
                  defecto.
                </span>
              </label>
            </fieldset>

            {showDoNotSell && (
              <fieldset className="privacy-consent__group">
                <legend>CCPA/CPRA (California)</legend>
                <label className="privacy-consent__item">
                  <input
                    type="checkbox"
                    checked={prefs.doNotSell}
                    onChange={(e) =>
                      setPrefs((prev) => ({ ...prev, doNotSell: e.target.checked }))
                    }
                  />
                  <span>
                    <strong>Do Not Sell My Personal Information</strong> — Ejercer derecho a no
                    vender ni compartir información personal (aplica a residentes de California).
                  </span>
                </label>
              </fieldset>
            )}

            <div className="privacy-consent__actions">
              <button type="button" className="btn btn--ghost" onClick={rejectNonEssential}>
                Rechazar no esenciales
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => save(prefs)}>
                Guardar preferencias
              </button>
              <button type="button" className="btn btn--primary" onClick={acceptAll}>
                Aceptar todo
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
