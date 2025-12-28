import React, { ReactNode, useEffect, useState } from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';

interface WebContainerProps {
  children: ReactNode;
}

export const WebContainer: React.FC<WebContainerProps> = ({ children }) => {
  const [isDashboard, setIsDashboard] = useState(false);
  const { width: windowWidth } = useWindowDimensions();

  // Check if we're on the dashboard route by inspecting the current URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDashboard(window.location.pathname.includes('/dashboard'));
    }
  }, []);

  if (Platform.OS !== 'web') {
    return <View style={styles.container}>{children}</View>;
  }

  // For dashboard page, use more width if the window is wide enough
  const webContainerStyle = isDashboard && windowWidth > 768 
    ? [styles.webContainer, styles.dashboardContainer] 
    : styles.webContainer;

  return (
    <View style={styles.webBackground}>
      <View style={webContainerStyle}>
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
  dashboardContainer: {
    maxWidth: 1200, // Wider for dashboard on larger screens
    marginHorizontal: 20, // Add some margin on large screens
  }
});