import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';

interface StatusBadgeProps {
  status: 'open' | 'claimed' | 'in-progress' | 'submitted' | 'resolved' | 'disputed';
}

const statusLabels: Record<string, string> = {
  open: 'Open',
  claimed: 'Claimed',
  'in-progress': 'In Progress',
  submitted: 'Submitted',
  resolved: 'Resolved',
  disputed: 'Disputed',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const color = Colors.status[status] || Colors.text.muted;
  const label = statusLabels[status] || status;

  return (
    <View style={[styles.badge, { backgroundColor: `${color}18` }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

export default StatusBadge;
