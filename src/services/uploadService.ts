
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
  private maxFileSize = 25 * 1024 * 1024; // 25MB

  static getInstance(): UploadService {
    if (!UploadService.instance) {
      UploadService.instance = new UploadService();
    }
    return UploadService.instance;
  }

  async processFile(file: File): Promise<FileUploadResult> {
    console.log('Processing file:', file.name, file.type, file.size);
    
    try {
      if (file.size > this.maxFileSize) {
        return {
          success: false,
          error: `File size exceeds ${this.maxFileSize / 1024 / 1024}MB limit`,
          type: this.getFileType(file),
          size: file.size,
          name: file.name
        };
      }

      if (!this.validateFileType(file)) {
        return {
          success: false,
          error: 'File type not supported',
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
      console.error('File processing error:', error);
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
      reader.onload = () => {
        const result = reader.result as string;
        console.log('File preview created successfully');
        resolve(result);
      };
      reader.onerror = () => {
        console.error('Failed to read file');
        reject(new Error('Failed to read file'));
      };
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
      // Images
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      // Documents
      'text/plain', 'text/markdown', 'text/csv',
      'application/json', 'application/pdf', 
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      // Code files
      'text/javascript', 'text/typescript', 'text/html', 'text/css',
      'application/javascript', 'application/typescript',
      // Audio
      'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/webm', 'audio/ogg', 'audio/m4a'
    ];
    
    const isAllowed = allowedTypes.includes(file.type);
    console.log('File type validation:', file.type, 'allowed:', isAllowed);
    return isAllowed;
  }

  // Helper method to get file extension for types not detected by MIME
  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  // Enhanced validation that also checks file extensions
  validateFileTypeAndExtension(file: File): boolean {
    if (this.validateFileType(file)) {
      return true;
    }

    // Fallback to extension checking for files with generic MIME types
    const extension = this.getFileExtension(file.name);
    const allowedExtensions = [
      'txt', 'md', 'json', 'js', 'ts', 'tsx', 'jsx', 'css', 'html', 'pdf',
      'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'csv',
      'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',
      'wav', 'mp3', 'webm', 'ogg', 'm4a'
    ];

    return allowedExtensions.includes(extension);
  }
}

export const uploadService = UploadService.getInstance();
