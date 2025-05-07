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
  element: SlideElement & {
    fontSize?: string | number;
  };
  value: string;
  onChange: (type: string, value: string) => void;
  onFormatChange: (type: string, format: TextFormat) => void;
  format: TextFormat;
  isSelected: boolean;
  onSelect: () => void;
}

const parseFontSize = (fontSize: string | number | undefined): string => {
  if (!fontSize) return "12pt";
  if (typeof fontSize === "number") return `${fontSize}pt`;
  // Handle '48pt' format
  if (typeof fontSize === "string") {
    if (fontSize.endsWith("pt")) return fontSize;
    if (fontSize.endsWith("px")) {
      // Convert px to pt (1pt ≈ 1.333px)
      const px = parseInt(fontSize);
      return `${Math.round(px / 1.333)}pt`;
    }
    return `${parseInt(fontSize)}pt`;
  }
  return "12pt";
};

const getFontSizeInPx = (fontSize: string): string => {
  if (fontSize.endsWith("pt")) {
    // Convert pt to px (1pt ≈ 1.333px)
    const pt = parseInt(fontSize.replace("pt", ""));
    return `${Math.round(pt * 1.333)}px`;
  }
  if (fontSize.endsWith("px")) return fontSize;
  return `${parseInt(fontSize)}px`;
};

const getFontSizeValue = (fontSize: string): number => {
  return parseInt(fontSize.replace(/[^0-9]/g, ""));
};

const getResponsiveFontSize = (fontSize: string, scale: number): string => {
  const pt = parseInt(fontSize.replace("pt", ""));
  return getFontSizeInPx(`${Math.round(pt * scale)}pt`);
};

const SlideElementComponent: React.FC<SlideElementProps> = ({
  element,
  value,
  onChange,
  onFormatChange,
  format = {},
  isSelected,
  onSelect,
}) => {
  const baseSize = parseFontSize(format.fontSize || element.fontSize);
  const isTitle = element.type.toLowerCase().includes("title");

  // Base container style
  const containerStyle = {
    position: "absolute" as const,
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    display: "flex",
    alignItems: "center",
    justifyContent: format.textAlign === "center" ? "center" : "flex-start",
    padding: 0,
    margin: 0,
    backgroundColor: "transparent",
    border: isSelected ? "2px solid #3182ce" : "none",
  };

  // Common input/textarea styles
  const elementStyle = {
    width: "100%",
    height: "100%",
    fontSize: getFontSizeInPx(baseSize),
    fontFamily: format.fontFamily || "'Helvetica Neue', Arial, sans-serif",
    color: format.color || "#000000",
    backgroundColor: "transparent",
    fontWeight: format.bold ? "bold" : "normal",
    fontStyle: format.italic ? "italic" : "normal",
    textDecoration: format.underline ? "underline" : "none",
    textAlign: (format.textAlign || element.textAlign || "left") as
      | "left"
      | "center"
      | "right",
    lineHeight: format.lineHeight || "1.5",
    letterSpacing: format.letterSpacing || "normal",
    textTransform: format.textTransform || "none",
    padding: "16px",
    margin: 0,
    outline: "none",
    border: "none",
    display: "block",
    overflow: isTitle ? "hidden" : "auto",
    whiteSpace: isTitle ? "nowrap" : "pre-wrap",
    textOverflow: isTitle ? "ellipsis" : "unset",
    resize: "none" as const,
    [BREAKPOINTS.md]: {
      fontSize: getResponsiveFontSize(baseSize, 0.8),
      padding: "12px",
    },
    [BREAKPOINTS.sm]: {
      fontSize: getResponsiveFontSize(baseSize, 0.7),
      padding: "8px",
    },
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onChange(element.type, e.target.value);
  };

  const commonProps = {
    value: value || element.placeholder || "",
    onChange: handleChange,
    onClick: onSelect,
    className:
      "bg-transparent hover:bg-gray-50/10 focus:bg-transparent focus:shadow-sm transition-all duration-200",
    style: elementStyle,
  };

  return (
    <Box sx={containerStyle}>
      {isTitle ? (
        <input type="text" {...commonProps} />
      ) : (
        <textarea {...commonProps} />
      )}
    </Box>
  );
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
    aspectRatio?: string;
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

  // Calculate aspect ratio and dimensions
  const aspectRatio = slide.aspectRatio || "16:9";
  const [width, height] = aspectRatio.split(":").map(Number);
  const paddingTop = `${(height / width) * 100}%`;

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
      // Update both the direct field and the elements array
      const updatedElements = slideElements.map((el) =>
        el.type === type ? { ...el, value } : el
      );

      const updatedSlide = {
        ...slide,
        [type === "title" ? "title" : "content"]: value,
        elements: updatedElements,
      };

      // First update local state
      onSlideChange(updatedSlide);

      // Then update in backend
      if (slide._id && slide.presentationId) {
        await updateSlide(slide.presentationId, slide._id, {
          [type === "title" ? "title" : "content"]: value,
          elements: updatedElements,
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

  const containerStyle = {
    position: "relative" as const,
    width: "100%",
    paddingTop,
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
  };

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
      <Box sx={containerStyle}>
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            padding: "2%",
          }}
        >
          {layoutToUse.elements.map((layoutElement) => {
            const slideElement = slideElements.find(
              (el) => el.type === layoutElement.type
            ) || { type: layoutElement.type, value: "", format: {} };

            // Calculate element dimensions based on layout specifications
            const elementWithDimensions = {
              ...layoutElement,
              x:
                typeof layoutElement.x === "string"
                  ? layoutElement.x
                  : `${layoutElement.x}%`,
              y:
                typeof layoutElement.y === "string"
                  ? layoutElement.y
                  : `${layoutElement.y}%`,
              width:
                typeof layoutElement.width === "string"
                  ? layoutElement.width
                  : `${layoutElement.width}%`,
              height:
                typeof layoutElement.height === "string"
                  ? layoutElement.height
                  : `${layoutElement.height}%`,
              fontSize: slideElement.type === "title" ? 36 : 18,
            };

            return (
              <SlideElementComponent
                key={layoutElement.type}
                element={elementWithDimensions}
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

  // Ensure we're using the slide's elements with their formats
  const slideElements =
    slide.elements ||
    layoutElements.map((layoutElement) => {
      if (layoutElement.type === "title") {
        return {
          type: "title",
          value: slide.title || "",
          format: slide.customStyles || {},
        };
      } else if (layoutElement.type === "content") {
        return {
          type: "content",
          value: slide.content || "",
          format: slide.customStyles || {},
        };
      } else {
        return {
          type: layoutElement.type,
          value: "",
          format: slide.customStyles || {},
        };
      }
    });

  // Use the same aspect ratio as the main slide
  const aspectRatio = slide.aspectRatio || "16:9";
  const [width, height] = aspectRatio.split(":").map(Number);
  const paddingTop = `${(height / width) * 100}%`;

  // Calculate scale based on the container width (200px in mobile)
  const SCALE_FACTOR = 0.3;
  const containerStyle = {
    position: "relative" as const,
    width: "100%",
    paddingTop,
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
  };

  return (
    <Box sx={containerStyle}>
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: `scale(${SCALE_FACTOR})`,
          transformOrigin: "top left",
          width: `${100 / SCALE_FACTOR}%`,
          height: `${100 / SCALE_FACTOR}%`,
          padding: "2%",
        }}
      >
        {layoutElements.map((layoutElement) => {
          const slideElement = slideElements.find(
            (el: { type: string; value: string; format?: TextFormat }) =>
              el.type === layoutElement.type
          ) || { type: layoutElement.type, value: "", format: {} };

          const isTitle = layoutElement.type === "title";
          const elementFormat = slideElement.format || {};

          // Calculate dimensions based on layout element's specifications
          const elementStyle = {
            position: "absolute" as const,
            left:
              typeof layoutElement.x === "string"
                ? layoutElement.x
                : `${layoutElement.x}%`,
            top:
              typeof layoutElement.y === "string"
                ? layoutElement.y
                : `${layoutElement.y}%`,
            width:
              typeof layoutElement.width === "string"
                ? layoutElement.width
                : `${layoutElement.width}%`,
            height:
              typeof layoutElement.height === "string"
                ? layoutElement.height
                : `${layoutElement.height}%`,
            fontSize: getFontSizeInPx(
              parseFontSize(
                elementFormat.fontSize || (isTitle ? "36pt" : "24pt")
              )
            ),
            textAlign: (elementFormat.textAlign ||
              layoutElement.textAlign ||
              "left") as "left" | "center" | "right",
            fontFamily:
              elementFormat.fontFamily || "'Helvetica Neue', Arial, sans-serif",
            color: elementFormat.color || "#000000",
            backgroundColor: "transparent",
            fontWeight: elementFormat.bold
              ? "bold"
              : isTitle
              ? "bold"
              : "normal",
            fontStyle: elementFormat.italic ? "italic" : "normal",
            textDecoration: elementFormat.underline ? "underline" : "none",
            padding: isTitle ? "12px" : "8px",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: isTitle ? 1 : 3,
            WebkitBoxOrient: "vertical" as const,
            lineHeight: elementFormat.lineHeight || (isTitle ? "1.2" : "1.4"),
            textOverflow: "ellipsis",
            wordBreak: "break-word" as const,
            margin: 0,
            userSelect: "none" as const,
          };

          return (
            <Box key={layoutElement.type} sx={elementStyle}>
              {slideElement.value || ""}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default SlidePreview;
