import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Param,
  Body,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authSvc: AuthService) {}

  // GET /auth — lista de usuarios
  @Get()
  async getUsers() {
    return await this.authSvc.getUsers();
  }

  // GET /auth/profile — perfil del usuario autenticado
  @Get('profile')
  async getProfile(@Req() req: Request) {
    return await this.authSvc.getProfile(req);
  }

  // GET /auth/:id — usuario por ID
  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return await this.authSvc.getUserById(id);
  }

  // POST /auth/register — registro
  @Post('register')
  async createUser(@Body() user: CreateUserDto, @Req() req: Request) {
    return await this.authSvc.createUser(user, req);
  }

  // PUT /auth/:id — actualizar usuario
  @Put(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() user: UpdateUserDto,
    @Req() req: Request,
  ) {
    const requester = (req as any).user;
  }

  // DELETE /auth/:id — eliminar usuario
  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return await this.authSvc.deleteUser(id);
  }

  // POST /auth/login
  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Req() req: Request,
  ) {
    return await this.authSvc.login(body.email, body.password, req);
  }

  // POST /auth/refresh-token
  @Post('refresh-token')
  async refreshToken(@Body() body: { refreshToken: string }) {
    return await this.authSvc.refreshToken(body.refreshToken);
  }

  // POST /auth/logout
  @Post('logout')
  async logout(@Body() body: { refreshToken: string }) {
    return await this.authSvc.logout(body.refreshToken);
  }
}
