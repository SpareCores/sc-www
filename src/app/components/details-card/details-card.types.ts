export interface DetailsCardTooltip {
  key: string;
  content: string;
}

export interface DetailsCardRow {
  id: string;
  name: string;
  detail?: string;
  values: string[];
  routerLink?: string[] | string;
  tooltips?: DetailsCardTooltip[];
  warning?: string;
}

export interface DetailsCardSection {
  name: string;
  columns?: string[];
  rows: DetailsCardRow[];
  emptyText?: string;
}

export interface DetailsRowInput {
  id: string;
  name: string;
  value: unknown;
  description?: string;
  routerLink?: string[] | string;
}
