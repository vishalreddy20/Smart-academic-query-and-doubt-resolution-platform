import { ActivityIndicator, Text } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

type Props = {
  label?: string;
  fullScreen?: boolean;
};

export default function LoadingSpinner({ label = 'Loading...', fullScreen = true }: Props) {
  return (
    <View style={[styles.container, fullScreen ? styles.fullScreen : null]}>
      <ActivityIndicator animating size="large" color={Colors.primary} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 20,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  label: {
    color: Colors.muted,
    fontSize: 14,
  },
});
