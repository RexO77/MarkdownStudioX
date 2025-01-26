import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, spacing } from 'docx';
import { convertMarkdownToHtml } from './markdownUtils';

export const exportToPdf = async (content: string) => {
  const html = convertMarkdownToHtml(content);
  const element = document.createElement('div');
  element.innerHTML = html;
  element.style.width = '800px';
  element.style.padding = '40px';
  element.style.backgroundColor = 'white';
  element.style.lineHeight = '1.6';
  element.style.wordBreak = 'break-word';
  document.body.appendChild(element);

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: 800,
      height: element.scrollHeight
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      unit: 'px',
      format: 'a4',
      orientation: 'portrait'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    
    let heightLeft = imgHeight;
    let position = 0;
    
    // First page
    pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, imgHeight * ratio);
    heightLeft -= pdfHeight;
    
    // Additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, imgHeight * ratio);
      heightLeft -= pdfHeight;
    }

    pdf.save('document.pdf');
  } finally {
    document.body.removeChild(element);
  }
};

export const exportToWord = async (content: string) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: content.split('\n').map(line => 
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              size: 24,
            })
          ],
          spacing: {
            before: 240,
            after: 240,
            line: 360,
          },
        })
      ),
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, 'document.docx');
};