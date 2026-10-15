'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';

import { LanguageSelector } from '@/components/LanguageSelector';
import { useLanguage } from '@/components/LanguageProvider';
import { dashboardLabels, dashboardModules } from '@/lib/dashboard';
import { getMessage } from '@/lib/i18n';

const MEMBERSHIP_STORAGE_KEY = 'gws-membership-preferences';
const galaxyModules = dashboardModules.filter((module) => module.category === 'galaxy');
const professionalModule = dashboardModules.find((module) => module.id === 'professionals');

if (!professionalModule) {
  throw new Error('The professional profile definitions are missing.');
}

const professionalProfileIds = ['engineers', 'process-technicians', 'scientists-specialists'];
const professionalProfiles = professionalModule.modules.map((label, index) => ({
  id: professionalProfileIds[index],
  label,
}));

function isStringArray(value: unknown, allowedValues: string[]): value is string[] {
  return (
    Array.isArray(value) &&
    new Set(value).size === value.length &&
    value.every((item): item is string => typeof item === 'string' && allowedValues.includes(item))
  );
}

export default function AccessThresholdPage() {
  const { language } = useLanguage();
  const [step, setStep] = useState<2 | 3>(2);
  const [selectedGalaxies, setSelectedGalaxies] = useState<string[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [notice, setNotice] = useState('');
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    try {
      const storedPreferences = window.localStorage.getItem(MEMBERSHIP_STORAGE_KEY);
      if (!storedPreferences) {
        return;
      }

      const preferences: unknown = JSON.parse(storedPreferences);
      if (
        typeof preferences !== 'object' ||
        preferences === null ||
        !('galaxies' in preferences) ||
        !('professionalProfiles' in preferences) ||
        !isStringArray(
          preferences.galaxies,
          galaxyModules.map((module) => module.id),
        ) ||
        !isStringArray(
          preferences.professionalProfiles,
          professionalProfileIds,
        )
      ) {
        throw new Error('Stored membership preferences have an invalid format.');
      }

      setSelectedGalaxies(preferences.galaxies);
      setSelectedProfiles(preferences.professionalProfiles);
    } catch (error) {
      console.error('Unable to load saved membership preferences.', error);
      setStorageError(true);
    }
  }, []);

  function toggleSelection(
    current: string[],
    setCurrent: (value: string[]) => void,
    id: string,
    selected: boolean,
  ) {
    setCurrent(selected ? [...current, id] : current.filter((item) => item !== id));
  }

  function saveMembership(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedGalaxies.length === 0) {
      setNotice(getMessage(language, 'membershipRequired'));
      return;
    }

    try {
      window.localStorage.setItem(
        MEMBERSHIP_STORAGE_KEY,
        JSON.stringify({
          galaxies: selectedGalaxies,
          professionalProfiles: selectedProfiles,
        }),
      );
      setNotice('');
      setStorageError(false);
      setStep(3);
    } catch (error) {
      console.error('Unable to save membership preferences.', error);
      setNotice(getMessage(language, 'membershipStorageError'));
    }
  }

  function t(key: Parameters<typeof getMessage>[1]) {
    return getMessage(language, key);
  }

  const selectedGalaxyModules = galaxyModules.filter((module) => selectedGalaxies.includes(module.id));
  const selectedProfessionalProfiles = professionalProfiles.filter((profile) =>
    selectedProfiles.includes(profile.id),
  );

  return (
    <main className="threshold" lang={language}>
      <div className="landing__stars" aria-hidden="true" />
      <div className="threshold__glass" aria-hidden="true" />
      <div className="threshold__rock" aria-hidden="true" />
      <LanguageSelector />

      <section className="threshold__panel membership-panel" aria-labelledby="threshold-title">
        <p className="landing__eyebrow">{t('membershipStep')}</p>

        {step === 2 && (
          <>
            <h1 id="threshold-title">{t('membershipTitle')}</h1>
            <p className="threshold__lead">{t('membershipIntro')}</p>

            <form className="membership-form" onSubmit={saveMembership}>
              <fieldset className="membership-group">
                <legend>{t('galaxiesTitle')}</legend>
                <p className="membership-group__hint">{t('galaxiesHint')}</p>
                <div className="membership-options">
                  {galaxyModules.map((module) => (
                    <label className="membership-option" key={module.id}>
                      <input
                        checked={selectedGalaxies.includes(module.id)}
                        onChange={(event) =>
                          toggleSelection(
                            selectedGalaxies,
                            setSelectedGalaxies,
                            module.id,
                            event.target.checked,
                          )
                        }
                        type="checkbox"
                        value={module.id}
                      />
                      <span className="membership-option__icon" aria-hidden="true">
                        {module.icon}
                      </span>
                      <span className="membership-option__copy">
                        <strong>{module.title[language]}</strong>
                        <span>{module.description[language]}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="membership-group">
                <legend>{t('professionalsTitle')}</legend>
                <p className="membership-group__hint">{t('professionalsHint')}</p>
                <div className="membership-options membership-options--profiles">
                  {professionalProfiles.map((profile) => (
                    <label className="membership-option membership-option--profile" key={profile.id}>
                      <input
                        checked={selectedProfiles.includes(profile.id)}
                        onChange={(event) =>
                          toggleSelection(
                            selectedProfiles,
                            setSelectedProfiles,
                            profile.id,
                            event.target.checked,
                          )
                        }
                        type="checkbox"
                        value={profile.id}
                      />
                      <span className="membership-option__copy">
                        <strong>{profile.label[language]}</strong>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <section className="stellar-credential" aria-labelledby="credential-title" aria-live="polite">
                <div className="stellar-credential__header">
                  <span className="stellar-credential__sigil" aria-hidden="true">✦</span>
                  <div>
                    <p className="stellar-credential__caption">{t('credentialCaption')}</p>
                    <h2 id="credential-title">{t('credentialTitle')}</h2>
                  </div>
                  <span className="stellar-credential__live">{t('credentialLive')}</span>
                </div>
                <p className="stellar-credential__status">{t('credentialNotIssued')}</p>
                {selectedGalaxyModules.length === 0 && selectedProfessionalProfiles.length === 0 ? (
                  <p className="stellar-credential__empty">{t('credentialEmpty')}</p>
                ) : (
                  <div className="stellar-credential__selections">
                    {selectedGalaxyModules.length > 0 && (
                      <div>
                        <h3>{t('credentialGalaxies')}</h3>
                        <ul>
                          {selectedGalaxyModules.map((module) => (
                            <li key={module.id}>
                              <span aria-hidden="true">{module.icon}</span>
                              {module.title[language]}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selectedProfessionalProfiles.length > 0 && (
                      <div>
                        <h3>{t('credentialProfiles')}</h3>
                        <ul>
                          {selectedProfessionalProfiles.map((profile) => (
                            <li key={profile.id}>{profile.label[language]}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </section>

              <p className="membership-panel__notice">{t('membershipPreviewNotice')}</p>
              <div className="membership-actions">
                <button className="threshold__submit" type="submit">
                  {t('saveMembership')}
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </form>
          </>
        )}

        {step === 3 && (
          <section className="membership-confirmation" aria-live="polite">
            <p className="membership-panel__step">{t('selectionSummary')}</p>
            <h1 id="threshold-title">{t('membershipTitle')}</h1>
            <p className="membership-confirmation__status">{t('membershipSaved')}</p>
            <h2>{t('galaxiesTitle')}</h2>
            <ul>
              {galaxyModules
                .filter((module) => selectedGalaxies.includes(module.id))
                .map((module) => (
                  <li key={module.id}>{module.title[language]}</li>
                ))}
            </ul>
            {selectedProfiles.length > 0 && (
              <>
                <h2>{t('professionalsTitle')}</h2>
                <ul>
                  {professionalProfiles.map((profile) =>
                    selectedProfiles.includes(profile.id) ? (
                      <li key={profile.id}>{profile.label[language]}</li>
                    ) : null,
                  )}
                </ul>
              </>
            )}
            <button className="membership-actions__back" onClick={() => setStep(2)} type="button">
              {t('editMembership')}
            </button>
          </section>
        )}

        <p className="membership-panel__status" role="status" aria-live="polite">
          {notice || (storageError ? t('membershipStorageError') : '')}
        </p>

        <Link className="threshold__back" href="/">
          {t('back')}
        </Link>
        <Link className="threshold__explore-preview" href="/inicio">
          {dashboardLabels.explore[language]}
        </Link>
      </section>

      <footer className="threshold__footer" aria-label="Glass World Studio">
        <span>GWS</span>
        <p>{t('tagline')}</p>
      </footer>
    </main>
  );
}
