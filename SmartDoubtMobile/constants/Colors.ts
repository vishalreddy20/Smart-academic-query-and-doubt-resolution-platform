const Colors = {
  // Status colors
  status: {
    open: '#F59E0B',
    claimed: '#3B82F6',
    'in-progress': '#6366F1',
    submitted: '#8B5CF6',
    resolved: '#10B981',
    disputed: '#EF4444',
  },

  // Role colors
  role: {
    student: '#8B5CF6',
    tutor: '#EF4444',
    admin: '#F97316',
  },

  // Primary palette
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  primaryDark: '#1D4ED8',

  // Background
  background: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  // Text
  text: {
    primary: '#1E293B',
    secondary: '#64748B',
    muted: '#94A3B8',
    inverse: '#FFFFFF',
  },

  // Semantic
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.08)',
} as const;

export default Colors;
