import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { adminApi } from '../../services/api';
import { Subject } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import Colors from '../../constants/Colors';

export default function SubjectsScreen() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Add form state
  const [newName, setNewName] = useState('');
  const [newBranch, setNewBranch] = useState('CSE');
  const [newDescription, setNewDescription] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [nameError, setNameError] = useState('');

  const fetchSubjects = async () => {
    try {
      const response = await adminApi.getAllSubjects();
      setSubjects(response.subjects || []);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchSubjects();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchSubjects();
  };

  const handleAddSubject = async () => {
    setNameError('');
    if (!newName.trim()) {
      setNameError('Subject name is required');
      return;
    }

    setIsAdding(true);
    try {
      await adminApi.createSubject(newName.trim(), newBranch.trim(), newDescription.trim() || undefined);
      Alert.alert('Success', 'Subject created!');
      setNewName('');
      setNewDescription('');
      fetchSubjects();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create subject';
      Alert.alert('Error', msg);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Subject',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminApi.deleteSubject(id);
              setSubjects((prev) => prev.filter((s) => s._id !== id));
              Alert.alert('Success', 'Subject deleted');
            } catch (err: any) {
              const msg = err.response?.data?.message || 'Failed to delete subject';
              Alert.alert('Error', msg);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading subjects..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={subjects}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <Text style={styles.heading}>Manage Subjects</Text>

            {/* Add form */}
            <View style={styles.addForm}>
              <Text style={styles.formTitle}>Add New Subject</Text>

              <TextInput
                style={[styles.input, nameError && styles.inputError]}
                placeholder="Subject Name *"
                placeholderTextColor={Colors.text.muted}
                value={newName}
                onChangeText={setNewName}
                editable={!isAdding}
              />
              {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

              <TextInput
                style={styles.input}
                placeholder="Branch (default: CSE)"
                placeholderTextColor={Colors.text.muted}
                value={newBranch}
                onChangeText={setNewBranch}
                editable={!isAdding}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description (optional)"
                placeholderTextColor={Colors.text.muted}
                value={newDescription}
                onChangeText={setNewDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!isAdding}
              />

              <TouchableOpacity
                style={[styles.addButton, isAdding && styles.addButtonDisabled]}
                onPress={handleAddSubject}
                disabled={isAdding}
                activeOpacity={0.8}
              >
                {isAdding ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.addButtonText}>Add Subject</Text>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.listTitle}>
              Existing Subjects ({subjects.length})
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.subjectRow}>
            <View style={styles.subjectInfo}>
              <Text style={styles.subjectName}>{item.name}</Text>
              {item.description ? (
                <Text style={styles.subjectDesc} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
              {item.branch ? (
                <Text style={styles.branchText}>Branch: {item.branch}</Text>
              ) : null}
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item._id, item.name)}
            >
              <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyTitle}>No subjects yet</Text>
            <Text style={styles.emptyText}>Add the first one above!</Text>
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
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  addForm: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 1,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: Colors.text.primary,
    backgroundColor: Colors.background,
    marginBottom: 10,
  },
  inputError: {
    borderColor: Colors.error,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: -6,
    marginBottom: 8,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    marginTop: 4,
  },
  addButtonDisabled: {
    opacity: 0.7,
  },
  addButtonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  subjectRow: {
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
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  subjectDesc: {
    fontSize: 12,
    color: Colors.text.muted,
    marginBottom: 2,
  },
  branchText: {
    fontSize: 11,
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
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.muted,
  },
});
