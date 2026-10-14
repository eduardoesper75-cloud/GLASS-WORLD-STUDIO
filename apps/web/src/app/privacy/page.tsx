export const metadata = {
  title: 'Política de Privacidad Internacional · Glass World Studio',
  description:
    'Política de Privacidad Internacional compatible con GDPR (UE), CCPA/CPRA (California) y mejores prácticas globales para Glass World Studio.',
};

export default function PrivacyPage() {
  return (
    <main className="legal legal--privacy">
      <section className="legal__hero">
        <header className="legal__header">
          <p className="legal__eyebrow">Cumplimiento Global · Privacidad por Diseño</p>
          <h1 className="legal__title">Política de Privacidad Internacional</h1>
          <p className="legal__effective">Fecha de entrada en vigor: Por determinar</p>
        </header>

        <div className="legal__body">
          <section className="legal__section">
            <h2>1. Principios (GDPR-aligned)</h2>
            <p>
              GWS aplica los principios de licitud, lealtad, transparencia, minimización de datos,
              exactitud, limitación de finalidad, integridad y confidencialidad, y responsabilidad
              demostrable.
            </p>
          </section>

          <section className="legal__section">
            <h2>2. Categorías de datos</h2>
            <p>
              Solo se recogen datos necesarios para operar el marketplace: cuenta de usuario (identidad
              mínima), información de artesano/comprador, dirección de envío/facturación, datos de
              transacción, logs de seguridad y preferencias de consentimiento. No se recogen datos
              especialmente protegidos sin consentimiento explícito.
            </p>
          </section>

          <section className="legal__section">
            <h2>3. Base jurídica (GDPR) y derechos (GDPR/CCPA)</h2>
            <p>
              Las bases incluyen ejecución de contrato, cumplimiento legal, intereses legítimos
              documentados y consentimiento explícito para cookies/rastreo. Los usuarios residentes en
              la UE/EEE disponen de derechos de acceso, rectificación, supresión, limitación,
              portabilidad, oposición y revocación del consentimiento. Residentes de California
              (CCPA/CPRA) disponen de derechos a conocer, eliminar, corregir, limitar uso de datos
              sensibles y optar por no vender ni compartir información personal.
            </p>
          </section>

          <section className="legal__section">
            <h2>4. "Do Not Sell My Personal Information"</h2>
            <p>
              Para residentes de California, GWS ofrece un mecanismo claro para ejercer el derecho a
              "No vender mi información personal" ("Do Not Sell My Personal Information"). Este
              derecho puede ejercerse desde el panel de privacidad, en el registro o mediante
              canales de privacidad indicados en esta política. GWS no vende información personal
              sin consentimiento explícito cuando ello es requerido por ley.
            </p>
          </section>

          <section className="legal__section">
            <h2>5. Transferencias transfronterizas y seguridad</h2>
            <p>
              Las transferencias internacionales se realizan con garantías adecuadas (cláusulas
              contractuales tipo, decisiones de adecuación u otros mecanismos válidos). Se aplican
              controles técnicos y organizativos (mínimo privilegio, cifrado en tránsito/descanso,
              registro de accesos y respuesta a incidentes).
            </p>
          </section>

          <section className="legal__section">
            <h2>6. Retención y ejercicio de derechos</h2>
            <p>
              Los datos se conservan solo el tiempo necesario para la finalidad. Los usuarios pueden
              ejercer sus derechos contactando al responsable de privacidad de GWS. Las solicitudes se
              atenderán sin demora indebida conforme a plazos legales aplicables.
            </p>
          </section>
        </div>

        <footer className="legal__footer">
          <nav className="legal__nav">
            <a href="/terms">Términos de Servicio Globales</a>
            <a href="/cookies">Declaración de Cookies</a>
            <a href="/refunds">Política de Devoluciones, Disputas y Garantías</a>
            <a href="/">Volver al inicio</a>
          </nav>
        </footer>
      </section>
    </main>
  );
}
