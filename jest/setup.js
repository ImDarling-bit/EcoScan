// Modules natifs sans équivalent JSDOM/Jest : mockés pour que les tests
// puissent monter les écrans (y compris ScanScreen) sans device réel.

jest.mock('@op-engineering/op-sqlite', () => ({
  open: jest.fn(() => ({
    execute: jest.fn((query) =>
      Promise.resolve(
        query.includes('PRAGMA user_version')
          ? { rows: [{ user_version: 1 }], rowsAffected: 0 }
          : { rows: [], rowsAffected: 0 },
      ),
    ),
    executeBatch: jest.fn(() => Promise.resolve({ rowsAffected: 0 })),
    close: jest.fn(),
  })),
}));

jest.mock('react-native-vision-camera', () => ({
  useCameraPermission: jest.fn(() => ({
    status: 'authorized',
    hasPermission: true,
    canRequestPermission: false,
    requestPermission: jest.fn(() => Promise.resolve(true)),
  })),
  useCameraDevice: jest.fn(() => undefined),
  usePhotoOutput: jest.fn(() => ({ capturePhotoToFile: jest.fn(() => Promise.resolve({ filePath: '/tmp/photo.jpg' })) })),
  CommonResolutions: { FHD_4_3: { width: 1440, height: 1920 } },
}));

jest.mock('react-native-vision-camera-mlkit', () => ({
  processImageBarcodeScanning: jest.fn(() => Promise.resolve({ barcodes: [] })),
  processImageTextRecognition: jest.fn(() => Promise.resolve({ text: '' })),
}));

jest.mock('react-native-blob-util', () => ({
  __esModule: true,
  default: {
    fs: {
      dirs: { CacheDir: '/tmp' },
      writeFile: jest.fn(() => Promise.resolve()),
    },
  },
}));

jest.mock('react-native-share', () => ({
  __esModule: true,
  default: {
    open: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('react-native-pdf', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props) => React.createElement(View, props),
  };
});
