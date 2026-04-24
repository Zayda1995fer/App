import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService }  from '../../../prisma.service';
import { CreateTaskDto }  from '../dto/create-task.dto';
import { UpdateTaskDto }  from '../dto/update.task.dto';
import { AuditService, AuditAction, AuditSeverity } from '../../audit/audit.service';

/**
 * TaskService con aislamiento de recursos.
 * Usa Prisma ORM — prevención de SQL Injection con consultas parametrizadas.
 * Un usuario solo puede acceder a SUS PROPIAS tareas (REQUISITO).
 */
@Injectable()
export class TaskService {

  constructor(
    private prisma:   PrismaService,
    private auditSvc: AuditService,
  ) {}

  // ── Obtener tareas — solo las del usuario autenticado ────
  async getTasks(requesterId: number, requesterRole: string): Promise<any[]> {
    // ADMIN ve todas — USER solo las suyas (aislamiento de recursos)
    const where = requesterRole === 'admin' ? {} : { userId: requesterId };
    return await this.prisma.task.findMany({
      where,
      orderBy: { id: 'desc' },
    });
  }

  // ── Obtener tarea por ID — verificar propiedad ───────────
  async getTaskById(id: number, requesterId: number, requesterRole: string): Promise<any> {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException(`Tarea con ID ${id} no encontrada.`);

    // Aislamiento: usuario solo puede ver sus propias tareas
    if (requesterRole !== 'admin' && task.userId !== requesterId) {
      throw new ForbiddenException('No tienes acceso a esta tarea.');
    }

    return task;
  }

  // ── Crear tarea ──────────────────────────────────────────
  async insertTask(dto: CreateTaskDto, requesterId: number): Promise<any> {
    // Asignar siempre al usuario autenticado
    const ownerUserId = requesterId > 0 ? requesterId : dto.user_id;

    const task = await this.prisma.task.create({
      data: {
        name:        dto.name.trim(),
        description: dto.description.trim(),
        priority:    dto.priority,
        userId:      ownerUserId,
      },
    });

    await this.auditSvc.log(
      ownerUserId > 0 ? ownerUserId : null,
      AuditAction.TASK_CREATED,
      AuditSeverity.INFO,
      `Tarea creada: "${task.name}" (ID: ${task.id})`,
    );

    return task;
  }

  // ── Actualizar tarea — verificar propiedad (IDOR) ────────
  async updateTask(
    id: number, dto: UpdateTaskDto,
    requesterId: number, requesterRole: string,
  ): Promise<any> {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException(`Tarea con ID ${id} no encontrada.`);

    // Solo el dueño o admin puede actualizar
    if (requesterRole !== 'admin' && task.userId !== requesterId) {
      throw new ForbiddenException('No puedes modificar una tarea que no es tuya.');
    }

    const updated = await this.prisma.task.update({
      where: { id },
      data: {
        ...(dto.name        && { name:        dto.name.trim() }),
        ...(dto.description && { description: dto.description.trim() }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
      },
    });

    await this.auditSvc.log(
      requesterId > 0 ? requesterId : null,
      AuditAction.TASK_UPDATED,
      AuditSeverity.INFO,
      `Tarea actualizada: "${updated.name}" (ID: ${id})`,
    );

    return updated;
  }

  // ── Eliminar tarea — verificar propiedad ────────────────
  async deleteTask(id: number, requesterId: number, requesterRole: string): Promise<boolean> {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException(`Tarea con ID ${id} no encontrada.`);

    // Solo el dueño o admin puede eliminar
    if (requesterRole !== 'admin' && task.userId !== requesterId) {
      throw new ForbiddenException('No puedes eliminar una tarea que no es tuya.');
    }

    await this.prisma.task.delete({ where: { id } });

    await this.auditSvc.log(
      requesterId > 0 ? requesterId : null,
      AuditAction.TASK_DELETED,
      AuditSeverity.WARNING,
      `Tarea eliminada: "${task.name}" (ID: ${id})`,
    );

    return true;
  }

}