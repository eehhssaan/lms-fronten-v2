import { useState } from "react";
import { Box, Heading, Text, Flex } from "rebass";
import Button from "@/components/Button";
import { Content, Chapter } from "@/types";
import ErrorMessage from "@/components/ErrorMessage";
import Loading from "@/components/Loading";
import {
  createSubjectContent,
  deleteSubjectContent,
  updateSubjectContent,
} from "@/lib/api";

interface SubjectContentManagerProps {
  subjectId: string;
  contents: Content[];
  onContentAdded: () => void;
  chapters?: Chapter[];
}

export default function SubjectContentManager({
  subjectId,
  contents,
  onContentAdded,
  chapters = [],
}: SubjectContentManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [deletingContentIds, setDeletingContentIds] = useState<string[]>([]);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [moduleNumber, setModuleNumber] = useState(1);
  const [lessonNumber, setLessonNumber] = useState<number | undefined>(
    undefined
  );
  const [order, setOrder] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<string | null>(null);
  const [chapter, setChapter] = useState<string>("");

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setFile(null);
    setModuleNumber(1);
    setLessonNumber(undefined);
    setOrder(1);
    setChapter("");
    setError(null);
  };

  const handleStartEdit = (content: Content) => {
    console.log("handleStartEdit called with content:", content);
    if (!content._id) {
      console.warn("Content _id is missing:", content);
      return;
    }
    setIsEditing(content._id);
    setTitle(content.title);
    setDescription(content.description || "");
    setModuleNumber(content.moduleNumber || 1);
    setLessonNumber(content.lessonNumber || 1);
    setOrder(content.order || 1);
    setFile(null);
    setCurrentDocument(content.link || null);
    setChapter(content.chapter || "");
    console.log("Edit mode activated for content:", content._id);
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
      if (chapter) formData.append("chapter", chapter);
      if (lessonNumber)
        formData.append("lessonNumber", lessonNumber.toString());
      if (order) formData.append("order", order.toString());

      if (!isEditing || file) {
        formData.append("type", "document");
        if (file) formData.append("file", file);
      }

      let response;
      if (isEditing) {
        response = await updateSubjectContent(subjectId, isEditing, formData);
      } else {
        response = await createSubjectContent(subjectId, formData);
      }

      onContentAdded();
      resetForm();
      if (isEditing) {
        setIsEditing(null);
      } else {
        setIsAdding(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to save content");
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

  const manualSubmit = () => {
    console.log("Manual submit triggered");
    const formData = new FormData();
    formData.append("title", title);
    if (description) formData.append("description", description);
    if (chapter) formData.append("chapter", chapter);
    if (lessonNumber) formData.append("lessonNumber", lessonNumber.toString());
    if (order) formData.append("order", order.toString());

    if (!isEditing || file) {
      formData.append("type", "document");
      if (file) formData.append("file", file);
    }

    if (isEditing) {
      console.log("Updating existing content:", {
        subjectId,
        contentId: isEditing,
        formData: Object.fromEntries(formData.entries()),
      });

      updateSubjectContent(subjectId, isEditing, formData)
        .then((response) => {
          console.log("Update successful:", response);
          onContentAdded();
          resetForm();
          setIsEditing(null);
        })
        .catch((error) => {
          console.error("Update failed:", error);
          setError(error.message || "Failed to update content");
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    } else {
      console.log("Creating new content");
      createSubjectContent(subjectId, formData)
        .then((response) => {
          console.log("Create successful:", response);
          onContentAdded();
          resetForm();
          setIsAdding(false);
        })
        .catch((error) => {
          console.error("Create failed:", error);
          setError(error.message || "Failed to create content");
        })
        .finally(() => {
          setIsSubmitting(false);
        });
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
            .map((content) => {
              console.log("Rendering content item:", content);
              return (
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
                    <Flex gap={2}>
                      <Button
                        onClick={() => {
                          console.log(
                            "Edit button clicked for content:",
                            content
                          );
                          handleStartEdit(content);
                        }}
                        variant="secondary"
                        size="small"
                        disabled={deletingContentIds.includes(content._id)}
                      >
                        Edit
                      </Button>
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
              );
            })}

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

      {(isAdding || isEditing) && (
        <Box
          className="card"
          mb={4}
          bg="white"
          p={4}
          sx={{ boxShadow: "sm", border: "1px solid", borderColor: "gray.200" }}
        >
          <Heading as="h4" fontSize={2} mb={3}>
            {isEditing ? "Edit Subject Material" : "Add Subject Material"}
          </Heading>

          <form onSubmit={handleSubmit}>
            <div>
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
                  Description
                </Text>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea"
                  placeholder="Enter material description"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ddd",
                    fontSize: "16px",
                    minHeight: "100px",
                  }}
                />
              </Box>

              <Box mb={4}>
                <Text as="label" display="block" mb={2} fontWeight="bold">
                  Chapter
                </Text>
                <select
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  className="form-select"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ddd",
                    fontSize: "16px",
                  }}
                >
                  <option value="">Select a chapter</option>
                  {chapters.map((chapter) => (
                    <option key={chapter._id} value={chapter._id}>
                      {chapter.title}
                    </option>
                  ))}
                </select>
              </Box>

              {chapter && (
                <Box mb={4}>
                  <Text as="label" display="block" mb={2} fontWeight="bold">
                    Lesson Number
                  </Text>
                  <input
                    type="number"
                    value={lessonNumber || ""}
                    onChange={(e) =>
                      setLessonNumber(parseInt(e.target.value) || undefined)
                    }
                    min={1}
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
              )}

              <Flex mb={4} gap={4}>
                <Box flex={1}>
                  <Text as="label" display="block" mb={2} fontWeight="bold">
                    Module Number{" "}
                    <Box as="span" color="red" display="inline">
                      *
                    </Box>
                  </Text>
                  <input
                    type="number"
                    value={moduleNumber}
                    onChange={(e) => setModuleNumber(parseInt(e.target.value))}
                    required
                    min={1}
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

                <Box flex={1}>
                  <Text as="label" display="block" mb={2} fontWeight="bold">
                    Order{" "}
                    <Box as="span" color="red" display="inline">
                      *
                    </Box>
                  </Text>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value))}
                    required
                    min={1}
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

              {!isEditing && (
                <Box mb={4}>
                  <Text as="label" display="block" mb={2} fontWeight="bold">
                    File{" "}
                    <Box as="span" color="red" display="inline">
                      *
                    </Box>
                  </Text>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    required={!isEditing}
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
              )}

              {isEditing && (
                <Box mb={4}>
                  <Text as="label" display="block" mb={2} fontWeight="bold">
                    Current Document
                  </Text>
                  {currentDocument ? (
                    <Flex alignItems="center" gap={3}>
                      <a
                        href={currentDocument}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#007bff",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                        >
                          <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z" />
                        </svg>
                        View Current Document
                      </a>
                    </Flex>
                  ) : (
                    <Text color="gray.500">No document currently attached</Text>
                  )}

                  <Box mt={3}>
                    <Text as="label" display="block" mb={2} fontWeight="bold">
                      Upload New Document (Optional)
                    </Text>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="form-input"
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "6px",
                        border: "1px solid #ddd",
                        fontSize: "16px",
                      }}
                    />
                    {file && (
                      <Text fontSize="sm" color="gray.600" mt={2}>
                        New file selected: {file.name}
                      </Text>
                    )}
                  </Box>
                </Box>
              )}

              {error && (
                <Box mb={4} p={3} bg="red.50" color="red.600" borderRadius="md">
                  {error}
                </Box>
              )}

              <Flex gap={2} justifyContent="flex-end">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={isEditing ? handleCancelEdit : handleCancel}
                  disabled={isSubmitting}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                    background: "#f8f9fa",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "4px",
                    border: "none",
                    background: "#007bff",
                    color: "white",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                  }}
                  onClick={() => {
                    console.log("Manual submit button clicked");
                    setIsSubmitting(true);
                    manualSubmit();
                  }}
                >
                  {isSubmitting
                    ? "Saving..."
                    : isEditing
                    ? "Save Changes"
                    : "Add Material"}
                </button>
              </Flex>
            </div>
          </form>
        </Box>
      )}
    </Box>
  );
}
