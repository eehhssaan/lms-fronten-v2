import { Box, Heading, Text, Flex } from "rebass";
import Button from "@/components/Button";
import { useState } from "react";

type FormLevel = "Form 4" | "Form 5" | "Form 6" | "AS" | "A2";

interface CreateClassFormProps {
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    code: string;
    formLevel: FormLevel;
    academicYear: string;
    department?: string;
    description?: string;
  }) => void;
  isLoading?: boolean;
}

export default function CreateClassForm({
  onClose,
  onSubmit,
  isLoading = false,
}: CreateClassFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    formLevel: "",
    academicYear: "",
    department: "",
    description: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as any);
  };

  return (
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
        Create New Class
      </Heading>

      <form onSubmit={handleSubmit}>
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
            value={formData.name}
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
            value={formData.code}
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
            value={formData.formLevel}
            onChange={handleInputChange}
            required
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          >
            <option value="Form 6">Form 1</option>
            <option value="Form 6">Form 2</option>
            <option value="Form 6">Form 3</option>
            <option value="Form 4">Form 4</option>
            <option value="Form 5">Form 5</option>
            <option value="Form 6">Form 6</option>
          </select>
        </Box>

        <Box mb={3}>
          <Text fontWeight="bold" mb={2}>
            Academic Year *
          </Text>
          <input
            type="text"
            name="academicYear"
            value={formData.academicYear}
            onChange={handleInputChange}
            required
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
            value={formData.department}
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

        <Box mb={4}>
          <Text fontWeight="bold" mb={2}>
            Description (Optional)
          </Text>
          <textarea
            name="description"
            value={formData.description}
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
            onClick={onClose}
            disabled={isLoading}
            type="button"
          >
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Class"}
          </Button>
        </Flex>
      </form>
    </Box>
  );
}
