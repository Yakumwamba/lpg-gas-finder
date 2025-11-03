/**
 * Sign Up Screen
 * Handles new user registration with email, password, and user type selection
 * Integrates with backend authentication API
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import theme from '../config/theme';
import { useAuth } from '../context/AuthContext';

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('customer'); // customer, provider, courier
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const { signUp, isSigningUp, error } = useAuth();

  const handleSignUp = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Missing Field', 'Please enter your name.');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Missing Field', 'Please enter your email address.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Missing Field', 'Please enter a password.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Password Too Short', 'Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Passwords Do Not Match', 'Please ensure both passwords are the same.');
      return;
    }

    if (!agreeTerms) {
      Alert.alert('Terms Required', 'Please agree to the terms and conditions.');
      return;
    }

    const result = await signUp(email, password, name, userType);
    if (!result.success) {
      Alert.alert('Sign Up Failed', result.error);
    }
    // Navigation will be handled by auth state change in App.js
  };

  const UserTypeOption = ({ type, label, description, icon }) => (
    <TouchableOpacity
      style={[styles.userTypeOption, userType === type && styles.userTypeOptionActive]}
      onPress={() => setUserType(type)}
    >
      <View style={[styles.userTypeIcon, userType === type && styles.userTypeIconActive]}>
        <MaterialCommunityIcons
          name={icon}
          size={24}
          color={userType === type ? 'white' : theme.colors.secondary}
        />
      </View>
      <View style={styles.userTypeContent}>
        <Text style={styles.userTypeLabel}>{label}</Text>
        <Text style={styles.userTypeDescription}>{description}</Text>
      </View>
      {userType === type && (
        <MaterialCommunityIcons
          name="check-circle"
          size={20}
          color={theme.colors.secondary}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="gas-cylinder"
            size={50}
            color={theme.colors.secondary}
          />
          <Text style={styles.appName}>Create Account</Text>
          <Text style={styles.subtitle}>Join LPG Gas Finder today</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Name Input */}
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="account-outline"
              size={20}
              color={theme.colors.textTertiary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor={theme.colors.textTertiary}
              value={name}
              onChangeText={setName}
              editable={!isSigningUp}
              autoCapitalize="words"
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color={theme.colors.textTertiary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={theme.colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              editable={!isSigningUp}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={20}
              color={theme.colors.textTertiary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password (min 8 characters)"
              placeholderTextColor={theme.colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              editable={!isSigningUp}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.visibilityIcon}
            >
              <MaterialCommunityIcons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={theme.colors.textTertiary}
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="lock-check-outline"
              size={20}
              color={theme.colors.textTertiary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor={theme.colors.textTertiary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!isSigningUp}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.visibilityIcon}
            >
              <MaterialCommunityIcons
                name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={theme.colors.textTertiary}
              />
            </TouchableOpacity>
          </View>

          {/* User Type Selection */}
          <View style={styles.userTypeSection}>
            <Text style={styles.sectionLabel}>I am a:</Text>
            <View style={styles.userTypeContainer}>
              <UserTypeOption
                type="customer"
                label="Customer"
                description="Order LPG"
                icon="shopping-bag-outline"
              />
              <UserTypeOption
                type="provider"
                label="Provider"
                description="Sell LPG"
                icon="store-outline"
              />
              <UserTypeOption
                type="courier"
                label="Courier"
                description="Deliver LPG"
                icon="truck-delivery-outline"
              />
            </View>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle" size={20} color={theme.colors.secondary} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Terms and Conditions */}
          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}
              onPress={() => setAgreeTerms(!agreeTerms)}
              disabled={isSigningUp}
            >
              {agreeTerms && (
                <MaterialCommunityIcons name="check" size={16} color="white" />
              )}
            </TouchableOpacity>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.signUpButton, isSigningUp && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={isSigningUp}
          >
            {isSigningUp ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.signUpButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.replace('SignIn')}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  appName: {
    fontSize: 24,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginTop: 12,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textTertiary,
    marginTop: 6,
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
  },
  visibilityIcon: {
    padding: 8,
  },
  userTypeSection: {
    marginVertical: 20,
  },
  sectionLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  userTypeContainer: {
    gap: 10,
  },
  userTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  userTypeOptionActive: {
    borderColor: theme.colors.secondary,
    backgroundColor: `${theme.colors.secondary}0F`,
  },
  userTypeIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: `${theme.colors.secondary}1A`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userTypeIconActive: {
    backgroundColor: theme.colors.secondary,
  },
  userTypeContent: {
    flex: 1,
  },
  userTypeLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  userTypeDescription: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textTertiary,
    marginTop: 2,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.secondary}1A`,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: theme.colors.secondary,
    fontSize: theme.typography.fontSize.sm,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.secondary,
  },
  termsText: {
    flex: 1,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  termsLink: {
    color: theme.colors.secondary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  signUpButton: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signUpButtonText: {
    color: 'white',
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signInText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
  },
  signInLink: {
    color: theme.colors.secondary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
});

export default SignUpScreen;
