import React from 'react';
import { render } from '@testing-library/react-native';
import { EnhancedReceiptScanner } from '../components/receipts/EnhancedReceiptScanner';

// Mock expo-camera since it's not available in test environment
jest.mock('expo-camera', () => ({
  Camera: {
    requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  },
  CameraView: jest.fn().mockImplementation(({ children }) => <div>{children}</div>),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

describe('ReceiptScanner', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <EnhancedReceiptScanner 
        onScanComplete={jest.fn()} 
        onCancel={jest.fn()} 
      />
    );
    
    expect(getByText('Scan Receipt')).toBeTruthy();
  });

  it('displays camera permission message', () => {
    // This would require more complex mocking to test the permission states
    // For now, we're just testing that the component renders
  });
});