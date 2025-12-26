import React, { ReactNode } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

interface WebContainerProps {
  children: ReactNode;
}

export const WebContainer: React.FC<WebContainerProps> = ({ children }) => {
  if (Platform.OS !== 'web') {
    return <View style={styles.container}>{children}</View>;
  }

  return (
    <View style={styles.webBackground}>
      <View style={styles.webContainer}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webBackground: {
    flex: 1,
    backgroundColor: '#000000', // Or a neutral dark color to match the app theme
    alignItems: 'center',
    justifyContent: 'center',
  },
  webContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 480, // Mobile breakpoint width
    backgroundColor: '#000000', // Ensure app background is maintained
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 5,
    overflow: 'hidden', // Clip content to container
  },
});
