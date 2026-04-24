import { SetMetadata } from '@nestjs/common';

// Decorator para marcar qué roles pueden acceder a una ruta
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);