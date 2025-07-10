import { api } from "../api";
import {
  Theme,
  Presentation,
  Slide,
  CreateThemeDto,
  UpdateThemeDto,
  Layout,
  PresentationDraftResponse,
} from "../../types/presentation";

interface LayoutResponse {
  success: boolean;
  error?: string;
  data: Layout[];
}

// Theme APIs
export const getThemes = async (): Promise<Theme[]> => {
  const response = await api.get("/themes");
  return response.data;
};

export const getTheme = async (themeId: string): Promise<Theme> => {
  const response = await api.get(`/themes/${themeId}`);
  return response.data;
};

export const createTheme = async (
  themeData: CreateThemeDto
): Promise<Theme> => {
  const response = await api.post("/themes", themeData);
  return response.data;
};

export const updateTheme = async (
  themeId: string,
  themeData: UpdateThemeDto
): Promise<Theme> => {
  const response = await api.put(`/themes/${themeId}`, themeData);
  return response.data;
};

export const deleteTheme = async (themeId: string): Promise<void> => {
  await api.delete(`/themes/${themeId}`);
};

export const setDefaultTheme = async (themeId: string): Promise<Theme> => {
  const response = await api.put(`/themes/${themeId}/set-default`);
  return response.data;
};

// Presentation APIs
export const getPresentations = async (): Promise<Presentation[]> => {
  const response = await api.get("/v1/presentations");
  return response.data;
};

export const getPresentation = async (
  presentationId: string
): Promise<Presentation> => {
  const response = await api.get(`/v1/presentations/${presentationId}`);
  return response.data;
};

export const createPresentation = async (
  presentationData: Partial<Presentation> & { draftId?: string },
  courseId?: string
): Promise<Presentation> => {
  const endpoint = courseId
    ? `/courses/${courseId}/presentations`
    : "/v1/presentations";

  const response = await api.post(endpoint, {
    ...presentationData,
    scope: courseId ? "course" : "subject",
    courseId,
  });
  return response.data;
};

export const updatePresentation = async (
  presentationId: string,
  presentationData: Partial<Presentation>,
  courseId?: string
): Promise<Presentation> => {
  const endpoint = courseId
    ? `/courses/${courseId}/presentations/${presentationId}`
    : `/v1/presentations/${presentationId}`;

  const response = await api.put(endpoint, presentationData);
  return response.data;
};

export const deletePresentation = async (
  presentationId: string
): Promise<void> => {
  await api.delete(`/v1/presentations/${presentationId}`);
};

export const updatePresentationTheme = async (
  presentationId: string,
  themeId: string
): Promise<void> => {
  const response = await api.put(`/presentations/${presentationId}/theme`, {
    themeId,
  });
  return response.data;
};

// Slide APIs
export const getSlides = async (presentationId: string): Promise<Slide[]> => {
  const response = await api.get(`/presentations/${presentationId}/slides`);
  return response.data;
};

export const getSlide = async (
  presentationId: string,
  slideId: string
): Promise<Slide> => {
  const response = await api.get(
    `/presentations/${presentationId}/slides/${slideId}`
  );
  return response.data;
};

export const createSlide = async (
  presentationId: string,
  slideData: Partial<Slide>
): Promise<Slide> => {
  const response = await api.post(
    `/presentations/${presentationId}/slides`,
    slideData
  );
  return response.data;
};

export const updateSlide = async (
  presentationId: string,
  slideId: string,
  data: any
): Promise<any> => {
  try {
    const response = await api.put(
      `/v1/presentations/${presentationId}/slides/${slideId}`,
      data
    );
    return response.data;
  } catch (error: any) {
    console.error("Error updating slide:", error);
    throw new Error(error.response?.data?.message || "Failed to update slide");
  }
};

export const deleteSlide = async (
  presentationId: string,
  slideId: string
): Promise<void> => {
  await api.delete(`/presentations/${presentationId}/slides/${slideId}`);
};

export const reorderSlides = async (
  presentationId: string,
  slideIds: string[]
): Promise<Slide[]> => {
  const response = await api.put(
    `/presentations/${presentationId}/slides/reorder`,
    { slideIds }
  );
  return response.data;
};

// PowerPoint Generation
export const generatePowerPoint = async (
  presentationId: string
): Promise<Blob> => {
  try {
    const response = await api.get(
      `/v1/presentations/${presentationId}/download`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error downloading presentation:", error);
    throw new Error(
      error.response?.data?.message || "Failed to download presentation"
    );
  }
};

export const getLayouts = async (): Promise<LayoutResponse> => {
  try {
    const response = await api.get("/layouts");

    // Ensure we have the correct response structure
    if (!response.data || !response.data.success) {
      console.error("Invalid response structure:", response.data);
      throw new Error("Invalid response from layouts API");
    }

    // Validate layout types
    if (Array.isArray(response.data.data)) {
      response.data.data.forEach((layout: Layout, index: number) => {
        if (!layout.type) {
          console.warn(`Layout at index ${index} missing type:`, layout);
        }
      });
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching layouts:", error);
    throw error;
  }
};

export const getLayout = async (id: string) => {
  try {
    const response = await api.get(`/layouts/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateSlideElementPosition = async (
  presentationId: string,
  slideId: string,
  elementId: string,
  position: "left" | "right" | "top" | "default"
): Promise<any> => {
  try {
    const response = await api.put(
      `/v1/presentations/${presentationId}/slides/${slideId}/elements/${elementId}/position`,
      { position }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error updating element position:", error);
    throw new Error(
      error.response?.data?.message || "Failed to update element position"
    );
  }
};

interface GeneratePresentationDraftParams {
  chapter: string;
  numSlides: number;
  language?: string;
  themeId?: string;
  scope: "subject" | "course";
  courseId?: string;
}

export async function generatePresentationDraft(
  params: GeneratePresentationDraftParams
): Promise<PresentationDraftResponse> {
  const response = await fetch("/api/v1/presentations/drafts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error("Failed to generate presentation draft");
  }

  return response.json();
}

export async function getPresentationDraft(
  draftId: string
): Promise<PresentationDraftResponse> {
  const response = await fetch(`/api/v1/presentations/drafts/${draftId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch presentation draft");
  }

  return response.json();
}

export async function updatePresentationDraft(
  draftId: string,
  params: Partial<GeneratePresentationDraftParams>
): Promise<PresentationDraftResponse> {
  const response = await fetch(`/api/v1/presentations/drafts/${draftId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error("Failed to update presentation draft");
  }

  return response.json();
}

export async function deletePresentationDraft(
  draftId: string
): Promise<{ success: boolean }> {
  const response = await fetch(`/api/v1/presentations/drafts/${draftId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete presentation draft");
  }

  return response.json();
}

export async function generateFinalPresentation(
  draftId: string
): Promise<{ success: boolean; url: string }> {
  const response = await fetch(
    `/api/v1/presentations/drafts/${draftId}/generate`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to generate final presentation");
  }

  return response.json();
}
