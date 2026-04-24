import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

// ── Enums exportados ──────────────────────────────────────────
export enum AuditAction {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED  = 'LOGIN_FAILED',
  LOGOUT        = 'LOGOUT',
  REGISTER      = 'REGISTER',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  TASK_CREATED  = 'TASK_CREATED',
  TASK_UPDATED  = 'TASK_UPDATED',
  TASK_DELETED  = 'TASK_DELETED',
  USER_UPDATED  = 'USER_UPDATED',
  USER_DELETED  = 'USER_DELETED',
  ROLE_CHANGED  = 'ROLE_CHANGED',
  UNAUTHORIZED  = 'UNAUTHORIZED',
  FORBIDDEN     = 'FORBIDDEN',
}

export enum AuditSeverity {
  INFO     = 'INFO',
  WARNING  = 'WARNING',
  ERROR    = 'ERROR',
  CRITICAL = 'CRITICAL',
}

@Injectable()
export class AuditService {

  constructor(private prisma: PrismaService) {}

  /**
   * Registrar un evento de auditoría.
   * Si la tabla aún no existe (antes de migración), no interrumpe el flujo.
   */
  async log(
  userId:   number | null,
  action:   AuditAction,
  severity: AuditSeverity,
  details:  string,
  ip?:      string,
): Promise<void> {
  try {
    // Si userId es 0 o inválido, guardar como null para evitar FK violation
    const safeUserId = userId && userId > 0 ? userId : null;

    await (this.prisma as any).auditLog.create({
      data: {
        userId:    safeUserId,
        action,
        severity,
        details,
        ip:        ip || 'unknown',
        createdAt: new Date(),
      },
    });
  } catch (err) {
    console.error('[AuditService] Error al registrar log:', err);
  }
}

  /**
   * Obtener logs con filtros — solo ADMIN.
   */
  async getLogs(filters: {
    userId?:   number;
    action?:   string;
    severity?: string;
    dateFrom?: Date;
    dateTo?:   Date;
    page?:     number;
    limit?:    number;
  }) {
    const { userId, action, severity, dateFrom, dateTo, page = 1, limit = 20 } = filters;

    const where: any = {};
    if (userId)   where.userId   = userId;
    if (action)   where.action   = action;
    if (severity) where.severity = severity;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo)   where.createdAt.lte = dateTo;
    }

    try {
      const [logs, total] = await Promise.all([
        (this.prisma as any).auditLog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip:    (page - 1) * limit,
          take:    limit,
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        }),
        (this.prisma as any).auditLog.count({ where }),
      ]);

      return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
    } catch {
      return { logs: [], total: 0, page, limit, totalPages: 0 };
    }
  }
  

}