"use client";

import React, { useState, useEffect } from "react";
import { Box, Text } from "rebass";
import { useParams, useRouter } from "next/navigation";
import { Theme } from "@/types/presentation";
import ThemeSelector from "@/components/ThemeSelector";
import DraftPreview from "@/components/DraftPreview";
import PresentationPreview from "@/components/PresentationPreview";
import { toast } from "react-hot-toast";
import { api, generateLLMContent, getSubjectChapters } from "@/lib/api";

interface Chapter {
  id: string;
  title: string;
}

interface DraftSlide {
  slideNumber: number;
  title: string;
  bulletPoints: string[];
  type: "title" | "content" | "section";
}

interface DraftContent {
  id: string;
  topic: string;
  numSlides: number;
  content: DraftSlide[];
  status: "generating" | "complete" | "error";
  progress: number;
}

interface DraftResponse {
  success: boolean;
  data: DraftContent;
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
        _id?: string;
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

const POLLING_INTERVAL = 3000; // 3 seconds

export default function PresentationGeneratorPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.subjectId as string;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [numberOfSlides, setNumberOfSlides] = useState(5);
  const [userPrompt, setUserPrompt] = useState("");
  const [draftContent, setDraftContent] = useState<DraftContent | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState("");
  const [finalContent, setFinalContent] = useState<LLMResponse["data"] | null>(
    null
  );

  // Fetch chapters when component mounts
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const response = await getSubjectChapters(subjectId);
        if (response.data) {
          setChapters(
            response.data.map((chapter: any) => ({
              id: chapter._id,
              title: chapter.title,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch chapters:", error);
        toast.error("Failed to load chapters");
      }
    };

    fetchChapters();
  }, [subjectId]);

  // Polling for draft status
  useEffect(() => {
    if (!draftContent || draftContent.status !== "generating") return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await api.get(
          `/v1/presentations/drafts/${draftContent.id}`
        );

        if (!response.data.success) {
          throw new Error(
            response.data.error || "Failed to fetch draft status"
          );
        }

        setDraftContent(response.data.data);

        if (response.data.data.status !== "generating") {
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error("Error polling draft status:", error);
        clearInterval(pollInterval);
      }
    }, POLLING_INTERVAL);

    return () => clearInterval(pollInterval);
  }, [draftContent]);

  const handleGenerateDraft = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTheme) {
      toast.error("Please select a theme");
      return;
    }

    if (!selectedChapter) {
      toast.error("Please select a chapter");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/v1/presentations/drafts", {
        topic: userPrompt.trim(),
        numSlides: numberOfSlides,
        language: "English (US)",
        themeId: selectedTheme._id,
        chapter: chapters.find((c) => c.id === selectedChapter)?.title || "",
      });

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to generate draft");
      }

      setDraftContent(response.data.data);
      toast.success("Draft generation started!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to generate draft";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSlide = (
    slideNumber: number,
    updatedSlide: DraftResponse["data"]["content"][0]
  ) => {
    if (!draftContent) return;

    const updatedContent = {
      ...draftContent,
      content: draftContent.content.map((slide) =>
        slide.slideNumber === slideNumber ? updatedSlide : slide
      ),
    };

    setDraftContent(updatedContent);
  };

  const handleGenerateFinal = async () => {
    if (!draftContent || !selectedTheme) return;

    try {
      const response = await generateLLMContent({
        prompts: {
          topic: draftContent.topic,
          numberOfSlides: draftContent.numSlides.toString(),
          content: JSON.stringify(draftContent.content),
        },
        context: {
          themeId: selectedTheme._id,
          download: "false",
          draftId: draftContent.id,
        },
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to generate presentation");
      }

      setFinalContent(response.data);
      toast.success("Final presentation generated successfully!");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to generate presentation";
      toast.error(message);
    }
  };

  return (
    <Box p={4}>
      <Text as="h1" fontSize={4} fontWeight="bold" mb={4}>
        Create Presentation
      </Text>

      {!draftContent && !finalContent ? (
        <Box
          as="form"
          onSubmit={handleGenerateDraft}
          sx={{
            maxWidth: "800px",
            margin: "0 auto",
            backgroundColor: "white",
            padding: "24px",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <Box mb={4}>
            <Text mb={2} fontWeight="bold">
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

          <Box mb={4}>
            <Text mb={2} fontWeight="bold">
              Theme:
            </Text>
            <ThemeSelector
              currentThemeId={selectedTheme?._id}
              onThemeSelect={(theme) => {
                setSelectedTheme(theme);
              }}
            />
          </Box>

          <Box mb={4}>
            <Text mb={2} fontWeight="bold">
              Number of Slides:
            </Text>
            <select
              value={numberOfSlides}
              onChange={(e) => setNumberOfSlides(Number(e.target.value))}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                backgroundColor: "white",
              }}
            >
              {[5, 7, 10, 15].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </Box>

          <Box mb={4}>
            <Text mb={2} fontWeight="bold">
              Additional Instructions (Optional):
            </Text>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Enter any specific instructions or context..."
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                backgroundColor: "white",
                minHeight: "120px",
                resize: "vertical",
              }}
            />
          </Box>

          {error && (
            <Text color="red" mb={3}>
              {error}
            </Text>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Generating..." : "Generate Draft"}
          </button>
        </Box>
      ) : finalContent ? (
        <PresentationPreview
          presentationId={finalContent.presentationId}
          slides={finalContent.slides}
          onBack={() => setFinalContent(null)}
        />
      ) : draftContent ? (
        <DraftPreview
          content={draftContent}
          onEdit={handleEditSlide}
          onGenerateFinal={handleGenerateFinal}
        />
      ) : null}
    </Box>
  );
}
