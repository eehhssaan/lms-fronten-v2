import React, { useState } from "react";
import { Box, Text } from "rebass";
import TextFormatToolbar from "./TextFormatToolbar";
import {
  TextFormat,
  SlideElement,
  Layout,
  Slide,
  SlideLayout,
  ContentItem,
  LayoutElement,
} from "../types/presentation";
import { ContentLayout } from "./ContentLayoutSelector";
import SlideElementComponent from "./SlideElementComponent";
import LayoutSelector from "./LayoutSelector";
import GridContainer from "./grid/GridContainer";
import GridItem from "./grid/GridItem";

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

// Convert absolute coordinates to grid coordinates if not provided
const getGridCoordinates = (element: LayoutElement) => {
  if (element.grid) {
    return element.grid;
  }

  // Return default grid coordinates if no grid is provided
  return {
    columnStart: 1,
    columnEnd: 12,
    rowStart: 1,
    rowEnd: 6,
  };
};

const SlidePreview: React.FC<SlidePreviewProps> = ({
  slide,
  onSlideChange,
  onElementChange,
  onLayoutChange,
  currentLayout,
}) => {
  const [selectedElement, setSelectedElement] = useState<SlideElement | null>(
    null
  );

  const [showFormatToolbar, setShowFormatToolbar] = useState(false);
  const [showLayoutSelector, setShowLayoutSelector] = useState(false);

  const handleElementClick = (element: SlideElement) => {
    setSelectedElement(element);
    setShowFormatToolbar(true);
  };

  const handleElementValueChange = (
    type: string,
    value: string | ContentItem[]
  ) => {
    const element = slide.elements?.find((el) => el.type === type);
    if (!element?._id) return;

    onElementChange?.(element._id, {
      value: value,
    });

    onSlideChange({
      elements: slide.elements.map((el) =>
        el._id === element._id ? { ...el, value: value } : el
      ),
    });
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

  const handleLayoutSelect = (layoutId: string, layoutType: SlideLayout) => {
    onLayoutChange?.(layoutId);
    onSlideChange({
      layout: layoutId,
      layoutType: layoutType,
    });
    setShowLayoutSelector(false);
  };

  const handleContentLayoutChange = (
    elementId: string,
    layout: ContentLayout
  ) => {
    if (!elementId) return;

    const element = slide.elements.find((el) => el._id === elementId);
    if (!element) return;

    onElementChange?.(elementId, {
      contentLayout: layout,
    });

    onSlideChange({
      elements: slide.elements.map((el) =>
        el._id === elementId ? { ...el, contentLayout: layout } : el
      ),
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

      <Box
        onClick={() => {
          setSelectedElement(null);
          setShowFormatToolbar(false);
        }}
        sx={{
          position: "relative",
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <button
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            setShowLayoutSelector(true);
          }}
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
          Image Position
        </button>

        <Box
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          sx={{
            position: "relative",
            width: "100%",
            maxWidth: "945px",
            aspectRatio: "16/9",
            backgroundColor: slide.customStyles?.backgroundColor || "#FFFFFF",
            border: "1px solid #e2e8f0",
            borderRadius: "4px",
            overflow: "hidden",
            padding: "20px",
          }}
        >
          <GridContainer columns={12} rows={6} gap={0} showGrid={false}>
            {currentLayout?.elements.map((layoutElement) => {
              const slideElement = slide.elements?.find((el) => {
                return el.type === layoutElement.type;
              });

              const gridCoords = getGridCoordinates(layoutElement);

              // Create element with layout coordinates taking precedence
              const mergedElement = {
                _id: slideElement?._id || `temp-${layoutElement.type}`,
                type: layoutElement.type,
                value: slideElement?.value || "",
                format: slideElement?.format || {},
                contentLayout: slideElement?.contentLayout,
                gridPosition: gridCoords,
              };

              return (
                <GridItem
                  key={layoutElement.type}
                  {...gridCoords}
                  showBounds={false}
                >
                  <SlideElementComponent
                    element={mergedElement}
                    value={slideElement?.value || ""}
                    onChange={(type, value) =>
                      handleElementValueChange(type, value)
                    }
                    onFormatChange={(type, format) =>
                      handleFormatChange(format)
                    }
                    onLayoutChange={(layout) => {
                      if (slideElement?._id) {
                        handleContentLayoutChange(slideElement._id, layout);
                      }
                    }}
                    format={slideElement?.format || {}}
                    onSelect={() =>
                      handleElementClick(
                        slideElement || {
                          ...layoutElement,
                          _id: `temp-${layoutElement.type}`,
                          value: layoutElement.value || "",
                          format: layoutElement.format || {},
                        }
                      )
                    }
                    isSelected={selectedElement?._id === slideElement?._id}
                  />
                </GridItem>
              );
            })}
          </GridContainer>
        </Box>
      </Box>
    </>
  );
};

export const MiniSlidePreview: React.FC<{
  slide: Slide;
  isSelected?: boolean;
  layouts?: Record<string, Layout>;
  defaultLayoutId?: string;
}> = ({ slide, isSelected = false, layouts = {}, defaultLayoutId = "" }) => {
  const getLayoutId = (slide: any) => {
    // First try to use layoutType if available
    if (slide.layoutType) {
      // Find the layout that matches this type
      const matchingLayout = Object.values(layouts).find(
        (layout) => layout.type === slide.layoutType
      );
      if (matchingLayout) {
        return matchingLayout._id;
      }
    }

    // Fallback: If the slide has a layout ID that exists in our layouts, use it
    if (slide.layout && layouts[slide.layout]) {
      return slide.layout;
    }

    // Fallback: If the slide has a layout ID that doesn't exist in our layouts
    // (like a MongoDB ID from backend), find the matching layout type
    if (slide.layout) {
      const matchingLayout = Object.values(layouts).find(
        (layout) => layout._id === slide.layout
      );
      if (matchingLayout) {
        return matchingLayout._id;
      }
    }

    // Final fallback to default layout
    return defaultLayoutId;
  };

  const layoutToUse = layouts[getLayoutId(slide)];

  // Scale factor for thumbnail size (16:9 aspect ratio)
  const SCALE_FACTOR = 0.15; // Increased from 0.125 to 0.15 for better visibility
  const MINI_WIDTH = Math.floor(1920 * SCALE_FACTOR); // ~288px
  const MINI_HEIGHT = Math.floor(1080 * SCALE_FACTOR); // ~162px

  if (!layoutToUse) {
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
        position: "relative",
        width: `${MINI_WIDTH}px`,
        height: `${MINI_HEIGHT}px`,
        backgroundColor: slide.customStyles?.backgroundColor || "#FFFFFF",
        border: isSelected ? "2px solid #3182ce" : "1px solid #e2e8f0",
        borderRadius: "4px",
        overflow: "hidden",
        padding: "8px", // Increased from 4px for better content spacing
        cursor: "pointer",
        boxShadow: isSelected
          ? "0 0 0 2px rgba(49, 130, 206, 0.3)"
          : "0 1px 2px rgba(0,0,0,0.05)",
        transform: "scale(0.9)", // Added to give some breathing room
        transformOrigin: "top left",
      }}
    >
      <GridContainer columns={12} rows={6} gap={2} showGrid={false}>
        {layoutToUse.elements.map((layoutElement) => {
          const slideElement = slide.elements?.find(
            (el) => el.type === layoutElement.type
          );

          const gridCoords = getGridCoordinates(layoutElement);

          // Create element with layout coordinates taking precedence
          const mergedElement = {
            _id: slideElement?._id || `temp-${layoutElement.type}`,
            type: layoutElement.type,
            value: slideElement?.value || "",
            format: slideElement?.format || {},
            contentLayout: slideElement?.contentLayout,
            gridPosition: gridCoords,
          };

          return (
            <GridItem
              key={layoutElement.type}
              {...gridCoords}
              showBounds={false}
            >
              <SlideElementComponent
                element={mergedElement}
                value={slideElement?.value || ""}
                onChange={() => {}} // No-op since this is just a preview
                onFormatChange={() => {}} // No-op since this is just a preview
                onLayoutChange={() => {}} // No-op since this is just a preview
                format={slideElement?.format || {}}
                onSelect={() => {}} // No-op since this is just a preview
                isSelected={false}
                isMiniPreview={true}
              />
            </GridItem>
          );
        })}
      </GridContainer>
    </Box>
  );
};

export default SlidePreview;
