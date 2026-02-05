import { Platform } from 'react-native';
import { triggerWebDownload, getWritableDirectory } from '../utils/exportUtils';

jest.mock('expo-file-system');

describe('exportUtils', () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    jest.restoreAllMocks();
    Object.defineProperty(Platform, 'OS', {
      value: originalPlatform,
      configurable: true,
    });
  });

  describe('triggerWebDownload', () => {
    it('does nothing when not on web', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'ios',
        configurable: true,
      });
      const docMock = {
        createElement: jest.fn(),
        body: {
          appendChild: jest.fn(),
          removeChild: jest.fn(),
        },
      };

      triggerWebDownload('data:text/csv;base64,ZmFrZQ==', 'test.csv', docMock as any);

      expect(docMock.createElement).not.toHaveBeenCalled();
    });

    it('creates a temporary anchor and triggers click on web', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'web',
        configurable: true,
      });

      const click = jest.fn();
      const setAttribute = jest.fn();
      const anchorMock = { href: '', setAttribute, click };
      const appendChild = jest.fn();
      const removeChild = jest.fn();
      const docMock = {
        createElement: jest.fn().mockReturnValue(anchorMock),
        body: { appendChild, removeChild },
      };

      triggerWebDownload('data:text/csv;base64,ZmFrZQ==', 'test.csv', docMock as any);

      expect(docMock.createElement).toHaveBeenCalledWith('a');
      expect(anchorMock.href).toBe('data:text/csv;base64,ZmFrZQ==');
      expect(setAttribute).toHaveBeenCalledWith('download', 'test.csv');
      expect(appendChild).toHaveBeenCalledWith(anchorMock);
      expect(click).toHaveBeenCalled();
      expect(removeChild).toHaveBeenCalledWith(anchorMock);
    });
  });

  describe('getWritableDirectory', () => {
    it('prefers documentDirectory when available', () => {
      expect(
        getWritableDirectory({ documentDirectory: 'file://documents/', cacheDirectory: 'file://cache/' })
      ).toBe('file://documents/');
    });

    it('falls back to cacheDirectory when documentDirectory is missing', () => {
      expect(
        getWritableDirectory({ documentDirectory: null, cacheDirectory: 'file://cache/' })
      ).toBe('file://cache/');
    });

    it('returns null when neither directory is defined', () => {
      expect(
        getWritableDirectory({ documentDirectory: null, cacheDirectory: null })
      ).toBeNull();
    });
  });
});
