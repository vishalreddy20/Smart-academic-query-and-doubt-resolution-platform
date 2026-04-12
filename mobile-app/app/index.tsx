import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getRoleDashboardPath } from '@/services/api';

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner label="Checking account" />;
  }

  return <Redirect href={user ? getRoleDashboardPath(user.role) : '/(auth)/login'} />;
}
