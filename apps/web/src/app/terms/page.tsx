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
          <p className="legal__subtitle">Usuarios · Artesanos · Compradores · Instructores</p>
          <p className="legal__effective">Fecha de entrada en vigor: 15 de octubre de 2026</p>
        </header>

        <div className="legal__body">
          <section className="legal__section">
            <h2>1. Aceptación de los Términos</h2>
            <p>
              Al acceder, utilizar o registrarse en Glass World Studio ("Plataforma"), los usuarios
              ("Compradores", "Artesanos/Vendedores", "Instructores") aceptan quedar vinculados por
              los presentes Términos de Servicio Globales ("TDS"). Si no está de acuerdo, no debe
              utilizar la Plataforma.
            </p>
          </section>

          <section className="legal__section">
            <h2>2. Estructura del Marketplace y Modelo Multivendedor</h2>
            <p>
              Glass World Studio opera como un marketplace vertical intermediario que conecta
              compradores con artistas del vidrio y maestros instructores, abarcando las disciplinas
              Hot-Kiln, Flame y Cold-Working. Los Artesanos/Vendedores son contratistas
              independientes responsables de la autenticidad, el estado físico, la legalidad y la
              ejecución del envío o entrega de sus obras o contenidos digitales de formación.
            </p>
          </section>

          <section className="legal__section">
            <h2>3. Propiedad Intelectual y Derechos de los Artesanos</h2>
            <p>
              Todo el software propietario, diseños UI/UX, marcas, logotipos y demás activos de
              marca pertenecen, de forma exclusiva, a Glass World Studio. Los artistas conservan
              sus derechos morales y de propiedad intelectual sobre sus obras individuales. Al
              publicar una obra, el artista otorga a Glass World Studio una licencia mundial, no
              exclusiva y revocable para mostrar, promocionar y facilitar la venta o distribución de
              dicha obra, en los canales y formatos necesarios para el funcionamiento de la
              Plataforma.
            </p>
          </section>

          <section className="legal__section">
            <h2>4. Transacciones, Comisiones e Impuestos Transfronterizos</h2>
            <p>
              Las comisiones de la Plataforma y las tarifas de procesamiento de pagos se calculan y
              muestran en el proceso de compra. Compradores, Artesanos/Vendedores e Instructores
              aceptan cumplir con las leyes fiscales internacionales aplicables (incluidos IVA, Impuesto
              sobre Ventas, Derechos de Importación y demás gravámenes) según su jurisdicción de
              operación. La Plataforma facilitará la transparencia de estos conceptos conforme a la
              arquitectura de comercio transfronterizo definida para GWS.
            </p>
          </section>

          <section className="legal__section">
            <h2>5. Limitación de Responsabilidad y Resolución de Disputas</h2>
            <p>
              Glass World Studio proporcionará mecanismos de mediación de disputas para las
              transacciones realizadas a través de la Plataforma. En la medida permitida por la ley
              aplicable, Glass World Studio no será responsable por retrasos en el envío, retenciones
              aduaneras, fallos de logística de terceros, variaciones cambiarias o fuerza mayor. Las
              disputas se resolverán priorizando la mediación amistosa, sin perjuicio de los derechos
              imperativos de protección al consumidor vigentes en la jurisdicción del comprador.
            </p>
          </section>

          <section className="legal__section">
            <h2>6. Vigencia y Modificaciones</h2>
            <p>
              Estos TDS entran en vigor el 15 de octubre de 2026. GWS podrá modificarlos para
              reflejar cambios legales, regulatorios u operativos. Las versiones actualizadas se
              publicarán en esta página con fecha de vigencia. El uso continuado tras la publicación
              constituye la aceptación de los TDS modificados.
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
