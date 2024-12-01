import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: any){
    const exists = await this.prisma.user.findUnique({
      where: {
        email:data.email
      }
    })
    if (exists) throw new ConflictException('email exists');
    
    return this.prisma.user.create({data});
  }

  findAll(){
    return this.prisma.user.findMany();
  }

  findOne(id: number){
    return this.prisma.user.findUnique({
      where:{id}
    });
  }

  find(email: string){
    return this.prisma.user.findFirst({
      where:{email}
    });
  }

  async update(id: number, data: any){
    return this.prisma.user.update({
      where: {id},
      data
    });
  }

  async remove(id:number){
    return this.prisma.user.delete({
      where: {id}
    });
  }
}
