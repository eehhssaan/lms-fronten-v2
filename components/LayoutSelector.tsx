import { useState, useEffect } from "react";
import { Box, Text, Flex } from "rebass";
import { getLayouts } from "@/lib/api/presentations";
import { toast } from "react-hot-toast";

interface Layout {
  _id: string;
  name: string;
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
}

interface LayoutSelectorProps {
  onLayoutSelect: (layoutId: string) => void;
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
        if (response.success) {
          setLayouts(response.data);
        } else {
          throw new Error(response.error || "Failed to fetch layouts");
        }
      } catch (error) {
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
            onClick={() => onLayoutSelect(layout._id)}
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
