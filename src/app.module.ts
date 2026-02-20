import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { AuthService } from './modules/auth/auth.service';
import { TaskModule } from './modules/task/interface/task.module';

@Module({
  imports: [
    AuthModule,
    TaskModule

  ],
 
})
export class AppModule {}
