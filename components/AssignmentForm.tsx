"use client";

import { useState, useRef, FormEvent, ChangeEvent } from "react";
import { Box, Heading, Text, Flex } from "rebass";
import { Label, Input, Textarea } from "@rebass/forms";
import { Assignment } from "@/types";
import { createAssignment, updateAssignment } from "@/lib/api";
import Button from "./Button";
import ErrorMessage from "./ErrorMessage";
import { useAuth } from "@/context/AuthContext";

interface AssignmentFormProps {
  courseId: string;
  assignment?: Assignment;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AssignmentForm({
  courseId,
  assignment,
  onSuccess,
  onCancel,
}: AssignmentFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>(new FormData());
  const [title, setTitle] = useState(assignment?.title || "");
  const [description, setDescription] = useState(assignment?.description || "");
  const [instructions, setInstructions] = useState(
    assignment?.instructions || ""
  );
  const [moduleNumber, setModuleNumber] = useState(
    assignment?.moduleNumber || 1
  );
  const [dueDate, setDueDate] = useState(
    assignment?.dueDate
      ? new Date(assignment.dueDate).toISOString().split("T")[0]
      : ""
  );
  const [totalPoints, setTotalPoints] = useState(
    assignment?.totalPoints || 100
  );
  const [allowLateSubmissions, setAllowLateSubmissions] = useState(
    assignment?.allowLateSubmissions || false
  );
  const [latePenalty, setLatePenalty] = useState(assignment?.latePenalty || 0);
  const [isPublished, setIsPublished] = useState(
    assignment?.isPublished || false
  );
  const [rubric, setRubric] = useState(assignment?.rubric || []);

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
    setFormData((prev) => {
      const newFormData = new FormData(prev);
      if (type === "checkbox") {
        newFormData.append(
          name,
          (e.target as HTMLInputElement).checked.toString()
        );
      } else {
        newFormData.append(name, value);
      }
      return newFormData;
    });
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
      setRubric((prev) => [...prev, rubricItem]);
      setRubricItem({ criterion: "", points: 0, description: "" });
    }
  };

  const handleRemoveRubricItem = (index: number) => {
    setRubric((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("instructions", instructions);
      formData.append("moduleNumber", moduleNumber.toString());
      formData.append("dueDate", new Date(dueDate).toISOString());
      formData.append("totalPoints", totalPoints.toString());
      formData.append("allowLateSubmissions", allowLateSubmissions.toString());
      formData.append("latePenalty", latePenalty.toString());
      formData.append("isPublished", isPublished.toString());
      formData.append("courseId", courseId);

      // Handle rubric array properly
      if (Array.isArray(rubric)) {
        if (rubric.length > 0) {
          rubric.forEach((item, index) => {
            formData.append(`rubric[${index}][criterion]`, item.criterion);
            formData.append(`rubric[${index}][points]`, item.points.toString());
            formData.append(`rubric[${index}][description]`, item.description);
          });
        }
        // Don't append anything if the array is empty - let the backend handle the default
      } else {
        console.warn("Rubric is not an array:", rubric);
      }

      // Add files
      files.forEach((file) => {
        formData.append("attachments", file);
      });

      if (assignment) {
        await updateAssignment(assignment._id, formData);
      } else {
        await createAssignment(formData);
      }

      onSuccess();
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
        {assignment ? "Edit Assignment" : "Create New Assignment"}
      </Heading>

      {error && <ErrorMessage message={error} />}

      <Box mb={3}>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          value={title}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setTitle(e.target.value)
          }
          required
        />
      </Box>

      <Box mb={3}>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={description}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setDescription(e.target.value)
          }
          required
        />
      </Box>

      <Box mb={3}>
        <Label htmlFor="instructions">Instructions</Label>
        <Textarea
          id="instructions"
          name="instructions"
          value={instructions}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setInstructions(e.target.value)
          }
          required
        />
      </Box>

      <Flex mb={3} sx={{ gap: 3 }}>
        <Box flex={1}>
          <Label htmlFor="moduleNumber">Module Number</Label>
          <Input
            type="number"
            id="moduleNumber"
            name="moduleNumber"
            value={moduleNumber}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setModuleNumber(Number(e.target.value))
            }
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
            value={totalPoints}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setTotalPoints(Number(e.target.value))
            }
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
          value={dueDate}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setDueDate(e.target.value)
          }
          required
        />
      </Box>

      <Box mb={3}>
        <Label>
          <input
            type="checkbox"
            name="allowLateSubmissions"
            checked={allowLateSubmissions}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setAllowLateSubmissions(e.target.checked)
            }
          />{" "}
          Allow Late Submissions
        </Label>
      </Box>

      {allowLateSubmissions && (
        <Box mb={3}>
          <Label htmlFor="latePenalty">Late Submission Penalty (%)</Label>
          <Input
            type="number"
            id="latePenalty"
            name="latePenalty"
            value={latePenalty}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setLatePenalty(Number(e.target.value))
            }
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
            checked={isPublished}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setIsPublished(e.target.checked)
            }
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
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleRubricItemChange("criterion", e.target.value)
                }
              />
            </Box>
            <Box flex={1}>
              <Input
                type="number"
                placeholder="Points"
                value={rubricItem.points}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleRubricItemChange("description", e.target.value)
            }
          />
        </Box>

        {rubric.map((item, index) => (
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
        <Button onClick={onCancel} variant="secondary">
          Cancel
        </Button>
        <Button as="button" type="submit" variant="primary" disabled={loading}>
          {loading
            ? "Saving..."
            : assignment
            ? "Update Assignment"
            : "Create Assignment"}
        </Button>
      </Flex>
    </Box>
  );
}
