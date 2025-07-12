"use client";

import React, { useEffect, useState } from "react";
import { Box, Heading, Text, Flex } from "rebass";
import { Presentation } from "@/types";
import { Slide as PresentationSlide, SlideLayout } from "@/types/presentation";
import { getChapterPresentation, api } from "@/lib/api";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import { use } from "react";
import SlidePreview, { MiniSlidePreview } from "@/components/SlidePreview";
import { useLayouts } from "@/context/LayoutsContext";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";

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

interface APIResponse {
  success: boolean;
  data: Presentation[];
}

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
  const searchParams = useSearchParams();
  const subjectId = searchParams.get("subjectId");
  const presentationId = searchParams.get("presentationId");

  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [selectedPresentation, setSelectedPresentation] =
    useState<Presentation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const { layouts, defaultLayoutId } = useLayouts();

  useEffect(() => {
    const fetchPresentations = async () => {
      try {
        setLoading(true);
        const response = await getChapterPresentation(courseId, chapterId);
        setPresentations(response.data);

        // If we have a presentationId in the URL, select that presentation
        if (presentationId) {
          const presentation = response.data.find(
            (p) => p._id === presentationId
          );
          if (presentation) {
            setSelectedPresentation(presentation);
          } else {
            setError("Requested presentation not found");
          }
        } else if (response.data.length > 0) {
          // Otherwise select the first presentation
          setSelectedPresentation(response.data[0]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load presentations");
      } finally {
        setLoading(false);
      }
    };

    fetchPresentations();
  }, [courseId, chapterId, presentationId]);

  const handleDownload = async () => {
    if (!selectedPresentation) return;

    try {
      const response = await api.get(
        `/api/courses/${courseId}/presentations/${selectedPresentation._id}/download`,
        {
          responseType: "blob",
          headers: {
            Accept:
              "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          },
        }
      );

      // Get filename from Content-Disposition header or create default
      const contentDisposition = response.headers["content-disposition"];
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/['"]/g, "")
        : `presentation-${Date.now()}.pptx`;

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Presentation downloaded successfully");
    } catch (error) {
      console.error("Error downloading presentation:", error);
      toast.error("Failed to download presentation");
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!selectedPresentation)
    return <ErrorMessage message="No presentation selected" />;
  if (
    !selectedPresentation.slides ||
    selectedPresentation.slides.length === 0
  ) {
    return <ErrorMessage message="No slides found in this presentation" />;
  }

  // At this point, we know presentation.slides exists and has at least one slide
  const slides = selectedPresentation.slides;
  const currentSlide = slides[currentSlideIndex];
  const theme = selectedPresentation.themeId;

  // Get the current layout
  const mappedLayoutId = getLayoutId(
    currentSlide.layout,
    layouts,
    defaultLayoutId
  );
  // If the slide has an image element but the layout doesn't support images,
  // use the title-content-image layout instead
  const hasImageElement = currentSlide.elements.some(
    (el) => el.type === "image"
  );
  const currentLayout =
    hasImageElement && mappedLayoutId === "title-content"
      ? layouts["title-content-image"]
      : layouts[mappedLayoutId];

  return (
    <Box p={4}>
      {/* Header */}
      <Box mb={4}>
        <Heading as="h1" fontSize={4} mb={2}>
          {selectedPresentation.title}
        </Heading>
        <Text color="gray.600">
          {selectedPresentation.description || "No description available1"}
        </Text>
      </Box>

      {/* Presentation Controls */}
      <Flex mb={4} gap={2}>
        <button
          onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentSlideIndex === 0}
          style={{
            padding: "8px 16px",
            borderRadius: "4px",
            border: "1px solid #e2e8f0",
            backgroundColor: "white",
            cursor: currentSlideIndex === 0 ? "not-allowed" : "pointer",
            opacity: currentSlideIndex === 0 ? 0.5 : 1,
          }}
        >
          ← Previous
        </button>
        <Text sx={{ lineHeight: "36px" }}>
          Slide {currentSlideIndex + 1} of {slides.length}
        </Text>
        <button
          onClick={() =>
            setCurrentSlideIndex((prev) =>
              Math.min(slides.length - 1, prev + 1)
            )
          }
          disabled={currentSlideIndex === slides.length - 1}
          style={{
            padding: "8px 16px",
            borderRadius: "4px",
            border: "1px solid #e2e8f0",
            backgroundColor: "white",
            cursor:
              currentSlideIndex === slides.length - 1
                ? "not-allowed"
                : "pointer",
            opacity: currentSlideIndex === slides.length - 1 ? 0.5 : 1,
          }}
        >
          Next →
        </button>
        <Box sx={{ flex: 1 }} />
        <button
          onClick={handleDownload}
          style={{
            padding: "8px 16px",
            borderRadius: "4px",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Download
        </button>
      </Flex>

      {/* Main Content */}
      <Flex gap={4} sx={{ height: "calc(100vh - 250px)" }}>
        {/* Slide Thumbnails */}
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
                  slide={{ ...slide, layoutType: slide.layout }}
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
                    layout: mappedLayoutId,
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
                readOnly={true}
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
