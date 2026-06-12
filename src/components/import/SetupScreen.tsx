import { useRef, useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/cn';

interface SetupScreenProps {
  onImport: (file: File, annotatorId: string) => void;
  isLoading: boolean;
  error: string | null;
  hasExistingData: boolean;
  onResume: () => void;
  onReset: () => void;
}

export function SetupScreen({ onImport, isLoading, error, hasExistingData, onResume, onReset }: SetupScreenProps) {
  const [annotatorId, setAnnotatorId] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext ?? '')) {
      alert('Please upload an .xlsx, .xls, or .csv file.');
      return;
    }
    setSelectedFile(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleSubmit = () => {
    if (!selectedFile || !annotatorId.trim()) return;
    onImport(selectedFile, annotatorId.trim());
  };

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-xs font-mono font-semibold text-ink-400 uppercase tracking-widest">
              SAFE-SO
            </span>
            <span className="w-px h-3 bg-ink-300" />
            <span className="text-xs font-mono text-ink-400">v1.0 | Dev - Anudeep Sh 🦢</span>
          </div> 
          <h1 className="text-3xl font-semibold text-ink-900 leading-tight">
            Annotation Tool
          </h1>
          <p className="mt-2 text-ink-500 text-sm">
            Simplified Analytic Framework for Evaluation — Syntactic Order
          </p>
        </div>

        {/* Resume banner */}
        {hasExistingData && (
          <div className="mb-6 p-4 bg-signal-blue/5 border border-signal-blue/20 rounded-xl flex items-start gap-3">
            <div className="mt-0.5 w-2 h-2 rounded-full bg-signal-blue flex-shrink-0 mt-2" />
            <div className="flex-1">
              <p className="text-sm font-medium text-ink-800">Session in progress</p>
              <p className="text-xs text-ink-500 mt-0.5">You have existing annotation data in this browser.</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={onResume}
                  className="px-4 py-1.5 bg-signal-blue text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Resume
                </button>
                <button
                  onClick={onReset}
                  className="px-4 py-1.5 text-ink-600 text-sm font-medium rounded-lg border border-ink-200 hover:bg-ink-100 transition-colors"
                >
                  Start over
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Import form */}
        <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">
              Annotator ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={annotatorId}
              onChange={e => setAnnotatorId(e.target.value)}
              placeholder="e.g. annotator_01"
              className="w-full px-3 py-2 text-sm border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-signal-blue focus:border-transparent placeholder:text-ink-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">
              Dataset file <span className="text-red-500">*</span>
            </label>
            <div
              className={cn(
                'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors',
                dragOver ? 'border-signal-blue bg-signal-blue/5' : 'border-ink-200 hover:border-ink-300',
                selectedFile && 'border-signal-green bg-signal-green/5'
              )}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              {selectedFile ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText size={18} className="text-signal-green" />
                  <span className="text-sm font-medium text-ink-800">{selectedFile.name}</span>
                </div>
              ) : (
                <>
                  <Upload size={22} className="mx-auto mb-2 text-ink-400" />
                  <p className="text-sm text-ink-500">
                    Drop your file here or <span className="text-signal-blue font-medium">browse</span>
                  </p>
                  <p className="text-xs text-ink-400 mt-1">.xlsx, .xls, .csv</p>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!selectedFile || !annotatorId.trim() || isLoading}
            className="w-full py-2.5 bg-ink-900 text-white font-medium text-sm rounded-xl hover:bg-ink-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Importing and randomizing…' : 'Load dataset and start'}
          </button>
        </div>

        {/* Expected format hint */}
        <div className="mt-4 p-4 bg-ink-100 rounded-xl">
          <p className="text-xs font-mono text-ink-500 mb-2 uppercase tracking-wider">Expected columns</p>
          <p className="text-xs text-ink-500 font-mono leading-relaxed">
            sentence_id · english · nepali_reference<br />
            config_A_direct · config_B_pivot_Ja · config_C_pivot_ko<br />
            config_D_pivot_Tr · config_E_pivot_Fr · config_F_pivot_Hi
          </p>
        </div>
      </div>
    </div>
  );
}
