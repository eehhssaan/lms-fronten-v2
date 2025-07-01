import React, { createContext, useContext, useState, useCallback } from "react";
import { Presentation, Slide, Theme, ContentItem } from "@/types/presentation";
import { ContentLayout } from "@/components/ContentLayoutSelector";

interface PresentationContextValue {
  presentation: {
    _id: string;
    title: string;
    description: string;
    chapterId: string;
    chapterTitle: string;
    themeId: Theme;
    defaultLayout: string;
    aspectRatio: string;
    author: string;
    scope: string;
    isPublic: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    slides: Slide[];
  } | null;
  isDirty: boolean;
  setPresentationFromBackend: (data: any) => void;
  updateSlide: (slideId: string, updates: Partial<Slide>) => void;
  updateSlideElement: (
    slideId: string,
    elementId: string,
    updates: {
      value?: string | ContentItem[];
      format?: any;
      contentLayout?: ContentLayout;
    }
  ) => void;
  updateSlideLayout: (
    slideId: string,
    layoutId: string,
    layoutType: string
  ) => void;
  updateSlideBackground: (slideId: string, backgroundColor: string) => void;
  getSerializablePresentation: () => any;
  markAsSaved: () => void;
}

const PresentationContext = createContext<PresentationContextValue | undefined>(
  undefined
);

export const PresentationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [presentation, setPresentation] =
    useState<PresentationContextValue["presentation"]>(null);
  const [isDirty, setIsDirty] = useState(false);

  const setPresentationFromBackend = useCallback((data: any) => {
    setPresentation({
      ...data.presentation,
      slides: data.slides,
    });
  }, []);

  const updateSlide = useCallback(
    (slideId: string, updates: Partial<Slide>) => {
      setPresentation((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          slides: prev.slides.map((slide) =>
            slide._id === slideId ? { ...slide, ...updates } : slide
          ),
        };
      });
      setIsDirty(true);
    },
    []
  );

  const updateSlideElement = useCallback(
    (
      slideId: string,
      elementId: string,
      updates: {
        value?: string | ContentItem[];
        format?: any;
        contentLayout?: ContentLayout;
      }
    ) => {
      setPresentation((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          slides: prev.slides.map((slide) => {
            if (slide._id !== slideId) return slide;
            return {
              ...slide,
              elements: slide.elements.map((element) => {
                if (element._id !== elementId) return element;
                return {
                  ...element,
                  ...updates,
                };
              }),
            };
          }),
        };
      });
      setIsDirty(true);
    },
    []
  );

  const updateSlideLayout = useCallback(
    (slideId: string, layoutId: string, layoutType: string) => {
      setPresentation((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          slides: prev.slides.map((slide) =>
            slide._id === slideId
              ? { ...slide, layout: layoutId, layoutType }
              : slide
          ),
        };
      });
      setIsDirty(true);
    },
    []
  );

  const updateSlideBackground = useCallback(
    (slideId: string, backgroundColor: string) => {
      setPresentation((prev) => {
        if (!prev) return null;
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
        };
      });
      setIsDirty(true);
    },
    []
  );

  const getSerializablePresentation = useCallback(() => {
    if (!presentation) return null;
    return {
      presentation: {
        _id: presentation._id,
        title: presentation.title,
        description: presentation.description,
        chapterId: presentation.chapterId,
        chapterTitle: presentation.chapterTitle,
        themeId: presentation.themeId,
        defaultLayout: presentation.defaultLayout,
        aspectRatio: presentation.aspectRatio,
        author: presentation.author,
        scope: presentation.scope,
        isPublic: presentation.isPublic,
        isActive: presentation.isActive,
        createdAt: presentation.createdAt,
        updatedAt: presentation.updatedAt,
      },
      slides: presentation.slides,
    };
  }, [presentation]);

  const markAsSaved = useCallback(() => {
    setIsDirty(false);
  }, []);

  return (
    <PresentationContext.Provider
      value={{
        presentation,
        isDirty,
        setPresentationFromBackend,
        updateSlide,
        updateSlideElement,
        updateSlideLayout,
        updateSlideBackground,
        getSerializablePresentation,
        markAsSaved,
      }}
    >
      {children}
    </PresentationContext.Provider>
  );
};

export const usePresentationContext = () => {
  const context = useContext(PresentationContext);
  if (context === undefined) {
    throw new Error(
      "usePresentationContext must be used within a PresentationProvider"
    );
  }
  return context;
};
