import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { FAB, Button, Card, Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LogOut, NotebookText } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';
import LoadingSpinner from '@/components/LoadingSpinner';
import DoubtCard from '@/components/DoubtCard';
import { getMyDoubtsRequest } from '@/services/api';
import type { Doubt } from '@/types';

export default function StudentDashboard() {
  const router = useRouter();
  const params = useLocalSearchParams<{ refreshedAt?: string }>();
  const { user, logout } = useAuth();
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadDoubts = async () => {
    try {
      setLoading(true);
      const items = await getMyDoubtsRequest();
      setDoubts(items);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Unable to load your doubts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDoubts();
  }, [params.refreshedAt]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      const items = await getMyDoubtsRequest();
      setDoubts(items);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Unable to refresh doubts');
    } finally {
      setRefreshing(false);
    }
  };

  const stats = useMemo(() => {
    const open = doubts.filter((doubt) => doubt.status === 'OPEN').length;
    const claimed = doubts.filter((doubt) => doubt.status === 'CLAIMED').length;
    const resolved = doubts.filter((doubt) => doubt.status === 'RESOLVED').length;

    return [
      { label: 'Total', value: doubts.length, color: Colors.primary },
      { label: 'Open', value: open, color: Colors.warning },
      { label: 'Claimed', value: claimed, color: Colors.accent },
      { label: 'Resolved', value: resolved, color: Colors.success },
    ];
  }, [doubts]);

  if (loading) {
    return <LoadingSpinner label="Loading your doubts" />;
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={doubts.slice(0, 5)}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <DoubtCard
            doubt={item}
            expanded={expandedId === item._id}
            onToggleExpanded={() => setExpandedId((current) => (current === item._id ? null : item._id))}
            showAnswer={item.status === 'RESOLVED' && expandedId === item._id}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <View style={styles.topRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.kicker}>Student dashboard</Text>
                <Text variant="headlineMedium" style={styles.title}>
                  Welcome, {user?.name || 'Student'}
                </Text>
                <Text style={styles.subtitle}>Track your doubts and see answers as they are resolved.</Text>
              </View>
              <Button icon={() => <LogOut size={16} color={Colors.danger} />} mode="outlined" onPress={async () => { await logout(); router.replace('/(auth)/login'); }}>
                Logout
              </Button>
            </View>

            <View style={styles.statsGrid}>
              {stats.map((item) => (
                <Card key={item.label} style={styles.statCard} mode="elevated">
                  <Card.Content>
                    <Text style={styles.statLabel}>{item.label}</Text>
                    <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
                  </Card.Content>
                </Card>
              ))}
            </View>

            <View style={styles.sectionHeader}>
              <NotebookText size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Recent doubts</Text>
            </View>

            {doubts.length === 0 ? <Text style={styles.emptyState}>No doubts yet. Post your first doubt to get started.</Text> : null}
          </View>
        }
        ListEmptyComponent={<View />}
      />

      <FAB icon="plus" label="Post Doubt" style={styles.fab} onPress={() => router.push('/(student)/post-doubt')} />
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
    paddingBottom: 120,
    gap: 14,
  },
  headerWrap: {
    gap: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  kicker: {
    color: Colors.primary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 6,
  },
  title: {
    color: Colors.text,
    fontWeight: '900',
  },
  subtitle: {
    color: Colors.muted,
    marginTop: 6,
    lineHeight: 21,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flexBasis: '48%',
    borderRadius: 18,
    backgroundColor: Colors.surface,
  },
  statLabel: {
    color: Colors.muted,
    fontSize: 13,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '900',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    color: Colors.text,
    fontWeight: '900',
    fontSize: 18,
  },
  emptyState: {
    color: Colors.muted,
    lineHeight: 21,
  },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 22,
    backgroundColor: Colors.primary,
  },
});
