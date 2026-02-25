import { Inject, Injectable } from '@nestjs/common';
import { CreateTaskDto } from '../dto/create-task.dto';

@Injectable()
export class TaskService {

    constructor(@Inject('PG_CONNECTION') private db: any) { }

    private tasks: any[] = [];

    async getTasks() {
        const query = 'SELECT * FROM tasks';
        const result = await this.db.query(query);
        return result.rows;
    }

    async getTaskById(id: number): Promise<any> {
        const query = 'SELECT * FROM tasks WHERE id = $1';
        const result = await this.db.query(query, [id]);
        return result.rows[0];
    }
    async insertTasks(task: CreateTaskDto): Promise<any> {
        const sql = `INSERT INTO tasks (name, description, priority, user_id) VALUES ('${task.name}', '${task.description}', '${task.priority}', ${task.user_id}) RETURNING id`;
        const result = await this.db.query(sql);
        const insertId = result.insertId;
        const row = await this.getTaskById(insertId);
        return row;
    }

    async updateTask(id: number, taskUpdate: any): Promise<any> {
       const task = await this.getTaskById(id);

       task.name = taskUpdate.name ?? task.name;
        task.description = taskUpdate.description ?? task.description;
        task.priority = taskUpdate.priority ?? task.priority;

        // Convertir el objeto a un SET
        //const sets = Object.keys(taskUpdate)
        //.map(key => `${key} = '${taskUpdate[key]}'`).join(', ');
        //const query = `UPDATE tasks SET ${sets} WHERE id = ${id}`;
        //await this.db.query(query);
        //return await this.getTaskById(id);
       
    }

    deleteTask(id: number): string {
        const array = this.getTasks();
        const initialLength = this.tasks.length;

        this.tasks = this.tasks.filter(task => task.id !== id);

        if (this.tasks.length < initialLength) {
            return "Tarea eliminada correctamente";
        } else {
            return "Tarea no encontrada";
        }
    }
}