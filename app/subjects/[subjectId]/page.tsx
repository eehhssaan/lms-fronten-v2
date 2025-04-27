"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Box, Heading, Flex, Text } from "rebass";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import SubjectBreadcrumb, {
  useSubjectBreadcrumb,
} from "@/components/SubjectBreadcrumb";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import CourseList from "@/components/CourseList";
import {
  getSubjectById,
  getCoursesBySubject,
  getSubjectContents,
  getSubjectChapters,
} from "@/lib/api";
import { Course, Content, Chapter } from "@/types";
import Button from "@/components/Button";
import SubjectContentManager from "@/components/SubjectContentManager";
import SubjectContent from "@/components/SubjectContent";
import ChapterManager from "@/components/ChapterManager";

export default function SubjectDetailPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [subject, setSubject] = useState<{
    name: string;
    description?: string;
    headTeacher?: any;
  }>();
  const [courses, setCourses] = useState<Course[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(6); // Show 6 courses per page
  const [showContentManager, setShowContentManager] = useState(false);
  const [showChapterManager, setShowChapterManager] = useState(false);
  const router = useRouter();
  const params = useParams();
  const subjectId = params?.subjectId as string;

  // Move the hook outside of useMemo
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

          // Fetch subject contents
          const contentsData = await getSubjectContents(subjectId);
          setContents(contentsData);

          // Fetch subject chapters
          const chaptersResponse = await getSubjectChapters(subjectId);
          setChapters(chaptersResponse.data);
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

  const refreshContents = async () => {
    try {
      const contentsData = await getSubjectContents(subjectId);
      setContents(contentsData);
    } catch (err) {
      console.error("Failed to refresh contents:", err);
    }
  };

  const refreshChapters = async () => {
    try {
      const chaptersResponse = await getSubjectChapters(subjectId);
      setChapters(chaptersResponse.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch chapters");
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
          {canManageSubject && (
            <Box mb={4}>
              <Flex justifyContent="space-between" alignItems="center" mb={3}>
                <Heading as="h2" fontSize={3}>
                  Subject Management
                </Heading>
                <Flex gap={2}>
                  <Button
                    onClick={() => setShowChapterManager(!showChapterManager)}
                    variant="secondary"
                    size="small"
                  >
                    {showChapterManager ? "Hide Chapters" : "Manage Chapters"}
                  </Button>
                  <Button
                    onClick={() => setShowContentManager(!showContentManager)}
                    variant="secondary"
                    size="small"
                  >
                    {showContentManager ? "Hide Content" : "Manage Content"}
                  </Button>
                </Flex>
              </Flex>

              {showChapterManager && (
                <Box
                  bg="white"
                  p={4}
                  mb={4}
                  sx={{
                    borderRadius: "8px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <ChapterManager
                    subjectId={subjectId}
                    chapters={chapters}
                    onChaptersUpdated={refreshChapters}
                  />
                </Box>
              )}

              {showContentManager && (
                <Box
                  bg="white"
                  p={4}
                  mb={4}
                  sx={{
                    borderRadius: "8px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <SubjectContentManager
                    subjectId={subjectId}
                    contents={contents}
                    onContentAdded={refreshContents}
                    chapters={chapters}
                  />
                </Box>
              )}
            </Box>
          )}

          <Box>
            <Heading as="h2" fontSize={3} mb={3}>
              Subject Content
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
                <SubjectContent
                  contents={contents}
                  subjectId={subjectId}
                  onContentDeleted={refreshContents}
                />
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
                  mb={canManageSubject ? 3 : 0}
                >
                  No content available for this subject yet.
                </Text>
                {canManageSubject && !showContentManager && (
                  <Button
                    onClick={() => setShowContentManager(true)}
                    variant="secondary"
                    size="small"
                  >
                    Add Subject Content
                  </Button>
                )}
              </Box>
            )}
          </Box>

          <Box mt={4}>
            <Heading as="h2" fontSize={3} mb={3}>
              Courses
            </Heading>

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
