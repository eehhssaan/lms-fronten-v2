"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import CourseForm from "@/components/CourseForm";
import ErrorMessage from "@/components/ErrorMessage";
import Loading from "@/components/Loading";
import Button from "@/components/Button";
import { Course } from "@/types";
import { Box, Flex, Heading } from "rebass";

export default function CreateCoursePage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If user is loaded and they're not a teacher or admin, redirect to home
    if (!loading && user && user.role !== "teacher" && user.role !== "admin") {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleSuccess = (course: Course) => {
    // Redirect to the course details page after creation
    setTimeout(() => {
      router.push(`/courses/${course._id}`);
    }, 1500);
  };

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    router.push("/auth");
    return <Loading />;
  }

  if (user?.role !== "teacher" && user?.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-md">
          <h2 className="text-xl font-medium text-red-600">Access Denied</h2>
          <p className="mt-2 text-red-500">
            You do not have permission to create courses. Only teachers and
            administrators can create courses.
          </p>
          <div className="mt-4">
            <Button onClick={() => router.push("/")} variant="secondary">
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Box as="div" className="container" py={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading as="h1">Create New Course</Heading>
        <Button onClick={() => router.push("/courses")} variant="secondary">
          Back to Courses
        </Button>
      </Flex>

      {error && <ErrorMessage message={error} />}

      <Box className="card">
        <CourseForm onSuccess={handleSuccess} />
      </Box>
    </Box>
  );
}
