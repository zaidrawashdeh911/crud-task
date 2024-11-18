import { PrismaClient } from "@prisma/client";
import { Injectable } from "@nestjs/common";
import { Public } from "@prisma/client/runtime/library";

@Injectable()
export class PrismaService{
  public prismaClient: PrismaClient;

  constructor(){
    this.prismaClient= new PrismaClient();
  }
}