import { PDFDocument, rgb, degrees } from "pdf-lib";

export async function watermarkPdf(pdfUrl: string, watermarkText: string): Promise<string> {
  const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    
    // Draw multiple watermarks in a grid pattern
    for (let x = 0; x < width; x += 250) {
      for (let y = 0; y < height; y += 250) {
        page.drawText(watermarkText, {
          x,
          y,
          size: 24,
          opacity: 0.1,
          color: rgb(0.5, 0.5, 0.5),
          rotate: degrees(45),
        });
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  return URL.createObjectURL(blob);
}
