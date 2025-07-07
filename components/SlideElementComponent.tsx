import React, { useState } from "react";
import { Box } from "rebass";
import { TextFormat, Slide, SlideElement } from "../types/presentation";
import ContentLayoutSelector, { ContentLayout } from "./ContentLayoutSelector";
import ContentLayoutRenderer from "./ContentLayoutRenderer";

interface ContentItem {
  title: string;
  detail: string;
}

interface SlideElementComponentProps {
  element: SlideElement & {
    gridPosition?: {
      columnStart: number;
      columnEnd: number;
      rowStart: number;
      rowEnd: number;
    };
  };
  value: string | ContentItem[];
  onChange: (type: string, value: string | ContentItem[]) => void;
  onFormatChange: (type: string, format: Partial<TextFormat>) => void;
  onLayoutChange: (layout: ContentLayout) => void;
  format: TextFormat;
  onSelect: () => void;
  isSelected: boolean;
  isMiniPreview?: boolean;
}

const SlideElementComponent: React.FC<SlideElementComponentProps> = ({
  element,
  value,
  onChange,
  onLayoutChange,
  format,
  onSelect,
  isSelected,
  isMiniPreview = false,
}) => {
  const [showLayoutSelector, setShowLayoutSelector] = useState(false);

  const getPositionStyles = () => {
    // If grid positioning is available, use it
    if (element.gridPosition) {
      return {
        position: "relative" as const,
        width: "100%",
        height: "100%",
      };
    }

    // Fallback to absolute positioning
    return {
      position: "absolute" as const,
      left: `${element.x}px`,
      top: `${element.y}px`,
      width: `${element.width}px`,
      height: `${element.height}px`,
    };
  };

  const handleDoubleClick = () => {
    if (element.type === "content") {
      setShowLayoutSelector(true);
    }
  };

  const textStyle = {
    width: "100%",
    height: "100%",
    padding: isMiniPreview ? "1px" : "8px",
    backgroundColor: format.backgroundColor || "transparent",
    color: format.color || "#8B4513",
    fontFamily: format.fontFamily || "inherit",
    fontSize: isMiniPreview
      ? element.type === "title"
        ? "11px"
        : "7px"
      : format.fontSize || "inherit",
    fontWeight: element.type === "title" || format.bold ? "bold" : "normal",
    fontStyle: format.italic ? "italic" : "normal",
    textDecoration: format.underline ? "underline" : "none",
    textAlign: (format.textAlign ||
      (element.type === "title" ? "center" : "left")) as
      | "left"
      | "center"
      | "right",
    overflow: "hidden",
    textOverflow: "ellipsis",
    ...(isMiniPreview && {
      whiteSpace: element.type === "title" ? "nowrap" : "normal",
      display: "-webkit-box",
      WebkitLineClamp: element.type === "title" ? "1" : "2",
      WebkitBoxOrient: "vertical" as const,
      lineHeight: element.type === "title" ? "1.1" : "1.2",
      maxHeight: element.type === "content" ? "80%" : undefined,
      opacity: 1,
    }),
  };

  return (
    <>
      {isSelected && element.type === "content" && !isMiniPreview && (
        <>
          <Box
            sx={{
              position: "absolute",
              right: "0",
              zIndex: 1000,
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowLayoutSelector(true);
              }}
              style={{
                padding: "4px 8px",
                backgroundColor: "#3182ce",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
                transition: "all 0.2s ease",
              }}
            >
              Change Content Layout
            </button>
          </Box>
          <ContentLayoutSelector
            currentLayout={element.contentLayout || "vertical"}
            onLayoutChange={(layout) => {
              onLayoutChange(layout);
            }}
            isOpen={showLayoutSelector}
            onClose={() => setShowLayoutSelector(false)}
          />
        </>
      )}
      <Box
        onClick={onSelect}
        onDoubleClick={handleDoubleClick}
        sx={{
          ...getPositionStyles(),
          color: format.color || "#8B4513",
          fontFamily: format.fontFamily || "inherit",
          fontSize: isMiniPreview
            ? element.type === "title"
              ? "11px"
              : "7px"
            : format.fontSize || "inherit",
          fontWeight: format.bold ? "bold" : "normal",
          fontStyle: format.italic ? "italic" : "normal",
          textDecoration: format.underline ? "underline" : "none",
          textAlign: (format.textAlign || "left") as
            | "left"
            | "center"
            | "right",
          border: isSelected ? "2px solid #3182ce" : "none",
          cursor: "pointer",
          overflow: "hidden",
          transition: "all 0.2s ease",
          "&:hover": !isMiniPreview
            ? {
                boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.5)",
              }
            : {},
          position: "relative",
          ...(isMiniPreview && {
            textOverflow: "ellipsis",
            display: element.type === "content" ? "-webkit-box" : "-webkit-box",
            WebkitLineClamp: element.type === "title" ? "1" : "2",
            WebkitBoxOrient: "vertical" as const,
            maxHeight: element.type === "content" ? "80%" : undefined,
            padding: "1px",
          }),
        }}
      >
        {element.type === "content" ? (
          <ContentLayoutRenderer
            layout={element.contentLayout || "vertical"}
            items={Array.isArray(value) ? value : []}
            textStyle={textStyle}
            onItemChange={(index, field, newValue) => {
              if (Array.isArray(value)) {
                const newItems = [...value];
                newItems[index] = {
                  ...newItems[index],
                  [field]: newValue,
                };
                onChange(element.type, newItems);
              }
            }}
            isMiniPreview={isMiniPreview}
          />
        ) : element.type === "image" ? (
          <img
            src={value as string}
            alt="Slide content"
            style={{
              width: "100%",
              height: "100%",
              objectFit: isMiniPreview ? "cover" : "contain",
              objectPosition: "center",
              maxHeight: isMiniPreview ? "80%" : "100%",
            }}
          />
        ) : (
          <div
            contentEditable={isSelected}
            suppressContentEditableWarning
            onInput={(e) => {
              const newValue = e.currentTarget.textContent || "";
              onChange(element.type, newValue);
            }}
            style={{
              ...textStyle,
              outline: "none",
              cursor: isSelected ? "text" : "pointer",
            }}
          >
            {typeof value === "string" ? value : ""}
          </div>
        )}
      </Box>
    </>
  );
};

export default SlideElementComponent;
