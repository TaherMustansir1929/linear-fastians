export type FileType = "pdf" | "md" | "html" | "latex" | "txt";

export interface Document {
  id: string;
  title: string;
  filePath: string;
  fileType: FileType;
  subject: Subject;
  category: DocumentCategory;
  tags: string[] | null;
  userId: string;
  uploaderName?: string | null;
  uploaderAvatar?: string | null;
  createdAt: string;
  viewCount: number;
  upvoteCount: number;
  downvoteCount: number;
  uploader?: User | null;
  verificationStatus: "unverified" | "processing" | "verified";
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
  "CAL",
  "AP",
  "PF",
  "FE",
  "ICP",
  "IST",
  "OOPS",
  "CCE",
  "EW",
  "DLD",
  "MVC",
  "UOS",
  "PST",
  "Other",
] as const;

export type Subject = (typeof SUBJECTS)[number];

export const DOCUMENT_CATEGORIES = [
  "Notes",
  "Past Papers",
  "Assignments",
  "Books",
  "Formulas",
  "Quizzes",
  "Slides",
  "Outlines",
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];
