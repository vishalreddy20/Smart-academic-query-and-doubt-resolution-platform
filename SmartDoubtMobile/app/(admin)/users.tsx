import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/api';
import { User } from '../../types';
import RoleBadge from '../../components/RoleBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Colors from '../../constants/Colors';

export default function UsersScreen() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await adminApi.getAllUsers();
      setUsers(response.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchUsers();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleDelete = (userId: string, userName: string) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete "${userName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminApi.deleteUser(userId);
              setUsers((prev) => prev.filter((u) => u._id !== userId));
              Alert.alert('Success', 'User deleted successfully');
            } catch (err: any) {
              const msg = err.response?.data?.message || 'Failed to delete user';
              Alert.alert('Error', msg);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading users..." />;
  }

  const getInitialColor = (role: string) => {
    return Colors.role[role as keyof typeof Colors.role] || Colors.primary;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.heading}>Manage Users</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{users.length}</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const isSelf =
            currentUser?._id === item._id || currentUser?.id === item._id;
          const initial = item.name ? item.name.charAt(0).toUpperCase() : '?';

          return (
            <View style={styles.userRow}>
              {/* Avatar */}
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: `${getInitialColor(item.role)}20` },
                ]}
              >
                <Text style={[styles.avatarText, { color: getInitialColor(item.role) }]}>
                  {initial}
                </Text>
              </View>

              {/* Info */}
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
                <RoleBadge role={item.role as 'student' | 'tutor' | 'admin'} />
              </View>

              {/* Delete */}
              {!isSelf && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item._id, item.name)}
                >
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>No users found</Text>
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
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
    gap: 3,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  userEmail: {
    fontSize: 12,
    color: Colors.text.muted,
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    fontSize: 18,
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
  },
});
