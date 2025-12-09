export const SUBJECTS = [
  "Calculus",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "History",
  "Literature",
  "Economics",
  "Psychology",
  "Sociology",
] as const;

export type Subject = (typeof SUBJECTS)[number];

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
        subject: "Chemistry",
        uploader_name: "Sarah C.",
      },
      accessed_at: "2024-05-20T10:00:00Z",
    },
    {
      id: "2",
      document: {
        title: "Data Structures BFS/DFS",
        subject: "Computer Science",
        uploader_name: "Mike R.",
      },
      accessed_at: "2024-05-19T14:30:00Z",
    },
    {
      id: "3",
      document: {
        title: "Macroeconomics 101",
        subject: "Economics",
        uploader_name: "Jessica P.",
      },
      accessed_at: "2024-05-18T09:00:00Z",
    },
  ],
  subjectInterests: [
    { subject: "Calculus", score: 120 },
    { subject: "Physics", score: 98 },
    { subject: "CS", score: 86 },
    { subject: "Economics", score: 65 },
    { subject: "History", score: 40 },
    { subject: "Biology", score: 55 },
  ],
  totalTimeSeconds: 124500, // ~34.5 hours
};
