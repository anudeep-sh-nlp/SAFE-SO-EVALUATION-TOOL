import { cn } from '../../lib/cn';

interface ProgressBarProps {
  done: number;
  total: number;
  className?: string;
}

export function ProgressBar({ done, total, className }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex-1 bg-ink-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-signal-blue rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-ink-500 whitespace-nowrap">{done}/{total}</span>
    </div>
  );
}
