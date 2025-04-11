"use client";

import { useEffect, useState } from "react";
import { Box, Heading, Flex, Text } from "rebass";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import CourseNavigation from "@/components/CourseNavigation";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import Button from "@/components/Button";
import { getCourse } from "@/lib/api";
import { Course } from "@/types";
import CourseForm from "@/components/CourseForm";
import Notification from "@/components/Notification";
import CourseHeader from "@/components/CourseHeader";

export default function CourseInformation() {
  const params = useParams();
  const courseId = typeof params?.id === "string" ? params.id : "";
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
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

          const courseData = await getCourse(courseId);
          setCourse(courseData);
        } catch (err: any) {
          console.error("Failed to fetch course data:", err);
          setError(
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
          <CourseNavigation courseId={courseId} activeTab="information" />

          <Flex flexDirection={["column", "row"]} mt={4}>
            <Box width={[1, 2 / 3]} pr={[0, 4]}>
              <Box className="card">
                {!isEditing ? (
                  <>
                    <Heading as="h3" fontSize={2} mb={3}>
                      Course Information
                    </Heading>
                    <Box as="dl">
                      <Box as="dt" fontWeight="bold">
                        Instructor
                      </Box>
                      <Box as="dd" mb={2}>
                        {course.teacher
                          ? `${course.teacher.name}`
                          : "Not assigned"}
                      </Box>

                      <Box as="dt" fontWeight="bold">
                        Start Date
                      </Box>
                      <Box as="dd" mb={2}>
                        {course.startDate
                          ? new Date(course.startDate).toLocaleDateString()
                          : "Not set"}
                      </Box>

                      <Box as="dt" fontWeight="bold">
                        End Date
                      </Box>
                      <Box as="dd" mb={2}>
                        {course.endDate
                          ? new Date(course.endDate).toLocaleDateString()
                          : "Not set"}
                      </Box>

                      <Box as="dt" fontWeight="bold">
                        Status
                      </Box>
                      <Box as="dd" mb={2}>
                        {course.isActive ? "Active" : "Inactive"}
                      </Box>

                      <Box as="dt" fontWeight="bold">
                        Enrollment
                      </Box>
                      <Box as="dd" mb={2}>
                        {course.students
                          ? `${course.students.length}/${course.maxStudents}`
                          : "0/0"}{" "}
                        students
                      </Box>
                    </Box>

                    {/* Show edit button for admins and course owner (teacher) */}
                    {user &&
                      (user.role === "admin" ||
                        (user.role === "teacher" &&
                          course?.teacher?._id === user._id)) && (
                        <Button
                          onClick={() => setIsEditing(true)}
                          variant="primary"
                          sx={{ mt: 3 }}
                        >
                          Edit Course
                        </Button>
                      )}
                  </>
                ) : (
                  <>
                    <Heading as="h3" fontSize={2} mb={3}>
                      Edit Course
                    </Heading>
                    <CourseForm
                      initialData={course}
                      onSuccess={(updatedCourse) => {
                        setCourse(updatedCourse);
                        setIsEditing(false);
                        setNotification({
                          message: "Course updated successfully",
                          type: "success",
                        });
                      }}
                    />
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="secondary"
                      sx={{ mt: 3 }}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </Box>
            </Box>

            {/* Show assignment submission info for enrolled students or teachers */}
            {((user && user.role !== "student") ||
              course.students?.some(
                (student) => student._id === user?._id
              )) && (
              <Box width={[1, 1 / 3]} mt={[4, 0]}>
                <Box className="card">
                  <Heading as="h3" fontSize={2} mb={3}>
                    Assignments
                  </Heading>
                  <Text>
                    To view and submit assignments for this course, please visit
                    the Assignments section.
                  </Text>
                </Box>
              </Box>
            )}
          </Flex>

          {notification && (
            <Notification
              message={notification.message}
              type={notification.type}
              onClose={() => setNotification(null)}
            />
          )}
        </>
      )}
    </Box>
  );
}
