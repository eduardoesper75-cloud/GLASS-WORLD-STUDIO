/**
 * GWS · Mensajes i18n (7 locales). Interfaz tipada + diccionarios.
 * El switch de idioma NO recarga la página: LocaleProvider cambia el
 * locale y next-intl re-renderiza el árbol en vivo.
 */

export type Locale = 'es' | 'en' | 'fr' | 'de' | 'it' | 'pt' | 'zh';

export const LOCALES: Locale[] = ['es', 'en', 'fr', 'de', 'it', 'pt', 'zh'];
export const DEFAULT_LOCALE: Locale = 'es';

export interface Messages {
  nav: {
    brand: string;
    home: string;
    plans: string;
    marketplace: string;
    dashboard: string;
    satellites: string;
    intro: string;
    login: string;
    register: string;
    logout: string;
    admin: string;
  };
  common: {
    loading: string;
    error: string;
    retry: string;
    back: string;
    continue: string;
    cancel: string;
    confirm: string;
    save: string;
    close: string;
    search: string;
    next: string;
    previous: string;
    page: string;
    all: string;
    network: string;
    unauthorized: string;
    unknownError: string;
    comingSoon: string;
  };
  intro: {
    title: string;
    subtitle: string;
    enter: string;
    skip: string;
  };
  umbral: {
    title: string;
    lead: string;
    ctaRegister: string;
    ctaLogin: string;
    notice: string;
  };
  auth: {
    fullName: string;
    fullNamePh: string;
    email: string;
    username: string;
    password: string;
    identifier: string;
    identifierPh: string;
    privacy: string;
    privacyAgree: string;
    submitRegister: string;
    submitLogin: string;
    haveAccount: string;
    noAccount: string;
    registerSuccess: string;
    loginSuccess: string;
    logoutConfirm: string;
    invalidCredentials: string;
    usernameTaken: string;
  };
  carta: {
    fullsRequired: string;
    emailInvalid: string;
    usernameMin: string;
    usernameChars: string;
    passwordMin: string;
    passwordRequired: string;
    identifierRequired: string;
    privacyRequired: string;
    rangeInvalid: string;
  };
  home: {
    hero: string;
    heroSub: string;
    galaxiesTitle: string;
    galaxiesSub: string;
    viewGalaxy: string;
    satellitesTitle: string;
    satellitesSub: string;
    tagline: string;
  };
  plans: {
    title: string;
    sub: string;
    perMonth: string;
    perPeriod: string;
    months: string;
    monthsShort: string;
    discount: string;
    total: string;
    choose: string;
    loyaltyNote: string;
    signUp: string;
    membershipNote: string;
    subscriberUnavailable: string;
    enrollCta: string;
  };
  marketplace: {
    title: string;
    sub: string;
    searchPh: string;
    filters: string;
    category: string;
    clearFilters: string;
    openProduct: string;
    addToCart: string;
    cartCount: string;
    goCheckout: string;
    price: string;
    unit: string;
    moq: string;
    msds: string;
    specs: string;
    noResults: string;
    loadingCatalog: string;
    country: string;
    tier_insumos: string;
    tier_tools: string;
    tier_services: string;
    tier_obras: string;
    unit_kg: string;
    unit_ton: string;
    unit_m: string;
    unit_unit: string;
    unit_l: string;
  };
  orders: {
    title: string;
    detail: string;
    empty: string;
    emptyCta: string;
    items: string;
    status: string;
    subtotal: string;
    shipping: string;
    tax: string;
    total: string;
    qty: string;
    unit: string;
    lineTotal: string;
    placedAt: string;
    cancel: string;
    viewOrder: string;
    notFound: string;
    address: string;
    fullName: string;
    line1: string;
    line2: string;
    city: string;
    region: string;
    postalCode: string;
    countryCode: string;
    phone: string;
    paymentMethod: string;
    payCard: string;
    payTrc20: string;
    payPolygon: string;
    submit: string;
    placing: string;
    orderPending: string;
    noOrders: string;
  };
  dashboard: {
    title: string;
    greeting: string;
    role: string;
    noSub: string;
    subscribe: string;
    yourSubs: string;
    active: string;
    until: string;
    expired: string;
    account: string;
  };
  satellites: {
    title: string;
    sub: string;
  };
  gate: {
    title: string;
    note: string;
    loginToContinue: string;
  };
  footer: {
    rights: string;
  };
}

export const MESSAGES: Record<Locale, Messages> = {
  es: {
    nav: { brand: 'Glass World Studio', home: 'Inicio', plans: 'Planes', marketplace: 'Marketplace', dashboard: 'Panel', satellites: 'Satélites', intro: 'Intro', login: 'Entrar', register: 'Crear cuenta', logout: 'Salir', admin: 'Admin' },
    common: { loading: 'Cargando…', error: 'Ocurrió un error', retry: 'Reintentar', back: 'Volver', continue: 'Continuar', cancel: 'Cancelar', confirm: 'Confirmar', save: 'Guardar', close: 'Cerrar', search: 'Buscar', next: 'Siguiente', previous: 'Anterior', page: 'Página', all: 'Todas', network: 'Sin conexión con el servidor', unauthorized: 'Sesión no iniciada o vencida', unknownError: 'Error inesperado', comingSoon: 'Próximamente' },
    intro: { title: 'Glass World Studio', subtitle: 'La casa del oficio, el dato y el fuego.', enter: 'Entrar', skip: 'Saltar' },
    umbral: { title: 'El Umbral', lead: 'Elegí tu galaxia y entrá a la casa. Todo el vidrio, el dato y el oficio en un solo lugar.', ctaRegister: 'Crear cuenta', ctaLogin: 'Ya tengo cuenta', notice: 'Al registrarte aceptás la nota de privacidad. Tus datos nunca se comparten con terceros.' },
    auth: { fullName: 'Nombre completo', fullNamePh: 'Eduardo Esper', email: 'Correo electrónico', username: 'Usuario', password: 'Contraseña', identifier: 'Usuario o correo', identifierPh: 'ej: esper.eduardo@gmail.com', privacy: 'Privacidad', privacyAgree: 'Acepto la nota de privacidad y el tratamiento de mis datos.', submitRegister: 'Crear cuenta', submitLogin: 'Entrar', haveAccount: '¿Ya tenés cuenta?', noAccount: '¿No tenés cuenta?', registerSuccess: 'Cuenta creada. ¡Bienvenido a la casa!', loginSuccess: 'Sesión iniciada.', logoutConfirm: '¿Cerrar la sesión?', invalidCredentials: 'Usuario o contraseña incorrectos', usernameTaken: 'Ese usuario o correo ya está registrado' },
    carta: { fullsRequired: 'Ingresá tu nombre completo (mín. 2 letras)', emailInvalid: 'Ingresá un correo válido', usernameMin: 'El usuario debe tener al menos 3 caracteres', usernameChars: 'Solo letras, números, punto, guion o guion bajo', passwordMin: 'La contraseña debe tener al menos 8 caracteres', passwordRequired: 'Ingresá tu contraseña', identifierRequired: 'Ingresá tu usuario o correo', privacyRequired: 'Debés aceptar la nota de privacidad para registrarte', rangeInvalid: 'El mínimo no puede superar al máximo' },
    home: { hero: 'La casa del oficio, el dato y el fuego.', heroSub: 'Seis galaxias, un único lenguaje: el vidrio. Explorá el catálogo, cotizá y creá tu lugar en la comunidad.', galaxiesTitle: 'Galaxias', galaxiesSub: 'Cada galaxia es un oficio con reglas propias.', viewGalaxy: 'Conocer galaxia', satellitesTitle: 'Satélites transversales', satellitesSub: 'Servicios que cruzan todas las galaxias.', tagline: 'Vidrio. Dato. Fuego.' },
    plans: { title: 'Planes de suscripción', sub: 'Elegí tu galaxia y tu período. La fidelización premia el largo plazo.', perMonth: 'por mes', perPeriod: 'por período', months: 'meses', monthsShort: 'mes', discount: 'descuento', total: 'Total', choose: 'Elegir', loyaltyNote: 'Descuentos por fidelización: 3 meses 10% · 6 meses 15% · 12 meses 20% sobre el total del período.', signUp: 'Suscribirme', membershipNote: 'La activación de la membresía la registra la Fundación al confirmar el pago.', subscriberUnavailable: 'La activación de suscripción aún no está disponible para cuentas nuevas.', enrollCta: 'Continuar al siguiente paso' },
    marketplace: { title: 'Marketplace · G2', sub: 'Insumos críticos, herramientas y maquinaria, servicios industriales y obra terminada de la comunidad.', searchPh: 'Buscar por nombre o descripción…', filters: 'Filtros', category: 'Categoría', clearFilters: 'Limpiar filtros', openProduct: 'Ver detalle', addToCart: 'Agregar al carrito', cartCount: 'Carrito', goCheckout: 'Ir a checkout', price: 'Precio', unit: 'Unidad', moq: 'MOQ', msds: 'MSDS', specs: 'Especificaciones', noResults: 'No hay resultados con esos filtros.', loadingCatalog: 'Cargando catálogo…', country: 'País', tier_insumos: 'Insumos críticos', tier_tools: 'Herramientas y maquinaria', tier_services: 'Servicios industriales', tier_obras: 'Obra terminada', unit_kg: 'kg', unit_ton: 'ton', unit_m: 'm lineal', unit_unit: 'unidad', unit_l: 'litro' },
    orders: { title: 'Mis órdenes', detail: 'Detalle de la orden', empty: 'Tu carrito está vacío.', emptyCta: 'Explorar el mercado', items: 'Artículos', status: 'Estado', subtotal: 'Subtotal', shipping: 'Envío', tax: 'Impuestos', total: 'Total', qty: 'Cantidad', unit: 'Unidad', lineTotal: 'Total de línea', placedAt: 'Creada el', cancel: 'Cancelar orden', viewOrder: 'Ver orden', notFound: 'Orden no encontrada', address: 'Dirección de envío', fullName: 'Nombre completo', line1: 'Calle y número', line2: 'Departamento / piso (opcional)', city: 'Ciudad', region: 'Provincia / estado (opcional)', postalCode: 'Código postal', countryCode: 'País (ISO 3166, ej: AR)', phone: 'Teléfono (opcional)', paymentMethod: 'Método de pago', payCard: 'Tarjeta (USD)', payTrc20: 'USDT · red TRC-20', payPolygon: 'USDT · red Polygon', submit: 'Crear orden', placing: 'Creando orden…', orderPending: 'Orden creada. El pago queda pendiente de confirmación.', noOrders: 'Todavía no tenés órdenes.' },
    dashboard: { title: 'Panel', greeting: 'Hola,', role: 'Rol', noSub: 'Todavía no tenés membresías activas.', subscribe: 'Ver planes', yourSubs: 'Tus membresías', active: 'Activa', until: 'hasta', expired: 'Vencida', account: 'Cuenta' },
    satellites: { title: 'Satélites', sub: 'Licitaciones, alertas, investigación, soporte y comunidad — servicios que cruzan todas las galaxias.' },
    gate: { title: 'Área restringida', note: 'Esta sección requiere una membresía activa. Si todavía no registrás tu pago, la activación queda en espera.', loginToContinue: 'Iniciar sesión para continuar' },
    footer: { rights: 'Todos los derechos reservados.' },
  },
  en: {
    nav: { brand: 'Glass World Studio', home: 'Home', plans: 'Plans', marketplace: 'Marketplace', dashboard: 'Dashboard', satellites: 'Satellites', intro: 'Intro', login: 'Sign in', register: 'Create account', logout: 'Log out', admin: 'Admin' },
    common: { loading: 'Loading…', error: 'Something went wrong', retry: 'Retry', back: 'Back', continue: 'Continue', cancel: 'Cancel', confirm: 'Confirm', save: 'Save', close: 'Close', search: 'Search', next: 'Next', previous: 'Previous', page: 'Page', all: 'All', network: 'No connection to the server', unauthorized: 'Session missing or expired', unknownError: 'Unexpected error', comingSoon: 'Coming soon' },
    intro: { title: 'Glass World Studio', subtitle: 'The home of the craft, the data and the fire.', enter: 'Enter', skip: 'Skip' },
    umbral: { title: 'The Threshold', lead: 'Pick your galaxy and step into the house. All the glass, the data and the craft in one place.', ctaRegister: 'Create account', ctaLogin: 'I have an account', notice: 'By registering you accept the privacy note. Your data is never shared with third parties.' },
    auth: { fullName: 'Full name', fullNamePh: 'Eduardo Esper', email: 'Email address', username: 'Username', password: 'Password', identifier: 'Username or email', identifierPh: 'e.g. esper.eduardo@gmail.com', privacy: 'Privacy', privacyAgree: 'I accept the privacy note and the processing of my data.', submitRegister: 'Create account', submitLogin: 'Sign in', haveAccount: 'Already have an account?', noAccount: "Don't have an account?", registerSuccess: 'Account created. Welcome to the house!', loginSuccess: 'Signed in.', logoutConfirm: 'Log out?', invalidCredentials: 'Wrong username or password', usernameTaken: 'That username or email is already taken' },
    carta: { fullsRequired: 'Enter your full name (min. 2 letters)', emailInvalid: 'Enter a valid email', usernameMin: 'Username must be at least 3 characters', usernameChars: 'Only letters, numbers, dot, dash or underscore', passwordMin: 'Password must be at least 8 characters', passwordRequired: 'Enter your password', identifierRequired: 'Enter your username or email', privacyRequired: 'You must accept the privacy note to register', rangeInvalid: 'Minimum cannot be greater than maximum' },
    home: { hero: 'The home of the craft, the data and the fire.', heroSub: 'Six galaxies, one language: glass. Explore the catalog, get quotes and build your place in the community.', galaxiesTitle: 'Galaxies', galaxiesSub: 'Each galaxy is a craft with its own rules.', viewGalaxy: 'Explore galaxy', satellitesTitle: 'Cross-cutting satellites', satellitesSub: 'Services that cross every galaxy.', tagline: 'Glass. Data. Fire.' },
    plans: { title: 'Subscription plans', sub: 'Choose your galaxy and period. Loyalty rewards the long term.', perMonth: 'per month', perPeriod: 'per period', months: 'months', monthsShort: 'month', discount: 'discount', total: 'Total', choose: 'Choose', loyaltyNote: 'Loyalty discounts: 3 months 10% · 6 months 15% · 12 months 20% on the period total.', signUp: 'Subscribe', membershipNote: 'Membership activation is recorded by the Foundation once payment is confirmed.', subscriberUnavailable: 'Subscription activation is not yet available for new accounts.', enrollCta: 'Continue to next step' },
    marketplace: { title: 'Marketplace · G2', sub: 'Critical inputs, tools and machinery, industrial services and finished work from the community.', searchPh: 'Search by name or description…', filters: 'Filters', category: 'Category', clearFilters: 'Clear filters', openProduct: 'View details', addToCart: 'Add to cart', cartCount: 'Cart', goCheckout: 'Go to checkout', price: 'Price', unit: 'Unit', moq: 'MOQ', msds: 'MSDS', specs: 'Specifications', noResults: 'No results for those filters.', loadingCatalog: 'Loading catalog…', country: 'Country', tier_insumos: 'Critical inputs', tier_tools: 'Tools & machinery', tier_services: 'Industrial services', tier_obras: 'Finished work', unit_kg: 'kg', unit_ton: 'ton', unit_m: 'linear m', unit_unit: 'unit', unit_l: 'litre' },
    orders: { title: 'My orders', detail: 'Order details', empty: 'Your cart is empty.', emptyCta: 'Explore the market', items: 'Items', status: 'Status', subtotal: 'Subtotal', shipping: 'Shipping', tax: 'Tax', total: 'Total', qty: 'Qty', unit: 'Unit', lineTotal: 'Line total', placedAt: 'Placed on', cancel: 'Cancel order', viewOrder: 'View order', notFound: 'Order not found', address: 'Shipping address', fullName: 'Full name', line1: 'Street and number', line2: 'Apartment / floor (optional)', city: 'City', region: 'State / province (optional)', postalCode: 'Postal code', countryCode: 'Country (ISO 3166, e.g. AR)', phone: 'Phone (optional)', paymentMethod: 'Payment method', payCard: 'Card (USD)', payTrc20: 'USDT · TRC-20 network', payPolygon: 'USDT · Polygon network', submit: 'Create order', placing: 'Creating order…', orderPending: 'Order created. Payment is pending confirmation.', noOrders: 'You have no orders yet.' },
    dashboard: { title: 'Dashboard', greeting: 'Hello,', role: 'Role', noSub: 'You have no active memberships yet.', subscribe: 'See plans', yourSubs: 'Your memberships', active: 'Active', until: 'until', expired: 'Expired', account: 'Account' },
    satellites: { title: 'Satellites', sub: 'Tenders, alerts, research, support and community — services crossing every galaxy.' },
    gate: { title: 'Restricted area', note: 'This section requires an active membership. If you have not recorded your payment yet, activation stays on hold.', loginToContinue: 'Sign in to continue' },
    footer: { rights: 'All rights reserved.' },
  },
  fr: {
    nav: { brand: 'Glass World Studio', home: 'Accueil', plans: 'Formules', marketplace: 'Marketplace', dashboard: 'Tableau', satellites: 'Satellites', intro: 'Intro', login: 'Connexion', register: 'Créer un compte', logout: 'Déconnexion', admin: 'Admin' },
    common: { loading: 'Chargement…', error: 'Une erreur est survenue', retry: 'Réessayer', back: 'Retour', continue: 'Continuer', cancel: 'Annuler', confirm: 'Confirmer', save: 'Enregistrer', close: 'Fermer', search: 'Rechercher', next: 'Suivant', previous: 'Précédent', page: 'Page', all: 'Toutes', network: 'Connexion au serveur impossible', unauthorized: 'Session absente ou expirée', unknownError: 'Erreur inattendue', comingSoon: 'Bientôt disponible' },
    intro: { title: 'Glass World Studio', subtitle: "La maison du métier, de la donnée et du feu.", enter: 'Entrer', skip: 'Passer' },
    umbral: { title: 'Le Seuil', lead: "Choisissez votre galaxie et entrez dans la maison. Tout le verre, la donnée et le métier au même endroit.", ctaRegister: 'Créer un compte', ctaLogin: 'J’ai déjà un compte', notice: "En vous inscrivant, vous acceptez la note de confidentialité. Vos données ne sont jamais partagées avec des tiers." },
    auth: { fullName: 'Nom complet', fullNamePh: 'Eduardo Esper', email: 'Adresse e-mail', username: 'Nom d’utilisateur', password: 'Mot de passe', identifier: 'Identifiant ou e-mail', identifierPh: 'ex : esper.eduardo@gmail.com', privacy: 'Confidentialité', privacyAgree: "J'accepte la note de confidentialité et le traitement de mes données.", submitRegister: 'Créer un compte', submitLogin: 'Se connecter', haveAccount: 'Vous avez déjà un compte ?', noAccount: 'Pas encore de compte ?', registerSuccess: 'Compte créé. Bienvenue dans la maison !', loginSuccess: 'Connecté.', logoutConfirm: 'Se déconnecter ?', invalidCredentials: 'Identifiant ou mot de passe incorrect', usernameTaken: 'Cet identifiant ou e-mail est déjà pris' },
    carta: { fullsRequired: 'Saisissez votre nom complet (min. 2 lettres)', emailInvalid: 'Saisissez un e-mail valide', usernameMin: "Le nom d'utilisateur fait au moins 3 caractères", usernameChars: 'Lettres, chiffres, point, tiret ou tiret bas uniquement', passwordMin: 'Le mot de passe fait au moins 8 caractères', passwordRequired: 'Saisissez votre mot de passe', identifierRequired: "Saisissez votre identifiant ou e-mail", privacyRequired: 'Vous devez accepter la note de confidentialité', rangeInvalid: 'Le minimum ne peut pas dépasser le maximum' },
    home: { hero: 'La maison du métier, de la donnée et du feu.', heroSub: 'Six galaxies, un seul langage : le verre. Explorez le catalogue, demandez un devis et construisez votre place.', galaxiesTitle: 'Galaxies', galaxiesSub: 'Chaque galaxie est un métier avec ses propres règles.', viewGalaxy: 'Découvrir la galaxie', satellitesTitle: 'Satellites transversaux', satellitesSub: 'Des services qui traversent toutes les galaxies.', tagline: 'Verre. Donnée. Feu.' },
    plans: { title: 'Formules d’abonnement', sub: 'Choisissez votre galaxie et votre période. La fidélité récompense le long terme.', perMonth: 'par mois', perPeriod: 'par période', months: 'mois', monthsShort: 'mois', discount: 'réduction', total: 'Total', choose: 'Choisir', loyaltyNote: 'Remises de fidélité : 3 mois 10% · 6 mois 15% · 12 mois 20% sur le total.', signUp: 'S’abonner', membershipNote: "L'activation de la adhésion est enregistrée par la Fondation après confirmation du paiement.", subscriberUnavailable: "L'activation de l'abonnement n'est pas encore disponible pour les nouveaux comptes.", enrollCta: 'Continuer vers l’étape suivante' },
    marketplace: { title: 'Marketplace · G2', sub: 'Intrants critiques, outils et machines, services industriels et œuvres terminées de la communauté.', searchPh: 'Rechercher par nom ou description…', filters: 'Filtres', category: 'Catégorie', clearFilters: 'Effacer les filtres', openProduct: 'Voir le détail', addToCart: 'Ajouter au panier', cartCount: 'Panier', goCheckout: 'Passer au checkout', price: 'Prix', unit: 'Unité', moq: 'MOQ', msds: 'MSDS', specs: 'Spécifications', noResults: 'Aucun résultat pour ces filtres.', loadingCatalog: 'Chargement du catalogue…', country: 'Pays', tier_insumos: 'Intrants critiques', tier_tools: 'Outils & machines', tier_services: 'Services industriels', tier_obras: 'Œuvres terminées', unit_kg: 'kg', unit_ton: 'tonne', unit_m: 'm linéaire', unit_unit: 'unité', unit_l: 'litre' },
    orders: { title: 'Mes commandes', detail: 'Détail de la commande', empty: 'Votre panier est vide.', emptyCta: 'Explorer le marché', items: 'Articles', status: 'Statut', subtotal: 'Sous-total', shipping: 'Livraison', tax: 'Taxes', total: 'Total', qty: 'Qté', unit: 'Unité', lineTotal: 'Total ligne', placedAt: 'Créée le', cancel: 'Annuler la commande', viewOrder: 'Voir la commande', notFound: 'Commande introuvable', address: 'Adresse de livraison', fullName: 'Nom complet', line1: 'Rue et numéro', line2: 'Appartement / étage (facultatif)', city: 'Ville', region: 'Région (facultatif)', postalCode: 'Code postal', countryCode: 'Pays (ISO 3166, ex : AR)', phone: 'Téléphone (facultatif)', paymentMethod: 'Moyen de paiement', payCard: 'Carte (USD)', payTrc20: 'USDT · réseau TRC-20', payPolygon: 'USDT · réseau Polygon', submit: 'Créer la commande', placing: 'Création de la commande…', orderPending: 'Commande créée. Le paiement est en attente de confirmation.', noOrders: 'Vous n’avez aucune commande pour le moment.' },
    dashboard: { title: 'Tableau', greeting: 'Bonjour,', role: 'Rôle', noSub: 'Vous n’avez pas encore de adhésion active.', subscribe: 'Voir les formules', yourSubs: 'Vos adhésions', active: 'Active', until: 'jusqu’au', expired: 'Expirée', account: 'Compte' },
    satellites: { title: 'Satellites', sub: 'Appels d’offres, alertes, recherche, support et communauté — des services qui traversent toutes les galaxies.' },
    gate: { title: 'Zone restreinte', note: "Cette section nécessite une adhésion active. Si le paiement n’est pas encore enregistré, l’activation reste en attente.", loginToContinue: 'Se connecter pour continuer' },
    footer: { rights: 'Tous droits réservés.' },
  },
  de: {
    nav: { brand: 'Glass World Studio', home: 'Start', plans: 'Pläne', marketplace: 'Marktplatz', dashboard: 'Dashboard', satellites: 'Satelliten', intro: 'Intro', login: 'Anmelden', register: 'Konto erstellen', logout: 'Abmelden', admin: 'Admin' },
    common: { loading: 'Laden…', error: 'Ein Fehler ist aufgetreten', retry: 'Erneut versuchen', back: 'Zurück', continue: 'Weiter', cancel: 'Abbrechen', confirm: 'Bestätigen', save: 'Speichern', close: 'Schließen', search: 'Suchen', next: 'Weiter', previous: 'Zurück', page: 'Seite', all: 'Alle', network: 'Keine Verbindung zum Server', unauthorized: 'Sitzung fehlt oder abgelaufen', unknownError: 'Unerwarteter Fehler', comingSoon: 'Demnächst' },
    intro: { title: 'Glass World Studio', subtitle: 'Das Zuhause des Handwerks, der Daten und des Feuers.', enter: 'Eintreten', skip: 'Überspringen' },
    umbral: { title: 'Die Schwelle', lead: 'Wähle deine Galaxie und tritt ein. Alles Glas, alle Daten und das Handwerk an einem Ort.', ctaRegister: 'Konto erstellen', ctaLogin: 'Ich habe ein Konto', notice: 'Mit der Registrierung akzeptierst du die Datenschutznotiz. Deine Daten werden nie an Dritte weitergegeben.' },
    auth: { fullName: 'Vollständiger Name', fullNamePh: 'Eduardo Esper', email: 'E-Mail-Adresse', username: 'Benutzername', password: 'Passwort', identifier: 'Benutzername oder E-Mail', identifierPh: 'z.B. esper.eduardo@gmail.com', privacy: 'Datenschutz', privacyAgree: 'Ich akzeptiere die Datenschutznotiz und die Verarbeitung meiner Daten.', submitRegister: 'Konto erstellen', submitLogin: 'Anmelden', haveAccount: 'Schon ein Konto?', noAccount: 'Noch kein Konto?', registerSuccess: 'Konto erstellt. Willkommen im Haus!', loginSuccess: 'Angemeldet.', logoutConfirm: 'Abmelden?', invalidCredentials: 'Falscher Benutzername oder Passwort', usernameTaken: 'Dieser Benutzername oder diese E-Mail ist bereits vergeben' },
    carta: { fullsRequired: 'Gib deinen vollständigen Namen ein (min. 2 Buchstaben)', emailInvalid: 'Gib eine gültige E-Mail ein', usernameMin: 'Der Benutzername braucht mindestens 3 Zeichen', usernameChars: 'Nur Buchstaben, Ziffern, Punkt, Bindestrich oder Unterstrich', passwordMin: 'Das Passwort braucht mindestens 8 Zeichen', passwordRequired: 'Gib dein Passwort ein', identifierRequired: 'Gib Benutzername oder E-Mail ein', privacyRequired: 'Du musst die Datenschutznotiz akzeptieren', rangeInvalid: 'Der Mindestwert darf den Höchstwert nicht überschreiten' },
    home: { hero: 'Das Zuhause des Handwerks, der Daten und des Feuers.', heroSub: 'Sechs Galaxien, eine Sprache: Glas. Entdecke den Katalog, hol Angebote und finde deinen Platz.', galaxiesTitle: 'Galaxien', galaxiesSub: 'Jede Galaxie ist ein Handwerk mit eigenen Regeln.', viewGalaxy: 'Galaxie entdecken', satellitesTitle: 'Querschnitts-Satelliten', satellitesSub: 'Dienste, die alle Galaxien durchqueren.', tagline: 'Glas. Daten. Feuer.' },
    plans: { title: 'Abonnement-Pläne', sub: 'Wähle Galaxie und Zeitraum. Treue belohnt den langen Atem.', perMonth: 'pro Monat', perPeriod: 'pro Zeitraum', months: 'Monate', monthsShort: 'Monat', discount: 'Rabatt', total: 'Gesamt', choose: 'Wählen', loyaltyNote: 'Treuerabatte: 3 Monate 10% · 6 Monate 15% · 12 Monate 20% auf den Gesamtbetrag.', signUp: 'Abonnieren', membershipNote: 'Die Aktivierung der Mitgliedschaft wird von der Stiftung nach Zahlungsbestätigung erfasst.', subscriberUnavailable: 'Die Aktivierung ist für neue Konten noch nicht verfügbar.', enrollCta: 'Weiter zum nächsten Schritt' },
    marketplace: { title: 'Marktplatz · G2', sub: 'Kritische Rohstoffe, Werkzeuge und Maschinen, industrielle Dienstleistungen und fertige Werke der Gemeinde.', searchPh: 'Nach Name oder Beschreibung suchen…', filters: 'Filter', category: 'Kategorie', clearFilters: 'Filter zurücksetzen', openProduct: 'Details ansehen', addToCart: 'In den Warenkorb', cartCount: 'Warenkorb', goCheckout: 'Zur Kasse', price: 'Preis', unit: 'Einheit', moq: 'MOQ', msds: 'MSDS', specs: 'Spezifikationen', noResults: 'Keine Ergebnisse für diese Filter.', loadingCatalog: 'Katalog wird geladen…', country: 'Land', tier_insumos: 'Kritische Rohstoffe', tier_tools: 'Werkzeuge & Maschinen', tier_services: 'Industriedienste', tier_obras: 'Fertige Werke', unit_kg: 'kg', unit_ton: 't', unit_m: 'lfd. m', unit_unit: 'Stück', unit_l: 'Liter' },
    orders: { title: 'Meine Bestellungen', detail: 'Bestelldetails', empty: 'Ihr Warenkorb ist leer.', emptyCta: 'Markt entdecken', items: 'Artikel', status: 'Status', subtotal: 'Zwischensumme', shipping: 'Versand', tax: 'Steuern', total: 'Gesamt', qty: 'Menge', unit: 'Einheit', lineTotal: 'Zeilensumme', placedAt: 'Erstellt am', cancel: 'Bestellung stornieren', viewOrder: 'Bestellung ansehen', notFound: 'Bestellung nicht gefunden', address: 'Lieferadresse', fullName: 'Vollständiger Name', line1: 'Straße und Nummer', line2: 'Wohnung / Etage (optional)', city: 'Stadt', region: 'Region (optional)', postalCode: 'Postleitzahl', countryCode: 'Land (ISO 3166, z. B. AR)', phone: 'Telefon (optional)', paymentMethod: 'Zahlungsmethode', payCard: 'Karte (USD)', payTrc20: 'USDT · TRC-20-Netzwerk', payPolygon: 'USDT · Polygon-Netzwerk', submit: 'Bestellung erstellen', placing: 'Bestellung wird erstellt…', orderPending: 'Bestellung erstellt. Zahlung wartet auf Bestätigung.', noOrders: 'Sie haben noch keine Bestellungen.' },
    dashboard: { title: 'Dashboard', greeting: 'Hallo,', role: 'Rolle', noSub: 'Du hast noch keine aktiven Mitgliedschaften.', subscribe: 'Pläne ansehen', yourSubs: 'Deine Mitgliedschaften', active: 'Aktiv', until: 'bis', expired: 'Abgelaufen', account: 'Konto' },
    satellites: { title: 'Satelliten', sub: 'Ausschreibungen, Alarme, Forschung, Support und Gemeinschaft — Dienste über alle Galaxien.' },
    gate: { title: 'Gesperrter Bereich', note: 'Dieser Bereich erfordert eine aktive Mitgliedschaft. Solange die Zahlung nicht erfasst ist, bleibt die Aktivierung ausstehend.', loginToContinue: 'Anmelden zum Fortfahren' },
    footer: { rights: 'Alle Rechte vorbehalten.' },
  },
  it: {
    nav: { brand: 'Glass World Studio', home: 'Home', plans: 'Piani', marketplace: 'Marketplace', dashboard: 'Pannello', satellites: 'Satelliti', intro: 'Intro', login: 'Accedi', register: 'Crea account', logout: 'Esci', admin: 'Admin' },
    common: { loading: 'Caricamento…', error: 'Si è verificato un errore', retry: 'Riprova', back: 'Indietro', continue: 'Continua', cancel: 'Annulla', confirm: 'Conferma', save: 'Salva', close: 'Chiudi', search: 'Cerca', next: 'Avanti', previous: 'Indietro', page: 'Pagina', all: 'Tutte', network: 'Nessuna connessione al server', unauthorized: 'Sessione assente o scaduta', unknownError: 'Errore imprevisto', comingSoon: 'Prossimamente' },
    intro: { title: 'Glass World Studio', subtitle: 'La casa del mestiere, del dato e del fuoco.', enter: 'Entra', skip: 'Salta' },
    umbral: { title: 'La Soglia', lead: 'Scegli la tua galassia ed entra in casa. Tutto il vetro, il dato e il mestiere in un solo posto.', ctaRegister: 'Crea account', ctaLogin: 'Ho già un account', notice: 'Registrandoti accetti la nota sulla privacy. I tuoi dati non vengono mai condivisi con terzi.' },
    auth: { fullName: 'Nome completo', fullNamePh: 'Eduardo Esper', email: 'Indirizzo email', username: 'Nome utente', password: 'Password', identifier: 'Nome utente o email', identifierPh: 'es. esper.eduardo@gmail.com', privacy: 'Privacy', privacyAgree: 'Accetto la nota sulla privacy e il trattamento dei miei dati.', submitRegister: 'Crea account', submitLogin: 'Accedi', haveAccount: 'Hai già un account?', noAccount: 'Non hai un account?', registerSuccess: 'Account creato. Benvenuto in casa!', loginSuccess: 'Accesso effettuato.', logoutConfirm: 'Uscire?', invalidCredentials: 'Nome utente o password errati', usernameTaken: 'Questo nome utente o email è già usato' },
    carta: { fullsRequired: 'Inserisci il tuo nome completo (min. 2 lettere)', emailInvalid: 'Inserisci una email valida', usernameMin: 'Il nome utente deve avere almeno 3 caratteri', usernameChars: 'Solo lettere, numeri, punto, trattino o underscore', passwordMin: 'La password deve avere almeno 8 caratteri', passwordRequired: 'Inserisci la tua password', identifierRequired: 'Inserisci nome utente o email', privacyRequired: 'Devi accettare la nota sulla privacy per registrarti', rangeInvalid: 'Il minimo non può superare il massimo' },
    home: { hero: 'La casa del mestiere, del dato e del fuoco.', heroSub: 'Sei galassie, un unico linguaggio: il vetro. Esplora il catalogo, chiedi preventivi e costruisci il tuo posto.', galaxiesTitle: 'Galassie', galaxiesSub: 'Ogni galassia è un mestiere con regole proprie.', viewGalaxy: 'Scopri la galassia', satellitesTitle: 'Satelliti trasversali', satellitesSub: 'Servizi che attraversano tutte le galassie.', tagline: 'Vetro. Dato. Fuoco.' },
    plans: { title: 'Piani di abbonamento', sub: 'Scegli galassia e periodo. La fedeltà premia il lungo periodo.', perMonth: 'al mese', perPeriod: 'per periodo', months: 'mesi', monthsShort: 'mese', discount: 'sconto', total: 'Totale', choose: 'Scegli', loyaltyNote: 'Sconti fedeltà: 3 mesi 10% · 6 mesi 15% · 12 mesi 20% sul totale.', signUp: 'Abbonati', membershipNote: "L'attivazione della membership viene registrata dalla Fondazione alla conferma del pagamento.", subscriberUnavailable: "L'attivazione dell'abbonamento non è ancora disponibile per account nuovi.", enrollCta: 'Continua al prossimo passaggio' },
    marketplace: { title: 'Marketplace · G2', sub: 'Materie prime critiche, strumenti e macchinari, servizi industriali e opere finite della comunità.', searchPh: 'Cerca per nome o descrizione…', filters: 'Filtri', category: 'Categoria', clearFilters: 'Pulisci filtri', openProduct: 'Vedi dettaglio', addToCart: 'Aggiungi al carrello', cartCount: 'Carrello', goCheckout: 'Vai al checkout', price: 'Prezzo', unit: 'Unità', moq: 'MOQ', msds: 'MSDS', specs: 'Specifiche', noResults: 'Nessun risultato con questi filtri.', loadingCatalog: 'Caricamento catalogo…', country: 'Paese', tier_insumos: 'Materie prime critiche', tier_tools: 'Strumenti & macchinari', tier_services: 'Servizi industriali', tier_obras: 'Opere finite', unit_kg: 'kg', unit_ton: 't', unit_m: 'm lineare', unit_unit: 'unità', unit_l: 'litro' },
    orders: { title: 'I miei ordini', detail: 'Dettaglio ordine', empty: 'Il tuo carrello è vuoto.', emptyCta: 'Esplora il mercato', items: 'Articoli', status: 'Stato', subtotal: 'Subtotale', shipping: 'Spedizione', tax: 'Imposte', total: 'Totale', qty: 'Qtà', unit: 'Unità', lineTotal: 'Totale riga', placedAt: 'Creato il', cancel: 'Annulla ordine', viewOrder: 'Vedi ordine', notFound: 'Ordine non trovato', address: 'Indirizzo di spedizione', fullName: 'Nome completo', line1: 'Via e numero', line2: 'Appartamento / piano (opzionale)', city: 'Città', region: 'Regione (opzionale)', postalCode: 'Codice postale', countryCode: 'Paese (ISO 3166, es. AR)', phone: 'Telefono (opzionale)', paymentMethod: 'Metodo di pagamento', payCard: 'Carta (USD)', payTrc20: 'USDT · rete TRC-20', payPolygon: 'USDT · rete Polygon', submit: 'Crea ordine', placing: 'Creazione ordine…', orderPending: 'Ordine creato. Il pagamento è in attesa di conferma.', noOrders: 'Non hai ancora ordini.' },
    dashboard: { title: 'Pannello', greeting: 'Ciao,', role: 'Ruolo', noSub: 'Non hai ancora membership attive.', subscribe: 'Vedi i piani', yourSubs: 'Le tue membership', active: 'Attiva', until: 'fino al', expired: 'Scaduta', account: 'Account' },
    satellites: { title: 'Satelliti', sub: 'Gare, allerte, ricerca, supporto e comunità — servizi che attraversano tutte le galassie.' },
    gate: { title: 'Area riservata', note: 'Questa sezione richiede una membership attiva. Se il pagamento non è ancora registrato, attivazione in attesa.', loginToContinue: 'Accedi per continuare' },
    footer: { rights: 'Tutti i diritti riservati.' },
  },
  pt: {
    nav: { brand: 'Glass World Studio', home: 'Início', plans: 'Planos', marketplace: 'Marketplace', dashboard: 'Painel', satellites: 'Satélites', intro: 'Intro', login: 'Entrar', register: 'Criar conta', logout: 'Sair', admin: 'Admin' },
    common: { loading: 'Carregando…', error: 'Ocorreu um erro', retry: 'Tentar novamente', back: 'Voltar', continue: 'Continuar', cancel: 'Cancelar', confirm: 'Confirmar', save: 'Salvar', close: 'Fechar', search: 'Buscar', next: 'Próximo', previous: 'Anterior', page: 'Página', all: 'Todas', network: 'Sem conexão com o servidor', unauthorized: 'Sessão ausente ou expirada', unknownError: 'Erro inesperado', comingSoon: 'Em breve' },
    intro: { title: 'Glass World Studio', subtitle: 'A casa do ofício, do dado e do fogo.', enter: 'Entrar', skip: 'Pular' },
    umbral: { title: 'O Limiar', lead: 'Escolha sua galáxia e entre na casa. Todo o vidro, o dado e o ofício em um só lugar.', ctaRegister: 'Criar conta', ctaLogin: 'Já tenho conta', notice: 'Ao se registrar você aceita a nota de privacidade. Seus dados nunca são compartilhados com terceiros.' },
    auth: { fullName: 'Nome completo', fullNamePh: 'Eduardo Esper', email: 'Endereço de e-mail', username: 'Usuário', password: 'Senha', identifier: 'Usuário ou e-mail', identifierPh: 'ex: esper.eduardo@gmail.com', privacy: 'Privacidade', privacyAgree: 'Aceito a nota de privacidade e o tratamento dos meus dados.', submitRegister: 'Criar conta', submitLogin: 'Entrar', haveAccount: 'Já tem conta?', noAccount: 'Não tem conta?', registerSuccess: 'Conta criada. Bem-vindo à casa!', loginSuccess: 'Sessão iniciada.', logoutConfirm: 'Sair?', invalidCredentials: 'Usuário ou senha incorretos', usernameTaken: 'Esse usuário ou e-mail já está registrado' },
    carta: { fullsRequired: 'Informe seu nome completo (mín. 2 letras)', emailInvalid: 'Informe um e-mail válido', usernameMin: 'O usuário deve ter pelo menos 3 caracteres', usernameChars: 'Apenas letras, números, ponto, hífen ou sublinhado', passwordMin: 'A senha deve ter pelo menos 8 caracteres', passwordRequired: 'Informe sua senha', identifierRequired: 'Informe seu usuário ou e-mail', privacyRequired: 'Você deve aceitar a nota de privacidade para se registrar', rangeInvalid: 'O mínimo não pode superar o máximo' },
    home: { hero: 'A casa do ofício, do dado e do fogo.', heroSub: 'Seis galáxias, um só idioma: o vidro. Explore o catálogo, peça orçamentos e construa seu lugar.', galaxiesTitle: 'Galáxias', galaxiesSub: 'Cada galáxia é um ofício com regras próprias.', viewGalaxy: 'Conhecer galáxia', satellitesTitle: 'Satélites transversais', satellitesSub: 'Serviços que cruzam todas as galáxias.', tagline: 'Vidro. Dado. Fogo.' },
    plans: { title: 'Planos de assinatura', sub: 'Escolha sua galáxia e período. A fidelidade premia o longo prazo.', perMonth: 'por mês', perPeriod: 'por período', months: 'meses', monthsShort: 'mês', discount: 'desconto', total: 'Total', choose: 'Escolher', loyaltyNote: 'Descontos por fidelidade: 3 meses 10% · 6 meses 15% · 12 meses 20% sobre o total.', signUp: 'Assinar', membershipNote: 'A ativação da assinatura é registrada pela Fundação após a confirmação do pagamento.', subscriberUnavailable: 'A ativação da assinatura ainda não está disponível para contas novas.', enrollCta: 'Continuar para o próximo passo' },
    marketplace: { title: 'Marketplace · G2', sub: 'Insumos críticos, ferramentas e máquinas, serviços industriais e obras terminadas da comunidade.', searchPh: 'Buscar por nome ou descrição…', filters: 'Filtros', category: 'Categoria', clearFilters: 'Limpar filtros', openProduct: 'Ver detalhe', addToCart: 'Adicionar ao carrinho', cartCount: 'Carrinho', goCheckout: 'Ir para o checkout', price: 'Preço', unit: 'Unidade', moq: 'MOQ', msds: 'MSDS', specs: 'Especificações', noResults: 'Nenhum resultado com esses filtros.', loadingCatalog: 'Carregando catálogo…', country: 'País', tier_insumos: 'Insumos críticos', tier_tools: 'Ferramentas & máquinas', tier_services: 'Serviços industriais', tier_obras: 'Obras terminadas', unit_kg: 'kg', unit_ton: 't', unit_m: 'm linear', unit_unit: 'unidade', unit_l: 'litro' },
    orders: { title: 'Minhas ordens', detail: 'Detalhes do pedido', empty: 'Seu carrinho está vazio.', emptyCta: 'Explorar o mercado', items: 'Itens', status: 'Status', subtotal: 'Subtotal', shipping: 'Envio', tax: 'Impostos', total: 'Total', qty: 'Qtd', unit: 'Unidade', lineTotal: 'Total da linha', placedAt: 'Criado em', cancel: 'Cancelar pedido', viewOrder: 'Ver pedido', notFound: 'Pedido não encontrado', address: 'Endereço de entrega', fullName: 'Nome completo', line1: 'Rua e número', line2: 'Apartamento / andar (opcional)', city: 'Cidade', region: 'Estado (opcional)', postalCode: 'CEP', countryCode: 'País (ISO 3166, ex: AR)', phone: 'Telefone (opcional)', paymentMethod: 'Método de pagamento', payCard: 'Cartão (USD)', payTrc20: 'USDT · rede TRC-20', payPolygon: 'USDT · rede Polygon', submit: 'Criar pedido', placing: 'Criando pedido…', orderPending: 'Pedido criado. O pagamento fica pendente de confirmação.', noOrders: 'Você ainda não tem pedidos.' },
    dashboard: { title: 'Painel', greeting: 'Olá,', role: 'Função', noSub: 'Você ainda não tem assinaturas ativas.', subscribe: 'Ver planos', yourSubs: 'Suas assinaturas', active: 'Ativa', until: 'até', expired: 'Expirada', account: 'Conta' },
    satellites: { title: 'Satélites', sub: 'Licitações, alertas, pesquisa, suporte e comunidade — serviços que atravessam todas as galáxias.' },
    gate: { title: 'Área restrita', note: 'Esta seção exige uma assinatura ativa. Se o pagamento ainda não foi registrado, a ativação fica em espera.', loginToContinue: 'Entrar para continuar' },
    footer: { rights: 'Todos os direitos reservados.' },
  },
  zh: {
    nav: { brand: '玻璃世界工作室', home: '首页', plans: '套餐', marketplace: '市场', dashboard: '面板', satellites: '卫星', intro: '开场', login: '登录', register: '注册', logout: '退出', admin: '管理' },
    common: { loading: '加载中…', error: '出错了', retry: '重试', back: '返回', continue: '继续', cancel: '取消', confirm: '确认', save: '保存', close: '关闭', search: '搜索', next: '下一页', previous: '上一页', page: '页', all: '全部', network: '无法连接服务器', unauthorized: '会话缺失或已过期', unknownError: '意外错误', comingSoon: '即将上线' },
    intro: { title: '玻璃世界工作室', subtitle: '手艺、数据与烈焰之家。', enter: '进入', skip: '跳过' },
    umbral: { title: '门槛', lead: '选择你的星系，走进这间房子。所有玻璃、数据与手艺，尽在一处。', ctaRegister: '注册', ctaLogin: '已有账号', notice: '注册即表示您接受隐私声明。您的数据不会与第三方共享。' },
    auth: { fullName: '全名', fullNamePh: 'Eduardo Esper', email: '电子邮箱', username: '用户名', password: '密码', identifier: '用户名或邮箱', identifierPh: '例：esper.eduardo@gmail.com', privacy: '隐私', privacyAgree: '我接受隐私声明及对我的数据处理。', submitRegister: '注册', submitLogin: '登录', haveAccount: '已有账号？', noAccount: '还没有账号？', registerSuccess: '账号已创建，欢迎回家！', loginSuccess: '登录成功。', logoutConfirm: '确定退出？', invalidCredentials: '用户名或密码错误', usernameTaken: '该用户名或邮箱已被注册' },
    carta: { fullsRequired: '请输入您的全名（至少2个字符）', emailInvalid: '请输入有效邮箱', usernameMin: '用户名至少3个字符', usernameChars: '仅可使用字母、数字、点、短横线或下划线', passwordMin: '密码至少8个字符', passwordRequired: '请输入密码', identifierRequired: '请输入用户名或邮箱', privacyRequired: '您必须接受隐私声明才能注册', rangeInvalid: '最小值不能大于最大值' },
    home: { hero: '手艺、数据与烈焰之家。', heroSub: '六个星系，一种语言：玻璃。探索目录、获取报价，在社区里构筑你的位置。', galaxiesTitle: '星系', galaxiesSub: '每个星系都是一门手艺，各有章法。', viewGalaxy: '探索星系', satellitesTitle: '横贯卫星', satellitesSub: '跨越所有星系的服务。', tagline: '玻璃。数据。烈焰。' },
    plans: { title: '订阅套餐', sub: '选择星系与周期。忠诚奖励长期。', perMonth: '每月', perPeriod: '每期', months: '个月', monthsShort: '个月', discount: '折扣', total: '合计', choose: '选择', loyaltyNote: '忠诚折扣：3个月10% · 6个月15% · 12个月20%（按总价）。', signUp: '订阅', membershipNote: '会员激活由基金会确认付款后登记。', subscriberUnavailable: '新账号暂不支持开通订阅。', enrollCta: '继续下一步' },
    marketplace: { title: '市场 · G2', sub: '关键原料、工具与机械、工业服务，以及社区完成的成品。', searchPh: '按名称或描述搜索…', filters: '筛选', category: '分类', clearFilters: '清除筛选', openProduct: '查看详情', addToCart: '加入购物车', cartCount: '购物车', goCheckout: '去结算', price: '价格', unit: '单位', moq: 'MOQ', msds: 'MSDS', specs: '规格', noResults: '没有符合条件的结果。', loadingCatalog: '正在加载目录…', country: '国家/地区', tier_insumos: '关键原料', tier_tools: '工具与机械', tier_services: '工业服务', tier_obras: '成品', unit_kg: '公斤', unit_ton: '吨', unit_m: '延米', unit_unit: '件', unit_l: '升' },
    orders: { title: '我的订单', detail: '订单详情', empty: '您的购物车是空的。', emptyCta: '浏览市场', items: '商品', status: '状态', subtotal: '小计', shipping: '运费', tax: '税费', total: '合计', qty: '数量', unit: '单位', lineTotal: '行合计', placedAt: '下单时间', cancel: '取消订单', viewOrder: '查看订单', notFound: '未找到订单', address: '收货地址', fullName: '姓名', line1: '街道与门牌号', line2: '公寓/楼层（可选）', city: '城市', region: '省/州（可选）', postalCode: '邮政编码', countryCode: '国家/地区（ISO 3166，如 AR）', phone: '电话（可选）', paymentMethod: '支付方式', payCard: '银行卡（美元）', payTrc20: 'USDT · TRC-20 网络', payPolygon: 'USDT · Polygon 网络', submit: '创建订单', placing: '正在创建订单…', orderPending: '订单已创建，付款待确认。', noOrders: '您还没有订单。' },
    dashboard: { title: '面板', greeting: '你好，', role: '角色', noSub: '您还没有有效的会员。', subscribe: '查看套餐', yourSubs: '您的会员', active: '有效', until: '至', expired: '已过期', account: '账户' },
    satellites: { title: '卫星', sub: '招标、警报、研究、支持与社区——跨越所有星系的服务。' },
    gate: { title: '受限区域', note: '此区域需要有效的会员资格。若付款尚未登记，激活将保持等待。', loginToContinue: '登录以继续' },
    footer: { rights: '保留所有权利。' },
  },
};