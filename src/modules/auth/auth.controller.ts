import {
  Controller, Get, Post, Delete, Put,
  Param, Body, ParseIntPipe, Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type { Request }   from 'express';
import { AuthService }    from './auth.service';
import { CreateUserDto }  from './dto/create-user.dto';
import { UpdateUserDto }  from './dto/update-user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

  constructor(private authSvc: AuthService) {}

  // GET /auth/profile — debe ir ANTES de :id para evitar conflicto
  @Get('profile')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  async getProfile(@Req() req: Request) {
    return await this.authSvc.getProfile(req);
  }

  // GET /auth — lista de usuarios (datos filtrados)
  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios (sin datos sensibles)' })
  async getUsers() {
    return await this.authSvc.getUsers();
  }

  // GET /auth/:id — usuario por ID (datos filtrados)
  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return await this.authSvc.getUserById(id);
  }

  // POST /auth/register
  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  async createUser(@Body() user: CreateUserDto, @Req() req: Request) {
    return await this.authSvc.createUser(user, req);
  }

  // PUT /auth/:id — IDOR prevention: solo el propio usuario puede editar
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar usuario (solo nombre y apellido)' })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() user: UpdateUserDto,
    @Req() req: Request,
  ) {
    // Leer requesterId del JWT para prevención IDOR
    try {
      const token   = req.headers?.authorization?.split(' ')[1];
      const payload = token ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()) : null;
      return await this.authSvc.updateUser(id, user, payload?.id);
    } catch {
      return await this.authSvc.updateUser(id, user, undefined);
    }
  }

  // DELETE /auth/:id
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar usuario' })
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return await this.authSvc.deleteUser(id);
  }

  // POST /auth/login
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  async login(
    @Body() body: { email: string; password: string },
    @Req() req: Request,
  ) {
    return await this.authSvc.login(body.email, body.password, req);
  }

  // POST /auth/refresh-token
  @Post('refresh-token')
  @ApiOperation({ summary: 'Renovar access token' })
  async refreshToken(@Body() body: { refreshToken: string }) {
    return await this.authSvc.refreshToken(body.refreshToken);
  }

  // POST /auth/logout
  @Post('logout')
  @ApiOperation({ summary: 'Cerrar sesión' })
  async logout(@Body() body: { refreshToken: string }) {
    return await this.authSvc.logout(body.refreshToken);
  }

}