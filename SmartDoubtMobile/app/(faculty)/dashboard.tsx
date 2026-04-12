import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { doubtsApi } from '../../services/api';
import { Doubt } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Colors from '../../constants/Colors';

interface LocalDoubtState {
  isClaiming: boolean;
  isClaimed: boolean;
  answerText: string;
  isSubmitting: boolean;
}

export default function FacultyDashboard() {
  const { user } = useAuth();

  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [localState, setLocalState] = useState<Record<string, LocalDoubtState>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDoubts = async () => {
    try {
      const response = await doubtsApi.getOpenDoubts();
      setDoubts(response.doubts || []);
    } catch (err) {
      console.error('Failed to fetch open doubts:', err);
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
    setLocalState({});
    fetchDoubts();
  };

  const getLocal = (id: string): LocalDoubtState =>
    localState[id] || { isClaiming: false, isClaimed: false, answerText: '', isSubmitting: false };

  const updateLocal = (id: string, update: Partial<LocalDoubtState>) => {
    setLocalState((prev) => ({
      ...prev,
      [id]: { ...getLocal(id), ...update },
    }));
  };

  const handleClaim = async (id: string) => {
    updateLocal(id, { isClaiming: true });
    try {
      await doubtsApi.claimDoubt(id);
      updateLocal(id, { isClaiming: false, isClaimed: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to claim doubt';
      Alert.alert('Error', msg);
      updateLocal(id, { isClaiming: false });
    }
  };

  const handleSubmitAnswer = async (id: string) => {
    const local = getLocal(id);
    if (!local.answerText.trim()) {
      Alert.alert('Error', 'Please enter your answer');
      return;
    }

    updateLocal(id, { isSubmitting: true });
    try {
      await doubtsApi.answerDoubt(id, local.answerText.trim());
      Alert.alert('Success', 'Answer submitted successfully!');
      // Remove doubt from list
      setDoubts((prev) => prev.filter((d) => d._id !== id));
      setLocalState((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit answer';
      Alert.alert('Error', msg);
      updateLocal(id, { isSubmitting: false });
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading open doubts..." />;
  }

  const renderDoubtItem = ({ item }: { item: Doubt }) => {
    const local = getLocal(item._id);
    const subjectName =
      typeof item.subjectId === 'object' && item.subjectId?.name
        ? item.subjectId.name
        : 'Unknown';
    const studentName =
      typeof item.studentId === 'object' && item.studentId?.name
        ? item.studentId.name
        : '';
    const formattedDate = new Date(item.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.cardTopRow}>
          <View style={styles.subjectPill}>
            <Text style={styles.subjectText}>{subjectName}</Text>
          </View>
          <StatusBadge status={local.isClaimed ? 'claimed' : item.status} />
        </View>

        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={3}>
          {item.description}
        </Text>

        <View style={styles.cardMeta}>
          {studentName ? <Text style={styles.metaText}>By {studentName}</Text> : null}
          <Text style={styles.metaDate}>{formattedDate}</Text>
        </View>

        {/* Action area */}
        {!local.isClaimed ? (
          <TouchableOpacity
            style={[styles.claimButton, local.isClaiming && styles.claimButtonDisabled]}
            onPress={() => handleClaim(item._id)}
            disabled={local.isClaiming}
            activeOpacity={0.8}
          >
            {local.isClaiming ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.claimButtonText}>Claim This Doubt</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.answerSection}>
            <Text style={styles.answerLabel}>Your Answer:</Text>
            <TextInput
              style={styles.answerInput}
              placeholder="Type your answer here..."
              placeholderTextColor={Colors.text.muted}
              value={local.answerText}
              onChangeText={(text) => updateLocal(item._id, { answerText: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!local.isSubmitting}
            />
            <TouchableOpacity
              style={[styles.submitButton, local.isSubmitting && styles.submitButtonDisabled]}
              onPress={() => handleSubmitAnswer(item._id)}
              disabled={local.isSubmitting}
              activeOpacity={0.8}
            >
              {local.isSubmitting ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Answer</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={doubts}
        keyExtractor={(item) => item._id}
        renderItem={renderDoubtItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <Text style={styles.heading}>Faculty Dashboard</Text>
            <Text style={styles.subtext}>Welcome, {user?.name || 'Tutor'}</Text>
            <View style={styles.statsBar}>
              <Text style={styles.statsText}>{doubts.length} open doubt{doubts.length !== 1 ? 's' : ''}</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyTitle}>No open doubts right now</Text>
            <Text style={styles.emptyText}>Check back later!</Text>
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
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  subtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
    marginBottom: 12,
  },
  statsBar: {
    backgroundColor: Colors.infoLight,
    borderRadius: 8,
    padding: 10,
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  subjectPill: {
    backgroundColor: Colors.infoLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  subjectText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 19,
    marginBottom: 10,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
    color: Colors.text.muted,
  },
  metaDate: {
    fontSize: 12,
    color: Colors.text.muted,
  },
  claimButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
  },
  claimButtonDisabled: {
    opacity: 0.7,
  },
  claimButtonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  answerSection: {
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 12,
  },
  answerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  answerInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text.primary,
    backgroundColor: Colors.background,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: Colors.success,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
    height: 44,
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
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
