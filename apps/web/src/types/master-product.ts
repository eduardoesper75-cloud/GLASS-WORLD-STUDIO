export type ProductCategory = 'education' | 'tools' | 'artwork' | 'services';
export type ProductStatus = 'draft' | 'published';
export type EducationFormat = 'course' | 'document' | 'book';
export type TechnicalService = 'consulting' | 'restoration' | 'commission';

export interface MasterProfile {
  name: string;
  biography: string;
  yearsExperience: number | null;
  mentorOrSchool: string;
  location: string;
  photoUrl: string;
  pitchVideoUrl: string;
  pitchVideoSeconds: number | null;
  socialLinks: string[];
  websiteUrl: string;
  portfolioUrl: string;
}

export interface ProductBase {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  status: ProductStatus;
  createdAt: string;
}

export interface EducationProduct extends ProductBase {
  category: 'education';
  format: EducationFormat;
  level: 'beginner' | 'intermediate' | 'advanced';
  resourceUrl: string;
}

export interface ToolProduct extends ProductBase {
  category: 'tools';
  stock: number;
  weightKg: number;
  dimensionsCm: string;
  careInstructions: string;
}

export interface ArtworkProduct extends ProductBase {
  category: 'artwork';
  technique: string;
  dimensionsCm: string;
  weightKg: number;
  creationYear: number;
  certificateUrl: string;
  imageUrls: string[];
}

export interface ServiceProduct extends ProductBase {
  category: 'services';
  serviceType: TechnicalService;
  durationHours: number | null;
  availability: string;
  quoteRequired: boolean;
}

export type MasterProduct =
  | EducationProduct
  | ToolProduct
  | ArtworkProduct
  | ServiceProduct;

export interface MasterCreatorData {
  profile: MasterProfile;
  products: MasterProduct[];
}

export const emptyMasterProfile: MasterProfile = {
  name: '',
  biography: '',
  yearsExperience: null,
  mentorOrSchool: '',
  location: '',
  photoUrl: '',
  pitchVideoUrl: '',
  pitchVideoSeconds: null,
  socialLinks: [],
  websiteUrl: '',
  portfolioUrl: '',
};

export const masterProductStorageKey = 'gws-master-creator-data';

const productCategories: ProductCategory[] = ['education', 'tools', 'artwork', 'services'];
const productStatuses: ProductStatus[] = ['draft', 'published'];
const educationFormats: EducationFormat[] = ['course', 'document', 'book'];
const technicalServices: TechnicalService[] = ['consulting', 'restoration', 'commission'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isOptionalNumber(value: unknown): value is number | null {
  return value === null || (typeof value === 'number' && Number.isFinite(value));
}

function isMasterProfile(value: unknown): value is MasterProfile {
  return (
    isRecord(value) &&
    isString(value.name) &&
    isString(value.biography) &&
    isOptionalNumber(value.yearsExperience) &&
    (value.yearsExperience === null || value.yearsExperience >= 0) &&
    isString(value.mentorOrSchool) &&
    isString(value.location) &&
    isString(value.photoUrl) &&
    isString(value.pitchVideoUrl) &&
    isOptionalNumber(value.pitchVideoSeconds) &&
    (value.pitchVideoSeconds === null ||
      (value.pitchVideoSeconds >= 0 && value.pitchVideoSeconds <= 10)) &&
    Array.isArray(value.socialLinks) &&
    value.socialLinks.every(isString) &&
    isString(value.websiteUrl) &&
    isString(value.portfolioUrl)
  );
}

function isProduct(value: unknown): value is MasterProduct {
  if (
    !isRecord(value) ||
    !isString(value.id) ||
    !isString(value.title) ||
    !isString(value.description) ||
    typeof value.price !== 'number' ||
    !Number.isFinite(value.price) ||
    value.price < 0 ||
    !isString(value.currency) ||
    !productStatuses.includes(value.status as ProductStatus) ||
    !isString(value.createdAt) ||
    !productCategories.includes(value.category as ProductCategory)
  ) {
    return false;
  }

  switch (value.category) {
    case 'education':
      return (
        educationFormats.includes(value.format as EducationFormat) &&
        ['beginner', 'intermediate', 'advanced'].includes(String(value.level)) &&
        isString(value.resourceUrl)
      );
    case 'tools':
      return (
        typeof value.stock === 'number' &&
        Number.isFinite(value.stock) &&
        Number.isInteger(value.stock) &&
        value.stock >= 0 &&
        typeof value.weightKg === 'number' &&
        Number.isFinite(value.weightKg) &&
        value.weightKg >= 0 &&
        isString(value.dimensionsCm) &&
        isString(value.careInstructions)
      );
    case 'artwork':
      return (
        isString(value.technique) &&
        isString(value.dimensionsCm) &&
        typeof value.weightKg === 'number' &&
        Number.isFinite(value.weightKg) &&
        value.weightKg >= 0 &&
        typeof value.creationYear === 'number' &&
        Number.isFinite(value.creationYear) &&
        value.creationYear >= 0 &&
        isString(value.certificateUrl) &&
        Array.isArray(value.imageUrls) &&
        value.imageUrls.every(isString)
      );
    case 'services':
      return (
        technicalServices.includes(value.serviceType as TechnicalService) &&
        isOptionalNumber(value.durationHours) &&
        (value.durationHours === null || value.durationHours > 0) &&
        isString(value.availability) &&
        typeof value.quoteRequired === 'boolean'
      );
    default:
      return false;
  }
}

export function parseMasterCreatorData(value: unknown): MasterCreatorData {
  if (
    !isRecord(value) ||
    !isMasterProfile(value.profile) ||
    !Array.isArray(value.products) ||
    !value.products.every(isProduct)
  ) {
    throw new Error('Stored master creator data has an invalid format.');
  }

  return { profile: value.profile, products: value.products };
}
