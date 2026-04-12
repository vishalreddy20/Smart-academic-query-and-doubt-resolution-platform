import { Chip } from 'react-native-paper';
import { statusPalette, rolePalette } from '@/constants/Colors';
import type { DoubtStatus, Role } from '@/types';

type Props = {
  status?: DoubtStatus | string;
  role?: Role | string;
  label?: string;
};

export default function StatusBadge({ status, role, label }: Props) {
  const key = (status || role || label || '').toString().toUpperCase();
  const palette = status ? statusPalette[key] : role ? rolePalette[(role as string).toLowerCase()] : undefined;
  const text = label || key || 'UNKNOWN';

  return (
    <Chip
      compact
      style={{
        backgroundColor: palette?.background || '#E2E8F0',
        alignSelf: 'flex-start',
      }}
      textStyle={{ color: palette?.text || '#334155', fontWeight: '700' }}
    >
      {text}
    </Chip>
  );
}
