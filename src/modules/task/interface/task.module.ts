import { Module }          from '@nestjs/common';
import { TaskController }  from './task.controller';
import { TaskService }     from './task.service';
import { AuditModule }     from '../../audit/audit.module';
import { PrismaService }   from '../../../prisma.service';

@Module({
  imports:     [AuditModule],
  controllers: [TaskController],
  providers:   [TaskService, PrismaService],
})
export class TaskModule {}