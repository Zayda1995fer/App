import {
  Controller, Get, Query, UseGuards,
  ParseIntPipe, Optional,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard }   from '../../common/guards/roles.guard';
import { Roles }        from '../../common/guards/roles.decorator';                         

/**
 * Controlador de Auditoría.
 * Solo usuarios con rol ADMIN pueden consultar los logs.
 * Los usuarios estándar no tienen acceso a estas rutas.
 */
@ApiTags('Auditoría')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit')
export class AuditController {

  constructor(private readonly auditSvc: AuditService) {}

  /**
   * GET /audit/logs
   * Obtener logs con filtros por fecha, usuario y severidad.
   * Solo ADMIN puede acceder.
   */
  @Get('logs')
  @Roles('admin')
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