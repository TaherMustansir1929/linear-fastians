export type FileType = "pdf" | "md" | "html" | "latex" | "txt";

export interface Document {
  id: string;
  title: string;
  filePath: string;
  fileType: FileType;
  subject: string;
  tags: string[] | null;
  userId: string;
  uploaderName?: string | null;
  uploaderAvatar?: string | null;
  createdAt: string;
  viewCount: number;
  upvoteCount: number;
  downvoteCount: number;
}

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  reputationScore: number;
  totalViews: number;
  totalUpvotes: number;
  totalDownvotes: number;
  role: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  documentId: string;
  content: string;
  createdAt: string;
  upvoteCount: number;
  downvoteCount: number;
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
