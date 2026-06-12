import { useMemo } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Cell,
} from 'recharts';
import { Download, Play, RefreshCw, CheckCircle2, Clock, BarChart2 } from 'lucide-react';
import { cn } from '../../lib/cn';
import { ProgressBar } from '../shared/ProgressBar';
import { computeStats, overallProgress } from '../../lib/stats';
import { exportToXLSX, exportToCSV } from '../../lib/exporter';
import { ERROR_FLAG_LABELS, ALL_ERROR_FLAGS, type AnnotationItem } from '../../types';

const SYSTEM_COLORS: Record<string, string> = {
  'Direct':        '#2563eb',
  'Pivot-Ja':      '#7c3aed',
  'Pivot-Ko':      '#db2777',
  'Pivot-Tr':      '#d97706',
  'Pivot-Fr':      '#16a34a',
  'Pivot-Hi':      '#0891b2',
  'Gold Reference':'#6b7280',
};

function colorFor(name: string): string {
  return SYSTEM_COLORS[name] ?? '#8b5cf6';
}

interface DashboardProps {
  allItems: AnnotationItem[];
  onResume: () => void;
  onReset: () => void;
  annotatorId: string;
}

export function DashboardScreen({ allItems, onResume, onReset, annotatorId }: DashboardProps) {
  const stats = useMemo(() => computeStats(allItems), [allItems]);
  const { done, total, pct } = useMemo(() => overallProgress(allItems), [allItems]);
  const pending = total - done;

  // Radar data: D1, D2, D3 avg per system (excluding reference)
  const radarData = useMemo(() => {
    const dims = ['D1 Adequacy', 'D2 Fluency', 'D3 Structure'];
    return dims.map((dim, i) => {
      const entry: Record<string, unknown> = { dim };
      for (const s of stats.filter(s => s.system_name !== 'Gold Reference')) {
        entry[s.system_name] = [s.avg_d1, s.avg_d2, s.avg_d3][i] ?? 0;
      }
      return entry;
    });
  }, [stats]);

  // Bar chart: avg scores per system
  const barData = useMemo(() =>
    stats
      .filter(s => s.system_name !== 'Gold Reference')
      .map(s => ({
        name: s.system_name,
        D1: s.avg_d1 ?? 0,
        D2: s.avg_d2 ?? 0,
        D3: s.avg_d3 ?? 0,
      })),
    [stats]
  );

  // Flag chart
  const flagData = useMemo(() =>
    ALL_ERROR_FLAGS.map(f => {
      const entry: Record<string, unknown> = { name: ERROR_FLAG_LABELS[f] };
      for (const s of stats.filter(s => s.system_name !== 'Gold Reference')) {
        entry[s.system_name] = s.flag_counts[f];
      }
      return entry;
    }),
    [stats]
  );

  const nonRefSystems = stats.filter(s => s.system_name !== 'Gold Reference');

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-ink-100">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <span className="text-xs font-mono font-semibold text-ink-400 uppercase tracking-widest">
            SAFE-SO
          </span>
          <span className="text-xs text-ink-300">·</span>
          <div className="flex items-center gap-1.5">
            <BarChart2 size={13} className="text-ink-400" />
            <span className="text-xs text-ink-500">Dashboard</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            {pending > 0 && (
              <button
                onClick={onResume}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-signal-blue text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Play size={12} />
                Resume ({pending} left)
              </button>
            )}
            <button
              onClick={() => exportToXLSX(allItems)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-ink-600 text-xs font-medium border border-ink-200 rounded-lg hover:bg-ink-100 transition-colors"
            >
              <Download size={12} />
              XLSX
            </button>
            <button
              onClick={() => exportToCSV(allItems)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-ink-600 text-xs font-medium border border-ink-200 rounded-lg hover:bg-ink-100 transition-colors"
            >
              <Download size={12} />
              CSV
            </button>
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-ink-500 text-xs rounded-lg hover:bg-ink-100 transition-colors"
              title="Clear all data and start over"
            >
              <RefreshCw size={12} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Completed"
            value={`${pct}%`}
            sub={`${done} of ${total}`}
            icon={<CheckCircle2 size={16} className="text-signal-green" />}
          />
          <StatCard
            label="Pending"
            value={String(pending)}
            sub="items left"
            icon={<Clock size={16} className="text-signal-amber" />}
          />
          <StatCard
            label="Annotator"
            value={annotatorId}
            sub="session active"
            mono
          />
          <StatCard
            label="Systems"
            value={String(nonRefSystems.length)}
            sub="+ 1 reference"
          />
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-2xl border border-ink-100 p-4">
          <p className="text-xs font-mono text-ink-400 uppercase tracking-widest mb-3">Overall progress</p>
          <ProgressBar done={done} total={total} />
        </div>

        {/* Per-system table */}
        <div className="bg-white rounded-2xl border border-ink-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-ink-50">
            <p className="text-sm font-semibold text-ink-800">Scores by system</p>
            <p className="text-xs text-ink-400 mt-0.5">Averages across completed items</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ink-50 text-xs font-mono text-ink-500 uppercase tracking-wider">
                  <th className="px-5 py-3 text-left font-medium">System</th>
                  <th className="px-4 py-3 text-center font-medium">Done</th>
                  <th className="px-4 py-3 text-center font-medium">D1</th>
                  <th className="px-4 py-3 text-center font-medium">D2</th>
                  <th className="px-4 py-3 text-center font-medium">D3</th>
                  <th className="px-4 py-3 text-center font-medium">D4</th>
                </tr>
              </thead>
              <tbody>
                {stats.map(s => (
                  <tr key={s.system_name} className="border-t border-ink-50 hover:bg-ink-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ background: colorFor(s.system_name) }}
                        />
                        <span className="font-medium text-ink-800">{s.system_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        'px-2 py-0.5 rounded text-xs font-mono font-medium',
                        s.completed === s.count ? 'bg-green-100 text-green-700' : 'bg-ink-100 text-ink-600'
                      )}>
                        {s.completed}/{s.count}
                      </span>
                    </td>
                    {[s.avg_d1, s.avg_d2, s.avg_d3, s.avg_d4].map((v, i) => (
                      <td key={i} className="px-4 py-3 text-center">
                        {v !== null ? (
                          <span className={cn(
                            'font-mono font-semibold text-sm',
                            v >= 4 ? 'text-green-600' : v >= 3 ? 'text-amber-600' : 'text-red-500'
                          )}>
                            {v.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-ink-300 text-xs">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts row */}
        {done > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Bar chart */}
            <div className="bg-white rounded-2xl border border-ink-100 p-5">
              <p className="text-sm font-semibold text-ink-800 mb-1">Average scores (D1–D3)</p>
              <p className="text-xs text-ink-400 mb-4">Per system, excluding reference</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="D1" fill="#2563eb" radius={[3,3,0,0]} />
                  <Bar dataKey="D2" fill="#16a34a" radius={[3,3,0,0]} />
                  <Bar dataKey="D3" fill="#7c3aed" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Error flags */}
            <div className="bg-white rounded-2xl border border-ink-100 p-5">
              <p className="text-sm font-semibold text-ink-800 mb-1">Error flag counts</p>
              <p className="text-xs text-ink-400 mb-4">Per system, all flags</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={flagData} layout="vertical" margin={{ left: 0, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {nonRefSystems.map(s => (
                    <Bar key={s.system_name} dataKey={s.system_name} fill={colorFor(s.system_name)} radius={[0,3,3,0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Radar chart */}
        {done > 0 && nonRefSystems.length > 0 && (
          <div className="bg-white rounded-2xl border border-ink-100 p-5">
            <p className="text-sm font-semibold text-ink-800 mb-1">Dimensional profile</p>
            <p className="text-xs text-ink-400 mb-4">D1 / D2 / D3 radar per system</p>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="#e8e6e0" />
                <PolarAngleAxis dataKey="dim" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                {nonRefSystems.map(s => (
                  <Radar
                    key={s.system_name}
                    name={s.system_name}
                    dataKey={s.system_name}
                    stroke={colorFor(s.system_name)}
                    fill={colorFor(s.system_name)}
                    fillOpacity={0.08}
                    strokeWidth={2}
                  />
                ))}
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {done === 0 && (
          <div className="text-center py-12 text-ink-400">
            <BarChart2 size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Complete some annotations to see charts here.</p>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, sub, icon, mono }: {
  label: string;
  value: string;
  sub: string;
  icon?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-ink-100 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-ink-400">{label}</p>
        {icon}
      </div>
      <p className={cn('text-xl font-semibold text-ink-900 truncate', mono && 'font-mono text-base')}>
        {value}
      </p>
      <p className="text-xs text-ink-400 mt-0.5">{sub}</p>
    </div>
  );
}
