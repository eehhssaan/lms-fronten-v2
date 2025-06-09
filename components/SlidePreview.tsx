import React, { useState } from "react";
import { Box, Text } from "rebass";
import TextFormatToolbar from "./TextFormatToolbar";
import {
  updateSlide,
  updateSlideElementPosition,
} from "../lib/api/presentations";
import { TextFormat, SlideElement, Layout, Slide } from "../types/presentation";
import toast from "react-hot-toast";
import { useLayouts } from "@/context/LayoutsContext";
import SlideElementComponent from "./SlideElementComponent";
import ElementPositionControl from "./ElementPositionControl";

interface SlidePreviewProps {
  slide: Slide & {
    aspectRatio?: string;
  };
  onSlideChange: (updatedSlide: Partial<Slide>) => void;
  currentLayout?: Layout;
}

const SlidePreview: React.FC<SlidePreviewProps> = ({
  slide,
  onSlideChange,
  currentLayout,
}) => {
  const [selectedElement, setSelectedElement] = useState<SlideElement | null>(
    null
  );
  const { layouts, defaultLayoutId, loading } = useLayouts();
  const layoutToUse = currentLayout || layouts[defaultLayoutId];

  if (loading) {
    return (
      <Box p={4} bg="white" borderRadius={8}>
        <Text>Loading layouts...</Text>
      </Box>
    );
  }

  if (!layoutToUse) {
    return (
      <Box p={4} bg="white" borderRadius={8}>
        <Text color="error">Layout not found</Text>
      </Box>
    );
  }

  const handleElementChange = async (type: string, value: string) => {
    try {
      const updatedElements =
        slide.elements?.map((el) =>
          el.type === type ? { ...el, value } : el
        ) || [];

      const updatedSlide = {
        ...slide,
        [type === "title" ? "title" : "content"]: value,
        elements: updatedElements,
      };

      onSlideChange(updatedSlide);

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
      const updatedElements =
        slide.elements?.map((el) =>
          el.type === type
            ? { ...el, format: { ...el.format, ...newFormat } }
            : el
        ) || [];

      const updatedSlide = {
        ...slide,
        elements: updatedElements,
      };

      onSlideChange(updatedSlide);

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

      onSlideChange(updatedSlide);

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

  return (
    <>
      {selectedElement && (
        <>
          <TextFormatToolbar
            format={selectedElement.format || {}}
            onFormatChange={(newFormat) =>
              handleFormatChange(selectedElement.type, newFormat)
            }
            onSlideBackgroundChange={handleSlideBackgroundChange}
            currentSlideBackground={slide.customStyles?.backgroundColor}
          />
          {selectedElement.type === "image" && (
            <ElementPositionControl
              elementId={selectedElement._id || ""}
              currentPosition={selectedElement.position || "default"}
              onPositionChange={async (position) => {
                try {
                  if (
                    slide._id &&
                    slide.presentationId &&
                    selectedElement._id
                  ) {
                    const updatedSlideData = await updateSlideElementPosition(
                      slide.presentationId,
                      slide._id,
                      selectedElement._id,
                      position
                    );

                    // Update the selected element with new position
                    const updatedElement = updatedSlideData.elements.find(
                      (el: any) => el._id === selectedElement._id
                    );
                    if (updatedElement) {
                      setSelectedElement(updatedElement);
                    }

                    // Update the slide with new data
                    onSlideChange(updatedSlideData);

                    toast.success("Position updated successfully");
                  }
                } catch (error) {
                  toast.error("Failed to update position");
                  console.error("Error updating position:", error);
                }
              }}
            />
          )}
        </>
      )}
      <Box
        sx={{
          position: "relative",
          width: "945px",
          height: "530px",
          backgroundColor: slide.customStyles?.backgroundColor || "#FFFFFF",
          border: "1px solid #e2e8f0",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <Box>
          {layoutToUse.elements.map((layoutElement) => {
            const slideElement = slide.elements?.find(
              (el: SlideElement) => el.type === layoutElement.type
            );

            // Use the layout element directly and only override necessary properties
            const elementWithDimensions = {
              ...layoutElement,
              _id: slideElement?._id || `temp-${layoutElement.type}`,
              value: slideElement?.value || "",
              format: slideElement?.format || {},
              x: slideElement?.x ?? layoutElement.x,
              y: slideElement?.y ?? layoutElement.y,
              width: slideElement?.width ?? layoutElement.width,
              height: slideElement?.height ?? layoutElement.height,
              position:
                slideElement?.position || layoutElement.position || "default",
            } as SlideElement;

            return (
              <SlideElementComponent
                key={layoutElement.type}
                element={elementWithDimensions}
                value={slideElement?.value || ""}
                onChange={handleElementChange}
                onFormatChange={handleFormatChange}
                format={slideElement?.format || {}}
                isSelected={selectedElement?.type === layoutElement.type}
                onSelect={() => setSelectedElement(elementWithDimensions)}
                slide={slide}
              />
            );
          })}
        </Box>
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
  const layoutToUse = slide.layout
    ? layouts[slide.layout]
    : layouts[defaultLayoutId];

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
        height: "180px",
        backgroundColor: slide.customStyles?.backgroundColor || "#FFFFFF",
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
