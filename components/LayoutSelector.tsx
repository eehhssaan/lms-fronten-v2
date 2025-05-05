import React from "react";
import { Box, Text, Flex } from "rebass";
import { layouts, Layout } from "@/data/layouts";

interface LayoutSelectorProps {
  onLayoutSelect: (layoutId: string) => void;
  currentLayout?: string;
}

const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  onLayoutSelect,
  currentLayout,
}) => {
  const renderLayoutPreview = (layout: Layout) => {
    return (
      <Box
        sx={{
          position: "relative",
          width: "100%",
          paddingTop: "56.25%", // 16:9 aspect ratio
          backgroundColor: "white",
          border:
            currentLayout === layout.id
              ? "2px solid #3182ce"
              : "1px solid #e2e8f0",
          borderRadius: "4px",
          overflow: "hidden",
          cursor: "pointer",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          },
        }}
        onClick={() => onLayoutSelect(layout.id)}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            padding: "8px",
          }}
        >
          {layout.elements.map((element, index) => (
            <Box
              key={index}
              sx={{
                position: "absolute",
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
                backgroundColor: "#f0f0f0",
                border: "1px dashed #666",
                borderRadius: "2px",
                fontSize: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#666",
                overflow: "hidden",
              }}
            >
              {element.type}
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        bg: "white",
        p: 3,
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <Text
        sx={{
          fontSize: 2,
          fontWeight: "bold",
          mb: 3,
          color: "#2d3748",
        }}
      >
        Select Layout
      </Text>
      <Flex sx={{ flexWrap: "wrap", gap: 3 }}>
        {Object.values(layouts).map((layout) => (
          <Box
            key={layout.id}
            sx={{
              width: ["100%", "calc(50% - 12px)", "calc(33.33% - 16px)"],
            }}
          >
            {renderLayoutPreview(layout)}
            <Text
              sx={{
                fontSize: 1,
                fontWeight: "bold",
                mt: 2,
                mb: 1,
                color: "#2d3748",
              }}
            >
              {layout.name}
            </Text>
            <Text
              sx={{
                fontSize: 0,
                color: "#718096",
                lineHeight: "1.4",
              }}
            >
              {layout.description}
            </Text>
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

export default LayoutSelector;
