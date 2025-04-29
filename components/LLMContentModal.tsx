import { useState } from "react";
import { Box, Text, Flex } from "rebass";
import { useAuth } from "@/context/AuthContext";
import { generateLLMContent } from "@/lib/api";
import { toast } from "react-hot-toast";

interface LLMContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectId: string;
  chapters: string[];
  onSuccess: () => void;
}

interface GeneratedContent {
  title?: string;
  objectives?: string[];
  materials?: string[];
  activities?: Array<{
    title: string;
    description: string;
    duration: string;
    instructions: string[];
  }>;
  assessment?: {
    questions?: string[];
    criteria?: string[];
  };
}

interface GeneratedPPTX {
  data: Blob;
  filename: string;
}

export default function LLMContentModal({
  isOpen,
  onClose,
  subjectId,
  chapters,
  onSuccess,
}: LLMContentModalProps) {
  const { user } = useAuth();
  const [selectedChapter, setSelectedChapter] = useState("");
  const [prompt, setPrompt] = useState("");
  const [numberOfSlides, setNumberOfSlides] = useState<5 | 10 | 20>(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] =
    useState<GeneratedContent | null>(null);
  const [generatedPPTX, setGeneratedPPTX] = useState<GeneratedPPTX | null>(
    null
  );

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedChapter) {
      setError("Please select a chapter");
      return;
    }

    if (!prompt.trim()) {
      setError("Please provide a prompt");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await generateLLMContent({
        prompts: {
          numberOfSlides: numberOfSlides.toString(),
          mainPrompt: prompt.trim(),
        },
        context: {
          chapter: selectedChapter,
          grade: "Grade 10",
          subject: "Mathematics",
          curriculum: "HKDSE",
          language: "english",
          type: "lesson",
        },
      });

      // Ensure we have binary data
      if (!(response.data instanceof Blob)) {
        throw new Error("Invalid response format: expected binary data");
      }

      // Store the generated PPTX data
      setGeneratedPPTX({
        data: response.data,
        filename: response.filename,
      });

      toast.success("Presentation generated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to generate content");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedPPTX) return;

    const url = window.URL.createObjectURL(generatedPPTX.data);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", generatedPPTX.filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const renderGeneratedContent = () => {
    if (!generatedContent) return null;

    return (
      <Box sx={{ height: "100%", overflowY: "auto" }}>
        {generatedContent.title && (
          <Text as="h3" fontSize={2} fontWeight="bold" mb={2}>
            {generatedContent.title}
          </Text>
        )}

        {generatedContent.objectives && (
          <Box mb={3}>
            <Text fontWeight="bold" mb={1}>
              Objectives:
            </Text>
            <ul>
              {generatedContent.objectives.map((obj, index) => (
                <li key={index}>{obj}</li>
              ))}
            </ul>
          </Box>
        )}

        {generatedContent.activities && (
          <Box mb={3}>
            <Text fontWeight="bold" mb={1}>
              Activities:
            </Text>
            {generatedContent.activities.map((activity, index) => (
              <Box
                key={index}
                mb={2}
                p={2}
                sx={{ border: "1px solid #e2e8f0", borderRadius: "4px" }}
              >
                <Text fontWeight="bold">{activity.title}</Text>
                <Text>{activity.description}</Text>
                <Text fontSize={0} color="gray.600">
                  Duration: {activity.duration}
                </Text>
                {activity.instructions && (
                  <ul>
                    {activity.instructions.map((instruction, i) => (
                      <li key={i}>{instruction}</li>
                    ))}
                  </ul>
                )}
              </Box>
            ))}
          </Box>
        )}

        {generatedContent.assessment && (
          <Box>
            <Text fontWeight="bold" mb={1}>
              Assessment:
            </Text>
            {generatedContent.assessment.questions && (
              <Box mb={2}>
                <Text fontWeight="bold" mb={1}>
                  Questions:
                </Text>
                <ul>
                  {generatedContent.assessment.questions.map((q, index) => (
                    <li key={index}>{q}</li>
                  ))}
                </ul>
              </Box>
            )}
            {generatedContent.assessment.criteria && (
              <Box>
                <Text fontWeight="bold" mb={1}>
                  Criteria:
                </Text>
                <ul>
                  {generatedContent.assessment.criteria.map((c, index) => (
                    <li key={index}>{c}</li>
                  ))}
                </ul>
              </Box>
            )}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        zIndex: 1000,
      }}
    >
      {/* Left side - Generated content */}
      <Box
        sx={{
          width: "50%",
          height: "100%",
          backgroundColor: "white",
          padding: "24px",
          borderRight: "1px solid #e2e8f0",
          overflowY: "auto",
        }}
      >
        <Text as="h2" fontSize={3} fontWeight="bold" mb={3} color="text">
          Generated Content Preview
        </Text>
        {loading ? (
          <Box
            sx={{
              height: "calc(100% - 60px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "gray.600",
            }}
          >
            Generating content...
          </Box>
        ) : generatedContent ? (
          renderGeneratedContent()
        ) : (
          <Box
            sx={{
              height: "calc(100% - 60px)",
              border: "2px dashed #e2e8f0",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "gray.600",
            }}
          >
            Content will be displayed here
          </Box>
        )}
      </Box>

      {/* Right side - Form */}
      <Box
        as="form"
        onSubmit={handleSubmit}
        sx={{
          width: "50%",
          height: "100%",
          backgroundColor: "white",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Text as="h2" fontSize={3} fontWeight="bold" mb={3} color="text">
          Create Content with AI
        </Text>

        <Text mb={3} color="gray.600">
          Select a chapter and provide a prompt for the AI to generate content:
        </Text>

        <Box mb={3}>
          <Text mb={1} fontWeight="bold" color="text">
            Chapter:
          </Text>
          <select
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              marginBottom: "12px",
              backgroundColor: "white",
            }}
          >
            <option value="">Select a chapter...</option>
            {chapters.map((chapter) => (
              <option key={chapter} value={chapter}>
                {chapter}
              </option>
            ))}
          </select>
        </Box>

        <Box mb={3}>
          <Text mb={1} fontWeight="bold" color="text">
            Number of Slides:
          </Text>
          <select
            value={numberOfSlides}
            onChange={(e) =>
              setNumberOfSlides(Number(e.target.value) as 5 | 10 | 20)
            }
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              marginBottom: "12px",
              backgroundColor: "white",
            }}
          >
            <option value={5}>5 Slides</option>
            <option value={10}>10 Slides</option>
            <option value={20}>20 Slides</option>
          </select>
        </Box>

        <Box mb={4}>
          <Text mb={1} fontWeight="bold" color="text">
            Prompt:
          </Text>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Please create content for secondary 5 students about..."
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              minHeight: "100px",
              resize: "vertical",
              backgroundColor: "white",
            }}
          />
        </Box>

        {error && (
          <Text color="error" mb={3}>
            {error}
          </Text>
        )}

        <Flex justifyContent="flex-end" gap={2}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "8px 16px",
              borderRadius: "4px",
              border: "1px solid #e2e8f0",
              backgroundColor: "white",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          {generatedPPTX && (
            <button
              type="button"
              onClick={handleDownload}
              style={{
                padding: "8px 16px",
                borderRadius: "4px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#48bb78",
                color: "white",
                cursor: "pointer",
              }}
            >
              Download PPTX
            </button>
          )}
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: "8px 16px",
              borderRadius: "4px",
              border: "none",
              backgroundColor: "#3182ce",
              color: "white",
              cursor: "pointer",
            }}
          >
            {loading ? "Generating..." : "Generate Content"}
          </button>
        </Flex>
      </Box>
    </Box>
  );
}
