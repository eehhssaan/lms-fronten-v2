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

    if (isAuthenticated) {
      fetchClasses();
    }
  }, [isAuthenticated]);

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

      const classData: CreateClassData = {
        name: newClass.name.trim(),
        code: newClass.code.trim(),
        formLevel: newClass.formLevel,
        academicYear: newClass.academicYear.trim(),
        department: newClass.department || undefined,
        description: newClass.description || undefined,
        classTeacher: user._id,
      };

      const response = await createClass(classData);
      if (response.success) {
        setNotification({
          message: "Class created successfully",
          type: "success",
        });
        setShowCreateDialog(false);
        fetchClasses();
      }
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

  if (!isAuthenticated) {
    return null; // Will redirect to auth page
  }

  return (
    <Box
      as="div"
      sx={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%)",
      }}
    >
      <Box
        className="container"
        py={4}
        px={[3, 4]}
        sx={{
          margin: "0 auto",
        }}
      >
        <Flex justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Heading as="h1">Classes</Heading>
            <Text color="gray.600" fontSize={1} mt={1}>
              {user?.role === "admin"
                ? "Manage all classes in the system"
                : "Manage your assigned classes"}
            </Text>
          </Box>
          <Button onClick={() => setShowCreateDialog(true)} variant="primary">
            Create Class
          </Button>
        </Flex>

        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : classes.length === 0 ? (
          <Box
            p={4}
            bg="white"
            sx={{
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
            <Heading as="h3" fontSize={3} mb={3}>
              No classes available
            </Heading>
            <Text color="secondary">
              Click the "Create Class" button to create your first class.
            </Text>
          </Box>
        ) : (
          <>
            <ClassList classes={paginatedClasses} />

            {/* Pagination controls */}
            {totalPages > 1 && (
              <Flex justifyContent="center" mt={4}>
                <Box
                  as="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  sx={{
                    px: 3,
                    py: 2,
                    mx: 1,
                    bg: currentPage === 1 ? "gray.2" : "primary",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    "&:hover": {
                      bg: currentPage === 1 ? "gray.2" : "primary",
                      opacity: currentPage === 1 ? 1 : 0.8,
                    },
                  }}
                >
                  Previous
                </Box>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Box
                      key={page}
                      as="button"
                      onClick={() => handlePageChange(page)}
                      sx={{
                        px: 3,
                        py: 2,
                        mx: 1,
                        bg: currentPage === page ? "primary" : "white",
                        color: currentPage === page ? "white" : "text",
                        border: "1px solid",
                        borderColor:
                          currentPage === page ? "primary" : "gray.2",
                        borderRadius: "4px",
                        cursor: "pointer",
                        "&:hover": {
                          bg: currentPage === page ? "primary" : "gray.0",
                        },
                      }}
                    >
                      {page}
                    </Box>
                  )
                )}
                <Box
                  as="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  sx={{
                    px: 3,
                    py: 2,
                    mx: 1,
                    bg: currentPage === totalPages ? "gray.2" : "primary",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor:
                      currentPage === totalPages ? "not-allowed" : "pointer",
                    "&:hover": {
                      bg: currentPage === totalPages ? "gray.2" : "primary",
                      opacity: currentPage === totalPages ? 1 : 0.8,
                    },
                  }}
                >
                  Next
                </Box>
              </Flex>
            )}
          </>
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
                  required
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
                  required
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
                  Form Level *
                </Text>
                <select
                  name="formLevel"
                  value={newClass.formLevel}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                  }}
                >
                  <option value="">Select Form Level</option>
                  <option value="Form 4">Form 4</option>
                  <option value="Form 5">Form 5</option>
                  <option value="Form 6">Form 6</option>
                  <option value="AS">AS</option>
                  <option value="A2">A2</option>
                </select>
              </Box>

              <Box mb={3}>
                <Text fontWeight="bold" mb={2}>
                  Academic Year *{" "}
                  <Text as="span" color="red" fontSize="12px">
                    (format: YYYY-YYYY)
                  </Text>
                </Text>
                <input
                  type="text"
                  name="academicYear"
                  value={newClass.academicYear}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow numbers and hyphen
                    if (/^[\d-]*$/.test(value)) {
                      handleInputChange(e);
                    }
                  }}
                  required
                  pattern="\d{4}-\d{4}"
                  placeholder="Enter academic year (e.g., 2024-2025)"
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
          onConfirm={async () => {
            // Validate form before submitting
            if (!newClass.name.trim()) {
              setNotification({
                message: "Please add a class name",
                type: "error",
              });
              return;
            }
            if (!newClass.code.trim()) {
              setNotification({
                message: "Please add a class code",
                type: "error",
              });
              return;
            }
            if (!newClass.academicYear.trim()) {
              setNotification({
                message: "Academic year is required",
                type: "error",
              });
              return;
            }

            // If validation passes, proceed with class creation
            handleCreateClass();
          }}
          onCancel={() => {
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
    </Box>
  );
}
