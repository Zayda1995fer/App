import { Body, Controller, Delete, Param, ParseIntPipe, Post, Put, UsePipes } from '@nestjs/common';
import { Get } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from '../dto/create-task.dto';
@Controller('api/tasks')
//@UsePipes(ValidationPipe) realizar un pipe de manera interna
export class TaskController {
  constructor(private taskSvc: TaskService) {}

  @Get()
  public async getTasks(): Promise<any[]> {
    return await this.taskSvc.getTasks();
  }

  @Get(":id")
  public getTasksById(@Param("id", ParseIntPipe) id: number): string {
    return this.taskSvc.getTaskById(id);
  }

  @Post()
  public insertTask(@Body() task: CreateTaskDto): string {
    return this.taskSvc.insert(task);
  }

  @Put("/:id")
  public updateTask(@Param("id", ParseIntPipe) id: number, @Body() task: any) {
    return this.taskSvc.update(id, task);
  }

  @Delete(":id")
  public deleteTask(@Param(":id") id: string) {
    return this.taskSvc.delete(parseInt(id));
  }
}