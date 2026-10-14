export const metadata = {
  title: 'Declaración de Cookies · Glass World Studio',
  description:
    'Declaración técnica de cookies, almacenamiento local y tecnologías de rastreo para Glass World Studio, compatible con GDPR e ePrivacy.',
};

export default function CookiesPage() {
  return (
    <main className="legal legal--cookies">
      <section className="legal__hero">
        <header className="legal__header">
          <p className="legal__eyebrow">Transparencia · Consentimiento Explícito</p>
          <h1 className="legal__title">Declaración de Cookies</h1>
          <p className="legal__effective">Fecha de entrada en vigor: Por determinar</p>
        </header>

        <div className="legal__body">
          <section className="legal__section">
            <h2>1. Finalidad</h2>
            <p>
              GWS utiliza cookies y tecnologías similares (almacenamiento local, señales de preferencia)
              para operar la plataforma, mantener sesión segura, recordar preferencias de privacidad,
              medir rendimiento técnico y, solo con consentimiento explícito, habilitar funciones
              analíticas o publicitarias.
            </p>
          </section>

          <section className="legal__section">
            <h2>2. Tipos de cookies</h2>
            <ul>
              <li>
                <strong>Estrictamente necesarias:</strong> autenticación, seguridad CSRF, carrito de
                compras, gestión de sesión. No requieren consentimiento según directivas aplicables.
              </li>
              <li>
                <strong>Funcionales:</strong> preferencias de idioma/región, estado de UI. Pueden
                requerir consentimiento según jurisdicción.
              </li>
              <li>
                <strong>Analíticas/estadísticas:</strong> rendimiento, errores, uso agregado. Solo con
                consentimiento explícito.
              </li>
              <li>
                <strong>Marketing/rastreo de terceros:</strong> no habilitadas por defecto. Solo con
                consentimiento granular y revocable.
              </li>
            </ul>
          </section>

          <section className="legal__section">
            <h2>3. Consentimiento y revocación</h2>
            <p>
              El consentimiento se solicita mediante banner/modal de consentimiento con granularidad
              por categoría. Los usuarios pueden revocar o modificar su consentimiento en cualquier
              momento desde "Preferencias de Privacidad". Las preferencias se almacenan con marca
              temporal y son auditables.
            </p>
          </section>

          <section className="legal__section">
            <h2>4. Almacenamiento local y duración</h2>
            <p>
              Se utiliza localStorage/sessionStorage únicamente para preferencias técnicas no
              identificativas o para estado de consentimiento. Las cookies operativas tienen duración
              mínima necesaria. Las analíticas tienen vencimiento definido y son anonimizadas cuando
              sea técnicamente viable.
            </p>
          </section>

          <section className="legal__section">
            <h2>5. Cumplimiento ePrivacy/GDPR</h2>
            <p>
              GWS diseña el banner para evitar el "consentimiento por defecto" (pre-ticked). Las
              categorías no esenciales solo se cargan tras consentimiento positivo. Se mantiene
              registro de consentimiento para trazabilidad y auditoría.
            </p>
          </section>
        </div>

        <footer className="legal__footer">
          <nav className="legal__nav">
            <a href="/terms">Términos de Servicio Globales</a>
            <a href="/privacy">Política de Privacidad Internacional</a>
            <a href="/refunds">Política de Devoluciones, Disputas y Garantías</a>
            <a href="/">Volver al inicio</a>
          </nav>
        </footer>
      </section>
    </main>
  );
}
