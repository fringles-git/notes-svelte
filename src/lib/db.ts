import Dexie, { type Table } from 'dexie';
import type { Note } from '$lib/types';

export class QuickNotesDatabase extends Dexie {
  notes!: Table<Note, string>;

  constructor() {
    super('quick-notes-db');

    this.version(1).stores({
      notes: 'id, updatedAt, pinned, archived, title'
    });
  }
}

export const db = new QuickNotesDatabase();
