import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, saveAnnotation, getNextPending, upsertItem, clearAllItems, saveSession, getSession } from '../lib/db';
import { parseFile } from '../lib/importer';
import type { AnnotationItem, Score1to5, ErrorFlag, SessionConfig } from '../types';

export type AppView = 'setup' | 'annotate' | 'dashboard';

export function useAnnotation() {
  const [view, setView] = useState<AppView>('setup');
  const [session, setSession] = useState<SessionConfig | null>(null);
  const [currentItem, setCurrentItem] = useState<AnnotationItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Live query for all items
  const allItems = useLiveQuery(() => db.items.orderBy('randomization_order').toArray(), []);

  // Restore session on mount
  useEffect(() => {
    getSession().then(s => {
      if (s) {
        setSession(s);
        getNextPending().then(item => {
          if (item) {
            setCurrentItem(item);
            setView('annotate');
          } else if (allItems && allItems.length > 0) {
            setView('dashboard');
          }
        });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImport = useCallback(async (file: File, annotatorId: string) => {
    setIsLoading(true);
    setImportError(null);
    try {
      await clearAllItems();
      const items = await parseFile(file, annotatorId);
      for (const item of items) {
        await upsertItem(item);
      }
      const config: SessionConfig = { annotator_id: annotatorId, loaded_at: new Date().toISOString() };
      await saveSession(config);
      setSession(config);
      const first = await getNextPending();
      setCurrentItem(first ?? null);
      setView(first ? 'annotate' : 'dashboard');
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed. Check file format.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSaveAndNext = useCallback(async (
    patch: Partial<AnnotationItem>
  ) => {
    if (!currentItem?.id) return;
    await saveAnnotation(currentItem.id, { ...patch, completed: true });
    const next = await getNextPending();
    if (next) {
      setCurrentItem(next);
    } else {
      setCurrentItem(null);
      setView('dashboard');
    }
  }, [currentItem]);

  const goToDashboard = () => setView('dashboard');
  const goToAnnotate = useCallback(async () => {
    const next = await getNextPending();
    if (next) {
      setCurrentItem(next);
      setView('annotate');
    } else {
      setView('dashboard');
    }
  }, []);

  const resumeFromItem = useCallback((item: AnnotationItem) => {
    setCurrentItem(item);
    setView('annotate');
  }, []);

  const resetAll = useCallback(async () => {
    await clearAllItems();
    await db.session.clear();
    setSession(null);
    setCurrentItem(null);
    setView('setup');
  }, []);

  return {
    view,
    session,
    currentItem,
    allItems: allItems ?? [],
    isLoading,
    importError,
    handleImport,
    handleSaveAndNext,
    goToDashboard,
    goToAnnotate,
    resumeFromItem,
    resetAll,
  };
}

// Annotation form state hook
export function useAnnotationForm(item: AnnotationItem) {
  const [d1, setD1] = useState<Score1to5 | null>(item.d1);
  const [d2, setD2] = useState<Score1to5 | null>(item.d2);
  const [d3, setD3] = useState<Score1to5 | null>(item.d3);
  const [d4, setD4] = useState<Score1to5 | null>(item.d4);
  const [flags, setFlags] = useState<ErrorFlag[]>(item.error_flags);
  const [remark, setRemark] = useState(item.remark);

  // Reset when item changes
  useEffect(() => {
    setD1(item.d1);
    setD2(item.d2);
    setD3(item.d3);
    setD4(item.d4);
    setFlags(item.error_flags);
    setRemark(item.remark);
  }, [item.item_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleFlag = (flag: ErrorFlag) => {
    setFlags(prev =>
      prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag]
    );
  };

  const requiresRemark = (item.is_reference === false) &&
    ((d1 !== null && d1 <= 2) || (d3 !== null && d3 <= 2));

  const isValid = item.is_reference
    ? d4 !== null
    : (d1 !== null && d2 !== null && d3 !== null &&
       (!requiresRemark || remark.trim().length > 0));

  return { d1, setD1, d2, setD2, d3, setD3, d4, setD4, flags, toggleFlag, remark, setRemark, requiresRemark, isValid };
}
