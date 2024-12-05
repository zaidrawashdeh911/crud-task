import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dtos/create-task.dto';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async createTask(dto: CreateTaskDto, ownerId: number) {
    const { title, description, picture, subTasks} = dto;

    const user =  await this.prisma.user.findUnique({
      where: {id: ownerId},
      select: {username: true}
    });

    if(!user){
      throw new NotFoundException('user not found');
    }

    const ownerUsername = user.username;
    
    const task = await this.prisma.task.create({
      data: {
        title,
        description,
        picture,
        ownerUsername,
        ownerId: ownerId,
      },
    });

    if (subTasks && subTasks.length > 0) {
      await this.createSubTasks(subTasks, task.id, ownerId, ownerUsername);
    }

    return task;
  }

  private async createSubTasks(subTasks: CreateTaskDto[], parentTaskId: number, ownerId: number, ownerUsername: string) {
    const subTaskData = subTasks.map((subTask) => ({
      title: subTask.title,
      description: subTask.description,
      picture: subTask.picture,
      ownerUsername,
      ownerId,
      parentTaskId,
    }));

    await this.prisma.task.createMany({
      data: subTaskData,
    });
  }

  async getTaskById(id: number) {
    return await this.prisma.task.findUnique({
      where: { id },
      include: {subTasks: true}
    });
  }

  async getTasksForUser(ownerUsername: string) {
    return await this.prisma.task.findMany({
      where: { ownerUsername },
      include: {subTasks: true}
    });
  }
}
