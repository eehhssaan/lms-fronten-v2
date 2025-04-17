import { useState, useEffect } from "react";
import { Box, Heading, Text, Flex } from "rebass";
import Button from "@/components/Button";
import { assignCourseToClass, getCourses } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ConfirmDialog from "@/components/ConfirmDialog";
import Notification from "@/components/Notification";
import Loading from "@/components/Loading";
import { Course as APICourse } from "@/types";
import ErrorMessage from "@/components/ErrorMessage";

interface CourseAssignmentProps {
  classId: string;
  assignedCourses: APICourse[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CourseAssignment({
  classId,
  assignedCourses,
  onSuccess,
  onCancel,
}: CourseAssignmentProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [courses, setCourses] = useState<(APICourse & { _id: string })[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  // Only show this component for teachers and admins
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return null;
  }

  // Fetch available courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        setCoursesError(null);
        const response = await getCourses();

        // Filter out already assigned courses and courses without IDs
        const availableCourses = response.data
          .filter((course): course is APICourse & { _id: string } =>
            Boolean(course._id)
          )
          .filter(
            (course) =>
              !assignedCourses.some((assigned) => assigned._id === course._id)
          );

        setCourses(availableCourses);
      } catch (err: any) {
        console.error("Failed to fetch courses:", err);
        setCoursesError(err.message || "Failed to load available courses");
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [assignedCourses]);

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourses((prev) => {
      if (prev.includes(courseId)) {
        return prev.filter((id) => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const handleAssignCourses = async () => {
    if (selectedCourses.length === 0) {
      setError("Please select at least one course to assign");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Assign each selected course to the class
      for (const courseId of selectedCourses) {
        await assignCourseToClass(classId, courseId);
      }

      setNotification({
        message: `Successfully assigned ${selectedCourses.length} course${
          selectedCourses.length > 1 ? "s" : ""
        } to the class!`,
        type: "success",
      });

      // Clear selections
      setSelectedCourses([]);

      // Close the dialog and refresh the parent view
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error("Failed to assign courses:", err);
      setError(err.message || "Failed to assign courses. Please try again.");
      setNotification({
        message: err.message || "Failed to assign courses. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <Box className="card" mt={3}>
      <Flex justifyContent="space-between" alignItems="center" mb={3}>
        <Heading as="h3" fontSize={2}>
          Course Assignment
        </Heading>
        <Button variant="secondary" onClick={onCancel}>
          Close
        </Button>
      </Flex>

      {error && <ErrorMessage message={error} />}

      <Box mb={3}>
        <Text fontSize={1} mb={2}>
          Select courses to assign to this class. All students in the class will
          be automatically enrolled in these courses.
        </Text>

        {loadingCourses ? (
          <Loading />
        ) : coursesError ? (
          <Text color="red" fontSize={1}>
            {coursesError}
          </Text>
        ) : (
          <>
            <Box sx={{ maxHeight: "400px", overflowY: "auto" }}>
              {courses.map((course) => (
                <Box
                  key={course._id}
                  p={3}
                  mb={2}
                  sx={{
                    border: "1px solid",
                    borderColor: "gray.2",
                    borderRadius: 2,
                    cursor: "pointer",
                    bg: selectedCourses.includes(course._id)
                      ? "gray.0"
                      : "white",
                    "&:hover": {
                      bg: "gray.0",
                    },
                  }}
                  onClick={() => handleCourseSelect(course._id)}
                >
                  <Flex alignItems="center">
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(course._id)}
                      onChange={() => handleCourseSelect(course._id)}
                      style={{ marginRight: "12px" }}
                    />
                    <Box>
                      <Text fontWeight="bold">{course.title}</Text>
                      <Text fontSize={1} color="gray">
                        {course.code} - {course.subject} (Grade {course.grade})
                      </Text>
                      {course.teacher && (
                        <Text fontSize={1} color="gray">
                          Teacher: {course.teacher.name}
                        </Text>
                      )}
                    </Box>
                  </Flex>
                </Box>
              ))}
            </Box>

            <Box mt={3}>
              <Text>
                Selected: {selectedCourses.length} course
                {selectedCourses.length !== 1 ? "s" : ""}
              </Text>
            </Box>

            <Button
              onClick={() => setShowConfirmDialog(true)}
              variant="primary"
              fullWidth
              disabled={loading || selectedCourses.length === 0}
              sx={{ mt: 3 }}
            >
              {loading ? "Processing..." : "Assign Selected Courses"}
            </Button>
          </>
        )}
      </Box>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Assign Courses"
        message={`Are you sure you want to assign ${
          selectedCourses.length
        } course${
          selectedCourses.length !== 1 ? "s" : ""
        } to this class? All students in the class will be enrolled in these courses.`}
        confirmLabel="Assign Courses"
        cancelLabel="Cancel"
        onConfirm={handleAssignCourses}
        onCancel={() => setShowConfirmDialog(false)}
        isLoading={loading}
      />

      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </Box>
  );
}
