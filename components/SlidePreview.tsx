import React, { useState } from "react";
import { Box, Text, Flex } from "rebass";
import TextFormatToolbar from "./TextFormatToolbar";
import {
  updateSlide,
  updateSlideElementPosition,
} from "../lib/api/presentations";
import {
  TextFormat,
  SlideElement,
  Layout,
  Slide,
  SlideLayout,
} from "../types/presentation";
import toast from "react-hot-toast";
import { useLayouts } from "@/context/LayoutsContext";
import SlideElementComponent from "./SlideElementComponent";
import ElementPositionControl from "./ElementPositionControl";
import LayoutSelector from "./LayoutSelector";

interface SlidePreviewProps {
  slide: Slide & {
    aspectRatio?: string;
  };
  onSlideChange: (updatedSlide: Partial<Slide>) => void;
  onElementChange?: (elementId: string, updates: Partial<SlideElement>) => void;
  onLayoutChange?: (layoutId: string) => void;
  onBackgroundChange?: (backgroundColor: string) => void;
  currentLayout?: Layout;
}

const SlidePreview: React.FC<SlidePreviewProps> = ({
  slide,
  onSlideChange,
  onElementChange,
  onLayoutChange,
  onBackgroundChange,
  currentLayout,
}) => {
  const [selectedElement, setSelectedElement] = useState<SlideElement | null>(
    null
  );
  const [showFormatToolbar, setShowFormatToolbar] = useState(false);
  const [showLayoutSelector, setShowLayoutSelector] = useState(false);
  const { layouts } = useLayouts();

  const handleElementClick = (element: SlideElement) => {
    setSelectedElement(element);
    setShowFormatToolbar(true);
  };

  const handleFormatChange = (format: Partial<TextFormat>) => {
    if (!selectedElement?._id) return;

    onElementChange?.(selectedElement._id, {
      format: { ...selectedElement.format, ...format },
    });

    onSlideChange({
      elements: slide.elements.map((el) =>
        el._id === selectedElement._id
          ? { ...el, format: { ...el.format, ...format } }
          : el
      ),
    });
  };

  const handlePositionChange = (updates: Partial<SlideElement>) => {
    if (!selectedElement?._id) return;

    onElementChange?.(selectedElement._id, updates);

    onSlideChange({
      elements: slide.elements.map((el) =>
        el._id === selectedElement._id ? { ...el, ...updates } : el
      ),
    });
  };

  const handleLayoutSelect = (layoutId: string, layoutType: SlideLayout) => {
    console.log("layoutId123", layoutId);
    console.log("layoutType123", layoutType);
    onLayoutChange?.(layoutId);
    onSlideChange({
      layout: layoutId,
    });
    setShowLayoutSelector(false);
  };

  const handleBackgroundChange = (color: string) => {
    onBackgroundChange?.(color);
    onSlideChange({
      customStyles: {
        ...slide.customStyles,
        backgroundColor: color,
      },
    });
  };

  return (
    <>
      {showFormatToolbar && selectedElement && (
        <TextFormatToolbar
          format={selectedElement.format}
          onChange={handleFormatChange}
          onClose={() => {
            setShowFormatToolbar(false);
            setSelectedElement(null);
          }}
        />
      )}
      {showLayoutSelector && (
        <LayoutSelector
          onLayoutSelect={handleLayoutSelect}
          currentLayout={currentLayout?._id || ""}
        />
      )}

      {selectedElement && (
        <ElementPositionControl
          elementId={selectedElement._id || ""}
          currentPosition={selectedElement.position || "default"}
          onPositionChange={async (position) => {
            handlePositionChange({ position });
          }}
        />
      )}
      <button
        onClick={() => setShowLayoutSelector(true)}
        style={{
          position: "absolute",
          bottom: "16px",
          right: "16px",
          padding: "8px 16px",
          borderRadius: "4px",
          backgroundColor: "#0070f3",
          color: "white",
        }}
      >
        Change Layout
      </button>

      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: "945px",
          aspectRatio: "16/9",
          backgroundColor: slide.customStyles?.backgroundColor || "#FFFFFF",
          border: "1px solid #e2e8f0",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        {currentLayout?.elements.map((layoutElement) => {
          const slideElement = slide.elements?.find(
            (el) => el.type === layoutElement.type
          );

          return (
            <SlideElementComponent
              key={layoutElement.type}
              element={{
                ...layoutElement,
                ...slideElement,
                _id: slideElement?._id || `temp-${layoutElement.type}`,
                value: slideElement?.value || "",
                format: slideElement?.format || {},
              }}
              value={slideElement?.value || ""}
              onChange={(type, value) =>
                handleElementClick(
                  slideElement || {
                    ...layoutElement,
                    _id: `temp-${layoutElement.type}`,
                  }
                )
              }
              onFormatChange={(type, format) => handleFormatChange(format)}
              format={slideElement?.format || {}}
              onSelect={() =>
                handleElementClick(
                  slideElement || {
                    ...layoutElement,
                    _id: `temp-${layoutElement.type}`,
                  }
                )
              }
              isSelected={selectedElement?._id === slideElement?._id}
            />
          );
        })}
      </Box>
    </>
  );
};

export const MiniSlidePreview: React.FC<{
  slide: any;
  isSelected?: boolean;
  layouts?: Record<string, Layout>;
  defaultLayoutId?: string;
}> = ({ slide, isSelected = false, layouts = {}, defaultLayoutId = "" }) => {
  // Helper function to get the correct layout ID
  const getLayoutId = (slide: any) => {
    // If the slide has a layout ID that exists in our layouts, use it
    if (slide.layout && layouts[slide.layout]) {
      return slide.layout;
    }

    // If the slide has a layout ID that doesn't exist in our layouts
    // (like a MongoDB ID from backend), find the matching layout type
    if (slide.layout) {
      const matchingLayout = Object.values(layouts).find(
        (layout) => layout._id === slide.layout
      );
      if (matchingLayout) {
        return matchingLayout._id;
      }
    }

    // Fallback to default layout
    return defaultLayoutId;
  };

  const layoutToUse = layouts[getLayoutId(slide)];

  if (!layoutToUse) {
    console.log(
      "Layout not found for slide:",
      slide._id,
      "layout:",
      slide.layout
    );
    return (
      <Box p={2} bg="white" borderRadius={4}>
        <Text fontSize="10px" color="error">
          Layout not found
        </Text>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "180px",
        backgroundColor: slide.customStyles?.backgroundColor,
        border: isSelected ? "2px solid #3182ce" : "1px solid #e2e8f0",
        borderRadius: "4px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        padding: "12px",
      }}
    >
      {layoutToUse.elements.map((layoutElement) => {
        const slideElement = slide.elements?.find(
          (el: SlideElement) => el.type === layoutElement.type
        );

        if (layoutElement.type === "image" && slideElement?.value) {
          return (
            <Box
              key={layoutElement.type}
              sx={{
                flex: "0 0 auto",
                maxHeight: "40%",
                backgroundColor: slideElement?.format?.backgroundColor,
                padding: "4px",
              }}
            >
              <img
                src={slideElement.value}
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
          <Box
            key={layoutElement.type}
            sx={{
              flex: layoutElement.type === "title" ? "0 0 auto" : "1 1 auto",
              backgroundColor: slideElement?.format?.backgroundColor,
              padding: "8px",
              fontSize: layoutElement.type === "title" ? "16px" : "12px",
              fontWeight: layoutElement.type === "title" ? "bold" : "normal",
              fontFamily:
                slideElement?.format?.fontFamily ||
                (layoutElement.type === "title"
                  ? "var(--font-montserrat)"
                  : "var(--font-opensans)"),
              color:
                slideElement?.format?.color ||
                (layoutElement.type === "title" ? "#6B46C1" : "#2D3748"),
              textAlign: (slideElement?.format?.textAlign ||
                (layoutElement.type === "title" ? "center" : "left")) as
                | "left"
                | "center"
                | "right",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: layoutElement.type === "title" ? 1 : 3,
              WebkitBoxOrient: "vertical",
              lineHeight: layoutElement.type === "title" ? "1.2" : "1.4",
              ...(slideElement?.format && {
                fontWeight: slideElement.format.bold ? "bold" : "normal",
                fontStyle: slideElement.format.italic ? "italic" : "normal",
                textDecoration: slideElement.format.underline
                  ? "underline"
                  : "none",
              }),
            }}
          >
            {slideElement?.value || layoutElement.placeholder || ""}
          </Box>
        );
      })}
    </Box>
  );
};

export default SlidePreview;
