import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

export class FileUploadService {
  private static uploadDir = join(process.cwd(), "uploads")

  static async ensureUploadDir() {
    try {
      await mkdir(this.uploadDir, { recursive: true })
    } catch (error) {
      // Directory already exists
    }
  }

  static async uploadFile(
    file: File,
    subfolder = "",
  ): Promise<{
    fileName: string
    filePath: string
    fileUrl: string
  }> {
    await this.ensureUploadDir()

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const fileExtension = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExtension}`

    const uploadPath = subfolder ? join(this.uploadDir, subfolder) : this.uploadDir

    // Ensure subfolder exists
    if (subfolder) {
      await mkdir(uploadPath, { recursive: true })
    }

    const filePath = join(uploadPath, fileName)
    await writeFile(filePath, buffer)

    const fileUrl = `/uploads/${subfolder ? subfolder + "/" : ""}${fileName}`

    return {
      fileName,
      filePath,
      fileUrl,
    }
  }

  static async deleteFile(filePath: string): Promise<void> {
    try {
      const { unlink } = await import("fs/promises")
      await unlink(filePath)
    } catch (error) {
      console.error("Error deleting file:", error)
    }
  }
}
