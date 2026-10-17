'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';

import { ConvocatoriaFlyer } from '@/components/ConvocatoriaFlyer';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useLanguage } from '@/components/LanguageProvider';
import { dashboardLabels, dashboardModules } from '@/lib/dashboard';
import { getMessage } from '@/lib/i18n';
import {
  createMembershipPreferences,
  galaxyPathById,
  professionalProfileIds,
  readMembershipPreferences,
  saveMembershipPreferences,
} from '@/lib/membership';
import { membershipSpecialties, specialtyPillars } from '@/lib/specialties';

const galaxyModules = dashboardModules.filter((module) => module.category === 'galaxy');
const satelliteModules = dashboardModules.filter((module) => module.category === 'satellite');
const satelliteIds = satelliteModules.map((module) => module.id);
const specialtyIds = membershipSpecialties.map((specialty) => specialty.id);
const professionalModule = dashboardModules.find((module) => module.id === 'professionals');

if (!professionalModule) {
  throw new Error('The professional profile definitions are missing.');
}

const professionalProfiles = professionalModule.modules.map((label, index) => ({
  id: professionalProfileIds[index],
  label,
}));

export default function AccessThresholdPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedGalaxies, setSelectedGalaxies] = useState<string[]>([]);
  const [selectedSpecialtiesByGalaxy, setSelectedSpecialtiesByGalaxy] = useState<
    Record<string, string[]>
  >({});
  const [selectedSatellites, setSelectedSatellites] = useState<string[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [savedAvatar, setSavedAvatar] = useState<string | null>(null);
  const [activeGalaxyId, setActiveGalaxyId] = useState<string | null>(null);
  const [draftSpecialtyIds, setDraftSpecialtyIds] = useState<string[]>([]);
  const [notice, setNotice] = useState('');
  const [storageError, setStorageError] = useState(false);
  const galaxyDialogRef = useRef<HTMLElement>(null);
  const galaxyDialogCloseRef = useRef<HTMLButtonElement>(null);
  const galaxyTriggerRef = useRef<HTMLButtonElement | null>(null);
  const registrationIsValid =
    username.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    password.length >= 8 &&
    confirmPassword === password;

  useEffect(() => {
    try {
      const preferences = readMembershipPreferences();
      if (!preferences) {
        return;
      }

      setSelectedGalaxies(preferences.galaxies);
      setSelectedSpecialtiesByGalaxy(preferences.specialtiesByGalaxy);
      setSelectedSatellites(preferences.satellites);
      setSelectedProfiles(preferences.professionalProfiles);
      setSavedAvatar(preferences.avatar);
    } catch (error) {
      console.error('Unable to load saved membership preferences.', error);
      setStorageError(true);
    }
  }, []);

  useEffect(() => {
    if (!activeGalaxyId) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    galaxyDialogCloseRef.current?.focus();

    function handleDialogKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActiveGalaxyId(null);
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusable = galaxyDialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled])',
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

    document.addEventListener('keydown', handleDialogKeydown);
    return () => {
      document.removeEventListener('keydown', handleDialogKeydown);
      document.body.style.overflow = previousOverflow;
      galaxyTriggerRef.current?.focus();
    };
  }, [activeGalaxyId]);

  function toggleSelection(
    current: string[],
    setCurrent: (value: string[]) => void,
    id: string,
    selected: boolean,
  ) {
    setNotice('');
    setCurrent(selected ? [...current, id] : current.filter((item) => item !== id));
  }

  function openGalaxy(galaxyId: string, trigger: HTMLButtonElement) {
    galaxyTriggerRef.current = trigger;
    setDraftSpecialtyIds(selectedSpecialtiesByGalaxy[galaxyId] ?? []);
    setActiveGalaxyId(galaxyId);
  }

  function confirmGalaxy() {
    if (!activeGalaxyId) {
      return;
    }

    const galaxyId = activeGalaxyId;
    setSelectedGalaxies((current) =>
      current.includes(galaxyId) ? current : [...current, galaxyId],
    );
    setSelectedSpecialtiesByGalaxy((current) => ({
      ...current,
      [galaxyId]: draftSpecialtyIds,
    }));
    setNotice('');
    setActiveGalaxyId(null);
  }

  function removeGalaxy(galaxyId: string) {
    setSelectedGalaxies((current) => current.filter((id) => id !== galaxyId));
    setSelectedSpecialtiesByGalaxy((current) => {
      const { [galaxyId]: _removed, ...remaining } = current;
      return remaining;
    });
    setNotice('');
  }

  function continueRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!registrationIsValid) {
      return;
    }

    setNotice('');
    setStep(2);
  }

  function saveMembership(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedGalaxies.length === 0 && selectedProfiles.length === 0) {
      setNotice(getMessage(language, 'membershipRequired'));
      return;
    }

    try {
      saveMembershipPreferences(
        createMembershipPreferences({
          galaxies: selectedGalaxies,
          specialtiesByGalaxy: selectedSpecialtiesByGalaxy,
          satellites: selectedSatellites,
          professionalProfiles: selectedProfiles,
          avatar: savedAvatar,
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

  function finishMembership() {
    if (selectedGalaxies.length === 0 && selectedProfiles.length === 0) {
      setNotice(getMessage(language, 'membershipRequired'));
      return;
    }

    try {
      const preferences = createMembershipPreferences({
        galaxies: selectedGalaxies,
        specialtiesByGalaxy: selectedSpecialtiesByGalaxy,
        satellites: selectedSatellites,
        professionalProfiles: selectedProfiles,
        avatar: savedAvatar,
      });
      saveMembershipPreferences(preferences);

      const destination = preferences.assigned_galaxy_id
        ? galaxyPathById[preferences.assigned_galaxy_id]
        : '/professionals/dashboard';

      if (!destination) {
        throw new Error('The selected galaxy does not have a dashboard route.');
      }

      router.push(destination);
    } catch (error) {
      console.error('Unable to finalize membership preferences.', error);
      setNotice(getMessage(language, 'membershipStorageError'));
    }
  }

  function t(key: Parameters<typeof getMessage>[1]) {
    return getMessage(language, key);
  }

  const selectedGalaxyModules = galaxyModules.filter((module) => selectedGalaxies.includes(module.id));
  const selectedSpecialtyCount = Object.values(selectedSpecialtiesByGalaxy).reduce(
    (count, selectedIds) => count + selectedIds.length,
    0,
  );
  const activeGalaxy = galaxyModules.find((module) => module.id === activeGalaxyId);
  const selectedSatelliteModules = satelliteModules.filter((module) =>
    selectedSatellites.includes(module.id),
  );
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
        {step > 1 && (
          <p className="threshold__phase">
            {step === 2 ? t('membershipStep') : t('selectionSummary')}
          </p>
        )}

        {step === 1 && (
          <div className="threshold-registration">
            <div className="threshold-registration__content">
              <div className="threshold-registration__heading">
                <h1 id="threshold-title">{t('registrationTitle')}</h1>
                <p className="threshold__lead">{t('registrationIntro')}</p>
              </div>

              <form className="threshold-registration__form" onSubmit={continueRegistration}>
                <div className="threshold-registration__field">
                  <label htmlFor="registration-username">{t('username')}</label>
                  <input
                    autoComplete="username"
                    id="registration-username"
                    name="username"
                    onChange={(event) => setUsername(event.target.value)}
                    required
                    type="text"
                    value={username}
                  />
                </div>
                <div className="threshold-registration__field">
                  <label htmlFor="registration-email">{t('email')}</label>
                  <input
                    autoComplete="email"
                    id="registration-email"
                    name="email"
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    type="email"
                    value={email}
                  />
                </div>
                <div className="threshold-registration__field">
                  <label htmlFor="registration-password">{t('password')}</label>
                  <input
                    autoComplete="new-password"
                    id="registration-password"
                    minLength={8}
                    name="password"
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    type="password"
                    value={password}
                  />
                  <small>{t('passwordHint')}</small>
                </div>
                <div className="threshold-registration__field">
                  <label htmlFor="registration-confirm-password">{t('confirmPassword')}</label>
                  <input
                    autoComplete="new-password"
                    id="registration-confirm-password"
                    name="confirmPassword"
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    type="password"
                    value={confirmPassword}
                    aria-invalid={confirmPassword.length > 0 && confirmPassword !== password}
                  />
                  {confirmPassword.length > 0 && confirmPassword !== password && (
                    <small className="threshold-registration__error" role="alert">
                      {t('passwordMismatch')}
                    </small>
                  )}
                </div>
                <p className="threshold-registration__note">{t('registrationPreviewNotice')}</p>
                <button
                  className="threshold__submit threshold-registration__submit"
                  disabled={!registrationIsValid}
                  type="submit"
                >
                  {t('continueToGalaxies')}
                  <span aria-hidden="true">→</span>
                </button>
              </form>
            </div>
            <ConvocatoriaFlyer variant="threshold" />
          </div>
        )}

        {step === 2 && (
          <>
            <h1 id="threshold-title">{t('galaxyQuestion')}</h1>
            <p className="threshold__lead">{t('membershipIntro')}</p>

            <form className="membership-form" onSubmit={saveMembership}>
              <fieldset className="membership-group">
                <legend>{t('galaxiesTitle')}</legend>
                <p className="membership-group__hint">{t('galaxiesHint')}</p>
                <div className="membership-galaxy-grid">
                  {galaxyModules.map((module) => {
                    const selectedSpecialties = membershipSpecialties.filter((specialty) =>
                      selectedSpecialtiesByGalaxy[module.id]?.includes(specialty.id),
                    );
                    const isSelected = selectedGalaxies.includes(module.id);

                    return (
                      <article
                        className={`membership-galaxy-card${isSelected ? ' is-selected' : ''}`}
                        key={module.id}
                      >
                        <button
                          aria-expanded={activeGalaxyId === module.id}
                          aria-haspopup="dialog"
                          className="membership-galaxy-card__open"
                          onClick={(event) => openGalaxy(module.id, event.currentTarget)}
                          type="button"
                        >
                          <span className="membership-galaxy-card__topline">
                            {isSelected && (
                              <span className="membership-galaxy-card__selected">
                                {t('galaxySelected')}
                              </span>
                            )}
                          </span>
                          <span className="membership-galaxy-card__title">
                            {module.title[language]}
                          </span>
                          <span className="membership-galaxy-card__description">
                            {module.description[language]}
                          </span>
                          <span className="membership-galaxy-card__action">
                            {isSelected ? t('backChange') : t('openSpecialties')}
                            <span aria-hidden="true">↗</span>
                          </span>
                          {selectedSpecialties.length > 0 && (
                            <span className="membership-galaxy-card__specialties">
                              {selectedSpecialties.map((specialty) => (
                                <span key={specialty.id}>{specialty.name[language]}</span>
                              ))}
                            </span>
                          )}
                        </button>
                        {isSelected && (
                          <button
                            aria-label={`${t('removeGalaxy')} ${module.title[language]}`}
                            className="membership-galaxy-card__remove"
                            onClick={() => removeGalaxy(module.id)}
                            type="button"
                          >
                            ×
                          </button>
                        )}
                      </article>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className="membership-group">
                <legend>{t('satellitesTitle')}</legend>
                <p className="membership-group__hint">{t('satellitesHint')}</p>
                <div className="membership-options">
                  {satelliteModules.map((module) => (
                    <label className="membership-option" key={module.id}>
                      <input
                        checked={selectedSatellites.includes(module.id)}
                        onChange={(event) =>
                          toggleSelection(
                            selectedSatellites,
                            setSelectedSatellites,
                            module.id,
                            event.target.checked,
                          )
                        }
                        type="checkbox"
                        value={module.id}
                      />
                      <span className="membership-option__icon" aria-hidden="true">
                        {module.title[language].slice(0, 1)}
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
                  <div>
                    <p className="stellar-credential__caption">{t('credentialCaption')}</p>
                    <h2 id="credential-title">{t('credentialTitle')}</h2>
                  </div>
                  <span className="stellar-credential__live">{t('credentialLive')}</span>
                </div>
                <p className="stellar-credential__status">{t('credentialNotIssued')}</p>
                {selectedGalaxyModules.length === 0 &&
                selectedSatelliteModules.length === 0 &&
                selectedSpecialtyCount === 0 &&
                selectedProfessionalProfiles.length === 0 ? (
                  <p className="stellar-credential__empty">{t('credentialEmpty')}</p>
                ) : (
                  <div className="stellar-credential__selections">
                    {selectedGalaxyModules.length > 0 && (
                      <div>
                        <h3>{t('credentialGalaxies')}</h3>
                        <ul>
                          {selectedGalaxyModules.map((module) => (
                            <li key={module.id}>
                              {module.title[language]}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selectedGalaxyModules.some(
                      (module) => selectedSpecialtiesByGalaxy[module.id]?.length,
                    ) && (
                      <div className="stellar-credential__specialties">
                        <h3>{t('credentialSpecialties')}</h3>
                        {selectedGalaxyModules.map((module) => {
                          const specialties = membershipSpecialties.filter((specialty) =>
                            selectedSpecialtiesByGalaxy[module.id]?.includes(specialty.id),
                          );
                          if (specialties.length === 0) {
                            return null;
                          }

                          return (
                            <div key={module.id}>
                              <p>{module.title[language]}</p>
                              <ul>
                                {specialties.map((specialty) => (
                                  <li key={specialty.id}>{specialty.name[language]}</li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {selectedSatelliteModules.length > 0 && (
                      <div>
                        <h3>{t('credentialSatellites')}</h3>
                        <ul>
                          {selectedSatelliteModules.map((module) => (
                            <li key={module.id}>
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
                <button
                  className="membership-actions__back"
                  onClick={() => setStep(1)}
                  type="button"
                >
                  {t('backToIdentity')}
                </button>
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
            {selectedSpecialtyCount > 0 && (
              <>
                <h2>{t('credentialSpecialties')}</h2>
                {selectedGalaxyModules.map((module) => {
                  const specialties = membershipSpecialties.filter((specialty) =>
                    selectedSpecialtiesByGalaxy[module.id]?.includes(specialty.id),
                  );
                  if (specialties.length === 0) {
                    return null;
                  }

                  return (
                    <div className="membership-confirmation__specialties" key={module.id}>
                      <h3>{module.title[language]}</h3>
                      <ul>
                        {specialties.map((specialty) => (
                          <li key={specialty.id}>{specialty.name[language]}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </>
            )}
            {selectedSatellites.length > 0 && (
              <>
                <h2>{t('satellitesTitle')}</h2>
                <ul>
                  {satelliteModules
                    .filter((module) => selectedSatellites.includes(module.id))
                    .map((module) => (
                      <li key={module.id}>{module.title[language]}</li>
                    ))}
                </ul>
              </>
            )}
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
            <div className="membership-actions">
              <button className="membership-actions__back" onClick={() => setStep(2)} type="button">
                {t('editMembership')}
              </button>
              <button className="threshold__submit" onClick={finishMembership} type="button">
                {t('finishMembership')}
                <span aria-hidden="true">→</span>
              </button>
            </div>
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

      {activeGalaxy && (
        <div
          className="galaxy-dialog-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setActiveGalaxyId(null);
            }
          }}
          role="presentation"
        >
          <section
            aria-labelledby="galaxy-dialog-title"
            aria-modal="true"
            className="galaxy-dialog"
            ref={galaxyDialogRef}
            role="dialog"
          >
            <header className="galaxy-dialog__header">
              <div className="galaxy-dialog__identity">
                <div>
                  <p className="galaxy-dialog__eyebrow">{activeGalaxy.title[language]}</p>
                  <h2 id="galaxy-dialog-title">{t('specialtiesTitle')}</h2>
                </div>
              </div>
              <button
                aria-label={t('backChange')}
                className="galaxy-dialog__close"
                onClick={() => setActiveGalaxyId(null)}
                ref={galaxyDialogCloseRef}
                type="button"
              >
                ×
              </button>
            </header>
            <p className="membership-group__hint">{t('specialtiesHint')}</p>
            <div className="galaxy-dialog__groups">
              {specialtyPillars.map((pillar) => (
                <fieldset className="galaxy-dialog__group" key={pillar.id}>
                  <legend>{t(pillar.labelKey)}</legend>
                  <div className="galaxy-dialog__options">
                    {membershipSpecialties
                      .filter((specialty) => specialty.pillar === pillar.id)
                      .map((specialty) => (
                        <label className="specialty-option" key={specialty.id}>
                          <input
                            checked={draftSpecialtyIds.includes(specialty.id)}
                            onChange={(event) =>
                              setDraftSpecialtyIds((current) =>
                                event.target.checked
                                  ? [...current, specialty.id]
                                  : current.filter((id) => id !== specialty.id),
                              )
                            }
                            type="checkbox"
                            value={specialty.id}
                          />
                          <span>{specialty.name[language]}</span>
                        </label>
                      ))}
                  </div>
                </fieldset>
              ))}
            </div>
            <footer className="galaxy-dialog__actions">
              <button
                className="membership-actions__back"
                onClick={() => setActiveGalaxyId(null)}
                type="button"
              >
                {t('backChange')}
              </button>
              <button className="threshold__submit" onClick={confirmGalaxy} type="button">
                {t('confirmGalaxy')}
                <span aria-hidden="true">→</span>
              </button>
            </footer>
          </section>
        </div>
      )}

      <footer className="threshold__footer" aria-label="Glass World Studio">
        <span>GWS</span>
        <p>{t('tagline')}</p>
      </footer>
    </main>
  );
}
