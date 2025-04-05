import { useState } from "react";
import { Box, Heading, Text, Flex } from "rebass";
import { Content } from "@/types";
import { downloadContent } from "@/lib/api";

interface CourseContentProps {
  contents: Content[];
  courseId: string;
}

interface ModuleContent {
  moduleNumber: number;
  lessons: {
    lessonNumber: number;
    contents: Content[];
  }[];
}

export default function CourseContent({
  contents,
  courseId,
}: CourseContentProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Organize contents by module and lesson
  const organizedContents = contents.reduce((acc: ModuleContent[], content) => {
    const moduleIndex = acc.findIndex(
      (m) => m.moduleNumber === content.moduleNumber
    );

    if (moduleIndex === -1) {
      // Create new module
      acc.push({
        moduleNumber: content.moduleNumber,
        lessons: [
          {
            lessonNumber: content.lessonNumber,
            contents: [content],
          },
        ],
      });
    } else {
      // Module exists, check for lesson
      const lessonIndex = acc[moduleIndex].lessons.findIndex(
        (l) => l.lessonNumber === content.lessonNumber
      );

      if (lessonIndex === -1) {
        // Create new lesson in existing module
        acc[moduleIndex].lessons.push({
          lessonNumber: content.lessonNumber,
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

  const handleDownload = async (contentId: string, fileName: string) => {
    try {
      setDownloading(contentId);
      setDownloadProgress(0);
      setError(null);

      await downloadContent(contentId, fileName, (progress) => {
        setDownloadProgress(progress);
      });
    } catch (err: any) {
      console.error("Download failed:", err);
      setError(err.message || "Failed to download the file. Please try again.");
    } finally {
      setDownloading(null);
      setDownloadProgress(0);
    }
  };

  if (contents.length === 0) {
    return (
      <Box p={4} bg="lightGray" borderRadius="default" textAlign="center">
        <Text>No content available for this course yet.</Text>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Box className="alert alert-error" mb={3}>
          {error}
        </Box>
      )}

      {organizedContents.map((module) => (
        <Box key={module.moduleNumber} mb={4}>
          <Heading as="h3" fontSize={3} mb={3}>
            Module {module.moduleNumber}
          </Heading>

          {module.lessons.map((lesson) => (
            <Box
              key={`${module.moduleNumber}-${lesson.lessonNumber}`}
              mb={4}
              ml={3}
            >
              <Heading as="h4" fontSize={2} mb={3}>
                Lesson {lesson.lessonNumber}
              </Heading>

              {lesson.contents.map((content) => (
                <Box
                  key={content._id}
                  p={3}
                  mb={3}
                  bg="white"
                  sx={{
                    borderRadius: "4px",
                    boxShadow: "small",
                    border: "1px solid",
                    borderColor: "border",
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

                    {content.file && (
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
                              handleDownload(content._id, content.title)
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
                    )}
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
