import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';
import { ElevatedSession } from './elevated-session.entity';
import { AuditLog } from '../audit/audit-log.entity';
import {
  RegisterDto,
  LoginDto,
  ElevateDto,
  SetupTotpInitDto,
  ConfirmTotpSetupDto,
  DisableTotpDto,
} from './dto/auth.dto';
import { GwsRole } from '../common/enums/gws-role.enum';

/** Versión vigente de la nota de privacidad (ver CLAUDE.md §4 —
 * el texto legal final aún está pendiente de revisión por abogado;
 * esto es el resumen orientativo mostrado en el registro). */
const CURRENT_PRIVACY_VERSION = 'draft-v1-pendiente-revision-legal';

const BCRYPT_ROUNDS = 12;
const ELEVATION_WINDOW_MINUTES = 25;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(ElevatedSession) private elevatedSessionRepo: Repository<ElevatedSession>,
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ user: Partial<User>; accessToken: string }> {
    const existing = await this.userRepo.findOne({
      where: [{ email: dto.email }, { username: dto.username }],
    });
    if (existing) {
      throw new ConflictException('Ya existe una cuenta con ese email o usuario');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = this.userRepo.create({
      fullName: dto.fullName,
      email: dto.email,
      username: dto.username,
      passwordHash,
      role: GwsRole.SUBSCRIBER, // toda cuenta nueva empieza en el rol de menor privilegio (CLAUDE.md §3.5)
      preferredLanguage: dto.preferredLanguage,
      privacyAcceptedAt: new Date(),
      privacyPolicyVersion: CURRENT_PRIVACY_VERSION,
    });
    const saved = await this.userRepo.save(user);

    const accessToken = this.signToken(saved);
    return { user: this.toPublicUser(saved), accessToken };
  }

  /**
   * Paso 1 de 2 del setup de TOTP (2FA): genera un secreto nuevo y lo
   * devuelve UNA sola vez (base32 + URI para QR). El secreto queda guardado
   * en el usuario pero la cuenta sigue con totpEnabled=false hasta que se
   * confirme con un código válido (setupTotpConfirm). Ver CLAUDE.md §3.5 —
   * sin TOTP configurado, un admin NO puede elevar privilegios.
   *
   * Anti-secuestro (gws-security-hardening): rotar el secreto TOTP exige
   * la CONTRASEÑA de la cuenta. Un JWT robado solo no alcanza — un
   * atacante tendría que conocer además la contraseña para reconfigurar
   * el 2FA de la víctima y quedarse con la cuenta.
   *
   * Nota de seguridad: el secreto se devuelve en la respuesta solo en este
   * paso; si la app cliente lo pierde, el usuario debe regenerarlo con un
   * nuevo setup (invalidando el anterior).
   */
  async setupTotpInit(userId: string, dto: SetupTotpInitDto): Promise<{ base32: string; otpauthUrl: string }> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'username', 'passwordHash'],
    });
    if (!user) throw new UnauthorizedException();

    const validPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!validPassword) throw new UnauthorizedException('Contraseña incorrecta');

    const secret = speakeasy.generateSecret({ name: `GlassWorldStudio:${user.username}` });
    // Se persiste de inmediato para que la confirmación sea idempotente y
    // sobreviva a reinicios del servidor entre el paso 1 y el 2.
    await this.userRepo.update(userId, { totpSecret: secret.base32, totpEnabled: false });

    return { base32: secret.base32, otpauthUrl: secret.otpauth_url };
  }

  /**
   * Paso 2 de 2: verifica un código TOTP contra el secreto pendiente y
   * recién ahí activa el 2FA. El código se prueba con ventana ±1 paso
   * (tolerancia de reloj, igual que en elevate). La contraseña de la
   * cuenta se exige de nuevo (mismo motivo que setupTotpInit).
   *
   * Al activar el 2FA se incrementa tokenVersion: cualquier JWT emitido
   * ANTES de la activación queda invalidado, obligando a re-autenticarse.
   */
  async setupTotpConfirm(userId: string, dto: ConfirmTotpSetupDto): Promise<{ totpEnabled: true }> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'passwordHash', 'totpSecret', 'tokenVersion'],
    });
    if (!user || !user.totpSecret) {
      throw new BadRequestException('Primero iniciá el setup de TOTP');
    }

    const validPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!validPassword) throw new UnauthorizedException('Contraseña incorrecta');

    const valid = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: dto.code,
      window: 1,
    });
    if (!valid) throw new BadRequestException('Código TOTP inválido');

    await this.userRepo.update(userId, {
      totpEnabled: true,
      tokenVersion: user.tokenVersion + 1,
    });

    await this.auditRepo.save(
      this.auditRepo.create({
        userId,
        action: 'totp_enabled',
        ipAddress: 'unknown', // se setea en el controller si está disponible
        metadata: { source: 'setup_confirm' },
      }),
    );

    return { totpEnabled: true };
  }

  /**
   * Desactiva el 2FA. Acción sensible (downgrade de seguridad): exige
   * contraseña actual + código TOTP vigente. Deja registro en AuditLog.
   */
  async setupTotpDisable(
    userId: string,
    dto: DisableTotpDto,
    ipAddress: string,
  ): Promise<{ totpEnabled: false }> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'passwordHash', 'totpSecret', 'totpEnabled', 'tokenVersion'],
    });
    if (!user) throw new UnauthorizedException();
    if (!user.totpEnabled || !user.totpSecret) {
      throw new BadRequestException('El 2FA ya está desactivado');
    }

    const validPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!validPassword) throw new UnauthorizedException('Contraseña incorrecta');

    const validTotp = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: dto.totpCode,
      window: 1,
    });
    if (!validTotp) throw new UnauthorizedException('Código TOTP inválido');

    // tokenVersion++ también acá: desactivar 2FA es un downgrade de
    // seguridad y todas las sesiones existentes deben re-autenticarse.
    await this.userRepo.update(userId, {
      totpEnabled: false,
      totpSecret: null,
      tokenVersion: user.tokenVersion + 1,
    });

    await this.auditRepo.save(
      this.auditRepo.create({
        userId,
        action: 'totp_disabled',
        ipAddress,
        requiredElevation: false,
      }),
    );

    return { totpEnabled: false };
  }

  async login(dto: LoginDto): Promise<{ user: Partial<User>; accessToken: string }> {
    const user = await this.userRepo.findOne({
      where: [{ email: dto.identifier }, { username: dto.identifier }],
      select: [
        'id',
        'email',
        'username',
        'fullName',
        'passwordHash',
        'role',
        'preferredLanguage',
        'tokenVersion',
      ],
    });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    const accessToken = this.signToken(user);
    return { user: this.toPublicUser(user), accessToken };
  }

  /**
   * Elevación a modo admin (CLAUDE.md §3.5). Requiere contraseña +
   * TOTP, aunque el usuario ya tenga rol ADMIN — el rol solo no alcanza.
   * Crea una ElevatedSession con ventana de expiración corta y deja
   * registro en AuditLog. Este método NO otorga el rol admin — solo
   * habilita, temporalmente, el uso de endpoints protegidos por
   * ElevationGuard para un usuario que YA tiene ese rol asignado.
   */
  async elevate(
    userId: string,
    dto: ElevateDto,
    ipAddress: string,
    userAgent: string | null,
  ): Promise<{ expiresAt: Date }> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'role', 'passwordHash', 'totpSecret', 'totpEnabled'],
    });
    if (!user) throw new UnauthorizedException();
    if (user.role !== GwsRole.ADMIN) {
      throw new UnauthorizedException('Este usuario no tiene rol admin asignado');
    }
    if (!user.totpEnabled || !user.totpSecret) {
      throw new BadRequestException(
        'La cuenta admin debe tener TOTP configurado antes de poder elevar privilegios',
      );
    }

    const validPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!validPassword) throw new UnauthorizedException('Contraseña incorrecta');

    const validTotp = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: dto.totpCode,
      window: 1, // tolera +/- 30s de desfasaje de reloj
    });
    if (!validTotp) throw new UnauthorizedException('Código TOTP inválido');

    const expiresAt = new Date(Date.now() + ELEVATION_WINDOW_MINUTES * 60 * 1000);
    await this.elevatedSessionRepo.save(
      this.elevatedSessionRepo.create({ userId: user.id, ipAddress, userAgent, expiresAt }),
    );

    // Registro inmutable: toda elevación queda logueada, se use o no
    // después para algo (CLAUDE.md §3.5 — "cada elevación dispara
    // notificación"; el envío de notificación real por otro canal se
    // implementa en NotificationService, fuera del alcance de este mes).
    await this.auditRepo.save(
      this.auditRepo.create({
        userId: user.id,
        action: 'elevate_to_admin',
        ipAddress,
        requiredElevation: false,
        metadata: { expiresAt },
      }),
    );

    return { expiresAt };
  }

  /** Revocación manual — para cuando el propio usuario, o un proceso de
   * "Código Rojo" a nivel de infraestructura, necesita cortar la sesión
   * elevada antes de que expire sola. */
  async revokeElevation(userId: string): Promise<void> {
    await this.elevatedSessionRepo.update(
      { userId, revokedManually: false },
      { revokedManually: true },
    );
  }

  private signToken(user: Pick<User, 'id' | 'role' | 'email' | 'tokenVersion'>): string {
    return this.jwtService.sign({
      sub: user.id,
      role: user.role,
      email: user.email,
      tokenVersion: user.tokenVersion,
    });
  }

  private toPublicUser(user: User): Partial<User> {
    // Nunca se devuelve passwordHash ni totpSecret, aunque el repositorio
    // los haya traído para validar login/elevación.
    const { passwordHash, totpSecret, ...publicUser } = user as User & {
      passwordHash?: string;
      totpSecret?: string | null;
    };
    return publicUser;
  }
}
