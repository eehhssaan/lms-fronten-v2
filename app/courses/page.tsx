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
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  if (authLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    router.replace("/auth");
    return null;
  }

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        const response =
          user?.role === "student"
            ? await getEnrolledCourses({ page, limit })
            : await getCourses({ page, limit });

        setCourses(response.data);
        setTotalPages(response.pagination.totalPages || 1);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        setError("Failed to load courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [isAuthenticated, page, limit, user?.role]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleTabChange = (tab: "all" | "enrolled") => {
    setActiveTab(tab);
    setError(null);
  };

  return (
    <Box
      as="div"
      className="container"
      py={4}
      style={{ backgroundColor: "#f0f0f0", width: "100%" }}
    >
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading as="h1">
          {user?.role === "student" ? "My Courses" : "All Courses"}
        </Heading>

        {/* Show Create Course button only for head teachers and admins */}
        {user && (user.role === "admin" || user.role === "head_teacher") && (
          <Button
            onClick={() => router.push("/courses/create")}
            variant="primary"
          >
            Create Course
          </Button>
        )}
      </Flex>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Loading />
      ) : courses.length > 0 ? (
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
    </Box>
  );
}
