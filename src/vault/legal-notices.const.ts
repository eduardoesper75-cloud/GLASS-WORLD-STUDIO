import { LEGAL_TERMS_VERSION } from './vault.const';

/**
 * GWS · LegalNotices — Cláusulas safe-harbor de la Bóveda (es + en)
 * ------------------------------------------------------------------
 * La Bóveda es un repositorio de HOSTING NEUTRAL (decidido en la
 * investigación legal de la Orden Suprema):
 *
 *   · GWS NO redacta ni verifica los documentos; solo aloja, organiza y
 *     divulga contenido subido por la comunidad.
 *   · Safe-harbor de hosting: DMCA §512(c) (EE. UU.) y Directiva UE
 *     2000/31, art. 14. En Argentina, Ley 11.723 (propiedad intelectual)
 *     — el encuadre aplicable se confirma con el estudio legal antes del
 *     lanzamiento; estas cláusulas son la base funcional.
 *   · GWS NO certifica exactitud técnica: el contenido es de autoría del
 *     usuario y las decisiones de uso (hornos, temperaturas, seguridad)
 *     son responsabilidad de quien las aplica.
 *   · Obligaciones del autor: garantía de titularidad, indemnización,
 *     aceptación del takedown.
 *
 * Cada upload exige acceptedTermsVersion = LEGAL_TERMS_VERSION. Ver
 * vault.service.validateLegalAcceptance().
 */
export interface LegalNoticeBlock {
  id: string;
  heading: string;
  body: string;
}

export interface LegalNoticesBundle {
  version: string;
  effective: string;
  language: 'es' | 'en';
  blocks: LegalNoticeBlock[];
}

const ES_BLOCKS: LegalNoticeBlock[] = [
  {
    id: 'hosting-only',
    heading: 'Glass World Studio es un proveedor de alojamiento neutral',
    body: 'La Bóveda del Conocimiento solo aloja, organiza y divulga documentos técnicos que los usuarios suben voluntariamente. GWS no redacta, revisa, edita ni certifica el contenido técnico de los documentos publicados. En ningún caso GWS asume la responsabilidad editorial por el contenido de terceros.',
  },
  {
    id: 'ownership-guarantee',
    heading: 'Garantía de titularidad del autor',
    body: 'Quien sube un documento declara bajo su responsabilidad que es el titular legítimo del contenido o que cuenta con autorización expresa del titular para publicarlo, y que no infringe derechos de propiedad intelectual, patentes, marcas, secretos industriales o datos técnicos protegidos de terceros.',
  },
  {
    id: 'indemnification',
    heading: 'Indemnización',
    body: 'El autor se obliga a mantener indemne a Glass World Studio frente a cualquier reclamo de terceros derivado del contenido que suba, incluyendo costos y honorarios legales razonables, sin perjuicio de la remoción inmediata del contenido según el procedimiento de takedown.',
  },
  {
    id: 'takedown',
    heading: 'Retiro de contenido (takedown)',
    body: 'GWS removerá o deshabilitará el acceso a cualquier documento ante una notificación válida de infracción (DMCA §512(c) / Directiva UE 2000/31 art. 14), y aplicará la política de reincidentes correspondiente. Los autores pueden apelar conforme al contranotificación aplicable.',
  },
  {
    id: 'technical-disclaimer',
    heading: 'Exención de exactitud y seguridad',
    body: 'Los documentos se ofrecen "tal cual" (as is). GWS no certifica exactitud técnica, valores de COE, curvas de recocido, temperaturas de fusión ni la seguridad de ningún horno, quemador o instalación. Toda aplicación de estos datos es responsabilidad exclusiva de quien la realice, bajo las normas de seguridad aplicables.',
  },
];

const EN_BLOCKS: LegalNoticeBlock[] = [
  {
    id: 'hosting-only',
    heading: 'Glass World Studio is a neutral hosting provider',
    body: 'The Knowledge Vault merely hosts, organizes and discloses technical documents voluntarily uploaded by users. GWS does not draft, review, edit or certify the technical content of published documents. In no case does GWS assume editorial responsibility for third-party content.',
  },
  {
    id: 'ownership-guarantee',
    heading: 'Author ownership guarantee',
    body: 'By uploading a document, the uploader warrants that they are the legitimate owner of the content or hold the express authorization of its owner to publish it, and that it does not infringe third-party intellectual property rights, patents, trademarks, trade secrets or protected technical data.',
  },
  {
    id: 'indemnification',
    heading: 'Indemnification',
    body: 'The author agrees to hold Glass World Studio harmless against any third-party claim arising from uploaded content, including reasonable costs and legal fees, without prejudice to the immediate removal of content under the takedown procedure.',
  },
  {
    id: 'takedown',
    heading: 'Content removal (takedown)',
    body: 'GWS will remove or disable access to any document upon a valid infringement notice (DMCA §512(c) / EU Directive 2000/31 art. 14), and will apply the corresponding repeat-infringer policy. Authors may appeal under the applicable counter-notice.',
  },
  {
    id: 'technical-disclaimer',
    heading: 'Accuracy and safety disclaimer',
    body: 'Documents are provided "as is". GWS does not certify technical accuracy, COE values, annealing schedules, firing temperatures or the safety of any kiln, burner or installation. Any application of this data is the sole responsibility of the person applying it, under applicable safety standards.',
  },
];

export const LEGAL_NOTICES: Record<'es' | 'en', LegalNoticesBundle> = {
  es: {
    version: LEGAL_TERMS_VERSION,
    effective: '2026-08-02',
    language: 'es',
    blocks: ES_BLOCKS,
  },
  en: {
    version: LEGAL_TERMS_VERSION,
    effective: '2026-08-02',
    language: 'en',
    blocks: EN_BLOCKS,
  },
};
