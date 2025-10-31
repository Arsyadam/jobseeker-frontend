declare module 'pdf-parse' {
  interface PDFInfo {
    PDFFormatVersion?: string
    IsAcroFormPresent?: boolean
    IsXFAPresent?: boolean
    Title?: string
    Author?: string
    Subject?: string
    Creator?: string
    Producer?: string
    CreationDate?: string
    ModDate?: string
  }

  interface PDFMetadata {
    _metadata?: unknown
    info?: PDFInfo
    metadata?: unknown
  }

  interface PDFPage {
    pageIndex: number
    pageInfo: unknown
    rotate?: number
    ref?: unknown
  }

  interface PDFData extends PDFMetadata {
    numpages: number
    numrender: number
    info: PDFInfo
    metadata: unknown
    text: string
    version: string
  }

  interface PDFParseOptions {
    pagerender?: (pageData: PDFPage) => string
    max?: number
    version?: string
  }

  function PDFParse(
    dataBuffer: Buffer,
    options?: PDFParseOptions
  ): Promise<PDFData>

  export = PDFParse
}
