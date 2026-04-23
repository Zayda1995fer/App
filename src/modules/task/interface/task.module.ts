import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { PrismaService } from '../../../prisma.service';

// modulo de tareas 

@Module({
  controllers: [TaskController],
  providers: [TaskService, PrismaService],
})
export class TaskModule {}