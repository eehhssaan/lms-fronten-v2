"use client";

import React, { useEffect, useState } from "react";
import { Box, Heading, Text, Flex } from "rebass";
import { Presentation } from "@/types";
import { Slide as PresentationSlide, SlideLayout } from "@/types/presentation";
import { getChapterPresentation } from "@/lib/api";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import { use } from "react";
import SlidePreview, { MiniSlidePreview } from "@/components/SlidePreview";
import { useLayouts } from "@/context/LayoutsContext";

// Map backend layout types to frontend layout IDs
const getLayoutId = (
  backendLayout: string | undefined,
  layouts: Record<string, any>,
  defaultLayoutId: string
): string => {
  if (!backendLayout) return defaultLayoutId;

  // If the backend layout ID matches one of our layout IDs, use it
  if (layouts[backendLayout]) return backendLayout;

  // Try to match by layout type
  const layoutType = backendLayout.toLowerCase();
  if (layoutType.includes("title") && layoutType.includes("content")) {
    return "title-content";
  }
  if (layoutType.includes("content") && !layoutType.includes("title")) {
    return "content-only";
  }
  if (layoutType.includes("image")) {
    if (layoutType.includes("left")) return "image-left";
    if (layoutType.includes("right")) return "image-right";
    if (layoutType.includes("full")) return "full-image";
    return "title-content-image";
  }

  // Default to title-content if no match found
  return defaultLayoutId;
};

const PresentationPage = ({
  params,
}: {
  params:
    | Promise<{ id: string; chapterId: string }>
    | { id: string; chapterId: string };
}) => {
  const resolvedParams =
    typeof params === "object" && !("then" in params)
      ? params
      : use(params as Promise<{ id: string; chapterId: string }>);

  const courseId = resolvedParams.id;
  const chapterId = resolvedParams.chapterId;

  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const { layouts, defaultLayoutId } = useLayouts();

  useEffect(() => {
    const fetchPresentation = async () => {
      try {
        setLoading(true);
        const data = await getChapterPresentation(courseId, chapterId);
        setPresentation(data);
      } catch (err: any) {
        setError(err.message || "Failed to load presentation");
      } finally {
        setLoading(false);
      }
    };

    fetchPresentation();
  }, [courseId, chapterId]);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!presentation) return <ErrorMessage message="Presentation not found" />;
  if (!presentation.slides || presentation.slides.length === 0) {
    return <ErrorMessage message="No slides found in this presentation" />;
  }

  // At this point, we know presentation.slides exists and has at least one slide
  const slides = presentation.slides;
  const currentSlide = slides[currentSlideIndex];
  const theme = presentation.themeId;

  // Get the current layout
  const mappedLayoutId = getLayoutId(
    currentSlide.layout,
    layouts,
    defaultLayoutId
  );
  const currentLayout = layouts[mappedLayoutId];

  return (
    <Box p={4}>
      {/* Header */}
      <Box mb={4}>
        <Text fontSize={2} color={theme.colors.text}>
          {presentation.chapterTitle}
        </Text>
      </Box>

      {/* Main Content Area */}
      <Flex sx={{ gap: 4, height: "calc(100vh - 200px)" }}>
        {/* Left Sidebar - Thumbnails */}
        <Box
          sx={{
            flexShrink: 0,
            overflowY: "auto",
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "16px",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#f1f1f1",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#888",
              borderRadius: "4px",
              "&:hover": {
                backgroundColor: "#555",
              },
            },
          }}
        >
          <Flex sx={{ flexDirection: "column", gap: 3 }}>
            {slides.map((slide, index) => (
              <Box
                key={slide._id}
                onClick={() => setCurrentSlideIndex(index)}
                sx={{
                  cursor: "pointer",
                  opacity: currentSlideIndex === index ? 1 : 0.7,
                  transition: "opacity 0.2s",
                  "&:hover": {
                    opacity: 1,
                  },
                  border:
                    currentSlideIndex === index
                      ? "2px solid #3182ce"
                      : "2px solid transparent",
                  borderRadius: "4px",
                }}
              >
                <MiniSlidePreview
                  slide={slide}
                  isSelected={currentSlideIndex === index}
                  layouts={layouts}
                  defaultLayoutId={defaultLayoutId}
                />
              </Box>
            ))}
          </Flex>
        </Box>

        {/* Main Content - Current Slide */}
        <Box
          sx={{
            flex: 1,
            backgroundColor: "#fff",
            borderRadius: "8px",
            padding: "24px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "24px",
            }}
          >
            {currentLayout ? (
              <SlidePreview
                slide={
                  {
                    ...currentSlide,
                    layout: mappedLayoutId, // Use the mapped layout ID
                    aspectRatio: "16/9",
                    elements: currentSlide.elements.map((element) => ({
                      ...element,
                      format: {
                        ...element.format,
                        textAlign: (element.format?.textAlign || "left") as
                          | "left"
                          | "center"
                          | "right",
                      },
                    })),
                  } as PresentationSlide & { aspectRatio: string }
                }
                onSlideChange={() => {}} // Read-only mode
                currentLayout={currentLayout}
              />
            ) : (
              <Text color="gray.500">Layout not found for this slide</Text>
            )}
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default PresentationPage;
