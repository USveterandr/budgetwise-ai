// Type definitions for R2 operations
export interface ReceiptFile {
  key: string;
  url: string;
  size: number;
  uploadedAt: Date;
}

export interface FileUploadOptions {
  folder?: string;
  contentType?: string;
  cacheControl?: string;
}

// Type definition for R2 objects
interface R2Object {
  key: string;
  size: number;
  etag: string;
  uploaded: Date;
  httpEtag?: string;
  httpMetadata?: Record<string, string>;
  customMetadata?: Record<string, string>;
  range?: { offset: number; length: number };
}

// Type definition for R2Bucket (simplified version)
export interface R2Bucket {
  put(
    key: string,
    value: ArrayBuffer | ReadableStream | string,
    options?: {
      httpMetadata?: {
        contentType?: string;
        cacheControl?: string;
      };
      customMetadata?: Record<string, string>;
    }
  ): Promise<{ key: string; size: number; etag: string }>;
  
  get(key: string): Promise<{
    arrayBuffer(): Promise<ArrayBuffer>;
    body: ReadableStream;
    httpMetadata: {
      contentType: string;
    };
  } | null>;
  
  delete(key: string): Promise<void>;
  
  list(options?: {
    prefix?: string;
    limit?: number;
  }): Promise<{
    objects: R2Object[];
    truncated: boolean;
  }>;
}

// R2 utility class
export class R2Storage {
  private bucket: R2Bucket;
  private bucketName: string;

  constructor(bucket: R2Bucket, bucketName: string) {
    this.bucket = bucket;
    this.bucketName = bucketName;
  }

  /**
   * Upload a file to R2 storage
   * @param fileBuffer - The file data as ArrayBuffer or ReadableStream
   * @param fileName - The name of the file
   * @param options - Upload options
   * @returns The file key and public URL
   */
  async uploadFile(
    fileBuffer: ArrayBuffer | ReadableStream,
    fileName: string,
    options: FileUploadOptions = {}
  ): Promise<ReceiptFile> {
    try {
      // Generate a unique key for the file
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const folder = options.folder || 'uploads';
      const key = `${folder}/${timestamp}-${randomSuffix}-${fileName}`;
      
      // Set default content type if not provided
      const contentType = options.contentType || 'application/octet-stream';
      
      // Upload the file to R2
      const uploadedObject = await this.bucket.put(key, fileBuffer, {
        httpMetadata: {
          contentType: contentType,
          cacheControl: options.cacheControl || 'public, max-age=31536000' // 1 year
        }
      });
      
      // Generate the public URL
      const url = `https://${this.bucketName}.${this.getR2Domain()}/${key}`;
      
      return {
        key,
        url,
        size: uploadedObject.size,
        uploadedAt: new Date()
      };
    } catch (error) {
      console.error('Error uploading file to R2:', error);
      throw new Error('Failed to upload file');
    }
  }

  /**
   * Get a file from R2 storage
   * @param key - The file key
   * @returns The file data as ArrayBuffer
   */
  async getFile(key: string): Promise<ArrayBuffer | null> {
    try {
      const object = await this.bucket.get(key);
      
      if (!object) {
        return null;
      }
      
      return await object.arrayBuffer();
    } catch (error) {
      console.error('Error getting file from R2:', error);
      throw new Error('Failed to get file');
    }
  }

  /**
   * Get a file URL
   * @param key - The file key
   * @returns The public URL of the file
   */
  getFileUrl(key: string): string {
    return `https://${this.bucketName}.${this.getR2Domain()}/${key}`;
  }

  /**
   * Delete a file from R2 storage
   * @param key - The file key
   * @returns True if successful
   */
  async deleteFile(key: string): Promise<boolean> {
    try {
      await this.bucket.delete(key);
      return true;
    } catch (error) {
      console.error('Error deleting file from R2:', error);
      return false;
    }
  }

  /**
   * List files in a folder
   * @param folder - The folder path
   * @param limit - Maximum number of files to return
   * @returns List of files
   */
  async listFiles(folder: string = 'uploads', limit: number = 100): Promise<R2Object[]> {
    try {
      const listing = await this.bucket.list({
        prefix: folder,
        limit: limit
      });
      
      return listing.objects;
    } catch (error) {
      console.error('Error listing files in R2:', error);
      throw new Error('Failed to list files');
    }
  }

  /**
   * Get R2 domain based on environment
   * @returns The R2 domain
   */
  private getR2Domain(): string {
    // In production, you might want to use your custom domain
    // For now, we'll use the default R2 domain
    return 'r2.cloudflarestorage.com';
  }
}