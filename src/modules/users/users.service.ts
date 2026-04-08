import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../task/entities/user.entity';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUsers(): Promise<User[]> {
    return await this.prisma.user.findMany();
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  async createUser(data: {
    name: string;
    lastname: string;
    email: string;
    password: string;
  }): Promise<User> {
    return await this.prisma.user.create({
      data,
    });
  }

  async updateUser(
    id: number,
    data: {
      name?: string;
      lastname?: string;
      email?: string;
      password?: string;
    },
  ): Promise<User> {
    return await this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }
}