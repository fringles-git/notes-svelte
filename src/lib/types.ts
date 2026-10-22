export type ThemeMode = 'system' | 'light' | 'dark';

export type TabKey = 'notes' | 'library' | 'search' | 'settings';

export type NoteColor = 'amber' | 'sage' | 'slate' | 'rose';

export interface Note {
  id: string;
  title: string;
  body: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
  archived: boolean;
  color: NoteColor;
}
