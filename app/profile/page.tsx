'use client';

import { useEffect, useState } from 'react';
import { Box, Heading, Flex, Text } from 'rebass';
import { Label, Input } from '@rebass/forms';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import { updateUserProfile } from '@/lib/api';

export default function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth');
    }

    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
    }
  }, [authLoading, isAuthenticated, router, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateUserProfile({
        firstName,
        lastName,
        email
      });
      
      setSuccess('Profile updated successfully!');
      refreshUser(); // Refresh user data in context
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <Loading />;
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect to auth page
  }

  return (
    <Box as="div" className="container" py={4}>
      <Heading as="h1" mb={4}>Your Profile</Heading>

      {error && <ErrorMessage message={error} />}

      {success && (
        <Box className="alert alert-success" mb={3}>
          {success}
        </Box>
      )}

      <Flex flexDirection={['column', 'row']}>
        <Box width={[1, 2/3]} pr={[0, 4]}>
          <Box className="card">
            <Heading as="h2" fontSize={3} mb={3}>
              Personal Information
            </Heading>

            <Box as="form" onSubmit={handleSubmit}>
              <Flex mx={-2} flexWrap="wrap">
                <Box width={[1, 1/2]} px={2} mb={3}>
                  <Label htmlFor="firstName" mb={2}>First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="form-input"
                  />
                </Box>
                
                <Box width={[1, 1/2]} px={2} mb={3}>
                  <Label htmlFor="lastName" mb={2}>Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="form-input"
                  />
                </Box>
              </Flex>

              <Box mb={3}>
                <Label htmlFor="email" mb={2}>Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                />
              </Box>

              <Box>
                <Box 
                  as="button"
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box width={[1, 1/3]} mt={[4, 0]}>
          <Box className="card">
            <Heading as="h3" fontSize={2} mb={3}>
              Account Details
            </Heading>
            <Box as="dl">
              <Box as="dt" fontWeight="bold">Username</Box>
              <Box as="dd" mb={2}>{user.username}</Box>
              
              <Box as="dt" fontWeight="bold">Role</Box>
              <Box as="dd" mb={2}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Box>
              
              <Box as="dt" fontWeight="bold">Account Created</Box>
              <Box as="dd" mb={2}>
                {new Date(user.createdAt).toLocaleDateString()}
              </Box>
            </Box>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}
