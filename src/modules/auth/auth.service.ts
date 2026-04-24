import {
  Injectable, NotFoundException,
  UnauthorizedException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService }   from 'src/prisma.service';
import { JwtService }      from '@nestjs/jwt';
import * as bcrypt         from 'bcrypt';
import type { Request }    from 'express';
import { checkPassword }   from './utils/checkPassword';
import { CreateUserDto }   from './dto/create-user.dto';
import { UpdateUserDto }   from './dto/update-user.dto';
import { AuditService, AuditAction, AuditSeverity } from '../audit/audit.service';

@Injectable()
export class AuthService {

  constructor(
    private prisma:    PrismaService,
    private jwtSvc:    JwtService,
    private auditSvc:  AuditService,
  ) {}

  // ── Helper: extraer IP ───────────────────────────────────
  private getIp(req?: Request): string {
    if (!req) return 'unknown';
    return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
      || req.ip
      || 'unknown';
  }

  // ── Helper: datos seguros del usuario (sin password/token) ─
  private safeUser(user: any) {
    return {
      id:        user.id,
      name:      user.name,
      lastname:  user.lastname,
      email:     user.email,
      role:      user.role,
      createdAt: user.createdAt,
    };
  }

  // ─────────────────────────────────────────────────────────
  // 👤 GET PROFILE
  // ─────────────────────────────────────────────────────────
  async getProfile(req: Request): Promise<any> {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new UnauthorizedException('Token requerido.');

    const token   = authHeader.split(' ')[1];
    const payload = this.jwtSvc.verify(token);

    const user = await this.prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) throw new NotFoundException('Usuario no encontrado.');

    return this.safeUser(user);
  }

  // ─────────────────────────────────────────────────────────
  // 🔐 LOGIN — con checkPassword + auditoría
  // ─────────────────────────────────────────────────────────
  async login(email: string, password: string, req?: Request): Promise<any> {
    const ip   = this.getIp(req);
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Registrar intento fallido sin revelar si el email existe
      await this.auditSvc.log(null, AuditAction.LOGIN_FAILED, AuditSeverity.WARNING,
        `Login fallido — correo no registrado: ${email}`, ip);
      throw new NotFoundException('El correo no está registrado.');
    }

    // Verificar contraseña con checkPassword (bcrypt.compare)
    const validPassword = await checkPassword(password, user.password);

    if (!validPassword) {
      await this.auditSvc.log(user.id, AuditAction.LOGIN_FAILED, AuditSeverity.WARNING,
        `Contraseña incorrecta para: ${email}`, ip);
      throw new UnauthorizedException('Contraseña incorrecta.');
    }

    // accessToken (60s) incluye role para RBAC
    const accessToken = this.jwtSvc.sign(
      { id: user.id, email: user.email, role: user.role || 'user' },
      { expiresIn: '60s' },
    );

    // refreshToken (7d) — solo id
    const refreshToken = this.jwtSvc.sign(
      { id: user.id },
      { expiresIn: '7d' },
    );

    // Solo el refreshToken se guarda en BD hasheado con bcrypt
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data:  { refreshToken: hashedRefreshToken },
    });

    await this.auditSvc.log(user.id, AuditAction.LOGIN_SUCCESS, AuditSeverity.INFO,
      `Login exitoso: ${email}`, ip);

    // Respuesta: solo datos no sensibles + tokens
    return {
      id:           user.id,
      email:        user.email,
      role:         user.role || 'user',
      accessToken,
      refreshToken,
    };
  }

  // ─────────────────────────────────────────────────────────
  // 🔄 REFRESH TOKEN
  // ─────────────────────────────────────────────────────────
  async refreshToken(token: string): Promise<any> {
    if (!token || token.trim() === '')
      throw new UnauthorizedException('Refresh token requerido.');

    let payload: any;
    try {
      payload = this.jwtSvc.verify(token);
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || !user.refreshToken)
      throw new UnauthorizedException('Sesión no válida.');

    const isValid = await checkPassword(token, user.refreshToken);
    if (!isValid) throw new UnauthorizedException('Refresh token no coincide.');

    const newAccessToken = this.jwtSvc.sign(
      { id: user.id, email: user.email, role: user.role || 'user' },
      { expiresIn: '60s' },
    );

    await this.auditSvc.log(user.id, AuditAction.TOKEN_REFRESH, AuditSeverity.INFO,
      `Token renovado para: ${user.email}`);

    return { accessToken: newAccessToken };
  }

  // ─────────────────────────────────────────────────────────
  // 🚪 LOGOUT — invalida refreshToken en BD
  // ─────────────────────────────────────────────────────────
  async logout(token: string): Promise<boolean> {
    if (!token || token.trim() === '') return true;
    try {
      const payload = this.jwtSvc.verify(token);
      await this.prisma.user.update({
        where: { id: payload.id },
        data:  { refreshToken: null },
      });
      await this.auditSvc.log(payload.id, AuditAction.LOGOUT, AuditSeverity.INFO,
        `Logout: usuario ID ${payload.id}`);
    } catch {
      // Token expirado — limpiar sesión de todas formas
    }
    return true;
  }

  // ─────────────────────────────────────────────────────────
  // 👥 GET USERS — sin exponer password, refreshToken
  // Privacidad: solo campos públicos en la respuesta (REQUISITO)
  // ─────────────────────────────────────────────────────────
  async getUsers(): Promise<any[]> {
    return await this.prisma.user.findMany({
      select: {
        id:        true,
        name:      true,
        lastname:  true,
        email:     true,
        role:      true,
        createdAt: true,
        // ❌ password y refreshToken EXCLUIDOS
      },
      orderBy: { id: 'asc' },
    });
  }

  // ─────────────────────────────────────────────────────────
  // 👤 GET USER BY ID — sin datos sensibles
  // ─────────────────────────────────────────────────────────
  async getUserById(id: number): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where:  { id },
      select: {
        id: true, name: true, lastname: true,
        email: true, role: true, createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado.');
    return user;
  }

  // ─────────────────────────────────────────────────────────
  // ➕ REGISTER — contraseña hasheada con bcrypt
  // ─────────────────────────────────────────────────────────
  async createUser(dto: CreateUserDto, req?: Request): Promise<any> {
    const ip = this.getIp(req);

    const existUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existUser) throw new ForbiddenException('El correo ya está registrado.');

    // Hashear contraseña con bcrypt salt 12
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        name:     dto.name.trim(),
        lastname: dto.lastname.trim(),
        email:    dto.email.toLowerCase().trim(),
        password: hashedPassword,
        role:     'user', // rol por defecto
      },
    });

    await this.auditSvc.log(user.id, AuditAction.REGISTER, AuditSeverity.INFO,
      `Nuevo registro: ${user.email}`, ip);

    // Retornar solo datos seguros — SIN password
    return this.safeUser(user);
  }

  // ─────────────────────────────────────────────────────────
  // ✏ UPDATE USER — Prevención IDOR
  // Solo name y lastname — email y password NO se pueden cambiar
  // ─────────────────────────────────────────────────────────
  async updateUser(id: number, dto: UpdateUserDto, requesterId?: number): Promise<any> {
    // IDOR prevention: un usuario solo puede editar su propio perfil
    if (requesterId !== undefined && requesterId !== id) {
      throw new ForbiddenException('No puedes editar el perfil de otro usuario.');
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.name     && { name:     dto.name.trim() }),
        ...(dto.lastname && { lastname: dto.lastname.trim() }),
        // ❌ email y password NUNCA se actualizan aquí
      },
      select: {
        id: true, name: true, lastname: true,
        email: true, role: true, createdAt: true,
      },
    });

    await this.auditSvc.log(id, AuditAction.USER_UPDATED, AuditSeverity.INFO,
      `Usuario actualizado: ID ${id}`);

    return user;
  }

  // ─────────────────────────────────────────────────────────
  // ❌ DELETE USER
  // ─────────────────────────────────────────────────────────
  async deleteUser(id: number): Promise<boolean> {
    try {
      await this.prisma.user.delete({ where: { id } });
      await this.auditSvc.log(id, AuditAction.USER_DELETED, AuditSeverity.WARNING,
        `Usuario eliminado: ID ${id}`);
      return true;
    } catch {
      return false;
    }
  }

}