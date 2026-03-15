import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, DashboardColors } from '../../constants/Colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          borderTopWidth: 0,
          paddingTop: 8,
          paddingBottom: 8,
          height: 64,
          position: 'absolute',
          bottom: 25,
          left: 40,
          right: 40,
          borderRadius: 32,
          elevation: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="apps" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="strategy"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="flash" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="person" size={28} color={color} />,
        }}
      />

      {/* Hidden Screens - Accessible via Strategy Hub */}
      <Tabs.Screen name="finance" options={{ href: null }} />
      <Tabs.Screen name="growth" options={{ href: null }} />
      <Tabs.Screen name="tools" options={{ href: null }} />
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