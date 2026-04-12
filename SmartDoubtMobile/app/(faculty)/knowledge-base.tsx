import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doubtsApi } from '../../services/api';
import { Doubt } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import Colors from '../../constants/Colors';

export default function FacultyKnowledgeBase() {
  const [query, setQuery] = useState('');
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchKnowledge = useCallback(async (searchQuery?: string) => {
    setIsLoading(true);
    try {
      const response = await doubtsApi.searchKnowledgeBase(searchQuery || undefined);
      setDoubts(response.doubts || []);
    } catch (err) {
      console.error('Failed to fetch knowledge base:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKnowledge();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchKnowledge(query.trim() || undefined);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search resolved doubts..."
          placeholderTextColor={Colors.text.muted}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
      </View>

      {isLoading ? (
        <LoadingSpinner message="Searching..." />
      ) : (
        <FlatList
          data={doubts}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const subjectName =
              typeof item.subjectId === 'object' && item.subjectId?.name
                ? item.subjectId.name
                : 'Unknown';
            const resolvedDate = item.resolvedAt
              ? new Date(item.resolvedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : '';

            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.subjectPill}>
                    <Text style={styles.subjectText}>{subjectName}</Text>
                  </View>
                  {resolvedDate ? (
                    <Text style={styles.dateText}>{resolvedDate}</Text>
                  ) : null}
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={styles.qaSection}>
                  <Text style={styles.qaLabel}>Q:</Text>
                  <Text style={styles.qaText}>{item.description}</Text>
                </View>
                {item.solution ? (
                  <View style={styles.answerBox}>
                    <Text style={styles.qaLabel}>A:</Text>
                    <Text style={styles.answerText}>{item.solution}</Text>
                  </View>
                ) : null}
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📚</Text>
              <Text style={styles.emptyTitle}>
                {query.trim() ? `No results for "${query}"` : 'Knowledge base is empty'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text.primary,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 1,
  },
  cardHeader: {
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
  dateText: {
    fontSize: 11,
    color: Colors.text.muted,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 10,
  },
  qaSection: {
    marginBottom: 8,
  },
  qaLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  qaText: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 19,
  },
  answerBox: {
    backgroundColor: Colors.successLight,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.success,
  },
  answerText: {
    fontSize: 13,
    color: Colors.text.primary,
    lineHeight: 19,
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
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
