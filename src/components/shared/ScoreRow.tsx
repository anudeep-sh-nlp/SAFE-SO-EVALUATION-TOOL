import { cn } from '../../lib/cn';
import type { Score1to5 } from '../../types';

const SCORE_LABELS: Record<Score1to5, string> = {
  1: '1', 2: '2', 3: '3', 4: '4', 5: '5',
};

const COLOR_MAP: Record<Score1to5, string> = {
  1: 'bg-red-100 border-red-400 text-red-800 hover:bg-red-200 data-[selected=true]:bg-red-500 data-[selected=true]:text-white data-[selected=true]:border-red-500',
  2: 'bg-orange-50 border-orange-300 text-orange-800 hover:bg-orange-100 data-[selected=true]:bg-orange-400 data-[selected=true]:text-white data-[selected=true]:border-orange-400',
  3: 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100 data-[selected=true]:bg-amber-400 data-[selected=true]:text-white data-[selected=true]:border-amber-400',
  4: 'bg-lime-50 border-lime-400 text-lime-800 hover:bg-lime-100 data-[selected=true]:bg-lime-500 data-[selected=true]:text-white data-[selected=true]:border-lime-500',
  5: 'bg-green-50 border-green-500 text-green-800 hover:bg-green-100 data-[selected=true]:bg-green-600 data-[selected=true]:text-white data-[selected=true]:border-green-600',
};

interface ScoreButtonProps {
  score: Score1to5;
  selected: boolean;
  onClick: (s: Score1to5) => void;
  label?: string;
}

export function ScoreButton({ score, selected, onClick, label }: ScoreButtonProps) {
  return (
    <button
      type="button"
      data-selected={selected}
      onClick={() => onClick(score)}
      title={label}
      className={cn(
        'flex flex-col items-center justify-center w-12 h-12 rounded-lg border-2 font-semibold text-lg transition-all duration-100 focus:outline-none focus:ring-2 focus:ring-signal-blue focus:ring-offset-1 select-none',
        COLOR_MAP[score]
      )}
    >
      {SCORE_LABELS[score]}
    </button>
  );
}

const D1_LABELS: Record<Score1to5, string> = {
  1: 'None', 2: 'Little', 3: 'Most', 4: 'Full', 5: 'Complete',
};
const D2_LABELS: Record<Score1to5, string> = {
  1: 'Unreadable', 2: 'Disfluent', 3: 'Acceptable', 4: 'Good', 5: 'Native-like',
};
const D3_LABELS: Record<Score1to5, string> = {
  1: 'English order', 2: 'Mostly SVO', 3: 'Mixed', 4: 'Mostly SOV', 5: 'Native SOV',
};
const D4_LABELS: Record<Score1to5, string> = {
  1: 'Unclear', 2: 'Requires effort', 3: 'Understandable', 4: 'Clear', 5: 'Effortless',
};

export const SCORE_LABELS_BY_DIM = { d1: D1_LABELS, d2: D2_LABELS, d3: D3_LABELS, d4: D4_LABELS };

interface ScoreRowProps {
  label: string;
  description: string;
  value: Score1to5 | null;
  onChange: (s: Score1to5) => void;
  dimKey: 'd1' | 'd2' | 'd3' | 'd4';
  required?: boolean;
}

export function ScoreRow({ label, description, value, onChange, dimKey, required }: ScoreRowProps) {
  const labels = SCORE_LABELS_BY_DIM[dimKey];
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-2">
        <span className="text-xs font-mono font-semibold text-ink-500 uppercase tracking-widest">{label}</span>
        {required && value === null && (
          <span className="text-xs text-red-500">Required</span>
        )}
      </div>
      <p className="text-sm text-ink-600 -mt-1">{description}</p>
      <div className="flex items-center gap-2 mt-1">
        {([1, 2, 3, 4, 5] as Score1to5[]).map(s => (
          <ScoreButton
            key={s}
            score={s}
            selected={value === s}
            onClick={onChange}
            label={labels[s]}
          />
        ))}
        {value !== null && (
          <span className="ml-2 text-sm text-ink-500 italic">{labels[value]}</span>
        )}
      </div>
    </div>
  );
}
