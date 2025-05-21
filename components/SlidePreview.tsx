import React, { useState, useEffect, useRef } from "react";
import { Box, Flex, Text } from "rebass";
import TextFormatToolbar from "./TextFormatToolbar";
import { getLayouts } from "@/lib/api/presentations";
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

interface SlideElement {
  type: string;
  x: string | number;
  y: string | number;
  width: string | number;
  height: string | number;
  fontSize?: string | number;
  textAlign?: "left" | "center" | "right";
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  lineHeight?: string | number;
  letterSpacing?: string | number;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  placeholder?: string;
}

interface Layout {
  _id: string;
  name: string;
  description: string;
  elements: SlideElement[];
  thumbnail?: string;
  isDefault?: boolean;
}

const parseFontSize = (fontSize: string | number | undefined): string => {
  if (!fontSize) return "12pt";
  if (typeof fontSize === "number") return `${fontSize}pt`;
  // Always store font sizes in pt
  if (typeof fontSize === "string") {
    const numericValue = parseInt(fontSize);
    return `${numericValue}pt`;
  }
  return "12pt";
};

const getFontSizeInPx = (fontSize: string): string => {
  // Always assume the input is in pt and convert to px for display
  const pt = parseInt(fontSize.replace("pt", ""));
  return `${Math.round(pt * 1.333)}px`;
};

const getResponsiveFontSize = (fontSize: string, scale: number): string => {
  // Input is in pt, convert to px with scaling
  const pt = parseInt(fontSize.replace("pt", ""));
  return `${Math.round(pt * 1.333 * scale)}px`;
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
  // Get default text alignment based on element type
  const defaultTextAlign = element.type === "title" ? "center" : "left";

  const elementStyle = {
    position: "absolute" as const,
    left: typeof element.x === "string" ? element.x : `${element.x}%`,
    top: typeof element.y === "string" ? element.y : `${element.y}%`,
    width:
      typeof element.width === "string" ? element.width : `${element.width}%`,
    height:
      typeof element.height === "string"
        ? element.height
        : `${element.height}%`,
    transform: "translate(-50%, -50%)",
    display: "flex",
    alignItems: "center",
    justifyContent:
      (format.textAlign || defaultTextAlign) === "center"
        ? "center"
        : (format.textAlign || defaultTextAlign) === "right"
        ? "flex-end"
        : "flex-start",
    backgroundColor: format.backgroundColor || "transparent",
    border: isSelected ? "2px solid #3182ce" : "none",
    margin: 0,
    padding: 0,
  };

  const inputStyle = {
    width: "100%",
    height: "100%",
    fontSize: format.fontSize || (element.type === "title" ? "44pt" : "24pt"),
    fontFamily:
      format.fontFamily ||
      (element.type === "title"
        ? "var(--font-montserrat)"
        : "var(--font-opensans)"),
    color: format.color || "#2D3748",
    backgroundColor: "transparent",
    fontWeight: format.bold ? "bold" : "normal",
    fontStyle: format.italic ? "italic" : "normal",
    textDecoration: format.underline ? "underline" : "none",
    textAlign: format.textAlign || defaultTextAlign,
    lineHeight: format.lineHeight || "1.5",
    letterSpacing: format.letterSpacing || "normal",
    textTransform: format.textTransform || "none",
    padding: 0,
    margin: 0,
    outline: "none",
    border: "none",
    display: "block",
    overflow: element.type === "title" ? "hidden" : "auto",
    whiteSpace: element.type === "title" ? "nowrap" : "pre-wrap",
    textOverflow: element.type === "title" ? "ellipsis" : "unset",
    resize: "none" as const,
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
    style: inputStyle,
  };

  return (
    <Box sx={elementStyle}>
      {element.type === "title" ? (
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
    type?: string;
    layout?: string;
    presentationId?: string;
    customStyles?: {
      backgroundColor?: string;
      textColor?: string;
      fontFamily?: string;
      fontSize?: string;
    };
    elements: Array<{
      type: string;
      value: string;
      format?: TextFormat;
    }>;
    aspectRatio?: string;
  };
  onSlideChange: (updatedSlide: any) => void;
  currentLayout?: Layout;
}

const DESIGN_WIDTH = 1280;
const DESIGN_HEIGHT = 720;

const SlidePreview: React.FC<SlidePreviewProps> = ({
  slide,
  onSlideChange,
  currentLayout,
}) => {
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [layouts, setLayouts] = useState<Record<string, Layout>>({});
  const [loading, setLoading] = useState(true);
  const [defaultLayoutId, setDefaultLayoutId] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      if (!container) return;
      const { width, height } = container.getBoundingClientRect();
      const scaleX = width / DESIGN_WIDTH;
      const scaleY = height / DESIGN_HEIGHT;
      setScale(Math.min(scaleX, scaleY));
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchLayouts = async () => {
      try {
        setLoading(true);
        const response = await getLayouts();
        if (response.success) {
          const layoutsMap = response.data.reduce(
            (acc: Record<string, Layout>, layout: Layout) => {
              acc[layout._id] = layout;
              return acc;
            },
            {}
          );
          setLayouts(layoutsMap);

          // Find and set the default layout ID
          const defaultLayout = response.data.find(
            (layout: Layout) => layout.isDefault
          );
          if (defaultLayout) {
            setDefaultLayoutId(defaultLayout._id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch layouts:", error);
        toast.error("Failed to load layouts");
      } finally {
        setLoading(false);
      }
    };
    fetchLayouts();
  }, []);

  if (loading) {
    return (
      <Box p={4} bg="white" borderRadius={8}>
        <Text>Loading layouts...</Text>
      </Box>
    );
  }

  // Get layout based on slide's layout type or default layout
  const layoutToUse = currentLayout || layouts[defaultLayoutId];

  if (!layoutToUse) {
    return (
      <Box p={4} bg="white" borderRadius={8}>
        <Text color="error">Layout not found</Text>
      </Box>
    );
  }

  // Calculate aspect ratio and dimensions
  const aspectRatio = slide.aspectRatio || "16:9";
  const [width, height] = aspectRatio.split(":").map(Number);
  const paddingTop = `${(height / width) * 100}%`;

  // Transform slide data into elements format based on the layout
  const slideElements =
    slide.elements ||
    layoutToUse.elements.map((layoutElement: SlideElement) => {
      // Extract formatting properties from the layout element and ensure correct types
      const layoutFormat: TextFormat = {
        fontSize:
          typeof layoutElement.fontSize === "number"
            ? `${layoutElement.fontSize}pt`
            : layoutElement.fontSize,
        fontFamily: layoutElement.fontFamily,
        color: layoutElement.color,
        backgroundColor: layoutElement.backgroundColor,
        bold: layoutElement.bold,
        italic: layoutElement.italic,
        underline: layoutElement.underline,
        textAlign: layoutElement.textAlign,
        lineHeight:
          typeof layoutElement.lineHeight === "number"
            ? `${layoutElement.lineHeight}`
            : layoutElement.lineHeight,
        letterSpacing:
          typeof layoutElement.letterSpacing === "number"
            ? `${layoutElement.letterSpacing}px`
            : layoutElement.letterSpacing,
        textTransform: layoutElement.textTransform,
      };

      if (layoutElement.type === "title") {
        return {
          type: "title",
          value: slide.title || "",
          format: layoutFormat,
        };
      } else if (layoutElement.type === "content") {
        // Find content element from slide.elements or use empty string
        const contentElement = slide.elements?.find(
          (el) => el.type === "content"
        );
        return {
          type: "content",
          value: contentElement?.value || "",
          format: layoutFormat,
        };
      } else {
        return {
          type: layoutElement.type,
          value: "",
          format: layoutFormat,
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
      };

      // First update local state
      onSlideChange(updatedSlide);

      // Then update in backend
      if (slide._id && slide.presentationId) {
        await updateSlide(slide.presentationId, slide._id, {
          elements: updatedElements,
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
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      <div
        style={{
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "absolute",
          top: 0,
          left: 0,
          background: slide.customStyles?.backgroundColor || "#fff",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
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
              padding: 0, // Remove all extra padding
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
                fontSize:
                  slideElement.format?.fontSize || layoutElement.fontSize,
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
      </div>
    </div>
  );
};

export const MiniSlidePreview: React.FC<{
  slide: any;
  isSelected?: boolean;
  layouts?: Record<string, Layout>;
  defaultLayoutId?: string;
}> = ({ slide, isSelected = false, layouts = {}, defaultLayoutId = "" }) => {
  const layout = slide.layout
    ? layouts[slide.layout]
    : layouts[defaultLayoutId];

  const getDefaultFormat = (elementType: string) => ({
    fontSize: elementType === "title" ? "44pt" : "24pt",
    fontFamily:
      elementType === "title"
        ? "var(--font-montserrat)"
        : "var(--font-opensans)",
    color: elementType === "title" ? "#6B46C1" : "#2D3748",
    textAlign: elementType === "title" ? "center" : "left",
    lineHeight: "1.5",
    letterSpacing: "normal",
    textTransform: "none",
  });

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        paddingTop: "56.25%",
        backgroundColor: slide.customStyles?.backgroundColor || "#FFFFFF",
        border: isSelected ? "2px solid #3182ce" : "1px solid #e2e8f0",
        borderRadius: "4px",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          padding: "16px",
        }}
      >
        {layout?.elements.map((element, index) => {
          const slideElement = slide.elements?.find(
            (e: any) => e.type === element.type
          );
          const format = {
            ...getDefaultFormat(element.type),
            ...(slideElement?.format || {}),
          };

          return (
            <Box
              key={`${element.type}-${index}`}
              sx={{
                position: "absolute",
                left:
                  typeof element.x === "string" ? element.x : `${element.x}%`,
                top:
                  typeof element.y === "string" ? element.y : `${element.y}%`,
                width:
                  typeof element.width === "string"
                    ? element.width
                    : `${element.width}%`,
                height:
                  typeof element.height === "string"
                    ? element.height
                    : `${element.height}%`,
                transform: "translate(-50%, -50%)",
                fontSize: getResponsiveFontSize(format.fontSize || "24pt", 0.2),
                fontFamily: format.fontFamily,
                color: format.color,
                textAlign: format.textAlign,
                fontWeight: format.bold ? "bold" : "normal",
                fontStyle: format.italic ? "italic" : "normal",
                textDecoration: format.underline ? "underline" : "none",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: element.type === "title" ? "nowrap" : "normal",
              }}
            >
              {slideElement?.value || element.placeholder || ""}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default SlidePreview;
