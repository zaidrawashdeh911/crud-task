import { ForbiddenException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt'; 
import { PrismaService } from "src/prisma/prisma.service";
import { CreateUserDto } from "src/users/dtos/create-user.dto";
import { Tokens } from "./types";

@Injectable()
export class AuthService{
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService){}

  hashData(data:string){
    return bcrypt.hash(data,10);
  }

  async getTokens(userId: number, email: string, role: boolean) {
    const [at, rt] = await Promise.all([
      
      this.jwtService.signAsync({
        sub: userId,
        email,
        role
      }, {
        secret: 'at-secret',
        expiresIn: 60*15,
      }),
      this.jwtService.signAsync({
        sub: userId,
        email,
        role
      }, {
        secret: 'rt-secret',
        expiresIn: 60*60*24*7,
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt
    };
  }

  async updateRtHash(userId:number, rt: string){
    const hash = await this.hashData(rt);
    await this.prisma.user.update({
      where:{
        id: userId
      },
      data:{
        hashedRt: hash
      }
    })
  }

  async verifyAdminRole(userId: number): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
  
    if (!user || !user.role) {
      throw new ForbiddenException('Access Denied: Admins only');
    }
  }

  async signupLocal(dto: CreateUserDto): Promise<Tokens>{
    const hash = await this.hashData(dto.password);

    const newUser = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        password: hash,
        role: false
      }
    });

    const tokens = await this.getTokens(newUser.id, newUser.email, newUser.role);
    //console.log('Generated Access Token:', tokens.access_token);
    await this.updateRtHash(newUser.id, tokens.refresh_token);
    return tokens;
  }

  async signinLocal(dto: CreateUserDto): Promise<Tokens>{
    const user = await this.prisma.user.findUnique({
      where:{
        email: dto.email
      }
    });

    if(!user){
      throw new ForbiddenException('access denied');
    }
    
    const validatePassword = await bcrypt.compare(dto.password,user.password);
    if(!validatePassword){
      throw new ForbiddenException('access denied');
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);
    //console.log('Generated Access Token:', tokens.access_token);
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async logout(userId: number){
    await this.prisma.user.updateMany({
      where:{
        id: userId,
        hashedRt:{
          not:null
        },
      },
      data:{
        hashedRt: null
      }
    })
  }

  async refreshTokens(userId: number, rt: string){
    const user = await this.prisma.user.findUnique({
      where:{
        id:userId
      }
    });
    if(!user || !user.hashedRt)
    {
      throw new ForbiddenException("access denied");
    }

    const rtMatches = await bcrypt.compare(rt, user.hashedRt);
    if(!rtMatches){
      throw new ForbiddenException("Access Denied");
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async changeToAdmin(userId: number):Promise<Tokens>{
    await this.verifyAdminRole(userId);

    const user = await this.prisma.user.findFirst({
      where:{
        id:userId
      }
    })
    
    await this.prisma.user.update({
      where:{
        id:userId
      },
      data:{
        role:true
      }
    })
    
   
    const tokens = await this.getTokens(user.id,user.email, user.role);
    await this.updateRtHash(user.id, tokens.refresh_token);
    console.log('added Admin!');
    return tokens;
  }

  async changeToEmployee(userId: number):Promise<Tokens>{
    await this.verifyAdminRole(userId);
    
    const user = await this.prisma.user.findFirst({
      where:{
        id:userId
      }
    })
    
    await this.prisma.user.update({
      where:{
        id:userId
      },
      data:{
        role:false
      }
    })
   
    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRtHash(user.id, tokens.refresh_token);
    console.log('removed Admin!');
    return tokens;
  }

  async getRole(email: string): Promise<boolean>{

    const user = await this.prisma.user.findUnique({
      where: {
        email:email
      }
    })
    
    if (!user) {
      throw new Error('User not found');
    }
  
    return user.role;

  }

  async getUsersRole(email: string): Promise<{ email: string; userRole: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
  
    if (!user) {
      throw new Error('User not found');
    }
    const role = user.role ? 'admin': 'employee';
    return { email: user.email, userRole: role };
  }
  
}