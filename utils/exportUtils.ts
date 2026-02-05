import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

interface DocumentLike {
  createElement: (tagName: string) => {
    href: string;
    setAttribute: (name: string, value: string) => void;
    click: () => void;
  };
  body: {
    appendChild: (node: any) => void;
    removeChild: (node: any) => void;
  };
}

type FileSystemWithDirs = typeof FileSystem & {
  documentDirectory?: string | null;
  cacheDirectory?: string | null;
};

export const triggerWebDownload = (
  dataUrl: string,
  filename: string,
  doc?: DocumentLike | null
) => {
  if (Platform.OS !== 'web') {
    return;
  }

  const targetDocument = doc ?? (typeof globalThis !== 'undefined' ? ((globalThis as any).document as DocumentLike | undefined) : undefined);
  if (!targetDocument) {
    return;
  }

  const link = targetDocument.createElement('a');
  link.href = dataUrl;
  link.setAttribute('download', filename);
  targetDocument.body.appendChild(link);
  link.click();
  targetDocument.body.removeChild(link);
};

export const getWritableDirectory = (fsOverride?: FileSystemWithDirs | null) => {
  const fsModule = fsOverride ?? (FileSystem as FileSystemWithDirs);
  return fsModule.documentDirectory || fsModule.cacheDirectory || null;
};
