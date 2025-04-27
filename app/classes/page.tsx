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
import ClassList from "@/components/ClassList";
import CreateClassForm from "@/components/CreateClassForm";

type FormLevel = "Form 4" | "Form 5" | "Form 6" | "AS" | "A2";

interface Class {
  _id: string;
  name: string;
  code: string;
  academicYear: string;
  department?: string;
  formLevel: "Form 4" | "Form 5" | "Form 6" | "AS" | "A2";
  description?: string;
  students?: any[];
  classTeacher: {
    name: string;
    _id: string;
  };
  teacher?: {
    name: string;
    _id: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NewClass {
  name: string;
  code: string;
  formLevel: FormLevel | "";
  academicYear: string;
  department: string;
  description: string;
}

interface CreateClassData {
  name: string;
  code: string;
  formLevel: FormLevel;
  academicYear: string;
  department?: string;
  description?: string;
  classTeacher: string;
}

export default function ClassesPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6; // Show 6 classes per page
  const [newClass, setNewClass] = useState<NewClass>({
    name: "",
    code: "",
    formLevel: "",
    academicYear: "",
    department: "",
    description: "",
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const router = useRouter();

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getClasses();
      // Transform the data to match our interface
      const transformedClasses = response.data.map((cls: any) => ({
        ...cls,
        classTeacher: {
          name: cls.classTeacher.name || cls.classTeacher,
          _id: cls.classTeacher._id || "",
        },
      }));
      setClasses(transformedClasses);
    } catch (err: any) {
      console.error("Failed to fetch classes:", err);
      setError(err.message || "Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (
      user &&
      user.role !== "teacher" &&
      user.role !== "admin" &&
      user.role !== "head_teacher"
    ) {
      router.push("/courses");
    }
  }, [user, router]);

  useEffect(() => {
    if (
      isAuthenticated &&
      user &&
      (user.role === "teacher" ||
        user.role === "admin" ||
        user.role === "head_teacher")
    ) {
      fetchClasses();
    }
  }, [isAuthenticated, user]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setNewClass((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateClass = async () => {
    try {
      setCreateLoading(true);

      if (!newClass.formLevel) {
        setNotification({
          message: "Please select a valid form level",
          type: "error",
        });
        setCreateLoading(false);
        return;
      }

      if (!user) {
        setNotification({
          message: "User not found",
          type: "error",
        });
        setCreateLoading(false);
        return;
      }

      const classData: CreateClassData = {
        name: newClass.name.trim(),
        code: newClass.code.trim(),
        formLevel: newClass.formLevel as FormLevel,
        academicYear: newClass.academicYear.trim(),
        department: newClass.department || undefined,
        description: newClass.description || undefined,
        classTeacher: user._id || "",
      };

      await createClass(classData);
      setNotification({
        message: "Class created successfully",
        type: "success",
      });
      setShowCreateDialog(false);
      fetchClasses();
    } catch (error: any) {
      setNotification({
        message: error.message || "Failed to create class",
        type: "error",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  // Add pagination calculation
  const paginatedClasses = classes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    // Update total pages when classes change
    setTotalPages(Math.ceil(classes.length / itemsPerPage));
  }, [classes]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (authLoading) {
    return <Loading />;
  }

  if (
    !isAuthenticated ||
    !user ||
    (user.role !== "teacher" &&
      user.role !== "admin" &&
      user.role !== "head_teacher")
  ) {
    return null; // Will redirect to auth or courses page
  }

  return (
    <Box
      as="div"
      className="container"
      py={4}
      style={{ backgroundColor: "#f0f0f0", width: "100%" }}
    >
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Heading as="h1">Classes</Heading>
          <Box as="p" color="secondary" fontSize={2} mt={2}>
            {user?.role === "admin"
              ? "Manage all classes in the system"
              : "Manage your assigned classes"}
          </Box>
        </Box>
        <Button onClick={() => setShowCreateDialog(true)} variant="primary">
          Create Class
        </Button>
      </Flex>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Loading />
      ) : classes.length > 0 ? (
        <>
          <ClassList classes={paginatedClasses} />

          {/* Pagination controls */}
          <Flex justifyContent="center" mt={4}>
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              variant="secondary"
              size="small"
              sx={{ marginRight: "0.5rem" }}
            >
              Previous
            </Button>
            <Text alignSelf="center" mx={2}>
              Page {currentPage} of {totalPages}
            </Text>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
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
            No classes available
          </Heading>
          <Box as="p" color="secondary">
            Click the "Create Class" button to create your first class.
          </Box>
        </Box>
      )}

      {/* Create Class Form */}
      {showCreateDialog && (
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
          <CreateClassForm
            onClose={() => {
              setShowCreateDialog(false);
              setNewClass({
                name: "",
                code: "",
                formLevel: "",
                academicYear: "",
                department: "",
                description: "",
              });
            }}
            onSubmit={async (data) => {
              if (!data.name.trim()) {
                setNotification({
                  message: "Please add a class name",
                  type: "error",
                });
                return;
              }
              if (!data.code.trim()) {
                setNotification({
                  message: "Please add a class code",
                  type: "error",
                });
                return;
              }
              if (!data.academicYear.trim()) {
                setNotification({
                  message: "Academic year is required",
                  type: "error",
                });
                return;
              }

              try {
                setCreateLoading(true);
                if (!user) {
                  setNotification({
                    message: "User not found",
                    type: "error",
                  });
                  return;
                }

                const classData = {
                  name: data.name.trim(),
                  code: data.code.trim(),
                  formLevel: data.formLevel as FormLevel,
                  academicYear: data.academicYear.trim(),
                  department: data.department || undefined,
                  description: data.description || undefined,
                  classTeacher: user._id || "",
                };

                await createClass(classData);
                setNotification({
                  message: "Class created successfully",
                  type: "success",
                });
                setShowCreateDialog(false);
                fetchClasses();
              } catch (error: any) {
                setNotification({
                  message: error.message || "Failed to create class",
                  type: "error",
                });
              } finally {
                setCreateLoading(false);
              }
            }}
            isLoading={createLoading}
          />
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
