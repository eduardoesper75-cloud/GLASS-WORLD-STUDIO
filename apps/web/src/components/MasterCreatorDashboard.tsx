'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';

import { LanguageSelector } from '@/components/LanguageSelector';
import { useLanguage } from '@/components/LanguageProvider';
import { readMembershipPreferences } from '@/lib/membership';
import {
  emptyMasterProfile,
  masterProductStorageKey,
  parseMasterCreatorData,
  type ArtworkProduct,
  type EducationFormat,
  type EducationProduct,
  type MasterCreatorData,
  type MasterProduct,
  type MasterProfile,
  type ProductCategory,
  type ProductStatus,
  type ServiceProduct,
  type TechnicalService,
  type ToolProduct,
} from '@/types/master-product';

type CreatorTab = 'profile' | ProductCategory;

interface ProductDraft {
  title: string;
  description: string;
  price: string;
  currency: string;
  format: EducationFormat;
  level: 'beginner' | 'intermediate' | 'advanced';
  resourceUrl: string;
  stock: string;
  weightKg: string;
  dimensionsCm: string;
  careInstructions: string;
  technique: string;
  creationYear: string;
  certificateUrl: string;
  imageUrls: string;
  serviceType: TechnicalService;
  durationHours: string;
  availability: string;
  quoteRequired: boolean;
  status: ProductStatus;
}

const emptyProductDraft: ProductDraft = {
  title: '',
  description: '',
  price: '',
  currency: 'USD',
  format: 'course',
  level: 'beginner',
  resourceUrl: '',
  stock: '',
  weightKg: '',
  dimensionsCm: '',
  careInstructions: '',
  technique: '',
  creationYear: String(new Date().getFullYear()),
  certificateUrl: '',
  imageUrls: '',
  serviceType: 'consulting',
  durationHours: '',
  availability: '',
  quoteRequired: false,
  status: 'draft',
};

const tabs: { id: CreatorTab; label: string }[] = [
  { id: 'profile', label: 'Perfil' },
  { id: 'education', label: 'Cursos y contenidos' },
  { id: 'tools', label: 'Herramientas e insumos' },
  { id: 'artwork', label: 'Arte y piezas' },
  { id: 'services', label: 'Servicios técnicos' },
];

const currencyOptions = ['USD', 'ARS', 'EUR', 'BRL', 'CLP', 'MXN'];

function createProductId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `master-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function readStoredCreatorData(): MasterCreatorData {
  const stored = window.localStorage.getItem(masterProductStorageKey);
  if (!stored) {
    return { profile: emptyMasterProfile, products: [] };
  }

  return parseMasterCreatorData(JSON.parse(stored));
}

function persistCreatorData(data: MasterCreatorData) {
  window.localStorage.setItem(masterProductStorageKey, JSON.stringify(data));
}

export function MasterCreatorDashboard() {
  const { language } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<CreatorTab>('profile');
  const [creatorData, setCreatorData] = useState<MasterCreatorData | null>(null);
  const [profileDraft, setProfileDraft] = useState<MasterProfile>(emptyMasterProfile);
  const [productDraft, setProductDraft] = useState<ProductDraft>(emptyProductDraft);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('M');

  useEffect(() => {
    try {
      const membership = readMembershipPreferences();
      if (!membership?.galaxies.includes('masters')) {
        setRedirecting(true);
        router.replace('/umbral');
        return;
      }

      setSelectedAvatar(membership.avatar ?? 'M');
      const data = readStoredCreatorData();
      setCreatorData(data);
      setProfileDraft(data.profile);
    } catch (error) {
      console.error('Unable to load the master creator dashboard.', error);
      setFormError('No se pudo leer el perfil o catálogo guardado en este dispositivo.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  function updateProfile<K extends keyof MasterProfile>(key: K, value: MasterProfile[K]) {
    setProfileDraft((current) => ({ ...current, [key]: value }));
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!creatorData) {
      return;
    }

    const yearsExperience = profileDraft.yearsExperience;
    const pitchVideoSeconds = profileDraft.pitchVideoSeconds;
    if (yearsExperience !== null && yearsExperience < 0) {
      setFormError('Los años de trayectoria no pueden ser negativos.');
      return;
    }
    if (pitchVideoSeconds !== null && (pitchVideoSeconds < 0 || pitchVideoSeconds > 10)) {
      setFormError('El pitch de presentación debe durar como máximo 10 segundos.');
      return;
    }

    try {
      const nextData = { ...creatorData, profile: profileDraft };
      persistCreatorData(nextData);
      setCreatorData(nextData);
      setFormError('');
      setFormMessage('Perfil de Maestro guardado en este dispositivo.');
    } catch (error) {
      console.error('Unable to save the master profile.', error);
      setFormError('No se pudo guardar el perfil localmente. Revisa el espacio disponible.');
      setFormMessage('');
    }
  }

  function updateProduct<K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) {
    setProductDraft((current) => ({ ...current, [key]: value }));
  }

  function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!creatorData || activeTab === 'profile') {
      return;
    }

    const base = {
      id: editingProductId ?? createProductId(),
      title: productDraft.title.trim(),
      description: productDraft.description.trim(),
      price: Number(productDraft.price),
      currency: productDraft.currency,
      status: productDraft.status,
      createdAt:
        creatorData.products.find((existing) => existing.id === editingProductId)?.createdAt ??
        new Date().toISOString(),
    };

    let product: MasterProduct;
    if (activeTab === 'education') {
      product = {
        ...base,
        category: 'education',
        format: productDraft.format,
        level: productDraft.level,
        resourceUrl: productDraft.resourceUrl.trim(),
      } satisfies EducationProduct;
    } else if (activeTab === 'tools') {
      product = {
        ...base,
        category: 'tools',
        stock: Number(productDraft.stock),
        weightKg: Number(productDraft.weightKg),
        dimensionsCm: productDraft.dimensionsCm.trim(),
        careInstructions: productDraft.careInstructions.trim(),
      } satisfies ToolProduct;
    } else if (activeTab === 'artwork') {
      product = {
        ...base,
        category: 'artwork',
        technique: productDraft.technique.trim(),
        dimensionsCm: productDraft.dimensionsCm.trim(),
        weightKg: Number(productDraft.weightKg),
        creationYear: Number(productDraft.creationYear),
        certificateUrl: productDraft.certificateUrl.trim(),
        imageUrls: productDraft.imageUrls
          .split(/\r?\n/)
          .map((url) => url.trim())
          .filter(Boolean),
      } satisfies ArtworkProduct;
    } else {
      product = {
        ...base,
        category: 'services',
        serviceType: productDraft.serviceType,
        durationHours: productDraft.durationHours ? Number(productDraft.durationHours) : null,
        availability: productDraft.availability.trim(),
        quoteRequired: productDraft.quoteRequired,
      } satisfies ServiceProduct;
    }

    try {
      const nextData = {
        ...creatorData,
        products: editingProductId
          ? creatorData.products.map((existing) =>
              existing.id === editingProductId ? product : existing,
            )
          : [product, ...creatorData.products],
      };
      persistCreatorData(nextData);
      setCreatorData(nextData);
      setProductDraft(emptyProductDraft);
      setEditingProductId(null);
      setFormError('');
      setFormMessage(editingProductId ? 'Publicación actualizada.' : (
        product.status === 'published'
          ? 'Publicación añadida a tu catálogo local.'
          : 'Borrador guardado en tu catálogo local.'
      ));
    } catch (error) {
      console.error('Unable to save the master product.', error);
      setFormError('No se pudo guardar la publicación localmente. Revisa el espacio disponible.');
      setFormMessage('');
    }
  }

  function editProduct(product: MasterProduct) {
    setActiveTab(product.category);
    setEditingProductId(product.id);
    setProductDraft({
      ...emptyProductDraft,
      title: product.title,
      description: product.description,
      price: String(product.price),
      currency: product.currency,
      status: product.status,
      ...(product.category === 'education'
        ? {
            format: product.format,
            level: product.level,
            resourceUrl: product.resourceUrl,
          }
        : {}),
      ...(product.category === 'tools'
        ? {
            stock: String(product.stock),
            weightKg: String(product.weightKg),
            dimensionsCm: product.dimensionsCm,
            careInstructions: product.careInstructions,
          }
        : {}),
      ...(product.category === 'artwork'
        ? {
            technique: product.technique,
            dimensionsCm: product.dimensionsCm,
            weightKg: String(product.weightKg),
            creationYear: String(product.creationYear),
            certificateUrl: product.certificateUrl,
            imageUrls: product.imageUrls.join('\n'),
          }
        : {}),
      ...(product.category === 'services'
        ? {
            serviceType: product.serviceType,
            durationHours: product.durationHours === null ? '' : String(product.durationHours),
            availability: product.availability,
            quoteRequired: product.quoteRequired,
          }
        : {}),
    });
    setFormError('');
    setFormMessage(`Editando «${product.title}».`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function deleteProduct(productId: string) {
    if (!creatorData) {
      return;
    }

    try {
      const nextData = {
        ...creatorData,
        products: creatorData.products.filter((product) => product.id !== productId),
      };
      persistCreatorData(nextData);
      setCreatorData(nextData);
      setFormError('');
      setFormMessage('Publicación eliminada del catálogo local.');
    } catch (error) {
      console.error('Unable to delete the master product.', error);
      setFormError('No se pudo actualizar el catálogo local.');
      setFormMessage('');
    }
  }

  if (loading || redirecting) {
    return <main className="galaxy-one galaxy-one--loading" aria-busy="true" />;
  }

  if (!creatorData) {
    return (
      <main className="creator-dashboard creator-dashboard--error" lang={language}>
        <p role="alert">{formError || 'No se pudo cargar el catálogo local.'}</p>
        <Link href="/galaxy/1-maestros">Volver a Galaxia 1</Link>
      </main>
    );
  }

  const tabProducts = activeTab === 'profile'
    ? []
    : creatorData.products.filter((product) => product.category === activeTab);

  return (
    <main className="creator-dashboard" lang={language}>
      <div className="galaxy-one__stars" aria-hidden="true" />
      <aside className="creator-dashboard__sidebar">
        <Link className="galaxy-one__brand" href="/galaxy/1-maestros">
          <span aria-hidden="true">G</span>
          <strong>GLASS WORLD<br />STUDIO</strong>
        </Link>
        <p className="galaxy-one__sidebar-label">Galaxia de Maestros</p>
        <nav className="creator-dashboard__nav" aria-label="Secciones del panel">
          {tabs.map((tab) => (
            <button
              aria-current={activeTab === tab.id ? 'page' : undefined}
              className={activeTab === tab.id ? 'is-active' : ''}
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setEditingProductId(null);
                setProductDraft(emptyProductDraft);
                setFormMessage('');
                setFormError('');
              }}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <Link className="creator-dashboard__back" href="/galaxy/1-maestros">
          ← Volver al hub
        </Link>
      </aside>

      <section className="creator-dashboard__main">
        <header className="creator-dashboard__header">
          <div>
            <p className="galaxy-one__eyebrow">Estudio de creación · Galaxia 1</p>
            <h1>Panel del Maestro</h1>
            <p>Configura tu perfil y gestiona el catálogo de tu taller.</p>
          </div>
          <div className="creator-dashboard__header-tools">
            <span className="galaxy-one__avatar" aria-label="Avatar de perfil">{selectedAvatar}</span>
            <LanguageSelector />
          </div>
        </header>

        <div className="creator-dashboard__notice" role="note">
          El perfil y el catálogo se guardan solo en este dispositivo. Las publicaciones no se envían
          ni se ofrecen en un marketplace hasta conectar la persistencia de GWS.
        </div>

        <nav className="creator-dashboard__mobile-tabs" aria-label="Secciones">
          {tabs.map((tab) => (
            <button
              aria-current={activeTab === tab.id ? 'page' : undefined}
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setEditingProductId(null);
                setProductDraft(emptyProductDraft);
                setFormMessage('');
                setFormError('');
              }}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === 'profile' ? (
          <form className="creator-panel" onSubmit={saveProfile}>
            <div className="creator-panel__heading">
              <div>
                <p className="galaxy-one__eyebrow">Identidad profesional</p>
                <h2>Perfil y credenciales</h2>
              </div>
              <span className="creator-panel__avatar" aria-hidden="true">{selectedAvatar}</span>
            </div>

            {profileDraft.photoUrl && (
              <img
                alt="Vista previa de la foto de perfil"
                className="creator-panel__photo-preview"
                src={profileDraft.photoUrl}
              />
            )}

            <div className="creator-form-grid">
              <label className="creator-field">
                <span>Nombre público del Maestro *</span>
                <input
                  autoComplete="name"
                  maxLength={100}
                  onChange={(event) => updateProfile('name', event.target.value)}
                  required
                  value={profileDraft.name}
                />
              </label>
              <label className="creator-field">
                <span>Ubicación</span>
                <input
                  autoComplete="address-level2"
                  maxLength={120}
                  onChange={(event) => updateProfile('location', event.target.value)}
                  value={profileDraft.location}
                />
              </label>
              <label className="creator-field creator-field--full">
                <span>Biografía profesional *</span>
                <textarea
                  maxLength={3000}
                  onChange={(event) => updateProfile('biography', event.target.value)}
                  required
                  rows={5}
                  value={profileDraft.biography}
                />
              </label>
              <label className="creator-field">
                <span>Años de trayectoria</span>
                <input
                  min="0"
                  onChange={(event) =>
                    updateProfile('yearsExperience', event.target.value ? Number(event.target.value) : null)
                  }
                  type="number"
                  value={profileDraft.yearsExperience ?? ''}
                />
              </label>
              <label className="creator-field">
                <span>Discípulo/a de · Escuela de referencia</span>
                <input
                  maxLength={180}
                  onChange={(event) => updateProfile('mentorOrSchool', event.target.value)}
                  value={profileDraft.mentorOrSchool}
                />
              </label>
              <label className="creator-field creator-field--full">
                <span>Foto de perfil · URL de recurso propio</span>
                <input
                  onChange={(event) => updateProfile('photoUrl', event.target.value)}
                  placeholder="https://… o /recursos/mi-retrato"
                  type="url"
                  value={profileDraft.photoUrl}
                />
              </label>
              <label className="creator-field">
                <span>Pitch de presentación · enlace</span>
                <input
                  onChange={(event) => updateProfile('pitchVideoUrl', event.target.value)}
                  placeholder="Enlace al recurso de presentación"
                  type="url"
                  value={profileDraft.pitchVideoUrl}
                />
              </label>
              <label className="creator-field">
                <span>Duración del pitch (máximo 10 s)</span>
                <input
                  max="10"
                  min="0"
                  onChange={(event) =>
                    updateProfile('pitchVideoSeconds', event.target.value ? Number(event.target.value) : null)
                  }
                  type="number"
                  value={profileDraft.pitchVideoSeconds ?? ''}
                />
              </label>
              <label className="creator-field">
                <span>Sitio web personal</span>
                <input
                  onChange={(event) => updateProfile('websiteUrl', event.target.value)}
                  type="url"
                  value={profileDraft.websiteUrl}
                />
              </label>
              <label className="creator-field">
                <span>Portfolio de referencia</span>
                <input
                  onChange={(event) => updateProfile('portfolioUrl', event.target.value)}
                  type="url"
                  value={profileDraft.portfolioUrl}
                />
              </label>
              <label className="creator-field creator-field--full">
                <span>Redes sociales · un enlace por línea</span>
                <textarea
                  onChange={(event) =>
                    updateProfile(
                      'socialLinks',
                      event.target.value.split(/\r?\n/).map((url) => url.trim()).filter(Boolean),
                    )
                  }
                  placeholder="https://…"
                  rows={3}
                  value={profileDraft.socialLinks.join('\n')}
                />
              </label>
            </div>
            <div className="creator-panel__actions">
              <button className="creator-button" type="submit">Guardar perfil</button>
            </div>
          </form>
        ) : (
          <div className="creator-products-layout">
            <form className="creator-panel" onSubmit={submitProduct}>
              <div className="creator-panel__heading">
                <div>
                  <p className="galaxy-one__eyebrow">Catálogo del taller</p>
                  <h2>{tabs.find((tab) => tab.id === activeTab)?.label}</h2>
                </div>
              </div>

              <div className="creator-form-grid">
                <label className="creator-field creator-field--full">
                  <span>Título *</span>
                  <input
                    maxLength={160}
                    onChange={(event) => updateProduct('title', event.target.value)}
                    required
                    value={productDraft.title}
                  />
                </label>
                <label className="creator-field creator-field--full">
                  <span>Descripción *</span>
                  <textarea
                    maxLength={3000}
                    onChange={(event) => updateProduct('description', event.target.value)}
                    required
                    rows={4}
                    value={productDraft.description}
                  />
                </label>
                <label className="creator-field">
                  <span>Precio *</span>
                  <input
                    min="0"
                    onChange={(event) => updateProduct('price', event.target.value)}
                    required
                    step="0.01"
                    type="number"
                    value={productDraft.price}
                  />
                </label>
                <label className="creator-field">
                  <span>Moneda</span>
                  <select
                    onChange={(event) => updateProduct('currency', event.target.value)}
                    value={productDraft.currency}
                  >
                    {currencyOptions.map((currency) => <option key={currency}>{currency}</option>)}
                  </select>
                </label>

                {activeTab === 'education' && (
                  <>
                    <label className="creator-field">
                      <span>Formato</span>
                      <select
                        onChange={(event) => updateProduct('format', event.target.value as EducationFormat)}
                        value={productDraft.format}
                      >
                        <option value="course">Clase o curso grabado</option>
                        <option value="document">Documento o guía técnica</option>
                        <option value="book">Bibliografía propia</option>
                      </select>
                    </label>
                    <label className="creator-field">
                      <span>Nivel</span>
                      <select
                        onChange={(event) =>
                          updateProduct('level', event.target.value as ProductDraft['level'])
                        }
                        value={productDraft.level}
                      >
                        <option value="beginner">Principiante</option>
                        <option value="intermediate">Intermedio</option>
                        <option value="advanced">Avanzado</option>
                      </select>
                    </label>
                    <label className="creator-field creator-field--full">
                      <span>Recurso propio · URL</span>
                      <input
                        onChange={(event) => updateProduct('resourceUrl', event.target.value)}
                        placeholder="https://…"
                        type="url"
                        value={productDraft.resourceUrl}
                      />
                    </label>
                  </>
                )}

                {activeTab === 'tools' && (
                  <>
                    <label className="creator-field">
                      <span>Stock disponible *</span>
                      <input
                        min="0"
                        onChange={(event) => updateProduct('stock', event.target.value)}
                        required
                        step="1"
                        type="number"
                        value={productDraft.stock}
                      />
                    </label>
                    <label className="creator-field">
                      <span>Peso (kg) *</span>
                      <input
                        min="0"
                        onChange={(event) => updateProduct('weightKg', event.target.value)}
                        required
                        step="0.01"
                        type="number"
                        value={productDraft.weightKg}
                      />
                    </label>
                    <label className="creator-field">
                      <span>Dimensiones (cm) *</span>
                      <input
                        onChange={(event) => updateProduct('dimensionsCm', event.target.value)}
                        placeholder="Largo × ancho × alto"
                        required
                        value={productDraft.dimensionsCm}
                      />
                    </label>
                    <label className="creator-field creator-field--full">
                      <span>Conservación e instrucciones de uso *</span>
                      <textarea
                        onChange={(event) => updateProduct('careInstructions', event.target.value)}
                        required
                        rows={3}
                        value={productDraft.careInstructions}
                      />
                    </label>
                  </>
                )}

                {activeTab === 'artwork' && (
                  <>
                    <label className="creator-field">
                      <span>Técnica *</span>
                      <input
                        onChange={(event) => updateProduct('technique', event.target.value)}
                        placeholder="Vitrofusión, soplado, Graal…"
                        required
                        value={productDraft.technique}
                      />
                    </label>
                    <label className="creator-field">
                      <span>Año de creación *</span>
                      <input
                        max={new Date().getFullYear()}
                        min="0"
                        onChange={(event) => updateProduct('creationYear', event.target.value)}
                        required
                        type="number"
                        value={productDraft.creationYear}
                      />
                    </label>
                    <label className="creator-field">
                      <span>Dimensiones (cm) *</span>
                      <input
                        onChange={(event) => updateProduct('dimensionsCm', event.target.value)}
                        placeholder="Alto × ancho × profundidad"
                        required
                        value={productDraft.dimensionsCm}
                      />
                    </label>
                    <label className="creator-field">
                      <span>Peso (kg) *</span>
                      <input
                        min="0"
                        onChange={(event) => updateProduct('weightKg', event.target.value)}
                        required
                        step="0.01"
                        type="number"
                        value={productDraft.weightKg}
                      />
                    </label>
                    <label className="creator-field creator-field--full">
                      <span>Certificado de autenticidad · recurso</span>
                      <input
                        onChange={(event) => updateProduct('certificateUrl', event.target.value)}
                        placeholder="URL o ruta interna al certificado firmado"
                        type="url"
                        value={productDraft.certificateUrl}
                      />
                    </label>
                    <label className="creator-field creator-field--full">
                      <span>Galería de imágenes · una URL por línea</span>
                      <textarea
                        onChange={(event) => updateProduct('imageUrls', event.target.value)}
                        placeholder="Una ruta o enlace de imagen por ángulo"
                        rows={4}
                        value={productDraft.imageUrls}
                      />
                    </label>
                  </>
                )}

                {activeTab === 'services' && (
                  <>
                    <label className="creator-field">
                      <span>Tipo de servicio</span>
                      <select
                        onChange={(event) =>
                          updateProduct('serviceType', event.target.value as TechnicalService)
                        }
                        value={productDraft.serviceType}
                      >
                        <option value="consulting">Asesoría o tutoría 1 a 1</option>
                        <option value="restoration">Restauración</option>
                        <option value="commission">Encargo especial</option>
                      </select>
                    </label>
                    <label className="creator-field">
                      <span>Duración (horas, opcional)</span>
                      <input
                        min="0.5"
                        onChange={(event) => updateProduct('durationHours', event.target.value)}
                        step="0.5"
                        type="number"
                        value={productDraft.durationHours}
                      />
                    </label>
                    <label className="creator-field creator-field--full">
                      <span>Disponibilidad / agenda</span>
                      <input
                        onChange={(event) => updateProduct('availability', event.target.value)}
                        placeholder="Días, horario o disponibilidad a coordinar"
                        value={productDraft.availability}
                      />
                    </label>
                    <label className="creator-field creator-field--check">
                      <input
                        checked={productDraft.quoteRequired}
                        onChange={(event) => updateProduct('quoteRequired', event.target.checked)}
                        type="checkbox"
                      />
                      <span>Requiere cotización previa</span>
                    </label>
                  </>
                )}
              </div>

              <label className="creator-field creator-field--status">
                <span>Visibilidad en el catálogo local</span>
                <select
                  onChange={(event) => updateProduct('status', event.target.value as ProductStatus)}
                  value={productDraft.status}
                >
                  <option value="draft">Guardar como borrador</option>
                  <option value="published">Mostrar en mi catálogo local</option>
                </select>
              </label>
              <div className="creator-panel__actions">
                {editingProductId && (
                  <button
                    className="creator-dashboard__cancel-edit"
                    onClick={() => {
                      setEditingProductId(null);
                      setProductDraft(emptyProductDraft);
                      setFormMessage('');
                    }}
                    type="button"
                  >
                    Cancelar edición
                  </button>
                )}
                <button className="creator-button" type="submit">
                  {editingProductId ? 'Actualizar publicación' : 'Guardar publicación'}
                </button>
              </div>
            </form>

            <section className="creator-inventory" aria-labelledby="creator-inventory-title">
              <header>
                <div>
                  <p className="galaxy-one__eyebrow">GESTIÓN DE INVENTARIO</p>
                  <h2 id="creator-inventory-title">Tus publicaciones</h2>
                </div>
                <span>{tabProducts.length}</span>
              </header>
              {tabProducts.length === 0 ? (
                <p className="creator-inventory__empty">Todavía no hay publicaciones en esta categoría.</p>
              ) : (
                <ul className="creator-inventory__list">
                  {tabProducts.map((product) => (
                    <li className="creator-inventory__item" key={product.id}>
                      <div>
                        <span className={`creator-inventory__status creator-inventory__status--${product.status}`}>
                          {product.status === 'published' ? 'Catálogo local' : 'Borrador'}
                        </span>
                        <h3>{product.title}</h3>
                        <p>{product.description}</p>
                        <strong>{product.currency} {product.price.toFixed(2)}</strong>
                        {product.category === 'tools' && <small> · Stock: {product.stock}</small>}
                        {product.category === 'artwork' && <small> · {product.technique} · {product.creationYear}</small>}
                      </div>
                      <div className="creator-inventory__actions">
                        <button
                          aria-label={`Editar ${product.title}`}
                          className="creator-inventory__edit"
                          onClick={() => editProduct(product)}
                          type="button"
                        >
                          Editar
                        </button>
                        <button
                          aria-label={`Eliminar ${product.title}`}
                          className="creator-inventory__delete"
                          onClick={() => deleteProduct(product.id)}
                          type="button"
                        >
                          Eliminar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}

        <p
          className={`creator-dashboard__message${formError ? ' is-error' : ''}`}
          role={formError ? 'alert' : 'status'}
          aria-live={formError ? 'assertive' : 'polite'}
        >
          {formError || formMessage}
        </p>
      </section>
    </main>
  );
}
