import { Box, Text, Flex } from "rebass";
import { Layout } from "@/types/presentation";
import { useLayouts } from "@/context/LayoutsContext";
import { useEffect } from "react";
import {
  MdOutlineVerticalDistribute,
  MdOutlineViewAgenda,
  MdOutlineViewDay,
  MdOutlineVerticalSplit,
  MdOutlinePhotoSizeSelectActual,
  MdOutlineImage,
} from "react-icons/md";

interface LayoutSelectorProps {
  currentLayout: string;
  onLayoutChange: (layoutId: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

const getLayoutIcon = (layoutId: string) => {
  switch (layoutId) {
    case "title-content":
      return <MdOutlineVerticalDistribute size={24} />; // Shows vertical distribution of title and content
    case "title-content-image":
      return <MdOutlineViewAgenda size={24} />; // Shows three sections stacked
    case "content-only":
      return <MdOutlineViewDay size={24} />; // Shows single content area
    case "image-left":
      return <MdOutlineVerticalSplit size={24} />; // Shows split with content on right
    case "image-right":
      return (
        <MdOutlineVerticalSplit size={24} style={{ transform: "scaleX(-1)" }} />
      ); // Flipped split for right image
    case "full-image":
      return <MdOutlinePhotoSizeSelectActual size={24} />; // Shows full area image
    default:
      return <MdOutlineImage size={24} />;
  }
};

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  currentLayout,
  onLayoutChange,
  onClose,
  isOpen,
}) => {
  const { layouts, loading, error } = useLayouts();

  useEffect(() => {
    console.log("LayoutSelector mounted");
    console.log("isOpen:", isOpen);
    console.log("currentLayout:", currentLayout);
    console.log("Available layouts:", layouts);
  }, [isOpen, currentLayout, layouts]);

  if (!isOpen) return null;

  if (loading) {
    console.log("Loading layouts...");
    return (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box p={4} bg="white" borderRadius={8}>
          <Text>Loading layouts...</Text>
        </Box>
      </Box>
    );
  }

  if (error) {
    console.error("Error loading layouts:", error);
    return (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box p={4} bg="white" borderRadius={8}>
          <Text color="error">{error}</Text>
        </Box>
      </Box>
    );
  }

  const layoutsArray = Object.values(layouts);
  console.log("Layouts array:", layoutsArray);

  const handleLayoutClick = (layout: Layout) => {
    console.log("Layout clicked:", layout);
    onLayoutChange(layout._id);
    onClose();
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <Box
        sx={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "20px",
          width: "90%",
          maxWidth: "800px",
          maxHeight: "80vh",
          overflow: "auto",
          position: "relative",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <Flex justifyContent="space-between" alignItems="center" mb={3}>
          <Text fontSize={20} fontWeight="bold">
            Select Image Position
          </Text>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              padding: "4px",
              color: "#666",
            }}
          >
            ×
          </button>
        </Flex>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "16px",
            padding: "8px",
          }}
        >
          {layoutsArray.map((layout) => (
            <Box
              key={layout._id}
              onClick={() => handleLayoutClick(layout)}
              sx={{
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid",
                borderColor:
                  currentLayout === layout._id
                    ? "#3182ce"
                    : "rgba(0, 0, 0, 0.1)",
                backgroundColor:
                  currentLayout === layout._id
                    ? "rgba(49, 130, 206, 0.1)"
                    : "white",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "#3182ce",
                  backgroundColor: "rgba(49, 130, 206, 0.05)",
                },
              }}
            >
              <Flex alignItems="center" mb={2}>
                <Box
                  sx={{
                    color: currentLayout === layout._id ? "#3182ce" : "#666",
                    marginRight: "12px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {getLayoutIcon(layout._id)}
                </Box>
                <Text
                  fontWeight={currentLayout === layout._id ? "bold" : "normal"}
                  color={currentLayout === layout._id ? "#3182ce" : "inherit"}
                >
                  {layout.name}
                </Text>
              </Flex>
              <Text fontSize={14} color="#666">
                {layout.description}
              </Text>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
