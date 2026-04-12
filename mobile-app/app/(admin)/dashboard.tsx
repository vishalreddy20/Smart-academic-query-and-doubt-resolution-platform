import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { LogOut, UsersRound, BookOpenText } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getStatsRequest } from '@/services/api';
import type { StatsSummary } from '@/types';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setStats(await getStatsRequest());
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Unable to load admin stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const items = useMemo(() => {
    if (!stats) {
      return [];
    }

    return [
      { label: 'Total Users', value: stats.totalUsers },
      { label: 'Total Doubts', value: stats.totalDoubts },
      { label: 'Open', value: stats.open },
      { label: 'Claimed', value: stats.claimed },
      { label: 'Resolved', value: stats.resolved },
      { label: 'Subjects', value: stats.subjects },
    ];
  }, [stats]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      setStats(await getStatsRequest());
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Unable to refresh admin stats');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading admin dashboard" />;
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.label}
        numColumns={2}
        renderItem={({ item }) => (
          <Card style={styles.statCard}>
            <Card.Content>
              <Text style={styles.statLabel}>{item.label}</Text>
              <Text style={styles.statValue}>{item.value}</Text>
            </Card.Content>
          </Card>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrap}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.topRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.kicker}>Admin console</Text>
                <Text variant="headlineMedium" style={styles.title}>
                  Platform overview
                </Text>
                <Text style={styles.subtitle}>Review users, manage subjects, and keep the platform healthy.</Text>
              </View>
              <Button icon={() => <LogOut size={16} color={Colors.danger} />} mode="outlined" onPress={async () => { await logout(); router.replace('/(auth)/login'); }}>
                Logout
              </Button>
            </View>

            <View style={styles.actions}>
              <Button icon={() => <UsersRound size={16} color={Colors.surface} />} mode="contained" onPress={() => router.push('/(admin)/users')}>
                Users
              </Button>
              <Button icon={() => <BookOpenText size={16} color={Colors.primary} />} mode="outlined" onPress={() => router.push('/(admin)/subjects')}>
                Subjects
              </Button>
            </View>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  listContent: { padding: 18, paddingBottom: 24 },
  header: { gap: 16, marginBottom: 14 },
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
  actions: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, marginBottom: 10, borderRadius: 18, backgroundColor: Colors.surface },
  columnWrap: { gap: 10 },
  statLabel: { color: Colors.muted, fontSize: 13, marginBottom: 8 },
  statValue: { color: Colors.text, fontSize: 26, fontWeight: '900' },
});
