/**
 * GWS · Roles RBAC
 * ------------------------------------------------------------
 * Definidos en capas, no binario (ver CLAUDE.md §3.5). Cada rol
 * incluye implícitamente los permisos del rol anterior salvo que
 * se defina lo contrario explícitamente en cada guard.
 */
export enum GwsRole {
  /** Solo lectura. Para auditorías de terceros (ej. Miguel Diez revisando
   * métricas sin poder modificar nada). Nunca es el rol por defecto de
   * un usuario nuevo. */
  VIEWER = 'viewer',

  /** Rol por defecto de cualquier cuenta nueva. Acceso a su propio perfil,
   * sus propias compras/mensajes, y a las Galaxias públicas. */
  SUBSCRIBER = 'subscriber',

  /** Control de una sola Galaxia (ej. moderador de G3). No tiene acceso
   * a otras Galaxias ni a configuración global. */
  MODERATOR_G1 = 'moderator_g1',
  MODERATOR_G2 = 'moderator_g2',
  MODERATOR_G3 = 'moderator_g3',
  MODERATOR_G4 = 'moderator_g4',
  MODERATOR_G5 = 'moderator_g5',
  MODERATOR_G6 = 'moderator_g6',

  /**
   * Galaxia 1 — maestro/ícono del vidrio (CLAUDE.md tabla G1).
   * Una cuenta con este rol gestiona su propio catálogo de autor
   * (obras, cursos, talleres, líneas exclusivas) vía el módulo
   * g1-masters. Es un rol comercial de G1: NO reemplaza a la
   * elevación admin para acciones críticas.
   */
  MAESTRO = 'maestro',

  /** Control total. Requiere elevación de privilegio (ver ElevatedSession)
   * incluso si el usuario ya tiene este rol asignado — el rol por sí solo
   * NO habilita acciones críticas sin la sesión elevada activa. */
  ADMIN = 'admin',
}

/**
 * Acciones que SIEMPRE requieren sesión elevada activa (TOTP reciente),
 * sin importar que el usuario ya tenga rol ADMIN. Ver CLAUDE.md §3.1 y
 * §3.5 — el rol no es suficiente por sí solo para estas acciones.
 */
export const ACTIONS_REQUIRING_ELEVATION = [
  'change_subscription_pricing',
  'edit_liquidation_rules',
  'modify_payment_vault_config',
  'delete_user_account',
  'access_root_infrastructure_config',
  // G1 (Jorge decide quién es "verificado" y quién vende como maestro).
  // Ambas son decisiones de confianza comercial: exigen la sesión elevada.
  'verify_g1_master',
  'grant_maestro_role',
  // Carteleras (Orden Suprema): pausar/reanudar un espacio publicitario.
  'manage_billboards',
  // Búnker (Orden Suprema): otorgar el sello de cartera élite a un
  // especialista técnico — decisión de confianza técnica de Jorge.
  'verify_bunker_specialist',
  // Escrow Inteligente (Orden Suprema): resolver reclamos de retenciones
  // (liberar al vendedor o devolver al comprador) — decisión de confianza
  // financiera; el movimiento real de fondos es del Payment_Vault (§3.1).
  'manage_escrow_disputes',
] as const;

export type ElevatedAction = (typeof ACTIONS_REQUIRING_ELEVATION)[number];
