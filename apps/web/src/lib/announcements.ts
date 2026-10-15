export interface AnnouncementSection {
  id: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface Announcement {
  slug: string;
  eyebrow: string;
  title: string;
  publishedAt: string;
  effective: string;
  author: {
    name: string;
    role: string;
    contact: string;
  };
  lead: string[];
  sections: AnnouncementSection[];
  closing: string;
  farewell: string;
}

export const reaparicion: Announcement = {
  slug: 'reaparicion',
  eyebrow: 'Comunicado Oficial · Glass World Studio',
  title: 'De regreso en la plataforma: la nueva etapa de Glass World Studio',
  publishedAt: '2026-10-15',
  effective: 'Fecha de publicación: 15 de octubre de 2026',
  author: {
    name: 'Eduardo Esper',
    role: 'Fundador · Glass World Studio',
    contact: 'esper.eduardo@gmail.com',
  },
  lead: [
    'Hola a todos, soy Eduardo Esper.',
    'Siento que Glass World Studio no es solo un proyecto: es el sueño y la necesidad postergada de muchos de nosotros. Esta plataforma tiene un profundo deseo de ver la luz para unificar, conectar y digitalizar de punta a punta todo el vasto universo del vidrio.',
    'Una actividad tan milenaria, rica y compleja como la nuestra merece un hogar integral. Un espacio donde quepamos todos: desde el artista y el artesano que dan forma al alma del material, pasando por la gran industria y el comercio diario, hasta quienes nos proveen los materiales y componentes esenciales.',
    'Imagínate el poder de un entorno donde sea posible gestionar licitaciones en tiempo real, interactuar dinámicamente y tender puentes reales entre los grandes maestros del arte en vidrio y los ingenieros y científicos más técnicos del rubro. No tengo ninguna duda de que esto viene a solucionar una carencia histórica y a acercar a todas las partes, porque simplemente no existe en el mundo una plataforma con este alcance. Somos pioneros en esto. Esto nace para unir lo que siempre estuvo disperso, para darle escala y futuro a nuestra pasión.',
  ],
  sections: [
    {
      id: 'agradecimiento',
      heading: 'Agradecimiento y Reconocimiento a la Comunidad',
      paragraphs: [
        'Quería tomarme este momento para dirigirme directamente a ustedes y retomar la actividad. Lo primero que quiero hacer es reconocer y agradecer profundamente el valor de toda la comunidad del vidrio: gracias a la increíble repercusión, el apoyo y la lectura de miles de profesionales que nos acompañaron en la primera etapa, pudimos validar la visión y comprender exactamente lo que el sector necesita.',
        'Tras este tiempo fuera del radar enfocado en la construcción interna, volvemos con una propuesta renovada, mejorada y significativamente más sólida.',
        'Aprovechamos estos meses de trabajo a puerta cerrada para ordenar la casa y consolidar el proyecto en el marco legal e institucional: actualmente nos encontramos culminando el trámite de registro de propiedad intelectual y marca ante el INPI.',
      ],
    },
    {
      id: 'estructura',
      heading: 'La Estructura de Glass World Studio',
      paragraphs: [
        'Para quienes ya nos conocen y para quienes nos leen por primera vez, Glass World Studio es el Marketplace Vertical integral para la industria global del vidrio, diseñado sobre una arquitectura viva compuesta por:',
      ],
      bullets: [
        'Las 6 Galaxias Principales: Maestros (Creadores/Escuelas), Comercio (Marketplace/B2B), Comunidad, Bono Silicato & Envases (Sostenibilidad), Industria y Materiales/Componentes.',
        'Los 5 Satélites de Servicio: Radar de Oferta y Demanda, Radar de Ingeniería Predictiva (Termia/COE), Portal de Profesionales (Técnicos/Científicos), Rincón del Usado GWS y Bóveda del Conocimiento.',
      ],
    },
    {
      id: 'flechas',
      heading: 'Tres Flechas Estratégicas',
      paragraphs: ['En esta nueva fase, la propuesta viene recargada y apuntada con tres flechas estratégicas bien claras:'],
      bullets: [
        '🎯 Inversores: para escalar la infraestructura y expansión del ecosistema regional e internacional.',
        '🎯 Comunidad de Programadores y Desarrolladores: para sumarse al desarrollo de los motores y la arquitectura multi-agente.',
        '🎯 Logística y Cadena de Suministro: para conectar de forma directa la distribución, el transporte y la operatoria real de la industria.',
      ],
    },
    {
      id: 'cierre',
      heading: 'Transparencia y Trabajo',
      paragraphs: [
        'No venimos a improvisar ni a buscar validación apresurada: venimos a desplegar una propuesta sólida, transparente y construida sobre el trabajo realizado.',
        'Las puertas están abiertas para conversar.',
      ],
    },
  ],
  closing: 'Glass World Studio. Una plataforma con alma de taller, que se fortalece con tu crecimiento.',
  farewell: 'Un saludo cordial,',
};

export const alianzas: Announcement = {
  slug: 'alianzas-estrategicas',
  eyebrow: 'Comunicado Oficial · Glass World Studio',
  title: 'Convocatoria abierta de Alianzas Estratégicas',
  publishedAt: '2026-10-15',
  effective: 'Fecha de publicación: 15 de octubre de 2026',
  author: {
    name: 'Eduardo Esper',
    role: 'Fundador · Glass World Studio',
    contact: 'esper.eduardo@gmail.com',
  },
  lead: [
    'Hola a todos, soy Eduardo Esper.',
    'Regresamos a la plataforma con objetivos perfectamente definidos y una decisión estratégica firme: basados en los análisis de mercado, factibilidad técnica y la enorme demanda validada por la propia comunidad, no lanzaremos Glass World Studio por etapas. Salimos al mercado de una sola vez y a escala global.',
    'Sabemos con absoluta certeza la magnitud del proyecto que tenemos entre manos y la oportunidad histórica que representa. Estamos frente a la construcción del próximo unicornio vertical de la industria: la primera arquitectura digital capaz de unificar, digitalizar y potenciar el universo del vidrio en un solo ecosistema integrado.',
    'En el marco de esta expansión, no salimos a pedir ni a buscar; abrimos la convocatoria para consolidar Alianzas Estratégicas clave en tres ejes fundamentales:',
  ],
  sections: [
    {
      id: 'inversores',
      heading: 'Inversores y Capital de Escala (Venture Capital & Strategic Angels)',
      paragraphs: [
        'Perfil: fondos de inversión, inversores ángel y grupos corporativos orientados a Marketplaces B2B, tecnología industrial, sostenibilidad y cadenas de suministro globales.',
        'Objetivo: acompañar el despliegue de infraestructura, la aceleración comercial y el posicionamiento de marca a nivel internacional.',
      ],
    },
    {
      id: 'desarrolladores',
      heading: 'Arquitectos y Creadores de Software (Desarrollo Multi-Agente e IA)',
      paragraphs: [
        'Perfil: desarrolladores Full-Stack, ingenieros senior, especialistas en arquitectura distribuida, entornos MCP y enjambres multi-agente.',
        'Objetivo: sumarse al núcleo técnico responsable de motorizar los 5 Satélites de ingeniería, predicción y gestión en tiempo real.',
      ],
    },
    {
      id: 'logistica',
      heading: 'Logística y Cadena de Suministro Internacional',
      paragraphs: [
        'Perfil: operadores logísticos globales y regionales, empresas de transporte especializado en cargas frágiles/pesadas, y distribuidores de insumos e infraestructura industrial.',
        'Objetivo: integrar la red operativa real que conectará la oferta, la demanda y el traslado de insumos a escala global.',
      ],
    },
    {
      id: 'cierre',
      heading: 'Las puertas están abiertas',
      paragraphs: [
        'Sabemos que este es el sueño de muchos: ver finalmente a la comunidad, la industria y la tecnología del vidrio unidas en una plataforma viva con alma de taller.',
        'Para aquellos aventureros y visionarios que entiendan la escala de lo que estamos materializando, las puertas están abiertas.',
      ],
    },
  ],
  closing: 'Glass World Studio. Una plataforma con alma de taller, que se fortalece con tu crecimiento.',
  farewell: 'Un saludo cordial,',
};

export const modeloDeAlianza: Announcement = {
  slug: 'modelo-de-alianza',
  eyebrow: 'Comunicado Oficial · Glass World Studio',
  title: 'Qué necesitamos y cómo funciona nuestra alianza estratégica',
  publishedAt: '2026-10-15',
  effective: 'Fecha de publicación: 15 de octubre de 2026',
  author: {
    name: 'Eduardo Esper',
    role: 'Fundador · Glass World Studio',
    contact: 'esper.eduardo@gmail.com',
  },
  lead: [
    'Hola a todos, soy Eduardo Esper.',
    'Ante el entusiasmo y el interés generado por la reaparición de Glass World Studio, quiero ser 100% concreto y transparente sobre cuál es mi objetivo y qué necesitamos exactamente para materializar esta plataforma histórica.',
    'Glass World Studio no busca donaciones, financiamiento pasivo ni validaciones a medias. Proponemos alianzas estratégicas genuinas donde cada actor cumple un rol vital en la materialización del proyecto:',
  ],
  sections: [
    {
      id: 'desarrolladores',
      heading: 'Para los Desarrolladores y Arquitectos de Software',
      bullets: [
        'Lo que necesitamos: tu talento, conocimiento y capacidad técnica para desarrollar e integrar íntegramente la plataforma, los 5 Satélites predictivos y la arquitectura multi-agente.',
        'La propuesta: formar parte del equipo fundador del núcleo tecnológico de la plataforma vertical más grande de la industria del vidrio.',
      ],
      paragraphs: [],
    },
    {
      id: 'inversores',
      heading: 'Para los Inversores y Capital de Riesgo',
      bullets: [
        'Lo que necesitamos: tu capacidad financiera para financiar directamente el desarrollo técnico. No buscamos que nos transfieras fondos a ciegas; buscamos inversores que respalden y liquiden el trabajo de los desarrolladores para construir la infraestructura física y digital.',
        'La propuesta: participación estratégica y equity en un modelo de negocio B2B de alcance global con mercado cautivo.',
      ],
      paragraphs: [],
    },
    {
      id: 'logistica',
      heading: 'Para las Empresas de Logística y Cadena de Suministro',
      bullets: [
        'Lo que necesitamos: tu infraestructura y capacidad operativa para el transporte de insumos, materiales y maquinaria.',
        'La propuesta: una vez conformada la plataforma y con la adhesión activa de comercios, maestros e industrias, la red logística será la encargada exclusiva de mover los paquetes, insumos y cargas a nivel global.',
      ],
      paragraphs: [],
    },
    {
      id: 'modelo',
      heading: 'El modelo, en una frase',
      paragraphs: [
        'El modelo es claro: los desarrolladores construyen, los inversores financian ese desarrollo y la logística mueve la industria. Nadie reemplaza a nadie; las tres piezas se potencian mutuamente.',
        'Estamos construyendo una solución definitiva para un sector milenario.',
      ],
    },
  ],
  closing: 'Glass World Studio. Una plataforma con alma de taller, que se fortalece con tu crecimiento.',
  farewell: 'Un saludo cordial,',
};

// La trilogía comunicacional, en su orden de lectura: reaparición, alianzas y modelo de alianza.
export const announcements: Announcement[] = [reaparicion, alianzas, modeloDeAlianza];

export function getAnnouncement(slug: string): Announcement | undefined {
  return announcements.find((item) => item.slug === slug);
}
