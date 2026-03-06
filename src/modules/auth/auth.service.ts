import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { IUser } from './interfaces/user.interface';


@Injectable()
export class AuthService {

  constructor(private prisma: PrismaService) {}

  public async getUsers(): Promise<IUser[]> {
    return await this.prisma.user.findMany();
  }

  public async getUserById(id: number): Promise<IUser | null> {
    return await this.prisma.user.findUnique({
      where: { id }
    });
  }

  public async createUser(user: IUser): Promise<IUser> {

    const existUser = await this.prisma.user.findFirst({
      where: {
        name: user.name,
        lastname: user.lastname
      }
    });

    if (existUser) {
      throw new Error();
    }

    return await this.prisma.user.create({
      data: {
        name: user.name,
        lastname: user.lastname
      }
    });

  }

  public async updateUser(id: number, user: IUser): Promise<IUser> {

    return await this.prisma.user.update({
      where: { id },
      data: {
        name: user.name,
        lastname: user.lastname
      }
    });

  }

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