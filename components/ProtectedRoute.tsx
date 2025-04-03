'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Loader from './Loader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = ['student', 'teacher', 'admin'] 
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!loading && !isAuthenticated) {
      router.push('/auth');
    }

    // If authenticated but role is not allowed, redirect to courses
    if (user && !allowedRoles.includes(user.role)) {
      router.push('/courses');
    }
  }, [user, loading, isAuthenticated, router, allowedRoles]);

  // Show loading state while checking authentication
  if (loading) {
    return <Loader />;
  }

  // If authenticated and role is allowed, render children
  if (isAuthenticated && user && allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  // Return null while redirecting
  return null;
};

export default ProtectedRoute;
