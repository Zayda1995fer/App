import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';

/**
 * AuditController — solo usuarios ADMIN pueden consultar logs.
 * El usuario estándar no tiene acceso a estas rutas.
 */
@ApiTags('Auditoría')
@ApiBearerAuth()
@Controller('audit')
export class AuditController {

  constructor(private readonly auditSvc: AuditService) {}

  /**
   * GET /audit/logs
   * Filtros: userId, action, severity, dateFrom, dateTo, page, limit
   */
  @Get('logs')
  @ApiOperation({ summary: 'Obtener logs de auditoría (solo ADMIN)' })
  async getLogs(
    @Query('userId')   userId?:   string,
    @Query('action')   action?:   string,
    @Query('severity') severity?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo')   dateTo?:   string,
    @Query('page')     page?:     string,
    @Query('limit')    limit?:    string,
  ) {
    return await this.auditSvc.getLogs({
      userId:   userId   ? parseInt(userId)   : undefined,
      action,
      severity,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo:   dateTo   ? new Date(dateTo)   : undefined,
      page:     page     ? parseInt(page)     : 1,
      limit:    limit    ? parseInt(limit)    : 20,
    });
  }

}