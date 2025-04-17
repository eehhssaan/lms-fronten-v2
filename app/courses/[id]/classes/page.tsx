"use client";

import { useEffect, useState } from "react";
import { Box, Heading, Text, Flex } from "rebass";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import CourseNavigation from "@/components/CourseNavigation";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import { getCourse } from "@/lib/api";
import { Course } from "@/types";
import CourseHeader from "@/components/CourseHeader";

interface EnrolledClass {
  _id: string;
  name: string;
  code: string;
  formLevel: string;
  academicYear: string;
  classTeacher?: {
    _id: string;
    name: string;
    email: string;
  };
}

type CourseWithEnrolledClasses = Omit<Course, "enrolledClasses"> & {
  enrolledClasses?: EnrolledClass[];
};

export default function CourseClasses() {
  const params = useParams();
  const courseId = typeof params?.id === "string" ? params.id : "";
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [course, setCourse] = useState<CourseWithEnrolledClasses | null>(null);
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
          const courseData = await getCourse(courseId);
          setCourse(courseData as CourseWithEnrolledClasses);
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
          <CourseHeader
            course={{
              ...course,
              enrolledClasses: course.enrolledClasses?.map((c) => c._id),
            }}
          />
          <CourseNavigation courseId={courseId} activeTab="classes" />

          <Box mt={4}>
            <Heading as="h2" fontSize={3} mb={4}>
              Enrolled Classes
            </Heading>

            {course.enrolledClasses && course.enrolledClasses.length > 0 ? (
              <Box>
                {course.enrolledClasses.map((classItem: EnrolledClass) => (
                  <Box
                    key={classItem._id}
                    p={4}
                    mb={3}
                    bg="white"
                    sx={{
                      borderRadius: "8px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      border: "1px solid",
                      borderColor: "gray.200",
                    }}
                  >
                    <Flex justifyContent="space-between" alignItems="center">
                      <Box>
                        <Heading as="h3" fontSize={2} mb={2}>
                          {classItem.name}
                        </Heading>
                        <Text color="gray.600" fontSize={1}>
                          Class Code: {classItem.code}
                        </Text>
                        <Text color="gray.600" fontSize={1}>
                          Form Level: {classItem.formLevel}
                        </Text>
                        <Text color="gray.600" fontSize={1}>
                          Academic Year: {classItem.academicYear}
                        </Text>
                      </Box>
                      {classItem.classTeacher && (
                        <Box>
                          <Text color="gray.600" fontSize={1}>
                            Class Teacher:{" "}
                            <Text as="span" fontWeight="bold">
                              {classItem.classTeacher.name}
                            </Text>
                          </Text>
                          <Text color="gray.600" fontSize={1}>
                            {classItem.classTeacher.email}
                          </Text>
                        </Box>
                      )}
                    </Flex>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box
                p={4}
                bg="gray.50"
                sx={{
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: "gray.200",
                }}
              >
                <Text color="gray.600" textAlign="center">
                  No classes are currently enrolled in this course.
                </Text>
              </Box>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
