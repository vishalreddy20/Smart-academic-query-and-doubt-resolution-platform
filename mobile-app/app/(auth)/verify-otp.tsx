import { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, TextInput as RNTextInput, View } from 'react-native';
import { Button, Text, Surface } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import LoadingSpinner from '@/components/LoadingSpinner';
import { verifyOtpRequest, resendOtpRequest, getRoleDashboardPath } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const OTP_LENGTH = 6;

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const inputRefs = useRef<(RNTextInput | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== OTP_LENGTH) {
      Alert.alert('Validation', 'Please enter all 6 digits.');
      return;
    }

    if (!email) {
      Alert.alert('Error', 'Email not found. Please register again.');
      router.replace('/(auth)/register');
      return;
    }

    try {
      setLoading(true);
      const response = await verifyOtpRequest({ email, otp: otpValue });

      if (response.token && response.user) {
        await login(response.token, response.user);
        Alert.alert('Success', 'Email verified successfully!');
        router.replace(getRoleDashboardPath(response.user.role));
      } else {
        Alert.alert('Verified', response.message || 'Email verified. Please log in.');
        router.replace('/(auth)/login');
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Invalid OTP. Please try again.';
      Alert.alert('Verification failed', message);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;

    try {
      setResendLoading(true);
      const response = await resendOtpRequest(email);
      Alert.alert('OTP Sent', response.message || 'A new OTP has been sent to your email.');
      setTimeLeft(300);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to resend OTP.';
      Alert.alert('Error', message);
    } finally {
      setResendLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Verifying OTP" />;
  }

  const isExpired = timeLeft === 0;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <Surface style={styles.card} elevation={2}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Almost there</Text>
          <Text variant="headlineMedium" style={styles.title}>
            Verify your email
          </Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit OTP to{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>
        </View>

        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <RNTextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
              value={digit}
              onChangeText={(value) => handleChange(index, value)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
              keyboardType="number-pad"
              maxLength={1}
              editable={!isExpired}
              selectTextOnFocus
            />
          ))}
        </View>

        {!isExpired && (
          <Text style={styles.timerText}>
            OTP expires in <Text style={styles.timerHighlight}>{formatTime(timeLeft)}</Text>
          </Text>
        )}

        {isExpired && (
          <Text style={styles.expiredText}>OTP expired. Please request a new one.</Text>
        )}

        <Button mode="contained" onPress={handleVerify} style={styles.button} disabled={isExpired}>
          Verify Email
        </Button>

        <View style={styles.resendSection}>
          <Text style={styles.resendLabel}>Didn't receive the code?</Text>
          <Button mode="text" onPress={handleResend} loading={resendLoading} disabled={resendLoading}>
            Resend OTP
          </Button>
        </View>

        <Button mode="text" onPress={() => router.replace('/(auth)/login')}>
          Back to Login
        </Button>
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 28,
    backgroundColor: Colors.surface,
    padding: 24,
    gap: 18,
  },
  hero: {
    gap: 10,
    alignItems: 'center',
  },
  kicker: {
    color: Colors.primary,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    color: Colors.text,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.muted,
    lineHeight: 22,
    textAlign: 'center',
  },
  emailHighlight: {
    color: Colors.primary,
    fontWeight: '700',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 8,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 14,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  otpInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: '#EEF4FF',
  },
  timerText: {
    textAlign: 'center',
    color: Colors.muted,
    fontSize: 14,
  },
  timerHighlight: {
    fontWeight: '700',
    color: Colors.primary,
  },
  expiredText: {
    textAlign: 'center',
    color: Colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    marginTop: 4,
  },
  resendSection: {
    alignItems: 'center',
    gap: 0,
  },
  resendLabel: {
    color: Colors.muted,
    fontSize: 14,
  },
});
