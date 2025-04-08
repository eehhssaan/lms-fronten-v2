"use client";

import { useState, useRef } from "react";
import { Box, Heading, Text, Flex } from "rebass";
import { Label, Input } from "@rebass/forms";
import { Assignment } from "@/types";
import { createAssignment, updateAssignment } from "@/lib/api";
import Button from "./Button";
import ErrorMessage from "./ErrorMessage";
import { useAuth } from "@/context/AuthContext";

interface AssignmentFormProps {
  courseId: string;
  initialData?: Partial<Assignment>;
  onSuccess?: (assignment: Assignment) => void;
  onCancel?: () => void;
}

export default function AssignmentForm({
  courseId,
  initialData,
  onSuccess,
  onCancel,
}: AssignmentFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    instructions: initialData?.instructions || "",
    moduleNumber: initialData?.moduleNumber || 1,
    dueDate: initialData?.dueDate
      ? new Date(initialData.dueDate).toISOString().split("T")[0]
      : "",
    totalPoints: initialData?.totalPoints || 100,
    allowLateSubmissions: initialData?.allowLateSubmissions || false,
    latePenalty: initialData?.latePenalty || 0,
    isPublished:
      initialData?.isPublished !== undefined ? initialData.isPublished : true,
    rubric: initialData?.rubric || [],
  });

  const [files, setFiles] = useState<File[]>([]);
  const [rubricItem, setRubricItem] = useState({
    criterion: "",
    points: 0,
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleRubricItemChange = (field: string, value: string | number) => {
    setRubricItem((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddRubricItem = () => {
    if (rubricItem.criterion && rubricItem.points > 0) {
      setFormData((prev) => ({
        ...prev,
        rubric: [...prev.rubric, rubricItem],
      }));
      setRubricItem({ criterion: "", points: 0, description: "" });
    }
  };

  const handleRemoveRubricItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      rubric: prev.rubric.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();

      // Add basic fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "rubric") {
          // Handle rubric array properly
          if (Array.isArray(value)) {
            if (value.length > 0) {
              value.forEach((item, index) => {
                formDataToSend.append(
                  `rubric[${index}][criterion]`,
                  item.criterion
                );
                formDataToSend.append(
                  `rubric[${index}][points]`,
                  item.points.toString()
                );
                formDataToSend.append(
                  `rubric[${index}][description]`,
                  item.description
                );
              });
            }
            // Don't append anything if the array is empty - let the backend handle the default
          } else {
            console.warn("Rubric is not an array:", value);
          }
        } else {
          formDataToSend.append(key, value.toString());
        }
      });

      // Add courseId
      formDataToSend.append("courseId", courseId);

      // Add files
      files.forEach((file) => {
        formDataToSend.append("attachments", file);
      });

      const response = initialData?._id
        ? await updateAssignment(initialData._id, formDataToSend)
        : await createAssignment(formDataToSend);

      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to save assignment");
    } finally {
      setLoading(false);
    }
  };

  // Only teachers and admins can create/edit assignments
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return <Text>You are not authorized to perform this action.</Text>;
  }

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: "800px", mx: "auto" }}
    >
      <Heading as="h2" mb={4}>
        {initialData?._id ? "Edit Assignment" : "Create New Assignment"}
      </Heading>

      {error && <ErrorMessage message={error} />}

      <Box mb={3}>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </Box>

      <Box mb={3}>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          style={{
            width: "100%",
            minHeight: "100px",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ddd",
          }}
        />
      </Box>

      <Box mb={3}>
        <Label htmlFor="instructions">Instructions</Label>
        <textarea
          id="instructions"
          name="instructions"
          value={formData.instructions}
          onChange={handleChange}
          required
          style={{
            width: "100%",
            minHeight: "100px",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ddd",
          }}
        />
      </Box>

      <Flex mb={3} sx={{ gap: 3 }}>
        <Box flex={1}>
          <Label htmlFor="moduleNumber">Module Number</Label>
          <Input
            type="number"
            id="moduleNumber"
            name="moduleNumber"
            value={formData.moduleNumber}
            onChange={handleChange}
            min={1}
            required
          />
        </Box>

        <Box flex={1}>
          <Label htmlFor="totalPoints">Total Points</Label>
          <Input
            type="number"
            id="totalPoints"
            name="totalPoints"
            value={formData.totalPoints}
            onChange={handleChange}
            min={0}
            required
          />
        </Box>
      </Flex>

      <Box mb={3}>
        <Label htmlFor="dueDate">Due Date</Label>
        <Input
          type="date"
          id="dueDate"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          required
        />
      </Box>

      <Box mb={3}>
        <Label>
          <input
            type="checkbox"
            name="allowLateSubmissions"
            checked={formData.allowLateSubmissions}
            onChange={handleChange}
          />{" "}
          Allow Late Submissions
        </Label>
      </Box>

      {formData.allowLateSubmissions && (
        <Box mb={3}>
          <Label htmlFor="latePenalty">Late Penalty (%)</Label>
          <Input
            type="number"
            id="latePenalty"
            name="latePenalty"
            value={formData.latePenalty}
            onChange={handleChange}
            min={0}
            max={100}
          />
        </Box>
      )}

      <Box mb={3}>
        <Label>
          <input
            type="checkbox"
            name="isPublished"
            checked={formData.isPublished}
            onChange={handleChange}
          />{" "}
          Publish Assignment
        </Label>
      </Box>

      <Box mb={3}>
        <Label htmlFor="attachments">Attachments</Label>
        <input
          type="file"
          id="attachments"
          name="attachments"
          onChange={handleFileChange}
          multiple
          ref={fileInputRef}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ddd",
          }}
        />
      </Box>

      <Box mb={4}>
        <Heading as="h3" fontSize={2} mb={2}>
          Rubric
        </Heading>

        <Box mb={3}>
          <Flex sx={{ gap: 2 }}>
            <Box flex={2}>
              <Input
                placeholder="Criterion"
                value={rubricItem.criterion}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleRubricItemChange("criterion", e.target.value)
                }
              />
            </Box>
            <Box flex={1}>
              <Input
                type="number"
                placeholder="Points"
                value={rubricItem.points}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleRubricItemChange("points", Number(e.target.value))
                }
                min={0}
              />
            </Box>
            <Button onClick={handleAddRubricItem} variant="secondary">
              Add
            </Button>
          </Flex>
          <Input
            mt={2}
            placeholder="Description"
            value={rubricItem.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleRubricItemChange("description", e.target.value)
            }
          />
        </Box>

        {formData.rubric.map((item, index) => (
          <Flex key={index} mb={2} sx={{ gap: 2, alignItems: "center" }}>
            <Box flex={2}>
              <Text fontWeight="bold">{item.criterion}</Text>
              <Text fontSize={1} color="gray.6">
                {item.description}
              </Text>
            </Box>
            <Box flex={1}>
              <Text>{item.points} points</Text>
            </Box>
            <Button
              onClick={() => handleRemoveRubricItem(index)}
              variant="secondary"
              size="small"
            >
              Remove
            </Button>
          </Flex>
        ))}
      </Box>

      <Flex sx={{ gap: 3, justifyContent: "flex-end" }}>
        {onCancel && (
          <Button onClick={onCancel} variant="secondary">
            Cancel
          </Button>
        )}
        <Button as="button" type="submit" variant="primary" disabled={loading}>
          {loading
            ? "Saving..."
            : initialData?._id
            ? "Update Assignment"
            : "Create Assignment"}
        </Button>
      </Flex>
    </Box>
  );
}
