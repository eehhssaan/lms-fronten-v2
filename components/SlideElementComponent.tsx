import React from "react";
import { Box } from "rebass";
import { TextFormat, Slide, SlideElement } from "../types/presentation";

interface SlideElementProps {
  element: SlideElement & {
    fontSize?: string | number;
  };
  value: string;
  onChange: (type: string, value: string) => void;
  onFormatChange: (type: string, format: TextFormat) => void;
  format: TextFormat;
  isSelected: boolean;
  onSelect: () => void;
  slide?: Slide;
}

const SlideElementComponent: React.FC<SlideElementProps> = ({
  element,
  value,
  onChange,
  onFormatChange,
  format = {},
  isSelected,
  onSelect,
  slide,
}) => {
  // Use the exact positioning from the backend
  const elementStyle = {
    position: "absolute" as const,
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    border: isSelected ? "2px solid #3182ce" : "none",
    transform: "translate(-50%, -50%)",
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onChange(element.type, e.target.value);
  };

  if (element.type === "image") {
    return (
      <Box sx={elementStyle} onClick={onSelect}>
        <img
          src={value || slide?.imageUrl}
          alt="Slide content"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </Box>
    );
  }

  // Apply only the format properties that come from the backend
  const textStyle = {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
    outline: "none",
    border: "none",
    margin: 0,
    padding: 0,
    ...format, // Use format properties directly from backend
  };

  return (
    <Box sx={elementStyle}>
      {element.type === "title" ? (
        <input
          type="text"
          value={value || element.placeholder || ""}
          onChange={handleChange}
          onClick={onSelect}
          style={textStyle}
        />
      ) : (
        <textarea
          value={value || element.placeholder || ""}
          onChange={handleChange}
          onClick={onSelect}
          style={textStyle}
        />
      )}
    </Box>
  );
};

export default SlideElementComponent;
