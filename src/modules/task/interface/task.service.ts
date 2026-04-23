//service de task

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update.task.dto';
import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async getTasks(): Promise<Task[]> {
    return await this.prisma.task.findMany();
  }

  async getTaskById(id: number): Promise<Task> {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
    }

    return task;
  }

  async insertTask(dto: CreateTaskDto): Promise<Task> {
    const task = await this.prisma.task.create({
      data: {
        name: dto.name,
        description: dto.description,
        priority: dto.priority,
        userId: dto.user_id,
      },
    });

    return task;
  }

  async updateTask(id: number, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.prisma.task.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        priority: dto.priority,
        userId: dto.user_id,
      },
    });

    return task;
  }

  async deleteTask(id: number): Promise<boolean> {
    try {
      await this.prisma.task.delete({
        where: { id },
      });

      return true;
    } catch {
      return false;
    }
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
}