import React, { useState } from "react";
import { Box, Text, Flex } from "rebass";
import { default as SlidePreview, MiniSlidePreview } from "./SlidePreview";
import { useLayouts } from "@/context/LayoutsContext";
import { BREAKPOINTS } from "../constants/breakpoints";
import { Slide, SlideElement } from "@/types/presentation";
import { generatePowerPoint } from "@/lib/api/presentations";
import { toast } from "react-hot-toast";
import { usePresentationContext } from "@/context/PresentationContext";
import { api } from "@/lib/api";

interface PresentationPreviewProps {
  presentationId: string;
  onBack?: () => void;
  onSave?: () => void;
}

const PresentationPreview: React.FC<PresentationPreviewProps> = ({
  presentationId,
  onBack,
  onSave,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const { layouts, defaultLayoutId, loading } = useLayouts();
  const {
    presentation,
    updateSlide,
    updateSlideElement,
    updateSlideLayout,
    updateSlideBackground,
    isDirty,
    getSerializablePresentation,
    markAsSaved,
  } = usePresentationContext();

  const slides = presentation?.slides || [];

  // Helper function to get the correct layout ID
  const getLayoutId = (slide: Slide) => {
    // First try to use layoutType if available
    if (slide.layoutType) {
      // Find the layout that matches this type
      const matchingLayout = Object.values(layouts).find(
        (layout) => layout.type === slide.layoutType
      );

      if (matchingLayout) {
        return matchingLayout._id;
      }
    }

    // Fallback: If the slide has a layout ID that exists in our layouts, use it
    if (slide.layout && layouts[slide.layout]) {
      return slide.layout;
    }

    // Fallback: If the slide has a layout ID that doesn't exist in our layouts
    // (like a MongoDB ID from backend), find the matching layout type
    if (slide.layout) {
      const matchingLayout = Object.values(layouts).find(
        (layout) => layout._id === slide.layout
      );
      if (matchingLayout) {
        return matchingLayout._id;
      }
    }

    // Final fallback to default layout
    return defaultLayoutId;
  };

  const handleSlideChange = (updatedSlide: Partial<Slide>) => {
    if (!slides[currentSlideIndex]?._id) return;
    const slideId = slides[currentSlideIndex]._id as string;
    updateSlide(slideId, updatedSlide);
  };

  const handleElementChange = (
    elementId: string,
    updates: Partial<SlideElement>
  ) => {
    if (!slides[currentSlideIndex]?._id) return;
    const slideId = slides[currentSlideIndex]._id as string;
    updateSlideElement(slideId, elementId, updates);
  };

  const handleLayoutChange = (layoutId: string) => {
    console.log("Changing layout to:", layoutId);
    // Update the current slide with the new layout ID
    handleSlideChange({
      layout: layoutId,
    });
  };

  const handleBackgroundChange = (backgroundColor: string) => {
    if (!slides[currentSlideIndex]?._id) return;
    const slideId = slides[currentSlideIndex]._id as string;
    updateSlideBackground(slideId, backgroundColor);
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      // If there are unsaved changes, save them first
      if (isDirty) {
        const presentationData = getSerializablePresentation();
        if (!presentationData) {
          throw new Error("No presentation data to save");
        }
        await api.put(`/v1/presentations/${presentationId}`, presentationData);
        markAsSaved();
      }

      // Now download the presentation
      const pptxBlob = await generatePowerPoint(presentationId);
      const url = window.URL.createObjectURL(pptxBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `presentation-${Date.now()}.pptx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Presentation downloaded successfully");
    } catch (error) {
      console.error("Error downloading presentation:", error);
      toast.error("Failed to download presentation");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!presentation || slides.length === 0) {
    return (
      <Box p={4}>
        <Text>No slides available</Text>
      </Box>
    );
  }

  return (
    <Flex
      sx={{
        width: "100%",
        height: "90vh",
        margin: "auto",
        backgroundColor: "white",
        borderRadius: "8px",
        overflow: "hidden",
        flexDirection: "row",
        [BREAKPOINTS.md]: {
          flexDirection: "column",
          height: "auto",
        },
      }}
    >
      {/* Left side - Thumbnails */}
      <Box
        sx={{
          width: "15%",
          backgroundColor: "white",
          borderRight: "1px solid #e2e8f0",
          overflowY: "auto",
          p: "1.5rem",
          [BREAKPOINTS.md]: {
            width: "100%",
            height: "auto",
            maxHeight: "250px",
            borderRight: "none",
            borderBottom: "1px solid #e2e8f0",
            p: "1rem",
          },
        }}
      >
        <Flex
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Text sx={{ fontSize: 14, fontWeight: 500, color: "#4a5568" }}>
            All Slides
          </Text>
          <Flex sx={{ gap: 2 }}>
            <button
              onClick={onBack}
              style={{
                padding: "8px 16px",
                borderRadius: "4px",
                border: "1px solid #e2e8f0",
                backgroundColor: "white",
                cursor: "pointer",
              }}
            >
              Back to Draft
            </button>
            {isDirty && (
              <button
                onClick={onSave}
                style={{
                  padding: "4px 12px",
                  borderRadius: "4px",
                  backgroundColor: "#0070f3",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Save Changes1
              </button>
            )}
          </Flex>
        </Flex>

        <Flex
          sx={{
            flexDirection: ["row", "row", "column"],
            overflowX: ["auto", "auto", "visible"],
            gap: 2,
            pb: [2, 2, 0],
          }}
        >
          {slides.map((slide, index) => (
            <Box
              key={`slide-thumb-${slide._id || index}`}
              onClick={() => setCurrentSlideIndex(index)}
              sx={{
                width: "100%",
                marginBottom: 2,
                [BREAKPOINTS.md]: {
                  width: "200px",
                  minWidth: "200px",
                  marginBottom: 0,
                  marginRight: 2,
                },
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

      {/* Right side - Current Slide Preview */}
      <Box
        sx={{
          flex: 1,
          p: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Flex sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={() =>
              setCurrentSlideIndex((prev) => Math.max(0, prev - 1))
            }
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
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            style={{
              padding: "8px 16px",
              borderRadius: "4px",
              backgroundColor: "#48bb78",
              color: "white",
              border: "none",
              cursor: isDownloading ? "not-allowed" : "pointer",
              opacity: isDownloading ? 0.7 : 1,
            }}
          >
            {isDownloading ? "Downloading..." : "Download PPTX"}
          </button>
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
        </Flex>

        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {slides[currentSlideIndex] && (
            <SlidePreview
              slide={{
                ...slides[currentSlideIndex],
                aspectRatio: "16/9",
              }}
              onSlideChange={handleSlideChange}
              onElementChange={handleElementChange}
              onLayoutChange={handleLayoutChange}
              onBackgroundChange={handleBackgroundChange}
              currentLayout={layouts[getLayoutId(slides[currentSlideIndex])]}
            />
          )}
        </Box>
      </Box>
    </Flex>
  );
};

export default PresentationPreview;
