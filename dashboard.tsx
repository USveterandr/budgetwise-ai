import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../AuthContext';
import { Button } from '../../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function Dashboard() {
  const { userProfile, logout, uploadProfilePicture, updateUserProfile, deleteAccount, signOutFromAllDevices, changePassword } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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

  async function handleChangePassword() {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert("Invalid Password", "Your new password must be at least 6 characters long.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(oldPassword, newPassword);
      Alert.alert("Success", "Your password has been changed successfully.");
      // Reset UI
      setShowChangePassword(false);
      setOldPassword('');
      setNewPassword('');
    } catch (error: any) {
      let errorMessage = "Failed to change password. Please try again.";
      if (error.code === 'auth/wrong-password') {
        errorMessage = "The current password you entered is incorrect.";
      }
      Alert.alert("Password Change Failed", errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  }

  function handleDeletePress() {
    const providerId = userProfile?.providerData[0]?.providerId;

    if (providerId === 'password') {
      setShowDeleteConfirm(true); // Show password input for email/password users
    } else if (providerId === 'google.com') {
      // For Google users, show a confirmation alert then trigger the re-auth popup
      Alert.alert(
        "Delete Account",
        "To confirm, you will be asked to sign in with Google again. This action is permanent and cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Continue", style: "destructive", onPress: () => handleDeleteAccount() }
        ]
      );
    } else {
      Alert.alert("Error", "Account deletion is not supported for this sign-in method.");
    }
  }

  async function handleDeleteAccount(password?: string) {
    setIsDeleting(true);
    try {
      await deleteAccount(password);
      // The AppLayout will automatically redirect the user after deletion.
    } catch (error: any) {
      let errorMessage = "Could not delete your account. Please try again.";
      if (error.code === 'auth/wrong-password') {
        errorMessage = "The password you entered is incorrect.";
      } else if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        // Don't show an error if the user intentionally closes the Google popup
        setIsDeleting(false);
        return;
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = "This is a sensitive action. Please log out and log back in before deleting your account.";
      }
      Alert.alert("Deletion Failed", errorMessage);
    } finally {
      setIsDeleting(false);
      // Reset the delete confirmation UI state
      setShowDeleteConfirm(false);
      setDeletePassword('');
    }
  }

  function confirmSignOutAll() {
    Alert.alert(
      "Sign Out Everywhere",
      "This will sign you out from all devices, including this one. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out All", style: "destructive", onPress: handleSignOutAll }
      ]
    );
  }

  async function handleSignOutAll() {
    try {
      await signOutFromAllDevices();
    } catch (error) {
      Alert.alert("Error", "Failed to sign out from all devices.");
    }
  }

  const memberSince = userProfile?.createdAt
    ? new Date(
        userProfile.createdAt.seconds * 1000 +
        userProfile.createdAt.nanoseconds / 1000000
      ).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  const isPasswordUser = userProfile?.providerData[0]?.providerId === 'password';

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
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
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
      {memberSince && <Text style={styles.memberSince}>Member since {memberSince}</Text>}

      {showChangePassword ? (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Change Your Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Current Password"
            placeholderTextColor="#64748B"
            secureTextEntry
            value={oldPassword}
            onChangeText={setOldPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="New Password"
            placeholderTextColor="#64748B"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            onSubmitEditing={handleChangePassword}
          />
          <Button title={isChangingPassword ? "Saving..." : "Save New Password"} onPress={handleChangePassword} disabled={isChangingPassword} />
          <Button title="Cancel" onPress={() => setShowChangePassword(false)} variant="outline" style={{ marginTop: 12 }} disabled={isChangingPassword} />
        </View>
      ) : showDeleteConfirm ? (
        <View style={styles.deleteConfirmContainer}>
          <Text style={styles.deleteConfirmText}>Enter your password to confirm deletion:</Text>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#64748B"
            secureTextEntry
            value={deletePassword}
            onChangeText={setDeletePassword}
            onSubmitEditing={() => handleDeleteAccount(deletePassword)}
          />
          <Button title={isDeleting ? "Deleting..." : "Confirm & Delete"} onPress={() => handleDeleteAccount(deletePassword)} variant="destructive" disabled={isDeleting} />
          <Button title="Cancel" onPress={() => setShowDeleteConfirm(false)} variant="outline" style={{ marginTop: 12 }} disabled={isDeleting} />
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <Button title="Log Out" onPress={handleLogout} />
          {isPasswordUser && <Button title="Change Password" onPress={() => setShowChangePassword(true)} variant="outline" style={{ marginTop: 12 }} />}
          <Button title="Sign Out All Devices" onPress={confirmSignOutAll} variant="outline" style={{ marginTop: 12 }} />
          <Button title="Delete Account" onPress={handleDeletePress} variant="destructive" style={{ marginTop: 12 }} disabled={isDeleting} />
          {isDeleting && <ActivityIndicator style={{ marginTop: 10 }} color="#EF4444" />}
        </View>
      )}
    </KeyboardAvoidingView>
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
  memberSince: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
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
  buttonContainer: {
    marginTop: 40,
    width: '80%',
  },
  deleteConfirmContainer: {
    marginTop: 20,
    width: '80%',
    alignItems: 'center',
  },
  deleteConfirmText: {
    color: '#F8FAFC',
    marginBottom: 10,
  },
  formContainer: {
    marginTop: 20,
    width: '80%',
    alignItems: 'center',
  },
  formTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    marginBottom: 10,
  },
});