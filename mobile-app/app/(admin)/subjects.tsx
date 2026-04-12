import { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Button, Card, Text, TextInput } from 'react-native-paper';
import { Trash2 } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import LoadingSpinner from '@/components/LoadingSpinner';
import { createSubjectRequest, deleteSubjectRequest, getAdminSubjectsRequest } from '@/services/api';
import type { Subject } from '@/types';

export default function AdminSubjectsScreen() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectName, setSubjectName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setSubjects(await getAdminSubjectsRequest());
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Unable to load subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      setSubjects(await getAdminSubjectsRequest());
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Unable to refresh subjects');
    } finally {
      setRefreshing(false);
    }
  };

  const handleAdd = async () => {
    if (!subjectName.trim()) {
      Alert.alert('Validation', 'Subject name is required.');
      return;
    }

    try {
      setSaving(true);
      const created = await createSubjectRequest({ subjectName: subjectName.trim(), description: description.trim() });
      setSubjects((current) => [created, ...current].sort((a, b) => a.subjectName.localeCompare(b.subjectName)));
      setSubjectName('');
      setDescription('');
      Alert.alert('Success', 'Subject created successfully.');
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Unable to create subject');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete subject', `Delete ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeletingId(id);
            await deleteSubjectRequest(id);
            setSubjects((current) => current.filter((subject) => subject._id !== id));
          } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message || 'Unable to delete subject');
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  if (loading) {
    return <LoadingSpinner label="Loading subjects" />;
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={subjects}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={styles.name}>{item.subjectName}</Text>
                <Text style={styles.description}>{item.description || 'No description provided.'}</Text>
              </View>
              <Button
                icon={() => <Trash2 size={16} color={Colors.danger} />}
                mode="outlined"
                onPress={() => handleDelete(item._id, item.subjectName)}
                loading={deletingId === item._id}
                textColor={Colors.danger}
              >
                Delete
              </Button>
            </Card.Content>
          </Card>
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.kicker}>Subjects</Text>
            <Text variant="headlineMedium" style={styles.title}>
              Manage academic subjects
            </Text>
            <Text style={styles.subtitle}>Add subjects for doubts and keep the academic catalog current.</Text>

            <Card style={styles.formCard}>
              <Card.Content style={styles.formContent}>
                <TextInput mode="outlined" label="Subject name" value={subjectName} onChangeText={setSubjectName} outlineStyle={styles.inputOutline} />
                <TextInput
                  mode="outlined"
                  label="Description"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  outlineStyle={styles.inputOutline}
                />
                <Button mode="contained" onPress={handleAdd} loading={saving}>
                  Add Subject
                </Button>
              </Card.Content>
            </Card>
          </View>
        }
        ListEmptyComponent={<Text style={styles.emptyState}>No subjects found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  listContent: { padding: 18, paddingBottom: 24 },
  header: { gap: 8, marginBottom: 14 },
  kicker: { color: Colors.primary, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.7 },
  title: { color: Colors.text, fontWeight: '900' },
  subtitle: { color: Colors.muted, lineHeight: 21, marginBottom: 8 },
  formCard: { borderRadius: 18, backgroundColor: Colors.surface, marginTop: 4 },
  formContent: { gap: 12 },
  inputOutline: { borderRadius: 16 },
  card: { borderRadius: 18, marginBottom: 12, backgroundColor: Colors.surface },
  cardContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { color: Colors.text, fontWeight: '900', fontSize: 16 },
  description: { color: Colors.muted, lineHeight: 20 },
  emptyState: { color: Colors.muted, marginTop: 18 },
});
