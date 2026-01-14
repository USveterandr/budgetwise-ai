import { Stack, Redirect } from "expo-router";
import { useAuth } from "../../AuthContext";
import { View, ActivityIndicator } from "react-native";
import { Colors } from "../../constants/Colors";

export default function AppLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    // If we are not authenticated, we should not be in this group
    return <Redirect href="/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
    </Stack>
  );
}
