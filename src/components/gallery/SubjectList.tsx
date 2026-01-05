import { Card } from "@/components/ui/card";
import { SUBJECTS } from "@/types";
import { useQueryState } from "nuqs";

// Default muted monochrome style
const BASE_STYLE =
  "bg-card border-border/60 text-muted-foreground transition-all duration-300";

// Muted, desaturated hover colors for each subject
const HOVER_STYLES: Record<string, string> = {
  CAL: "hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-600/90 dark:hover:text-blue-400/90",
  AP: "hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-600/90 dark:hover:text-purple-400/90",
  PF: "hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-600/90 dark:hover:text-green-400/90",
  FE: "hover:bg-orange-500/10 hover:border-orange-500/30 hover:text-orange-600/90 dark:hover:text-orange-400/90",
  ICP: "hover:bg-pink-500/10 hover:border-pink-500/30 hover:text-pink-600/90 dark:hover:text-pink-400/90",
  IST: "hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-600/90 dark:hover:text-indigo-400/90",
  Other:
    "hover:bg-gray-500/10 hover:border-gray-500/30 hover:text-gray-600/90 dark:hover:text-gray-400/90",
};

export function SubjectList() {
  const [subject, setSubject] = useQueryState("subject");

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      {SUBJECTS.map((sub) => (
        <Card
          key={sub}
          className={`cursor-pointer border p-6 flex items-center justify-center font-bold text-xl h-32 hover:scale-105 ${BASE_STYLE} ${
            HOVER_STYLES[sub] || HOVER_STYLES["Other"]
          } ${subject === sub ? "ring-2 ring-primary bg-accent/50" : ""}`}
          onClick={() => setSubject(sub)}
        >
          {sub}
        </Card>
      ))}
    </div>
  );
}
