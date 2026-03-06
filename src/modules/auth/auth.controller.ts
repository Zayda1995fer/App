import { Controller, Get, Post, Delete, Put, Param, Body, ParseIntPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import * as userInterface from './interfaces/user.interface';

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

}