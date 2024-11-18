import { Body, Controller, Get, Param, Delete, Post, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService){}

  @Get()
  findAll(){
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string){
    return this.usersService.findOne(parseInt(id));
  }

  @Post()
  create(@Body() body:CreateUserDto){
    return this.usersService.create(body);
  }
  
  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateUserDto){
    return this.usersService.update(parseInt(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string){
    return this.usersService.remove(parseInt(id));
  }
}
