import { readFile } from "fs/promises"
import pdfParse from "pdf-parse"

export class CVParser {
  static async extractTextFromPDF(filePath: string): Promise<string> {
    try {
      const buffer = await readFile(filePath)
      const data = await pdfParse(buffer)
      return data.text
    } catch (error) {
      console.error("PDF parsing error:", error)
      throw new Error("Failed to extract text from PDF")
    }
  }

  static async extractTextFromDOC(filePath: string): Promise<string> {
    try {
      // TODO: Implement DOC/DOCX extraction using mammoth.js
      // For now, return a placeholder message
      console.log('DOC extraction not yet implemented for:', filePath);
      // For DOC/DOCX files, you would use libraries like mammoth
      // const mammoth = require('mammoth')
      // const result = await mammoth.extractRawText({ path: filePath })
      // return result.value

      // For demo purposes, return placeholder
      return "Document text extraction would be implemented here using mammoth.js or similar library"
    } catch (error) {
      console.error("DOC parsing error:", error)
      throw new Error("Failed to extract text from document")
    }
  }

  static async extractText(filePath: string, mimeType: string): Promise<string> {
    switch (mimeType) {
      case "application/pdf":
        return this.extractTextFromPDF(filePath)
      case "application/msword":
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return this.extractTextFromDOC(filePath)
      default:
        throw new Error("Unsupported file type")
    }
  }
}
