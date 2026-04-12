import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { doubtsApi } from '../../services/api';
import { Doubt } from '../../types';
import DoubtCard from '../../components/DoubtCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import Colors from '../../constants/Colors';

const FILTERS = ['All', 'open', 'claimed', 'submitted', 'resolved'] as const;
const FILTER_LABELS: Record<string, string> = {
  All: 'All',
  open: 'Open',
  claimed: 'Claimed',
  submitted: 'Submitted',
  resolved: 'Resolved',
};

export default function MyDoubtsScreen() {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

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

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredDoubts =
    activeFilter === 'All'
      ? doubts
      : doubts.filter((d) => d.status === activeFilter);

  if (isLoading) {
    return <LoadingSpinner message="Loading your doubts..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, activeFilter === f && styles.filterTabActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === f && styles.filterTabTextActive,
              ]}
            >
              {FILTER_LABELS[f]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredDoubts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <DoubtCard
            doubt={item}
            showAnswer={expandedIds.has(item._id)}
            onPress={() => {
              if (item.status === 'resolved' || item.status === 'submitted') {
                toggleExpand(item._id);
              }
            }}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.heading}>My Doubts</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{filteredDoubts.length}</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>No doubts found</Text>
            <Text style={styles.emptyText}>
              {activeFilter === 'All'
                ? 'No doubts posted yet'
                : `No ${FILTER_LABELS[activeFilter].toLowerCase()} doubts`}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.background,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  filterTabTextActive: {
    color: Colors.white,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  countBadge: {
    backgroundColor: Colors.infoLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
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
});
