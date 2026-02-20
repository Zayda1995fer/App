import { Inject, Injectable } from '@nestjs/common';
import { CreateTaskDto } from '../dto/create-task.dto';


@Injectable()
export class TaskService {

  constructor(
    @Inject('MYSQL_CONNECTION') private db: any,
  ) {}

  private tasks: any[] = [];

  public getTasks(): Promise<any> {
    const query = 'SELECT * FROM tasks';
    const [result]: any = this.db.query(query);

    return result;
  }

  public getTaskById(id: number): string {
    var task = this.tasks.find((t) => t.id === id);
    return `Tarea con el id: ${id}`;
  }

  public insert(task: CreateTaskDto): any {
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
    const array = this.tasks.filter(t => t.id !== id);
    this.tasks = array;
    return "Tarea eliminada correctamente";
  }
}