export type House = {
  id: number;
  name: string;
  join_code: string;
  member_count: number;
  role: 'owner' | 'member';
};