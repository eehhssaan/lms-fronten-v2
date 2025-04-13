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
import { getCourse } from "@/lib/api";

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const courseId = params.id;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth");
      return;
    }

    const fetchCourse = async () => {
      try {
        setLoading(true);
        const courseData = await getCourse(courseId);
        setCourse(courseData);
      } catch (err: any) {
        console.error("Failed to fetch course:", err);
        setError(err.message || "Failed to load course information.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && courseId) {
      fetchCourse();
    }
  }, [isAuthenticated, authLoading, courseId, router]);

  // Check if user has permission to edit the course
  const canEditCourse =
    user &&
    (user.role === "admin" ||
      user.role === "head_teacher" ||
      (course?.teacher &&
        typeof course.teacher !== "string" &&
        course.teacher._id === user._id));

  const handleSuccess = (course: Course) => {
    // Redirect to the course details page after update
    setTimeout(() => {
      router.push(`/courses/${course.id}`);
    }, 1500);
  };

  if (authLoading || loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!canEditCourse) {
    return (
      <Box as="div" className="container" py={4}>
        <ErrorMessage message="You do not have permission to edit this course. Only administrators, head teachers, or the assigned teacher can edit courses." />
        <Box mt={3}>
          <Button
            onClick={() => router.push(`/courses/${courseId}`)}
            variant="secondary"
          >
            Back to Course
          </Button>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box as="div" className="container" py={4}>
        <ErrorMessage message={error} />
        <Box mt={3}>
          <Button onClick={() => router.push("/courses")} variant="secondary">
            Back to Courses
          </Button>
        </Box>
      </Box>
    );
  }

  if (!course) {
    return (
      <Box as="div" className="container" py={4}>
        <ErrorMessage message="Course not found" />
        <Box mt={3}>
          <Button onClick={() => router.push("/courses")} variant="secondary">
            Back to Courses
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box as="div" className="container" py={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading as="h1">Edit Course</Heading>
        <Button
          onClick={() => router.push(`/courses/${courseId}`)}
          variant="secondary"
        >
          Back to Course
        </Button>
      </Flex>

      <Box
        bg="white"
        p={4}
        sx={{ borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
      >
        <CourseForm initialData={course} onSuccess={handleSuccess} />
      </Box>
    </Box>
  );
}
