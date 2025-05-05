import React, { useState } from "react";
import { Box, Button, Flex, Text } from "rebass";
import { generatePowerPoint } from "../lib/api/presentations";
import { Spinner } from "../components/ui/Spinner";
import toast from "react-hot-toast";

interface PPTXGeneratorProps {
  presentationId: string;
  onSuccess?: () => void;
}

const PPTXGenerator: React.FC<PPTXGeneratorProps> = ({
  presentationId,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const blob = await generatePowerPoint(presentationId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `presentation-${presentationId}.pptx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Presentation downloaded successfully!");
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate presentation"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Button
        onClick={handleGenerate}
        disabled={loading}
        sx={{
          width: "100%",
          py: 2,
          px: 4,
          bg: "primary",
          color: "white",
          border: "none",
          borderRadius: 2,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
          transition: "opacity 0.2s",
          "&:hover": {
            opacity: loading ? 0.7 : 0.9,
          },
        }}
      >
        <Flex sx={{ alignItems: "center", justifyContent: "center", gap: 2 }}>
          {loading && <Spinner />}
          <Text>{loading ? "Generating..." : "Download PowerPoint"}</Text>
        </Flex>
      </Button>
    </Box>
  );
};

export default PPTXGenerator;
