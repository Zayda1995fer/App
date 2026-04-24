import { Module }      from '@nestjs/common';
import { AuthModule }  from './modules/auth/auth.module';
import { TaskModule }  from './modules/task/interface/task.module';
import { UsersModule } from './modules/users/users.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    AuthModule,
    TaskModule,
    UsersModule,
    AuditModule,
  ],
})
export class AppModule {}