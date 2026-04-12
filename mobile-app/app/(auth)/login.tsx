import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput, Surface } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import LoadingSpinner from '@/components/LoadingSpinner';
import { loginRequest, getRoleDashboardPath } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      Alert.alert('Validation', 'Please enter email and password.');
      return;
    }

    try {
      setLoading(true);
      const { token, user } = await loginRequest({ email: trimmedEmail, password });
      await login(token, user);
      router.replace(getRoleDashboardPath(user.role));
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Unable to log in';
      Alert.alert('Login failed', message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Signing in" />;
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <Surface style={styles.card} elevation={2}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Smart Doubt Platform</Text>
          <Text variant="headlineMedium" style={styles.title}>
            Sign in to continue
          </Text>
          <Text style={styles.subtitle}>
            Access your student, faculty, or admin workspace from one secure account.
          </Text>
        </View>

        <View style={styles.form}>
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

          <Button mode="contained" onPress={handleLogin} style={styles.button}>
            Login
          </Button>

          <Link href="/(auth)/register" asChild>
            <Button mode="text">Create a new account</Button>
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
});
