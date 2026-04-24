import {
  Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreateTaskDto }  from '../dto/create-task.dto';
import { UpdateTaskDto }  from '../dto/update.task.dto';
import { AuditService, AuditAction, AuditSeverity } from '../../audit/audit.service';

/**
 * TaskService con aislamiento de recursos.
 * Un usuario solo puede ver, actualizar y eliminar SUS PROPIAS tareas.
 * Usa Prisma (ORM) para consultas parametrizadas — prevención de SQL Injection.
 */
@Injectable()
export class TaskService {

  constructor(
    private prisma:   PrismaService,
    private auditSvc: AuditService,
  ) {}

  // ─────────────────────────────────────────────────────────
  // Obtener tareas — ADMIN ve todas, USER solo las suyas
  // ─────────────────────────────────────────────────────────
  async getTasks(requesterId: number, requesterRole: string): Promise<any[]> {
    const where = requesterRole === 'admin' ? {} : { userId: requesterId };
    return await this.prisma.task.findMany({ where, orderBy: { id: 'desc' } });
  }

  // ─────────────────────────────────────────────────────────
  // Obtener tarea por ID — verificar propiedad
  // ─────────────────────────────────────────────────────────
  async getTaskById(id: number, requesterId: number, requesterRole: string): Promise<any> {
    const task = await this.prisma.task.findUnique({ where: { id } });

    if (!task) throw new NotFoundException(`Tarea con ID ${id} no encontrada.`);

    // Aislamiento: usuario solo puede ver sus tareas
    if (requesterRole !== 'admin' && task.userId !== requesterId) {
      throw new ForbiddenException('No tienes acceso a esta tarea.');
    }

    return task;
  }

  // ─────────────────────────────────────────────────────────
  // Crear tarea — con auditoría
  // ─────────────────────────────────────────────────────────
  async insertTask(dto: CreateTaskDto, requesterId: number): Promise<any> {
    const task = await this.prisma.task.create({
      data: {
        name:        dto.name.trim(),
        description: dto.description.trim(),
        priority:    dto.priority,
        userId:      requesterId || dto.user_id, // siempre asignar al usuario autenticado
      },
    });

    await this.auditSvc.log(requesterId, AuditAction.TASK_CREATED, AuditSeverity.INFO,
      `Tarea creada: "${task.name}" (ID: ${task.id})`);

    return task;
  }

  // ─────────────────────────────────────────────────────────
  // Actualizar tarea — verificar propiedad (IDOR prevention)
  // ─────────────────────────────────────────────────────────
  async updateTask(
    id: number, dto: UpdateTaskDto,
    requesterId: number, requesterRole: string,
  ): Promise<any> {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException(`Tarea con ID ${id} no encontrada.`);

    // Solo el dueño o un admin puede actualizar
    if (requesterRole !== 'admin' && task.userId !== requesterId) {
      throw new ForbiddenException('No puedes modificar una tarea que no es tuya.');
    }

    const updated = await this.prisma.task.update({
      where: { id },
      data:  {
        name:        dto.name?.trim(),
        description: dto.description?.trim(),
        priority:    dto.priority,
      },
    });

    await this.auditSvc.log(requesterId, AuditAction.TASK_UPDATED, AuditSeverity.INFO,
      `Tarea actualizada: "${updated.name}" (ID: ${id})`);

    return updated;
  }

  // ─────────────────────────────────────────────────────────
  // Eliminar tarea — verificar propiedad
  // ─────────────────────────────────────────────────────────
  async deleteTask(id: number, requesterId: number, requesterRole: string): Promise<boolean> {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException(`Tarea con ID ${id} no encontrada.`);

    if (requesterRole !== 'admin' && task.userId !== requesterId) {
      throw new ForbiddenException('No puedes eliminar una tarea que no es tuya.');
    }

    await this.prisma.task.delete({ where: { id } });

    await this.auditSvc.log(requesterId, AuditAction.TASK_DELETED, AuditSeverity.WARNING,
      `Tarea eliminada: "${task.name}" (ID: ${id})`);

    return true;
  }

}