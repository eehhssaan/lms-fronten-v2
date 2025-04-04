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
} from "@/lib/api";
import { Course } from "@/types";
import ConfirmDialog from "@/components/ConfirmDialog";
import Notification from "@/components/Notification";
import CourseAssignment from "@/components/CourseAssignment";

interface Student {
  _id: string;
  name: string;
  email: string;
}

interface AvailableStudent {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface Class {
  _id: string;
  name: string;
  code: string;
  academicYear: string;
  department?: string;
  gradeLevel?: string;
  description?: string;
  students: Student[];
  classTeacher: {
    _id: string;
    name: string;
    email: string;
  };
  courses?: Course[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function ClassDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [classDetails, setClassDetails] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false);
  const [showAssignCourseDialog, setShowAssignCourseDialog] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editedClass, setEditedClass] = useState<Partial<Class>>({});
  const [availableStudents, setAvailableStudents] = useState<
    AvailableStudent[]
  >([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth");
      return;
    }

    if (user && user.role !== "teacher" && user.role !== "admin") {
      router.push("/courses");
      return;
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get class details
        const classData = await getClass(params.id);
        setClassDetails(classData);

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

    if (isAuthenticated && params.id) {
      fetchClassDetails();
    }
  }, [isAuthenticated, params.id]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "student") {
      setSelectedStudents((prev) => {
        if (prev.includes(value)) {
          return prev.filter((id) => id !== value);
        } else {
          return [...prev, value];
        }
      });
    } else {
      setEditedClass((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleEditClass = async () => {
    if (!editedClass.name?.trim()) {
      setError("Class name is required");
      return;
    }

    if (!editedClass.code?.trim()) {
      setError("Class code is required");
      return;
    }

    if (!editedClass.academicYear?.trim()) {
      setError("Academic year is required");
      return;
    }

    try {
      setEditLoading(true);
      setError(null);

      const updatedClassData = {
        ...editedClass,
        name: editedClass.name.trim(),
        code: editedClass.code.trim(),
        academicYear: editedClass.academicYear.trim(),
        department: editedClass.department?.trim() || undefined,
        gradeLevel: editedClass.gradeLevel?.trim() || undefined,
        description: editedClass.description?.trim() || undefined,
      };

      // We'll add the API call here after adding the updateClass function to api.ts
      const response = await updateClass(params.id, updatedClassData);
      setClassDetails(response);
      setNotification({
        message: "Class updated successfully!",
        type: "success",
      });
      setShowEditDialog(false);
    } catch (err: any) {
      console.error("Failed to update class:", err);
      setError(err.message || "Failed to update class");
      setNotification({
        message: err.message || "Failed to update class",
        type: "error",
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleAddStudents = async () => {
    if (!selectedStudents.length || !params.id) return;

    try {
      // Add all selected students
      await addStudentsToClass(params.id, selectedStudents);

      // Refresh class details to get updated student list
      const updatedClass = await getClass(params.id);
      setClassDetails(updatedClass);

      setNotification({
        message: `Successfully added ${selectedStudents.length} student${
          selectedStudents.length > 1 ? "s" : ""
        }!`,
        type: "success",
      });
      setShowAddStudentDialog(false);
      setSelectedStudents([]);
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
      setClassDetails(updatedClass);

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
      setAvailableStudents(students);
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
        setAvailableStudents(students);
      } catch (err: any) {
        console.error("Failed to fetch available students:", err);
        setNotification({
          message: err.message || "Failed to load available students",
          type: "error",
        });
      }
    };

    if (showAddStudentDialog) {
      fetchAvailableStudents();
    }
  }, [showAddStudentDialog, params.id]);

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  // Add handler for course assignment success
  const handleCourseAssignmentSuccess = async () => {
    try {
      // Refresh class details
      const updatedClass = await getClass(params.id);
      setClassDetails(updatedClass);

      setNotification({
        message: "Courses assigned successfully!",
        type: "success",
      });
    } catch (err: any) {
      console.error("Failed to refresh class details:", err);
      setNotification({
        message: err.message || "Failed to refresh class details",
        type: "error",
      });
    }
  };

  if (authLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Box className="container" py={4}>
        <ErrorMessage message={error} />
        <Button
          variant="secondary"
          onClick={() => router.push("/classes")}
          sx={{ mt: 3 }}
        >
          Back to Classes
        </Button>
      </Box>
    );
  }

  if (!classDetails) {
    return (
      <Box className="container" py={4}>
        <Text>Class not found</Text>
        <Button
          variant="secondary"
          onClick={() => router.push("/classes")}
          sx={{ mt: 3 }}
        >
          Back to Classes
        </Button>
      </Box>
    );
  }

  return (
    <Box as="div" className="container" py={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Heading as="h1" mb={2}>
            {classDetails.name}
          </Heading>
          <Text color="gray" fontSize={2}>
            Code: {classDetails.code}
          </Text>
          <Text>Academic Year: {classDetails.academicYear}</Text>
          {classDetails.department && (
            <Text>Department: {classDetails.department}</Text>
          )}
          {classDetails.gradeLevel && (
            <Text>Grade Level: {classDetails.gradeLevel}</Text>
          )}
          {classDetails.description && (
            <Text>Description: {classDetails.description}</Text>
          )}
          <Text>
            Teacher: {classDetails.classTeacher.name} (
            {classDetails.classTeacher.email})
          </Text>
        </Box>
        <Flex>
          <Button
            variant="primary"
            onClick={() => setShowEditDialog(true)}
            sx={{ mr: 2 }}
          >
            Edit Class
          </Button>
          <Button variant="secondary" onClick={() => router.push("/classes")}>
            Back to Classes
          </Button>
        </Flex>
      </Flex>

      <Box className="card" p={4} mb={4}>
        <Box mb={4}>
          <Heading as="h2" fontSize={3} mb={3}>
            Class Information
          </Heading>
          <Box mb={3}>
            <Text fontWeight="bold">Status</Text>
            <Text>{classDetails.isActive ? "Active" : "Inactive"}</Text>
          </Box>
        </Box>

        <Box>
          <Flex justifyContent="space-between" alignItems="center" mb={3}>
            <Heading as="h2" fontSize={3}>
              Students ({classDetails.students.length})
            </Heading>
            <Button
              variant="primary"
              onClick={() => setShowAddStudentDialog(true)}
            >
              Add Student
            </Button>
          </Flex>

          {classDetails.students.length === 0 ? (
            <Text color="gray">No students enrolled yet</Text>
          ) : (
            <Box>
              {classDetails.students.map((student) => (
                <Box
                  key={student._id}
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
                      <Text fontWeight="bold">{student.name}</Text>
                      <Text fontSize={1} color="gray">
                        {student.email}
                      </Text>
                    </Box>
                    <Button
                      variant="secondary"
                      sx={{ color: "red" }}
                      onClick={() => handleRemoveStudent(student._id)}
                    >
                      Remove
                    </Button>
                  </Flex>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        <Box mt={4}>
          <Flex justifyContent="space-between" alignItems="center" mb={3}>
            <Heading as="h2" fontSize={3}>
              Assigned Courses
            </Heading>
            <Button
              variant="primary"
              onClick={() => setShowAssignCourseDialog(true)}
            >
              Assign Courses
            </Button>
          </Flex>

          {classDetails.courses?.length === 0 ? (
            <Text color="gray">No courses assigned yet</Text>
          ) : (
            <Box>
              {classDetails.courses?.map((course) => (
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
                          Teacher: {course.teacher.firstName}{" "}
                          {course.teacher.lastName}
                        </Text>
                      )}
                    </Box>
                  </Flex>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Course Assignment Dialog */}
        {showAssignCourseDialog && (
          <CourseAssignment
            classId={params.id}
            assignedCourses={classDetails.courses || []}
            onSuccess={() => {
              setShowAssignCourseDialog(false);
              handleCourseAssignmentSuccess();
            }}
            onCancel={() => setShowAssignCourseDialog(false)}
          />
        )}
      </Box>

      {/* Edit Class Dialog */}
      <ConfirmDialog
        isOpen={showEditDialog}
        title="Edit Class"
        message={
          <Box>
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

            <Box>
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
          </Box>
        }
        confirmLabel={editLoading ? "Updating..." : "Update"}
        cancelLabel="Cancel"
        onConfirm={handleEditClass}
        onCancel={() => {
          setShowEditDialog(false);
          // Reset editedClass to current values
          if (classDetails) {
            setEditedClass({
              name: classDetails.name,
              code: classDetails.code,
              academicYear: classDetails.academicYear,
              department: classDetails.department || "",
              gradeLevel: classDetails.gradeLevel || "",
              description: classDetails.description || "",
            });
          }
        }}
        isLoading={editLoading}
      />

      {/* Add Student Dialog */}
      <ConfirmDialog
        isOpen={showAddStudentDialog}
        title="Add Students to Class"
        message={
          <Box>
            <Text fontWeight="bold" mb={3}>
              Select Students to Add
            </Text>
            <Box sx={{ maxHeight: "400px", overflowY: "auto" }}>
              {availableStudents.map((student) => (
                <Box
                  key={student._id}
                  p={3}
                  mb={2}
                  sx={{
                    border: "1px solid",
                    borderColor: "gray.2",
                    borderRadius: 2,
                    cursor: "pointer",
                    bg: selectedStudents.includes(student._id)
                      ? "gray.0"
                      : "white",
                    "&:hover": {
                      bg: "gray.0",
                    },
                  }}
                  onClick={() => handleStudentSelect(student._id)}
                >
                  <Flex alignItems="center">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student._id)}
                      onChange={() => handleStudentSelect(student._id)}
                      style={{ marginRight: "12px" }}
                    />
                    <Box>
                      <Text fontWeight="bold">
                        {student.firstName} {student.lastName}
                      </Text>
                      <Text fontSize={1} color="gray">
                        {student.email}
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              ))}
            </Box>
            <Box mt={3}>
              <Text>
                Selected: {selectedStudents.length} student
                {selectedStudents.length !== 1 ? "s" : ""}
              </Text>
            </Box>
          </Box>
        }
        confirmLabel={editLoading ? "Adding..." : "Add Selected Students"}
        cancelLabel="Cancel"
        onConfirm={handleAddStudents}
        onCancel={() => {
          setShowAddStudentDialog(false);
          setSelectedStudents([]);
        }}
        isLoading={editLoading}
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
