import { Module } from "@nestjs/common";
import { TaskController } from "./task.controller";
import { TaskService } from "./task.service";
import { pgProvider } from "src/common/providers/pg.provider";

@Module({
  controllers: [TaskController],
  providers: [TaskService, pgProvider[0]],
})
export class TaskModule {}
