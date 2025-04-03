'use client';

import { useEffect } from 'react';
import { Box, Flex, Heading, Text } from 'rebass';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AuthForm from '@/components/AuthForm';
import Loading from '@/components/Loading';

export default function AuthPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <Loading />;
  }

  // Don't show auth page if already authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <Flex
      sx={{
        flexDirection: ['column', 'row'],
        minHeight: 'calc(100vh - 136px)', // Account for header and footer
      }}
    >
      {/* Form Section */}
      <Box
        width={[1, 1/2]}
        p={[4, 5]}
        sx={{
          backgroundColor: 'white',
        }}
      >
        <AuthForm />
      </Box>

      {/* Hero Section */}
      <Box
        width={[1, 1/2]}
        p={[4, 5]}
        sx={{
          backgroundColor: 'lightGray',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Heading as="h1" fontSize={[4, 5, 6]} mb={4}>
          Learn at your own pace
        </Heading>
        <Text fontSize={[2, 3]} color="text" mb={4}>
          Welcome to our Learning Management System. Access your courses, track your progress, and connect with instructors and peers.
        </Text>
        <Box mb={4}>
          <Text fontSize={2} mb={3}>
            Our platform offers:
          </Text>
          <Box as="ul" sx={{ paddingLeft: 3 }}>
            <Box as="li" mb={2}>Personalized learning experiences</Box>
            <Box as="li" mb={2}>Expert-created content</Box>
            <Box as="li" mb={2}>Interactive assignments and quizzes</Box>
            <Box as="li" mb={2}>Progress tracking and analytics</Box>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}
