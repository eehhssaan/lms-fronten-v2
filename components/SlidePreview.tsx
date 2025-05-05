import React, { useState } from "react";
import { Box, Flex, Text } from "rebass";
import TextFormatToolbar from "./TextFormatToolbar";
import { Layout, SlideElement, layouts } from "@/data/layouts";
import { updateSlide } from "../lib/api/presentations";
import { TextFormat } from "../types/presentation";
import toast from "react-hot-toast";

const BREAKPOINTS = {
  sm: "@media screen and (max-width: 640px)",
  md: "@media screen and (max-width: 768px)",
  lg: "@media screen and (max-width: 1024px)",
};

interface SlideElementProps {
  element: SlideElement;
  value: string;
  onChange: (type: string, value: string) => void;
  onFormatChange: (type: string, format: TextFormat) => void;
  format: TextFormat;
  isSelected: boolean;
  onSelect: () => void;
}

const SlideElementComponent: React.FC<SlideElementProps> = ({
  element,
  value,
  onChange,
  onFormatChange,
  format = {},
  isSelected,
  onSelect,
}) => {
  const style = {
    position: "absolute" as const,
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    fontSize: `${format.fontSize || element.fontSize}px`,
    textAlign: (format.textAlign || element.textAlign) as
      | "left"
      | "center"
      | "right",
    fontFamily: format.fontFamily || "'Helvetica Neue', Arial, sans-serif",
    color: format.color || "#000000",
    backgroundColor: format.backgroundColor || "transparent",
    fontWeight: format.bold ? "bold" : "normal",
    fontStyle: format.italic ? "italic" : "normal",
    textDecoration: format.underline ? "underline" : "none",
    lineHeight: format.lineHeight || "1.5",
    letterSpacing: format.letterSpacing || "normal",
    textTransform: (format.textTransform || "none") as
      | "none"
      | "uppercase"
      | "lowercase"
      | "capitalize",
    padding: "16px",
    border: isSelected ? "2px solid #3182ce" : "2px solid transparent",
    outline: "none",
    borderRadius: "4px",
    cursor: "text",
    transition: "all 0.2s ease-in-out",
    [BREAKPOINTS.md]: {
      fontSize: `${
        parseInt(String(format.fontSize || element.fontSize || 32)) * 0.8
      }px`,
      padding: "12px",
    },
    [BREAKPOINTS.sm]: {
      fontSize: `${
        parseInt(String(format.fontSize || element.fontSize || 32)) * 0.7
      }px`,
      padding: "8px",
    },
  };

  const commonProps = {
    value: value || element.placeholder || "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(element.type, e.target.value),
    onClick: onSelect,
    className:
      "w-full h-full bg-transparent hover:bg-gray-50 focus:bg-white focus:shadow-sm transition-all duration-200",
    style,
  };

  if (element.type.toLowerCase().includes("title")) {
    return <input type="text" {...commonProps} />;
  }

  return <textarea {...commonProps} style={{ ...style, resize: "none" }} />;
};

interface SlidePreviewProps {
  slide: {
    _id?: string;
    title?: string;
    content?: string;
    type?: string;
    layout?: string;
    presentationId?: string;
    customStyles?: {
      backgroundColor?: string;
      textColor?: string;
      fontFamily?: string;
      fontSize?: string;
    };
    elements?: Array<{
      type: string;
      value: string;
      format?: TextFormat;
    }>;
  };
  onSlideChange: (updatedSlide: any) => void;
  currentLayout?: Layout;
}

const SlidePreview: React.FC<SlidePreviewProps> = ({
  slide,
  onSlideChange,
  currentLayout,
}) => {
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  // Get layout based on slide's layout type or default to titleAndContent
  const defaultLayout = layouts[slide.layout || "titleAndContent"];
  const layoutToUse = currentLayout || defaultLayout;

  // Transform slide data into elements format based on the layout
  const slideElements =
    slide.elements ||
    layoutToUse.elements.map((layoutElement) => {
      if (layoutElement.type === "title") {
        return {
          type: "title",
          value: slide.title || "",
          format: {},
        };
      } else if (layoutElement.type === "content") {
        return {
          type: "content",
          value: slide.content || "",
          format: {},
        };
      } else {
        return {
          type: layoutElement.type,
          value: "",
          format: {},
        };
      }
    });

  const handleElementChange = async (type: string, value: string) => {
    try {
      const updatedSlide = {
        ...slide,
        [type === "title" ? "title" : "content"]: value,
      };

      // First update local state
      onSlideChange(updatedSlide);

      // Then update in backend
      if (slide._id && slide.presentationId) {
        await updateSlide(slide.presentationId, slide._id, {
          [type === "title" ? "title" : "content"]: value,
        });
      }
    } catch (error) {
      toast.error(`Failed to update ${type}`);
      console.error(`Error updating ${type}:`, error);
    }
  };

  const handleFormatChange = async (type: string, newFormat: TextFormat) => {
    try {
      // Update the elements with new format
      const updatedElements = slideElements.map((el) =>
        el.type === type
          ? { ...el, format: { ...el.format, ...newFormat } }
          : el
      );

      const updatedSlide = {
        ...slide,
        elements: updatedElements,
        customStyles: {
          ...(slide.customStyles || {}),
          // Map relevant format properties to customStyles
          textColor: newFormat.color,
          fontFamily: newFormat.fontFamily,
          fontSize: newFormat.fontSize,
        },
      };

      // First update local state
      onSlideChange(updatedSlide);

      // Then update in backend
      if (slide._id && slide.presentationId) {
        await updateSlide(slide.presentationId, slide._id, {
          elements: updatedElements,
          customStyles: updatedSlide.customStyles,
        });
        toast.success("Style updated");
      }
    } catch (error) {
      toast.error("Failed to update style");
      console.error("Error updating style:", error);
    }
  };

  const handleSlideBackgroundChange = async (color: string) => {
    try {
      const updatedSlide = {
        ...slide,
        customStyles: {
          ...(slide.customStyles || {}),
          backgroundColor: color,
        },
      };

      // First update local state for immediate feedback
      onSlideChange(updatedSlide);

      // Then update in backend
      if (slide._id && slide.presentationId) {
        await updateSlide(slide.presentationId, slide._id, {
          customStyles: updatedSlide.customStyles,
        });
        toast.success("Slide background updated");
      }
    } catch (error) {
      toast.error("Failed to update slide background");
      console.error("Error updating slide background:", error);
    }
  };

  const selectedElementData = selectedElement
    ? slideElements.find((el) => el.type === selectedElement)
    : null;

  return (
    <Box>
      {selectedElement && selectedElementData && (
        <Box
          sx={{
            [BREAKPOINTS.md]: {
              position: "sticky",
              top: 0,
              zIndex: 10,
              backgroundColor: "white",
              borderBottom: "1px solid #e2e8f0",
              marginBottom: "8px",
            },
          }}
        >
          <TextFormatToolbar
            format={selectedElementData.format || {}}
            onFormatChange={(newFormat) =>
              handleFormatChange(selectedElement, newFormat)
            }
            onSlideBackgroundChange={handleSlideBackgroundChange}
            currentSlideBackground={slide.customStyles?.backgroundColor}
          />
        </Box>
      )}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          paddingTop: "56.25%", // 16:9 aspect ratio
          backgroundColor: slide.customStyles?.backgroundColor || "white",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          },
          [BREAKPOINTS.md]: {
            borderRadius: "4px",
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            transform: "scale(0.85)", // Scale down the content slightly
            transformOrigin: "center center", // Center the scaling
            width: "100%",
            height: "100%",
            padding: "2%", // Add some padding to prevent content from touching edges
          }}
        >
          {layoutToUse.elements.map((layoutElement) => {
            const slideElement = slideElements.find(
              (el) => el.type === layoutElement.type
            ) || { type: layoutElement.type, value: "", format: {} };

            // Adjust font sizes for the smaller container
            const baseFontSize = slideElement.type === "title" ? 36 : 18; // Reduced from 44/24

            return (
              <SlideElementComponent
                key={layoutElement.type}
                element={{
                  ...layoutElement,
                  fontSize: baseFontSize,
                }}
                value={slideElement.value}
                onChange={handleElementChange}
                onFormatChange={handleFormatChange}
                format={slideElement.format || {}}
                isSelected={selectedElement === layoutElement.type}
                onSelect={() => setSelectedElement(layoutElement.type)}
              />
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export const MiniSlidePreview: React.FC<{
  slide: any;
  isSelected?: boolean;
}> = ({ slide, isSelected = false }) => {
  const defaultLayout = layouts[slide.layout || "titleAndContent"];
  const layoutElements = defaultLayout.elements;

  // Use the same element structure as the main preview
  const slideElements =
    slide.elements ||
    layoutElements.map((layoutElement) => {
      if (layoutElement.type === "title") {
        return {
          type: "title",
          value: slide.title || "",
          format: {},
        };
      } else if (layoutElement.type === "content") {
        return {
          type: "content",
          value: slide.content || "",
          format: {},
        };
      } else {
        return {
          type: layoutElement.type,
          value: "",
          format: {},
        };
      }
    });

  // Container scale factor
  const SCALE_FACTOR = 0.25; // 25% of original size

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        paddingTop: "56.25%", // 16:9 aspect ratio
        backgroundColor: slide.customStyles?.backgroundColor || "white",
        border: isSelected ? "2px solid #3182ce" : "1px solid #e2e8f0",
        borderRadius: "4px",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          transform: "translateY(-1px)",
        },
        [BREAKPOINTS.md]: {
          marginRight: "8px",
          minWidth: "200px",
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: `scale(${SCALE_FACTOR})`,
          transformOrigin: "top left",
          width: `${100 / SCALE_FACTOR}%`, // Compensate for scale
          height: `${100 / SCALE_FACTOR}%`, // Compensate for scale
        }}
      >
        {layoutElements.map((layoutElement) => {
          const slideElement = slideElements.find(
            (el: { type: string; value: string; format?: TextFormat }) =>
              el.type === layoutElement.type
          ) || { type: layoutElement.type, value: "", format: {} };

          // Match the exact font size calculation from SlideElementComponent
          const baseFontSize =
            slideElement.format?.fontSize ||
            layoutElement.fontSize ||
            (slideElement.type === "title" ? 44 : 32);

          const style = {
            position: "absolute" as const,
            left: layoutElement.x,
            top: layoutElement.y,
            width: layoutElement.width,
            height: layoutElement.height,
            fontSize: `${baseFontSize}px`,
            textAlign: (slideElement.format?.textAlign ||
              layoutElement.textAlign ||
              "left") as "left" | "center" | "right",
            fontFamily:
              slideElement.format?.fontFamily ||
              "'Helvetica Neue', Arial, sans-serif",
            color: slideElement.format?.color || "#000000",
            backgroundColor:
              slideElement.format?.backgroundColor || "transparent",
            fontWeight: slideElement.format?.bold ? "bold" : "normal",
            fontStyle: slideElement.format?.italic ? "italic" : "normal",
            textDecoration: slideElement.format?.underline
              ? "underline"
              : "none",
            lineHeight: slideElement.format?.lineHeight || "1.5",
            letterSpacing: slideElement.format?.letterSpacing || "normal",
            textTransform: (slideElement.format?.textTransform || "none") as
              | "none"
              | "uppercase"
              | "lowercase"
              | "capitalize",
            padding: "16px",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: slideElement.type === "title" ? 1 : 2,
            WebkitBoxOrient: "vertical" as const,
            wordBreak: "break-word" as const,
            [BREAKPOINTS.md]: {
              fontSize: `${parseInt(String(baseFontSize)) * 0.8}px`,
              padding: "12px",
            },
            [BREAKPOINTS.sm]: {
              fontSize: `${parseInt(String(baseFontSize)) * 0.7}px`,
              padding: "8px",
            },
          };

          return (
            <Box key={layoutElement.type} sx={style}>
              {slideElement.value || layoutElement.placeholder || ""}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default SlidePreview;
