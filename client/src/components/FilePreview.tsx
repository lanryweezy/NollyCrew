import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download, ExternalLink, Loader2 } from "lucide-react";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Set worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface FilePreviewProps {
  url: string;
  filename?: string;
}

export default function FilePreview({ url, filename }: FilePreviewProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const isPdf = url.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border bg-muted p-8 text-center">
        <p className="mb-4 text-muted-foreground">Preview not available for this file type.</p>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={url} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" /> Open in New Tab
            </a>
          </Button>
          <Button asChild>
            <a href={url} download={filename}>
              <Download className="mr-2 h-4 w-4" /> Download
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4 rounded-lg border bg-card p-4 shadow-inner">
      <div className="flex w-full items-center justify-between border-b pb-4">
        <div className="text-sm font-medium truncate max-w-[200px]" title={filename}>
          {filename || "Script Preview"}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs">
            Page {pageNumber} of {numPages || "?"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages || prev))}
            disabled={pageNumber >= (numPages || 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" asChild className="ml-2">
            <a href={url} download={filename}>
              <Download className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      <div className="max-h-[600px] overflow-auto w-full flex justify-center bg-muted/30 rounded p-2">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex h-[400px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }
          error={
            <div className="flex h-[400px] flex-col items-center justify-center text-destructive">
              <p>Failed to load PDF.</p>
              <Button variant="ghost" className="text-primary hover:underline" onClick={() => window.open(url, "_blank")}>
                Open URL directly
              </Button>
            </div>
          }
        >
          <Page 
            pageNumber={pageNumber} 
            width={550}
            renderAnnotationLayer={false}
            renderTextLayer={false}
          />
        </Document>
      </div>
    </div>
  );
}
