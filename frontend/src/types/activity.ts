export type ActivityLog = {
  id: number;
  action: string;
  description: string;
  user: { id: number; name: string } | null;
  project: { id: number; name: string } | null;
  created_at: string;
};