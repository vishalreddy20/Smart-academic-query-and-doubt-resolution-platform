import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';
import Colors from '../../constants/Colors';

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { login } = useAuth();

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    if (!email) {
      Alert.alert('Error', 'Email not provided.');
      router.replace('/(auth)/login');
    }
  }, [email, router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.verifyOtp(email as string, otp);
      if (response.token && response.user) {
        Alert.alert('Success', 'Email verified successfully!', [
          { text: 'OK', onPress: async () => {
            await login(response.token, response.user);
            // Root layout handles conditional redirection
          }}
        ]);
      } else {
        Alert.alert('Success', 'Email verified successfully! Please log in.');
        router.replace('/(auth)/login');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid OTP. Please try again.';
      Alert.alert('Verification Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await authApi.resendOtp(email as string);
      Alert.alert('OTP Sent', 'A new verification code has been sent to your email.');
      setTimeLeft(300);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to resend OTP.';
      Alert.alert('Error', msg);
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.backText}>← Back to Login</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>Verify Email</Text>
        <Text style={styles.subheading}>
          We've sent a 6-digit OTP to{'\n'}
          <Text style={{ fontWeight: '600', color: Colors.text.primary }}>{email}</Text>
        </Text>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Enter OTP</Text>
          <TextInput
            style={styles.input}
            placeholder="123456"
            placeholderTextColor={Colors.text.muted}
            value={otp}
            onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            editable={!isLoading && timeLeft > 0}
            textAlign="center"
          />

          <TouchableOpacity
            style={[styles.verifyButton, (isLoading || timeLeft === 0 || otp.length !== 6) && styles.verifyButtonDisabled]}
            onPress={handleVerify}
            disabled={isLoading || timeLeft === 0 || otp.length !== 6}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.verifyButtonText}>Verify Email</Text>
            )}
          </TouchableOpacity>

          {timeLeft > 0 ? (
            <Text style={styles.timerText}>
              OTP expires in <Text style={{ fontWeight: '700', color: Colors.primary }}>{formatTime(timeLeft)}</Text>
            </Text>
          ) : (
            <Text style={styles.expiredText}>OTP expired. Please request a new one.</Text>
          )}

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code? </Text>
            <TouchableOpacity onPress={handleResend} disabled={resendLoading || isLoading}>
              <Text style={[styles.resendLink, (resendLoading || isLoading) && { opacity: 0.5 }]}>
                {resendLoading ? 'Sending...' : 'Resend OTP'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
  },
  backText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 15,
    color: Colors.text.secondary,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 16,
    fontSize: 24,
    letterSpacing: 4,
    color: Colors.text.primary,
    backgroundColor: Colors.background,
    marginBottom: 24,
  },
  verifyButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  timerText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  expiredText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.error,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  resendText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
});
