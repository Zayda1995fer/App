import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { IUser } from '../auth/interfaces/user.interface';

@Injectable()
export class UsersService {

  constructor(private prisma: PrismaService) {}

  async getUsers(): Promise<any[]> {
    return await this.prisma.user.findMany();
  }

  async getUserById(id: number): Promise<any> {
    return await this.prisma.user.findUnique({
      where: { id }
    });
  }

  async createUser(user: IUser): Promise<any> {
    return await this.prisma.user.create({
      data: {
        name:     user.name,
        lastname: user.lastname,
        email:    user.email,
        password: user.password,
      }
    });
  }

  async updateUser(id: number, user: IUser): Promise<any> {
    return await this.prisma.user.update({
      where: { id },
      data: {
        name:     user.name,
        lastname: user.lastname,
      }
    })
    return user;
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      await this.prisma.user.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

}