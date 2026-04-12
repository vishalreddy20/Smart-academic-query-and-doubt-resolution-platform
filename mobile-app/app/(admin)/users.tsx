import { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { Trash2 } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import LoadingSpinner from '@/components/LoadingSpinner';
import StatusBadge from '@/components/StatusBadge';
import { deleteUserRequest, getUsersRequest } from '@/services/api';
import type { User } from '@/types';

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setUsers(await getUsersRequest());
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Unable to load users');
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
      setUsers(await getUsersRequest());
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Unable to refresh users');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete user', `Are you sure you want to delete ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeletingId(id);
            await deleteUserRequest(id);
            setUsers((current) => current.filter((user) => user.id !== id));
          } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message || 'Unable to delete user');
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  if (loading) {
    return <LoadingSpinner label="Loading users" />;
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <View style={{ flex: 1, gap: 8 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.email}>{item.email}</Text>
                <StatusBadge role={item.role} />
              </View>
              <Button
                icon={() => <Trash2 size={16} color={Colors.danger} />}
                mode="outlined"
                onPress={() => handleDelete(item.id, item.name)}
                loading={deletingId === item.id}
                textColor={Colors.danger}
              >
                Delete
              </Button>
            </Card.Content>
          </Card>
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.kicker}>Users</Text>
            <Text variant="headlineMedium" style={styles.title}>
              All registered users
            </Text>
            <Text style={styles.subtitle}>Review account access and remove users if needed.</Text>
          </View>
        }
        ListEmptyComponent={<Text style={styles.emptyState}>No users found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  listContent: { padding: 18, paddingBottom: 24 },
  header: { gap: 8, marginBottom: 14 },
  kicker: { color: Colors.primary, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.7 },
  title: { color: Colors.text, fontWeight: '900' },
  subtitle: { color: Colors.muted, lineHeight: 21 },
  card: { borderRadius: 18, marginBottom: 12, backgroundColor: Colors.surface },
  cardContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { color: Colors.text, fontWeight: '900', fontSize: 16 },
  email: { color: Colors.muted },
  emptyState: { color: Colors.muted, marginTop: 18 },
});
