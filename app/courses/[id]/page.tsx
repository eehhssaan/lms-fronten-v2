"use client";

import { useEffect, useState } from "react";
import { Box, Heading, Flex, Text } from "rebass";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import CourseContent from "@/components/CourseContent";
import FileUpload from "@/components/FileUpload";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import Button from "@/components/Button";
import {
  getCourse,
  getCourseContents,
  enrollInCourse,
  unenrollFromCourse,
} from "@/lib/api";
import { Course, Content } from "@/types";
import { use } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import Notification from "@/components/Notification";

export default function CoursePage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  // Unwrap params using React.use to handle Next.js 15 behavior
  const resolvedParams =
    typeof params === "object" && !("then" in params)
      ? params
      : use(params as Promise<{ id: string }>);

  const courseId = resolvedParams.id;
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [showUnenrollDialog, setShowUnenrollDialog] = useState(false);
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

  // Check if the current user is enrolled in this course
  const checkEnrollmentStatus = (course: Course) => {
    if (!user || !course.students) return false;
    return course.students.some((student) => student._id === user._id);
  };

  useEffect(() => {
    if (isAuthenticated && courseId) {
      const fetchCourseData = async () => {
        try {
          setLoading(true);
          setError(null);
          console.log("Fetching course data for ID:", courseId);

          // Fetch course details
          try {
            // Make sure we're sending auth headers
            const courseData = await getCourse(courseId);
            console.log("Course data received:", courseData);
            setCourse(courseData);
            setIsEnrolled(checkEnrollmentStatus(courseData));
          } catch (courseErr: any) {
            console.error("Error fetching course details:", courseErr);

            // If we get an authentication error, redirect to login
            if (
              courseErr.message &&
              (courseErr.message.includes("not logged in") ||
                courseErr.message.includes("Authentication required") ||
                courseErr.message.includes("expired"))
            ) {
              console.log(
                "Authentication error detected, redirecting to login"
              );
              router.push("/auth");
              return;
            }

            setError(
              courseErr.message ||
                "Failed to load course details. Please try again later."
            );
            setLoading(false);
            return;
          }

          // Fetch course contents
          try {
            const contentsData = await getCourseContents(courseId);
            console.log("Course contents received:", contentsData);
            setContents(contentsData);
          } catch (contentsErr) {
            console.error("Error fetching course contents:", contentsErr);
            // Don't set error since we already have the course details
            setContents([]);
          }
        } catch (err) {
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
  }, [isAuthenticated, courseId, user]);

  const handleEnroll = async () => {
    if (!course) return;

    try {
      setEnrollLoading(true);
      setEnrollmentError(null);

      const updatedCourse = await enrollInCourse(courseId);
      setCourse(updatedCourse);
      setIsEnrolled(true);
      setNotification({
        message: "Successfully enrolled in the course!",
        type: "success",
      });
    } catch (err: any) {
      console.error("Failed to enroll in course:", err);
      setEnrollmentError(
        err.message || "Failed to enroll in course. Please try again."
      );
      setNotification({
        message: err.message || "Failed to enroll in course. Please try again.",
        type: "error",
      });
    } finally {
      setEnrollLoading(false);
      setShowEnrollDialog(false);
    }
  };

  const handleUnenroll = async () => {
    if (!course) return;

    try {
      setEnrollLoading(true);
      setEnrollmentError(null);

      const updatedCourse = await unenrollFromCourse(courseId);
      setCourse(updatedCourse);
      setIsEnrolled(false);
      setNotification({
        message: "Successfully unenrolled from the course.",
        type: "success",
      });
    } catch (err: any) {
      console.error("Failed to unenroll from course:", err);
      setEnrollmentError(
        err.message || "Failed to unenroll from course. Please try again."
      );
      setNotification({
        message:
          err.message || "Failed to unenroll from course. Please try again.",
        type: "error",
      });
    } finally {
      setEnrollLoading(false);
      setShowUnenrollDialog(false);
    }
  };

  if (authLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return null; // Will redirect to auth page
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
          <Box mb={4}>
            <Heading as="h1">{course.title}</Heading>
            <Text color="secondary" mt={2}>
              {course.code}
            </Text>
            <Text mt={3}>{course.description}</Text>
          </Box>

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

            <Box width={[1, 1 / 3]} mt={[4, 0]}>
              <Box className="card">
                <Heading as="h3" fontSize={2} mb={3}>
                  Course Information
                </Heading>
                <Box as="dl">
                  <Box as="dt" fontWeight="bold">
                    Instructor
                  </Box>
                  <Box as="dd" mb={2}>
                    {course.teacher
                      ? `${course.teacher.firstName} ${course.teacher.lastName}`
                      : "Not assigned"}
                  </Box>

                  <Box as="dt" fontWeight="bold">
                    Start Date
                  </Box>
                  <Box as="dd" mb={2}>
                    {new Date(course.startDate).toLocaleDateString()}
                  </Box>

                  <Box as="dt" fontWeight="bold">
                    End Date
                  </Box>
                  <Box as="dd" mb={2}>
                    {new Date(course.endDate).toLocaleDateString()}
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

                {/* Show enrollment actions for students only */}
                {user && user.role === "student" && (
                  <Box mt={3}>
                    {isEnrolled ? (
                      <Button
                        onClick={() => setShowUnenrollDialog(true)}
                        variant="secondary"
                        fullWidth
                        disabled={enrollLoading}
                      >
                        {enrollLoading ? "Processing..." : "Leave Course"}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setShowEnrollDialog(true)}
                        variant="primary"
                        fullWidth
                        disabled={
                          enrollLoading ||
                          (course.students &&
                            course.students.length >= course.maxStudents)
                        }
                      >
                        {enrollLoading
                          ? "Processing..."
                          : course.students &&
                            course.students.length >= course.maxStudents
                          ? "Course Full"
                          : "Enroll Now"}
                      </Button>
                    )}
                    {enrollmentError && (
                      <Text color="red" fontSize={1} mt={2}>
                        {enrollmentError}
                      </Text>
                    )}
                  </Box>
                )}
              </Box>

              {/* Only show assignment submission for enrolled students or teachers */}
              {((user && user.role !== "student") || isEnrolled) && (
                <Box className="card" mt={3}>
                  <Heading as="h3" fontSize={2} mb={3}>
                    Assignment Submission
                  </Heading>
                  <FileUpload courseId={courseId} />
                </Box>
              )}
            </Box>
          </Flex>

          {/* Confirmation Dialogs */}
          <ConfirmDialog
            isOpen={showEnrollDialog}
            title="Enroll in Course"
            message={`Are you sure you want to enroll in ${course?.title}? You will have access to all course materials and assignments.`}
            confirmLabel="Enroll"
            cancelLabel="Cancel"
            onConfirm={handleEnroll}
            onCancel={() => setShowEnrollDialog(false)}
            isLoading={enrollLoading}
          />

          <ConfirmDialog
            isOpen={showUnenrollDialog}
            title="Leave Course"
            message={`Are you sure you want to leave ${course?.title}? You will lose access to all course materials and your progress will be saved.`}
            confirmLabel="Leave Course"
            cancelLabel="Cancel"
            onConfirm={handleUnenroll}
            onCancel={() => setShowUnenrollDialog(false)}
            isLoading={enrollLoading}
          />

          {/* Notification */}
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
