import React from 'react';
import { Tabs } from 'expo-router';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/Colors';

export default function FacultyLayout() {
  const { logout } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text.muted,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.border,
          paddingBottom: 4,
          height: 56,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: Colors.card,
          shadowColor: Colors.shadow,
        },
        headerTitleStyle: {
          fontWeight: '700',
          color: Colors.text.primary,
        },
        headerRight: () => (
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Open Doubts',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📥</Text>,
        }}
      />
      <Tabs.Screen
        name="knowledge-base"
        options={{
          title: 'Knowledge Base',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🔍</Text>,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logoutBtn: {
    marginRight: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.errorLight,
  },
  logoutText: {
    color: Colors.error,
    fontWeight: '600',
    fontSize: 13,
  },
});
