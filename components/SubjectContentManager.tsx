import { useState } from "react";
import { Box, Heading, Text, Flex } from "rebass";
import Button from "@/components/Button";
import { Content } from "@/types";
import ErrorMessage from "@/components/ErrorMessage";
import Loading from "@/components/Loading";
import { createSubjectContent, deleteSubjectContent } from "@/lib/api";

interface SubjectContentManagerProps {
  subjectId: string;
  contents: Content[];
  onContentAdded: () => void;
}

export default function SubjectContentManager({
  subjectId,
  contents,
  onContentAdded,
}: SubjectContentManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [deletingContentIds, setDeletingContentIds] = useState<string[]>([]);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [moduleNumber, setModuleNumber] = useState(1);
  const [lessonNumber, setLessonNumber] = useState(1);
  const [order, setOrder] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setFile(null);
    setModuleNumber(1);
    setLessonNumber(1);
    setOrder(1);
    setError(null);
  };

  const handleStartEdit = (content: Content) => {
    if (!content._id) return;
    setIsEditing(content._id);
    setTitle(content.title);
    setDescription(content.description || "");
    setModuleNumber(content.moduleNumber || 1);
    setLessonNumber(content.lessonNumber || 1);
    setOrder(content.order || 1);
    setFile(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      if (description) formData.append("description", description);
      if (moduleNumber)
        formData.append("moduleNumber", moduleNumber.toString());
      if (lessonNumber)
        formData.append("lessonNumber", lessonNumber.toString());
      formData.append("type", "document");

      if (order) formData.append("order", order.toString());
      if (file) formData.append("file", file);

      console.log("formData", formData);

      const response = await createSubjectContent(subjectId, formData);
      console.log("Subject Content created successfully:", response);

      onContentAdded();
      resetForm();
    } catch (err: any) {
      console.error("Error creating content:", err);
      setError(err.message || "Failed to create content");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setError(null);
    resetForm();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFile(file);
  };

  const handleDelete = async (contentId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this material? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingContentIds((prev) => [...prev, contentId]);
    setDeleteError(null);

    try {
      await deleteSubjectContent(subjectId, contentId);
      onContentAdded(); // Refresh the content list
      setDeletingContentIds((prev) => prev.filter((id) => id !== contentId));
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete content");
      setDeletingContentIds((prev) => prev.filter((id) => id !== contentId));
    }
  };

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={3}>
        <Heading as="h3" fontSize={2}>
          Subject Materials
        </Heading>
        {!isAdding && !isEditing && (
          <Button
            onClick={() => {
              console.log("Add Material clicked, setting isAdding to true");
              setIsAdding(true);
            }}
            variant="primary"
            size="small"
          >
            Add Material
          </Button>
        )}
      </Flex>

      {/* Display existing contents with edit and delete buttons */}
      {contents.length > 0 && (
        <Box mb={4}>
          {contents
            .filter(
              (content): content is Content & { _id: string } =>
                content !== null && !!content._id
            )
            .map((content) => (
              <Box
                key={content._id}
                p={3}
                mb={2}
                sx={{
                  border: "1px solid",
                  borderColor: "gray.200",
                  borderRadius: "6px",
                  bg: "white",
                  opacity: deletingContentIds.includes(content._id) ? 0.7 : 1,
                  transition: "opacity 0.2s ease-in-out",
                }}
              >
                <Flex justifyContent="space-between" alignItems="center">
                  <Box>
                    <Text fontWeight="bold">{content.title}</Text>
                    <Text fontSize="sm" color="gray.600">
                      Module {content.moduleNumber}, Lesson{" "}
                      {content.lessonNumber}
                    </Text>
                  </Box>
                  <Flex>
                    <Button
                      onClick={() => handleDelete(content._id)}
                      variant="danger"
                      size="small"
                      disabled={deletingContentIds.includes(content._id)}
                    >
                      {deletingContentIds.includes(content._id)
                        ? "Deleting..."
                        : "Delete"}
                    </Button>
                  </Flex>
                </Flex>
              </Box>
            ))}

          {deleteError && (
            <Box
              mt={3}
              p={3}
              bg="red.50"
              color="red.600"
              borderRadius="md"
              fontSize="sm"
            >
              {deleteError}
            </Box>
          )}
        </Box>
      )}

      {isAdding && (
        <Box
          className="card"
          mb={4}
          bg="white"
          p={4}
          sx={{ boxShadow: "sm", border: "1px solid", borderColor: "gray.200" }}
        >
          <Heading as="h4" fontSize={2} mb={3}>
            Add Subject Material
          </Heading>

          <form onSubmit={handleSubmit}>
            <Box mb={4}>
              <Text as="label" display="block" mb={2} fontWeight="bold">
                Title{" "}
                <Box as="span" color="red" display="inline">
                  *
                </Box>
              </Text>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="form-input"
                placeholder="Enter material title"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  fontSize: "16px",
                }}
              />
            </Box>

            <Box mb={4}>
              <Text as="label" display="block" mb={2} fontWeight="bold">
                Description{" "}
                <Box as="span" color="red" display="inline">
                  *
                </Box>
              </Text>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
                className="form-textarea"
                placeholder="Enter material description"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  fontSize: "16px",
                  resize: "vertical",
                  minHeight: "100px",
                }}
              />
            </Box>

            <Box mb={4}>
              <Text
                as="label"
                htmlFor="file-upload"
                display="block"
                mb={2}
                fontWeight="bold"
              >
                File{" "}
                <Box as="span" color="red" display="inline">
                  *
                </Box>
              </Text>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  width: "100%",
                }}
              >
                <label
                  htmlFor="file-upload"
                  style={{
                    cursor: "pointer",
                    padding: "10px",
                    border: "2px dashed #ccc",
                    borderRadius: "4px",
                    textAlign: "center",
                    marginBottom: "10px",
                  }}
                >
                  {file ? file.name : "Click to select a file"}
                </label>
                <input
                  id="file-upload"
                  name="material-file"
                  type="file"
                  onChange={handleFileChange}
                  required
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.mp4,.zip"
                  aria-label="Upload subject material"
                  style={{
                    position: "absolute",
                    width: "1px",
                    height: "1px",
                    padding: 0,
                    margin: "-1px",
                    overflow: "hidden",
                    clip: "rect(0, 0, 0, 0)",
                    whiteSpace: "nowrap",
                    border: 0,
                  }}
                />
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Supported formats: PDF, Word, PowerPoint, Excel, Text, Images
                  (JPG/PNG), Video (MP4), ZIP
                </Text>
              </Box>
            </Box>

            <Flex mx={-2} flexWrap="wrap">
              <Box width={[1, 1 / 3]} px={2} mb={[3, 0]}>
                <Text as="label" display="block" mb={2} fontWeight="bold">
                  Module Number{" "}
                  <Box as="span" color="red" display="inline">
                    *
                  </Box>
                </Text>
                <input
                  type="number"
                  min="1"
                  value={moduleNumber}
                  onChange={(e) => setModuleNumber(parseInt(e.target.value))}
                  required
                  className="form-input"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ddd",
                    fontSize: "16px",
                  }}
                />
              </Box>

              <Box width={[1, 1 / 3]} px={2} mb={[3, 0]}>
                <Text as="label" display="block" mb={2} fontWeight="bold">
                  Lesson Number{" "}
                  <Box as="span" color="red" display="inline">
                    *
                  </Box>
                </Text>
                <input
                  type="number"
                  min="1"
                  value={lessonNumber}
                  onChange={(e) => setLessonNumber(parseInt(e.target.value))}
                  required
                  className="form-input"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ddd",
                    fontSize: "16px",
                  }}
                />
              </Box>

              <Box width={[1, 1 / 3]} px={2}>
                <Text as="label" display="block" mb={2} fontWeight="bold">
                  Order
                </Text>
                <input
                  type="number"
                  min="1"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value))}
                  className="form-input"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ddd",
                    fontSize: "16px",
                  }}
                />
              </Box>
            </Flex>

            {error && (
              <Box
                mt={3}
                p={3}
                bg="red.50"
                color="red.600"
                borderRadius="md"
                fontSize="sm"
              >
                {error}
              </Box>
            )}

            <Flex mt={4} justifyContent="flex-end">
              <Button
                onClick={handleCancel}
                variant="secondary"
                size="small"
                type="button"
                sx={{ mr: 2 }}
              >
                Cancel
              </Button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
                style={{
                  padding: "8px 16px",
                  fontSize: "14px",
                  borderRadius: "4px",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  opacity: isSubmitting ? 0.7 : 1,
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "1px solid #0056b3",
                }}
              >
                {isSubmitting ? "Adding..." : "Add Material"}
              </button>
            </Flex>
          </form>
        </Box>
      )}
    </Box>
  );
}
