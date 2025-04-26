import { useState } from "react";
import { Box, Heading, Text, Flex } from "rebass";
import Button from "@/components/Button";
import { Content } from "@/types";
import ErrorMessage from "@/components/ErrorMessage";
import Loading from "@/components/Loading";
import {
  createCourseMaterial,
  updateCourseMaterial,
  deleteCourseMaterial,
} from "@/lib/api";

interface CourseContentManagerProps {
  courseId: string;
  contents: Content[];
  onContentAdded: () => void;
}

export default function CourseContentManager({
  courseId,
  contents,
  onContentAdded,
}: CourseContentManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [deletingContentIds, setDeletingContentIds] = useState<string[]>([]);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setFile(null);
    setError(null);
  };

  const handleStartEdit = (content: Content) => {
    console.log("Starting edit for content:", content);
    console.log("Current isEditing state:", isEditing);
    const contentId = content._id || content.id;
    if (!contentId) {
      console.log("Content has no valid ID");
      return;
    }
    if (content.isInherited) {
      console.log("Cannot edit inherited content");
      return;
    }
    setIsEditing(contentId);
    setTitle(content.title);
    setDescription(content.description || "");
    setFile(null);
    console.log("New isEditing state:", contentId);
  };

  const handleCancelEdit = () => {
    console.log("Canceling edit, current isEditing:", isEditing);
    setIsEditing(null);
    setTitle("");
    setDescription("");
    setFile(null);
  };

  const handleUpdate = async (
    materialId: string | undefined,
    e: React.FormEvent
  ) => {
    e.preventDefault();
    if (!materialId) {
      setError("Invalid material ID");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("title", title);
      if (description) formData.append("description", description);
      if (file) formData.append("file", file);

      await updateCourseMaterial(courseId, materialId, formData);
      onContentAdded();
      setIsEditing(null);
      resetForm();
    } catch (err: any) {
      setError(err.message || "Failed to update material");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!title.trim()) {
        throw new Error("Title is required");
      }

      if (!file) {
        throw new Error("Please select a file to upload");
      }

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("file", file);

      await createCourseMaterial(courseId, formData);
      resetForm();
      setIsAdding(false);
      onContentAdded();
    } catch (err: any) {
      setError(err.message || "Failed to add material");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (materialId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this material? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingContentIds((prev) => [...prev, materialId]);
    setDeleteError(null);

    try {
      await deleteCourseMaterial(courseId, materialId);
      onContentAdded();
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete material");
    } finally {
      setDeletingContentIds((prev) => prev.filter((id) => id !== materialId));
    }
  };

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={3}>
        <Heading as="h3" fontSize={2}>
          Course Materials
        </Heading>
        {!isAdding && !isEditing && (
          <button
            onClick={(e) => {
              console.log("Add Material button clicked");
              e.preventDefault();
              e.stopPropagation();
              setIsAdding(true);
            }}
            style={{
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              position: "relative",
              zIndex: 1000,
            }}
            type="button"
          >
            Add Material
          </button>
        )}
      </Flex>

      {contents.length > 0 && (
        <Box mb={4}>
          {contents.map((content) => (
            <Box
              key={content.id}
              p={3}
              mb={2}
              sx={{
                border: "1px solid",
                borderColor: "gray.200",
                borderRadius: "6px",
                bg: "white",
                opacity: deletingContentIds.includes(content.id) ? 0.7 : 1,
                transition: "opacity 0.2s ease-in-out",
              }}
            >
              {isEditing === content._id ? (
                <form onSubmit={(e) => handleUpdate(content._id, e)}>
                  <Box mb={3}>
                    <Text as="label" display="block" mb={2} fontWeight="bold">
                      Title{" "}
                      <Box as="span" color="red">
                        *
                      </Box>
                    </Text>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
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

                  <Box mb={3}>
                    <Text as="label" display="block" mb={2} fontWeight="bold">
                      Description
                    </Text>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="form-textarea"
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "6px",
                        border: "1px solid #ddd",
                        fontSize: "16px",
                        resize: "vertical",
                      }}
                    />
                  </Box>

                  <Box mb={3}>
                    <Text as="label" display="block" mb={2} fontWeight="bold">
                      New File (Optional)
                    </Text>
                    <input
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.mp4,.zip"
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "6px",
                        border: "1px solid #ddd",
                        fontSize: "16px",
                      }}
                    />
                  </Box>

                  <Flex justifyContent="flex-end" mt={3}>
                    <button
                      onClick={handleCancelEdit}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                        marginRight: "8px",
                      }}
                      type="button"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontSize: "14px",
                        opacity: loading ? 0.7 : 1,
                      }}
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </Flex>
                </form>
              ) : (
                <Flex justifyContent="space-between" alignItems="center">
                  <Box>
                    <Text fontWeight="bold">{content.title}</Text>
                    {content.isInherited && (
                      <Text fontSize="sm" color="gray.600">
                        Inherited from subject
                      </Text>
                    )}
                  </Box>
                  {!content.isInherited && (
                    <Flex>
                      <button
                        onClick={() => handleStartEdit(content)}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#6c757d",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "14px",
                          marginRight: "8px",
                        }}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(content.id)}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                        type="button"
                        disabled={deletingContentIds.includes(content.id)}
                      >
                        {deletingContentIds.includes(content.id)
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </Flex>
                  )}
                </Flex>
              )}
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
            Add Course Material
          </Heading>

          <form onSubmit={handleSubmit}>
            <Box mb={4}>
              <Text as="label" display="block" mb={2} fontWeight="bold">
                Title{" "}
                <Box as="span" color="red">
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
                Description
              </Text>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
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
              <Text as="label" display="block" mb={2} fontWeight="bold">
                File{" "}
                <Box as="span" color="red">
                  *
                </Box>
              </Text>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.mp4,.zip"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  fontSize: "16px",
                }}
              />
            </Box>

            {error && (
              <Box mb={3} p={2} bg="red.50" color="red.600" borderRadius="md">
                {error}
              </Box>
            )}

            <Flex justifyContent="flex-end">
              <button
                onClick={(e) => {
                  console.log("Cancel button clicked");
                  e.preventDefault();
                  setIsAdding(false);
                  resetForm();
                }}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                  marginRight: "8px",
                }}
                type="button"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Adding..." : "Add Material"}
              </button>
            </Flex>
          </form>
        </Box>
      )}
    </Box>
  );
}
