import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, DashboardColors } from '../../constants/Colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: DashboardColors.textSecondary,
        tabBarStyle: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          paddingTop: 8,
          paddingBottom: 8,
          height: 70, // Slightly taller for better ergonomics
          position: 'absolute',
          borderTopWidth: 1,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          paddingBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: 'Finance',
          tabBarIcon: ({ color, size }) => <Ionicons name="wallet" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="growth"
        options={{
          title: 'Growth',
          tabBarIcon: ({ color, size }) => <Ionicons name="trending-up" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: 'Tools',
          tabBarIcon: ({ color, size }) => <Ionicons name="hammer" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={26} color={color} />,
        }}
      />

      {/* Hidden Screens - Accessible via Hubs */}
      <Tabs.Screen name="transactions" options={{ href: null }} />
      <Tabs.Screen name="budget" options={{ href: null }} />
      <Tabs.Screen name="budget-planning" options={{ href: null }} />
      <Tabs.Screen name="portfolio" options={{ href: null }} />
      <Tabs.Screen name="ai-advisor" options={{ href: null }} />
      <Tabs.Screen name="consultation" options={{ href: null }} />
      <Tabs.Screen name="receipts" options={{ href: null }} />
      <Tabs.Screen name="subscription" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}