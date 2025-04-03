'use client';

import { useEffect, useState } from 'react';
import { Box, Heading } from 'rebass';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import CourseList from '@/components/CourseList';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import { getCourses } from '@/lib/api';
import { Course } from '@/types';

export default function Home() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchCourses = async () => {
        try {
          setLoading(true);
          const coursesData = await getCourses();
          setCourses(coursesData.data);
        } catch (err) {
          console.error('Failed to fetch courses:', err);
          setError('Failed to load courses. Please try again later.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchCourses();
    }
  }, [isAuthenticated]);

  if (authLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return null; // Will redirect to auth page
  }

  return (
    <Box as="div" className="container" py={4}>
      <Box mb={4}>
        <Heading as="h1">Welcome, {user?.firstName || 'Student'}</Heading>
        <Box as="p" color="secondary" fontSize={2} mt={2}>
          Browse your courses and continue your learning journey.
        </Box>
      </Box>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Loading />
      ) : (
        <>
          <Heading as="h2" fontSize={4} mb={3}>
            Your Courses
          </Heading>
          {courses.length > 0 ? (
            <CourseList courses={courses} />
          ) : (
            <Box
              p={4}
              bg="lightGray"
              borderRadius="default"
              textAlign="center"
            >
              <Heading as="h3" fontSize={3} mb={3}>
                No courses available
              </Heading>
              <Box as="p" color="secondary">
                You are not enrolled in any courses yet.
              </Box>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
