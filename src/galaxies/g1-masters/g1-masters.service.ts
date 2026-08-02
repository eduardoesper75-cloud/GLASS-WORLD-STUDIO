import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Master } from './master.entity';
import { MasterCatalogItem } from './master-catalog-item.entity';
import { User } from '../../users/user.entity';
import { ElevatedSession } from '../../auth/elevated-session.entity';
import { AuditLog } from '../../audit/audit-log.entity';
import { GwsRole } from '../../common/enums/gws-role.enum';
import { CreateMasterDto } from './dto/create-master.dto';
import { UpdateMasterDto } from './dto/update-master.dto';
import { CreateCatalogItemDto } from './dto/create-catalog-item.dto';
import { UpdateCatalogItemDto } from './dto/update-catalog-item.dto';
import { MasterCatalogItemType } from './masters.enums';
import { resolveGwsMediaOrThrow } from '../../common/media/gws-media.validate';

/**
 * Claves de detalles mínimas esperadas por tipo de ítem de catálogo.
 * Igual filosofía que REQUIRED_SPECS_BY_TIER en G2: un curso sin
 * nivel ni duración no sirve para que un alumno decida; una línea de
 * autor sin material es inútil. Validado antes de guardar, no después.
 */
const REQUIRED_DETAILS_BY_TYPE: Record<MasterCatalogItemType, string[]> = {
  [MasterCatalogItemType.COURSE]: ['level', 'durationHours'],
  [MasterCatalogItemType.WORKSHOP]: ['date'],
  [MasterCatalogItemType.BOOK]: ['isbn'],
  [MasterCatalogItemType.AUTHOR_TOOL_LINE]: ['material'],
  [MasterCatalogItemType.AUTHOR_MATERIAL_LINE]: ['composition'],
};

@Injectable()
export class G1MastersService {
  constructor(
    @InjectRepository(Master) private masterRepo: Repository<Master>,
    @InjectRepository(MasterCatalogItem) private catalogRepo: Repository<MasterCatalogItem>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(ElevatedSession) private elevatedSessionRepo: Repository<ElevatedSession>,
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
  ) {}

  // ---------- Administración (Jorge — admin + sesión elevada) ----------

  /** Sello "verificado" del perfil. Solo Jorge vía admin + elevación (ver
   * controller y ACTIONS_REQUIRING_ELEVATION). NO es el rol MAESTRO: un
   * maestro no verificado sigue siendo visible y vendible; verified es el
   * sello de identidad/obra. Cada cambio queda auditado. */
  async verifyMaster(
    masterId: string,
    adminId: string,
    verified: boolean,
    ipAddress: string,
  ): Promise<Master> {
    const master = await this.masterRepo.findOne({ where: { id: masterId } });
    if (!master) throw new NotFoundException('Perfil de maestro no encontrado');

    master.verified = verified;
    const saved = await this.masterRepo.save(master);

    await this.auditRepo.save(
      this.auditRepo.create({
        userId: adminId,
        action: verified ? 'g1_master_verified' : 'g1_master_unverified',
        targetResource: `Master:${masterId}`,
        metadata: { masterUserId: master.userId },
        ipAddress,
        requiredElevation: true,
      }),
    );
    return saved;
  }

  /** Otorga/revoca el rol comercial MAESTRO sobre la CUENTA (users.role)
   * vinculada al perfil. El rol es lo que habilita gestionar el catálogo
   * (endpoints @Roles(MAESTRO) del controller). Al revocar se restaura
   * SUBSCRIBER (modelo de rol único; no se conserva el rol previo).
   *
   * Salvaguardas:
   *   - No se puede asignar MAESTRO a una cuenta admin (degradaría a Jorge
   *     por error de tipeo).
   *   - Al cambiar el rol se revocan TODAS las ElevatedSession activas de
   *     esa cuenta y se invalida el JWT en circulación (JwtAuthGuard compara
   *     tokenVersion+role contra DB): el rol nuevo aplica de inmediato, no
   *     cuando expire el token (ver gws-security-hardening).
   */
  async setMaestroRole(
    masterId: string,
    adminId: string,
    granted: boolean,
    ipAddress: string,
  ): Promise<{ role: GwsRole }> {
    const master = await this.masterRepo.findOne({ where: { id: masterId } });
    if (!master) throw new NotFoundException('Perfil de maestro no encontrado');

    const user = await this.userRepo.findOne({
      where: { id: master.userId },
      select: ['id', 'role', 'tokenVersion'],
    });
    if (!user) throw new NotFoundException('Cuenta del maestro no encontrada');

    const previousRole = user.role;
    if (granted && previousRole === GwsRole.ADMIN) {
      throw new BadRequestException(
        'No se puede asignar MAESTRO a una cuenta admin: degradaría el rol de administración',
      );
    }
    user.role = granted ? GwsRole.MAESTRO : GwsRole.SUBSCRIBER;
    // tokenVersion++: cada cambio de rol invalida de inmediato los JWT y las
    // sesiones elevadas que esa cuenta tuviera en circulación.
    user.tokenVersion = user.tokenVersion + 1;
    await this.userRepo.save(user);

    // Corta cualquier ElevatedSession activa: un rol recién degradado no
    // puede seguir operando acciones críticas con una elevación ya emitida.
    await this.elevatedSessionRepo.update(
      { userId: user.id, revokedManually: false },
      { revokedManually: true },
    );

    await this.auditRepo.save(
      this.auditRepo.create({
        userId: adminId,
        action: granted ? 'g1_maestro_role_granted' : 'g1_maestro_role_revoked',
        targetResource: `User:${user.id}`,
        metadata: { masterId, previousRole, newRole: user.role, tokenVersionBumped: true },
        ipAddress,
        requiredElevation: true,
      }),
    );
    return { role: user.role };
  }

  // ---------- Perfil de maestro ----------

  /** Alta de perfil: el userId sale del token (nunca del body). Un usuario
   * solo puede tener UN perfil de maestro. El rol MAESTRO se asigna al
   * usuario, pero solo cuando ya es ADMIN o se le otorga — el alta del
   * perfil en sí no eleva privilegios de nadie. */
  async createMaster(userId: string, dto: CreateMasterDto): Promise<Master> {
    const existing = await this.masterRepo.findOne({ where: { userId } });
    if (existing) {
      throw new ConflictException('Esta cuenta ya tiene un perfil de maestro');
    }

    const master = this.masterRepo.create({
      userId,
      ...dto,
      media: dto.media !== undefined ? resolveGwsMediaOrThrow(dto.media) : null,
    });
    return this.masterRepo.save(master);
  }

  /** Sólo el dueño del perfil puede editarlo. La verificación (verified)
   * y el tier los maneja el admin por separado (no expuestos aquí). */
  async updateMaster(
    masterId: string,
    userId: string,
    dto: UpdateMasterDto,
  ): Promise<Master> {
    const master = await this.masterRepo.findOne({ where: { id: masterId } });
    if (!master) throw new NotFoundException('Perfil de maestro no encontrado');
    this.assertOwnership(master, userId);

    const media = dto.media !== undefined ? resolveGwsMediaOrThrow(dto.media) : master.media;
    Object.assign(master, { ...dto, media });
    return this.masterRepo.save(master);
  }

  /** Detalle público: solo perfiles activos. */
  async getMasterById(masterId: string): Promise<Master> {
    const master = await this.masterRepo.findOne({
      where: { id: masterId, active: true },
    });
    if (!master) throw new NotFoundException('Perfil de maestro no encontrado');
    return master;
  }

  /** El dueño ve su perfil aunque esté inactivo (para reactivarlo). */
  async getMyMasterProfile(userId: string): Promise<Master> {
    const master = await this.masterRepo.findOne({ where: { userId } });
    if (!master) throw new NotFoundException('Esta cuenta no tiene un perfil de maestro');
    return master;
  }

  /** Listado público con filtros y paginación. */
  async listMasters(
    filters: { tier?: string; countryCode?: string; verified?: boolean; search?: string },
    page: number,
    limit: number,
  ): Promise<{ items: Master[]; total: number; page: number; limit: number }> {
    const qb = this.masterRepo.createQueryBuilder('master').where('master.active = true');

    if (filters.tier) qb.andWhere('master.tier = :tier', { tier: filters.tier });
    if (filters.countryCode) {
      qb.andWhere('master.countryCode = :cc', { cc: filters.countryCode });
    }
    if (filters.verified !== undefined) {
      qb.andWhere('master.verified = :v', { v: filters.verified });
    }
    if (filters.search) {
      qb.andWhere('(master.headline ILIKE :q OR master.bio ILIKE :q)', {
        q: `%${filters.search}%`,
      });
    }

    qb.orderBy('master.verified', 'DESC').addOrderBy('master.createdAt', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  // ---------- Catálogo de autor ----------

  async createCatalogItem(
    masterId: string,
    userId: string,
    dto: CreateCatalogItemDto,
  ): Promise<MasterCatalogItem> {
    const master = await this.masterRepo.findOne({ where: { id: masterId } });
    if (!master) throw new NotFoundException('Perfil de maestro no encontrado');
    this.assertOwnership(master, userId);

    this.validateDetails(dto.itemType, dto.details ?? {});

    const item = this.catalogRepo.create({
      masterId,
      itemType: dto.itemType,
      title: dto.title,
      description: dto.description ?? null,
      price: dto.price ?? null,
      currency: dto.currency ?? 'USD',
      details: dto.details ?? {},
      media: dto.media !== undefined ? resolveGwsMediaOrThrow(dto.media) : null,
      active: dto.active ?? true,
    });
    return this.catalogRepo.save(item);
  }

  async updateCatalogItem(
    masterId: string,
    itemId: string,
    userId: string,
    dto: UpdateCatalogItemDto,
  ): Promise<MasterCatalogItem> {
    const master = await this.masterRepo.findOne({ where: { id: masterId } });
    if (!master) throw new NotFoundException('Perfil de maestro no encontrado');
    this.assertOwnership(master, userId);

    const item = await this.catalogRepo.findOne({ where: { id: itemId, masterId } });
    if (!item) throw new NotFoundException('Ítem de catálogo no encontrado');

    // Si cambia el tipo o los detalles, revalidar contra el resultado final.
    const nextType = dto.itemType ?? item.itemType;
    const nextDetails = dto.details ?? item.details;
    this.validateDetails(nextType, nextDetails);

    const media = dto.media !== undefined ? resolveGwsMediaOrThrow(dto.media) : item.media;
    Object.assign(item, { ...dto, media });
    return this.catalogRepo.save(item);
  }

  /** Soft-delete: el ítem sale del catálogo público pero conserva su
   * historial (pedidos, métricas). */
  async deactivateCatalogItem(masterId: string, itemId: string, userId: string): Promise<void> {
    const master = await this.masterRepo.findOne({ where: { id: masterId } });
    if (!master) throw new NotFoundException('Perfil de maestro no encontrado');
    this.assertOwnership(master, userId);

    const item = await this.catalogRepo.findOne({ where: { id: itemId, masterId } });
    if (!item) throw new NotFoundException('Ítem de catálogo no encontrado');
    await this.catalogRepo.update(itemId, { active: false });
  }

  /** Catálogo público de un maestro (solo activos, opcional por tipo). */
  async listCatalog(masterId: string, itemType?: MasterCatalogItemType): Promise<MasterCatalogItem[]> {
    const master = await this.masterRepo.findOne({ where: { id: masterId, active: true } });
    if (!master) throw new NotFoundException('Perfil de maestro no encontrado');

    const where = itemType ? { masterId, itemType, active: true } : { masterId, active: true };
    return this.catalogRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  // ---------- Privados ----------

  private assertOwnership(master: Master, userId: string): void {
    if (master.userId !== userId) {
      throw new ForbiddenException('Solo el maestro dueño del perfil puede gestionar este catálogo');
    }
  }

  private validateDetails(itemType: MasterCatalogItemType, details: Record<string, unknown>): void {
    const requiredKeys = REQUIRED_DETAILS_BY_TYPE[itemType];
    const missing = requiredKeys.filter((key) => !(key in details));
    if (missing.length > 0) {
      throw new BadRequestException(
        `Para un ítem de tipo ${itemType} faltan detalles obligatorios: ${missing.join(', ')}`,
      );
    }
  }
}
