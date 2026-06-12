import * as XLSX from 'xlsx';
import type { AnnotationItem, ImportRow } from '../types';

// Maps column headers (case-insensitive, trimmed) to canonical keys
const COL_MAP: Record<string, keyof ImportRow> = {
  sentence_id:        'sentence_id',
  english:            'english',
  nepali_reference:   'nepali_reference',
  config_a_direct:    'config_A_direct',
  config_b_pivot_ja:  'config_B_pivot_Ja',
  config_c_pivot_ko:  'config_C_pivot_ko',
  config_d_pivot_tr:  'config_D_pivot_Tr',
  config_e_pivot_fr:  'config_E_pivot_Fr',
  config_f_pivot_hi:  'config_F_pivot_Hi',
  length_bucket:      'length_bucket',
  domain:             'domain',
};

// Maps system column key → display label (used internally; hidden during annotation)
export const SYSTEM_COLUMNS: Array<{ key: keyof ImportRow; label: string; isRef: boolean }> = [
  { key: 'config_A_direct',   label: 'Direct',        isRef: false },
  { key: 'config_B_pivot_Ja', label: 'Pivot-Ja',      isRef: false },
  { key: 'config_C_pivot_ko', label: 'Pivot-Ko',      isRef: false },
  { key: 'config_D_pivot_Tr', label: 'Pivot-Tr',      isRef: false },
  { key: 'config_E_pivot_Fr', label: 'Pivot-Fr',      isRef: false },
  { key: 'config_F_pivot_Hi', label: 'Pivot-Hi',      isRef: false },
  { key: 'nepali_reference',  label: 'Gold Reference', isRef: true  },
];

function normalizeKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, '_');
}

function parseRows(rawRows: Record<string, unknown>[]): ImportRow[] {
  return rawRows
    .map(row => {
      const normalized: Partial<ImportRow> = {};
      for (const [rawKey, val] of Object.entries(row)) {
        const canon = COL_MAP[normalizeKey(rawKey)];
        if (canon) {
          (normalized as Record<string, unknown>)[canon] = val != null ? String(val).trim() : '';
        }
      }
      return normalized as ImportRow;
    })
    .filter(r => r.sentence_id && r.english);
}

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function parseFile(file: File, annotatorId: string): Promise<AnnotationItem[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = e.target?.result;
        const wb = XLSX.read(data, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' });
        const importRows = parseRows(rawRows);

        // Build one AnnotationItem per sentence × system
        const flat: AnnotationItem[] = [];
        for (const row of importRows) {
          for (const sys of SYSTEM_COLUMNS) {
            const output = row[sys.key] as string | undefined;
            if (!output) continue;
            flat.push({
              item_id: `${row.sentence_id}__${sys.key}`,
              sentence_id: row.sentence_id,
              source_sentence: row.english,
              system_name: sys.label,
              system_output: output,
              is_reference: sys.isRef,
              d1: null,
              d2: null,
              d3: null,
              d4: null,
              error_flags: [],
              remark: '',
              annotator_id: annotatorId,
              timestamp: null,
              randomization_order: 0,
              completed: false,
            });
          }
        }

        // Randomize presentation order
        const shuffled = shuffle(flat).map((item, idx) => ({
          ...item,
          randomization_order: idx,
        }));

        resolve(shuffled);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsBinaryString(file);
  });
}
