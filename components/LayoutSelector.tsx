import { Box, Text, Flex } from "rebass";
import { SlideLayout, Layout } from "@/types/presentation";
import { useLayouts } from "@/context/LayoutsContext";

interface LayoutSelectorProps {
  onLayoutSelect: (layoutId: string, layoutType: SlideLayout) => void;
  currentLayout: string;
}

export default function LayoutSelector({
  onLayoutSelect,
  currentLayout,
}: LayoutSelectorProps) {
  const { layouts, loading, error } = useLayouts();

  const handleLayoutClick = (layout: Layout) => {
    onLayoutSelect(layout._id, layout.type as SlideLayout);
  };

  if (loading) {
    return (
      <Box p={4} bg="white" borderRadius={8}>
        <Text>Loading layouts...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4} bg="white" borderRadius={8}>
        <Text color="error">{error}</Text>
      </Box>
    );
  }

  const layoutsArray = Object.values(layouts);

  return (
    <Box
      sx={{
        backgroundColor: "white",
        borderRadius: "8px",
        padding: "24px",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <Text as="h2" fontSize={3} fontWeight="bold" mb={3}>
        Select Image Position
      </Text>
      <Flex
        sx={{
          flexWrap: "wrap",
          gap: "16px",
          justifyContent: "center",
        }}
      >
        {layoutsArray.map((layout) => (
          <Box
            key={layout._id}
            onClick={() => handleLayoutClick(layout)}
            sx={{
              width: "200px",
              padding: "16px",
              border: "1px solid",
              borderColor:
                currentLayout === layout._id ? "primary" : "gray.300",
              borderRadius: "8px",
              cursor: "pointer",
              "&:hover": {
                borderColor: "primary",
              },
            }}
          >
            <Text fontWeight="bold" mb={1}>
              {layout.name}
            </Text>
            <Text fontSize={1} color="gray.600">
              {layout.description}
            </Text>
          </Box>
        ))}
      </Flex>
    </Box>
  );
}
