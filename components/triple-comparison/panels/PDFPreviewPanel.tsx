'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { generatePDFBlob, generatePDFFromMarkdown, type PDFOptions } from '@/lib/utils/pdf-generator';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface PDFPreviewPanelProps {
  markdownContent: string;
  title: string;
  category?: string;
  level?: string;
  showMarkdownSource?: boolean;
  onDownload?: () => void;
  className?: string;
}

type ViewMode = 'pdf' | 'markdown' | 'split';

export const PDFPreviewPanel: React.FC<PDFPreviewPanelProps> = ({
  markdownContent,
  title,
  category,
  level,
  showMarkdownSource = false,
  onDownload,
  className = '',
}) => {
  const [pdfDocument, setPdfDocument] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(showMarkdownSource ? 'split' : 'pdf');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate PDF from markdown and load it
  useEffect(() => {
    const loadPDF = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Generate PDF from markdown
        const pdfOptions: PDFOptions = {
          title,
          category,
          level,
          includeHeader: true,
        };

        const pdfBlob = generatePDFBlob(markdownContent, pdfOptions);
        const pdfUrl = URL.createObjectURL(pdfBlob);

        // Load PDF with PDF.js
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;

        setPdfDocument(pdf);
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
        setIsLoading(false);

        // Clean up blob URL
        return () => URL.revokeObjectURL(pdfUrl);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError(err instanceof Error ? err.message : 'Failed to load PDF');
        setIsLoading(false);
      }
    };

    loadPDF();
  }, [markdownContent, title, category, level]);

  // Render current page
  useEffect(() => {
    if (!pdfDocument || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        const page = await pdfDocument.getPage(currentPage);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        // Calculate viewport with zoom
        const viewport = page.getViewport({ scale: zoom * 1.5 });

        // Set canvas dimensions
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render page - pdfjs-dist v5 requires canvas property
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        };

        await page.render(renderContext as any).promise;
      } catch (err) {
        console.error('Error rendering page:', err);
        setError('Failed to render PDF page');
      }
    };

    renderPage();
  }, [pdfDocument, currentPage, zoom]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pageNum = parseInt(e.target.value, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  const handleDownload = () => {
    const pdfOptions: PDFOptions = {
      title,
      category,
      level,
      includeHeader: true,
    };

    const doc = generatePDFFromMarkdown(markdownContent, pdfOptions);
    const filename = `Hablas_${title.replace(/[^a-z0-9]/gi, '_').substring(0, 40)}.pdf`;
    doc.save(filename);

    onDownload?.();
  };

  const renderPDFView = () => (
    <div className="flex-1 overflow-auto bg-gray-100 p-4" ref={containerRef}>
      {isLoading && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-gray-600">Generating PDF preview...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-red-600">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {!isLoading && !error && (
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            className="shadow-lg bg-white"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
      )}
    </div>
  );

  const renderMarkdownView = () => (
    <div className="flex-1 overflow-auto p-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <pre className="whitespace-pre-wrap font-mono text-sm bg-white p-4 rounded border border-gray-200">
          {markdownContent}
        </pre>
      </div>
    </div>
  );

  return (
    <div className={`flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4" />
            PDF Preview
          </h3>

          {/* View Mode Toggle */}
          {showMarkdownSource && (
            <div className="flex gap-1 bg-gray-100 rounded-md p-1">
              <button
                onClick={() => setViewMode('pdf')}
                className={`px-3 py-1 text-xs font-medium rounded ${
                  viewMode === 'pdf'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                PDF
              </button>
              <button
                onClick={() => setViewMode('markdown')}
                className={`px-3 py-1 text-xs font-medium rounded ${
                  viewMode === 'markdown'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Markdown
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 text-xs font-medium rounded ${
                  viewMode === 'split'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Split
              </button>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage <= 1 || isLoading}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1 text-sm">
              <input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={handlePageInputChange}
                disabled={isLoading}
                className="w-12 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-600">/ {totalPages}</span>
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages || isLoading}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.5 || isLoading}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>

            <span className="text-sm text-gray-600 min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>

            <button
              onClick={handleZoomIn}
              disabled={zoom >= 3.0 || isLoading}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </button>
        </div>
      </div>

      {/* Content Area */}
      {viewMode === 'pdf' && renderPDFView()}
      {viewMode === 'markdown' && renderMarkdownView()}
      {viewMode === 'split' && (
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 border-r border-gray-200">{renderPDFView()}</div>
          <div className="flex-1">{renderMarkdownView()}</div>
        </div>
      )}
    </div>
  );
};
