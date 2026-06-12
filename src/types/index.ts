// ─── Core annotation schema for SAFE-SO ──────────────────────────────────────

export type ErrorFlag =
  | 'verb_non_final'
  | 'object_displaced'
  | 'clause_inversion'
  | 'postposition_error';

export const ERROR_FLAG_LABELS: Record<ErrorFlag, string> = {
  verb_non_final:     'Verb non-final',
  object_displaced:   'Object displaced',
  clause_inversion:   'Clause inversion',
  postposition_error: 'Postposition error',
};

export const ALL_ERROR_FLAGS: ErrorFlag[] = [
  'verb_non_final',
  'object_displaced',
  'clause_inversion',
  'postposition_error',
];

export type Score1to5 = 1 | 2 | 3 | 4 | 5;

// system_name is the original column key from the import;
// it is blinded during annotation and only revealed in the dashboard.
export interface AnnotationItem {
  id?: number;                   // Dexie auto-increment PK
  item_id: string;               // unique per annotation row (sentence_id + system_name)
  sentence_id: string;
  source_sentence: string;
  system_name: string;           // hidden during annotation
  system_output: string;
  is_reference: boolean;

  // Scores — null = not yet scored
  d1: Score1to5 | null;
  d2: Score1to5 | null;
  d3: Score1to5 | null;
  d4: Score1to5 | null;         // only for is_reference items

  error_flags: ErrorFlag[];
  remark: string;

  annotator_id: string;
  timestamp: string | null;
  randomization_order: number;
  completed: boolean;
}

// ─── Import row shape (raw from XLSX) ────────────────────────────────────────

export interface ImportRow {
  sentence_id: string;
  english: string;
  nepali_reference: string;
  config_A_direct: string;
  config_B_pivot_Ja: string;
  config_C_pivot_ko: string;
  config_D_pivot_Tr: string;
  config_E_pivot_Fr: string;
  config_F_pivot_Hi: string;
  length_bucket?: string;
  domain?: string;
}

// ─── App-level session config ─────────────────────────────────────────────────

export interface SessionConfig {
  annotator_id: string;
  loaded_at: string;
}

// ─── Dashboard stats ──────────────────────────────────────────────────────────

export interface SystemStats {
  system_name: string;
  count: number;
  completed: number;
  avg_d1: number | null;
  avg_d2: number | null;
  avg_d3: number | null;
  avg_d4: number | null;
  flag_counts: Record<ErrorFlag, number>;
}
