export const metadata = {
  title: 'Política Internacional de Devoluciones, Disputas y Garantías · Glass World Studio',
  description:
    'Política internacional para devoluciones, disputas, reembolsos y garantías aplicable a artesanos y compradores de Glass World Studio.',
};

export default function RefundsPage() {
  return (
    <main className="legal legal--refunds">
      <section className="legal__hero">
        <header className="legal__header">
          <p className="legal__eyebrow">Comercio Transfronterizo · Protección al Consumidor</p>
          <h1 className="legal__title">Política Internacional de Devoluciones, Disputas y Garantías</h1>
          <p className="legal__effective">Fecha de entrada en vigor: Por determinar</p>
        </header>

        <div className="legal__body">
          <section className="legal__section">
            <h2>1. Alcance</h2>
            <p>
              Esta política rige devoluciones, cancelaciones, reembolsos, disputas y garantías para
              transacciones entre compradores y artesanos a través de GWS. Se aplica sin perjuicio de
              derechos imperativos de protección al consumidor en la jurisdicción del comprador.
            </p>
          </section>

          <section className="legal__section">
            <h2>2. Devoluciones y reembolsos</h2>
            <p>
              Debido a la naturaleza artesanal y frágil del vidrio, las devoluciones están sujetas a
              criterios específicos: daño en tránsito, artículo no conforme a la descripción, error de
              envío o defecto manifiesto. Los plazos, condiciones de embalaje y responsabilidad de
              retorno se definirán por caso, priorizando evidencia fotográfica y seguimiento de envío.
            </p>
          </section>

          <section className="legal__section">
            <h2>3. Comercio transfronterizo: aduanas, aranceles e impuestos</h2>
            <p>
              Para envíos internacionales, aranceles, derechos de importación, IVA/VAT, tasas y
              restricciones son responsabilidad del comprador, salvo indicación explícita contraria en
              la oferta. GWS estructurará el cálculo y presentación de información fiscal conforme a
              la región del usuario (parámetros de divisas globales e impuestos por destino) para
              mejorar transparencia.
            </p>
          </section>

          <section className="legal__section">
            <h2>4. Garantías</h2>
            <p>
              Las garantías son otorgadas por el artesano conforme a la ficha del producto (alcance,
              plazo, exclusiones). GWS facilita la comunicación y mediación, pero no sustituye
              garantías legales imperativas del país del comprador.
            </p>
          </section>

          <section className="legal__section">
            <h2>5. Resolución de disputas</h2>
            <p>
              GWS promoverá resolución amistosa con plazo razonable. Si no hay acuerdo, se activará
              el flujo de disputa documentado (evidencia, trazabilidad, estados). Para disputas
              transfronterizas, se priorizará mediación y se respetarán foros/leyes aplicables
              obligatorias. Las pasarelas de pago seguirán sus propios flujos de protección al
              comprador cuando proceda.
            </p>
          </section>

          <section className="legal__section">
            <h2>6. Logística y seguros</h2>
            <p>
              Se recomienda uso de embalaje especializado y, cuando aplique, seguro de envío. Los
              reclamos por rotura requieren reporte oportuno con evidencia. GWS documentará requisitos
              logísticos para mitigar riesgo transfronterizo.
            </p>
          </section>
        </div>

        <footer className="legal__footer">
          <nav className="legal__nav">
            <a href="/terms">Términos de Servicio Globales</a>
            <a href="/privacy">Política de Privacidad Internacional</a>
            <a href="/cookies">Declaración de Cookies</a>
            <a href="/">Volver al inicio</a>
          </nav>
        </footer>
      </section>
    </main>
  );
}
