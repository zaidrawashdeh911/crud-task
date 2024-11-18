import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(){
    return this.prisma.prismaClient.user.findMany();
  }

  async findOne(id: number){
    return this.prisma.prismaClient.user.findUnique({
      where:{id}
    });
  }

  async create(data: any){
    return this.prisma.prismaClient.user.create({data});
  }

  async update(id: number, data: any){
    return this.prisma.prismaClient.user.update({
      where: {id},
      data
    });
  }

  async remove(id:number){
    return this.prisma.prismaClient.user.delete({
      where: {id}
    });
  }
}
