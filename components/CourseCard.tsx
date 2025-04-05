import { Box, Card, Heading, Text, Flex } from "rebass";
import Link from "next/link";
import { Course } from "@/types";
import { useAuth } from "@/context/AuthContext";

interface CourseCardProps {
  course: Course;
  showEnrollmentStatus?: boolean;
}

export default function CourseCard({
  course,
  showEnrollmentStatus = false,
}: CourseCardProps) {
  const { user } = useAuth();

  // Format dates
  const startDate = course.startDate
    ? new Date(course.startDate).toLocaleDateString()
    : "Not set";
  const endDate = course.endDate
    ? new Date(course.endDate).toLocaleDateString()
    : "Not set";

  // Check if the current user is enrolled in this course
  const isEnrolled =
    user && course.students
      ? course.students.some((student) => student._id === user._id)
      : false;

  return (
    <Link href={`/courses/${course._id}`} style={{ textDecoration: "none" }}>
      <Card
        sx={{
          p: 3,
          borderRadius: "4px",
          boxShadow: "small",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          cursor: "pointer",
          bg: "white",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "large",
          },
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "8px",
            bg: "primary",
            mb: 3,
            borderRadius: "2px",
          }}
        />

        <Heading as="h3" fontSize={3} mb={2}>
          {course.title}
        </Heading>

        <Text color="secondary" fontSize={1} mb={3}>
          {course.code}
        </Text>

        <Text
          sx={{
            fontSize: 2,
            mb: 3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            flexGrow: 1,
          }}
        >
          {course.description}
        </Text>

        <Box mt="auto">
          <Flex mb={1} justifyContent="space-between" alignItems="center">
            <Text fontSize={1} color="secondary">
              <Text as="span" fontWeight="bold">
                Start:
              </Text>{" "}
              {startDate}
            </Text>

            {user?.role === "student" && showEnrollmentStatus && (
              <Box
                px={2}
                py={1}
                bg={isEnrolled ? "success" : "lightgray"}
                sx={{
                  borderRadius: "999px",
                  display: "inline-block",
                  fontSize: "12px",
                  color: isEnrolled ? "white" : "text",
                  fontWeight: "bold",
                  border: isEnrolled ? "none" : "1px solid gray",
                }}
              >
                {isEnrolled ? "Enrolled" : "Not Enrolled"}
              </Box>
            )}
          </Flex>

          <Flex mb={2} justifyContent="space-between" alignItems="center">
            <Text fontSize={1} color="secondary">
              <Text as="span" fontWeight="bold">
                End:
              </Text>{" "}
              {endDate}
            </Text>

            {course.teacher && (
              <Text fontSize={1} color="secondary">
                <Text as="span" fontWeight="bold">
                  Instructor:
                </Text>{" "}
                {course.teacher.name}
              </Text>
            )}
          </Flex>

          <Flex justifyContent="space-between" alignItems="center">
            <Box
              px={2}
              py={1}
              bg={course.isActive ? "success" : "secondary"}
              sx={{
                borderRadius: "999px",
                display: "inline-block",
                fontSize: "12px",
                color: "white",
              }}
            >
              {course.isActive ? "Active" : "Inactive"}
            </Box>

            <Text fontSize={1} color="secondary">
              {course.students
                ? `${course.students.length}/${course.maxStudents} students`
                : "0/0 students"}
            </Text>
          </Flex>
        </Box>
      </Card>
    </Link>
  );
}
