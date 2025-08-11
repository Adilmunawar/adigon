
export interface FileUploadResult {
  success: boolean;
  url?: string;
  error?: string;
  type: 'image' | 'document' | 'audio';
  size: number;
  name: string;
}

export class UploadService {
  private static instance: UploadService;
  private maxFileSize = 10 * 1024 * 1024; // 10MB

  static getInstance(): UploadService {
    if (!UploadService.instance) {
      UploadService.instance = new UploadService();
    }
    return UploadService.instance;
  }

  async processFile(file: File): Promise<FileUploadResult> {
    try {
      if (file.size > this.maxFileSize) {
        return {
          success: false,
          error: 'File size exceeds 10MB limit',
          type: this.getFileType(file),
          size: file.size,
          name: file.name
        };
      }

      const url = await this.createFilePreview(file);
      
      return {
        success: true,
        url,
        type: this.getFileType(file),
        size: file.size,
        name: file.name
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
        type: this.getFileType(file),
        size: file.size,
        name: file.name
      };
    }
  }

  private async createFilePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  private getFileType(file: File): 'image' | 'document' | 'audio' {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'document';
  }

  validateFileType(file: File): boolean {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'text/plain', 'text/markdown', 'application/json',
      'application/pdf', 'audio/wav', 'audio/mp3', 'audio/webm'
    ];
    return allowedTypes.includes(file.type);
  }
}

export const uploadService = UploadService.getInstance();
