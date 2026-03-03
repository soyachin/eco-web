export interface NoteMeta {
  title?: string;
  tags?: string[];
  date?: string;
}

export interface Note {
  slug: string;
  snippet?: string;
  meta: NoteMeta;
}

export interface PreviewState {
  active: boolean;
  x: number;
  y: number;
  note: Note | null;
}

export interface Backlink extends Note {
  date?: string;
}

export interface TagPageData {
  tag: string;
  notes: Note[];
}

export interface LayoutData {
  notes: Note[];
  backlinksMap: Record<string, Backlink[]>;
}
