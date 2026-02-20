import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './modules/auth/auth.controller';
import { AuthService } from './modules/auth/auth.service';
import { TaskController } from './modules/task/interface/task.controller';
import { TaskService } from './modules/task/interface/task.service';

describe('Controllers', () => {
  let authController: AuthController;
  let taskController: TaskController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController, TaskController],
      providers: [AuthService, TaskService],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    taskController = module.get<TaskController>(TaskController);
  });

  it('AuthController should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('TaskController should be defined', () => {
    expect(taskController).toBeDefined();
  });
});
