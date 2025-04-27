import { useState } from "react";
import { Box, Heading, Text, Flex } from "rebass";
import Button from "@/components/Button";
import { Chapter } from "@/types";
import ErrorMessage from "@/components/ErrorMessage";
import Loading from "@/components/Loading";
import {
  createChapter,
  updateChapter,
  deleteChapter,
  bulkUploadChapters,
  getChapterTemplate,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface ChapterManagerProps {
  subjectId: string;
  chapters: Chapter[];
  onChaptersUpdated: () => void;
}

export default function ChapterManager({
  subjectId,
  chapters,
  onChaptersUpdated,
}: ChapterManagerProps) {
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [deletingChapterIds, setDeletingChapterIds] = useState<string[]>([]);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setOrder(1);
    setIsActive(true);
    setError(null);
  };

  const handleStartEdit = (chapter: Chapter) => {
    setIsEditing(chapter._id);
    setTitle(chapter.title);
    setDescription(chapter.description || "");
    setOrder(chapter.order);
    setIsActive(chapter.isActive);
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const data = {
        title,
        description,
        order,
        isActive,
      };

      if (isEditing) {
        await updateChapter(subjectId, isEditing, data);
      } else {
        await createChapter(subjectId, data);
      }

      onChaptersUpdated();
      resetForm();
      if (isEditing) {
        setIsEditing(null);
      } else {
        setIsAdding(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to save chapter");
    } finally {
      setIsSubmitting(false);
    }
  };

  const manualSubmit = () => {
    const data = {
      title,
      description,
      order,
      isActive,
    };

    setIsSubmitting(true);
    setError(null);

    if (isEditing) {
      updateChapter(subjectId, isEditing, data)
        .then(() => {
          onChaptersUpdated();
          resetForm();
          setIsEditing(null);
        })
        .catch((err) => {
          setError(err.message || "Failed to save chapter");
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    } else {
      createChapter(subjectId, data)
        .then(() => {
          onChaptersUpdated();
          resetForm();
          setIsAdding(false);
        })
        .catch((err) => {
          setError(err.message || "Failed to save chapter");
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    }
  };

  const handleDelete = async (chapterId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this chapter? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingChapterIds((prev) => [...prev, chapterId]);
    setDeleteError(null);

    try {
      await deleteChapter(subjectId, chapterId);
      onChaptersUpdated();
      setDeletingChapterIds((prev) => prev.filter((id) => id !== chapterId));
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete chapter");
      setDeletingChapterIds((prev) => prev.filter((id) => id !== chapterId));
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      await bulkUploadChapters(subjectId, file);
      onChaptersUpdated();
    } catch (err: any) {
      setError(err.message || "Failed to upload chapters");
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await getChapterTemplate(subjectId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "chapter_template.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || "Failed to download template");
    }
  };

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={3}>
        <Heading as="h3" fontSize={2}>
          Chapters
        </Heading>
        <Flex gap={2}>
          <Button
            onClick={handleDownloadTemplate}
            variant="secondary"
            size="small"
          >
            Download Template
          </Button>
          <label>
            <Button
              as="span"
              variant="secondary"
              size="small"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Bulk Upload"}
            </Button>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleBulkUpload}
              style={{ display: "none" }}
            />
          </label>
          {!isAdding && !isEditing && (
            <Button
              onClick={() => setIsAdding(true)}
              variant="primary"
              size="small"
            >
              Add Chapter
            </Button>
          )}
        </Flex>
      </Flex>

      {error && <ErrorMessage message={error} />}
      {deleteError && <ErrorMessage message={deleteError} />}

      {(isAdding || isEditing) && (
        <Box
          className="card"
          mb={4}
          bg="white"
          p={4}
          sx={{ boxShadow: "sm", border: "1px solid", borderColor: "gray.200" }}
        >
          <Heading as="h4" fontSize={2} mb={3}>
            {isEditing ? "Edit Chapter" : "Add Chapter"}
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
                placeholder="Enter chapter title"
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
                placeholder="Enter chapter description"
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

            <Box mb={4}>
              <Text as="label" display="block" mb={2} fontWeight="bold">
                Active Status
              </Text>
              <label
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <Text>Active</Text>
              </label>
            </Box>

            <Flex gap={2}>
              <Button
                type="button"
                variant="primary"
                disabled={isSubmitting}
                onClick={manualSubmit}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
            </Flex>
          </form>
        </Box>
      )}

      {console.log(chapters)}

      {chapters.length > 0 && (
        <Box>
          {chapters
            .sort((a, b) => a.order - b.order)
            .map((chapter) => (
              <Box
                key={chapter._id}
                p={4}
                mb={3}
                sx={{
                  border: "1px solid",
                  borderColor: "gray.200",
                  borderRadius: "8px",
                  bg: "white",
                  opacity: deletingChapterIds.includes(chapter._id) ? 0.7 : 1,
                  transition: "opacity 0.2s ease-in-out",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <Flex justifyContent="space-between" alignItems="flex-start">
                  <Box flex="1">
                    <Flex alignItems="center" mb={2}>
                      <Text fontWeight="bold" fontSize={3} mr={2}>
                        {chapter.title}
                      </Text>
                      <Box
                        sx={{
                          display: "inline-block",
                          px: 2,
                          py: 1,
                          borderRadius: "4px",
                          bg: chapter.isActive ? "green.100" : "red.100",
                          color: chapter.isActive ? "green.800" : "red.800",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        {chapter.isActive ? "Active" : "Inactive"}
                      </Box>
                    </Flex>

                    {chapter.description && (
                      <Text fontSize={2} color="gray.600" mb={2}>
                        {chapter.description}
                      </Text>
                    )}

                    <Flex gap={3} fontSize={1} color="gray.600">
                      <Text>
                        <strong>Order:</strong> {chapter.order}
                      </Text>
                      <Text>
                        <strong>Created By:</strong>{" "}
                        {chapter.createdBy?.name || "Unknown"}
                      </Text>
                      <Text>
                        <strong>Created:</strong>{" "}
                        {new Date(chapter.createdAt).toLocaleDateString()}
                      </Text>
                      <Text>
                        <strong>Last Updated:</strong>{" "}
                        {new Date(chapter.updatedAt).toLocaleDateString()}
                      </Text>
                    </Flex>
                  </Box>

                  <Flex gap={2}>
                    <Button
                      onClick={() => handleStartEdit(chapter)}
                      variant="secondary"
                      size="small"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(chapter._id)}
                      variant="danger"
                      size="small"
                      disabled={deletingChapterIds.includes(chapter._id)}
                    >
                      {deletingChapterIds.includes(chapter._id)
                        ? "Deleting..."
                        : "Delete"}
                    </Button>
                  </Flex>
                </Flex>
              </Box>
            ))}
        </Box>
      )}
    </Box>
  );
}
