import React, { useState } from "react";
import { Box, Text, Flex } from "rebass";
import {
  PresentationDraftSlide,
  PresentationDraftBulletPoint,
} from "../types/presentation";

interface SlideEditModalProps {
  slide: PresentationDraftSlide;
  onSave: (updatedSlide: PresentationDraftSlide) => void;
  onClose: () => void;
}

const SlideEditModal: React.FC<SlideEditModalProps> = ({
  slide,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState(slide.title);
  const [bulletPoints, setBulletPoints] = useState<
    PresentationDraftBulletPoint[]
  >([...slide.bulletPoints]);

  const handleAddBulletPoint = () => {
    setBulletPoints([
      ...bulletPoints,
      {
        title: "",
        description: "",
        _id: `temp_${Date.now()}`,
        subPoints: [],
      },
    ]);
  };

  const handleRemoveBulletPoint = (index: number) => {
    setBulletPoints(bulletPoints.filter((_, i) => i !== index));
  };

  const handleBulletPointChange = (
    index: number,
    field: "title" | "description",
    value: string
  ) => {
    const newBulletPoints = [...bulletPoints];
    newBulletPoints[index] = {
      ...newBulletPoints[index],
      [field]: value,
    };
    setBulletPoints(newBulletPoints);
  };

  const handleMoveBulletPoint = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === bulletPoints.length - 1)
    )
      return;

    const newBulletPoints = [...bulletPoints];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newBulletPoints[index], newBulletPoints[newIndex]] = [
      newBulletPoints[newIndex],
      newBulletPoints[index],
    ];
    setBulletPoints(newBulletPoints);
  };

  const handleSave = () => {
    // Filter out empty bullet points
    const filteredBulletPoints = bulletPoints.filter(
      (point) => point.title.trim() || point.description?.trim()
    );
    onSave({
      ...slide,
      title,
      bulletPoints: filteredBulletPoints,
    });
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <Box
        sx={{
          backgroundColor: "white",
          padding: "24px",
          borderRadius: "8px",
          width: "90%",
          maxWidth: "600px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <Text fontSize={3} fontWeight="bold" mb={3}>
          Edit Slide {slide.slideNumber}
        </Text>

        <Box mb={4}>
          <Text mb={2} fontWeight="bold">
            Title:
          </Text>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          />
        </Box>

        <Box mb={4}>
          <Flex justifyContent="space-between" alignItems="center" mb={2}>
            <Text fontWeight="bold">Bullet Points:</Text>
            <button
              onClick={handleAddBulletPoint}
              style={{
                padding: "4px 8px",
                borderRadius: "4px",
                border: "1px solid #0070f3",
                backgroundColor: "white",
                color: "#0070f3",
                cursor: "pointer",
              }}
            >
              Add Bullet Point
            </button>
          </Flex>

          {bulletPoints.map((point, index) => (
            <Box key={point._id} mb={4}>
              <Flex mb={2} alignItems="flex-start">
                <Box flex={1}>
                  <input
                    type="text"
                    value={point.title}
                    placeholder="Title"
                    onChange={(e) =>
                      handleBulletPointChange(index, "title", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid #ddd",
                      marginBottom: "8px",
                    }}
                  />
                  <textarea
                    value={point.description || ""}
                    placeholder="Description (optional)"
                    onChange={(e) =>
                      handleBulletPointChange(
                        index,
                        "description",
                        e.target.value
                      )
                    }
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid #ddd",
                      minHeight: "60px",
                      resize: "vertical",
                    }}
                  />
                </Box>
                <Flex ml={2} alignItems="flex-start">
                  <button
                    onClick={() => handleMoveBulletPoint(index, "up")}
                    disabled={index === 0}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      border: "1px solid #ddd",
                      backgroundColor: "white",
                      cursor: index === 0 ? "not-allowed" : "pointer",
                      opacity: index === 0 ? 0.5 : 1,
                    }}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleMoveBulletPoint(index, "down")}
                    disabled={index === bulletPoints.length - 1}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      border: "1px solid #ddd",
                      backgroundColor: "white",
                      cursor:
                        index === bulletPoints.length - 1
                          ? "not-allowed"
                          : "pointer",
                      opacity: index === bulletPoints.length - 1 ? 0.5 : 1,
                      marginLeft: "4px",
                    }}
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => handleRemoveBulletPoint(index)}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      border: "1px solid #ff4444",
                      backgroundColor: "white",
                      color: "#ff4444",
                      cursor: "pointer",
                      marginLeft: "4px",
                    }}
                  >
                    ×
                  </button>
                </Flex>
              </Flex>
            </Box>
          ))}
        </Box>

        <Flex justifyContent="flex-end" mt={4}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              backgroundColor: "white",
              marginRight: "8px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "8px 16px",
              borderRadius: "4px",
              border: "none",
              backgroundColor: "#0070f3",
              color: "white",
              cursor: "pointer",
            }}
          >
            Save Changes
          </button>
        </Flex>
      </Box>
    </Box>
  );
};

export default SlideEditModal;
