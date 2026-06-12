import { useState } from 'react';
import { AlertTriangle, ChevronRight, LayoutDashboard, Flag } from 'lucide-react';
import { cn } from '../../lib/cn';
import { ScoreRow } from '../shared/ScoreRow';
import { ProgressBar } from '../shared/ProgressBar';
import { ERROR_FLAG_LABELS, ALL_ERROR_FLAGS, type AnnotationItem, type Score1to5, type ErrorFlag } from '../../types';
import { useAnnotationForm } from '../../hooks/useAnnotation';
import { overallProgress } from '../../lib/stats';

interface AnnotationScreenProps {
  item: AnnotationItem;
  allItems: AnnotationItem[];
  onSave: (patch: Partial<AnnotationItem>) => void;
  onDashboard: () => void;
}

export function AnnotationScreen({ item, allItems, onSave, onDashboard }: AnnotationScreenProps) {
  const form = useAnnotationForm(item);
  const { done, total } = overallProgress(allItems);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    if (!form.isValid) return;

    onSave({
      d1: form.d1,
      d2: form.d2,
      d3: form.d3,
      d4: form.d4,
      error_flags: form.flags,
      remark: form.remark,
    });
    setSubmitted(false);
  };

  const itemIndex = allItems
    .filter(i => !i.completed)
    .findIndex(i => i.item_id === item.item_id);
  const pendingCount = allItems.filter(i => !i.completed).length;

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-ink-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <span className="text-xs font-mono font-semibold text-ink-400 uppercase tracking-widest flex-shrink-0">
            SAFE-SO
          </span>
          <ProgressBar done={done} total={total} className="flex-1" />
          <button
            onClick={onDashboard}
            className="flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink-800 transition-colors"
          >
            <LayoutDashboard size={14} />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Item meta */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-ink-400">{item.sentence_id}</span>
              {item.is_reference && (
                <span className="px-2 py-0.5 text-xs font-medium bg-signal-violet/10 text-signal-violet rounded-full border border-signal-violet/20">
                  Gold Reference
                </span>
              )}
            </div>
            <p className="text-xs text-ink-400">
              {pendingCount > 0 ? `${pendingCount} remaining` : 'Last item'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-ink-300">
              #{done + 1} of {total}
            </span>
          </div>
        </div>

        {/* Source sentence */}
        <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-5">
          <p className="text-xs font-mono uppercase tracking-widest text-ink-400 mb-3">Source (English)</p>
          <p className="text-base text-ink-800 leading-relaxed">{item.source_sentence}</p>
        </div>

        {/* Translation output — BLIND (system name not shown) */}
        <div className={cn(
          'rounded-2xl border shadow-sm p-5',
          item.is_reference
            ? 'bg-signal-violet/5 border-signal-violet/20'
            : 'bg-white border-ink-100'
        )}>
          <p className="text-xs font-mono uppercase tracking-widest text-ink-400 mb-3">
            {item.is_reference ? 'Reference Translation (Nepali)' : 'Translation Output (Nepali)'}
          </p>
          <p className="text-lg font-devanagari text-ink-900 leading-loose font-medium">
            {item.system_output}
          </p>
        </div>

        {/* Scoring form */}
        <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-5 space-y-6">
          {item.is_reference ? (
            // Reference: only D4
            <ScoreRow
              label="D4 · Reference Comprehension"
              description="How naturally readable and comprehensible is this reference Nepali sentence?"
              value={form.d4}
              onChange={v => form.setD4(v as Score1to5)}
              dimKey="d4"
              required={submitted && form.d4 === null}
            />
          ) : (
            <>
              <ScoreRow
                label="D1 · Adequacy"
                description="How much meaning from the source sentence is preserved?"
                value={form.d1}
                onChange={v => form.setD1(v as Score1to5)}
                dimKey="d1"
                required={submitted && form.d1 === null}
              />
              <div className="border-t border-ink-50" />
              <ScoreRow
                label="D2 · Fluency"
                description="Is the translation grammatical and natural-sounding in Nepali?"
                value={form.d2}
                onChange={v => form.setD2(v as Score1to5)}
                dimKey="d2"
                required={submitted && form.d2 === null}
              />
              <div className="border-t border-ink-50" />
              <ScoreRow
                label="D3 · Structural Naturalness"
                description="Does the sentence follow natural Nepali SOV word order?"
                value={form.d3}
                onChange={v => form.setD3(v as Score1to5)}
                dimKey="d3"
                required={submitted && form.d3 === null}
              />

              {/* Error Flags */}
              <div className="border-t border-ink-50 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Flag size={13} className="text-ink-400" />
                  <span className="text-xs font-mono uppercase tracking-widest text-ink-500">
                    Structural Error Flags
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_ERROR_FLAGS.map(flag => (
                    <button
                      key={flag}
                      type="button"
                      onClick={() => form.toggleFlag(flag)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all',
                        form.flags.includes(flag)
                          ? 'bg-signal-amber/10 border-signal-amber text-signal-amber font-medium'
                          : 'bg-ink-50 border-ink-200 text-ink-600 hover:bg-ink-100'
                      )}
                    >
                      <span className={cn(
                        'w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0',
                        form.flags.includes(flag)
                          ? 'bg-signal-amber border-signal-amber'
                          : 'border-ink-300'
                      )}>
                        {form.flags.includes(flag) && (
                          <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 fill-white">
                            <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </span>
                      {ERROR_FLAG_LABELS[flag]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Remark */}
              <div className="border-t border-ink-50 pt-4">
                <div className="flex items-baseline justify-between mb-2">
                  <label className="text-xs font-mono uppercase tracking-widest text-ink-500">
                    Remark
                  </label>
                  {form.requiresRemark && (
                    <span className="flex items-center gap-1 text-xs text-signal-red font-medium">
                      <AlertTriangle size={11} />
                      Required (D1 ≤ 2 or D3 ≤ 2)
                    </span>
                  )}
                  {!form.requiresRemark && (
                    <span className="text-xs text-ink-400">Optional</span>
                  )}
                </div>
                <textarea
                  value={form.remark}
                  onChange={e => form.setRemark(e.target.value)}
                  placeholder={form.requiresRemark
                    ? 'Briefly describe the specific error (e.g. "Verb placed after object")'
                    : 'Optional note…'
                  }
                  rows={2}
                  className={cn(
                    'w-full px-3 py-2.5 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-signal-blue focus:border-transparent placeholder:text-ink-300',
                    submitted && form.requiresRemark && !form.remark.trim()
                      ? 'border-red-400 bg-red-50'
                      : 'border-ink-200'
                  )}
                />
              </div>
            </>
          )}

          {/* Validation summary */}
          {submitted && !form.isValid && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">
                {item.is_reference
                  ? 'Please score D4 before continuing.'
                  : 'Please complete all required scores' + (form.requiresRemark && !form.remark.trim() ? ' and add a remark.' : '.')
                }
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="w-full flex items-center justify-center gap-2 py-3 bg-ink-900 text-white font-medium text-sm rounded-xl hover:bg-ink-800 active:scale-[0.99] transition-all"
          >
            Save and continue
            <ChevronRight size={16} />
          </button>
        </div>
      </main>
    </div>
  );
}
