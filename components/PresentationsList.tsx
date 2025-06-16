"use client";

import React, { useEffect, useState } from "react";
import { Box, Heading, Text, Flex } from "rebass";
import { ChapterPresentation } from "@/types";
import { getCoursePresentations } from "@/lib/api";
import Loading from "./Loading";
import ErrorMessage from "./ErrorMessage";
import Link from "next/link";

interface PresentationsListProps {
  courseId: string;
}

const PresentationsList: React.FC<PresentationsListProps> = ({ courseId }) => {
  const [presentations, setPresentations] = useState<ChapterPresentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPresentations = async () => {
      try {
        setLoading(true);
        const data = await getCoursePresentations(courseId);
        setPresentations(data);
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

  const availablePresentations = presentations.filter(
    (item) => item.presentation !== null
  );
  const chaptersWithoutPresentations = presentations.filter(
    (item) => item.presentation === null
  );

  return (
    <Box>
      <Heading as="h2" mb={4}>
        Chapter Presentations
      </Heading>

      {availablePresentations.length === 0 &&
      chaptersWithoutPresentations.length === 0 ? (
        <Text>No chapters available in this course.</Text>
      ) : (
        <>
          {availablePresentations.length > 0 && (
            <Box mb={4}>
              <Heading as="h3" fontSize={2} mb={3}>
                Available Presentations
              </Heading>
              {availablePresentations.map((item) => (
                <Box
                  key={item.chapterId}
                  p={3}
                  mb={3}
                  sx={{
                    border: "1px solid",
                    borderColor: "gray.2",
                    borderRadius: 4,
                    "&:hover": {
                      borderColor: "primary",
                      backgroundColor: "gray.0",
                    },
                  }}
                >
                  <Link
                    href={`/courses/${courseId}/chapters/${item.chapterId}/presentation`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <Flex justifyContent="space-between" alignItems="center">
                      <Box>
                        <Heading as="h4" fontSize={2} mb={2}>
                          {item.chapterTitle}
                        </Heading>
                        <Text fontSize={1} color="gray.6">
                          {item.presentation?.title || "Untitled Presentation"}
                        </Text>
                      </Box>
                      <Text fontSize={1} color="primary">
                        View Presentation →
                      </Text>
                    </Flex>
                  </Link>
                </Box>
              ))}
            </Box>
          )}

          {chaptersWithoutPresentations.length > 0 && (
            <Box>
              <Heading as="h3" fontSize={2} mb={3}>
                Chapters Without Presentations
              </Heading>
              {chaptersWithoutPresentations.map((item) => (
                <Box
                  key={item.chapterId}
                  p={3}
                  mb={3}
                  sx={{
                    border: "1px solid",
                    borderColor: "gray.2",
                    borderRadius: 4,
                    opacity: 0.7,
                  }}
                >
                  <Flex justifyContent="space-between" alignItems="center">
                    <Box>
                      <Heading as="h4" fontSize={2} mb={2}>
                        {item.chapterTitle}
                      </Heading>
                      <Text fontSize={1} color="gray.6">
                        No presentation available
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              ))}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default PresentationsList;
