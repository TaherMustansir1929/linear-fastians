import { SUBJECTS, Subject } from "@/types";

export { SUBJECTS };
export type { Subject };

export const socialLinks = {
  discord: "https://discord.gg/fRQCqK89EF",
  github: "https://github.com/TaherMustansir1929",
};

export const DUMMY_DASHBOARD_DATA = {
  userStats: {
    total_views: 12500,
    reputation_score: 845,
    total_upvotes: 420,
    total_downvotes: 12,
  },
  myDocs: [
    {
      title: "Calculus I Final Review",
      view_count: 1450,
      created_at: "2024-01-15T10:00:00Z",
    },
    {
      title: "Physics Mechanics Notes",
      view_count: 980,
      created_at: "2024-02-10T14:30:00Z",
    },
    {
      title: "Intro to CS Algorithms",
      view_count: 2300,
      created_at: "2024-03-05T09:15:00Z",
    },
    {
      title: "History of art",
      view_count: 200,
      created_at: "2024-03-05T09:15:00Z",
    },
    {
      title: "Chemistry Lab Report",
      view_count: 150,
      created_at: "2024-04-20T11:45:00Z",
    },
  ],
  viewsOverTime: [
    { month: "Jan 2024", value: 450 },
    { month: "Feb 2024", value: 890 },
    { month: "Mar 2024", value: 1200 },
    { month: "Apr 2024", value: 980 },
    { month: "May 2024", value: 1450 },
  ],
  uploadsOverTime: [
    { month: "Jan 2024", value: 2 },
    { month: "Feb 2024", value: 5 },
    { month: "Mar 2024", value: 3 },
    { month: "Apr 2024", value: 1 },
    { month: "May 2024", value: 4 },
  ],
  recentDocs: [
    {
      id: "1",
      document: {
        title: "Organic Chemistry II",
        subject: "Other",
        uploader_name: "Sarah C.",
      },
      accessed_at: "2024-05-20T10:00:00Z",
    },
    {
      id: "2",
      document: {
        title: "Data Structures BFS/DFS",
        subject: "PF",
        uploader_name: "Mike R.",
      },
      accessed_at: "2024-05-19T14:30:00Z",
    },
    {
      id: "3",
      document: {
        title: "Macroeconomics 101",
        subject: "Other",
        uploader_name: "Jessica P.",
      },
      accessed_at: "2024-05-18T09:00:00Z",
    },
  ],
  subjectInterests: [
    { subject: "CAL", score: 120 },
    { subject: "AP", score: 98 },
    { subject: "PF", score: 86 },
    { subject: "FE", score: 65 },
    { subject: "IST", score: 40 },
    { subject: "Other", score: 55 },
  ],
  totalTimeSeconds: 124500, // ~34.5 hours
};
