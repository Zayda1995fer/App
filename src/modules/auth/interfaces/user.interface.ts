export interface IUser {
  id?: number;
  name: string;
  lastname?: string | null;
  email: string;
  password: string;
  refreshToken?: string | null;
  createdAt?: Date;
}
