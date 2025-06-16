"use client";

import React, { useState, useEffect, useRef } from "react";
import { Box, Text } from "rebass";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Theme, Slide } from "@/types/presentation";
import ThemeSelector from "@/components/ThemeSelector";
import DraftPreview from "@/components/DraftPreview";
import PresentationPreview from "@/components/PresentationPreview";
import { toast } from "react-hot-toast";
import {
  api,
  generateLLMContent,
  getSubjectChapters,
  generateDraft,
} from "@/lib/api";
import {
  PresentationProvider,
  usePresentationContext,
} from "@/context/PresentationContext";

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
  chapter: string;
  userPrompt: string;
  themeId?: string;
  title?: string;
  aspectRatio?: string;
  courseId?: string;
  scope?: "subject" | "course";
}

const POLLING_INTERVAL = 3000; // 3 seconds

function PresentationGenerator() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = params.id as string;
  const chapterId = params.chapterId as string;
  const subjectId = searchParams.get("subjectId");

  const { setPresentationFromBackend } = usePresentationContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [numberOfSlides, setNumberOfSlides] = useState(5);
  const [userPrompt, setUserPrompt] = useState("");
  const [draftContent, setDraftContent] = useState<DraftContent | null>(null);
  const [chapters, setChapters] = useState<{ id: string; title: string }[]>([]);
  const [finalContent, setFinalContent] = useState<any>(null);

  // Fetch chapters when component mounts
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        if (!subjectId) {
          toast.error("Subject ID is required");
          return;
        }
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
  }, [courseId, subjectId]);

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

    setLoading(true);
    setError(null);

    try {
      const response = await generateDraft({
        numSlides: numberOfSlides,
        language: "English (US)",
        themeId: selectedTheme._id,
        chapter: chapters.find((c) => c.id === chapterId)?.title || "",
        courseId,
        scope: "course",
      });

      setDraftContent({
        ...response.data,
        courseId,
        scope: "course",
      });
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

  const handleEditSlide = (slideNumber: number, updatedSlide: DraftSlide) => {
    if (!draftContent) return;

    setDraftContent({
      ...draftContent,
      content: draftContent.content.map((slide) =>
        slide.slideNumber === slideNumber ? updatedSlide : slide
      ),
    });
  };

  const handleGenerateFinal = async () => {
    if (!draftContent || !selectedTheme) return;

    try {
      const response = await generateLLMContent({
        prompts: {
          chapter: draftContent.chapter,
          numberOfSlides: draftContent.content.length.toString(),
          userPrompt: draftContent.userPrompt,
          draftContent: draftContent.content,
        },
        context: {
          themeId: selectedTheme._id,
          download: "false",
          chapterId,
          courseId,
          scope: "course",
        },
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to generate presentation");
      }

      // Save to PresentationContext
      setPresentationFromBackend({
        _id: response.data.presentationId,
        title: draftContent.title || "Untitled Presentation",
        theme: selectedTheme,
        slides: response.data.slides,
        courseId,
        scope: "course",
      });

      // Keep existing finalContent state for UI
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
        Create Course Presentation
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
              value={chapterId}
              onChange={(e) =>
                router.push(
                  `/courses/${courseId}/chapters/${e.target.value}/presentation/create?subjectId=${subjectId}`
                )
              }
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                backgroundColor: "white",
              }}
            >
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
            disabled={loading || !selectedTheme}
            style={{
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "4px",
              cursor: loading || !selectedTheme ? "not-allowed" : "pointer",
              opacity: loading || !selectedTheme ? 0.7 : 1,
            }}
          >
            {loading ? "Generating..." : "Generate Draft"}
          </button>
        </Box>
      ) : finalContent ? (
        <PresentationProvider>
          <PresentationInitializer
            presentationId={finalContent.presentationId}
            initialData={{
              _id: finalContent.presentationId,
              slides: finalContent.slides,
            }}
          />
          <SaveHandler presentationId={finalContent.presentationId} />
          <PresentationPreview
            presentationId={finalContent.presentationId}
            onBack={() =>
              router.push(
                `/courses/${courseId}/chapters/${chapterId}/presentation`
              )
            }
            onSave={() => (window as any).__handlePresentationSave?.()}
          />
        </PresentationProvider>
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

// Custom hook to initialize presentation data
function PresentationInitializer({
  presentationId,
  initialData,
}: {
  presentationId: string;
  initialData: any;
}) {
  const { setPresentationFromBackend } = usePresentationContext();

  useEffect(() => {
    setPresentationFromBackend(initialData);
  }, [presentationId, initialData, setPresentationFromBackend]);

  return null;
}

function SaveHandler({ presentationId }: { presentationId: string }) {
  const { getSerializablePresentation, markAsSaved } = usePresentationContext();
  const saveRef = useRef<(() => Promise<void>) | null>(null);
  const params = useParams();
  const courseId = params.id as string;
  const chapterId = params.chapterId as string;

  saveRef.current = async () => {
    try {
      const presentationData = getSerializablePresentation();
      if (!presentationData) {
        throw new Error("No presentation data to save");
      }

      // Use the course-specific endpoint with chapterId and themeId
      await api.post(`/api/courses/${courseId}/presentations`, {
        ...presentationData,
        chapterId: chapterId,
        themeId: presentationData.theme?._id,
        draftId: presentationId,
      });

      markAsSaved();
      toast.success("Presentation saved successfully");
    } catch (error) {
      console.error("Error saving presentation:", error);
      toast.error("Failed to save presentation");
    }
  };

  useEffect(() => {
    (window as any).__handlePresentationSave = () => saveRef.current?.();
    return () => {
      delete (window as any).__handlePresentationSave;
    };
  }, []);

  return null;
}

// Main page component that provides the context
export default function CreateCoursePresentationPage() {
  return (
    <PresentationProvider>
      <PresentationGenerator />
    </PresentationProvider>
  );
}
