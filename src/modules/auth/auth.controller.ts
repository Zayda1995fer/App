import { Controller, Get, Post, Delete, Put, Param, Body, ParseIntPipe, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import * as userInterface from './interfaces/user.interface';
import { Request } from 'express';

@Controller('auth')
export class AuthController {

  constructor(private authSvc: AuthService) {}

  @Get()
  public async getUsers(): Promise<userInterface.IUser[]> {
    return await this.authSvc.getUsers();
  }

  @Get(':id')
  public async getUserById(
    @Param('id', ParseIntPipe) id: number
  ): Promise<userInterface.IUser | null> {
    return await this.authSvc.getUserById(id);
  }

  @Post('register')
  public async createUser(
    @Body() user: userInterface.IUser
  ): Promise<userInterface.IUser> {
    return await this.authSvc.createUser(user);
  }

  @Put(':id')
  public async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() user: userInterface.IUser
  ): Promise<userInterface.IUser> {
    return await this.authSvc.updateUser(id, user);
  }

  @Delete(':id')
  public async deleteUser(
    @Param('id', ParseIntPipe) id: number
  ): Promise<boolean> {
    return await this.authSvc.deleteUser(id);
  }

  // 🔐 LOGIN
  @Post('login')
  public async login(
    @Body() body: { email: string; password: string }
  ): Promise<any> {
    return await this.authSvc.login(body.email, body.password);
  }

  // 👤 OBTENER PERFIL
  @Get('profile')
  public async getProfile(@Req() req: Request): Promise<any> {
    return await this.authSvc.getProfile(req);
  }

  // 🔄 REFRESH TOKEN
  @Post('refresh-token')
  public async refreshToken(
    @Body() body: { refreshToken: string }
  ): Promise<any> {
    return await this.authSvc.refreshToken(body.refreshToken);
  }

  // 🚪 LOGOUT
  @Post('logout')
  public async logout(
    @Body() body: { refreshToken: string }
  ): Promise<boolean> {
    return await this.authSvc.logout(body.refreshToken);
  }

}