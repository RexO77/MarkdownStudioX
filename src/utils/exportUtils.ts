import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph } from 'docx';
import { convertMarkdownToHtml } from './markdownUtils';

export const exportToPdf = async (content: string) => {
  const html = convertMarkdownToHtml(content);
  const element = document.createElement('div');
  element.innerHTML = html;
  element.style.padding = '20px';
  document.body.appendChild(element);

  try {
    const canvas = await html2canvas(element);
    const pdf = new jsPDF();
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
    pdf.save('document.pdf');
  } finally {
    document.body.removeChild(element);
  }
};

export const exportToWord = async (content: string) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: content,
        }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, 'document.docx');
};