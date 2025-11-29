/**
 * PDF Generator Utility
 *
 * Converts markdown content to PDF format for downloads
 * using jsPDF library
 */

import { jsPDF } from 'jspdf';

interface PDFOptions {
  title: string;
  category?: string;
  level?: string;
  includeHeader?: boolean;
  fontSize?: number;
  lineHeight?: number;
}

/**
 * Parse markdown to structured content blocks
 */
function parseMarkdown(content: string): Array<{
  type: 'h1' | 'h2' | 'h3' | 'bold' | 'italic' | 'text' | 'list' | 'quote' | 'code';
  text: string;
}> {
  const blocks: Array<{
    type: 'h1' | 'h2' | 'h3' | 'bold' | 'italic' | 'text' | 'list' | 'quote' | 'code';
    text: string;
  }> = [];

  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      blocks.push({ type: 'text', text: '' });
      continue;
    }

    // Headers
    if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'h3', text: trimmed.substring(4) });
    } else if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'h2', text: trimmed.substring(3) });
    } else if (trimmed.startsWith('# ')) {
      blocks.push({ type: 'h1', text: trimmed.substring(2) });
    }
    // Lists
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      blocks.push({ type: 'list', text: '• ' + trimmed.substring(2) });
    } else if (/^\d+\.\s/.test(trimmed)) {
      blocks.push({ type: 'list', text: trimmed });
    }
    // Blockquotes
    else if (trimmed.startsWith('> ')) {
      blocks.push({ type: 'quote', text: trimmed.substring(2) });
    }
    // Code blocks
    else if (trimmed.startsWith('```')) {
      continue; // Skip code fence markers
    }
    // Regular text
    else {
      blocks.push({ type: 'text', text: trimmed });
    }
  }

  return blocks;
}

/**
 * Clean text of markdown formatting for PDF rendering
 */
function cleanMarkdownFormatting(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
    .replace(/\*([^*]+)\*/g, '$1') // Italic
    .replace(/__([^_]+)__/g, '$1') // Bold alt
    .replace(/_([^_]+)_/g, '$1') // Italic alt
    .replace(/`([^`]+)`/g, '$1') // Inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    .replace(/~~([^~]+)~~/g, '$1'); // Strikethrough
}

/**
 * Generate PDF from markdown content
 */
export function generatePDFFromMarkdown(
  markdownContent: string,
  options: PDFOptions
): jsPDF {
  const {
    title,
    category,
    level,
    includeHeader = true,
    fontSize = 11,
    lineHeight = 1.4,
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = margin;

  // Helper to add new page if needed
  const checkPageBreak = (height: number): void => {
    if (yPosition + height > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  // Helper to wrap text and get lines
  const wrapText = (text: string, maxWidth: number, size: number): string[] => {
    doc.setFontSize(size);
    return doc.splitTextToSize(text, maxWidth);
  };

  // Add header with branding
  if (includeHeader) {
    // Header background
    doc.setFillColor(37, 99, 235); // Blue-600
    doc.rect(0, 0, pageWidth, 25, 'F');

    // Brand name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Hablas', margin, 12);

    // Subtitle
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Spanish for Gig Workers', margin, 18);

    // Document title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    yPosition = 35;
    const titleLines = wrapText(cleanMarkdownFormatting(title), contentWidth, 16);
    for (const line of titleLines) {
      checkPageBreak(8);
      doc.text(line, margin, yPosition);
      yPosition += 7;
    }

    // Metadata line
    if (category || level) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      const metaText = [category, level].filter(Boolean).join(' • ');
      doc.text(metaText, margin, yPosition);
      yPosition += 8;
    }

    // Separator line
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;
  }

  // Parse and render content
  const blocks = parseMarkdown(markdownContent);
  doc.setTextColor(0, 0, 0);

  for (const block of blocks) {
    const cleanText = cleanMarkdownFormatting(block.text);

    switch (block.type) {
      case 'h1':
        checkPageBreak(12);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(37, 99, 235);
        const h1Lines = wrapText(cleanText, contentWidth, 16);
        for (const line of h1Lines) {
          checkPageBreak(8);
          doc.text(line, margin, yPosition);
          yPosition += 7;
        }
        doc.setTextColor(0, 0, 0);
        yPosition += 3;
        break;

      case 'h2':
        checkPageBreak(10);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(55, 65, 81);
        const h2Lines = wrapText(cleanText, contentWidth, 14);
        for (const line of h2Lines) {
          checkPageBreak(7);
          doc.text(line, margin, yPosition);
          yPosition += 6;
        }
        doc.setTextColor(0, 0, 0);
        yPosition += 2;
        break;

      case 'h3':
        checkPageBreak(8);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        const h3Lines = wrapText(cleanText, contentWidth, 12);
        for (const line of h3Lines) {
          checkPageBreak(6);
          doc.text(line, margin, yPosition);
          yPosition += 5;
        }
        yPosition += 2;
        break;

      case 'list':
        checkPageBreak(6);
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', 'normal');
        const listLines = wrapText(cleanText, contentWidth - 5, fontSize);
        for (let i = 0; i < listLines.length; i++) {
          checkPageBreak(5);
          doc.text(listLines[i], margin + (i === 0 ? 0 : 5), yPosition);
          yPosition += fontSize * lineHeight * 0.35;
        }
        break;

      case 'quote':
        checkPageBreak(8);
        doc.setFillColor(243, 244, 246);
        doc.setTextColor(75, 85, 99);
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', 'italic');
        const quoteLines = wrapText(cleanText, contentWidth - 10, fontSize);
        const quoteHeight = quoteLines.length * fontSize * lineHeight * 0.35 + 4;
        doc.rect(margin, yPosition - 4, contentWidth, quoteHeight, 'F');
        doc.setDrawColor(156, 163, 175);
        doc.line(margin, yPosition - 4, margin, yPosition - 4 + quoteHeight);
        for (const line of quoteLines) {
          doc.text(line, margin + 5, yPosition);
          yPosition += fontSize * lineHeight * 0.35;
        }
        doc.setTextColor(0, 0, 0);
        yPosition += 4;
        break;

      case 'text':
        if (!cleanText) {
          yPosition += 3;
          continue;
        }
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', 'normal');
        const textLines = wrapText(cleanText, contentWidth, fontSize);
        for (const line of textLines) {
          checkPageBreak(5);
          doc.text(line, margin, yPosition);
          yPosition += fontSize * lineHeight * 0.35;
        }
        break;

      default:
        if (cleanText) {
          doc.setFontSize(fontSize);
          doc.setFont('helvetica', 'normal');
          const defaultLines = wrapText(cleanText, contentWidth, fontSize);
          for (const line of defaultLines) {
            checkPageBreak(5);
            doc.text(line, margin, yPosition);
            yPosition += fontSize * lineHeight * 0.35;
          }
        }
    }
  }

  // Footer on each page
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      'hablas.ruv.io',
      pageWidth - margin,
      pageHeight - 10,
      { align: 'right' }
    );
  }

  return doc;
}

/**
 * Generate and download PDF from markdown content
 */
export function downloadPDF(
  markdownContent: string,
  options: PDFOptions
): void {
  const doc = generatePDFFromMarkdown(markdownContent, options);
  const filename = `Hablas_${options.title
    .replace(/[^a-z0-9]/gi, '_')
    .substring(0, 40)}.pdf`;
  doc.save(filename);
}

/**
 * Generate PDF as blob for programmatic use
 */
export function generatePDFBlob(
  markdownContent: string,
  options: PDFOptions
): Blob {
  const doc = generatePDFFromMarkdown(markdownContent, options);
  return doc.output('blob');
}

/**
 * Generate PDF as base64 string
 */
export function generatePDFBase64(
  markdownContent: string,
  options: PDFOptions
): string {
  const doc = generatePDFFromMarkdown(markdownContent, options);
  return doc.output('datauristring');
}
