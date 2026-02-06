import { Injectable } from '@nestjs/common';

@Injectable()
export class TaskService {
  login(): string {
    return 'Tarea Acabada';
  }
}
