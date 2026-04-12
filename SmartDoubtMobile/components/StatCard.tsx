import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';

interface StatCardProps {
  label: string;
  value: number;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color }) => {
  return (
    <View style={[styles.card, color ? { borderLeftWidth: 3, borderLeftColor: color } : null]}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  value: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    color: Colors.text.muted,
    fontWeight: '500',
  },
});

export default StatCard;
