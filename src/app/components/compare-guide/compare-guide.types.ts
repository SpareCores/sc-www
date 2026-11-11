export interface CompareGuideItem {
  id?: string;
  title: string;
  type?: "section" | "card";
  description?: string;
  hide_description_in_index?: boolean;
  query?: string;
  instances?: Record<string, string>[];
}
