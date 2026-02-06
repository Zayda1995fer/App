import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { TaskService } from './task.service';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  getTasks() {
    return this.taskService.getTasks();
  }

  @Get(':id')
  getTaskById(@Param('id') id: number) {
    return this.taskService.getTasksById(Number(id));
  }

  @Post()
  insertTask(@Body() task: any) {
    return this.taskService.insert(task);
  }

  @Put(':id')
  updateTask(@Param('id') id: number, @Body() task: any) {
    return this.taskService.update(Number(id), task);
  }

  @Delete(':id')
  deleteTask(@Param('id') id: number) {
    return this.taskService.delete(Number(id));
  }
}
