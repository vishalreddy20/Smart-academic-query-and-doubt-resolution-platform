import { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Colors } from '@/constants/Colors';
import LoadingSpinner from '@/components/LoadingSpinner';
import DoubtCard from '@/components/DoubtCard';
import { getMyDoubtsRequest } from '@/services/api';
import type { Doubt } from '@/types';

export default function MyDoubtsScreen() {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const load = async () => {
    try {
      setLoading(true);
      setDoubts(await getMyDoubtsRequest());
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Unable to load your doubts');
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
      setDoubts(await getMyDoubtsRequest());
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Unable to refresh your doubts');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading your doubts" />;
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={doubts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <DoubtCard
            doubt={item}
            expanded={Boolean(expanded[item._id])}
            onToggleExpanded={() => setExpanded((current) => ({ ...current, [item._id]: !current[item._id] }))}
            showAnswer={Boolean(expanded[item._id]) && item.status === 'RESOLVED'}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.kicker}>My doubts</Text>
            <Text variant="headlineMedium" style={styles.title}>
              Everything you have posted
            </Text>
            <Text style={styles.subtitle}>Tap a resolved doubt to reveal the faculty answer.</Text>
          </View>
        }
        ListEmptyComponent={<Text style={styles.emptyState}>No doubts yet. Post one from the dashboard.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: 18,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 14,
    gap: 8,
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
  emptyState: {
    color: Colors.muted,
    marginTop: 18,
  },
});
