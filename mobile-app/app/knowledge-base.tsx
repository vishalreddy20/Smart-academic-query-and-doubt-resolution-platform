import { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { Search } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import LoadingSpinner from '@/components/LoadingSpinner';
import DoubtCard from '@/components/DoubtCard';
import { getKnowledgeBaseRequest } from '@/services/api';
import type { Doubt } from '@/types';

export default function KnowledgeBaseScreen() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(timer);
  }, [query]);

  const load = async (search = '') => {
    try {
      setLoading(true);
      setResults(await getKnowledgeBaseRequest(search));
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Unable to load knowledge base');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(debouncedQuery);
  }, [debouncedQuery]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      setResults(await getKnowledgeBaseRequest(debouncedQuery));
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Unable to refresh knowledge base');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Searching knowledge base" />;
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={results}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <DoubtCard doubt={item} showAnswer />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.kicker}>Knowledge base</Text>
            <Text variant="headlineMedium" style={styles.title}>
              Search resolved doubts
            </Text>
            <Text style={styles.subtitle}>Find already answered questions without logging in.</Text>

            <TextInput
              mode="outlined"
              label="Search by keyword"
              value={query}
              onChangeText={setQuery}
              left={<TextInput.Icon icon={() => <Search size={18} color={Colors.primary} />} />}
              outlineStyle={styles.inputOutline}
            />
          </View>
        }
        ListEmptyComponent={<Text style={styles.emptyState}>No resolved doubts found for this search.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  listContent: { padding: 18, paddingBottom: 24 },
  header: { gap: 10, marginBottom: 14 },
  kicker: { color: Colors.primary, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.7 },
  title: { color: Colors.text, fontWeight: '900' },
  subtitle: { color: Colors.muted, lineHeight: 21, marginBottom: 6 },
  inputOutline: { borderRadius: 16 },
  emptyState: { color: Colors.muted, marginTop: 18 },
});
