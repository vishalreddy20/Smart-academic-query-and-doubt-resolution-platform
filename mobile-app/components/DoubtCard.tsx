import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card, Divider, Text, TextInput, Button } from 'react-native-paper';
import { ChevronDown, ChevronUp, GraduationCap, MessageSquareText, UserRound, CalendarDays } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import StatusBadge from '@/components/StatusBadge';
import type { Doubt } from '@/types';

type Props = {
  doubt: Doubt;
  onPress?: () => void;
  onClaim?: () => void;
  claimLoading?: boolean;
  answerComposer?: boolean;
  answerValue?: string;
  onChangeAnswer?: (value: string) => void;
  onSubmitAnswer?: () => void;
  answerLoading?: boolean;
  expanded?: boolean;
  onToggleExpanded?: () => void;
  showAnswer?: boolean;
  showClaimButton?: boolean;
  studentSubtitle?: string;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));

export default function DoubtCard({
  doubt,
  onPress,
  onClaim,
  claimLoading,
  answerComposer,
  answerValue,
  onChangeAnswer,
  onSubmitAnswer,
  answerLoading,
  expanded,
  onToggleExpanded,
  showAnswer,
  showClaimButton = false,
  studentSubtitle,
}: Props) {
  const isResolved = doubt.status === 'RESOLVED';
  const canExpand = Boolean(onToggleExpanded) || isResolved;
  const preview = useMemo(() => {
    if (doubt.description.length <= 120) {
      return doubt.description;
    }

    return `${doubt.description.slice(0, 120).trim()}...`;
  }, [doubt.description]);

  return (
    <Card style={styles.card} mode="elevated">
      <Pressable onPress={onPress || onToggleExpanded} disabled={!onPress && !onToggleExpanded}>
        <Card.Content style={styles.content}>
          <View style={styles.rowBetween}>
            <StatusBadge status={doubt.status} />
            <View style={styles.metaRow}>
              <CalendarDays size={14} color={Colors.muted} />
              <Text variant="labelSmall" style={styles.metaText}>
                {formatDate(doubt.createdAt)}
              </Text>
            </View>
          </View>

          <View style={styles.subjectRow}>
            <GraduationCap size={16} color={Colors.primary} />
            <Text style={styles.subjectText}>{doubt.subjectId.subjectName}</Text>
          </View>

          <Text variant="titleMedium" style={styles.title}>
            {doubt.title}
          </Text>

          <View style={styles.metaRow}>
            <UserRound size={14} color={Colors.muted} />
            <Text style={styles.studentText}>
              {studentSubtitle || doubt.studentId.name}
            </Text>
          </View>

          <Text variant="bodyMedium" style={styles.description}>
            {preview}
          </Text>

          {canExpand ? (
            <View style={styles.expandHint}>
              <Text style={styles.expandText}>{expanded ? 'Hide answer' : 'View answer'}</Text>
              {expanded ? <ChevronUp size={16} color={Colors.primary} /> : <ChevronDown size={16} color={Colors.primary} />}
            </View>
          ) : null}

          {(expanded || showAnswer) && isResolved ? (
            <View style={styles.answerBox}>
              <View style={styles.answerHeader}>
                <MessageSquareText size={16} color={Colors.success} />
                <Text style={styles.answerTitle}>Faculty answer</Text>
              </View>
              <Text style={styles.answerText}>{doubt.answer || 'No answer available yet.'}</Text>
            </View>
          ) : null}

          {showClaimButton || answerComposer ? <Divider style={styles.divider} /> : null}

          {showClaimButton ? (
            <Button mode="contained" onPress={onClaim} loading={claimLoading} style={styles.actionButton}>
              Claim
            </Button>
          ) : null}

          {answerComposer ? (
            <View style={styles.answerComposer}>
              <TextInput
                mode="outlined"
                label="Submit answer"
                multiline
                numberOfLines={4}
                value={answerValue}
                onChangeText={onChangeAnswer}
                style={styles.answerInput}
                outlineStyle={styles.answerOutline}
              />
              <Button mode="contained" onPress={onSubmitAnswer} loading={answerLoading}>
                Submit Answer
              </Button>
            </View>
          ) : null}
        </Card.Content>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
    borderRadius: 22,
    backgroundColor: Colors.surface,
  },
  content: {
    gap: 8,
    paddingTop: 18,
    paddingBottom: 18,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: Colors.muted,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subjectText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  title: {
    color: Colors.text,
    fontWeight: '800',
  },
  studentText: {
    color: Colors.muted,
    fontSize: 13,
  },
  description: {
    color: Colors.text,
    lineHeight: 20,
  },
  expandHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  expandText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  answerBox: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  answerTitle: {
    color: Colors.success,
    fontWeight: '800',
  },
  answerText: {
    color: Colors.text,
    lineHeight: 20,
  },
  divider: {
    marginTop: 8,
  },
  actionButton: {
    marginTop: 8,
  },
  answerComposer: {
    gap: 10,
    marginTop: 10,
  },
  answerInput: {
    backgroundColor: Colors.surface,
  },
  answerOutline: {
    borderRadius: 14,
  },
});
