import React, { useState } from "react";
import { Box, Text, Flex } from "rebass";
import SlideEditModal from "./SlideEditModal";
import {
  PresentationDraft,
  PresentationDraftSlide,
} from "../types/presentation";

interface DraftPreviewProps {
  draft: PresentationDraft;
  onEdit?: (slideNumber: number, updatedSlide: PresentationDraftSlide) => void;
  onGenerateFinal?: () => void;
}

const DraftPreview: React.FC<DraftPreviewProps> = ({
  draft,
  onEdit,
  onGenerateFinal,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSlide, setSelectedSlide] =
    useState<PresentationDraftSlide | null>(null);
  const { status, progress, content: slides } = draft;

  const handleGenerateFinal = async () => {
    if (!onGenerateFinal) return;
    setIsGenerating(true);
    try {
      await onGenerateFinal();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSlideClick = (slide: PresentationDraftSlide) => {
    if (onEdit) {
      setSelectedSlide(slide);
    }
  };

  const handleSaveSlide = (updatedSlide: PresentationDraftSlide) => {
    if (onEdit) {
      onEdit(updatedSlide.slideNumber, updatedSlide);
    }
    setSelectedSlide(null);
  };

  if (status === "generating") {
    return (
      <Box
        sx={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "24px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <Text fontSize={3} mb={3}>
          Generating your presentation... {progress}%
        </Text>
        <Box
          sx={{
            width: "100%",
            height: "4px",
            backgroundColor: "#eee",
            borderRadius: "2px",
          }}
        >
          <Box
            sx={{
              width: `${progress}%`,
              height: "100%",
              backgroundColor: "#0070f3",
              borderRadius: "2px",
              transition: "width 0.3s ease",
            }}
          />
        </Box>
      </Box>
    );
  }

  if (status === "error") {
    return (
      <Box
        sx={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "24px",
          backgroundColor: "#FEE2E2",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <Text color="red" fontSize={3}>
          An error occurred while generating your presentation.
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Text fontSize={3} fontWeight="bold">
          Preview: {draft.chapter}
        </Text>
        <button
          onClick={handleGenerateFinal}
          disabled={isGenerating}
          style={{
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "4px",
            cursor: isGenerating ? "not-allowed" : "pointer",
            opacity: isGenerating ? 0.7 : 1,
          }}
        >
          {isGenerating ? "Generating..." : "Generate Final Presentation"}
        </button>
      </Flex>

      <Box
        sx={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "20px",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        {slides.map((slide) => (
          <Box
            key={slide._id}
            sx={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              cursor: onEdit ? "pointer" : "default",
              marginBottom: "20px",
              "&:hover": onEdit
                ? {
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    transform: "translateY(-2px)",
                    transition: "all 0.2s ease",
                  }
                : {},
            }}
            onClick={() => handleSlideClick(slide)}
          >
            <Text
              fontSize={slide.type === "title" ? 4 : 3}
              fontWeight={slide.type === "title" ? "bold" : "normal"}
              mb={3}
              sx={{
                textAlign: slide.type === "title" ? "center" : "left",
              }}
            >
              {slide.title}
            </Text>

            {slide.bulletPoints.length > 0 && (
              <Box as="ul" sx={{ paddingLeft: "20px", margin: 0 }}>
                {slide.bulletPoints.map((point) => (
                  <Box key={point._id} as="li" mb={2}>
                    <Text fontWeight="bold">{point.title}</Text>
                    {point.description && (
                      <Text mt={1} color="gray.600">
                        {point.description}
                      </Text>
                    )}
                    {point.subPoints.length > 0 && (
                      <Box as="ul" mt={2} sx={{ paddingLeft: "20px" }}>
                        {point.subPoints.map((subPoint) => (
                          <Box key={subPoint._id} as="li" mb={1}>
                            <Text fontWeight="bold">{subPoint.title}</Text>
                            {subPoint.description && (
                              <Text mt={1} color="gray.600">
                                {subPoint.description}
                              </Text>
                            )}
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            )}

            <Text mt={2} fontSize={1} color="gray" sx={{ textAlign: "right" }}>
              Slide {slide.slideNumber}
            </Text>
          </Box>
        ))}
      </Box>

      {selectedSlide && (
        <SlideEditModal
          slide={selectedSlide}
          onSave={handleSaveSlide}
          onClose={() => setSelectedSlide(null)}
        />
      )}
    </Box>
  );
};

export default DraftPreview;
