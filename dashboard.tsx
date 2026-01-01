import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useAuth } from '../../AuthContext';
import { Button } from '../../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function Dashboard() {
  const { userProfile, logout, uploadProfilePicture, updateUserProfile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [isEditingName, setIsEditingName] = useState(false);

  async function handleLogout() {
    try {
      await logout();
      // The AppLayout will automatically redirect to /login.
    } catch (error) {
      console.error("Failed to log out", error);
    }
  }

  useEffect(() => {
    // Update local state if userProfile changes
    setDisplayName(userProfile?.displayName || '');
  }, [userProfile?.displayName]);

  async function handleSelectAvatar() {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to allow access to your photos to change your profile picture.");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (pickerResult.canceled) {
      return;
    }

    if (pickerResult.assets && pickerResult.assets.length > 0) {
      const uri = pickerResult.assets[0].uri;
      setIsUploading(true);
      try {
        await uploadProfilePicture(uri);
      } catch (error) {
        console.error("Failed to upload profile picture:", error);
        Alert.alert("Upload Failed", "Could not upload your profile picture. Please try again.");
      } finally {
        setIsUploading(false);
      }
    }
  }

  async function handleSaveName() {
    if (!displayName.trim()) {
      Alert.alert("Invalid Name", "Display name cannot be empty.");
      return;
    }
    try {
      await updateUserProfile({ displayName });
      setIsEditingName(false);
    } catch (error) {
      Alert.alert("Update Failed", "Could not update your display name.");
    }
  }

  // While the user profile is being fetched from Firestore, show a loading spinner.
  // The AppLayout handles the initial auth check, this handles the profile data fetch.
  if (!userProfile) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleSelectAvatar} disabled={isUploading}>
        {userProfile?.photoURL ? (
          <Image source={{ uri: userProfile.photoURL }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={40} color="#94A3B8" />
          </View>
        )}
        {isUploading && (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator color="#FFF" />
          </View>
        )}
      </TouchableOpacity>
      <Text style={styles.title}>Dashboard</Text>
      
      {isEditingName ? (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter your display name"
          />
          <Button title="Save" onPress={handleSaveName} />
        </View>
      ) : (
        <TouchableOpacity onPress={() => setIsEditingName(true)}>
          <Text style={styles.email}>Welcome, {userProfile?.displayName || userProfile?.email}</Text>
        </TouchableOpacity>
      )}
      <Button title="Log Out" onPress={handleLogout} style={{ marginTop: 40 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 20,
  },
  email: {
    fontSize: 18,
    color: '#94A3B8',
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#334155',
    color: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    fontSize: 16,
  },
});