import PDFParser, { Page } from 'pdf2json';

export interface PageResult {
    pageNumber: number;
    text: string;
}

export function extractTextPdfFile(filePath: string): Promise<PageResult[]> {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();

        pdfParser.on('pdfParser_dataError', error => reject(error.parserError));
        pdfParser.on('pdfParser_dataReady', pdfData => {
            const pages: PageResult[] = (pdfData.Pages || []).map((page: Page, index: number) => {
                const text = (page.Texts || [])
                    .map(t => (t.R || []).map(r => decodeURIComponent(r.T)).join(''))
                    .join(' ');

                return { pageNumber: index + 1, text };
            });

            resolve(pages);
        });

        pdfParser.loadPDF(filePath);
    });
}