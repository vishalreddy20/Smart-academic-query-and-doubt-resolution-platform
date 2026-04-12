import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { LogOut, ListChecks } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';
import LoadingSpinner from '@/components/LoadingSpinner';
import DoubtCard from '@/components/DoubtCard';
import { getOpenDoubtsRequest } from '@/services/api';
import type { Doubt } from '@/types';

export default function FacultyDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setDoubts(await getOpenDoubtsRequest());
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Unable to load open doubts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const preview = useMemo(() => doubts.slice(0, 3), [doubts]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      setDoubts(await getOpenDoubtsRequest());
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Unable to refresh open doubts');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading faculty dashboard" />;
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={preview}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <DoubtCard doubt={item} onPress={() => router.push('/(faculty)/open-doubts')} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.topRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.kicker}>Faculty workspace</Text>
                <Text variant="headlineMedium" style={styles.title}>
                  Welcome, {user?.name || 'Faculty'}
                </Text>
                <Text style={styles.subtitle}>Claim open doubts and submit answers directly from the queue.</Text>
              </View>
              <Button icon={() => <LogOut size={16} color={Colors.danger} />} mode="outlined" onPress={async () => { await logout(); router.replace('/(auth)/login'); }}>
                Logout
              </Button>
            </View>

            <View style={styles.statsRow}>
              <Card style={styles.statCard}>
                <Card.Content>
                  <Text style={styles.statLabel}>Open doubts</Text>
                  <Text style={styles.statValue}>{doubts.length}</Text>
                </Card.Content>
              </Card>
              <Card style={styles.statCard}>
                <Card.Content>
                  <Text style={styles.statLabel}>Preview</Text>
                  <Text style={styles.statValue}>{preview.length}</Text>
                </Card.Content>
              </Card>
            </View>

            <View style={styles.sectionHeader}>
              <ListChecks size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Open doubts preview</Text>
            </View>

            <Button mode="contained" onPress={() => router.push('/(faculty)/open-doubts')}>
              Open full queue
            </Button>
          </View>
        }
        ListEmptyComponent={<Text style={styles.emptyState}>No open doubts right now.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  listContent: { padding: 18, paddingBottom: 28 },
  header: { gap: 16 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  kicker: {
    color: Colors.primary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 6,
  },
  title: { color: Colors.text, fontWeight: '900' },
  subtitle: { color: Colors.muted, lineHeight: 21, marginTop: 6 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, borderRadius: 18, backgroundColor: Colors.surface },
  statLabel: { color: Colors.muted, fontSize: 13, marginBottom: 8 },
  statValue: { color: Colors.text, fontSize: 26, fontWeight: '900' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { color: Colors.text, fontWeight: '900', fontSize: 18 },
  emptyState: { color: Colors.muted, marginTop: 18 },
});
