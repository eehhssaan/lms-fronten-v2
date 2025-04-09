"use client";

import { useEffect, useState } from "react";
import { Box, Heading, Text, Flex } from "rebass";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import Button from "@/components/Button";
import {
  getClass,
  updateClass,
  removeStudentFromClass,
  getAvailableStudents,
  addStudentToClass,
  addStudentsToClass,
  removeCourseFromClass,
} from "@/lib/api";
import { Course, Class } from "@/types";
import ConfirmDialog from "@/components/ConfirmDialog";
import Notification from "@/components/Notification";
import CourseAssignment from "@/components/CourseAssignment";
import StudentManagement from "@/components/StudentManagement";

interface Student {
  _id: string;
  name: string;
  email: string;
}

interface AvailableStudent {
  _id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
}

interface ClassDetailsProps {
  params: {
    id: string;
  };
}

interface EditClassData {
  name: string;
  code: string;
  academicYear: string;
  department?: string;
  gradeLevel?: string;
  description?: string;
}

export default function ClassDetails({ params }: ClassDetailsProps) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [classData, setClassData] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false);
  const [showAssignCourseDialog, setShowAssignCourseDialog] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editedClass, setEditedClass] = useState<EditClassData>({
    name: "",
    code: "",
    academicYear: "",
    department: "",
    gradeLevel: "",
    description: "",
  });
  const [availableStudents, setAvailableStudents] = useState<
    AvailableStudent[]
  >([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [showUnassignDialog, setShowUnassignDialog] = useState(false);
  const [selectedCourseToUnassign, setSelectedCourseToUnassign] =
    useState<Course | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (
      !authLoading &&
      isAuthenticated &&
      user?.role !== "teacher" &&
      user?.role !== "admin"
    ) {
      router.push("/dashboard");
      return;
    }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const classData = await getClass(params.id);
      setClassData(classData);

      // Initialize editedClass with current values
      setEditedClass({
        name: classData.name,
        code: classData.code,
        academicYear: classData.academicYear,
        department: classData.department || "",
        gradeLevel: classData.gradeLevel || "",
        description: classData.description || "",
      });
    } catch (err: any) {
      console.error("Failed to fetch class details:", err);
      setError(err.message || "Failed to load class details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && params.id) {
      fetchClassDetails();
    }
  }, [isAuthenticated, params.id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedClass((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateClass = async () => {
    try {
      setLoading(true);
      setError(null);

      const updatedClass = await updateClass(params.id, editedClass);
      setClassData(updatedClass);
      setShowEditDialog(false);
    } catch (err: any) {
      console.error("Failed to update class:", err);
      setError(err.message || "Failed to update class");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudents = async (studentIds: string[]) => {
    if (!studentIds.length || !params.id) return;

    try {
      // Add all selected students
      await addStudentsToClass(params.id, studentIds);

      // Refresh class details to get updated student list
      const updatedClass = await getClass(params.id);
      setClassData(updatedClass);

      setNotification({
        message: `Successfully added ${studentIds.length} student${
          studentIds.length > 1 ? "s" : ""
        }!`,
        type: "success",
      });
    } catch (err: any) {
      console.error("Failed to add students:", err);
      setNotification({
        message: err.message || "Failed to add students",
        type: "error",
      });
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!params.id) return;

    try {
      await removeStudentFromClass(params.id, studentId);

      // Refresh class details to get updated student list
      const updatedClass = await getClass(params.id);
      setClassData(updatedClass);

      setNotification({
        message: "Student removed successfully!",
        type: "success",
      });
    } catch (err: any) {
      console.error("Failed to remove student:", err);
      setNotification({
        message: err.message || "Failed to remove student",
        type: "error",
      });
    }
  };

  const handleShowAddStudentDialog = async () => {
    try {
      const students = await getAvailableStudents(params.id);
      setAvailableStudents(students as AvailableStudent[]);
      setShowAddStudentDialog(true);
    } catch (err: any) {
      console.error("Failed to fetch available students:", err);
      setNotification({
        message: err.message || "Failed to fetch available students",
        type: "error",
      });
    }
  };

  // Update useEffect for fetching available students
  useEffect(() => {
    const fetchAvailableStudents = async () => {
      if (!params.id) return;

      try {
        const students = await getAvailableStudents(params.id);
        setAvailableStudents(students as AvailableStudent[]);
      } catch (err: any) {
        console.error("Failed to fetch available students:", err);
        setNotification({
          message: err.message || "Failed to load available students",
          type: "error",
        });
      }
    };

    fetchAvailableStudents();
  }, [params.id]);

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleCourseAssignmentSuccess = () => {
    fetchClassDetails();
    setShowAssignCourseDialog(false);
  };

  const handleUnassignCourse = async () => {
    if (!selectedCourseToUnassign) {
      console.error("No course selected for unassignment");
      return;
    }

    try {
      console.log("Starting course unassignment...");
      console.log("Class ID:", params.id);
      console.log("Course ID:", selectedCourseToUnassign._id);

      setLoading(true);
      await removeCourseFromClass(params.id, selectedCourseToUnassign._id);

      console.log("Course unassigned successfully");

      setNotification({
        message: `Successfully unassigned ${selectedCourseToUnassign.title} from the class`,
        type: "success",
      });

      // Refresh class details
      await fetchClassDetails();
    } catch (err: any) {
      console.error("Failed to unassign course:", err);
      setNotification({
        message: err.message || "Failed to unassign course",
        type: "error",
      });
    } finally {
      setLoading(false);
      setShowUnassignDialog(false);
      setSelectedCourseToUnassign(null);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!classData) {
    return <Text>No class data found.</Text>;
  }

  return (
    <Box as="div" className="container" py={4}>
      {/* Class Details Section */}
      <Box className="card">
        <Flex justifyContent="space-between" alignItems="center" mb={3}>
          <Heading as="h2" fontSize={3}>
            {classData.name}
          </Heading>
          {(user?.role === "teacher" || user?.role === "admin") && (
            <Button variant="secondary" onClick={() => setShowEditDialog(true)}>
              Edit Class
            </Button>
          )}
        </Flex>

        <Text fontSize={2} color="gray" mb={2}>
          Code: {classData.code}
        </Text>
        <Text fontSize={2} mb={2}>
          Academic Year: {classData.academicYear}
        </Text>
        {classData.department && (
          <Text fontSize={2} mb={2}>
            Department: {classData.department}
          </Text>
        )}
        {classData.gradeLevel && (
          <Text fontSize={2} mb={2}>
            Grade Level: {classData.gradeLevel}
          </Text>
        )}
        {classData.description && (
          <Text fontSize={2} mb={2}>
            Description: {classData.description}
          </Text>
        )}
        <Text fontSize={2} mb={2}>
          Class Teacher: {classData.classTeacher.name}
        </Text>
      </Box>

      {/* Student Management Section */}
      <Box mt={4}>
        <StudentManagement
          classId={params.id}
          currentStudents={classData?.students || []}
          availableStudents={availableStudents}
          onAddStudents={handleAddStudents}
          onRemoveStudent={handleRemoveStudent}
          isLoading={loading}
          error={error}
        />
      </Box>

      {/* Courses Section */}
      <Box className="card" mt={3}>
        <Flex justifyContent="space-between" alignItems="center" mb={3}>
          <Heading as="h3" fontSize={2}>
            Assigned Courses
          </Heading>
          {(user?.role === "teacher" || user?.role === "admin") && (
            <Button
              variant="primary"
              onClick={() => setShowAssignCourseDialog(true)}
            >
              Assign Courses
            </Button>
          )}
        </Flex>

        {classData.courses && classData.courses.length > 0 ? (
          <Box>
            {classData.courses.map((course) => (
              <Box
                key={course._id}
                p={3}
                mb={2}
                sx={{
                  border: "1px solid",
                  borderColor: "gray.2",
                  borderRadius: 2,
                }}
              >
                <Flex justifyContent="space-between" alignItems="center">
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
                  {(user?.role === "teacher" || user?.role === "admin") && (
                    <Button
                      variant="secondary"
                      sx={{
                        bg: "transparent",
                        color: "red",
                        border: "1px solid red",
                        "&:hover": {
                          bg: "red",
                          color: "white",
                        },
                      }}
                      onClick={() => {
                        setSelectedCourseToUnassign(course);
                        setShowUnassignDialog(true);
                      }}
                    >
                      Unassign
                    </Button>
                  )}
                </Flex>
              </Box>
            ))}
          </Box>
        ) : (
          <Text color="gray">No courses assigned to this class yet.</Text>
        )}
      </Box>

      {/* Course Assignment Dialog */}
      {showAssignCourseDialog && (
        <CourseAssignment
          classId={params.id}
          assignedCourses={classData.courses || []}
          onSuccess={handleCourseAssignmentSuccess}
          onCancel={() => setShowAssignCourseDialog(false)}
        />
      )}

      {/* Add Unassign Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showUnassignDialog}
        title="Unassign Course"
        message={`Are you sure you want to unassign ${selectedCourseToUnassign?.title} from this class? Students will lose access to this course.`}
        confirmLabel="Unassign"
        cancelLabel="Cancel"
        onConfirm={handleUnassignCourse}
        onCancel={() => {
          setShowUnassignDialog(false);
          setSelectedCourseToUnassign(null);
        }}
        isLoading={loading}
      />

      {/* Edit Class Form */}
      {showEditDialog && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <Box
            sx={{
              backgroundColor: "white",
              padding: 4,
              borderRadius: "8px",
              width: "90%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <Heading as="h2" fontSize={3} mb={3}>
              Edit Class
            </Heading>

            <Box mb={3}>
              <Text fontWeight="bold" mb={2}>
                Class Name *{" "}
                <Text as="span" color="red" fontSize="12px">
                  (max 50 characters)
                </Text>
              </Text>
              <input
                type="text"
                name="name"
                value={editedClass.name}
                onChange={handleInputChange}
                maxLength={50}
                placeholder="Enter class name"
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
              />
            </Box>

            <Box mb={3}>
              <Text fontWeight="bold" mb={2}>
                Class Code *{" "}
                <Text as="span" color="red" fontSize="12px">
                  (max 20 characters)
                </Text>
              </Text>
              <input
                type="text"
                name="code"
                value={editedClass.code}
                onChange={handleInputChange}
                maxLength={20}
                placeholder="Enter class code (e.g., CS101-2024)"
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
              />
            </Box>

            <Box mb={3}>
              <Text fontWeight="bold" mb={2}>
                Academic Year *
              </Text>
              <input
                type="text"
                name="academicYear"
                value={editedClass.academicYear}
                onChange={handleInputChange}
                placeholder="Enter academic year (e.g., 2024)"
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
              />
            </Box>

            <Box mb={3}>
              <Text fontWeight="bold" mb={2}>
                Department (Optional)
              </Text>
              <input
                type="text"
                name="department"
                value={editedClass.department}
                onChange={handleInputChange}
                placeholder="Enter department name"
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
              />
            </Box>

            <Box mb={3}>
              <Text fontWeight="bold" mb={2}>
                Grade Level (Optional)
              </Text>
              <input
                type="text"
                name="gradeLevel"
                value={editedClass.gradeLevel}
                onChange={handleInputChange}
                placeholder="Enter grade level"
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
              />
            </Box>

            <Box mb={4}>
              <Text fontWeight="bold" mb={2}>
                Description (Optional)
              </Text>
              <textarea
                name="description"
                value={editedClass.description}
                onChange={handleInputChange}
                placeholder="Enter class description"
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  minHeight: "100px",
                }}
              />
            </Box>

            <Flex justifyContent="flex-end" gap={3}>
              <Button
                variant="secondary"
                onClick={() => setShowEditDialog(false)}
                disabled={editLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdateClass}
                disabled={editLoading}
              >
                {editLoading ? "Saving..." : "Save Changes"}
              </Button>
            </Flex>
          </Box>
        </Box>
      )}

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
