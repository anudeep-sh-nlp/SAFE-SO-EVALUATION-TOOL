import { useAnnotation } from './hooks/useAnnotation';
import { SetupScreen } from './components/import/SetupScreen';
import { AnnotationScreen } from './components/annotation/AnnotationScreen';
import { DashboardScreen } from './components/dashboard/DashboardScreen';

export default function App() {
  const {
    view,
    session,
    currentItem,
    allItems,
    isLoading,
    importError,
    handleImport,
    handleSaveAndNext,
    goToDashboard,
    goToAnnotate,
    resumeFromItem,
    resetAll,
  } = useAnnotation();

  if (view === 'setup') {
    return (
      <SetupScreen
        onImport={handleImport}
        isLoading={isLoading}
        error={importError}
        hasExistingData={allItems.length > 0}
        onResume={goToAnnotate}
        onReset={resetAll}
      />
    );
  }

  if (view === 'annotate' && currentItem) {
    return (
      <AnnotationScreen
        item={currentItem}
        allItems={allItems}
        onSave={handleSaveAndNext}
        onDashboard={goToDashboard}
      />
    );
  }

  return (
    <DashboardScreen
      allItems={allItems}
      onResume={goToAnnotate}
      onReset={resetAll}
      annotatorId={session?.annotator_id ?? '—'}
    />
  );
}
