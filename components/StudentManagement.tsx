import { useState } from "react";
import { Box, Heading, Text, Flex } from "rebass";
import Button from "@/components/Button";
import { User } from "@/types";
import ErrorMessage from "@/components/ErrorMessage";
import Loading from "@/components/Loading";
import ConfirmDialog from "@/components/ConfirmDialog";

interface StudentManagementProps {
  classId: string;
  currentStudents: User[];
  availableStudents: User[];
  onAddStudents: (studentIds: string[]) => void;
  onRemoveStudent: (studentId: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function StudentManagement({
  classId,
  currentStudents,
  availableStudents,
  onAddStudents,
  onRemoveStudent,
  isLoading,
  error,
}: StudentManagementProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAddStudents = () => {
    onAddStudents(selectedStudents);
    setSelectedStudents([]);
    setShowAddDialog(false);
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  {
    console.log("availableStudents", availableStudents);
  }

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={3}>
        <Heading as="h3" fontSize={2}>
          Students
        </Heading>
        <Button
          onClick={() => setShowAddDialog(true)}
          variant="primary"
          size="small"
        >
          Add Students1
        </Button>
      </Flex>

      {/* Current Students List */}
      <Box mb={4}>
        {currentStudents.length > 0 ? (
          currentStudents.map((student) => (
            <Flex
              key={student._id}
              p={2}
              mb={2}
              bg="white"
              sx={{
                borderRadius: "4px",
                border: "1px solid",
                borderColor: "gray.2",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Text fontWeight="bold">{student.name}</Text>
                <Text fontSize={1} color="gray.6">
                  {student.email}
                </Text>
              </Box>
              <Button
                onClick={() => onRemoveStudent(student._id)}
                variant="secondary"
                size="small"
                sx={{ ml: 2 }}
              >
                Remove
              </Button>
            </Flex>
          ))
        ) : (
          <Text color="gray.6">No students enrolled yet</Text>
        )}
      </Box>

      {/* Add Students Dialog */}
      <ConfirmDialog
        isOpen={showAddDialog}
        title="Add Students2"
        message={
          <Box sx={{ maxHeight: "400px", overflowY: "auto" }}>
            {availableStudents.map((student) => (
              <Flex
                key={student._id}
                p={2}
                mb={2}
                sx={{
                  borderRadius: "4px",
                  border: "1px solid",
                  borderColor: "gray.2",
                  alignItems: "center",
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
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student._id)}
                  onChange={() => handleStudentSelect(student._id)}
                  style={{ marginRight: "12px" }}
                />
                <Box>
                  <Text fontWeight="bold">{student.name}</Text>
                  <Text fontSize={1} color="gray.6">
                    {student.email}
                  </Text>
                </Box>
              </Flex>
            ))}
          </Box>
        }
        confirmLabel="Add Selected"
        cancelLabel="Cancel"
        onConfirm={handleAddStudents}
        onCancel={() => {
          setShowAddDialog(false);
          setSelectedStudents([]);
        }}
      />
    </Box>
  );
}
