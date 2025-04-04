"use client";

import { useEffect, useState } from "react";
import { Box, Heading, Text, Flex } from "rebass";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import Button from "@/components/Button";
import { createClass, getClasses } from "@/lib/api";
import ConfirmDialog from "@/components/ConfirmDialog";
import Notification from "@/components/Notification";

interface Class {
  _id: string;
  name: string;
  code: string;
  academicYear: string;
  department?: string;
  gradeLevel?: string;
  description?: string;
  students?: string[];
  classTeacher: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function ClassesPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newClass, setNewClass] = useState({
    name: "",
    code: "",
    academicYear: new Date().getFullYear().toString(),
    department: "",
    gradeLevel: "",
    description: "",
  });
  const [createLoading, setCreateLoading] = useState(false);
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

  // Only teachers and admins can access this page
  if (user && user.role !== "teacher" && user.role !== "admin") {
    router.push("/courses");
    return null;
  }

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getClasses();
        setClasses(response.data);
      } catch (err: any) {
        console.error("Failed to fetch classes:", err);
        setError(err.message || "Failed to load classes");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchClasses();
    }
  }, [isAuthenticated]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewClass((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateClass = async () => {
    if (!newClass.name.trim()) {
      setError("Class name is required");
      return;
    }

    if (!newClass.code.trim()) {
      setError("Class code is required");
      return;
    }

    if (!newClass.academicYear.trim()) {
      setError("Academic year is required");
      return;
    }

    try {
      setCreateLoading(true);
      setError(null);

      const classData = {
        ...newClass,
        name: newClass.name.trim(),
        code: newClass.code.trim(),
        academicYear: newClass.academicYear.trim(),
        department: newClass.department.trim() || undefined,
        gradeLevel: newClass.gradeLevel.trim() || undefined,
        description: newClass.description.trim() || undefined,
        classTeacher: user?._id,
      };

      const response = await createClass(classData);
      setClasses((prev) => [...prev, response]);
      setNotification({
        message: "Class created successfully!",
        type: "success",
      });
      setNewClass({
        name: "",
        code: "",
        academicYear: new Date().getFullYear().toString(),
        department: "",
        gradeLevel: "",
        description: "",
      });
      setShowCreateDialog(false);
    } catch (err: any) {
      console.error("Failed to create class:", err);
      setError(err.message || "Failed to create class");
      setNotification({
        message: err.message || "Failed to create class",
        type: "error",
      });
    } finally {
      setCreateLoading(false);
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
      <Flex
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        bg="lightGray"
      >
        <Heading as="h1">Classes</Heading>
        <Button onClick={() => setShowCreateDialog(true)} variant="primary">
          Create Class
        </Button>
      </Flex>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : classes.length === 0 ? (
        <Box p={4} bg="lightGray" borderRadius="default" textAlign="center">
          <Heading as="h3" fontSize={3} mb={3}>
            No classes available
          </Heading>
          <Text color="secondary">
            Click the "Create Class" button to create your first class.
          </Text>
        </Box>
      ) : (
        <Box>
          {classes.map((cls) => (
            <Box
              key={cls._id}
              className="card"
              mb={3}
              p={3}
              onClick={() => router.push(`/classes/${cls._id}`)}
              sx={{
                cursor: "pointer",
                "&:hover": {
                  transform: "translateY(-2px)",
                  transition: "transform 0.2s ease-in-out",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                },
              }}
            >
              <Heading as="h3" fontSize={2}>
                {cls.name}
              </Heading>
              <Text color="gray" fontSize={1} mt={1}>
                Code: {cls.code}
              </Text>
              {cls.description && (
                <Text color="secondary" mt={2}>
                  {cls.description}
                </Text>
              )}
            </Box>
          ))}
        </Box>
      )}

      {/* Create Class Dialog */}
      <ConfirmDialog
        isOpen={showCreateDialog}
        title="Create New Class"
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
                value={newClass.name}
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
                value={newClass.code}
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
                value={newClass.academicYear}
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
                value={newClass.department}
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
                value={newClass.gradeLevel}
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
                value={newClass.description}
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
        confirmLabel={createLoading ? "Creating..." : "Create"}
        cancelLabel="Cancel"
        onConfirm={handleCreateClass}
        onCancel={() => {
          setShowCreateDialog(false);
          setNewClass({
            name: "",
            code: "",
            academicYear: new Date().getFullYear().toString(),
            department: "",
            gradeLevel: "",
            description: "",
          });
        }}
        isLoading={createLoading}
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
