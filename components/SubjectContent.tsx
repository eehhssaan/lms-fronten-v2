import { useState } from "react";
import { Box, Heading, Text, Flex } from "rebass";
import { Content } from "@/types";
import { downloadContent, deleteSubjectContent } from "@/lib/api";
import axios from "axios";
import { toast } from "react-hot-toast";
import { getStoredToken } from "@/lib/api";

interface SubjectContentProps {
  contents: Content[];
  subjectId: string;
  onContentDeleted?: () => void;
  canManageSubject?: boolean;
}

interface ModuleContent {
  moduleNumber: number;
  lessons: {
    lessonNumber: number;
    contents: Content[];
  }[];
}

export default function SubjectContent({
  contents,
  subjectId,
  onContentDeleted,
  canManageSubject = false,
}: SubjectContentProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Organize contents by module and lesson
  const organizedContents = contents
    .filter((content) => content !== null)
    .reduce((acc: ModuleContent[], content) => {
      const moduleNumber = content.moduleNumber || 1;
      const lessonNumber = content.lessonNumber || 1;

      const moduleIndex = acc.findIndex((m) => m.moduleNumber === moduleNumber);

      if (moduleIndex === -1) {
        // Create new module
        acc.push({
          moduleNumber,
          lessons: [
            {
              lessonNumber,
              contents: [content],
            },
          ],
        });
      } else {
        // Module exists, check for lesson
        const lessonIndex = acc[moduleIndex].lessons.findIndex(
          (l) => l.lessonNumber === lessonNumber
        );

        if (lessonIndex === -1) {
          // Create new lesson in existing module
          acc[moduleIndex].lessons.push({
            lessonNumber,
            contents: [content],
          });
        } else {
          // Add content to existing lesson
          acc[moduleIndex].lessons[lessonIndex].contents.push(content);
        }
      }

      return acc;
    }, []);

  // Sort modules and lessons
  organizedContents.sort((a, b) => a.moduleNumber - b.moduleNumber);
  organizedContents.forEach((module) => {
    module.lessons.sort((a, b) => a.lessonNumber - b.lessonNumber);
    module.lessons.forEach((lesson) => {
      lesson.contents.sort((a, b) => (a.order || 0) - (b.order || 0));
    });
  });

  const handleDownload = async (contentId: string, title: string) => {
    try {
      setDownloading(contentId);
      setError(null);

      const token = getStoredToken();
      if (!token) {
        throw new Error("Please log in to download materials");
      }

      const response = await fetch(
        `/api/subjects/${subjectId}/materials/${contentId}/download`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 404) {
        throw new Error("Material not found");
      } else if (response.status === 401) {
        throw new Error("Not authorized");
      } else if (response.status === 400) {
        throw new Error("No file available for this material");
      } else if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = title;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error: any) {
      console.error("Error downloading file:", error);
      toast.error(error.message || "Failed to download file");
      setError(error.message || "Failed to download file");
    } finally {
      setDownloading(null);
      setDownloadProgress(0);
    }
  };

  const handleDelete = async (contentId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this material? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeleting(contentId);
      setError(null);

      await deleteSubjectContent(subjectId, contentId);
      toast.success("Material deleted successfully");

      // Refresh the content list
      if (onContentDeleted) {
        onContentDeleted();
      }
    } catch (error: any) {
      console.error("Error deleting material:", error);
      toast.error(error.message || "Failed to delete material");
      setError(error.message || "Failed to delete material");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Box>
      {error && (
        <Box
          mb={3}
          p={3}
          bg="red.50"
          color="red.600"
          borderRadius="md"
          fontSize="sm"
        >
          {error}
        </Box>
      )}

      {organizedContents.map((module) => (
        <Box key={module.moduleNumber} mb={4}>
          <Heading as="h3" fontSize={2} mb={3}>
            Module {module.moduleNumber}
          </Heading>

          {module.lessons.map((lesson) => (
            <Box
              key={lesson.lessonNumber}
              mb={3}
              p={3}
              bg="white"
              sx={{
                borderRadius: "6px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <Heading as="h4" fontSize={2} mb={2}>
                Lesson {lesson.lessonNumber}
              </Heading>

              {lesson.contents.map((content) => (
                <Box
                  key={content._id}
                  p={3}
                  mb={2}
                  sx={{
                    borderBottom: "1px solid",
                    borderColor: "gray.200",
                    "&:last-child": {
                      borderBottom: "none",
                      mb: 0,
                    },
                  }}
                >
                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Box>
                      <Heading as="h5" fontSize={2} mb={1}>
                        {content.title}
                      </Heading>
                      <Text fontSize={1} color="gray">
                        {content.type === "document"
                          ? "PDF Document"
                          : content.type}
                      </Text>
                    </Box>

                    <Flex gap={2}>
                      <Box>
                        {downloading === content._id ? (
                          <Flex alignItems="center">
                            <Text fontSize={1} mr={2}>
                              {downloadProgress.toFixed(0)}%
                            </Text>
                            <Box
                              as="button"
                              className="btn btn-secondary"
                              sx={{
                                py: 1,
                                px: 2,
                                fontSize: 1,
                                opacity: 0.7,
                                cursor: "not-allowed",
                              }}
                              disabled
                            >
                              Downloading...
                            </Box>
                          </Flex>
                        ) : (
                          <Box
                            as="button"
                            onClick={() =>
                              handleDownload(content._id!, content.title)
                            }
                            className="btn btn-secondary"
                            sx={{
                              py: 1,
                              px: 2,
                              fontSize: 1,
                            }}
                          >
                            Download
                          </Box>
                        )}
                      </Box>

                      {canManageSubject && (
                        <Box>
                          {deleting === content._id ? (
                            <Box
                              as="button"
                              className="btn btn-danger"
                              sx={{
                                py: 1,
                                px: 2,
                                fontSize: 1,
                                opacity: 0.7,
                                cursor: "not-allowed",
                              }}
                              disabled
                            >
                              Deleting...
                            </Box>
                          ) : (
                            <Box
                              as="button"
                              onClick={() => handleDelete(content._id!)}
                              className="btn btn-danger"
                              sx={{
                                py: 1,
                                px: 2,
                                fontSize: 1,
                              }}
                            >
                              Delete
                            </Box>
                          )}
                        </Box>
                      )}
                    </Flex>
                  </Flex>

                  {content.description && (
                    <Text fontSize={1} mt={2} color="gray">
                      {content.description}
                    </Text>
                  )}
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}
