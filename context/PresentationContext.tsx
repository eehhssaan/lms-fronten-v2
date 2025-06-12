import React, { createContext, useContext, useState, useCallback } from "react";
import {
  LocalPresentation,
  LocalSlide,
  SlideElement,
} from "@/types/presentation";

interface PresentationContextType {
  presentation: LocalPresentation | null;
  setPresentationFromBackend: (backendData: any) => void;
  updateSlide: (slideId: string, updates: Partial<LocalSlide>) => void;
  updateSlideElement: (
    slideId: string,
    elementId: string,
    updates: Partial<SlideElement>
  ) => void;
  updateSlideLayout: (slideId: string, layoutId: string) => void;
  updateSlideBackground: (slideId: string, backgroundColor: string) => void;
  getSerializablePresentation: () => any; // For sending back to backend
  isDirty: boolean;
  markAsSaved: () => void;
}

const PresentationContext = createContext<PresentationContextType | null>(null);

export const usePresentationContext = () => {
  const context = useContext(PresentationContext);
  if (!context) {
    throw new Error(
      "usePresentationContext must be used within a PresentationProvider"
    );
  }
  return context;
};

export const PresentationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [presentation, setPresentation] = useState<LocalPresentation | null>(
    null
  );

  const setPresentationFromBackend = useCallback((backendData: any) => {
    const localPresentation: LocalPresentation = {
      _id: backendData._id,
      title: backendData.title || "Untitled Presentation",
      description: backendData.description,
      theme: backendData.theme,
      slides: backendData.slides.map((slide: any) => ({
        _id: slide._id,
        title: slide.title,
        layout: slide.layout,
        elements: slide.elements.map((element: any) => ({
          ...element,
          x: element.x ?? 0,
          y: element.y ?? 0,
          width: element.width ?? 100,
          height: element.height ?? 100,
        })),
        customStyles: slide.customStyles,
        order: slide.order,
      })),
      lastModified: Date.now(),
      isDirty: false,
    };
    setPresentation(localPresentation);
  }, []);

  const updateSlide = useCallback(
    (slideId: string, updates: Partial<LocalSlide>) => {
      setPresentation((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          slides: prev.slides.map((slide) =>
            slide._id === slideId ? { ...slide, ...updates } : slide
          ),
          lastModified: Date.now(),
          isDirty: true,
        };
      });
    },
    []
  );

  const updateSlideElement = useCallback(
    (slideId: string, elementId: string, updates: Partial<SlideElement>) => {
      setPresentation((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          slides: prev.slides.map((slide) => {
            if (slide._id !== slideId) return slide;
            return {
              ...slide,
              elements: slide.elements.map((element) =>
                element._id === elementId ? { ...element, ...updates } : element
              ),
            };
          }),
          lastModified: Date.now(),
          isDirty: true,
        };
      });
    },
    []
  );

  const updateSlideLayout = useCallback((slideId: string, layoutId: string) => {
    setPresentation((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        slides: prev.slides.map((slide) =>
          slide._id === slideId ? { ...slide, layout: layoutId } : slide
        ),
        lastModified: Date.now(),
        isDirty: true,
      };
    });
  }, []);

  const updateSlideBackground = useCallback(
    (slideId: string, backgroundColor: string) => {
      setPresentation((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          slides: prev.slides.map((slide) =>
            slide._id === slideId
              ? {
                  ...slide,
                  customStyles: {
                    ...slide.customStyles,
                    backgroundColor,
                  },
                }
              : slide
          ),
          lastModified: Date.now(),
          isDirty: true,
        };
      });
    },
    []
  );

  const getSerializablePresentation = useCallback(() => {
    if (!presentation) return null;

    // Use destructuring to get only the fields we want to send to backend
    const {
      lastModified,
      isDirty,
      settings,
      theme,
      ...presentationForBackend
    } = presentation;
    return presentationForBackend;
  }, [presentation]);

  const markAsSaved = useCallback(() => {
    setPresentation((prev) => (prev ? { ...prev, isDirty: false } : prev));
  }, []);

  return (
    <PresentationContext.Provider
      value={{
        presentation,
        setPresentationFromBackend,
        updateSlide,
        updateSlideElement,
        updateSlideLayout,
        updateSlideBackground,
        getSerializablePresentation,
        isDirty: presentation?.isDirty || false,
        markAsSaved,
      }}
    >
      {children}
    </PresentationContext.Provider>
  );
};
