export const metadata = {
  title: 'Términos de Servicio Globales · Glass World Studio',
  description:
    'Términos de Servicio Globales de Glass World Studio para usuarios, artesanos y compradores en el mercado internacional de vidrio artístico e industrial.',
};

export default function TermsPage() {
  return (
    <main className="legal legal--terms">
      <section className="legal__hero">
        <header className="legal__header">
          <p className="legal__eyebrow">Glass World Studio · Marco Legal Internacional</p>
          <h1 className="legal__title">Términos de Servicio Globales</h1>
          <p className="legal__subtitle">Usuarios · Artesanos · Compradores</p>
          <p className="legal__effective">Fecha de entrada en vigor: Por determinar</p>
        </header>

        <div className="legal__body">
          <section className="legal__section">
            <h2>1. Alcance y aceptación</h2>
            <p>
              Estos Términos de Servicio Globales ("TDS") regulan el acceso y uso de la plataforma,
              servicios y marketplace vertical de Glass World Studio ("GWS"). Al acceder, registrarse
              o utilizar GWS, usted reconoce haber leído, comprendido y aceptado estos TDS, así como
              las políticas complementarias aplicables.
            </p>
          </section>

          <section className="legal__section">
            <h2>2. Partes y régimen jurídico aplicable</h2>
            <p>
              GWS opera con alcance global. Estos TDS se interpretarán conforme a principios de buena
              fe internacional. Las partes aceptan que las disputas se resolverán conforme a los
              mecanismos establecidos en la Política Internacional de Devoluciones, Disputas y
              Garantías, respetando las normas de protección al consumidor vigentes en la jurisdicción
              del usuario cuando resulten imperativas.
            </p>
          </section>

          <section className="legal__section">
            <h2>3. Responsabilidades de artesanos y compradores</h2>
            <p>
              Artesanos y vendedores son responsables de la exactitud de descripciones, especificaciones
              técnicas, cumplimiento de exportación/importación, etiquetado, seguridad del producto y
              declaraciones requeridas por su jurisdicción. Compradores son responsables de verificar
              restricciones de importación, aranceles, IVA/VAT y requisitos regulatorios aplicables a
              su región.
            </p>
          </section>

          <section className="legal__section">
            <h2>4. Limitación y exención</h2>
            <p>
              En la medida permitida por la ley aplicable, GWS no asume responsabilidad por pérdidas
              indirectas, consecuentes o punitivas derivadas de retrasos aduaneros, variaciones
              cambiarias, restricciones regulatorias o fuerza mayor. Las obligaciones se limitan al
              alcance expresamente establecido en estos TDS.
            </p>
          </section>

          <section className="legal__section">
            <h2>5. Modificaciones</h2>
            <p>
              GWS podrá actualizar estos TDS para reflejar cambios regulatorios, operativos o de
              cumplimiento global. Las versiones actualizadas entrarán en vigor en la fecha indicada.
              El uso continuado tras la publicación constituye aceptación de los cambios.
            </p>
          </section>
        </div>

        <footer className="legal__footer">
          <nav className="legal__nav">
            <a href="/privacy">Política de Privacidad Internacional</a>
            <a href="/cookies">Declaración de Cookies</a>
            <a href="/refunds">Política de Devoluciones, Disputas y Garantías</a>
            <a href="/">Volver al inicio</a>
          </nav>
        </footer>
      </section>
    </main>
  );
}
