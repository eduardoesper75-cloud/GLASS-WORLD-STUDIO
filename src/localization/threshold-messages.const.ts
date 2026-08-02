/**
 * GWS · Threshold Messages — Bloque multilingüe oficial del umbral
 * ------------------------------------------------------------
 * Texto CANÓNICO dictado por Jorge en la Orden Maestra §4, para la
 * interfaz de bienvenida e inicio de sesión. 7 idiomas: en, es, fr,
 * de, it, pt, zh. Este archivo es la única fuente; la Portada lo
 * consume por GET /threshold/message?lang=… (el lang lo resuelve el
 * geo de LocalizationService).
 *
 * Los precios mencionados ($15/$25/$40, hasta −20% anual) deben
 * mantenerse sincronizados con el tarifario de subscription_plans.
 */

export interface ThresholdMessage {
  /** Código de idioma (ISO 639-1). */
  code: string;
  /** Nombre del idioma en su propia lengua. */
  label: string;
  /** Título corto del bloque (primera frase oficial). */
  title: string;
  /** Texto completo del bloque, verbatim de la Orden Maestra §4. */
  text: string;
}

export const DEFAULT_THRESHOLD_LANG = 'es';

export const THRESHOLD_MESSAGES: readonly ThresholdMessage[] = [
  {
    code: 'en',
    label: 'English',
    title: 'Glass World Studio: The Universal Ecosystem of Glass.',
    text:
      'Glass World Studio: The Universal Ecosystem of Glass. Secure your foundational access now. ' +
      'After the free quotas are exhausted, Galaxie 3 is $15/mo, Galaxies 1, 2, 4, and 6 are $25/mo, ' +
      'and Heavy Industry (Galaxie 5) is $40/mo. Enjoy up to 20% off on annual plans.',
  },
  {
    code: 'es',
    label: 'Español',
    title: 'Glass World Studio: El Ecosistema Universal del Vidrio.',
    text:
      'Glass World Studio: El Ecosistema Universal del Vidrio. Asegura tu acceso fundacional ahora. ' +
      'Al agotarse los cupos gratuitos, la Galaxia 3 cuesta $15/mes; las Galaxias 1, 2, 4 y 6, $25/mes; ' +
      'y la Industria Pesada (Galaxia 5), $40/mes. Aprovecha hasta un 20% de descuento en planes anuales.',
  },
  {
    code: 'fr',
    label: 'Français',
    title: "Glass World Studio : L'écosystème universel du verre.",
    text:
      "Glass World Studio : L'écosystème universel du verre. Sécurisez votre accès fondateur dès maintenant. " +
      "Après épuisement des quotas gratuits, la Galaxie 3 est à 15 $/mois, les Galaxies 1, 2, 4 et 6 à 25 $/mois, " +
      "et l'Industrie Lourde (Galaxie 5) à 40 $/mois. Profitez de jusqu'à 20 % de réduction sur les abonnements annuels.",
  },
  {
    code: 'de',
    label: 'Deutsch',
    title: 'Glass World Studio: Das universelle Glas-Ökosystem.',
    text:
      'Glass World Studio: Das universelle Glas-Ökosystem. Sichern Sie sich jetzt Ihren Gründerzugang. ' +
      'Nach Aufbrauchen der Freikontingente kostet Galaxie 3 15 $/Monat, die Galaxien 1, 2, 4 und 6 kosten 25 $/Monat ' +
      'und die Schwerindustrie (Galaxie 5) 40 $/Monat. Profitieren Sie von bis zu 20 % Rabatt bei Jahresabos.',
  },
  {
    code: 'it',
    label: 'Italiano',
    title: "Glass World Studio: L'ecosistema universale del vetro.",
    text:
      "Glass World Studio: L'ecosistema universale del vetro. Assicura ora il tuo accesso fondativo. " +
      "Esaurite le quote gratuite, la Galassia 3 costa 15 $/mese, le Galassie 1, 2, 4 e 6 costano 25 $/mese " +
      "e l'Industria Pesata (Galassia 5) costa 40 $/mese. Approfitta di uno sconto fino al 20% sui piani annuali.",
  },
  {
    code: 'pt',
    label: 'Português',
    title: 'Glass World Studio: O Ecossistema Universal do Vidro.',
    text:
      'Glass World Studio: O Ecossistema Universal do Vidro. Garanta seu acesso fundador agora. ' +
      'Após o esgotamento das cotas gratuitas, a Galáxia 3 custa $15/mês; as Galáxias 1, 2, 4 e 6 custam $25/mês; ' +
      'e a Indústria Pesada (Galáxia 5) custa $40/mês. Aproveite até 20% de desconto nos planos anuais.',
  },
  {
    code: 'zh',
    label: '中文',
    title: 'Glass World Studio：玻璃 universal 生态系统。',
    text:
      'Glass World Studio：玻璃 universal 生态系统。 立即锁定您的创始访问权限。免费名额用完后，' +
      '第 3 星系为每月 15 美元，第 1、2、4、6 星系为每月 25 美元，重工业（第 5 星系）为每月 40 美元。' +
      '年度订阅最高可享 20% 的优惠。',
  },
];

export function getThresholdMessage(lang: string): ThresholdMessage {
  const found = THRESHOLD_MESSAGES.find((m) => m.code === lang);
  return found ?? THRESHOLD_MESSAGES.find((m) => m.code === DEFAULT_THRESHOLD_LANG)!;
}
