export interface ITask {
  id: number;
  name: string;
  description: string;
  priority: boolean | null;
  userId: number;
}