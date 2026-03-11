export class User {
  id: number;
  name: string;
  lastname: string | null;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}