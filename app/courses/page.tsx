"use client";

import { useEffect, useState } from "react";
import { Box, Heading, Flex, Text } from "rebass";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import CourseList from "@/components/CourseList";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import Button from "@/components/Button";
import { getCourses, getEnrolledCourses } from "@/lib/api";
import { Course } from "@/types";

export default function CoursesPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"all" | "enrolled">("all");
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [enrolledPage, setEnrolledPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [enrolledTotalPages, setEnrolledTotalPages] = useState(1);
  const router = useRouter();

  // For students, we only need enrolledCourses state and pagination
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch all courses
  useEffect(() => {
    if (isAuthenticated && activeTab === "all") {
      const fetchAllCourses = async () => {
        try {
          setLoading(true);
          // If user is a student, use getEnrolledCourses for both tabs
          if (user?.role === "student") {
            const response = await getEnrolledCourses({ page, limit });
            setAllCourses(response.data);
            setTotalPages(response.pagination.totalPages || 1);
          } else {
            const response = await getCourses({ page, limit });
            setAllCourses(response.data);
            setTotalPages(response.pagination.totalPages || 1);
          }
        } catch (err) {
          console.error("Failed to fetch all courses:", err);
          setError("Failed to load courses. Please try again later.");
        } finally {
          setLoading(false);
        }
      };

      fetchAllCourses();
    }
  }, [isAuthenticated, page, limit, activeTab, user?.role]);

  // Fetch enrolled courses (this will be the same for students)
  useEffect(() => {
    if (
      isAuthenticated &&
      activeTab === "enrolled" &&
      user?.role === "student"
    ) {
      const fetchEnrolledCourses = async () => {
        try {
          setLoading(true);
          const response = await getEnrolledCourses({
            page: enrolledPage,
            limit,
          });
          setEnrolledCourses(response.data);
          setEnrolledTotalPages(response.pagination.totalPages || 1);
        } catch (err) {
          console.error("Failed to fetch enrolled courses:", err);
          setError(
            "Failed to load your enrolled courses. Please try again later."
          );
        } finally {
          setLoading(false);
        }
      };

      fetchEnrolledCourses();
    }
  }, [isAuthenticated, enrolledPage, limit, activeTab, user?.role]);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchCourses = async () => {
        try {
          setLoading(true);
          setError(null);

          // For students, show enrolled courses
          // For teachers and admins, show all courses they have access to
          const response =
            user?.role === "student"
              ? await getEnrolledCourses({ page, limit })
              : await getCourses({ page, limit });

          setCourses(response.data);
          setTotalPages(response.pagination.totalPages || 1);
        } catch (err) {
          console.error("Failed to fetch courses:", err);
          setError("Failed to load your courses. Please try again later.");
        } finally {
          setLoading(false);
        }
      };

      fetchCourses();
    }
  }, [isAuthenticated, page, limit, user?.role]);

  const handlePageChange = (newPage: number) => {
    if (activeTab === "all" && newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    } else if (
      activeTab === "enrolled" &&
      newPage > 0 &&
      newPage <= enrolledTotalPages
    ) {
      setEnrolledPage(newPage);
    }
  };

  const handleTabChange = (tab: "all" | "enrolled") => {
    setActiveTab(tab);
    setError(null);
  };

  if (authLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return null; // Will redirect to auth page
  }

  return (
    <Box as="div" className="container" py={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading as="h1">
          {user?.role === "student" ? "My Courses" : "All Courses"}
        </Heading>

        {/* Show Create Course button only for teachers and admins */}
        {user && (user.role === "teacher" || user.role === "admin") && (
          <Button
            onClick={() => router.push("/courses/create")}
            variant="primary"
          >
            Create Course
          </Button>
        )}
      </Flex>

      {/* Tabs - only show the Enrolled tab for students */}
      {user?.role === "student" && (
        <Flex mb={4} className="tabs">
          <Box
            as="button"
            onClick={() => handleTabChange("enrolled")}
            className={`tab ${activeTab === "enrolled" ? "active" : ""}`}
            py={2}
            px={3}
            sx={{
              borderBottom: activeTab === "enrolled" ? "2px solid" : "none",
              borderColor: "primary",
              backgroundColor: "transparent",
              cursor: "pointer",
              fontWeight: activeTab === "enrolled" ? "bold" : "normal",
            }}
          >
            My Courses
          </Box>
        </Flex>
      )}

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Loading />
      ) : (
        <>
          {courses.length > 0 ? (
            <>
              <CourseList
                courses={courses}
                showEnrollmentStatus={user?.role === "student"}
              />

              {/* Pagination controls */}
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
            </>
          ) : (
            <Box p={4} bg="lightGray" borderRadius="default" textAlign="center">
              <Heading as="h3" fontSize={3} mb={3}>
                {user?.role === "student"
                  ? "You're not enrolled in any courses"
                  : "No courses available"}
              </Heading>
              <Box as="p" color="secondary">
                {user?.role === "student"
                  ? "Please contact your teacher or administrator to enroll in courses."
                  : "Create a new course to get started."}
              </Box>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
