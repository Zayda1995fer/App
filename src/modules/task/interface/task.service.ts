import { Inject, Injectable } from '@nestjs/common';
import { CreateTaskDto } from '../dto/create-task.dto';


@Injectable()
export class TaskService {

  constructor(
    @Inject('MYSQL_CONNECTION') private db: any,
  ) {}

  private tasks: any[] = [];

  public async getTasks(): Promise<any> {
    const query = 'SELECT * FROM tasks';
    const [result]: any = await this.db.query(query);

    return result;
  }

  public getTaskById(id: number): string {
    var task = this.tasks.find((t) => t.id === id);
    return `Tarea con el id: ${id}`;
  }

  public async insert(task: CreateTaskDto): Promise<any> {
  const query = 'INSERT INTO tasks (name, description, priority, user_id) VALUES (?, ?, ?, ?)';
  const [result]: any = await this.db.execute(query, [
    task.name,
    task.description,
    task.priority,
    task.user_id
  ]);
  return result;
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