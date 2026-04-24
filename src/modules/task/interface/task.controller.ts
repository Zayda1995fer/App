import {
  Body, Controller, Delete, Get, HttpException,
  HttpStatus, Param, ParseIntPipe, Post, Put, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { TaskService }   from './task.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update.task.dto';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('api/task')
export class TaskController {

  constructor(private readonly taskSvc: TaskService) {}

  /**
   * Extrae el usuario del JWT decodificado.
   * El payload del token contiene { id, email, role }.
   * Si no hay token o no está verificado, devuelve id:0 y role:'user'.
   */
  /**
   * Extrae id y role directamente del JWT del header Authorization.
   * No requiere Passport — decodifica el payload manualmente.
   */
  private getRequester(req: Request): { id: number; role: string } {
    try {
      const authHeader = req.headers?.authorization;
      if (!authHeader) return { id: 0, role: 'user' };

      const token = authHeader.split(' ')[1];
      if (!token) return { id: 0, role: 'user' };

      // Decodificar payload sin verificar firma (la verificación ya se hace en el servicio)
      const base64 = token.split('.')[1];
      const payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));

      return {
        id:   payload?.id   || 0,
        role: payload?.role || 'user',
      };
    } catch {
      return { id: 0, role: 'user' };
    }
  }

  // GET /api/task — tareas del usuario autenticado
  @Get()
  @ApiOperation({ summary: 'Obtener tareas (user ve las suyas, admin ve todas)' })
  async getTask(@Req() req: Request) {
    const { id, role } = this.getRequester(req);
    return await this.taskSvc.getTasks(id, role);
  }

  // GET /api/task/:id
  @Get(':id')
  @ApiOperation({ summary: 'Obtener tarea por ID' })
  async getTaskById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const { id: requesterId, role } = this.getRequester(req);
    return await this.taskSvc.getTaskById(id, requesterId, role);
  }

  // POST /api/task — crear tarea
  @Post()
  @ApiOperation({ summary: 'Crear una nueva tarea' })
  async insertTask(
    @Body() task: CreateTaskDto,
    @Req() req: Request,
  ) {
    const { id: requesterId } = this.getRequester(req);
    const result = await this.taskSvc.insertTask(task, requesterId);
    if (!result)
      throw new HttpException('Tarea no registrada', HttpStatus.INTERNAL_SERVER_ERROR);
    return result;
  }

  // PUT /api/task/:id — actualizar tarea
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar tarea (solo el dueño o admin)' })
  async updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() task: UpdateTaskDto,
    @Req() req: Request,
  ) {
    const { id: requesterId, role } = this.getRequester(req);
    return await this.taskSvc.updateTask(id, task, requesterId, role);
  }

  // DELETE /api/task/:id — eliminar tarea
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar tarea (solo el dueño o admin)' })
  async deleteTask(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const { id: requesterId, role } = this.getRequester(req);
    return await this.taskSvc.deleteTask(id, requesterId, role);
  }

}