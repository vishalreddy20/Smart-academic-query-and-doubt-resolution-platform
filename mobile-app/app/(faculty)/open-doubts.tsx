import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Colors } from '@/constants/Colors';
import LoadingSpinner from '@/components/LoadingSpinner';
import DoubtCard from '@/components/DoubtCard';
import { answerDoubtRequest, claimDoubtRequest, getOpenDoubtsRequest } from '@/services/api';
import type { Doubt } from '@/types';

export default function OpenDoubtsScreen() {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});

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

  const handleClaim = async (id: string) => {
    try {
      setClaimingId(id);
      const claimed = await claimDoubtRequest(id);
      setDoubts((current) => current.map((item) => (item._id === id ? { ...item, status: claimed.status } : item)));
      Alert.alert('Success', 'Doubt claimed. You can submit the answer below.');
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Unable to claim doubt');
    } finally {
      setClaimingId(null);
    }
  };

  const handleAnswer = async (id: string) => {
    const answer = answers[id]?.trim();

    if (!answer) {
      Alert.alert('Validation', 'Please enter an answer before submitting.');
      return;
    }

    try {
      setAnsweringId(id);
      await answerDoubtRequest(id, answer);
      setDoubts((current) => current.filter((item) => item._id !== id));
      setAnswers((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      Alert.alert('Success', 'Answer submitted successfully.');
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Unable to submit answer');
    } finally {
      setAnsweringId(null);
    }
  };

  const activeComposerId = useMemo(() => {
    if (claimingId) {
      return claimingId;
    }

    if (answeringId) {
      return answeringId;
    }

    return null;
  }, [answeringId, claimingId]);

  if (loading) {
    return <LoadingSpinner label="Loading queue" />;
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={doubts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <DoubtCard
            doubt={item}
            showClaimButton={item.status === 'OPEN'}
            claimLoading={claimingId === item._id}
            onClaim={() => handleClaim(item._id)}
            answerComposer={item.status === 'CLAIMED'}
            answerValue={answers[item._id] || ''}
            onChangeAnswer={(value) => setAnswers((current) => ({ ...current, [item._id]: value }))}
            onSubmitAnswer={() => handleAnswer(item._id)}
            answerLoading={answeringId === item._id}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.kicker}>Open doubts</Text>
            <Text variant="headlineMedium" style={styles.title}>
              Queue for answering
            </Text>
            <Text style={styles.subtitle}>Claim a doubt first, then submit your answer inline on the same card.</Text>
            {activeComposerId ? <Text style={styles.helper}>Composer active for one card at a time.</Text> : null}
          </View>
        }
        ListEmptyComponent={<Text style={styles.emptyState}>No open doubts available right now.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  listContent: { padding: 18, paddingBottom: 24 },
  header: { gap: 8, marginBottom: 14 },
  kicker: {
    color: Colors.primary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  title: { color: Colors.text, fontWeight: '900' },
  subtitle: { color: Colors.muted, lineHeight: 21 },
  helper: { color: Colors.info, fontWeight: '700' },
  emptyState: { color: Colors.muted, marginTop: 18 },
});
