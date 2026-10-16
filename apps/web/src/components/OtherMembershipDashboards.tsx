'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { LanguageSelector } from '@/components/LanguageSelector';
import { useLanguage } from '@/components/LanguageProvider';
import { dashboardModules, type DashboardModule } from '@/lib/dashboard';
import { type LanguageCode } from '@/lib/i18n';
import { readMembershipPreferences } from '@/lib/membership';

const labels: Record<
  LanguageCode,
  {
    galaxy: string;
    professionals: string;
    intro: string;
    preparing: string;
    failedToLoad: string;
    back: string;
    profile: string;
  }
> = {
  es: {
    galaxy: 'Galaxia',
    professionals: 'Hub de Profesionales',
    intro: 'Tu espacio de conexión y colaboración con especialistas del universo del vidrio.',
    preparing: 'Estamos preparando las herramientas de esta galaxia.',
    failedToLoad: 'No se pudo leer tu perfil profesional local.',
    back: 'Volver a Íconos y Maestros',
    profile: 'Roles profesionales',
  },
  en: {
    galaxy: 'Galaxy',
    professionals: 'Professionals Hub',
    intro: 'Your space to connect and collaborate with specialists across the glass universe.',
    preparing: 'The tools for this galaxy are being prepared.',
    failedToLoad: 'Your local professional profile could not be read.',
    back: 'Back to Icons & Masters',
    profile: 'Professional roles',
  },
  pt: {
    galaxy: 'Galáxia',
    professionals: 'Hub de Profissionais',
    intro: 'Seu espaço de conexão e colaboração com especialistas do universo do vidro.',
    preparing: 'Estamos preparando as ferramentas desta galáxia.',
    failedToLoad: 'Não foi possível ler seu perfil profissional local.',
    back: 'Voltar a Ícones e Mestres',
    profile: 'Perfis profissionais',
  },
  it: {
    galaxy: 'Galassia',
    professionals: 'Hub dei professionisti',
    intro: 'Il tuo spazio per connetterti e collaborare con gli specialisti del mondo del vetro.',
    preparing: 'Stiamo preparando gli strumenti di questa galassia.',
    failedToLoad: 'Impossibile leggere il profilo professionale locale.',
    back: 'Torna a Icone e Maestri',
    profile: 'Profili professionali',
  },
  fr: {
    galaxy: 'Galaxie',
    professionals: 'Espace professionnels',
    intro: 'Votre espace pour échanger et collaborer avec les spécialistes du verre.',
    preparing: 'Nous préparons les outils de cette galaxie.',
    failedToLoad: 'Impossible de lire votre profil professionnel local.',
    back: 'Retour à Icônes et Maîtres',
    profile: 'Profils professionnels',
  },
  de: {
    galaxy: 'Galaxie',
    professionals: 'Hub für Fachleute',
    intro: 'Dein Ort, um dich mit Fachleuten der Glaswelt zu vernetzen und zusammenzuarbeiten.',
    preparing: 'Die Werkzeuge für diese Galaxie werden vorbereitet.',
    failedToLoad: 'Dein lokales Berufsprofil konnte nicht gelesen werden.',
    back: 'Zurück zu Ikonen und Meistern',
    profile: 'Berufsprofile',
  },
  zh: {
    galaxy: '星系',
    professionals: '专业人士中心',
    intro: '与玻璃领域的专业人士建立联系并开展合作。',
    preparing: '此星系的工具正在准备中。',
    failedToLoad: '无法读取本地专业人士档案。',
    back: '返回玻璃大师',
    profile: '职业档案',
  },
};

export function OtherGalaxyDashboard({ module }: { module: DashboardModule }) {
  const { language } = useLanguage();
  const text = labels[language];

  return (
    <main className="membership-destination" lang={language}>
      <div className="membership-destination__top"><LanguageSelector /></div>
      <p className="galaxy-one__eyebrow">{text.galaxy} · {module.id}</p>
      <h1>{module.title[language]}</h1>
      <p>{module.description[language]}</p>
      <p className="membership-destination__notice">{text.preparing}</p>
      <Link href="/galaxy/1-maestros">{text.back}</Link>
    </main>
  );
}

export function ProfessionalsDashboard() {
  const { language } = useLanguage();
  const text = labels[language];
  const module = dashboardModules.find((item) => item.id === 'professionals');
  const [profileIds, setProfileIds] = useState<string[]>([]);
  const [profileError, setProfileError] = useState(false);

  useEffect(() => {
    try {
      const preferences = readMembershipPreferences();
      setProfileIds(preferences?.professionalProfiles ?? []);
    } catch (error) {
      console.error('Unable to load the professional membership profile.', error);
      setProfileError(true);
    }
  }, []);

  return (
    <main className="membership-destination" lang={language}>
      <div className="membership-destination__top"><LanguageSelector /></div>
      <p className="galaxy-one__eyebrow">GWS · PROFESSIONALS</p>
      <h1>{text.professionals}</h1>
      <p>{text.intro}</p>
      {profileError && <p role="alert">{text.failedToLoad}</p>}
      {module && profileIds.length > 0 && (
        <section>
          <h2>{text.profile}</h2>
          <ul>
            {module.modules.map((profile, index) =>
              profileIds.includes(['engineers', 'process-technicians', 'scientists-specialists'][index]) ? (
                <li key={index}>{profile[language]}</li>
              ) : null,
            )}
          </ul>
        </section>
      )}
      <Link href="/galaxy/1-maestros">{text.back}</Link>
    </main>
  );
}
