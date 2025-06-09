import React from "react";
import { Box, Button } from "rebass";

interface PositionControlProps {
  elementId: string;
  currentPosition: string;
  onPositionChange: (
    position: "left" | "right" | "top" | "default"
  ) => Promise<void>;
}

const ElementPositionControl: React.FC<PositionControlProps> = ({
  elementId,
  currentPosition,
  onPositionChange,
}) => {
  return (
    <Box sx={{ display: "flex", gap: "8px", mb: 3 }}>
      <Button
        onClick={() => onPositionChange("left")}
        sx={{
          bg: currentPosition === "left" ? "red" : "primary",
          color: currentPosition === "left" ? "white" : "primary",
          border: "1px solid",
          borderColor: "primary",
          px: 3,
          py: 2,
          cursor: "pointer",
          "&:hover": {
            opacity: 0.8,
            bg: "red",
          },
        }}
      >
        Left
      </Button>
      <Button
        onClick={() => onPositionChange("right")}
        sx={{
          bg: currentPosition === "right" ? "red" : "primary",
          color: currentPosition === "right" ? "white" : "primary",
          border: "1px solid",
          borderColor: "primary",
          px: 3,
          py: 2,
          cursor: "pointer",
          "&:hover": {
            opacity: 0.8,
            bg: "red",
          },
        }}
      >
        Right
      </Button>
      <Button
        onClick={() => onPositionChange("top")}
        sx={{
          bg: currentPosition === "top" ? "red" : "primary",
          color: currentPosition === "top" ? "white" : "primary",
          border: "1px solid",
          borderColor: "primary",
          px: 3,
          py: 2,
          cursor: "pointer",
          "&:hover": {
            opacity: 0.8,
            bg: "red",
          },
        }}
      >
        Top
      </Button>
      {currentPosition !== "default" && (
        <Button
          onClick={() => onPositionChange("default")}
          sx={{
            bg: currentPosition === "top" ? "red" : "primary",
            color: currentPosition === "top" ? "white" : "primary",
            border: "1px solid",
            borderColor: "text",
            px: 3,
            py: 2,
            cursor: "pointer",
            "&:hover": {
              opacity: 0.8,
              bg: "red",
            },
          }}
        >
          Reset
        </Button>
      )}
    </Box>
  );
};

export default ElementPositionControl;
