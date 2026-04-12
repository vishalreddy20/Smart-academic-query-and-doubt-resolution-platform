import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { adminApi } from '../../services/api';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import Colors from '../../constants/Colors';

interface Stats {
  totalUsers: number;
  totalDoubts: number;
  openDoubts: number;
  resolvedDoubts: number;
  totalSubjects: number;
  totalStudents: number;
  totalTutors: number;
  approvedTutors: number;
  verifiedUsers: number;
  totalRevenue: number;
  premiumUsers: number;
}

export default function AdminDashboard() {
  const router = useRouter();

  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await adminApi.getStats();
      setStats(response.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchStats();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading admin stats..." />;
  }

  const claimedDoubts =
    (stats?.totalDoubts || 0) -
    (stats?.openDoubts || 0) -
    (stats?.resolvedDoubts || 0);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        <Text style={styles.heading}>Admin Dashboard</Text>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard label="Total Users" value={stats?.totalUsers || 0} color={Colors.primary} />
            <View style={styles.gap} />
            <StatCard label="Total Doubts" value={stats?.totalDoubts || 0} color="#8B5CF6" />
          </View>
          <View style={styles.statsRow}>
            <StatCard label="Open" value={stats?.openDoubts || 0} color={Colors.status.open} />
            <View style={styles.gap} />
            <StatCard label="Claimed" value={claimedDoubts > 0 ? claimedDoubts : 0} color={Colors.status.claimed} />
          </View>
          <View style={styles.statsRow}>
            <StatCard label="Resolved" value={stats?.resolvedDoubts || 0} color={Colors.status.resolved} />
            <View style={styles.gap} />
            <StatCard label="Subjects" value={stats?.totalSubjects || 0} color={Colors.text.muted} />
          </View>
        </View>

        {/* Navigation buttons */}
        <Text style={styles.sectionTitle}>Manage</Text>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/(admin)/users')}
          activeOpacity={0.7}
        >
          <Text style={styles.navIcon}>👥</Text>
          <View style={styles.navTextContainer}>
            <Text style={styles.navTitle}>Manage Users</Text>
            <Text style={styles.navSubtitle}>{stats?.totalUsers || 0} registered users</Text>
          </View>
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/(admin)/subjects')}
          activeOpacity={0.7}
        >
          <Text style={styles.navIcon}>📚</Text>
          <View style={styles.navTextContainer}>
            <Text style={styles.navTitle}>Manage Subjects</Text>
            <Text style={styles.navSubtitle}>{stats?.totalSubjects || 0} active subjects</Text>
          </View>
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: 20,
  },
  statsGrid: {
    gap: 10,
    marginBottom: 28,
  },
  statsRow: {
    flexDirection: 'row',
  },
  gap: {
    width: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 1,
  },
  navIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  navTextContainer: {
    flex: 1,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  navSubtitle: {
    fontSize: 12,
    color: Colors.text.muted,
    marginTop: 2,
  },
  navArrow: {
    fontSize: 28,
    color: Colors.text.muted,
    fontWeight: '300',
  },
});
