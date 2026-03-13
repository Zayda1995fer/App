import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { IUser } from './interfaces/user.interface';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

@Injectable()
export class AuthService {

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  // 👤 GET PROFILE
  public async getProfile(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>
  ): Promise<any> {

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

    // 404 si no existe
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    // validar password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      throw new UnauthorizedException('Invalid password');
    }

    // access token (60s)
    const accessToken = this.jwtService.sign(
      {
        id: user.id,
        email: user.email
      },
      { expiresIn: '60s' }
    );

    // refresh token (7 días)
    const refreshToken = this.jwtService.sign(
      {
        id: user.id
      },
      { expiresIn: '7d' }
    );

    // guardar refresh token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: refreshToken
      }
    });

    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      accessToken,
      refreshToken
    };

  }

  // 🔄 REFRESH TOKEN
  public async refreshToken(refreshToken: string): Promise<any> {

    const payload = this.jwtService.verify(refreshToken);

    const user = await this.prisma.user.findUnique({
      where: { id: payload.id }
    });

    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const newAccessToken = this.jwtService.sign(
      {
        id: user.id,
        email: user.email
      },
      { expiresIn: '60s' }
    );

    return {
      accessToken: newAccessToken
    };

  }

  // 🚪 LOGOUT
  public async logout(refreshToken: string): Promise<boolean> {

    const payload = this.jwtService.verify(refreshToken);

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

  // ➕ CREATE USER
  public async createUser(user: IUser): Promise<IUser> {

    const existUser = await this.prisma.user.findFirst({
      where: {
        name: user.name,
        lastname: user.lastname
      }
    });

    if (existUser) {
      throw new Error('User already exists');
    }

    return await this.prisma.user.create({
      data: {
        name: user.name,
        lastname: user.lastname
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

      const tasks = await this.prisma.task.findMany({
        where: { id: id }
      });

      if (tasks.length > 0) {
        throw new Error();
      }

      await this.prisma.user.delete({
        where: { id }
      });

      return true;

    } catch {
      return false;
    }

  }

}