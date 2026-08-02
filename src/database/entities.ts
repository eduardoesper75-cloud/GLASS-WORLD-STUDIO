import { User } from '../users/user.entity';
import { ElevatedSession } from '../auth/elevated-session.entity';
import { AuditLog } from '../audit/audit-log.entity';
import { ChatMessage } from '../community/chat-message.entity';
import { Product } from '../marketplace/product.entity';
import { ProductionBatch } from '../marketplace/production-batch.entity';
import { ProductVariant } from '../marketplace/product-variant.entity';
import { ProductCategory } from '../marketplace/product-category.entity';
import { ProductReview } from '../marketplace/product-review.entity';
import { Master } from '../galaxies/g1-masters/master.entity';
import { MasterCatalogItem } from '../galaxies/g1-masters/master-catalog-item.entity';
import { FoundingSlot } from '../foundation/founding-slot.entity';
import { FoundingClaim } from '../foundation/founding-claim.entity';
import { SubscriptionPlan } from '../subscriptions/subscription-plan.entity';
import { UserSubscription } from '../subscriptions/user-subscription.entity';
import { VaultCategory } from '../vault/vault-category.entity';
import { VaultDocument } from '../vault/vault-document.entity';
import { CommissionRule } from '../commissions/commission-rule.entity';
import { CustomsHsCode } from '../customs/customs-hs-code.entity';
import { CustomsCountryParam } from '../customs/customs-country-param.entity';
import { CustomsFreightBand } from '../customs/customs-freight-band.entity';
import { AdBillboard } from '../billboards/ad-billboard.entity';
import { AdCampaign } from '../billboards/ad-campaign.entity';
import { BunkerSpecialist } from '../bunker/bunker-specialist.entity';
import { BunkerServiceRequest } from '../bunker/bunker-service-request.entity';
import { BunkerMembership } from '../bunker/bunker-membership.entity';
import { G6TechSheetTemplate } from '../galaxies/g6-tech-sheets/tech-sheet-template.entity';
import { G6TechSheet } from '../galaxies/g6-tech-sheets/tech-sheet.entity';
import { EscrowHold } from '../escrow/escrow-hold.entity';

/**
 * GWS · Registro único de entidades
 * ------------------------------------------------------------
 * Fuente única de verdad para TypeORM. Lo usan tanto el AppModule
 * (runtime de Nest) como el AppDataSource (CLI de migraciones),
 * para que nunca se desincronicen las entidades que la app conoce
 * y las que la CLI de migraciones compara. Ver MIGRATIONS.md.
 */
export const typeOrmEntities = [
  User,
  ElevatedSession,
  AuditLog,
  ChatMessage,
  Product,
  ProductionBatch,
  ProductVariant,
  ProductCategory,
  ProductReview,
  Master,
  MasterCatalogItem,
  FoundingSlot,
  FoundingClaim,
  SubscriptionPlan,
  UserSubscription,
  VaultCategory,
  VaultDocument,
  CommissionRule,
  CustomsHsCode,
  CustomsCountryParam,
  CustomsFreightBand,
  AdBillboard,
  AdCampaign,
  BunkerSpecialist,
  BunkerServiceRequest,
  BunkerMembership,
  G6TechSheetTemplate,
  G6TechSheet,
  EscrowHold,
];
