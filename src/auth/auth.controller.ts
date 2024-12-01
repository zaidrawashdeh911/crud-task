import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { Tokens } from './types';
import { RtGuard } from '../common/guards/rt.guard';
import { GetCurrentUser, GetCurrentUserId, Public } from '../common/decorators/index';
import { RoleGuard } from 'src/common/guards';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService){}

  @Public()
  @Post('local/signup')
  @HttpCode(HttpStatus.CREATED)
  signupLocal(@Body() dto: CreateUserDto): Promise<Tokens>{
    return this.authService.signupLocal(dto);
  }

  @Public()
  @Post('local/signin')
  @HttpCode(HttpStatus.OK)
  signinLocal(@Body() dto: CreateUserDto): Promise<Tokens>{
    return this.authService.signinLocal(dto);
  }
  
  @Post('signout')
  @HttpCode(HttpStatus.OK)
  signout(@GetCurrentUserId() userId: number){
    return this.authService.logout(userId);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string){
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @UseGuards(RoleGuard)
  @Post('addAdmin')
  changeToAdmin(@GetCurrentUserId() userId: number): Promise<Tokens>{
    return this.authService.changeToAdmin(userId);
  }

  @UseGuards(RoleGuard)
  @Post('removeAdmin')
  changeToEmployee(@GetCurrentUserId() userId: number): Promise<Tokens>{
    return this.authService.changeToEmployee(userId);
  }

  @Get('getRole')
  @UseGuards(RoleGuard)
  async getRole(@GetCurrentUser('email') email: string){
    const isAdmin = await this.authService.getRole(email);
    return {email,isAdmin};
  }

  @Get('getUserRole')
  @UseGuards(RoleGuard)
  async getUsersRole(@GetCurrentUser('email') requesterEmail: string, @Query('email') email: string) {
    console.log(`Requester: ${requesterEmail}, Checking Role For: ${email}`);
    const userRole = await this.authService.getUsersRole(email);

    return userRole;
  }
}
