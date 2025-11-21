// Main exports for triple-comparison module
export { TripleComparisonView } from './components/TripleComparisonView';
export { TripleComparisonWrapper } from './components/TripleComparisonWrapper';
export { ContentPanel } from './components/ContentPanel';
export { DiffViewer } from './components/DiffViewer';
export { SyncControls } from './components/SyncControls';
export { ErrorBoundary } from './components/ErrorBoundary';
export { useTripleComparison } from './hooks/useTripleComparison';
export { useContentLoader } from './hooks/useContentLoader';
export type * from './types';

// Default export for convenience
export { TripleComparisonWrapper as default } from './components/TripleComparisonWrapper';
