"use client";

import React, { useEffect, useState } from "react";
import { Box, Heading, Flex, Text } from "rebass";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import SubjectBreadcrumb, {
  useSubjectBreadcrumb,
} from "@/components/SubjectBreadcrumb";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import { getSubjectById, getCoursesBySubject } from "@/lib/api";
import { Course } from "@/types";
import SubjectNavigation from "@/components/SubjectNavigation";
import CourseList from "@/components/CourseList";
import Button from "@/components/Button";

export default function SubjectCoursesPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [subject, setSubject] = useState<{
    name: string;
    description?: string;
    headTeacher?: any;
  }>();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(6); // Show 6 courses per page
  const router = useRouter();
  const params = useParams();
  const subjectId = params?.subjectId as string;

  const breadcrumbItems = useSubjectBreadcrumb(subject?.name);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && subjectId) {
      const fetchSubjectAndCourses = async () => {
        try {
          setLoading(true);
          setError(null);

          // Fetch subject details
          const subjectData = await getSubjectById(subjectId);
          setSubject(subjectData);

          // Fetch courses for this subject
          const coursesResponse = await getCoursesBySubject(subjectId, {
            page,
            limit,
          });
          setCourses(coursesResponse.data);
          setTotalPages(coursesResponse.pagination.totalPages);
        } catch (err: any) {
          console.error("Failed to fetch subject details or courses:", err);
          setError(
            err.message ||
              "Failed to load subject data. Please try again later."
          );
        } finally {
          setLoading(false);
        }
      };

      fetchSubjectAndCourses();
    }
  }, [isAuthenticated, subjectId, page, limit]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (authLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return null; // Will redirect to auth page
  }

  const isAdminOrHeadTeacher =
    user?.role === "admin" || user?.role === "head_teacher";
  const isHeadTeacherOfSubject =
    subject?.headTeacher && user?._id === subject.headTeacher._id;
  const canManageSubject = isAdminOrHeadTeacher || isHeadTeacherOfSubject;

  return (
    <Box as="div" className="container" py={4} px={[3, 4]}>
      <SubjectBreadcrumb items={breadcrumbItems} />

      <Flex
        alignItems="center"
        justifyContent="space-between"
        mb={4}
        flexWrap="wrap"
      >
        <Box flex="1" mb={[3, 0]}>
          <Heading as="h1" fontSize={[4, 5]}>
            {subject?.name || "Subject"}
          </Heading>
          {subject?.description && (
            <Text color="gray.600" mt={2}>
              {subject.description}
            </Text>
          )}
          {subject?.headTeacher && (
            <Text color="gray.600" mt={1}>
              Head Teacher: {subject.headTeacher.name}
            </Text>
          )}
        </Box>

        {canManageSubject && (
          <Button
            onClick={() => router.push(`/courses/create?subject=${subjectId}`)}
            variant="primary"
          >
            Create Course
          </Button>
        )}
      </Flex>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Loading />
      ) : (
        <>
          <SubjectNavigation subjectId={subjectId} activeTab="courses" />

          <Box>
            {courses.length > 0 ? (
              <>
                <CourseList
                  courses={courses}
                  showEnrollmentStatus={user?.role === "student"}
                />

                {/* Pagination controls */}
                {totalPages > 1 && (
                  <Flex justifyContent="center" mt={4}>
                    <Button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      variant="secondary"
                      size="small"
                      sx={{ marginRight: "0.5rem" }}
                    >
                      Previous
                    </Button>
                    <Text alignSelf="center" mx={2}>
                      Page {page} of {totalPages}
                    </Text>
                    <Button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      variant="secondary"
                      size="small"
                      sx={{ marginLeft: "0.5rem" }}
                    >
                      Next
                    </Button>
                  </Flex>
                )}
              </>
            ) : (
              <Box
                p={4}
                bg="gray.100"
                borderRadius="default"
                textAlign="center"
              >
                <Heading as="h3" fontSize={3} mb={3}>
                  No courses available
                </Heading>
                <Text color="gray.600">
                  This subject doesn't have any courses yet.
                  {canManageSubject &&
                    " Click the 'Create Course' button to add a course."}
                </Text>
              </Box>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
