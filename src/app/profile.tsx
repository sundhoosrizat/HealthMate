import React, { useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import { signOut, updateProfile } from 'firebase/auth';
import { auth, db } from '../../firebase';

type TextInputRef = React.ComponentRef<typeof TextInput>;
type ScrollViewRef = React.ComponentRef<typeof ScrollView>;

export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const scrollViewRef = useRef<ScrollViewRef>(null);
  const nameRef = useRef<TextInputRef>(null);
  const ageRef = useRef<TextInputRef>(null);
  const genderRef = useRef<TextInputRef>(null);
  const heightRef = useRef<TextInputRef>(null);
  const weightRef = useRef<TextInputRef>(null);

  const currentUser = auth.currentUser;

  const getImageKey = () => {
    return currentUser
      ? `healthmate_profile_image_${currentUser.uid}`
      : null;
  };

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';

    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, () => {
      setKeyboardVisible(true);
    });

    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      setEmail(currentUser.email || '');

      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();

        setName(data.name || currentUser.displayName || '');
        setAge(data.age?.toString() || '');
        setGender(data.gender || '');
        setHeight(data.height?.toString() || '');
        setWeight(data.weight?.toString() || '');
      } else {
        setName(currentUser.displayName || '');
      }

      const imageKey = getImageKey();

      if (imageKey) {
        const savedImage = await AsyncStorage.getItem(imageKey);
        setProfileImage(savedImage || null);
      }
    } catch (error) {
      console.log('Profile loading error:', error);
      Alert.alert('Error', 'Unable to load profile information.');
    } finally {
      setLoading(false);
    }
  };

  // Measure the input relative to the ScrollView's native content view.
  const handleFieldFocus = (
    inputRef: React.RefObject<TextInputRef | null>
  ) => {
    setTimeout(() => {
      const scrollNode = scrollViewRef.current?.getInnerViewRef();

      if (!scrollNode || !inputRef.current) {
        return;
      }

      inputRef.current.measureLayout(
        scrollNode,
        (_x, y) => {
          scrollViewRef.current?.scrollTo({
            y: Math.max(0, y - 100),
            animated: true,
          });
        },
        () => {
          console.log('Unable to measure input position');
        }
      );
    }, 350);
  };

  const handlePickImage = async () => {
    try {
      if (!currentUser) {
        Alert.alert('Error', 'Please login again.');
        return;
      }

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow gallery access to select your profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const imageUri = result.assets[0].uri;
      setUploadingImage(true);

      const imageKey = getImageKey();

      if (!imageKey) {
        throw new Error('User not found.');
      }

      await AsyncStorage.setItem(imageKey, imageUri);
      setProfileImage(imageUri);

      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error) {
      console.log('Profile picture error:', error);
      Alert.alert(
        'Error',
        'Unable to save your profile picture. Please try again.'
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'Please login again.');
      return;
    }

    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your name.');
      return;
    }

    if (age && (!Number.isFinite(Number(age)) || Number(age) <= 0)) {
      Alert.alert('Invalid Age', 'Please enter a valid age.');
      return;
    }

    if (
      height &&
      (!Number.isFinite(Number(height)) || Number(height) <= 0)
    ) {
      Alert.alert('Invalid Height', 'Please enter a valid height.');
      return;
    }

    if (
      weight &&
      (!Number.isFinite(Number(weight)) || Number(weight) <= 0)
    ) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight.');
      return;
    }

    try {
      setSaving(true);

      await setDoc(
        doc(db, 'users', currentUser.uid),
        {
          name: name.trim(),
          email: currentUser.email || '',
          age: age ? Number(age) : '',
          gender: gender.trim(),
          height: height ? Number(height) : '',
          weight: weight ? Number(weight) : '',
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      await updateProfile(currentUser, {
        displayName: name.trim(),
      });

      Keyboard.dismiss();
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.log('Profile save error:', error);
      Alert.alert('Error', 'Unable to save profile. Please check Firestore Rules.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
          } catch (error) {
            console.log('Logout error:', error);
            Alert.alert('Error', 'Unable to logout.');
          }
        },
      },
    ]);
  };

  const renderField = (
    label: string,
    value: string,
    setter: (text: string) => void,
    inputRef?: React.RefObject<TextInputRef | null>,
    nextRef?: React.RefObject<TextInputRef | null>,
    keyboardType: 'default' | 'numeric' = 'default',
    editable = true
  ) => {
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>{label}</Text>

        <TextInput
          ref={inputRef}
          style={[styles.input, !editable && styles.disabledInput]}
          value={value}
          onChangeText={setter}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor="#9AA8B8"
          keyboardType={keyboardType}
          editable={editable}
          returnKeyType={nextRef ? 'next' : 'done'}
          blurOnSubmit={!nextRef}
          onFocus={() => {
            if (inputRef) {
              handleFieldFocus(inputRef);
            }
          }}
          onSubmitEditing={() => {
            if (nextRef) {
              nextRef.current?.focus();
            } else {
              Keyboard.dismiss();
            }
          }}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#20B8A5" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>My Profile</Text>
          <Text style={styles.subtitle}>Manage your personal information</Text>

          <View style={styles.profileCard}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={handlePickImage}
              disabled={uploadingImage}
            >
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {name.trim() ? name.trim().charAt(0).toUpperCase() : 'U'}
                  </Text>
                </View>
              )}

              <View style={styles.cameraIcon}>
                <Text style={styles.cameraText}>+</Text>
              </View>
            </TouchableOpacity>

            {uploadingImage && (
              <View style={styles.uploadingRow}>
                <ActivityIndicator color="#20B8A5" />
                <Text style={styles.uploadingText}>Saving picture...</Text>
              </View>
            )}

            <Text style={styles.profileName}>{name || 'HealthMate User'}</Text>
            <Text style={styles.profileEmail}>{email}</Text>

            <TouchableOpacity
              style={styles.changePhotoButton}
              onPress={handlePickImage}
              disabled={uploadingImage}
            >
              <Text style={styles.changePhotoText}>Change Profile Picture</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Personal Information</Text>

              <TouchableOpacity
                onPress={() => {
                  setEditing(!editing);
                  Keyboard.dismiss();
                }}
              >
                <Text style={styles.editText}>{editing ? 'Cancel' : 'Edit'}</Text>
              </TouchableOpacity>
            </View>

            {renderField(
              'Full Name', name, setName, nameRef, ageRef, 'default', editing
            )}

            {renderField(
              'Email', email, setEmail, undefined, undefined, 'default', false
            )}

            {renderField(
              'Age', age, setAge, ageRef, genderRef, 'numeric', editing
            )}

            {renderField(
              'Gender', gender, setGender, genderRef, heightRef, 'default', editing
            )}

            {renderField(
              'Height (cm)', height, setHeight, heightRef, weightRef, 'numeric', editing
            )}

            {renderField(
              'Weight (kg)', weight, setWeight, weightRef, undefined, 'numeric', editing
            )}
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <Text style={styles.footer}>HealthMate • Your Health, Your Journey</Text>
        </ScrollView>

        {editing && (
          <View
            style={[
              styles.keyboardSaveContainer,
              keyboardVisible && styles.keyboardSaveActive,
            ]}
          >
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F8FC',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 35,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F8FC',
  },
  loadingText: {
    marginTop: 12,
    color: '#718096',
  },
  title: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#163A5F',
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    marginTop: 5,
    marginBottom: 20,
  },
  profileCard: {
    backgroundColor: '#163A5F',
    borderRadius: 18,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#20B8A5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#20B8A5',
  },
  avatarText: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#20B8A5',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  uploadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadingText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 13,
  },
  profileName: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileEmail: {
    fontSize: 14,
    color: '#D5E2EF',
    marginTop: 5,
  },
  changePhotoButton: {
    backgroundColor: '#24577F',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    marginTop: 15,
  },
  changePhotoText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#163A5F',
  },
  editText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#20B8A5',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#172B4D',
    marginBottom: 7,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#DCE5EF',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#172B4D',
    backgroundColor: '#FFFFFF',
  },
  disabledInput: {
    backgroundColor: '#F1F4F8',
    color: '#718096',
  },
  keyboardSaveContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'android' ? 8 : 12,
    backgroundColor: '#F4F8FC',
    borderTopWidth: 1,
    borderTopColor: '#DCE5EF',
  },
  keyboardSaveActive: {
    paddingBottom: 8,
  },
  saveButton: {
    height: 52,
    backgroundColor: '#20B8A5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  logoutButton: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E05252',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  logoutText: {
    color: '#E05252',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    textAlign: 'center',
    color: '#718096',
    fontSize: 12,
    marginTop: 25,
  },
});