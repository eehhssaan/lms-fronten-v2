"use client";

import React, { useEffect, useState } from "react";
import { Box, Heading, Text, Flex } from "rebass";
import { useRouter } from "next/navigation";
import { getCoursePresentations } from "@/lib/api";
import Loading from "./Loading";
import ErrorMessage from "./ErrorMessage";
import Button from "./Button";

interface ChapterPresentations {
  chapterId: string;
  chapterTitle: string;
  subjectId: string;
  presentations: Array<{
    _id: string;
    title: string;
    scope: "course" | "subject";
    slides: Array<{
      _id: string;
      title: string;
      order: number;
    }>;
  }>;
}

interface PresentationsListProps {
  courseId: string;
}

const PresentationsList: React.FC<PresentationsListProps> = ({ courseId }) => {
  const router = useRouter();
  const [chapters, setChapters] = useState<ChapterPresentations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPresentations = async () => {
      try {
        setLoading(true);
        const data = await getCoursePresentations(courseId);
        setChapters(data);
      } catch (err: any) {
        setError(err.message || "Failed to load presentations");
      } finally {
        setLoading(false);
      }
    };

    fetchPresentations();
  }, [courseId]);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  const chaptersWithPresentations = chapters.filter(
    (chapter) => chapter.presentations.length > 0
  );
  const chaptersWithoutPresentations = chapters.filter(
    (chapter) => chapter.presentations.length === 0
  );

  return (
    <Box>
      <Heading as="h2" mb={4}>
        Chapter Presentations
      </Heading>

      {chaptersWithPresentations.map((chapter) => (
        <Box
          key={chapter.chapterId}
          mb={5}
          sx={{
            backgroundColor: "white",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <Box
            p={3}
            sx={{
              borderBottom: "1px solid",
              borderColor: "gray.200",
              backgroundColor: "gray.50",
            }}
          >
            <Heading as="h3" fontSize={3}>
              {chapter.chapterTitle}
            </Heading>
          </Box>

          <Box p={4}>
            {/* Course Presentations Section */}
            <Box mb={4}>
              <Text
                fontSize={2}
                fontWeight="500"
                color="#0070f3"
                sx={{
                  display: "inline-block",
                  borderBottom: "2px solid #0070f3",
                  pb: 1,
                }}
              >
                Course Presentations
              </Text>
              <Box mt={3}>
                {chapter.presentations.filter((p) => p.scope === "course")
                  .length > 0 ? (
                  chapter.presentations
                    .filter((p) => p.scope === "course")
                    .map((presentation) => (
                      <Box
                        key={presentation._id}
                        p={3}
                        mb={2}
                        sx={{
                          border: "1px solid #e2e8f0",
                          borderRadius: "4px",
                          backgroundColor: "#f8fafc",
                        }}
                      >
                        <Flex
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Box>
                            <Text fontWeight="500">{presentation.title}</Text>
                            <Flex alignItems="center" mt={1}>
                              <Box
                                sx={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  backgroundColor: "#0070f3",
                                  mr: 2,
                                }}
                              />
                              <Text fontSize={1} color="gray.600">
                                {presentation.slides.length} slides
                              </Text>
                            </Flex>
                          </Box>
                          <Button
                            onClick={() =>
                              router.push(
                                `/courses/${courseId}/chapters/${chapter.chapterId}/presentation?subjectId=${chapter.subjectId}&presentationId=${presentation._id}`
                              )
                            }
                            sx={{
                              backgroundColor: "#0070f3",
                              color: "white",
                              "&:hover": {
                                backgroundColor: "#0051cc",
                              },
                            }}
                          >
                            View
                          </Button>
                        </Flex>
                      </Box>
                    ))
                ) : (
                  <Box>
                    <Text as="i" color="gray.500" mb={3} display="block">
                      No course-specific presentations
                    </Text>
                    {chapter.presentations.filter((p) => p.scope === "subject")
                      .length > 0 && (
                      <Button
                        onClick={() =>
                          router.push(
                            `/courses/${courseId}/chapters/${chapter.chapterId}/presentation/create?subjectId=${chapter.subjectId}`
                          )
                        }
                        sx={{
                          backgroundColor: "#28a745",
                          color: "white",
                          "&:hover": {
                            backgroundColor: "#218838",
                          },
                          mt: 2,
                        }}
                      >
                        Create Course Version
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            </Box>

            {/* Subject Presentations Section */}
            <Box>
              <Text
                fontSize={2}
                fontWeight="500"
                color="#805AD5"
                sx={{
                  display: "inline-block",
                  borderBottom: "2px solid #805AD5",
                  pb: 1,
                }}
              >
                Subject Presentations
              </Text>
              <Box mt={3}>
                {chapter.presentations.filter((p) => p.scope === "subject")
                  .length > 0 ? (
                  chapter.presentations
                    .filter((p) => p.scope === "subject")
                    .map((presentation) => (
                      <Box
                        key={presentation._id}
                        p={3}
                        mb={2}
                        sx={{
                          border: "1px solid #e2e8f0",
                          borderRadius: "4px",
                          backgroundColor: "#f8fafc",
                        }}
                      >
                        <Flex
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Box>
                            <Text fontWeight="500">{presentation.title}</Text>
                            <Flex alignItems="center" mt={1}>
                              <Box
                                sx={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  backgroundColor: "#805AD5",
                                  mr: 2,
                                }}
                              />
                              <Text fontSize={1} color="gray.600">
                                {presentation.slides.length} slides
                              </Text>
                            </Flex>
                          </Box>
                          <Button
                            onClick={() =>
                              router.push(
                                `/courses/${courseId}/chapters/${chapter.chapterId}/presentation?subjectId=${chapter.subjectId}&presentationId=${presentation._id}`
                              )
                            }
                            sx={{
                              backgroundColor: "#805AD5",
                              color: "white",
                              "&:hover": {
                                backgroundColor: "#6B46C1",
                              },
                            }}
                          >
                            View
                          </Button>
                        </Flex>
                      </Box>
                    ))
                ) : (
                  <Text as="i" color="gray.500">
                    No subject presentations
                  </Text>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      ))}

      {/* Chapters Without Presentations */}
      {chaptersWithoutPresentations.length > 0 && (
        <Box
          mt={5}
          p={4}
          sx={{
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <Heading as="h3" fontSize={2} mb={3}>
            Chapters Without Presentations
          </Heading>
          {chaptersWithoutPresentations.map((chapter) => (
            <Box
              key={chapter.chapterId}
              p={3}
              mb={2}
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: "4px",
                backgroundColor: "#f8fafc",
              }}
            >
              <Flex justifyContent="space-between" alignItems="center">
                <Text fontWeight="500">{chapter.chapterTitle}</Text>
                <Button
                  onClick={() =>
                    router.push(
                      `/courses/${courseId}/chapters/${chapter.chapterId}/presentation/create?subjectId=${chapter.subjectId}`
                    )
                  }
                  sx={{
                    backgroundColor: "#28a745",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#218838",
                    },
                  }}
                >
                  Create Presentation
                </Button>
              </Flex>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default PresentationsList;
