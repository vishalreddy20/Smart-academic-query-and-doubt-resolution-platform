import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';
import StatusBadge from './StatusBadge';
import { Doubt } from '../types';

interface DoubtCardProps {
  doubt: Doubt;
  onPress?: () => void;
  showAnswer?: boolean;
}

const DoubtCard: React.FC<DoubtCardProps> = ({ doubt, onPress, showAnswer = false }) => {
  const subjectName =
    typeof doubt.subjectId === 'object' && doubt.subjectId?.name
      ? doubt.subjectId.name
      : 'Unknown Subject';

  const studentName =
    typeof doubt.studentId === 'object' && doubt.studentId?.name
      ? doubt.studentId.name
      : '';

  const tutorName =
    doubt.tutorId && typeof doubt.tutorId === 'object' && doubt.tutorId?.name
      ? doubt.tutorId.name
      : '';

  const formattedDate = new Date(doubt.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      {/* Top row: subject pill + status badge */}
      <View style={styles.topRow}>
        <View style={styles.subjectPill}>
          <Text style={styles.subjectText}>{subjectName}</Text>
        </View>
        <StatusBadge status={doubt.status} />
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={2}>
        {doubt.title}
      </Text>

      {/* Description */}
      <Text style={styles.description} numberOfLines={3}>
        {doubt.description}
      </Text>

      {/* Meta row */}
      <View style={styles.metaRow}>
        {studentName ? (
          <Text style={styles.metaText}>By {studentName}</Text>
        ) : null}
        {tutorName ? (
          <Text style={styles.metaText}>Tutor: {tutorName}</Text>
        ) : null}
        <Text style={styles.dateText}>{formattedDate}</Text>
      </View>

      {/* Answer section */}
      {showAnswer && doubt.solution && (doubt.status === 'resolved' || doubt.status === 'submitted') && (
        <View style={styles.answerBox}>
          <Text style={styles.answerLabel}>Answer:</Text>
          <Text style={styles.answerText}>{doubt.solution}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  topRow: {
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
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 6,
    lineHeight: 22,
  },
  description: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 19,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
  },
  metaText: {
    fontSize: 12,
    color: Colors.text.muted,
  },
  dateText: {
    fontSize: 12,
    color: Colors.text.muted,
    marginLeft: 'auto',
  },
  answerBox: {
    marginTop: 12,
    backgroundColor: Colors.successLight,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.success,
  },
  answerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.success,
    marginBottom: 4,
  },
  answerText: {
    fontSize: 13,
    color: Colors.text.primary,
    lineHeight: 19,
  },
});

export default DoubtCard;
