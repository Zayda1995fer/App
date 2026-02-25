import { Body, Controller, Delete, Get, HttpException, HttpStatus, NotFoundException, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from '../dto/create-task.dto';

@Controller('api/task')
export class TaskController {
  constructor(private readonly taskSvc: TaskService) { }

  @Get()
  public async getTask(): Promise<any> {
    return await this.taskSvc.getTasks();
  }

  @Get(':id')
  public async getTaskById(@Param("id", ParseIntPipe) id: number): Promise<any> {
    const result = await this.taskSvc.getTaskById(id);
    console.log("resultado",result);
  
    if(result == undefined){
        //throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
        throw new HttpException(`Tarea con ID ${id} no encontrada`, HttpStatus.NOT_FOUND);   
    }
    return result;
  }

  @Post()
  public insertTask(@Body() task: CreateTaskDto) {
    const result = this.taskSvc.insertTasks(task);

    if (result == undefined)
        throw new HttpException("Tarea no registrada", HttpStatus.INTERNAL_SERVER_ERROR); 
      
    return result;
  }

  @Put(":id")
  public updateTask(@Param("id", ParseIntPipe) id: number,@Body() task: any) {
    return this.taskSvc.updateTask(id, task);
  }

  @Delete(':id')
  public deleteTask(@Param("id", ParseIntPipe) id: number) {
    return this.taskSvc.deleteTask(id);
  }
}