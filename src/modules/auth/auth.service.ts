import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { IUser } from './interfaces/user.interface';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';

@Injectable()
export class AuthService {

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  // 👤 GET PROFILE
  public async getProfile(req: Request): Promise<any> {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Token required');
    }

    const token = authHeader.split(' ')[1];
    const payload = this.jwtService.verify(token);

    const user = await this.prisma.user.findUnique({
      where: { id: payload.id }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt
    };
  }

  // 🔐 LOGIN
  public async login(email: string, password: string): Promise<any> {

    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      throw new UnauthorizedException('Invalid password');
    }

    const accessToken = this.jwtService.sign(
      { id: user.id, email: user.email },
      { expiresIn: '60s' }
    );

    const refreshToken = this.jwtService.sign(
      { id: user.id },
      { expiresIn: '7d' }
    );

    // 🔐 Guardar token encriptado (mejor práctica)
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: hashedRefreshToken
      }
    });

    return {
      id: user.id,
      email: user.email,
      accessToken,
      refreshToken
    };
  }

  // 🔄 REFRESH TOKEN
  public async refreshToken(token: string): Promise<any> {

    const payload = this.jwtService.verify(token);

    const user = await this.prisma.user.findUnique({
      where: { id: payload.id }
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isValid = await bcrypt.compare(token, user.refreshToken);

    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const newAccessToken = this.jwtService.sign(
      { id: user.id, email: user.email },
      { expiresIn: '60s' }
    );

    return {
      accessToken: newAccessToken
    };
  }

  // 🚪 LOGOUT
  public async logout(token: string): Promise<boolean> {

    const payload = this.jwtService.verify(token);

    await this.prisma.user.update({
      where: { id: payload.id },
      data: {
        refreshToken: null
      }
    });

    return true;
  }

  // 👥 GET USERS
  public async getUsers(): Promise<IUser[]> {
    return await this.prisma.user.findMany();
  }

  // 👤 GET USER BY ID
  public async getUserById(id: number): Promise<IUser | null> {
    return await this.prisma.user.findUnique({
      where: { id }
    });
  }

  // ➕ CREATE USER (REGISTER)
  public async createUser(user: IUser): Promise<IUser> {

    const existUser = await this.prisma.user.findUnique({
      where: { email: user.email }
    });

    if (existUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    return await this.prisma.user.create({
      data: {
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        password: hashedPassword
      }
    });
  }

  // ✏ UPDATE USER
  public async updateUser(id: number, user: IUser): Promise<IUser> {

    return await this.prisma.user.update({
      where: { id },
      data: {
        name: user.name,
        lastname: user.lastname
      }
    });
  }

  // ❌ DELETE USER
  public async deleteUser(id: number): Promise<boolean> {

    try {
      await this.prisma.user.delete({
        where: { id }
      });

      return true;
    } catch {
      return false;
    }
  }
}