import * as XLSX from 'xlsx';
import type { AnnotationItem } from '../types';

function toExportRow(item: AnnotationItem): Record<string, unknown> {
  return {
    item_id:             item.item_id,
    sentence_id:         item.sentence_id,
    source_sentence:     item.source_sentence,
    system_name:         item.system_name,
    system_output:       item.system_output,
    is_reference:        item.is_reference ? 'yes' : 'no',
    d1_adequacy:         item.d1 ?? '',
    d2_fluency:          item.d2 ?? '',
    d3_structural:       item.d3 ?? '',
    d4_ref_comprehension: item.d4 ?? '',
    error_flags:         item.error_flags.join('; '),
    remark:              item.remark,
    annotator_id:        item.annotator_id,
    timestamp:           item.timestamp ?? '',
    randomization_order: item.randomization_order,
    completed:           item.completed ? 'yes' : 'no',
  };
}

export function exportToXLSX(items: AnnotationItem[], filename = 'safe_so_results.xlsx'): void {
  const rows = items.map(toExportRow);
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Annotations');
  XLSX.writeFile(wb, filename);
}

export function exportToCSV(items: AnnotationItem[], filename = 'safe_so_results.csv'): void {
  const rows = items.map(toExportRow);
  const ws = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
