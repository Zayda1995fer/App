// ============================================================
// common/guards/jwt-auth.guard.ts
// Guard que verifica el JWT en cada petición protegida
// ============================================================
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw new UnauthorizedException('Token inválido o sesión expirada.');
    }
    return user;
  }
}