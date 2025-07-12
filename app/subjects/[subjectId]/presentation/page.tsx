"use client";

import React, { useState, useEffect } from "react";
import { Box, Text } from "rebass";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  Theme,
  PresentationDraft,
  PresentationDraftSlide,
} from "@/types/presentation";
import ThemeSelector from "@/components/ThemeSelector";
import DraftPreview from "@/components/DraftPreview";
import { toast } from "react-hot-toast";
import {
  api,
  generateLLMContent,
  getSubjectChapters,
  generateDraft,
} from "@/lib/api";

interface Chapter {
  id: string;
  title: string;
}

const POLLING_INTERVAL = 3000; // 3 seconds

function PresentationGenerator() {
  const router = useRouter();
  const params = useParams();
  const subjectId = params.subjectId as string;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [numberOfSlides, setNumberOfSlides] = useState(5);
  const [userPrompt, setUserPrompt] = useState("");
  const [draftContent, setDraftContent] = useState<PresentationDraft | null>(
    null
  );
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState("");
  const [isClient, setIsClient] = useState(false);

  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId") || undefined;
  const scope = courseId ? "course" : "subject";

  // Mark component as mounted on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const chapterId = searchParams.get("chapterId");
    if (chapterId) {
      setSelectedChapter(chapterId);
    }
  }, [searchParams]);

  // Fetch chapters when component mounts
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const response = await getSubjectChapters(subjectId);
        if (response.data) {
          const chaptersData = response.data.map((chapter: any) => ({
            id: chapter._id,
            title: chapter.title,
          }));
          setChapters(chaptersData);

          // If no chapter is selected and we have chapters, select the first one
          if (!selectedChapter && chaptersData.length > 0) {
            setSelectedChapter(chaptersData[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch chapters:", error);
        toast.error("Failed to load chapters");
      }
    };

    fetchChapters();
  }, [subjectId, selectedChapter]);

  // Polling for draft status
  useEffect(() => {
    if (!draftContent || draftContent.status !== "generating") return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await api.get(
          `/v1/presentations/drafts/${draftContent._id}`
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
      const response = await generateDraft({
        numSlides: numberOfSlides,
        language: "English (US)",
        themeId: selectedTheme._id,
        chapter: chapters.find((c) => c.id === selectedChapter)?.title || "",
        scope,
        courseId,
      });

      setDraftContent(response.data);
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
    updatedSlide: PresentationDraftSlide
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

    setLoading(true);
    try {
      // Convert the draft content to a more concise format
      const formattedDraftContent = draftContent.content.map((slide) => ({
        slideNumber: slide.slideNumber,
        title: slide.title,
        type: slide.type,
        bulletPoints: slide.bulletPoints.map((point) => {
          let text = point.title;
          if (point.description) text += `: ${point.description}`;
          if (point.subPoints.length > 0) {
            text +=
              " | Subpoints: " +
              point.subPoints
                .map(
                  (sub) =>
                    `${sub.title}${
                      sub.description ? `: ${sub.description}` : ""
                    }`
                )
                .join("; ");
          }
          return text;
        }),
      }));

      const response = await generateLLMContent({
        prompts: {
          chapter: draftContent.chapter,
          numberOfSlides: draftContent.content.length.toString(),
          userPrompt,
          draftContent: formattedDraftContent,
        },
        context: {
          themeId: selectedTheme._id,
          download: "false",
          chapterId: selectedChapter,
          ...(courseId ? { courseId, scope } : {}),
          subjectId,
        },
      });

      if (!response.success) {
        throw new Error(
          response.error || "Failed to generate final presentation"
        );
      }

      // Navigate to the presentation view with the new presentation ID
      const presentationPath = `/subjects/${subjectId}/presentation/${response.data.presentationId}`;
      router.push(presentationPath);
      toast.success("Presentation generated successfully!");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to generate final presentation";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) {
    return (
      <Box p={4}>
        <Text>Loading...</Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <form onSubmit={handleGenerateDraft}>
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
            disabled={loading}
          >
            <option value="">Select a chapter</option>
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
            onThemeSelect={(theme) => setSelectedTheme(theme)}
            disabled={loading}
          />
        </Box>

        <Box mb={4}>
          <Text mb={2} fontWeight="bold">
            Number of Slides:
          </Text>
          <input
            type="number"
            value={numberOfSlides}
            onChange={(e) => setNumberOfSlides(parseInt(e.target.value, 10))}
            min={1}
            max={50}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
            disabled={loading}
          />
        </Box>

        <Box mb={4}>
          <Text mb={2} fontWeight="bold">
            Additional Instructions (Optional):
          </Text>
          <textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              minHeight: "100px",
              resize: "vertical",
            }}
            disabled={loading}
            placeholder="Add any specific instructions for the presentation..."
          />
        </Box>

        <button
          type="submit"
          disabled={loading || !selectedChapter || !selectedTheme}
          style={{
            backgroundColor: loading ? "#ccc" : "#0070f3",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            width: "100%",
          }}
        >
          {loading ? "Generating..." : "Generate Presentation"}
        </button>
      </form>

      {error && (
        <Box mt={4} p={3} bg="red.50" borderRadius={4}>
          <Text color="red">{error}</Text>
        </Box>
      )}

      {draftContent && (
        <Box mt={4}>
          <DraftPreview
            draft={draftContent}
            onEdit={handleEditSlide}
            onGenerateFinal={handleGenerateFinal}
          />
        </Box>
      )}
    </Box>
  );
}

export default function SubjectPresentationPage() {
  return (
    <Box>
      <PresentationGenerator />
    </Box>
  );
}
