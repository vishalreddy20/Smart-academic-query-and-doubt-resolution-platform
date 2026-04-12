import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { HelperText, Text } from 'react-native-paper';
import type { Subject } from '@/types';
import { Colors } from '@/constants/Colors';

type Props = {
  subjects: Subject[];
  value: string;
  onChange: (value: string) => void;
  loading?: boolean;
  error?: string | null;
};

export default function SubjectPicker({ subjects, value, onChange, loading, error }: Props) {
  const items = useMemo(() => subjects.slice().sort((a, b) => a.subjectName.localeCompare(b.subjectName)), [subjects]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Subject</Text>
      <View style={styles.pickerWrap}>
        <Picker
          selectedValue={value}
          onValueChange={(itemValue) => onChange(String(itemValue))}
          enabled={!loading && items.length > 0}
          style={styles.picker}
        >
          <Picker.Item label={loading ? 'Loading subjects...' : 'Select a subject'} value="" />
          {items.map((subject) => (
            <Picker.Item key={subject._id} label={subject.subjectName} value={subject._id} />
          ))}
        </Picker>
      </View>
      <HelperText type="error" visible={Boolean(error)}>
        {error || ''}
      </HelperText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  pickerWrap: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  picker: {
    height: 52,
  },
});
