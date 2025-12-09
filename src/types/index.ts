export type FileType = "pdf" | "md" | "html" | "latex" | "txt";

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
  view_count: number;
  upvote_count: number;
  downvote_count: number;
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  reputation_score: number;
  total_views: number;
  total_upvotes: number;
  total_downvotes: number;
  role: string;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  document_id: string;
  content: string;
  created_at: string;
  upvote_count: number;
  downvote_count: number;
  user?: User; // Joined
}

export const SUBJECTS = [
  "Calculus (CAL)",
  "Applied Physics (AP)",
  "Programming Fundamentals (PF)",
  "Functional English (FE)",
  "Ideology and Constitution of Pakistan (ICP)",
  "Islamic Studies (IST)",
  "Other",
] as const;
