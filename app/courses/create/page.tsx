"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import CourseForm from "@/components/CourseForm";
import ErrorMessage from "@/components/ErrorMessage";
import Loading from "@/components/Loading";
import Button from "@/components/Button";
import { Course } from "@/types";
import { Box, Flex, Heading } from "rebass";
import { getSubjectById } from "@/lib/api";

export default function CreateCoursePage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = searchParams.get("subject");
  const [error, setError] = useState<string | null>(null);
  const [subjectName, setSubjectName] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<Partial<Course>>({});
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    // Redirect if user doesn't have permission
    if (
      !loading &&
      user &&
      user.role !== "admin" &&
      user.role !== "head_teacher"
    ) {
      router.push("/courses");
    }

    // If we have a subject ID, get the subject name
    if (subjectId) {
      const fetchSubject = async () => {
        try {
          const subject = await getSubjectById(subjectId);
          setSubjectName(subject.name);
          // Pre-fill the form with the subject
          setInitialData({
            subject: {
              _id: subjectId,
              name: subject.name,
            },
          });
        } catch (err: any) {
          console.error("Failed to fetch subject:", err);
          setError("Failed to load subject information.");
        } finally {
          setPageLoading(false);
        }
      };

      fetchSubject();
    } else {
      setPageLoading(false);
    }
  }, [user, loading, router, subjectId]);

  const handleSuccess = (course: Course) => {
    // Redirect to the course details page after creation
    setTimeout(() => {
      router.push(`/courses/${course._id}`);
    }, 1500);
  };

  if (loading || pageLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    router.push("/auth");
    return <Loading />;
  }

  if (user?.role !== "admin" && user?.role !== "head_teacher") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-md">
          <h2 className="text-xl font-medium text-red-600">Access Denied</h2>
          <p className="mt-2 text-red-500">
            You do not have permission to create courses. Only administrators
            and head teachers can create courses.
          </p>
          <div className="mt-4">
            <Button onClick={() => router.push("/courses")} variant="secondary">
              Return to Courses
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Box as="div" className="container" py={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Heading as="h1">Create New Course</Heading>
          {subjectName && (
            <Box fontSize={2} color="gray.600" mt={1}>
              For Subject: {subjectName}
            </Box>
          )}
        </Box>
        <Button
          onClick={() =>
            subjectId
              ? router.push(`/subjects/${subjectId}`)
              : router.push("/courses")
          }
          variant="secondary"
        >
          {subjectId ? "Back to Subject" : "Back to Courses"}
        </Button>
      </Flex>

      {error && <ErrorMessage message={error} />}

      <Box className="card">
        <CourseForm initialData={initialData} onSuccess={handleSuccess} />
      </Box>
    </Box>
  );
}
