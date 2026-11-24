export interface CoaItem {
    id: number;
    accessionNumber: string;
    lotNumber: string;
    productName: string;
    pdfFilename: string | null;
    pdfUrl: string | null;
    createdAt: string;
}