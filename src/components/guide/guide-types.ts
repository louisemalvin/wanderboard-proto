export interface GuideActivity {
  id: string;
  time: string;
  title: string;
  description: string;
  type: "activity" | "food" | "transit" | "note";
  status: "completed" | "current" | "upcoming";
  duration?: string;
  location?: string;
}
