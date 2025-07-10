import { useState, useCallback, useEffect } from "react";
import {
  generatePresentationDraft,
  getPresentationDraft,
  updatePresentationDraft,
  deletePresentationDraft,
  generateFinalPresentation,
} from "../lib/api/presentations";
import { PresentationDraft } from "../types/presentation";

interface UsePresentationDraftParams {
  chapter: string;
  numSlides: number;
  language?: string;
  themeId?: string;
  scope: "subject" | "course";
  courseId?: string;
}

interface UsePresentationDraftReturn {
  draft: PresentationDraft | null;
  loading: boolean;
  error: Error | null;
  generateDraft: (params: UsePresentationDraftParams) => Promise<void>;
  updateDraft: (
    draftId: string,
    params: Partial<UsePresentationDraftParams>
  ) => Promise<void>;
  deleteDraft: (draftId: string) => Promise<void>;
  generateFinal: (draftId: string) => Promise<string>;
}

export function usePresentationDraft(): UsePresentationDraftReturn {
  const [draft, setDraft] = useState<PresentationDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateDraft = async (params: UsePresentationDraftParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await generatePresentationDraft(params);
      setDraft(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to generate draft")
      );
    } finally {
      setLoading(false);
    }
  };

  const updateDraft = async (
    draftId: string,
    params: Partial<UsePresentationDraftParams>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await updatePresentationDraft(draftId, params);
      setDraft(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to update draft")
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteDraft = async (draftId: string) => {
    setLoading(true);
    setError(null);
    try {
      await deletePresentationDraft(draftId);
      setDraft(null);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to delete draft")
      );
    } finally {
      setLoading(false);
    }
  };

  const generateFinal = async (draftId: string): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const response = await generateFinalPresentation(draftId);
      return response.url;
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to generate final presentation")
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const pollDraftStatus = useCallback(
    async (draftId: string) => {
      if (!draft || draft.status === "complete" || draft.status === "error") {
        return;
      }

      try {
        const response = await getPresentationDraft(draftId);
        setDraft(response.data);

        if (response.data.status === "generating") {
          setTimeout(() => pollDraftStatus(draftId), 2000); // Poll every 2 seconds
        }
      } catch (error) {
        console.error("Failed to poll draft status:", error);
      }
    },
    [draft]
  );

  // Start polling when draft is created
  useEffect(() => {
    if (draft && draft.status === "generating") {
      pollDraftStatus(draft._id);
    }
  }, [draft, pollDraftStatus]);

  return {
    draft,
    loading,
    error,
    generateDraft,
    updateDraft,
    deleteDraft,
    generateFinal,
  };
}
