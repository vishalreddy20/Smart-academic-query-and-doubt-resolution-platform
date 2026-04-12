import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput, Surface } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { Link, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getRoleDashboardPath, registerRequest } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/types';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail || !password) {
      Alert.alert('Validation', 'Please fill all fields.');
      return;
    }

    if (!emailPattern.test(trimmedEmail)) {
      Alert.alert('Validation', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Validation', 'Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      const response = await registerRequest({ name: trimmedName, email: trimmedEmail, password, role });

      if (response.token && response.user) {
        await login(response.token, response.user);
        router.replace(getRoleDashboardPath(response.user.role));
        return;
      }

      Alert.alert('Registration successful', response.message || 'Account created. Please log in to continue.');
      router.replace('/(auth)/login');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Unable to register';
      Alert.alert('Registration failed', message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Creating account" />;
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <Surface style={styles.card} elevation={2}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Join the platform</Text>
          <Text variant="headlineMedium" style={styles.title}>
            Create your account
          </Text>
          <Text style={styles.subtitle}>
            Students, faculty, and admins can all use the same backend with role-aware navigation.
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput mode="outlined" label="Name" value={name} onChangeText={setName} outlineStyle={styles.inputOutline} />
          <TextInput
            mode="outlined"
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            outlineStyle={styles.inputOutline}
          />
          <TextInput
            mode="outlined"
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureTextEntry}
            right={<TextInput.Icon icon={secureTextEntry ? 'eye' : 'eye-off'} onPress={() => setSecureTextEntry((value) => !value)} />}
            outlineStyle={styles.inputOutline}
          />

          <View style={styles.pickerWrap}>
            <Text style={styles.pickerLabel}>Role</Text>
            <Picker selectedValue={role} onValueChange={(value) => setRole(value as Role)} style={styles.picker}>
              <Picker.Item label="Student" value="student" />
              <Picker.Item label="Faculty" value="faculty" />
              <Picker.Item label="Admin" value="admin" />
            </Picker>
          </View>

          <Button mode="contained" onPress={handleRegister} style={styles.button}>
            Register
          </Button>

          <Link href="/(auth)/login" asChild>
            <Button mode="text">Already have an account? Sign in</Button>
          </Link>
        </View>
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
  },
  subtitle: {
    color: Colors.muted,
    lineHeight: 22,
  },
  form: {
    gap: 14,
  },
  button: {
    marginTop: 4,
  },
  inputOutline: {
    borderRadius: 16,
  },
  pickerWrap: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  pickerLabel: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  picker: {
    height: 52,
  },
});
