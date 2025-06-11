import React from "react";
import { Box } from "rebass";
import { TextFormat, Slide, SlideElement } from "../types/presentation";
import { background } from "@chakra-ui/react";

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
  // Convert percentage strings to numbers for calculations
  const getPositionValue = (value: string | number) => {
    if (typeof value === "string" && value.endsWith("%")) {
      // Convert percentage to decimal and multiply by container width
      return `${(parseFloat(value) / 100) * 945}px`;
    }
    return typeof value === "string" ? value : `${value}px`;
  };

  const elementStyle = {
    position: "absolute",
    left: getPositionValue(element.x),
    top: getPositionValue(element.y),
    width: getPositionValue(element.width),
    height: getPositionValue(element.height),
    transform: "translateX(-50%)", // Center horizontally
    border: isSelected ? "2px solid #3182ce" : "none",
    // Handle position-based adjustments
    ...(element.position &&
      element.position !== "default" && {
        transform:
          element.position === "right"
            ? "translateX(-100%)"
            : element.position === "top"
            ? "translateY(100%)"
            : "translateX(-50%)", // Keep centering for default
      }),
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onChange(element.type, e.target.value);
  };

  const textStyle = {
    width: "100%",
    height: "100%",
    padding: "8px",
    border: "none",
    outline: "none",
    resize: "none" as const,
    backgroundColor: format.backgroundColor,
    fontSize: format.fontSize || (element.type === "title" ? "24pt" : "14pt"),
    fontFamily:
      format.fontFamily ||
      (element.type === "title"
        ? "var(--font-montserrat)"
        : "var(--font-opensans)"),
    color: format.color || (element.type === "title" ? "#6B46C1" : "#2D3748"),
    textAlign: (format.textAlign ||
      (element.type === "title" ? "center" : "left")) as
      | "left"
      | "center"
      | "right",
    fontWeight: format.bold ? "bold" : "normal",
    fontStyle: format.italic ? "italic" : "normal",
    textDecoration: format.underline ? "underline" : "none",
    lineHeight: format.lineHeight || (element.type === "title" ? "1.2" : "1.4"),
    letterSpacing: format.letterSpacing,
    textTransform: format.textTransform,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: element.type === "title" ? "nowrap" : "normal",
    display: element.type === "title" ? "flex" : "block",
    alignItems: element.type === "title" ? "center" : undefined,
    justifyContent: element.type === "title" ? "center" : undefined,
  };

  if (element.type === "image") {
    return (
      <Box
        sx={{
          ...elementStyle,
          overflow: "hidden",
          backgroundColor: format.backgroundColor,
        }}
        onClick={onSelect}
      >
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

  return (
    <Box sx={elementStyle}>
      {element.type === "title" ? (
        <input
          type="text"
          value={value || element.placeholder || ""}
          onChange={handleChange}
          onClick={onSelect}
          placeholder={element.placeholder}
          style={textStyle}
        />
      ) : (
        <textarea
          value={value || element.placeholder || ""}
          onChange={handleChange}
          onClick={onSelect}
          placeholder={element.placeholder}
          style={textStyle}
        />
      )}
    </Box>
  );
};

export default SlideElementComponent;
