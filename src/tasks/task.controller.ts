import { Controller, Post, Get, Body, Param, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dtos/create-task.dto';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { GetCurrentUser } from '../common/decorators/get-current-user.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Post('/create')
  async createTask(@Body() createTaskDto: CreateTaskDto, @GetCurrentUser() user) {
    return this.taskService.createTask(createTaskDto, user.id);
  }

  @Get(':id')
  async getTask(@Param('id',ParseIntPipe) id: number) {
    return this.taskService.getTaskById(id);
  }

  @Get()
  async getTasks(@Query('owner') ownerUsername: string, @GetCurrentUser() user: any) {
    if (ownerUsername !== user.username) {
      throw new Error('You can only view your own tasks.');
    }
    return this.taskService.getTasksForUser(ownerUsername);
  }
}
