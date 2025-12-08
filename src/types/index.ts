export type FileType = 'pdf' | 'md' | 'html' | 'latex' | 'txt';

export interface Document {
  id: string;
  title: string;
  file_path: string;
  file_type: FileType;
  subject: string;
  tags: string[] | null;
  user_id: string;
  uploader_name?: string | null;
  uploader_avatar?: string | null;
  created_at: string;
}

export const SUBJECTS = [
  'Calculus (CAL)',
  'Applied Physics (AP)',
  'Programming Fundamentals (PF)',
  'Functional English (FE)',
  'Ideology and Constitution of Pakistan (ICP)',
  'Islamic Studies (IST)',
  'Other'
] as const;
