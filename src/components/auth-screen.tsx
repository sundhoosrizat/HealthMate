import { useRef, useState, type ComponentRef } from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,

  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { FirebaseError } from 'firebase/app';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';

import { auth } from '../../firebase';

type TextInputRef = ComponentRef<typeof TextInput>;

const PASSWORD_HINT =
  'Use at least 8 characters with an uppercase letter, a lowercase letter, a number, and a special character such as ! or @.';

const PASSWORD_SYMBOLS = "^$*.[]{}()?\"!@#%&/\\,><':;|_~";

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailRef = useRef<TextInputRef>(null);
  const passwordRef = useRef<TextInputRef>(null);
  const confirmPasswordRef = useRef<TextInputRef>(null);

  const handleAuthentication = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      Alert.alert('Required Fields', 'Please enter email and password.');
      return;
    }

    if (isSignUp && !name.trim()) {
      Alert.alert('Required Field', 'Please enter your full name.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (isSignUp) {
      const hasSpecialCharacter = Array.from(password).some((character) =>
        PASSWORD_SYMBOLS.includes(character),
      );

      if (
        password.length < 8 ||
        !/[A-Z]/.test(password) ||
        !/[a-z]/.test(password) ||
        !/[0-9]/.test(password) ||
        !hasSpecialCharacter
      ) {
        Alert.alert('Password Requirements', PASSWORD_HINT);
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert('Password Error', 'Passwords do not match.');
        return;
      }
    }

    try {
      setLoading(true);

      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          password,
        );

        await updateProfile(userCredential.user, {
          displayName: name.trim(),
        });

        Alert.alert(
          'Account Created Successfully!',
          `Welcome, ${name.trim()}!\n\nYour HealthMate journey starts now.`,
        );
      } else {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          cleanEmail,
          password,
        );

        const username =
          userCredential.user.displayName?.trim() || cleanEmail.split('@')[0];

        Alert.alert(
          'Welcome to HealthMate!',
          `Hello, ${username}! \nYou have successfully logged in.`,
        );
      }
    } catch (error: unknown) {
      if (!(error instanceof FirebaseError)) {
        Alert.alert('Authentication Failed', 'Something went wrong. Please try again.');
        return;
      }

      if (
        error.code === 'auth/password-does-not-meet-requirements' ||
        error.code === 'auth/weak-password'
      ) {
        Alert.alert('Password Requirements', PASSWORD_HINT);
        return;
      }

      let message = error.message;

      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'This email is already registered.';
          break;

        case 'auth/invalid-email':
          message = 'Please enter a valid email address.';
          break;

        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          message = 'Invalid email or password.';
          break;

        case 'auth/network-request-failed':
          message = 'Network error. Check your internet connection.';
          break;

        case 'auth/too-many-requests':
          message = 'Too many attempts. Please try again later.';
          break;

        case 'auth/operation-not-allowed':
          message = 'Email/Password login is not enabled in Firebase.';
          break;

        case 'auth/invalid-api-key':
          message = 'Firebase API key is invalid. Check firebase.ts.';
          break;

        case 'auth/configuration-not-found':
          message = 'Firebase Authentication configuration was not found.';
          break;
      }

      Alert.alert(
        'Authentication Failed',
        `${message}\n\nError Code: ${error.code}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/healthmate-logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.formCard}>
            <Text style={styles.title}>
              {isSignUp ? 'Create Account' : 'Welcome Back!'}
            </Text>

            <Text style={styles.subtitle}>
              {isSignUp
                ? 'Create your account to start your health journey.'
                : 'Login to continue your health journey.'}
            </Text>

            {isSignUp && (
              <>
                <Text style={styles.label}>Full Name</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#A0AEC0"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  returnKeyType="next"
                  submitBehavior="submit"
                  onSubmitEditing={() => emailRef.current?.focus()}
                />
              </>
            )}

            <Text style={styles.label}>Email Address</Text>

            <TextInput
              ref={emailRef}
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#A0AEC0"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <Text style={styles.label}>Password</Text>

            <View style={styles.passwordContainer}>
              <TextInput
                ref={passwordRef}
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor="#A0AEC0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!passwordVisible}
                autoCapitalize="none"
                returnKeyType={isSignUp ? 'next' : 'done'}
                submitBehavior={isSignUp ? 'submit' : 'blurAndSubmit'}
                onSubmitEditing={() => {
                  if (isSignUp) {
                    confirmPasswordRef.current?.focus();
                  }
                }}
              />

              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setPasswordVisible(!passwordVisible)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                  size={23}
                  color="#718096"
                />
              </TouchableOpacity>
            </View>

            {isSignUp && (
              <>
                <Text style={styles.passwordHint}>{PASSWORD_HINT}</Text>

                <Text style={styles.label}>Confirm Password</Text>

                <View style={styles.passwordContainer}>
                  <TextInput
                    ref={confirmPasswordRef}
                    style={styles.passwordInput}
                    placeholder="Confirm your password"
                    placeholderTextColor="#A0AEC0"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!confirmPasswordVisible}
                    autoCapitalize="none"
                    returnKeyType="done"
                    submitBehavior="blurAndSubmit"
                  />

                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() =>
                      setConfirmPasswordVisible(!confirmPasswordVisible)
                    }
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={
                        confirmPasswordVisible
                          ? 'eye-off-outline'
                          : 'eye-outline'
                      }
                      size={23}
                      color="#718096"
                    />
                  </TouchableOpacity>
                </View>
              </>
            )}

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={handleAuthentication}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isSignUp ? 'Create Account' : 'Login'}
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>
                {isSignUp
                  ? 'Already have an account? '
                  : "Don't have an account? "}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  setIsSignUp(!isSignUp);
                  setPassword('');
                  setConfirmPassword('');
                  setPasswordVisible(false);
                  setConfirmPasswordVisible(false);
                }}
                disabled={loading}
              >
                <Text style={styles.switchLink}>
                  {isSignUp ? 'Login' : 'Sign Up'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.footer}>Stay Healthy. Stay Active. </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F8FC',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: 250,
    height: 250,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 18,
    elevation: 3,
    shadowColor: '#163A5F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#163A5F',
  },
  subtitle: {
    fontSize: 13,
    color: '#718096',
    marginTop: 7,
    marginBottom: 22,
    lineHeight: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#172B4D',
    marginBottom: 7,
  },
  input: {
    backgroundColor: '#F4F8FC',
    borderWidth: 1,
    borderColor: '#DCE5EF',
    borderRadius: 10,
    padding: 13,
    fontSize: 14,
    color: '#172B4D',
    marginBottom: 17,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F8FC',
    borderWidth: 1,
    borderColor: '#DCE5EF',
    borderRadius: 10,
    marginBottom: 17,
    minHeight: 48,
  },
  passwordInput: {
    flex: 1,
    padding: 13,
    fontSize: 14,
    color: '#172B4D',
  },
  eyeButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordHint: {
    fontSize: 11,
    color: '#718096',
    marginTop: -10,
    marginBottom: 15,
  },
  primaryButton: {
    backgroundColor: '#20B8A5',
    padding: 15,
    borderRadius: 11,
    alignItems: 'center',
    marginTop: 5,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
    flexWrap: 'wrap',
  },
  switchText: {
    color: '#718096',
    fontSize: 13,
  },
  switchLink: {
    color: '#20B8A5',
    fontWeight: 'bold',
    fontSize: 13,
  },
  footer: {
    textAlign: 'center',
    color: '#718096',
    fontSize: 12,
    marginTop: 25,
  },
});