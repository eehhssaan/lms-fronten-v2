import { api } from "../api";
import {
  Theme,
  Presentation,
  Slide,
  CreateThemeDto,
  UpdateThemeDto,
} from "../../types/presentation";

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
  const response = await api.get("/presentations");
  return response.data;
};

export const getPresentation = async (
  presentationId: string
): Promise<{ presentation: Presentation; slides: Slide[] }> => {
  const response = await api.get(`/presentations/${presentationId}`);
  return response.data;
};

export const createPresentation = async (
  presentationData: Partial<Presentation>
): Promise<Presentation> => {
  const response = await api.post("/presentations", presentationData);
  return response.data;
};

export const updatePresentation = async (
  presentationId: string,
  presentationData: Partial<Presentation>
): Promise<Presentation> => {
  const response = await api.put(
    `/presentations/${presentationId}`,
    presentationData
  );
  return response.data;
};

export const deletePresentation = async (
  presentationId: string
): Promise<void> => {
  await api.delete(`/presentations/${presentationId}`);
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
  slideData: Partial<Slide>
): Promise<Slide> => {
  const response = await api.put(
    `/presentations/${presentationId}/slides/${slideId}`,
    slideData
  );
  return response.data;
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
  const response = await api.get(`/presentations/${presentationId}/download`, {
    responseType: "blob",
  });
  return response.data;
};

export const getLayouts = async () => {
  try {
    const response = await api.get("/layouts");
    return response.data;
  } catch (error) {
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
