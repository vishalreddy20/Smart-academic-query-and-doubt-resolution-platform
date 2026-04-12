import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import LoadingSpinner from '@/components/LoadingSpinner';
import SubjectPicker from '@/components/SubjectPicker';
import { getSubjectsRequest, postDoubtRequest } from '@/services/api';
import type { Subject } from '@/types';

export default function PostDoubtScreen() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectId, setSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setLoading(true);
        setSubjects(await getSubjectsRequest());
      } catch (error: any) {
        Alert.alert('Error', error?.response?.data?.message || 'Unable to load subjects');
      } finally {
        setLoading(false);
      }
    };

    void loadSubjects();
  }, []);

  const handleSubmit = async () => {
    if (!subjectId || !title.trim() || !description.trim()) {
      Alert.alert('Validation', 'Subject, title, and description are required.');
      return;
    }

    try {
      setSubmitting(true);
      await postDoubtRequest({ subjectId, title: title.trim(), description: description.trim() });
      Alert.alert('Success', 'Your doubt has been posted.');
      router.replace({ pathname: '/(student)/dashboard', params: { refreshedAt: String(Date.now()) } });
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Unable to post doubt');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading subjects" />;
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Surface style={styles.card} elevation={2}>
          <Text style={styles.kicker}>New doubt</Text>
          <Text variant="headlineSmall" style={styles.title}>
            Post your academic question
          </Text>
          <Text style={styles.subtitle}>Choose the right subject, add clear details, and submit it to the faculty queue.</Text>

          <View style={styles.form}>
            <SubjectPicker subjects={subjects} value={subjectId} onChange={setSubjectId} loading={loading} />
            <TextInput mode="outlined" label="Title" value={title} onChangeText={setTitle} outlineStyle={styles.inputOutline} />
            <TextInput
              mode="outlined"
              label="Description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              outlineStyle={styles.inputOutline}
              style={styles.descriptionInput}
            />
            <Button mode="contained" onPress={handleSubmit} loading={submitting}>
              Submit Doubt
            </Button>
            <Button mode="text" onPress={() => router.back()}>
              Cancel
            </Button>
          </View>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
    padding: 18,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 28,
    backgroundColor: Colors.surface,
    padding: 22,
    gap: 16,
  },
  kicker: {
    color: Colors.primary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  title: {
    color: Colors.text,
    fontWeight: '900',
  },
  subtitle: {
    color: Colors.muted,
    lineHeight: 21,
  },
  form: {
    gap: 14,
  },
  inputOutline: {
    borderRadius: 16,
  },
  descriptionInput: {
    minHeight: 140,
  },
});
