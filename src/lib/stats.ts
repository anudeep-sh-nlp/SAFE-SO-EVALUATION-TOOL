import type { AnnotationItem, SystemStats, ErrorFlag, Score1to5 } from '../types';
import { ALL_ERROR_FLAGS } from '../types';

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return +(nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2);
}

export function computeStats(items: AnnotationItem[]): SystemStats[] {
  const map = new Map<string, AnnotationItem[]>();
  for (const item of items) {
    const existing = map.get(item.system_name) ?? [];
    existing.push(item);
    map.set(item.system_name, existing);
  }

  const stats: SystemStats[] = [];

  for (const [system_name, sysItems] of map.entries()) {
    const completed = sysItems.filter(i => i.completed);
    const flag_counts = Object.fromEntries(
      ALL_ERROR_FLAGS.map(f => [f, completed.filter(i => i.error_flags.includes(f)).length])
    ) as Record<ErrorFlag, number>;

    stats.push({
      system_name,
      count: sysItems.length,
      completed: completed.length,
      avg_d1: avg(completed.map(i => i.d1).filter((v): v is Score1to5 => v !== null).map(Number)),
      avg_d2: avg(completed.map(i => i.d2).filter((v): v is Score1to5 => v !== null).map(Number)),
      avg_d3: avg(completed.map(i => i.d3).filter((v): v is Score1to5 => v !== null).map(Number)),
      avg_d4: avg(completed.map(i => i.d4).filter((v): v is Score1to5 => v !== null).map(Number)),
      flag_counts,
    });
  }

  return stats.sort((a, b) => a.system_name.localeCompare(b.system_name));
}

export function overallProgress(items: AnnotationItem[]): { done: number; total: number; pct: number } {
  const total = items.length;
  const done = items.filter(i => i.completed).length;
  return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
}
