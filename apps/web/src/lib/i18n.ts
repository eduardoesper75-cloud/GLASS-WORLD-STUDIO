export const LANGUAGES = [
  { code: 'es', name: 'Español', flags: ['🇦🇷', '🇪🇸'] },
  { code: 'en', name: 'English', flags: ['🇺🇸', '🇬🇧'] },
  { code: 'fr', name: 'Français', flags: ['🇫🇷'] },
  { code: 'it', name: 'Italiano', flags: ['🇮🇹'] },
  { code: 'pt', name: 'Português', flags: ['🇧🇷'] },
  { code: 'de', name: 'Deutsch', flags: ['🇩🇪'] },
  { code: 'zh', name: '中文', flags: ['🇨🇳'] },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

const messages = {
  es: {
    artwork: 'Arte del vidrio',
    selectLanguage: 'Seleccionar idioma',
    tagline: 'Plataforma con alma de taller, que se fortalece con tu crecimiento',
    continue: 'Toca para continuar',
    continueLabel: 'Toca para continuar al Umbral de acceso al Taller de Cristal',
    threshold: 'Umbral de acceso',
    welcome: 'Bienvenido al Taller.',
    subtitle: 'Tu acceso abre la puerta al ecosistema de Glass World Studio.',
    name: 'Nombre completo',
    email: 'Correo electrónico',
    password: 'Contraseña',
    submit: 'Registrarse / acceder al taller',
    pending:
      'La autenticación todavía no está conectada. Tus datos no se han enviado ni guardado.',
    back: 'Volver a la portada',
  },
  en: {
    artwork: 'Glass Art',
    selectLanguage: 'Select language',
    tagline: 'A platform with the soul of a workshop, growing stronger with you.',
    continue: 'Touch to continue',
    continueLabel: 'Touch to continue to the Glass Workshop Access Threshold',
    threshold: 'Access Threshold',
    welcome: 'Welcome to the Workshop.',
    subtitle: 'Your access opens the door to the Glass World Studio ecosystem.',
    name: 'Full name',
    email: 'Email address',
    password: 'Password',
    submit: 'Register / enter the workshop',
    pending: 'Authentication is not connected yet. Your information has not been sent or saved.',
    back: 'Return to the welcome page',
  },
  fr: {
    artwork: 'Art du verre',
    selectLanguage: 'Choisir la langue',
    tagline: "Une plateforme avec l'âme d'un atelier, qui grandit avec vous.",
    continue: 'Touchez pour continuer',
    continueLabel: "Touchez pour accéder au seuil de l'Atelier de Cristal",
    threshold: "Seuil d'accès",
    welcome: "Bienvenue à l'Atelier.",
    subtitle: "Votre accès ouvre la porte à l'écosystème Glass World Studio.",
    name: 'Nom complet',
    email: 'Adresse e-mail',
    password: 'Mot de passe',
    submit: "S'inscrire / accéder à l'atelier",
    pending:
      "L'authentification n'est pas encore connectée. Vos informations n'ont pas été envoyées ni enregistrées.",
    back: "Retour à la page d'accueil",
  },
  it: {
    artwork: 'Arte del vetro',
    selectLanguage: 'Seleziona la lingua',
    tagline: "Una piattaforma con l'anima di un laboratorio, che cresce con te.",
    continue: 'Tocca per continuare',
    continueLabel: "Tocca per accedere alla soglia dell'Officina del Vetro",
    threshold: 'Soglia di accesso',
    welcome: "Benvenuto nell'Officina.",
    subtitle: "Il tuo accesso apre le porte all'ecosistema Glass World Studio.",
    name: 'Nome completo',
    email: 'Indirizzo e-mail',
    password: 'Password',
    submit: "Registrati / accedi all'officina",
    pending:
      "L'autenticazione non è ancora collegata. I tuoi dati non sono stati inviati né salvati.",
    back: 'Torna alla pagina iniziale',
  },
  pt: {
    artwork: 'Arte em vidro',
    selectLanguage: 'Selecionar idioma',
    tagline: 'Uma plataforma com alma de oficina, que cresce junto com você.',
    continue: 'Toque para continuar',
    continueLabel: 'Toque para acessar o Limiar da Oficina de Cristal',
    threshold: 'Limiar de acesso',
    welcome: 'Bem-vindo à Oficina.',
    subtitle: 'Seu acesso abre a porta para o ecossistema Glass World Studio.',
    name: 'Nome completo',
    email: 'Endereço de e-mail',
    password: 'Senha',
    submit: 'Cadastrar-se / acessar a oficina',
    pending:
      'A autenticação ainda não está conectada. Seus dados não foram enviados nem salvos.',
    back: 'Voltar à página inicial',
  },
  de: {
    artwork: 'Glaskunst',
    selectLanguage: 'Sprache auswählen',
    tagline: 'Eine Plattform mit Werkstattseele, die mit Ihnen wächst.',
    continue: 'Zum Fortfahren tippen',
    continueLabel: 'Zum Zugang zur Glaswerkstatt tippen',
    threshold: 'Zugangsschwelle',
    welcome: 'Willkommen in der Werkstatt.',
    subtitle: 'Ihr Zugang öffnet die Tür zum Glass World Studio Ökosystem.',
    name: 'Vollständiger Name',
    email: 'E-Mail-Adresse',
    password: 'Passwort',
    submit: 'Registrieren / Werkstatt betreten',
    pending:
      'Die Authentifizierung ist noch nicht verbunden. Ihre Daten wurden weder gesendet noch gespeichert.',
    back: 'Zurück zur Startseite',
  },
  zh: {
    artwork: '玻璃艺术',
    selectLanguage: '选择语言',
    tagline: '一个拥有工坊灵魂、与你共同成长的平台。',
    continue: '轻触以继续',
    continueLabel: '轻触进入玻璃工坊入口',
    threshold: '访问入口',
    welcome: '欢迎来到工坊。',
    subtitle: '登录后即可进入 Glass World Studio 生态系统。',
    name: '姓名',
    email: '电子邮箱',
    password: '密码',
    submit: '注册 / 进入工坊',
    pending: '身份验证尚未接入。您的信息尚未发送或保存。',
    back: '返回欢迎页',
  },
} satisfies Record<LanguageCode, Record<string, string>>;

export type MessageKey = keyof (typeof messages)['es'];

export function getMessage(language: LanguageCode, key: MessageKey): string {
  return messages[language][key];
}

export function isLanguageCode(value: string): value is LanguageCode {
  return LANGUAGES.some((language) => language.code === value);
}
