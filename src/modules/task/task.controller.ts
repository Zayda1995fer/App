import { Controller, Get } from '@nestjs/common';

@Controller('task')
export class TaskController {
  @Get('tasks')
  login() {
    return 'Tareas Completadas';
  }
}
