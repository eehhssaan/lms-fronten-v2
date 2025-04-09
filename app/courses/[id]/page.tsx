"use client";

import { useEffect, useState } from "react";
import { Box, Heading, Flex, Text } from "rebass";
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

          {user?.role === "teacher" && (
            <Box mt={4} mb={4}>
              <CourseContentManager
                courseId={courseId}
                contents={contents}
                onContentAdded={() => {
                  // Refresh course contents
                  getCourseContents(courseId)
                    .then(setContents)
                    .catch(console.error);
                }}
              />
            </Box>
          )}

          <Flex flexDirection={["column", "row"]} mt={4}>
            <Box width={[1, 2 / 3]} pr={[0, 4]}>
              <Heading as="h2" fontSize={3} mb={3}>
                Course Content
              </Heading>

              {contents.length > 0 ? (
                <CourseContent contents={contents} courseId={courseId} />
              ) : (
                <Box
                  p={4}
                  bg="lightGray"
                  borderRadius="default"
                  textAlign="center"
                >
                  <Text>No content available for this course yet.</Text>
                </Box>
              )}
            </Box>
          </Flex>
        </>
      )}
    </Box>
  );
}
