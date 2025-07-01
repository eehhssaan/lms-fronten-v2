"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import PresentationPreview from "@/components/PresentationPreview";
import { getPresentation, updatePresentation } from "@/lib/api/presentations";
import { toast } from "react-hot-toast";
import Loading from "@/components/Loading";
import {
  PresentationProvider,
  usePresentationContext,
} from "@/context/PresentationContext";

// Custom hook to initialize presentation data
function PresentationInitializer({
  presentationData,
}: {
  presentationData: any;
}) {
  const { setPresentationFromBackend } = usePresentationContext();

  useEffect(() => {
    setPresentationFromBackend(presentationData);
  }, [presentationData, setPresentationFromBackend]);

  return null;
}

function PresentationContent() {
  const router = useRouter();
  const params = useParams();
  const subjectId = params.subjectId as string;
  const presentationId = params.presentationId as string;
  const [isSaving, setIsSaving] = useState(false);
  const { getSerializablePresentation, markAsSaved } = usePresentationContext();

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const presentationData = getSerializablePresentation();
      if (!presentationData) {
        throw new Error("No presentation data to save");
      }
      await updatePresentation(presentationId, presentationData);
      markAsSaved();
      toast.success("Presentation saved successfully");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save presentation";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PresentationPreview
      presentationId={presentationId}
      onBack={() => router.push(`/subjects/${subjectId}/presentation`)}
      onSave={handleSave}
    />
  );
}

export default function PresentationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const subjectId = params.subjectId as string;
  const presentationId = params.presentationId as string;

  const [presentationData, setPresentationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPresentation = async () => {
      try {
        // const response = await getPresentation(presentationId);
        const response = {
          presentation: {
            _id: "68516922aad46fe319b7d830",
            title: "Untitled Presentation",
            description: "",
            chapterId: "682caccb47bd63925da948fb",
            chapterTitle: "Geometry (Basic)",
            themeId: {
              colors: {
                background: "#FFFBEB",
                text: "#9A3412",
                accent1: "#EA580C",
                accent2: "#F97316",
                accent3: "#FDBA74",
              },
              fonts: {
                heading: "Trebuchet MS",
                body: "Avenir",
              },
              defaults: {
                title: {
                  fontSize: "44pt",
                  fontWeight: "bold",
                  color: "#EA580C",
                },
                content: {
                  fontSize: "24pt",
                  fontWeight: "normal",
                  color: "#9A3412",
                },
              },
              _id: "682e15ae338821734ce5ba3c",
              name: "Sunset Warm",
              description: "A warm theme with sunset-inspired colors",
              isDefault: false,
              isPublic: true,
              createdAt: "2025-05-21T18:04:30.660Z",
              updatedAt: "2025-05-21T18:04:30.660Z",
              __v: 0,
            },
            defaultLayout: "title-content",
            aspectRatio: "16:9",
            author: "67fe769866c9bc79ba9c902d",
            scope: "subject",
            isPublic: false,
            isActive: true,
            createdAt: "2025-06-17T13:09:54.271Z",
            updatedAt: "2025-06-20T10:56:27.322Z",
            __v: 0,
          },
          slides: [
            {
              customStyles: {
                backgroundColor: "#FFFBEB",
              },
              _id: "6851693daad46fe319b7d833",
              title: "Introduction to Basic Geometry",
              type: "content",
              layout: "683297c461558c2d09e02594",
              layoutType: "title-content",
              elements: [
                {
                  format: {
                    fontFamily: "Trebuchet MS",
                    fontSize: "44pt",
                    color: "#EA580C",
                    backgroundColor: "#FFFBEB",
                    bold: true,
                    italic: false,
                    underline: false,
                    textAlign: "center",
                    lineHeight: "1.5",
                  },
                  type: "title",
                  value: "Testing",
                  x: 473,
                  y: 53,
                  width: 756,
                  height: 80,
                  position: "default",
                  relatedElements: [],
                  _id: "6851693daad46fe319b7d834",
                },
                {
                  format: {
                    fontFamily: "Avenir",
                    fontSize: "24pt",
                    color: "#9A3412",
                    backgroundColor: "#FFFBEB",
                    bold: false,
                    italic: false,
                    underline: false,
                    textAlign: "left",
                    lineHeight: "1.5",
                  },
                  type: "content",
                  value: [
                    {
                      title: "Basic Elements",
                      detail:
                        "The fundamental elements of geometry are points, lines, and planes.",
                    },
                    {
                      title: "Definitions",
                      detail:
                        "A point denotes a specific location, a line is an infinite set of points extending in both directions, and a plane is a flat surface extending indefinitely in all directions.",
                    },
                    {
                      title: "Importance",
                      detail:
                        "These elements are interrelated and form the basis of geometric concepts, often referred to as undefined terms since their definitions are accepted without proof.",
                    },
                  ],

                  x: 473,
                  y: 186,
                  width: 756,
                  height: 133,
                  position: "default",
                  relatedElements: [],
                  _id: "6851693daad46fe319b7d835",
                },
                {
                  format: {
                    fontFamily: "Avenir",
                    fontSize: "24pt",
                    color: "#9A3412",
                    backgroundColor: "#FFFBEB",
                    bold: false,
                    italic: false,
                    underline: false,
                    textAlign: "left",
                    lineHeight: "1.5",
                  },
                  type: "image",
                  value:
                    "https://consolidatedlabel.com/app/uploads/2007/10/low-res-72dpi.jpg",
                  x: 473,
                  y: 398,
                  width: 567,
                  height: 186,
                  position: "default",
                  relatedElements: [],
                  _id: "6851693daad46fe319b7d836",
                },
              ],
              order: 1,
              presentationId: "68516922aad46fe319b7d830",
              themeId: "682e15ae338821734ce5ba3c",
              createdAt: "2025-06-20T10:56:25.032Z",
              updatedAt: "2025-06-20T10:56:25.032Z",
              __v: 0,
            },
            {
              customStyles: {
                backgroundColor: "#FFFBEB",
              },
              _id: "6851693daad46fe319b7d837",
              title: "Basic Elements of Geometry",
              type: "content",
              layout: "683297c461558c2d09e02594",
              layoutType: "image-left",
              elements: [
                {
                  format: {
                    fontFamily: "Trebuchet MS",
                    fontSize: "44pt",
                    color: "#EA580C",
                    backgroundColor: "#FFFBEB",
                    bold: true,
                    italic: false,
                    underline: false,
                    textAlign: "center",
                    lineHeight: "1.5",
                  },
                  type: "title",
                  value: "Basic Elements of Geometry",
                  x: 473,
                  y: 53,
                  width: 756,
                  height: 80,
                  position: "default",
                  relatedElements: [],
                  _id: "6851693daad46fe319b7d838",
                },
                {
                  format: {
                    fontFamily: "Avenir",
                    fontSize: "24pt",
                    color: "#9A3412",
                    backgroundColor: "#FFFBEB",
                    bold: false,
                    italic: false,
                    underline: false,
                    textAlign: "left",
                    lineHeight: "1.5",
                  },
                  type: "content",
                  value: [
                    {
                      title: "Basic Elements",
                      detail:
                        "The fundamental elements of geometry are points, lines, and planes.",
                    },
                    {
                      title: "Definitions",
                      detail:
                        "A point denotes a specific location, a line is an infinite set of points extending in both directions, and a plane is a flat surface extending indefinitely in all directions.",
                    },
                    {
                      title: "Importance",
                      detail:
                        "These elements are interrelated and form the basis of geometric concepts, often referred to as undefined terms since their definitions are accepted without proof.",
                    },
                  ],
                  x: 709,
                  y: 265,
                  width: 378,
                  height: 371,
                  position: "default",
                  relatedElements: [],
                  _id: "6851693daad46fe319b7d839",
                },
                {
                  format: {
                    fontFamily: "Avenir",
                    fontSize: "24pt",
                    color: "#9A3412",
                    backgroundColor: "#FFFBEB",
                    bold: false,
                    italic: false,
                    underline: false,
                    textAlign: "left",
                    lineHeight: "1.5",
                  },
                  type: "image",
                  value:
                    "https://consolidatedlabel.com/app/uploads/2007/10/low-res-72dpi.jpg",
                  x: 236,
                  y: 265,
                  width: 378,
                  height: 371,
                  position: "default",
                  relatedElements: [],
                  _id: "6851693daad46fe319b7d83a",
                },
              ],
              order: 2,
              presentationId: "68516922aad46fe319b7d830",
              themeId: "682e15ae338821734ce5ba3c",
              createdAt: "2025-06-20T10:56:25.033Z",
              updatedAt: "2025-06-20T10:56:25.033Z",
              __v: 0,
            },

            {
              customStyles: {
                backgroundColor: "#FFFBEB",
              },
              _id: "6851693daad46fe319b7d83f",
              title: "Angles and their Types",
              type: "content",
              layout: "683297c461558c2d09e02594",
              layoutType: "image-left",
              elements: [
                {
                  format: {
                    fontFamily: "Trebuchet MS",
                    fontSize: "44pt",
                    color: "#EA580C",
                    backgroundColor: "#FFFBEB",
                    bold: true,
                    italic: false,
                    underline: false,
                    textAlign: "center",
                    lineHeight: "1.5",
                  },
                  type: "title",
                  value: "Angles and their Types",
                  x: 473,
                  y: 53,
                  width: 756,
                  height: 80,
                  position: "default",
                  relatedElements: [],
                  _id: "6851693daad46fe319b7d840",
                },
                {
                  format: {
                    fontFamily: "Avenir",
                    fontSize: "24pt",
                    color: "#9A3412",
                    backgroundColor: "#FFFBEB",
                    bold: false,
                    italic: false,
                    underline: false,
                    textAlign: "left",
                    lineHeight: "1.5",
                  },
                  type: "content",
                  value: [
                    {
                      title: "Basic Elements",
                      detail:
                        "The fundamental elements of geometry are points, lines, and planes.",
                    },
                    {
                      title: "Definitions",
                      detail:
                        "A point denotes a specific location, a line is an infinite set of points extending in both directions, and a plane is a flat surface extending indefinitely in all directions.",
                    },
                    {
                      title: "Importance",
                      detail:
                        "These elements are interrelated and form the basis of geometric concepts, often referred to as undefined terms since their definitions are accepted without proof.",
                    },
                  ],
                  x: 709,
                  y: 265,
                  width: 378,
                  height: 371,
                  position: "default",
                  relatedElements: [],
                  _id: "6851693daad46fe319b7d841",
                },
                {
                  format: {
                    fontFamily: "Avenir",
                    fontSize: "24pt",
                    color: "#9A3412",
                    backgroundColor: "#FFFBEB",
                    bold: false,
                    italic: false,
                    underline: false,
                    textAlign: "left",
                    lineHeight: "1.5",
                  },
                  type: "image",
                  value:
                    "https://consolidatedlabel.com/app/uploads/2007/10/low-res-72dpi.jpg",
                  x: 236,
                  y: 265,
                  width: 378,
                  height: 371,
                  position: "default",
                  relatedElements: [],
                  _id: "6851693daad46fe319b7d842",
                },
              ],
              order: 4,
              presentationId: "68516922aad46fe319b7d830",
              themeId: "682e15ae338821734ce5ba3c",
              createdAt: "2025-06-20T10:56:25.034Z",
              updatedAt: "2025-06-20T10:56:25.034Z",
              __v: 0,
            },
            {
              customStyles: {
                backgroundColor: "#FFFBEB",
              },
              _id: "6851693daad46fe319b7d843",
              title: "Applying Geometry in Real Life",
              type: "content",
              layout: "683297c461558c2d09e02594",
              layoutType: "image-right",
              elements: [
                {
                  format: {
                    fontFamily: "Trebuchet MS",
                    fontSize: "44pt",
                    color: "#EA580C",
                    backgroundColor: "#FFFBEB",
                    bold: true,
                    italic: false,
                    underline: false,
                    textAlign: "center",
                    lineHeight: "1.5",
                  },
                  type: "title",
                  value: "Applying Geometry in Real Life",
                  x: 473,
                  y: 53,
                  width: 756,
                  height: 80,
                  position: "default",
                  relatedElements: [],
                  _id: "6851693daad46fe319b7d844",
                },
                {
                  format: {
                    fontFamily: "Avenir",
                    fontSize: "24pt",
                    color: "#9A3412",
                    backgroundColor: "#FFFBEB",
                    bold: false,
                    italic: false,
                    underline: false,
                    textAlign: "left",
                    lineHeight: "1.5",
                  },
                  type: "content",
                  value: [
                    {
                      title: "Basic Elements",
                      detail:
                        "The fundamental elements of geometry are points, lines, and planes.",
                    },
                    {
                      title: "Definitions",
                      detail:
                        "A point denotes a specific location, a line is an infinite set of points extending in both directions, and a plane is a flat surface extending indefinitely in all directions.",
                    },
                    {
                      title: "Importance",
                      detail:
                        "These elements are interrelated and form the basis of geometric concepts, often referred to as undefined terms since their definitions are accepted without proof.",
                    },
                  ],
                  y: 265,
                  width: 378,
                  height: 371,
                  position: "default",
                  relatedElements: [],
                  _id: "6851693daad46fe319b7d845",
                },
                {
                  format: {
                    fontFamily: "Avenir",
                    fontSize: "24pt",
                    color: "#9A3412",
                    backgroundColor: "#FFFBEB",
                    bold: false,
                    italic: false,
                    underline: false,
                    textAlign: "left",
                    lineHeight: "1.5",
                  },
                  type: "image",
                  value:
                    "https://consolidatedlabel.com/app/uploads/2007/10/low-res-72dpi.jpg",
                  x: 709,
                  y: 265,
                  width: 378,
                  height: 371,
                  position: "default",
                  relatedElements: [],
                  _id: "6851693daad46fe319b7d846",
                },
              ],
              order: 5,
              presentationId: "68516922aad46fe319b7d830",
              themeId: "682e15ae338821734ce5ba3c",
              createdAt: "2025-06-20T10:56:25.035Z",
              updatedAt: "2025-06-20T10:56:25.035Z",
              __v: 0,
            },
          ],
        };
        setPresentationData(response);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to fetch presentation";
        toast.error(message);
        router.push(`/subjects/${subjectId}/presentation`);
      } finally {
        setLoading(false);
      }
    };

    fetchPresentation();
  }, [presentationId, router, subjectId]);

  if (loading) {
    return <Loading />;
  }

  if (!presentationData) {
    return null;
  }

  return (
    <PresentationProvider>
      <PresentationInitializer presentationData={presentationData} />
      <PresentationContent />
    </PresentationProvider>
  );
}
