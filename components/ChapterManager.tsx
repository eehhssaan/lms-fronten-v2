import { useState, useEffect } from "react";
import { Box, Heading, Text, Flex } from "rebass";
import Button from "@/components/Button";
import { Chapter } from "@/types";
import { Presentation } from "@/types/presentation";
import ErrorMessage from "@/components/ErrorMessage";
import Loading from "@/components/Loading";
import { Spinner } from "@/components/ui/Spinner";
import {
  createChapter,
  updateChapter,
  deleteChapter,
  bulkUploadChapters,
  getChapterTemplate,
} from "@/lib/api";
import { getPresentations, deletePresentation } from "@/lib/api/presentations";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface ChapterManagerProps {
  subjectId: string;
  chapters: Chapter[];
  onChaptersUpdated: () => void;
  canManage?: boolean;
  onCreateContent?: (chapterId: string) => void;
}

export default function ChapterManager({
  subjectId,
  chapters,
  onChaptersUpdated,
  canManage = false,
  onCreateContent,
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
  const [presentations, setPresentations] = useState<
    Record<string, Presentation[]>
  >({});
  const [loadingPresentations, setLoadingPresentations] = useState(false);
  const router = useRouter();

  // Fetch presentations for each chapter
  useEffect(() => {
    const fetchPresentations = async () => {
      setLoadingPresentations(true);
      try {
        const allPresentations = await getPresentations();
        console.log("allPresentations", allPresentations);
        // Group presentations by chapter
        const presentationsByChapter = allPresentations.reduce(
          (acc: Record<string, Presentation[]>, presentation) => {
            if (presentation.chapterId) {
              if (!acc[presentation.chapterId]) {
                acc[presentation.chapterId] = [];
              }
              acc[presentation.chapterId].push(presentation);
            }
            return acc;
          },
          {}
        );
        setPresentations(presentationsByChapter);
      } catch (err) {
        console.error("Failed to fetch presentations:", err);
        toast.error("Failed to load presentations");
      } finally {
        setLoadingPresentations(false);
      }
    };

    console.log("presentations");

    fetchPresentations();
  }, []);

  console.log("!");

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
    console.log("handleSubmit");
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

  const handleDeletePresentation = async (presentationId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this presentation? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deletePresentation(presentationId);
      // Refresh presentations
      const allPresentations = await getPresentations();
      const presentationsByChapter = allPresentations.reduce(
        (acc: Record<string, Presentation[]>, presentation) => {
          if (presentation.chapterId) {
            if (!acc[presentation.chapterId]) {
              acc[presentation.chapterId] = [];
            }
            acc[presentation.chapterId].push(presentation);
          }
          return acc;
        },
        {}
      );
      setPresentations(presentationsByChapter);
      toast.success("Presentation deleted successfully");
    } catch (err) {
      console.error("Failed to delete presentation:", err);
      toast.error("Failed to delete presentation");
    }
  };

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={3}>
        {canManage && (
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
        )}
      </Flex>

      {error && <ErrorMessage message={error} />}
      {deleteError && <ErrorMessage message={deleteError} />}

      {canManage && (isAdding || isEditing) && (
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
                <Text as="span" color="red">
                  *
                </Text>
              </Text>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="form-control"
              />
            </Box>

            <Box mb={4}>
              <Text as="label" display="block" mb={2} fontWeight="bold">
                Description
              </Text>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-control"
                rows={3}
              />
            </Box>

            <Box mb={4}>
              <Text as="label" display="block" mb={2} fontWeight="bold">
                Order{" "}
                <Text as="span" color="red">
                  *
                </Text>
              </Text>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value))}
                required
                min={1}
                className="form-control"
              />
            </Box>

            <Box mb={4}>
              <label className="form-check">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="form-check-input"
                />
                <Text as="span" ml={2}>
                  Active
                </Text>
              </label>
            </Box>

            <Flex justifyContent="flex-end" gap={2}>
              <Button
                type="button"
                onClick={
                  isEditing ? handleCancelEdit : () => setIsAdding(false)
                }
                variant="secondary"
                size="small"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="small"
                disabled={isSubmitting}
                onClick={(e) => {
                  e.preventDefault();
                  manualSubmit();
                }}
              >
                {isSubmitting ? "Saving..." : isEditing ? "Save" : "Add"}
              </Button>
            </Flex>
          </form>
        </Box>
      )}

      {chapters.length > 0 ? (
        <Box
          className="table-responsive"
          sx={{
            border: "1px solid",
            borderColor: "gray.200",
            borderRadius: "md",
          }}
        >
          <Box as="table" width="100%">
            <Box as="thead">
              <Box as="tr" bg="gray.100">
                <Box as="th" p={3} textAlign="left">
                  Title
                </Box>
                <Box as="th" p={3} textAlign="left">
                  Description
                </Box>
                <Box as="th" p={3} textAlign="center">
                  Order
                </Box>
                <Box as="th" p={3} textAlign="center">
                  Status
                </Box>
                <Box as="th" p={3} textAlign="center">
                  Presentations
                </Box>
                {canManage && (
                  <Box as="th" p={3} textAlign="right">
                    Actions
                  </Box>
                )}
              </Box>
            </Box>
            <Box as="tbody">
              {chapters.map((chapter) => (
                <Box
                  as="tr"
                  key={chapter._id}
                  borderTop="1px solid"
                  borderColor="gray.200"
                >
                  <Box as="td" p={3}>
                    {chapter.title}
                  </Box>
                  <Box as="td" p={3}>
                    {chapter.description}
                  </Box>
                  <Box as="td" p={3} textAlign="center">
                    {chapter.order}
                  </Box>
                  <Box as="td" p={3} textAlign="center">
                    {chapter.isActive ? (
                      <Text color="green">Active</Text>
                    ) : (
                      <Text color="red">Inactive</Text>
                    )}
                  </Box>
                  <Box as="td" p={3} textAlign="center">
                    {loadingPresentations ? (
                      <Spinner size={24} />
                    ) : (
                      <Box>
                        {presentations[chapter._id]?.length || 0} Presentations
                        {presentations[chapter._id]?.length > 0 && (
                          <Box mt={2}>
                            {presentations[chapter._id].map((presentation) => (
                              <Flex
                                key={presentation._id}
                                alignItems="center"
                                justifyContent="space-between"
                                p={2}
                                bg="gray.50"
                                mb={1}
                                borderRadius="md"
                              >
                                <Text fontSize="sm">{presentation.title}</Text>
                                <Flex gap={2}>
                                  <Button
                                    onClick={() =>
                                      router.push(
                                        `/subjects/${subjectId}/presentation/${presentation._id}`
                                      )
                                    }
                                    variant="secondary"
                                    size="small"
                                  >
                                    View
                                  </Button>
                                  {canManage && (
                                    <Button
                                      onClick={() =>
                                        handleDeletePresentation(
                                          presentation._id
                                        )
                                      }
                                      variant="danger"
                                      size="small"
                                    >
                                      Delete
                                    </Button>
                                  )}
                                </Flex>
                              </Flex>
                            ))}
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                  {canManage && (
                    <Box as="td" p={3} textAlign="right">
                      <Flex justifyContent="flex-end" gap={2}>
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
                        {onCreateContent && (
                          <Button
                            onClick={() => onCreateContent(chapter._id)}
                            variant="secondary"
                            size="small"
                          >
                            Create Content
                          </Button>
                        )}
                      </Flex>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      ) : (
        <Box p={4} bg="gray.100" borderRadius="md" textAlign="center">
          <Text color="gray.600">No chapters available yet.</Text>
        </Box>
      )}
    </Box>
  );
}
