import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { doubtsApi } from '../../services/api';
import { Doubt } from '../../types';
import DoubtCard from '../../components/DoubtCard';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import Colors from '../../constants/Colors';

export default function StudentDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDoubts = async () => {
    try {
      const response = await doubtsApi.getMyDoubts();
      setDoubts(response.doubts || []);
    } catch (err) {
      console.error('Failed to fetch doubts:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchDoubts();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDoubts();
  };

  const openCount = doubts.filter((d) => d.status === 'open').length;
  const resolvedCount = doubts.filter(
    (d) => d.status === 'resolved' || d.status === 'submitted'
  ).length;

  if (isLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  const recentDoubts = doubts.slice(0, 5);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={recentDoubts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <DoubtCard doubt={item} showAnswer={item.status === 'resolved' || item.status === 'submitted'} />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {/* Welcome */}
            <Text style={styles.welcome}>Welcome, {user?.name || 'Student'}!</Text>
            <Text style={styles.subtitle}>Student Dashboard</Text>

            {/* Stats */}
            <View style={styles.statsRow}>
              <StatCard label="Total" value={doubts.length} color={Colors.primary} />
              <View style={styles.statGap} />
              <StatCard label="Open" value={openCount} color={Colors.status.open} />
              <View style={styles.statGap} />
              <StatCard label="Resolved" value={resolvedCount} color={Colors.status.resolved} />
            </View>

            {/* Section title */}
            <Text style={styles.sectionTitle}>Recent Doubts</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💡</Text>
            <Text style={styles.emptyTitle}>No doubts yet</Text>
            <Text style={styles.emptyText}>Post your first doubt to get started!</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(student)/post-doubt')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  welcome: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  statGap: {
    width: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.muted,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: {
    fontSize: 28,
    color: Colors.white,
    fontWeight: '300',
    marginTop: -2,
  },
});
