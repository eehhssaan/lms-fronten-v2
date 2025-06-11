import React, { useState } from "react";
import { Box, Text, Flex } from "rebass";
import { default as SlidePreview, MiniSlidePreview } from "./SlidePreview";
import { useLayouts } from "@/context/LayoutsContext";
import { BREAKPOINTS } from "../constants/breakpoints";
import { Slide } from "@/types/presentation";
import { generatePowerPoint } from "@/lib/api/presentations";
import { toast } from "react-hot-toast";

interface PresentationPreviewProps {
  presentationId: string;
  slides: Slide[];
  onBack?: () => void;
}

const PresentationPreview: React.FC<PresentationPreviewProps> = ({
  presentationId,
  slides: initialSlides,
  onBack,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slides, setSlides] = useState(initialSlides);
  const [isDownloading, setIsDownloading] = useState(false);
  const { layouts, defaultLayoutId, loading } = useLayouts();

  const handleSlideChange = (updatedSlide: Partial<Slide>) => {
    setSlides((currentSlides) =>
      currentSlides.map((slide, index) =>
        index === currentSlideIndex ? { ...slide, ...updatedSlide } : slide
      )
    );
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const blob = await generatePowerPoint(presentationId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "presentation.pptx"; // You might want to get a better name from the backend
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Presentation downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download presentation");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Flex
      sx={{
        width: "100%",
        height: "90vh",
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
          width: "20%",
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
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              style={{
                padding: "8px 16px",
                borderRadius: "4px",
                border: "none",
                backgroundColor: "#0070f3",
                color: "white",
                cursor: isDownloading ? "not-allowed" : "pointer",
                opacity: isDownloading ? 0.7 : 1,
              }}
            >
              {isDownloading ? "Downloading..." : "Download"}
            </button>
          </Flex>
        </Flex>

        <Flex
          sx={{
            gap: 2,
            flexDirection: "column",
            [BREAKPOINTS.md]: {
              flexDirection: "row",
              overflowX: "auto",
              pb: 2,
              "&::-webkit-scrollbar": {
                height: "8px",
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
            },
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
          width: "80%",
          height: "100%",
          backgroundColor: "white",
          p: "1.5rem",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          [BREAKPOINTS.md]: {
            width: "100%",
            height: "auto",
            p: "1rem",
          },
        }}
      >
        <Flex
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Flex sx={{ gap: 2, alignItems: "center" }}>
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
            <Text sx={{ fontSize: 14, color: "#4a5568" }}>
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
          </Flex>
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
                aspectRatio: "16:9",
              }}
              onSlideChange={handleSlideChange}
              currentLayout={
                layouts[slides[currentSlideIndex].layout || defaultLayoutId]
              }
            />
          )}
        </Box>
      </Box>
    </Flex>
  );
};

export default PresentationPreview;
