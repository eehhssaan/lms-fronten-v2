import { useState, useEffect } from "react";
import { Box, Text, Flex } from "rebass";
import { useAuth } from "@/context/AuthContext";
import { generateLLMContent } from "@/lib/api";
import { toast } from "react-hot-toast";
import { TextFormat, SlideLayout, Layout } from "@/types/presentation";
import ThemeSelector from "./ThemeSelector";
import { Theme } from "@/types/presentation";
import { default as SlidePreview, MiniSlidePreview } from "./SlidePreview";
import { getLayouts, updateSlide } from "@/lib/api/presentations";
import LayoutSelector from "./LayoutSelector";
import { api } from "@/lib/api";

interface LLMContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectId: string;
  chapters: Array<{
    id: string;
    title: string;
  }>;
  onSuccess?: () => void;
}

interface GeneratedSlide {
  _id?: string;
  id?: string;
  title?: string;
  type?: string;
  layout?: string;
  backgroundColor?: string;
  order?: number;
  presentationId?: string;
  themeId?: string;
  elements: Array<{
    type: string;
    value: string;
    format?: {
      fontFamily: string;
      fontSize: string;
      color: string;
      backgroundColor: string;
      bold: boolean;
      italic: boolean;
      underline: boolean;
      textAlign: "left" | "center" | "right";
      lineHeight: string;
      letterSpacing: string;
      textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
    };
  }>;
  customStyles?: {
    backgroundColor?: string;
  };
}

interface LLMResponse {
  success: boolean;
  error?: string;
  data?: {
    presentationId: string;
    slides: Array<{
      _id: string;
      title: string;
      layout?: string;
      type: string;
      elements: Array<{
        type: string;
        value: string;
        format?: {
          fontSize?: string;
          fontFamily?: string;
          color?: string;
          backgroundColor?: string;
          bold?: boolean;
          italic?: boolean;
          underline?: boolean;
          textAlign?: "left" | "center" | "right";
          lineHeight?: string;
          letterSpacing?: string;
          textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
        };
      }>;
    }>;
    message?: string;
  };
}

interface LLMDownloadResponse extends Blob {
  filename?: string;
}

interface SlideElement {
  type: string;
  value: string;
  format?: {
    fontSize?: string;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    textAlign?: "left" | "center" | "right";
    lineHeight?: string;
    letterSpacing?: string;
    textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  };
}

interface BackendSlide {
  _id: string;
  title: string;
  layout?: string;
  type: string;
  elements: SlideElement[];
}

// Add breakpoint constants
const BREAKPOINTS = {
  sm: "@media screen and (max-width: 640px)",
  md: "@media screen and (max-width: 768px)",
  lg: "@media screen and (max-width: 1024px)",
};

export default function LLMContentModal({
  isOpen,
  onClose,
  subjectId,
  chapters,
  onSuccess,
}: LLMContentModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedSlides, setGeneratedSlides] = useState<
    GeneratedSlide[] | null
  >(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showLayoutSelector, setShowLayoutSelector] = useState(false);
  const [currentLayout, setCurrentLayout] = useState<string>("");
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [selectedChapter, setSelectedChapter] = useState("");
  const [numberOfSlides, setNumberOfSlides] = useState(5);
  const [userPrompt, setUserPrompt] = useState("");
  const [layouts, setLayouts] = useState<Record<string, Layout>>({});
  const [defaultLayoutId, setDefaultLayoutId] = useState<string>("");

  useEffect(() => {
    const fetchLayouts = async () => {
      try {
        const response = await getLayouts();
        if (response.success) {
          const layoutsMap = response.data.reduce(
            (acc: Record<string, Layout>, layout: Layout) => {
              acc[layout._id] = layout;
              return acc;
            },
            {}
          );
          setLayouts(layoutsMap);

          // Find and set the default layout
          const defaultLayout = response.data.find(
            (layout: Layout) => layout.isDefault
          );
          if (defaultLayout) {
            setCurrentLayout(defaultLayout._id);
            setDefaultLayoutId(defaultLayout._id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch layouts:", error);
      }
    };
    fetchLayouts();
  }, []);

  const getThemeFormat = (theme: Theme, isTitle: boolean) => {
    if (isTitle) {
      return {
        fontFamily: theme.fonts.heading,
        fontSize: theme.titleFormat.fontSize,
        color: theme.titleFormat.color || theme.colors.text,
        backgroundColor: theme.colors.background,
        bold: theme.titleFormat.fontWeight === "bold",
        italic: false,
        underline: false,
        textAlign: theme.titleFormat.alignment,
        lineHeight: "1.5",
        letterSpacing: "normal",
        textTransform: "none",
      };
    }
    return {
      fontFamily: theme.fonts.body,
      fontSize: theme.contentFormat.fontSize,
      color: theme.contentFormat.color || theme.colors.text,
      backgroundColor: theme.colors.background,
      bold: theme.contentFormat.fontWeight === "bold",
      italic: false,
      underline: false,
      textAlign: theme.contentFormat.alignment,
      lineHeight: "1.5",
      letterSpacing: "normal",
      textTransform: "none",
    };
  };

  const handleGenerate = async () => {
    if (!selectedTheme) {
      toast.error("Please select a theme");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = (await generateLLMContent({
        prompts: {
          chapter: chapters.find((c) => c.id === selectedChapter)?.title || "",
          numberOfSlides: numberOfSlides.toString(),
          userPrompt: userPrompt.trim(),
        },
        context: {
          themeId: selectedTheme._id,
          download: "false", // We'll generate slides first, then download
        },
      })) as LLMResponse;

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to generate content");
      }

      const { slides, presentationId } = response.data;

      if (!slides || !presentationId) {
        throw new Error("Invalid response data");
      }

      // Transform backend slides to match frontend format
      const transformedSlides = slides.map((slide: BackendSlide) => ({
        ...slide,
        id: slide._id,
        presentationId: presentationId,
        layout: slide.layout,
        customStyles: {
          backgroundColor: selectedTheme.colors.background,
        },
        // Only apply theme formatting to existing elements
        elements:
          slide.elements?.map((element: SlideElement) => ({
            ...element,
            format: {
              ...element.format,
              ...getThemeFormat(selectedTheme, element.type === "title"),
              textTransform: "none" as const,
            },
          })) || [],
      }));

      setGeneratedSlides(transformedSlides);
      toast.success(response.data.message || "Content generated successfully!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to generate content";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedSlides || !selectedTheme) return;

    try {
      // Get the presentation ID from the generated content response
      const presentationId = generatedSlides[0]?.presentationId;
      if (!presentationId) {
        throw new Error("No presentation ID found");
      }

      const response = await api.get(
        `/presentations/${presentationId}/download`,
        {
          responseType: "blob",
          headers: {
            Accept:
              "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          },
        }
      );

      // Create object URL from blob
      const url = window.URL.createObjectURL(
        new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        })
      );

      // Create temporary link and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `presentation-${Date.now()}.pptx`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("PowerPoint downloaded successfully!");
    } catch (error) {
      console.error("Error downloading PowerPoint:", error);
      toast.error("Failed to download PowerPoint");
    }
  };

  const handleLayoutSelect = async (
    layoutId: string,
    layoutType: SlideLayout
  ) => {
    setCurrentLayout(layoutId);
    setShowLayoutSelector(false);

    // If we have a current slide, update its layout
    if (generatedSlides && currentSlideIndex >= 0) {
      const layout = layouts[layoutId];
      const currentSlide = generatedSlides[currentSlideIndex];

      // Create new elements based on the layout
      const newElements = layout.elements.map((layoutElement) => {
        // Try to find existing element of same type
        const existingElement = currentSlide.elements?.find(
          (el) => el.type === layoutElement.type
        );

        // Convert fontSize to string if it's a number
        const fontSize =
          typeof layoutElement.fontSize === "number"
            ? `${layoutElement.fontSize}pt`
            : layoutElement.fontSize ||
              existingElement?.format?.fontSize ||
              "24pt";

        // Convert lineHeight to string if it's a number
        const lineHeight =
          typeof layoutElement.lineHeight === "number"
            ? `${layoutElement.lineHeight}`
            : layoutElement.lineHeight ||
              existingElement?.format?.lineHeight ||
              "1.5";

        // Convert letterSpacing to string if it's a number
        const letterSpacing =
          typeof layoutElement.letterSpacing === "number"
            ? `${layoutElement.letterSpacing}px`
            : layoutElement.letterSpacing ||
              existingElement?.format?.letterSpacing ||
              "normal";

        return {
          type: layoutElement.type,
          value: existingElement?.value || "",
          format: {
            fontFamily:
              layoutElement.fontFamily ||
              existingElement?.format?.fontFamily ||
              "Arial",
            fontSize,
            color:
              layoutElement.color ||
              existingElement?.format?.color ||
              "#000000",
            backgroundColor:
              layoutElement.backgroundColor ||
              existingElement?.format?.backgroundColor ||
              "transparent",
            bold: layoutElement.bold ?? existingElement?.format?.bold ?? false,
            italic:
              layoutElement.italic ?? existingElement?.format?.italic ?? false,
            underline:
              layoutElement.underline ??
              existingElement?.format?.underline ??
              false,
            textAlign:
              layoutElement.textAlign ||
              existingElement?.format?.textAlign ||
              "left",
            lineHeight,
            letterSpacing,
            textTransform:
              layoutElement.textTransform ||
              existingElement?.format?.textTransform ||
              "none",
          },
        };
      });

      try {
        // Update the slide in the backend if we have the necessary IDs
        if (currentSlide._id && currentSlide.presentationId) {
          // Ensure layoutType is a valid SlideLayout value
          if (!Object.values(SlideLayout).includes(layoutType)) {
            throw new Error(`Invalid layout type: ${layoutType}`);
          }

          const updateData = {
            layout: layoutType,
            elements: newElements,
          };

          console.log("updateData", updateData);

          const updatedSlideResponse = await updateSlide(
            currentSlide.presentationId,
            currentSlide._id,
            updateData
          );

          // Update the local state with the new layout
          const updatedSlide = {
            ...currentSlide,
            layout: layoutId,
            elements: newElements,
          };

          const updatedSlides = [...generatedSlides];
          updatedSlides[currentSlideIndex] = updatedSlide;
          setGeneratedSlides(updatedSlides);

          toast.success("Layout updated successfully");
        } else {
          console.error("Missing slide ID or presentation ID:", {
            slideId: currentSlide._id,
            presentationId: currentSlide.presentationId,
          });
        }
      } catch (error) {
        console.error("Failed to update layout:", error);
        toast.error("Failed to update layout");
      }
    }
  };

  const handleSlideChange = (updatedSlide: Partial<GeneratedSlide>) => {
    if (!generatedSlides) return;

    const updatedSlides = [...generatedSlides];
    updatedSlides[currentSlideIndex] = {
      ...updatedSlides[currentSlideIndex],
      ...updatedSlide,
    };
    setGeneratedSlides(updatedSlides);
  };

  if (!isOpen) return null;

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
        overflow: "auto",
        padding: "16px",
        [BREAKPOINTS.sm]: {
          padding: "8px",
        },
      }}
    >
      {!generatedSlides ? (
        // Form view
        <Box
          as="form"
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            handleGenerate();
          }}
          sx={{
            width: "50%",
            maxHeight: "90vh",
            backgroundColor: "white",
            padding: "24px",
            margin: "auto",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            borderRadius: "8px",
            [BREAKPOINTS.lg]: {
              width: "70%",
            },
            [BREAKPOINTS.md]: {
              width: "85%",
            },
            [BREAKPOINTS.sm]: {
              width: "95%",
              padding: "16px",
            },
          }}
        >
          <Text as="h2" fontSize={3} fontWeight="bold" mb={3} color="text">
            Create Content with AI
          </Text>

          <ThemeSelector
            currentThemeId={selectedTheme?._id}
            onThemeSelect={setSelectedTheme}
          />

          <Text mb={3} color="gray.600">
            Select a chapter and provide a prompt for the AI to generate
            content:
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
                <option key={chapter.id} value={chapter.id}>
                  {chapter.title}
                </option>
              ))}
            </select>
          </Box>

          <Box mb={3}>
            <Text mb={1} fontWeight="bold" color="text">
              Number of Slides:
            </Text>
            <select
              value={numberOfSlides.toString()}
              onChange={(e) => setNumberOfSlides(Number(e.target.value))}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                marginBottom: "12px",
                backgroundColor: "white",
              }}
            >
              {[5, 7, 10, 15].map((num) => (
                <option key={num} value={num.toString()}>
                  {num}
                </option>
              ))}
            </select>
          </Box>

          <Box mb={3}>
            <Text mb={1} fontWeight="bold" color="text">
              Additional Instructions (Optional):
            </Text>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Enter any specific instructions or context for the AI..."
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                marginBottom: "12px",
                backgroundColor: "white",
                minHeight: "100px",
                resize: "vertical",
              }}
            />
          </Box>

          {error && (
            <Text color="error" mb={3}>
              {error}
            </Text>
          )}

          <Flex justifyContent="flex-end" gap={2} mt="auto">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: "8px 16px",
                borderRadius: "4px",
                border: "1px solid #e2e8f0",
                backgroundColor: "white",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedTheme || !selectedChapter}
              style={{
                padding: "8px 16px",
                borderRadius: "4px",
                border: "none",
                backgroundColor: "#3182ce",
                color: "white",
                cursor:
                  loading || !selectedTheme || !selectedChapter
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  loading || !selectedTheme || !selectedChapter ? 0.7 : 1,
              }}
            >
              {loading ? "Generating..." : "Generate Content"}
            </button>
          </Flex>
        </Box>
      ) : (
        // Preview view
        <Flex
          sx={{
            width: "100%",
            height: "90vh",
            margin: "auto",
            backgroundColor: "white",
            borderRadius: "8px",
            overflow: "hidden",
            flexDirection: "row",
            [BREAKPOINTS.md]: {
              flexDirection: "column",
              height: "auto",
            },
          }}
        >
          {showLayoutSelector && (
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "80%",
                maxHeight: "80vh",
                overflowY: "auto",
                zIndex: 1000,
                [BREAKPOINTS.md]: {
                  width: "90%",
                },
              }}
            >
              <LayoutSelector
                onLayoutSelect={handleLayoutSelect}
                currentLayout={currentLayout}
              />
            </Box>
          )}
          {/* Left side - Thumbnails */}
          <Box
            sx={{
              width: "20%",
              // height: "100%",
              backgroundColor: "white",
              borderRight: "1px solid #e2e8f0",
              overflowY: "auto",
              p: "1.5rem",
              [BREAKPOINTS.md]: {
                width: "100%",
                height: "auto",
                maxHeight: "250px",
                borderRight: "none",
                borderBottom: "1px solid #e2e8f0",
                p: "1rem",
              },
            }}
          >
            <Flex
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Text sx={{ fontSize: 14, fontWeight: 500, color: "#4a5568" }}>
                All Slides
              </Text>
              <Flex sx={{ gap: 2, flexWrap: "wrap" }}>
                <button
                  onClick={() => setShowLayoutSelector(true)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    border: "1px solid #e2e8f0",
                    backgroundColor: "white",
                    cursor: "pointer",
                    fontSize: "12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Change Layout
                </button>
                <button
                  onClick={handleDownload}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#48bb78",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Download
                </button>
              </Flex>
            </Flex>
            <Flex
              sx={{
                gap: 2,
                flexDirection: "column",
                [BREAKPOINTS.md]: {
                  flexDirection: "row",
                  overflowX: "auto",
                  pb: 2,
                  "&::-webkit-scrollbar": {
                    height: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: "#f1f1f1",
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#888",
                    borderRadius: "4px",
                    "&:hover": {
                      backgroundColor: "#555",
                    },
                  },
                },
              }}
            >
              {generatedSlides.map((slide, index) => (
                <Box
                  key={`slide-thumb-${slide.id || index}`}
                  onClick={() => setCurrentSlideIndex(index)}
                  sx={{
                    width: "100%",
                    marginBottom: 2,
                    [BREAKPOINTS.md]: {
                      width: "200px",
                      minWidth: "200px",
                      marginBottom: 0,
                      marginRight: 2,
                    },
                  }}
                >
                  <MiniSlidePreview
                    slide={slide}
                    isSelected={currentSlideIndex === index}
                    layouts={layouts}
                    defaultLayoutId={defaultLayoutId}
                  />
                </Box>
              ))}
            </Flex>
          </Box>

          {/* Right side - Current Slide Preview */}
          <Box
            sx={{
              width: "70%",
              height: "100%",
              backgroundColor: "white",
              p: "1.5rem",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              margin: "0 auto",
              [BREAKPOINTS.md]: {
                width: "100%",
                height: "auto",
                p: "1rem",
              },
            }}
          >
            <Flex
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
                mb: 4,
                flexWrap: "wrap",
                gap: 2,
                [BREAKPOINTS.sm]: {
                  mb: 2,
                },
              }}
            >
              <Flex sx={{ gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                <button
                  onClick={() =>
                    setCurrentSlideIndex((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentSlideIndex === 0}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "4px",
                    border: "1px solid #e2e8f0",
                    backgroundColor: "white",
                    cursor: currentSlideIndex === 0 ? "not-allowed" : "pointer",
                    opacity: currentSlideIndex === 0 ? 0.5 : 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  ← Previous
                </button>
                <Text
                  sx={{
                    fontSize: 14,
                    color: "#4a5568",
                    [BREAKPOINTS.sm]: {
                      fontSize: 12,
                    },
                  }}
                >
                  Slide {currentSlideIndex + 1} of {generatedSlides.length}
                </Text>
                <button
                  onClick={() =>
                    setCurrentSlideIndex((prev) =>
                      Math.min(generatedSlides.length - 1, prev + 1)
                    )
                  }
                  disabled={currentSlideIndex === generatedSlides.length - 1}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "4px",
                    border: "1px solid #e2e8f0",
                    backgroundColor: "white",
                    cursor:
                      currentSlideIndex === generatedSlides.length - 1
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      currentSlideIndex === generatedSlides.length - 1
                        ? 0.5
                        : 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  Next →
                </button>
              </Flex>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "8px 16px",
                  borderRadius: "4px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "white",
                  whiteSpace: "nowrap",
                }}
              >
                Close
              </button>
            </Flex>

            <Box sx={{ flex: 1 }}>
              {generatedSlides[currentSlideIndex] && (
                <SlidePreview
                  slide={generatedSlides[currentSlideIndex]}
                  onSlideChange={handleSlideChange}
                  currentLayout={
                    layouts[
                      generatedSlides[currentSlideIndex].layout || currentLayout
                    ]
                  }
                />
              )}
            </Box>
          </Box>
        </Flex>
      )}
    </Box>
  );
}
