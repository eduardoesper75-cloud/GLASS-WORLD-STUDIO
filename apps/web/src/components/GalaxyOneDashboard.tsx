'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { LanguageSelector } from '@/components/LanguageSelector';
import { useLanguage } from '@/components/LanguageProvider';
import { dashboardModules } from '@/lib/dashboard';
import { type LanguageCode } from '@/lib/i18n';
import {
  galaxyPathById,
  readMembershipPreferences,
  saveMembershipPreferences,
  type MembershipPreferences,
} from '@/lib/membership';
import { membershipSpecialties } from '@/lib/specialties';

const copy: Record<
  LanguageCode,
  {
    eyebrow: string;
    welcome: string;
    intro: string;
    galaxy: string;
    welcomeTitle: string;
    welcomeBody: string;
    chooseAvatar: string;
    confirmAvatar: string;
    enterHub: string;
    success: string;
    avatarError: string;
    failedToLoadProfile: string;
    greeting: string;
    curator: string;
    curatedIntro: string;
    resources: string;
    gallery: string;
    professionals: string;
    creatorDashboard: string;
    otherGalaxies: string;
    localProfile: string;
    internalContent: string;
    topics: string[];
    avatarNames: string[];
  }
> = {
  es: {
    eyebrow: 'Galaxia de Maestros',
    welcome: 'Bienvenido al taller, Maestro.',
    intro: 'Un espacio para crear, enseñar y preservar el oficio del vidrio.',
    galaxy: 'Pertenencia · Galaxia 1',
    welcomeTitle: 'Tu identidad en el universo del vidrio',
    welcomeBody: 'Elige tu insignia de Maestro Vidriero para completar tu bienvenida.',
    chooseAvatar: 'Elige tu insignia',
    confirmAvatar: 'Confirmar insignia',
    enterHub: 'Entrar a la Galaxia 1',
    success: '¡Tu insignia ha quedado registrada!',
    avatarError: 'No pudimos guardar tu insignia en este dispositivo. Inténtalo de nuevo.',
    failedToLoadProfile: 'No se pudo leer tu perfil local. Vuelve al Umbral e inténtalo de nuevo.',
    greeting: 'Tu taller, tu órbita.',
    curator: 'Curaduría destacada',
    curatedIntro: 'Explora recursos y contenidos propios para seguir aprendiendo.',
    resources: 'Recursos',
    gallery: 'Galería de piezas',
    professionals: 'Conectar con profesionales',
    creatorDashboard: 'Panel del Maestro',
    otherGalaxies: 'Otras galaxias',
    localProfile: 'Perfil guardado en este dispositivo',
    internalContent: 'Glass World Studio · Biblioteca',
    topics: ['Vitrofusión y Hot-Kiln', 'Soplado de vidrio', 'Trabajo a la llama', 'Vitralismo y trabajo en frío'],
    avatarNames: ['Maestro Vidriero', 'Maestro del fuego', 'Maestro del horno', 'Maestro artesano'],
  },
  en: {
    eyebrow: 'Masters Galaxy',
    welcome: 'Welcome to the studio, Master.',
    intro: 'A place to create, teach, and preserve the glassmaking craft.',
    galaxy: 'Membership · Galaxy 1',
    welcomeTitle: 'Your identity in the glass universe',
    welcomeBody: 'Choose your Glass Master emblem to complete your welcome.',
    chooseAvatar: 'Choose your emblem',
    confirmAvatar: 'Confirm emblem',
    enterHub: 'Enter Galaxy 1',
    success: 'Your emblem has been registered!',
    avatarError: 'We could not save your emblem on this device. Please try again.',
    failedToLoadProfile: 'Your local profile could not be read. Return to the threshold and try again.',
    greeting: 'Your studio, your orbit.',
    curator: 'Featured curation',
    curatedIntro: 'Explore original resources and content to keep learning.',
    resources: 'Resources',
    gallery: 'Piece gallery',
    professionals: 'Connect with professionals',
    creatorDashboard: 'Master creator dashboard',
    otherGalaxies: 'Other galaxies',
    localProfile: 'Profile saved on this device',
    internalContent: 'Glass World Studio · Library',
    topics: ['Glass fusing & Hot-Kiln', 'Glassblowing', 'Flameworking', 'Stained glass & cold working'],
    avatarNames: ['Glass Master', 'Flame Master', 'Kiln Master', 'Craft Master'],
  },
  pt: {
    eyebrow: 'Galáxia de Mestres',
    welcome: 'Bem-vindo à oficina, Mestre.',
    intro: 'Um espaço para criar, ensinar e preservar o ofício do vidro.',
    galaxy: 'Pertencimento · Galáxia 1',
    welcomeTitle: 'Sua identidade no universo do vidro',
    welcomeBody: 'Escolha seu emblema de Mestre Vidreiro para concluir as boas-vindas.',
    chooseAvatar: 'Escolha seu emblema',
    confirmAvatar: 'Confirmar emblema',
    enterHub: 'Entrar na Galáxia 1',
    success: 'Seu emblema foi registrado!',
    avatarError: 'Não foi possível salvar seu emblema neste dispositivo. Tente novamente.',
    failedToLoadProfile: 'Não foi possível ler seu perfil local. Volte ao Umbral e tente novamente.',
    greeting: 'Sua oficina, sua órbita.',
    curator: 'Curadoria em destaque',
    curatedIntro: 'Explore recursos e conteúdos próprios para continuar aprendendo.',
    resources: 'Recursos',
    gallery: 'Galeria de peças',
    professionals: 'Conectar com profissionais',
    creatorDashboard: 'Painel do Mestre',
    otherGalaxies: 'Outras galáxias',
    localProfile: 'Perfil salvo neste dispositivo',
    internalContent: 'Glass World Studio · Biblioteca',
    topics: ['Fusão de vidro e Hot-Kiln', 'Sopro de vidro', 'Trabalho à chama', 'Vitrais e trabalho a frio'],
    avatarNames: ['Mestre Vidreiro', 'Mestre do fogo', 'Mestre do forno', 'Mestre artesão'],
  },
  it: {
    eyebrow: 'Galassia dei Maestri',
    welcome: 'Benvenuto in laboratorio, Maestro.',
    intro: 'Uno spazio per creare, insegnare e preservare l’arte del vetro.',
    galaxy: 'Appartenenza · Galassia 1',
    welcomeTitle: 'La tua identità nell’universo del vetro',
    welcomeBody: 'Scegli il tuo emblema da Maestro del vetro per completare il benvenuto.',
    chooseAvatar: 'Scegli il tuo emblema',
    confirmAvatar: 'Conferma emblema',
    enterHub: 'Entra nella Galassia 1',
    success: 'Il tuo emblema è stato registrato!',
    avatarError: 'Non è stato possibile salvare l’emblema su questo dispositivo. Riprova.',
    failedToLoadProfile: 'Impossibile leggere il profilo locale. Torna alla soglia e riprova.',
    greeting: 'Il tuo laboratorio, la tua orbita.',
    curator: 'Selezione in evidenza',
    curatedIntro: 'Esplora risorse e contenuti originali per continuare a imparare.',
    resources: 'Risorse',
    gallery: 'Galleria delle opere',
    professionals: 'Connetti con i professionisti',
    creatorDashboard: 'Pannello del Maestro',
    otherGalaxies: 'Altre galassie',
    localProfile: 'Profilo salvato su questo dispositivo',
    internalContent: 'Glass World Studio · Biblioteca',
    topics: ['Fusione del vetro e Hot-Kiln', 'Soffiatura del vetro', 'Lavorazione alla fiamma', 'Vetrate e lavorazione a freddo'],
    avatarNames: ['Maestro del vetro', 'Maestro del fuoco', 'Maestro del forno', 'Maestro artigiano'],
  },
  fr: {
    eyebrow: 'Galaxie des maîtres',
    welcome: 'Bienvenue à l’atelier, Maître.',
    intro: 'Un espace pour créer, enseigner et préserver les métiers du verre.',
    galaxy: 'Appartenance · Galaxie 1',
    welcomeTitle: 'Votre identité dans l’univers du verre',
    welcomeBody: 'Choisissez votre emblème de Maître verrier pour terminer votre accueil.',
    chooseAvatar: 'Choisissez votre emblème',
    confirmAvatar: 'Confirmer l’emblème',
    enterHub: 'Entrer dans la Galaxie 1',
    success: 'Votre emblème a été enregistré !',
    avatarError: 'Impossible d’enregistrer votre emblème sur cet appareil. Réessayez.',
    failedToLoadProfile: 'Impossible de lire votre profil local. Revenez au seuil et réessayez.',
    greeting: 'Votre atelier, votre orbite.',
    curator: 'Sélection à la une',
    curatedIntro: 'Explorez des ressources et des contenus originaux pour continuer à apprendre.',
    resources: 'Ressources',
    gallery: 'Galerie des pièces',
    professionals: 'Se connecter aux professionnels',
    creatorDashboard: 'Espace du Maître',
    otherGalaxies: 'Autres galaxies',
    localProfile: 'Profil enregistré sur cet appareil',
    internalContent: 'Glass World Studio · Bibliothèque',
    topics: ['Fusing et Hot-Kiln', 'Soufflage du verre', 'Travail à la flamme', 'Vitrail et travail à froid'],
    avatarNames: ['Maître verrier', 'Maître du feu', 'Maître du four', 'Maître artisan'],
  },
  de: {
    eyebrow: 'Meister-Galaxie',
    welcome: 'Willkommen im Atelier, Meister.',
    intro: 'Ein Ort, um Glashandwerk zu schaffen, zu lehren und zu bewahren.',
    galaxy: 'Zugehörigkeit · Galaxie 1',
    welcomeTitle: 'Deine Identität im Glasuniversum',
    welcomeBody: 'Wähle dein Glasmeister-Abzeichen, um deine Begrüßung abzuschließen.',
    chooseAvatar: 'Wähle dein Abzeichen',
    confirmAvatar: 'Abzeichen bestätigen',
    enterHub: 'Galaxie 1 betreten',
    success: 'Dein Abzeichen wurde gespeichert!',
    avatarError: 'Dein Abzeichen konnte auf diesem Gerät nicht gespeichert werden. Bitte erneut versuchen.',
    failedToLoadProfile: 'Dein lokales Profil konnte nicht gelesen werden. Kehre zum Schwellenbereich zurück.',
    greeting: 'Dein Atelier, deine Umlaufbahn.',
    curator: 'Ausgewählte Inhalte',
    curatedIntro: 'Entdecke eigene Ressourcen und Inhalte, um weiterzulernen.',
    resources: 'Ressourcen',
    gallery: 'Werkgalerie',
    professionals: 'Mit Fachleuten verbinden',
    creatorDashboard: 'Meister-Dashboard',
    otherGalaxies: 'Andere Galaxien',
    localProfile: 'Profil auf diesem Gerät gespeichert',
    internalContent: 'Glass World Studio · Bibliothek',
    topics: ['Glasschmelzen und Hot-Kiln', 'Glasblasen', 'Arbeiten an der Flamme', 'Glasmalerei und Kaltbearbeitung'],
    avatarNames: ['Glasmeister', 'Flammenmeister', 'Ofenmeister', 'Handwerksmeister'],
  },
  zh: {
    eyebrow: '玻璃大师星系',
    welcome: '欢迎来到工作室，大师。',
    intro: '在这里创作、教学并传承玻璃工艺。',
    galaxy: '所属 · 星系 1',
    welcomeTitle: '你在玻璃宇宙中的身份',
    welcomeBody: '选择你的玻璃大师徽章，完成欢迎设置。',
    chooseAvatar: '选择徽章',
    confirmAvatar: '确认徽章',
    enterHub: '进入星系 1',
    success: '徽章已登记！',
    avatarError: '无法在此设备保存徽章，请重试。',
    failedToLoadProfile: '无法读取本地个人资料，请返回入口页面重试。',
    greeting: '你的工作室，你的轨道。',
    curator: '精选内容',
    curatedIntro: '探索原创资源与内容，继续学习。',
    resources: '资源',
    gallery: '作品画廊',
    professionals: '联系专业人士',
    creatorDashboard: '大师创作面板',
    otherGalaxies: '其他星系',
    localProfile: '个人资料保存在此设备',
    internalContent: 'Glass World Studio · 内容库',
    topics: ['玻璃熔融与热窑', '玻璃吹制', '火焰加工', '彩绘玻璃与冷加工'],
    avatarNames: ['玻璃大师', '火焰大师', '窑炉大师', '工艺大师'],
  },
};

const avatarSymbols = ['M', 'F', 'K', 'A'];
const galaxies = dashboardModules.filter((module) => module.category === 'galaxy');

export function GalaxyOneDashboard() {
  const { language } = useLanguage();
  const router = useRouter();
  const labels = copy[language];
  const [preferences, setPreferences] = useState<MembershipPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeComplete, setWelcomeComplete] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(avatarSymbols[0]);
  const [error, setError] = useState('');
  const welcomeDialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    try {
      const storedPreferences = readMembershipPreferences();
      if (!storedPreferences || !storedPreferences.galaxies.includes('masters')) {
        setRedirecting(true);
        router.replace('/umbral');
        return;
      }

      setPreferences(storedPreferences);
      if (!storedPreferences.avatar) {
        setShowWelcome(true);
      } else {
        setSelectedAvatar(storedPreferences.avatar);
      }
    } catch (cause) {
      console.error('Unable to load the Galaxy 1 membership profile.', cause);
      setError(labels.failedToLoadProfile);
    } finally {
      setLoading(false);
    }
  }, [labels.avatarError, router]);

  useEffect(() => {
    if (!showWelcome) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    document.body.style.overflow = 'hidden';
    welcomeDialogRef.current
      ?.querySelector<HTMLElement>('button:not([disabled])')
      ?.focus();

    function trapDialogFocus(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusable = welcomeDialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled])',
      );
      if (!focusable?.length) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', trapDialogFocus);
    return () => {
      document.removeEventListener('keydown', trapDialogFocus);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [showWelcome, welcomeComplete]);

  function confirmAvatar() {
    if (!preferences) {
      return;
    }

    try {
      const updatedPreferences = { ...preferences, avatar: selectedAvatar };
      saveMembershipPreferences(updatedPreferences);
      setPreferences(updatedPreferences);
      setWelcomeComplete(true);
      setError('');
    } catch (cause) {
      console.error('Unable to save the Galaxy 1 avatar.', cause);
      setError(labels.avatarError);
    }
  }

  if (loading || redirecting) {
    return <main className="galaxy-one galaxy-one--loading" aria-busy="true" />;
  }

  if (!preferences) {
    return (
      <main className="galaxy-one galaxy-one--error" lang={language}>
        <p role="alert">{error || labels.failedToLoadProfile}</p>
        <Link href="/umbral">/umbral</Link>
      </main>
    );
  }

  const masterGalaxy = galaxies.find((module) => module.id === 'masters');
  const masteredTechniques = membershipSpecialties.filter((specialty) =>
    preferences.specialtiesByGalaxy.masters?.includes(specialty.id),
  );

  return (
    <main className="galaxy-one" lang={language}>
      <div className="galaxy-one__stars" aria-hidden="true" />
      <aside className="galaxy-one__sidebar">
        <Link className="galaxy-one__brand" href="/" aria-label="Glass World Studio">
          <span aria-hidden="true">G</span>
          <strong>GLASS WORLD<br />STUDIO</strong>
        </Link>
        <p className="galaxy-one__sidebar-label">{labels.galaxy}</p>
        <nav className="galaxy-one__nav" aria-label={labels.galaxy}>
          <a href="#curation">{labels.curator}</a>
          <a href="#resources">{labels.resources}</a>
          <a href="#gallery">{labels.gallery}</a>
          <Link href="/professionals/dashboard">{labels.professionals}</Link>
          <Link href="/galaxy/1-maestros/creator-dashboard">{labels.creatorDashboard}</Link>
          <a href="#galaxies">{labels.otherGalaxies}</a>
        </nav>
        <p className="galaxy-one__local-status">{labels.localProfile}</p>
      </aside>

      <div className="galaxy-one__content">
        <header className="galaxy-one__header">
          <div className="galaxy-one__member">
            <span className="galaxy-one__avatar" aria-hidden="true">{preferences.avatar}</span>
            <div>
              <strong>{labels.welcome}</strong>
              <span>{masterGalaxy?.title[language]}</span>
            </div>
          </div>
          <LanguageSelector />
        </header>

        <section className="galaxy-one__hero">
          <p className="galaxy-one__eyebrow">{labels.eyebrow}</p>
          <h1>{labels.greeting}</h1>
          <p>{labels.intro}</p>
          {masteredTechniques.length > 0 && (
            <ul className="galaxy-one__techniques" aria-label={labels.resources}>
              {masteredTechniques.slice(0, 4).map((technique) => (
                <li key={technique.id}>{technique.name[language]}</li>
              ))}
            </ul>
          )}
        </section>

        <section className="galaxy-one__section" id="curation" aria-labelledby="galaxy-one-curator">
          <div className="galaxy-one__section-heading">
            <div>
              <p className="galaxy-one__eyebrow">{labels.internalContent}</p>
              <h2 id="galaxy-one-curator">{labels.curator}</h2>
            </div>
            <p>{labels.curatedIntro}</p>
          </div>
          <div className="galaxy-one__curation-grid">
            {labels.topics.map((topic) => (
              <article className="galaxy-one__curation-card" key={topic}>
                <h3>{topic}</h3>
                <p>{labels.internalContent}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="galaxy-one__quick-links" id="resources" aria-label={labels.resources}>
          <Link href="/inicio">
            <strong>{labels.resources}</strong>
          </Link>
          <Link href="/inicio" id="gallery">
            <strong>{labels.gallery}</strong>
          </Link>
          <Link href="/professionals/dashboard">
            <strong>{labels.professionals}</strong>
          </Link>
        </section>

        <section className="galaxy-one__section" id="galaxies" aria-labelledby="galaxy-one-other">
          <div className="galaxy-one__section-heading">
            <div>
              <p className="galaxy-one__eyebrow">The glass universe</p>
              <h2 id="galaxy-one-other">{labels.otherGalaxies}</h2>
            </div>
          </div>
          <div className="galaxy-one__galaxy-links">
            {galaxies.filter((module) => module.id !== 'masters').map((galaxy) => (
              <Link href={galaxyPathById[galaxy.id]} key={galaxy.id}>
                {galaxy.title[language]}
              </Link>
            ))}
          </div>
        </section>
      </div>

      {showWelcome && (
        <div className="galaxy-welcome-overlay">
          <section
            className={`galaxy-welcome${welcomeComplete ? ' galaxy-welcome--complete' : ''}`}
            aria-labelledby="galaxy-welcome-title"
            aria-modal="true"
            ref={welcomeDialogRef}
            role="dialog"
          >
            <span className="galaxy-welcome__sparkle" aria-hidden="true">
              {welcomeComplete ? 'OK' : 'GWS'}
            </span>
            <p className="galaxy-one__eyebrow">{labels.eyebrow}</p>
            <h2 id="galaxy-welcome-title">
              {welcomeComplete ? labels.success : labels.welcomeTitle}
            </h2>
            {!welcomeComplete && (
              <>
                <p>{labels.welcomeBody}</p>
                <fieldset className="galaxy-welcome__choices">
                  <legend>{labels.chooseAvatar}</legend>
                  {avatarSymbols.map((symbol, index) => (
                    <button
                      aria-label={labels.avatarNames[index]}
                      aria-pressed={selectedAvatar === symbol}
                      className={selectedAvatar === symbol ? 'is-selected' : ''}
                      key={symbol}
                      onClick={() => setSelectedAvatar(symbol)}
                      type="button"
                    >
                      <span aria-hidden="true">{symbol}</span>
                      <small>{labels.avatarNames[index]}</small>
                    </button>
                  ))}
                </fieldset>
                <button className="galaxy-welcome__action" onClick={confirmAvatar} type="button">
                  {labels.confirmAvatar}
                </button>
              </>
            )}
            {welcomeComplete && (
              <button
                autoFocus
                className="galaxy-welcome__action"
                onClick={() => setShowWelcome(false)}
                type="button"
              >
                {labels.enterHub}
              </button>
            )}
            {error && <p className="galaxy-welcome__error" role="alert">{error}</p>}
          </section>
        </div>
      )}
    </main>
  );
}
