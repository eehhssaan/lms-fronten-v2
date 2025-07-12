import { useState, useEffect } from "react";
import { Box, Heading, Text, Flex } from "rebass";
import Button from "@/components/Button";
import { Chapter, Subtopic, BulletPoint } from "@/types";
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

// Add new interfaces for expanded state tracking
interface ExpandedState {
  [key: string]: {
    chapter: boolean;
    subtopics: { [key: string]: boolean };
  };
}

interface ChapterManagerProps {
  subjectId: string;
  chapters: Chapter[];
  onChaptersUpdated: () => void;
  canManage?: boolean;
  onCreateContent?: (chapterId: string) => void;
}

interface SubtopicFormData extends Omit<Subtopic, "bulletPoints"> {
  bulletPoints: (BulletPoint & { id: string })[];
  id: string;
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
  const [subtopics, setSubtopics] = useState<SubtopicFormData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [presentations, setPresentations] = useState<
    Record<string, Presentation[]>
  >({});
  const [loadingPresentations, setLoadingPresentations] = useState(false);
  const router = useRouter();

  // Add new state for active chapter and tab
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"content" | "presentations">(
    "content"
  );

  // Set first chapter as active when chapters change
  useEffect(() => {
    if (chapters.length > 0 && !activeChapter) {
      setActiveChapter(chapters[0]._id);
    }
  }, [chapters]);

  // Add new state for tracking expanded sections
  const [expanded, setExpanded] = useState<ExpandedState>({});

  // Initialize expanded state when chapters change
  useEffect(() => {
    const newExpanded: ExpandedState = {};
    chapters.forEach((chapter) => {
      newExpanded[chapter._id] = {
        chapter: false,
        subtopics: {},
      };
      chapter.subtopics.forEach((subtopic) => {
        newExpanded[chapter._id].subtopics[subtopic.title] = false;
      });
    });
    setExpanded(newExpanded);
  }, [chapters]);

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
    setSubtopics([]);
    setError(null);
  };

  const handleStartEdit = (chapter: Chapter) => {
    setIsEditing(chapter._id);
    setTitle(chapter.title);
    setDescription(chapter.description || "");
    setOrder(chapter.order);
    setIsActive(chapter.isActive);
    setSubtopics(
      chapter.subtopics.map((subtopic) => ({
        ...subtopic,
        id: Math.random().toString(36).substr(2, 9),
        bulletPoints: subtopic.bulletPoints.map((bp) => ({
          ...bp,
          id: Math.random().toString(36).substr(2, 9),
        })),
      }))
    );
  };

  const addSubtopic = () => {
    setSubtopics([
      ...subtopics,
      {
        id: Math.random().toString(36).substr(2, 9),
        title: "",
        description: "",
        order: subtopics.length + 1,
        bulletPoints: [],
      },
    ]);
  };

  const removeSubtopic = (subtopicId: string) => {
    setSubtopics(subtopics.filter((st) => st.id !== subtopicId));
  };

  const updateSubtopic = (
    subtopicId: string,
    field: keyof Subtopic,
    value: string | number
  ) => {
    setSubtopics(
      subtopics.map((st) =>
        st.id === subtopicId ? { ...st, [field]: value } : st
      )
    );
  };

  const addBulletPoint = (subtopicId: string) => {
    setSubtopics(
      subtopics.map((st) =>
        st.id === subtopicId
          ? {
              ...st,
              bulletPoints: [
                ...st.bulletPoints,
                {
                  id: Math.random().toString(36).substr(2, 9),
                  title: "",
                  description: "",
                  order: st.bulletPoints.length + 1,
                },
              ],
            }
          : st
      )
    );
  };

  const removeBulletPoint = (subtopicId: string, bulletPointId: string) => {
    setSubtopics(
      subtopics.map((st) =>
        st.id === subtopicId
          ? {
              ...st,
              bulletPoints: st.bulletPoints.filter(
                (bp) => bp.id !== bulletPointId
              ),
            }
          : st
      )
    );
  };

  const updateBulletPoint = (
    subtopicId: string,
    bulletPointId: string,
    field: keyof BulletPoint,
    value: string | number
  ) => {
    setSubtopics(
      subtopics.map((st) =>
        st.id === subtopicId
          ? {
              ...st,
              bulletPoints: st.bulletPoints.map((bp) =>
                bp.id === bulletPointId ? { ...bp, [field]: value } : bp
              ),
            }
          : st
      )
    );
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
        subtopics: subtopics.map(({ id, ...st }) => ({
          ...st,
          bulletPoints: st.bulletPoints.map(({ id, ...bp }) => bp),
        })),
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
      subtopics: subtopics.map(({ id, ...st }) => ({
        ...st,
        bulletPoints: st.bulletPoints.map(({ id, ...bp }) => bp),
      })),
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

    // Check file extension
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (fileExtension !== "csv" && fileExtension !== "xlsx") {
      toast.error("Please upload a CSV or Excel file");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await bulkUploadChapters(subjectId, file);
      toast.success("Chapters uploaded successfully");
      onChaptersUpdated();
    } catch (err: any) {
      setError(err.message || "Failed to upload chapters");
      toast.error(err.message || "Failed to upload chapters");
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
      a.download = "chapter_template.csv"; // Changed to .csv
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Template downloaded successfully");
    } catch (err: any) {
      setError(err.message || "Failed to download template");
      toast.error(err.message || "Failed to download template");
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

  const toggleChapter = (chapterId: string) => {
    setExpanded((prev) => ({
      ...prev,
      [chapterId]: {
        ...prev[chapterId],
        chapter: !prev[chapterId]?.chapter,
      },
    }));
  };

  const toggleSubtopic = (chapterId: string, subtopicTitle: string) => {
    setExpanded((prev) => ({
      ...prev,
      [chapterId]: {
        ...prev[chapterId],
        subtopics: {
          ...prev[chapterId]?.subtopics,
          [subtopicTitle]: !prev[chapterId]?.subtopics[subtopicTitle],
        },
      },
    }));
  };

  const activeChapterData = chapters.find((c) => c._id === activeChapter);

  return (
    <Box>
      {/* Top Actions Bar */}
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Flex gap={2}>
          <Button
            onClick={handleDownloadTemplate}
            variant="secondary"
            size="small"
          >
            Download CSV Template
          </Button>
          <label>
            <Button
              as="span"
              variant="secondary"
              size="small"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload CSV/Excel"}
            </Button>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleBulkUpload}
              style={{ display: "none" }}
            />
          </label>
        </Flex>
        {canManage && !isAdding && !isEditing && (
          <Button
            onClick={() => setIsAdding(true)}
            variant="primary"
            size="small"
          >
            Add Chapter
          </Button>
        )}
      </Flex>

      {error && <ErrorMessage message={error} />}
      {deleteError && <ErrorMessage message={deleteError} />}

      {/* Form Section */}
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

            <Box mb={4}>
              <Heading as="h5" fontSize={1} mb={2}>
                Subtopics
              </Heading>
              {subtopics.map((subtopic) => (
                <Box key={subtopic.id} mb={3}>
                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Heading as="h6" fontSize={1}>
                      Subtopic {subtopic.order}
                    </Heading>
                    <Button
                      onClick={() => removeSubtopic(subtopic.id)}
                      variant="danger"
                      size="small"
                    >
                      Remove Subtopic
                    </Button>
                  </Flex>
                  <Box mb={2}>
                    <Text as="label" display="block" mb={1} fontWeight="bold">
                      Title{" "}
                      <Text as="span" color="red">
                        *
                      </Text>
                    </Text>
                    <input
                      type="text"
                      value={subtopic.title}
                      onChange={(e) =>
                        updateSubtopic(subtopic.id, "title", e.target.value)
                      }
                      required
                      className="form-control"
                    />
                  </Box>
                  <Box mb={2}>
                    <Text as="label" display="block" mb={1} fontWeight="bold">
                      Description
                    </Text>
                    <textarea
                      value={subtopic.description}
                      onChange={(e) =>
                        updateSubtopic(
                          subtopic.id,
                          "description",
                          e.target.value
                        )
                      }
                      className="form-control"
                      rows={2}
                    />
                  </Box>
                  <Box mb={2}>
                    <Heading as="h6" fontSize={1} mb={1}>
                      Bullet Points
                    </Heading>
                    {subtopic.bulletPoints.map((bulletPoint) => (
                      <Box key={bulletPoint.id} mb={1}>
                        <Flex
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Heading as="h6" fontSize={1}>
                            Bullet Point {bulletPoint.order}
                          </Heading>
                          <Button
                            onClick={() =>
                              removeBulletPoint(subtopic.id, bulletPoint.id)
                            }
                            variant="danger"
                            size="small"
                          >
                            Remove Bullet Point
                          </Button>
                        </Flex>
                        <Box mb={1}>
                          <Text
                            as="label"
                            display="block"
                            mb={1}
                            fontWeight="bold"
                          >
                            Title{" "}
                            <Text as="span" color="red">
                              *
                            </Text>
                          </Text>
                          <input
                            type="text"
                            value={bulletPoint.title}
                            onChange={(e) =>
                              updateBulletPoint(
                                subtopic.id,
                                bulletPoint.id,
                                "title",
                                e.target.value
                              )
                            }
                            required
                            className="form-control"
                          />
                        </Box>
                        <Box mb={1}>
                          <Text
                            as="label"
                            display="block"
                            mb={1}
                            fontWeight="bold"
                          >
                            Description
                          </Text>
                          <textarea
                            value={bulletPoint.description}
                            onChange={(e) =>
                              updateBulletPoint(
                                subtopic.id,
                                bulletPoint.id,
                                "description",
                                e.target.value
                              )
                            }
                            className="form-control"
                            rows={1}
                          />
                        </Box>
                      </Box>
                    ))}
                    <Button
                      onClick={() => addBulletPoint(subtopic.id)}
                      variant="secondary"
                      size="small"
                    >
                      Add Bullet Point
                    </Button>
                  </Box>
                </Box>
              ))}
              <Button onClick={addSubtopic} variant="secondary" size="small">
                Add Subtopic
              </Button>
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
        <Flex sx={{ gap: 4 }}>
          {/* Sidebar Navigation */}
          <Box
            sx={{
              width: "280px",
              flexShrink: 0,
              borderRight: "1px solid",
              borderColor: "gray.200",
              height: "calc(100vh - 200px)",
              overflowY: "auto",
              position: "sticky",
              top: "20px",
            }}
          >
            {chapters.map((chapter) => (
              <Box
                key={chapter._id}
                onClick={() => setActiveChapter(chapter._id)}
                sx={{
                  p: 3,
                  cursor: "pointer",
                  bg: activeChapter === chapter._id ? "blue.50" : "transparent",
                  borderLeft: "3px solid",
                  borderColor:
                    activeChapter === chapter._id ? "blue.500" : "transparent",
                  "&:hover": {
                    bg: activeChapter === chapter._id ? "blue.50" : "gray.50",
                  },
                }}
              >
                <Flex alignItems="center" justifyContent="space-between">
                  <Box>
                    <Text fontWeight="bold">
                      {chapter.order}. {chapter.title}
                    </Text>
                    <Text fontSize="sm" color="gray.600" mt={1}>
                      {chapter.subtopics.length} subtopics
                    </Text>
                  </Box>
                  <Text
                    fontSize="xs"
                    px={2}
                    py={1}
                    bg={chapter.isActive ? "green.100" : "red.100"}
                    color={chapter.isActive ? "green.700" : "red.700"}
                    borderRadius="full"
                  >
                    {chapter.isActive ? "Active" : "Inactive"}
                  </Text>
                </Flex>
              </Box>
            ))}
          </Box>

          {/* Main Content Area */}
          {activeChapterData && (
            <Box flex="1">
              {/* Chapter Header */}
              <Flex justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                  <Heading as="h2" fontSize={24}>
                    {activeChapterData.order}. {activeChapterData.title}
                  </Heading>
                  {activeChapterData.description && (
                    <Text color="gray.600" mt={2}>
                      {activeChapterData.description}
                    </Text>
                  )}
                </Box>
                {canManage && (
                  <Flex gap={2}>
                    <Button
                      onClick={() => handleStartEdit(activeChapterData)}
                      variant="secondary"
                      size="small"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(activeChapterData._id)}
                      variant="danger"
                      size="small"
                      disabled={deletingChapterIds.includes(
                        activeChapterData._id
                      )}
                    >
                      {deletingChapterIds.includes(activeChapterData._id)
                        ? "Deleting..."
                        : "Delete"}
                    </Button>
                    {onCreateContent && (
                      <Button
                        onClick={() => onCreateContent(activeChapterData._id)}
                        variant="primary"
                        size="small"
                      >
                        Create Content
                      </Button>
                    )}
                  </Flex>
                )}
              </Flex>

              {/* Tab Navigation */}
              <Flex
                mb={4}
                sx={{
                  borderBottom: "1px solid",
                  borderColor: "gray.200",
                }}
              >
                <Box
                  onClick={() => setActiveTab("content")}
                  sx={{
                    px: 4,
                    py: 2,
                    cursor: "pointer",
                    borderBottom: "2px solid",
                    borderColor:
                      activeTab === "content" ? "blue.500" : "transparent",
                    color: activeTab === "content" ? "blue.500" : "gray.600",
                    fontWeight: activeTab === "content" ? "bold" : "normal",
                  }}
                >
                  Content Structure
                </Box>
                <Box
                  onClick={() => setActiveTab("presentations")}
                  sx={{
                    px: 4,
                    py: 2,
                    cursor: "pointer",
                    borderBottom: "2px solid",
                    borderColor:
                      activeTab === "presentations"
                        ? "blue.500"
                        : "transparent",
                    color:
                      activeTab === "presentations" ? "blue.500" : "gray.600",
                    fontWeight:
                      activeTab === "presentations" ? "bold" : "normal",
                  }}
                >
                  Presentations (
                  {presentations[activeChapterData._id]?.length || 0})
                </Box>
              </Flex>

              {/* Tab Content */}
              {activeTab === "content" ? (
                <Box>
                  {activeChapterData.subtopics.map((subtopic, index) => (
                    <Box
                      key={index}
                      mb={4}
                      p={4}
                      bg="white"
                      sx={{
                        border: "1px solid",
                        borderColor: "gray.200",
                        borderRadius: "md",
                        boxShadow: "sm",
                      }}
                    >
                      <Text fontSize="lg" fontWeight="bold" mb={2}>
                        {subtopic.order}. {subtopic.title}
                      </Text>
                      {subtopic.description && (
                        <Text color="gray.600" mb={3}>
                          {subtopic.description}
                        </Text>
                      )}

                      {subtopic.bulletPoints.length > 0 && (
                        <Box pl={4}>
                          {subtopic.bulletPoints.map((bullet, bIndex) => (
                            <Box
                              key={bIndex}
                              mb={2}
                              p={3}
                              bg="gray.50"
                              sx={{
                                borderRadius: "md",
                                borderLeft: "3px solid",
                                borderColor: "blue.200",
                              }}
                            >
                              <Text fontWeight="500">
                                {bullet.order}. {bullet.title}
                              </Text>
                              {bullet.description && (
                                <Text color="gray.600" mt={1}>
                                  {bullet.description}
                                </Text>
                              )}
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box>
                  {presentations[activeChapterData._id]?.length > 0 ? (
                    presentations[activeChapterData._id].map((presentation) => (
                      <Flex
                        key={presentation._id}
                        p={4}
                        mb={3}
                        bg="white"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{
                          border: "1px solid",
                          borderColor: "gray.200",
                          borderRadius: "md",
                          boxShadow: "sm",
                        }}
                      >
                        <Text fontWeight="500">{presentation.title}</Text>
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
                                handleDeletePresentation(presentation._id)
                              }
                              variant="danger"
                              size="small"
                            >
                              Delete
                            </Button>
                          )}
                        </Flex>
                      </Flex>
                    ))
                  ) : (
                    <Box
                      p={4}
                      bg="gray.50"
                      borderRadius="md"
                      textAlign="center"
                    >
                      <Text color="gray.600">
                        No presentations available for this chapter.
                      </Text>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}
        </Flex>
      ) : (
        <Box p={4} bg="gray.100" borderRadius="md" textAlign="center">
          <Text color="gray.600">No chapters available yet.</Text>
        </Box>
      )}
    </Box>
  );
}
