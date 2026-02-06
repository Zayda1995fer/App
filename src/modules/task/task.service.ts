import { Injectable } from '@nestjs/common';

@Injectable()
export class TaskService {
  public getTasks() {
    return 'Lista de tareas';
  }

  public getTasksById(id: number): string {
    return `Tarea con ID ${id}`;
  }

  public insert(task: any): string {
    return `Tarea insertada: ${task}`;
  }

  public update(id: number, task: any) {
    return `Tarea con ID ${id} actualizada con ${task}`;
  }

  public delete(id: number): string {
    return `Tarea con ID ${id} eliminada`;
  }
}
