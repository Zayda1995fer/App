import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TaskService {
  private tasks: any[] = [];

  public getTask() {
    return this.tasks;
  }
  public getTaskById(id: number): any {
    var task = this.tasks.find((t) => t.id == id);
    return task;
  }

  public insert(task: CreateTaskDto): string {
    var id = this.tasks.length + 1;
    var insertedTask = this.tasks.push({
      ...task,
      id,
    });
  
    return this.tasks[insertedTask - 1];
  }

  public update(id: number, task: any) {
    const taskUpdate = this.tasks.map(t => {
      if (t.id == id) {
        if (task.name) t.name = task.name;
        if (task.description) t.description = task.description;
        if (task.priority) t.priority = task.priority;    
      return t;
      }
      return t;
    });
    return taskUpdate;
  }

  public delete(id: number): string {
    const array = this.tasks.filter(t => t.id != id);
    this.tasks = array;
    return `Tarea con ID: ${id}, eliminada`;
  }
}