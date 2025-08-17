// src/utils/googleVisionClient.ts
import vision from '@google-cloud/vision';

export function getGoogleVisionClient(credentials?: any, projectId?: string) {
  return new vision.ImageAnnotatorClient({
    credentials,
    projectId,
  });
}
