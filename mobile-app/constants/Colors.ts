export const Colors = {
  background: '#F4F7FB',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF4FF',
  primary: '#0F766E',
  primaryDark: '#115E59',
  accent: '#2563EB',
  text: '#0F172A',
  muted: '#64748B',
  border: '#D8E1EE',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  info: '#2563EB',
  student: '#D97706',
  faculty: '#2563EB',
  admin: '#0F766E',
  open: '#D97706',
  claimed: '#2563EB',
  resolved: '#16A34A',
};

export const statusPalette: Record<string, { background: string; text: string }> = {
  OPEN: { background: '#FEF3C7', text: '#92400E' },
  CLAIMED: { background: '#DBEAFE', text: '#1D4ED8' },
  RESOLVED: { background: '#DCFCE7', text: '#166534' },
};

export const rolePalette: Record<string, { background: string; text: string }> = {
  student: { background: '#FEF3C7', text: '#92400E' },
  faculty: { background: '#DBEAFE', text: '#1D4ED8' },
  admin: { background: '#D1FAE5', text: '#065F46' },
};
