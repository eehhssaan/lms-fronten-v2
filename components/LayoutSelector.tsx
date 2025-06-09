import { Box, Text, Flex } from "rebass";
import { SlideLayout } from "@/types/presentation";
import { useLayouts } from "@/context/LayoutsContext";
import { toast } from "react-hot-toast";

// Component's internal layout type
interface Layout {
  _id: string;
  name: string;
  type: SlideLayout;
  description: string;
  elements: Array<{
    type: string;
    x: string | number;
    y: string | number;
    width: string | number;
    height: string | number;
    fontSize?: number;
    textAlign?: "left" | "center" | "right";
    placeholder?: string;
  }>;
  thumbnail?: string;
  isDefault?: boolean;
  isPublic?: boolean;
}

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
    if (!Object.values(SlideLayout).includes(layout.type)) {
      console.error("Invalid layout type:", layout.type);
      console.log("Valid types are:", Object.values(SlideLayout));
      toast.error("Invalid layout configuration");
      return;
    }

    onLayoutSelect(layout._id, layout.type);
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

  // Convert layouts object to array and validate types
  const layoutsArray = Object.values(layouts).filter(
    (layout): layout is Layout => {
      const layoutType = layout.type as SlideLayout;
      if (!Object.values(SlideLayout).includes(layoutType)) {
        console.warn("Invalid layout type:", layoutType);
        console.log("Valid types are:", Object.values(SlideLayout));
        return false;
      }
      return true;
    }
  );

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
        Select a Layout
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
            {layout.thumbnail && (
              <Box
                sx={{
                  width: "100%",
                  height: "120px",
                  backgroundImage: `url(${layout.thumbnail})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  marginBottom: "8px",
                  borderRadius: "4px",
                }}
              />
            )}
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
