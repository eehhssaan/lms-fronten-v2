"use client";

import { useEffect, useState } from "react";
import { Box, Heading, Flex, Text, Button as RebassButton } from "rebass";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import CourseContent from "@/components/CourseContent";
import FileUpload from "@/components/FileUpload";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import { getCourse, getCourseContents } from "@/lib/api";
import { Course, Content } from "@/types";
import { use } from "react";
import CourseContentManager from "@/components/CourseContentManager";
import CourseForm from "@/components/CourseForm";
import CourseNavigation from "@/components/CourseNavigation";
import CourseHeader from "@/components/CourseHeader";
import Button from "@/components/Button";

export default function CoursePage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams =
    typeof params === "object" && !("then" in params)
      ? params
      : use(params as Promise<{ id: string }>);

  const courseId = resolvedParams.id;
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showContentManager, setShowContentManager] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && courseId) {
      const fetchCourseData = async () => {
        try {
          setLoading(true);
          setError(null);

          // Fetch course details
          const courseData = await getCourse(courseId);
          setCourse(courseData);

          // Fetch course contents
          const contentsData = await getCourseContents(courseId);
          setContents(contentsData);
        } catch (err: any) {
          console.error("Failed to fetch course data:", err);
          setError(
            err.message ||
              "Failed to load course information. Please try again later."
          );
        } finally {
          setLoading(false);
        }
      };

      fetchCourseData();
    }
  }, [isAuthenticated, courseId]);

  const canManageCourse =
    user &&
    (user.role === "teacher" ||
      user.role === "admin" ||
      (course?.teacher &&
        typeof course.teacher !== "string" &&
        course.teacher._id === user._id));

  const refreshContents = async () => {
    try {
      const contentsData = await getCourseContents(courseId);
      setContents(contentsData);
    } catch (err) {
      console.error("Failed to refresh contents:", err);
    }
  };

  if (authLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box as="div" className="container" py={4}>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : !course ? (
        <ErrorMessage message="Course not found" />
      ) : (
        <>
          <CourseHeader course={course} />
          <CourseNavigation courseId={courseId} activeTab="content" />

          {canManageCourse && (
            <Box
              mt={4}
              mb={4}
              p={3}
              bg="white"
              sx={{
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <Flex justifyContent="space-between" alignItems="center">
                <Heading as="h3" fontSize={3}>
                  Course Management
                </Heading>
                <Flex>
                  {!showContentManager ? (
                    <Button
                      onClick={() => setShowContentManager(true)}
                      variant="primary"
                    >
                      Manage Content
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setShowContentManager(false)}
                      variant="secondary"
                    >
                      Hide Content Manager
                    </Button>
                  )}
                  <Button
                    onClick={() => router.push(`/courses/${courseId}/edit`)}
                    variant="secondary"
                    sx={{ marginLeft: "10px" }}
                  >
                    Edit Course
                  </Button>
                </Flex>
              </Flex>

              {showContentManager && (
                <Box mt={3}>
                  <CourseContentManager
                    courseId={courseId}
                    contents={contents}
                    onContentAdded={refreshContents}
                  />
                </Box>
              )}
            </Box>
          )}

          <Box>
            <Heading as="h2" fontSize={3} mb={3}>
              Course Content
            </Heading>

            {contents.length > 0 ? (
              <Box
                bg="white"
                p={4}
                sx={{
                  borderRadius: "8px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <CourseContent contents={contents} courseId={courseId} />
              </Box>
            ) : (
              <Box
                p={4}
                bg="white"
                sx={{
                  borderRadius: "8px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  textAlign: "center",
                }}
              >
                <Text
                  color="gray.600"
                  fontSize={2}
                  mb={canManageCourse ? 3 : 0}
                >
                  No content available for this course yet.
                </Text>
                {canManageCourse && !showContentManager && (
                  <Button
                    onClick={() => setShowContentManager(true)}
                    variant="secondary"
                    size="small"
                  >
                    Add Course Content
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
