export type Risk = "critical" | "high" | "medium" | "low" | "info";
export type CardStatus = "todo" | "doing" | "done";
export type WriteMode = "merge" | "append" | "replace" | "new";
export type JsonRecord = Record<string, unknown>;

export interface Card extends JsonRecord {
  id: string;
  title: string;
  data?: string;
  templateId?: string;
  mcpKey?: string;
  icon?: string;
  desc?: string;
  risk?: Risk;
  status?: CardStatus;
  tags?: string[];
  createdAt?: number;
  updatedAt?: number;
}

export interface Connection extends JsonRecord {
  id: string;
  source: string;
  target: string;
  type?: string;
}

export interface Target extends JsonRecord {
  id: string;
  name: string;
  cards: Card[];
  connections?: Connection[];
}

export interface WorkspaceData extends JsonRecord {
  targets: Target[];
  currentTargetId: string | null;
}

export interface WorkspaceState {
  exists: boolean;
  revision: number;
  data: WorkspaceData | null;
  settings: JsonRecord | null;
  updated_at: string | null;
}

export interface SourceInfo {
  agent: string;
  tool: string;
  run_id?: string;
  scanned_at?: string;
}

export interface CardWrite {
  card_key: string;
  title: string;
  content: string;
  template_id?: string;
  icon?: string;
  description?: string;
  write_mode: WriteMode;
  risk: Risk;
  status: CardStatus;
  tags: string[];
}

export interface ActivityRow {
  id: number;
  kind: string;
  message: string;
  source: string | null;
  created_at: string;
  revision: number;
}
