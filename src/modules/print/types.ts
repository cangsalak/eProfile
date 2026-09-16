export type MainPrintTab = 'documents' | 'badges' | 'barcodes' | 'certificates';

export type DocCategory = 'leave' | 'slip' | 'rpb1' | 'roster' | 'duty';

export type BadgePrintMode = 'pair' | 'front' | 'back';

export interface PaperSettings {
  pageSize: 'A4' | 'Letter' | 'CR80';
  orientation: 'portrait' | 'landscape';
  margin: string; // '0mm' | '5mm' | '10mm' | '15mm' | '20mm'
  showGaruda: boolean;
  watermark: 'none' | 'original' | 'copy' | 'confidential';
  showSignature: boolean;
  unitName: string;
}

export interface PrintDocumentProps {
  person: any;
  paperSettings: PaperSettings;
  settings?: any;
}
