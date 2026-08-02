/**
 * GWS · Bóveda del Conocimiento — Estados de un documento
 * ------------------------------------------------------------
 * Flujo de publicación (benchmark 2026: DSpace/Zenodo/MODAVIS +
 * IEC 61355 document-kind):
 *   draft        → el autor guarda sin validar (no visible).
 *   under_review → subido y validado (metadatos + dedup); espera curación.
 *   published    → visible al público.
 *   rejected     → rechazado con reason code (DUPLICATE / INVALID_METADATA /
 *                  NUMERIC_INCONSISTENT / SPAM / UNVERIFIED_SOURCE).
 *
 * La subida se crea DIRECTAMENTE en under_review (no en draft): el
 * control de contenido exige curación humana antes de publicar — la
 * plataforma es hosting neutral (safe harbor), NO editor.
 */
export enum VaultDocumentStatus {
  DRAFT = 'draft',
  UNDER_REVIEW = 'under_review',
  PUBLISHED = 'published',
  REJECTED = 'rejected',
}

/** Reject-reasons normalizados (research: colibri/MODAVIS ingest). */
export const VAULT_REJECT_REASONS = [
  'DUPLICATE',
  'INVALID_METADATA',
  'NUMERIC_INCONSISTENT',
  'SPAM',
  'UNVERIFIED_SOURCE',
] as const;

/** Tipos de documento (eje document-kind ortogonal, ISO 29845 / IEC 61355). */
export const VAULT_DOC_KINDS = [
  'FIRING_SCHEDULE',
  'TECHNOTE',
  'DATASHEET',
  'MANUAL',
  'STANDARD_REF',
  'SAFETY_SHEET',
  'REPORT',
  'CASE_STUDY',
  'RECIPE',
] as const;
export type VaultDocKind = (typeof VAULT_DOC_KINDS)[number];
