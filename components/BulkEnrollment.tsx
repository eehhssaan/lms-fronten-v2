import { useState, useEffect } from "react";
import { Box, Heading, Text } from "rebass";
import Button from "@/components/Button";
import { enrollClassInCourse, getAvailableClasses } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ConfirmDialog from "@/components/ConfirmDialog";
import Notification from "@/components/Notification";
import Loading from "@/components/Loading";

interface BulkEnrollmentProps {
  courseId: string;
  onSuccess?: () => void;
}

interface Class {
  _id: string;
  name: string;
  formLevel?: "Form 4" | "Form 5" | "Form 6" | "AS" | "A2";
}

export default function BulkEnrollment({
  courseId,
  onSuccess,
}: BulkEnrollmentProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [classError, setClassError] = useState<string | null>(null);

  // Only show this component for teachers and admins
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return null;
  }

  // Fetch available classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoadingClasses(true);
        setClassError(null);
        const availableClasses = await getAvailableClasses();
        setClasses(availableClasses);
      } catch (err: any) {
        console.error("Failed to fetch classes:", err);
        setClassError(err.message || "Failed to load available classes");
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, []);

  const handleEnrollClass = async () => {
    if (!selectedClassId) {
      setError("Please select a class to enroll");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await enrollClassInCourse(courseId, selectedClassId);

      setNotification({
        message: "Successfully enrolled the class in the course!",
        type: "success",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error("Failed to enroll class:", err);
      setError(err.message || "Failed to enroll class. Please try again.");
      setNotification({
        message: err.message || "Failed to enroll class. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  };

  return (
    <Box className="card" mt={3}>
      <Heading as="h3" fontSize={2} mb={3}>
        Bulk Enrollment
      </Heading>

      <Box mb={3}>
        <Text fontSize={1} mb={2}>
          Select a class to enroll all its students in this course:
        </Text>

        {loadingClasses ? (
          <Loading />
        ) : classError ? (
          <Text color="red" fontSize={1}>
            {classError}
          </Text>
        ) : (
          <>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                marginBottom: "8px",
              }}
            >
              <option value="">Select a class...</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>

            <Button
              onClick={() => setShowConfirmDialog(true)}
              variant="primary"
              fullWidth
              disabled={loading || !selectedClassId}
            >
              {loading ? "Processing..." : "Enroll Class"}
            </Button>

            {error && (
              <Text color="red" fontSize={1} mt={2}>
                {error}
              </Text>
            )}
          </>
        )}
      </Box>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Enroll Class"
        message={`Are you sure you want to enroll all students from the selected class in this course? This action cannot be undone.`}
        confirmLabel="Enroll Class"
        cancelLabel="Cancel"
        onConfirm={handleEnrollClass}
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
