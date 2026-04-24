import {
  Body, Controller, Delete, Get, HttpException,
  HttpStatus, Param, ParseIntPipe, Post, Put, Req, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { TaskService }    from './task.service';
import { CreateTaskDto }  from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update.task.dto';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('api/task')
export class TaskController {

  constructor(private readonly taskSvc: TaskService) {}

  // Helper para extraer usuario del JWT del request
  private getRequester(req: Request): { id: number; role: string } {
    const user = (req as any).user;
    return { id: user?.id || 0, role: user?.role || 'user' };
  }

  @Get()
  @ApiOperation({ summary: 'Obtener tareas del usuario autenticado' })
  async getTask(@Req() req: Request) {
    const { id, role } = this.getRequester(req);
    return await this.taskSvc.getTasks(id, role);
  }

  @Get(':id')
  async getTaskById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const { id: requesterId, role } = this.getRequester(req);
    return await this.taskSvc.getTaskById(id, requesterId, role);
  }

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

  @Put(':id')
  async updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() task: UpdateTaskDto,
    @Req() req: Request,
  ) {
    const { id: requesterId, role } = this.getRequester(req);
    return await this.taskSvc.updateTask(id, task, requesterId, role);
  }

  @Delete(':id')
  async deleteTask(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const { id: requesterId, role } = this.getRequester(req);
    return await this.taskSvc.deleteTask(id, requesterId, role);
  }

}