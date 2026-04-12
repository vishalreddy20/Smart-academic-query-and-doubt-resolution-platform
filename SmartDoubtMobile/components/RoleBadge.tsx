import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';

interface RoleBadgeProps {
  role: 'student' | 'tutor' | 'admin';
}

const roleLabels: Record<string, string> = {
  student: 'Student',
  tutor: 'Tutor',
  admin: 'Admin',
};

const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const color = Colors.role[role] || Colors.text.muted;
  const label = roleLabels[role] || role;

  return (
    <View style={[styles.badge, { backgroundColor: `${color}18` }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});

export default RoleBadge;
