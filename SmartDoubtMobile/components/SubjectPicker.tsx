import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Pressable,
} from 'react-native';
import Colors from '../constants/Colors';
import { Subject } from '../types';

interface SubjectPickerProps {
  subjects: Subject[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const SubjectPicker: React.FC<SubjectPickerProps> = ({
  subjects,
  selectedId,
  onSelect,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedSubject = subjects.find((s) => s._id === selectedId);

  const handleSelect = (id: string) => {
    onSelect(id);
    setModalVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.selectorText,
            !selectedSubject && styles.placeholder,
          ]}
        >
          {selectedSubject ? selectedSubject.name : 'Select a subject...'}
        </Text>
        <Text style={styles.chevron}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Subject</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={subjects}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionRow,
                    item._id === selectedId && styles.optionSelected,
                  ]}
                  onPress={() => handleSelect(item._id)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item._id === selectedId && styles.optionTextSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {item._id === selectedId && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              style={styles.list}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: Colors.card,
  },
  selectorText: {
    fontSize: 15,
    color: Colors.text.primary,
    flex: 1,
  },
  placeholder: {
    color: Colors.text.muted,
  },
  chevron: {
    fontSize: 12,
    color: Colors.text.muted,
    marginLeft: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  closeButton: {
    fontSize: 20,
    color: Colors.text.muted,
    padding: 4,
  },
  list: {
    paddingBottom: 20,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  optionSelected: {
    backgroundColor: Colors.infoLight,
  },
  optionText: {
    fontSize: 15,
    color: Colors.text.primary,
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: '700',
  },
});

export default SubjectPicker;
