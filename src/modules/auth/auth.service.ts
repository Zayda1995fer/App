import { Injectable, NotFoundException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PrismaService }  from 'src/prisma.service';
import { IUser }          from './interfaces/user.interface';
import { JwtService }     from '@nestjs/jwt';
import * as bcrypt        from 'bcrypt';
import type { Request }   from 'express';
import { checkPassword }  from './utils/checkPassword';
import { CreateUserDto }  from './dto/create-user.dto';
import { UpdateUserDto }  from './dto/update-user.dto';

@Injectable()
export class AuthService {

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Helper: extraer IP
  private getIp(req?: Request): string {
    if (!req) return 'unknown';
    return (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'unknown';
  }

  // 👤 GET PROFILE
  async getProfile(req: Request): Promise<any> {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new UnauthorizedException('Token requerido.');

    const token   = authHeader.split(' ')[1];
    const payload = this.jwtService.verify(token);

    const user = await this.prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) throw new NotFoundException('Usuario no encontrado.');

    return {
      id:        user.id,
      name:      user.name,
      lastname:  user.lastname,
      email:     user.email,
      createdAt: user.createdAt,
    };
  }

  // 🔐 LOGIN
  async login(email: string, password: string, req?: Request): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) throw new NotFoundException('El correo no está registrado.');

    const validPassword = await checkPassword(password, user.password);
    if (!validPassword) throw new UnauthorizedException('Contraseña incorrecta.');

    const accessToken = this.jwtService.sign(
      { id: user.id, email: user.email },
      { expiresIn: '60s' },
    );

    const refreshToken = this.jwtService.sign(
      { id: user.id },
      { expiresIn: '7d' },
    );

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data:  { refreshToken: hashedRefreshToken },
    });

    return {
      id:           user.id,
      email:        user.email,
      accessToken,
      refreshToken,
    };
  }

  // 🔄 REFRESH TOKEN
  async refreshToken(token: string): Promise<any> {
    if (!token || token.trim() === '')
      throw new UnauthorizedException('Refresh token requerido.');

    let payload: any;
    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || !user.refreshToken)
      throw new UnauthorizedException('Sesión no válida.');

    const isValid = await checkPassword(token, user.refreshToken);
    if (!isValid) throw new UnauthorizedException('Refresh token no coincide.');

    const newAccessToken = this.jwtService.sign(
      { id: user.id, email: user.email },
      { expiresIn: '60s' },
    );

    return { accessToken: newAccessToken };
  }

  // 🚪 LOGOUT
  async logout(token: string): Promise<boolean> {
    if (!token || token.trim() === '') return true;
    try {
      const payload = this.jwtService.verify(token);
      await this.prisma.user.update({
        where: { id: payload.id },
        data:  { refreshToken: null },
      });
    } catch {}
    return true;
  }

  // 👥 GET USERS — sin exponer password ni refreshToken
  async getUsers(): Promise<any[]> {
    return await this.prisma.user.findMany({
      select: {
        id:        true,
        name:      true,
        lastname:  true,
        email:     true,
        createdAt: true,
      },
    });
  }

  // 👤 GET USER BY ID
  async getUserById(id: number): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where:  { id },
      select: {
        id:        true,
        name:      true,
        lastname:  true,
        email:     true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado.');
    return user;
  }

  // ➕ REGISTER
  async createUser(dto: CreateUserDto, req?: Request): Promise<any> {
    const existUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existUser) throw new ForbiddenException('El correo ya está registrado.');

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        name:     dto.name.trim(),
        lastname: dto.lastname.trim(),
        email:    dto.email.toLowerCase().trim(),
        password: hashedPassword,
      },
    });

    return {
      id:        user.id,
      name:      user.name,
      lastname:  user.lastname,
      email:     user.email,
      createdAt: user.createdAt,
    };
  }

  // ✏ UPDATE USER — solo name y lastname
 async updateUser(id: number, user: IUser): Promise<any> {
  return await this.prisma.user.update({
    where: { id },
    data: {
      ...(user.name     && { name:     user.name.trim() }),
      ...(user.lastname && { lastname: user.lastname.trim() }),
    },
    select: {
      id:        true,
      name:      true,
      lastname:  true,
      email:     true,
      createdAt: true,
    },
  });
}

  // ❌ DELETE USER
  async deleteUser(id: number): Promise<boolean> {
    try {
      await this.prisma.user.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

}