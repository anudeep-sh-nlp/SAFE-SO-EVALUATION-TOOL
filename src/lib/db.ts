import Dexie, { type Table } from 'dexie';
import type { AnnotationItem, SessionConfig } from '../types';

export class SafeSoDB extends Dexie {
  items!: Table<AnnotationItem, number>;
  session!: Table<SessionConfig, string>;

  constructor() {
    super('safe_so_db');
    this.version(1).stores({
      items:   '++id, item_id, sentence_id, system_name, completed, randomization_order',
      session: 'annotator_id',
    });
  }
}

export const db = new SafeSoDB();

// ─── Helpers ──────────────────────────────────────────────────────────────────

export async function clearAllItems(): Promise<void> {
  await db.items.clear();
}

export async function upsertItem(item: AnnotationItem): Promise<void> {
  const existing = await db.items.where('item_id').equals(item.item_id).first();
  if (existing?.id != null) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.items.update(existing.id, item as any);
  } else {
    await db.items.add(item);
  }
}

export async function saveAnnotation(
  id: number,
  patch: Partial<AnnotationItem>
): Promise<void> {
  await db.items.update(id, { ...patch, timestamp: new Date().toISOString() });
}

export async function getAllItems(): Promise<AnnotationItem[]> {
  return db.items.orderBy('randomization_order').toArray();
}

export async function getNextPending(): Promise<AnnotationItem | undefined> {
  return db.items
    .orderBy('randomization_order')
    .filter(item => !item.completed)
    .first();
}

export async function getSession(): Promise<SessionConfig | undefined> {
  return db.session.toCollection().first();
}

export async function saveSession(config: SessionConfig): Promise<void> {
  await db.session.put(config);
}
