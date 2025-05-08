import { useState, useEffect } from "react";
import { Box, Text, Flex } from "rebass";
import { getLayouts } from "@/lib/api/presentations";
import { toast } from "react-hot-toast";
import { SlideLayout } from "@/types/presentation";

// API response type
interface APILayout {
  _id: string;
  name: string;
  type: string;
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
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLayouts = async () => {
      try {
        const response = await getLayouts();

        if (response.success && Array.isArray(response.data)) {
          // Transform API layouts to internal layout type
          const validLayouts = response.data
            .map((apiLayout: APILayout) => {
              // Use the type field directly instead of name
              const layoutType = apiLayout.type as SlideLayout;

              // Validate layout type
              if (!Object.values(SlideLayout).includes(layoutType)) {
                console.warn("Invalid layout type:", layoutType);
                console.log("Valid types are:", Object.values(SlideLayout));
                return null;
              }

              // Transform to internal layout type
              return {
                ...apiLayout,
                type: layoutType,
              };
            })
            .filter((layout): layout is Layout => layout !== null);

          setLayouts(validLayouts);
        } else {
          throw new Error(response.error || "Failed to fetch layouts");
        }
      } catch (error) {
        console.error("Error in fetchLayouts:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch layouts"
        );
        toast.error("Failed to fetch layouts");
      } finally {
        setLoading(false);
      }
    };

    fetchLayouts();
  }, []);

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
        {layouts.map((layout) => (
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
