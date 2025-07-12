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
        // const response = {
        //   presentationId: "687010b4cb7f899ffd01657f",
        //   slides: [
        //     {
        //       title: "Number Systems",
        //       type: "content",
        //       layout: "68700687a565f718c9ac001c",
        //       layoutType: "title-content",
        //       elements: [
        //         {
        //           type: "title",
        //           value: "Number Systems",
        //           x: 473,
        //           y: 106,
        //           width: 756,
        //           height: 106,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri Light",
        //             fontSize: "44pt",
        //             color: "#2B579A",
        //             backgroundColor: "#FFFFFF",
        //             bold: true,
        //             italic: false,
        //             underline: false,
        //             textAlign: "center",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd016583",
        //         },
        //         {
        //           type: "content",
        //           value: [
        //             {
        //               title: "Introduction to Number Systems",
        //               detail:
        //                 "A number system is a way to represent numbers. We are used to using the base-10 decimal system, but there are others like the binary, octal, and hexadecimal systems.",
        //             },
        //           ],
        //           x: 473,
        //           y: 318,
        //           width: 756,
        //           height: 159,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri",
        //             fontSize: "24pt",
        //             color: "#333333",
        //             backgroundColor: "#FFFFFF",
        //             bold: false,
        //             italic: false,
        //             underline: false,
        //             textAlign: "left",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd016584",
        //         },
        //         {
        //           type: "image",
        //           value:
        //             "https://consolidatedlabel.com/app/uploads/2007/10/low-res-72dpi.jpg",
        //           x: 473,
        //           y: 398,
        //           width: 567,
        //           height: 186,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri",
        //             fontSize: "24pt",
        //             color: "#333333",
        //             backgroundColor: "#FFFFFF",
        //             bold: false,
        //             italic: false,
        //             underline: false,
        //             textAlign: "left",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd016585",
        //         },
        //       ],
        //       order: 1,
        //       presentationId: "687010b4cb7f899ffd01657f",
        //       themeId: "6870080af7e9789396dc07cc",
        //       customStyles: {
        //         backgroundColor: "#FFFFFF",
        //       },
        //       _id: "68701158cb7f899ffd016582",
        //       createdAt: "2025-07-10T19:15:36.440Z",
        //       updatedAt: "2025-07-10T19:15:41.149Z",
        //       __v: 0,
        //       imageUrl:
        //         "https://consolidatedlabel.com/app/uploads/2007/10/low-res-72dpi.jpg",
        //     },
        //     {
        //       title: "1.1 The Real Number System",
        //       type: "content",
        //       layout: "68700689a565f718c9ac0027",
        //       layoutType: "image-right",
        //       elements: [
        //         {
        //           type: "title",
        //           value: "1.1 The Real Number System",
        //           x: 473,
        //           y: 53,
        //           width: 756,
        //           height: 80,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri Light",
        //             fontSize: "44pt",
        //             color: "#2B579A",
        //             backgroundColor: "#FFFFFF",
        //             bold: true,
        //             italic: false,
        //             underline: false,
        //             textAlign: "center",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd016587",
        //         },
        //         {
        //           type: "content",
        //           value: [
        //             {
        //               title: "Different Types of Numbers",
        //               detail:
        //                 "The real number system is composed of several types of numbers: integers, rational numbers, irrational numbers, and real numbers.",
        //             },
        //           ],
        //           x: 236,
        //           y: 265,
        //           width: 378,
        //           height: 371,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri",
        //             fontSize: "24pt",
        //             color: "#333333",
        //             backgroundColor: "#FFFFFF",
        //             bold: false,
        //             italic: false,
        //             underline: false,
        //             textAlign: "left",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd016588",
        //         },
        //         {
        //           type: "image",
        //           value:
        //             "https://consolidatedlabel.com/app/uploads/2007/10/low-res-72dpi.jpg",
        //           x: 709,
        //           y: 265,
        //           width: 378,
        //           height: 371,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri",
        //             fontSize: "24pt",
        //             color: "#333333",
        //             backgroundColor: "#FFFFFF",
        //             bold: false,
        //             italic: false,
        //             underline: false,
        //             textAlign: "left",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd016589",
        //         },
        //       ],
        //       order: 2,
        //       presentationId: "687010b4cb7f899ffd01657f",
        //       themeId: "6870080af7e9789396dc07cc",
        //       customStyles: {
        //         backgroundColor: "#FFFFFF",
        //       },
        //       _id: "68701158cb7f899ffd016586",
        //       createdAt: "2025-07-10T19:15:36.441Z",
        //       updatedAt: "2025-07-10T19:15:41.149Z",
        //       __v: 0,
        //       imageUrl:
        //         "https://consolidatedlabel.com/app/uploads/2007/10/low-res-72dpi.jpg",
        //     },
        //     {
        //       title: "1.1 The Real Number System",
        //       type: "content",
        //       layout: "68700689a565f718c9ac002b",
        //       layoutType: "full-image",
        //       elements: [
        //         {
        //           type: "title",
        //           value: "1.1 The Real Number System",
        //           x: 473,
        //           y: 265,
        //           width: 756,
        //           height: 106,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri Light",
        //             fontSize: "44pt",
        //             color: "#2B579A",
        //             backgroundColor: "#FFFFFF",
        //             bold: true,
        //             italic: false,
        //             underline: false,
        //             textAlign: "center",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd01658b",
        //         },
        //         {
        //           type: "content",
        //           value: [
        //             {
        //               title: "Integers",
        //               detail:
        //                 "Integers are whole numbers. They include all the natural numbers, their negatives, and zero.",
        //             },
        //           ],
        //           x: 473,
        //           y: 212,
        //           width: 756,
        //           height: 212,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri",
        //             fontSize: "24pt",
        //             color: "#333333",
        //             backgroundColor: "#FFFFFF",
        //             bold: false,
        //             italic: false,
        //             underline: false,
        //             textAlign: "left",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd01658c",
        //         },
        //         {
        //           type: "image",
        //           value:
        //             "https://consolidatedlabel.com/app/uploads/2007/10/low-res-72dpi.jpg",
        //           x: 473,
        //           y: 265,
        //           width: 945,
        //           height: 530,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri",
        //             fontSize: "24pt",
        //             color: "#333333",
        //             backgroundColor: "#FFFFFF",
        //             bold: false,
        //             italic: false,
        //             underline: false,
        //             textAlign: "left",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd01658d",
        //         },
        //       ],
        //       order: 3,
        //       presentationId: "687010b4cb7f899ffd01657f",
        //       themeId: "6870080af7e9789396dc07cc",
        //       customStyles: {
        //         backgroundColor: "#FFFFFF",
        //       },
        //       _id: "68701158cb7f899ffd01658a",
        //       createdAt: "2025-07-10T19:15:36.441Z",
        //       updatedAt: "2025-07-10T19:15:41.149Z",
        //       __v: 0,
        //       imageUrl:
        //         "https://consolidatedlabel.com/app/uploads/2007/10/low-res-72dpi.jpg",
        //     },
        //     {
        //       title: "1.1 The Real Number System",
        //       type: "content",
        //       layout: "68700689a565f718c9ac002b",
        //       layoutType: "full-image",
        //       elements: [
        //         {
        //           type: "title",
        //           value: "1.1 The Real Number System",
        //           x: 473,
        //           y: 265,
        //           width: 756,
        //           height: 106,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri Light",
        //             fontSize: "44pt",
        //             color: "#2B579A",
        //             backgroundColor: "#FFFFFF",
        //             bold: true,
        //             italic: false,
        //             underline: false,
        //             textAlign: "center",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd01658f",
        //         },
        //         {
        //           type: "content",
        //           value: [
        //             {
        //               title: "Rational Numbers",
        //               detail:
        //                 "Rational numbers are any numbers that can be expressed as the quotient or fraction of two integers.",
        //             },
        //           ],
        //           x: 473,
        //           y: 212,
        //           width: 756,
        //           height: 212,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri",
        //             fontSize: "24pt",
        //             color: "#333333",
        //             backgroundColor: "#FFFFFF",
        //             bold: false,
        //             italic: false,
        //             underline: false,
        //             textAlign: "left",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd016590",
        //         },
        //         {
        //           type: "image",
        //           value:
        //             "https://consolidatedlabel.com/app/uploads/2007/10/low-res-72dpi.jpg",
        //           x: 473,
        //           y: 265,
        //           width: 945,
        //           height: 530,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri",
        //             fontSize: "24pt",
        //             color: "#333333",
        //             backgroundColor: "#FFFFFF",
        //             bold: false,
        //             italic: false,
        //             underline: false,
        //             textAlign: "left",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd016591",
        //         },
        //       ],
        //       order: 4,
        //       presentationId: "687010b4cb7f899ffd01657f",
        //       themeId: "6870080af7e9789396dc07cc",
        //       customStyles: {
        //         backgroundColor: "#FFFFFF",
        //       },
        //       _id: "68701158cb7f899ffd01658e",
        //       createdAt: "2025-07-10T19:15:36.442Z",
        //       updatedAt: "2025-07-10T19:15:41.149Z",
        //       __v: 0,
        //       imageUrl:
        //         "https://consolidatedlabel.com/app/uploads/2007/10/low-res-72dpi.jpg",
        //     },
        //     {
        //       title: "1.1 The Real Number System",
        //       type: "content",
        //       layout: "68700687a565f718c9ac0016",
        //       layoutType: "title-content-image",
        //       elements: [
        //         {
        //           type: "title",
        //           value: "1.1 The Real Number System",
        //           x: 473,
        //           y: 53,
        //           width: 756,
        //           height: 80,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri Light",
        //             fontSize: "44pt",
        //             color: "#2B579A",
        //             backgroundColor: "#FFFFFF",
        //             bold: true,
        //             italic: false,
        //             underline: false,
        //             textAlign: "center",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd016593",
        //         },
        //         {
        //           type: "content",
        //           value: [
        //             {
        //               title: "Irrational Numbers",
        //               detail:
        //                 "Irrational numbers cannot be written as a simple fraction. They are real numbers that have decimal expansions that neither terminate nor become periodic.",
        //             },
        //           ],
        //           x: 473,
        //           y: 186,
        //           width: 756,
        //           height: 133,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri",
        //             fontSize: "24pt",
        //             color: "#333333",
        //             backgroundColor: "#FFFFFF",
        //             bold: false,
        //             italic: false,
        //             underline: false,
        //             textAlign: "left",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd016594",
        //         },
        //         {
        //           type: "image",
        //           value:
        //             "https://consolidatedlabel.com/app/uploads/2007/10/low-res-72dpi.jpg",
        //           x: 473,
        //           y: 398,
        //           width: 567,
        //           height: 186,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri",
        //             fontSize: "24pt",
        //             color: "#333333",
        //             backgroundColor: "#FFFFFF",
        //             bold: false,
        //             italic: false,
        //             underline: false,
        //             textAlign: "left",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd016595",
        //         },
        //       ],
        //       order: 5,
        //       presentationId: "687010b4cb7f899ffd01657f",
        //       themeId: "6870080af7e9789396dc07cc",
        //       customStyles: {
        //         backgroundColor: "#FFFFFF",
        //       },
        //       _id: "68701158cb7f899ffd016592",
        //       createdAt: "2025-07-10T19:15:36.443Z",
        //       updatedAt: "2025-07-10T19:15:41.149Z",
        //       __v: 0,
        //       imageUrl:
        //         "https://consolidatedlabel.com/app/uploads/2007/10/low-res-72dpi.jpg",
        //     },
        //     {
        //       title: "1.1 The Real Number System",
        //       type: "content",
        //       layout: "68700689a565f718c9ac0027",
        //       layoutType: "image-right",
        //       elements: [
        //         {
        //           type: "title",
        //           value: "1.1 The Real Number System",
        //           x: 473,
        //           y: 53,
        //           width: 756,
        //           height: 80,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri Light",
        //             fontSize: "44pt",
        //             color: "#2B579A",
        //             backgroundColor: "#FFFFFF",
        //             bold: true,
        //             italic: false,
        //             underline: false,
        //             textAlign: "center",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd016597",
        //         },
        //         {
        //           type: "content",
        //           value: [
        //             {
        //               title: "Real Numbers",
        //               detail:
        //                 "Real numbers consist of all the rational and irrational numbers. This means any number that can be placed on the number line is a real number.",
        //             },
        //           ],
        //           x: 236,
        //           y: 265,
        //           width: 378,
        //           height: 371,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri",
        //             fontSize: "24pt",
        //             color: "#333333",
        //             backgroundColor: "#FFFFFF",
        //             bold: false,
        //             italic: false,
        //             underline: false,
        //             textAlign: "left",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd016598",
        //         },
        //         {
        //           type: "image",
        //           value:
        //             "https://consolidatedlabel.com/app/uploads/2007/10/low-res-72dpi.jpg",
        //           x: 709,
        //           y: 265,
        //           width: 378,
        //           height: 371,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri",
        //             fontSize: "24pt",
        //             color: "#333333",
        //             backgroundColor: "#FFFFFF",
        //             bold: false,
        //             italic: false,
        //             underline: false,
        //             textAlign: "left",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd016599",
        //         },
        //       ],
        //       order: 6,
        //       presentationId: "687010b4cb7f899ffd01657f",
        //       themeId: "6870080af7e9789396dc07cc",
        //       customStyles: {
        //         backgroundColor: "#FFFFFF",
        //       },
        //       _id: "68701158cb7f899ffd016596",
        //       createdAt: "2025-07-10T19:15:36.443Z",
        //       updatedAt: "2025-07-10T19:15:41.149Z",
        //       __v: 0,
        //       imageUrl:
        //         "https://consolidatedlabel.com/app/uploads/2007/10/low-res-72dpi.jpg",
        //     },
        //     {
        //       title: "1.2 Complex Numbers",
        //       type: "content",
        //       layout: "68700687a565f718c9ac0016",
        //       layoutType: "title-content-image",
        //       elements: [
        //         {
        //           type: "title",
        //           value: "1.2 Complex Numbers",
        //           x: 473,
        //           y: 53,
        //           width: 756,
        //           height: 80,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri Light",
        //             fontSize: "44pt",
        //             color: "#2B579A",
        //             backgroundColor: "#FFFFFF",
        //             bold: true,
        //             italic: false,
        //             underline: false,
        //             textAlign: "center",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd01659b",
        //         },
        //         {
        //           type: "content",
        //           value: [
        //             {
        //               title: "Introduction to Complex Numbers",
        //               detail:
        //                 "Complex numbers are an extension of the real numbers, which can be expressed in the form a + bi, where 'a' and 'b' are real numbers, and 'i' is the imaginary unit, with the property i^2 = -1.",
        //             },
        //           ],
        //           x: 473,
        //           y: 186,
        //           width: 756,
        //           height: 133,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri",
        //             fontSize: "24pt",
        //             color: "#333333",
        //             backgroundColor: "#FFFFFF",
        //             bold: false,
        //             italic: false,
        //             underline: false,
        //             textAlign: "left",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd01659c",
        //         },
        //         {
        //           type: "image",
        //           value:
        //             "https://consolidatedlabel.com/app/uploads/2007/10/low-res-72dpi.jpg",
        //           x: 473,
        //           y: 398,
        //           width: 567,
        //           height: 186,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri",
        //             fontSize: "24pt",
        //             color: "#333333",
        //             backgroundColor: "#FFFFFF",
        //             bold: false,
        //             italic: false,
        //             underline: false,
        //             textAlign: "left",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd01659d",
        //         },
        //       ],
        //       order: 7,
        //       presentationId: "687010b4cb7f899ffd01657f",
        //       themeId: "6870080af7e9789396dc07cc",
        //       customStyles: {
        //         backgroundColor: "#FFFFFF",
        //       },
        //       _id: "68701158cb7f899ffd01659a",
        //       createdAt: "2025-07-10T19:15:36.444Z",
        //       updatedAt: "2025-07-10T19:15:41.149Z",
        //       __v: 0,
        //       imageUrl:
        //         "https://consolidatedlabel.com/app/uploads/2007/10/low-res-72dpi.jpg",
        //     },
        //     {
        //       title: "1.2 Complex Numbers",
        //       type: "content",
        //       layout: "68700688a565f718c9ac0023",
        //       layoutType: "image-left",
        //       elements: [
        //         {
        //           type: "title",
        //           value: "1.2 Complex Numbers",
        //           x: 473,
        //           y: 53,
        //           width: 756,
        //           height: 80,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri Light",
        //             fontSize: "44pt",
        //             color: "#2B579A",
        //             backgroundColor: "#FFFFFF",
        //             bold: true,
        //             italic: false,
        //             underline: false,
        //             textAlign: "center",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd01659f",
        //         },
        //         {
        //           type: "content",
        //           value: [
        //             {
        //               title: "Imaginary Numbers",
        //               detail:
        //                 "Imaginary numbers are numbers that can be written as a real number multiplied by the imaginary unit i, which is defined by its property i^2 = -1.",
        //             },
        //             {
        //               title: "Complex Numbers",
        //               detail:
        //                 "Complex numbers are numbers that consist of a real part and an imaginary part. They are the sum of a real number and an imaginary number.",
        //             },
        //           ],
        //           x: 709,
        //           y: 265,
        //           width: 378,
        //           height: 371,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri",
        //             fontSize: "24pt",
        //             color: "#333333",
        //             backgroundColor: "#FFFFFF",
        //             bold: false,
        //             italic: false,
        //             underline: false,
        //             textAlign: "left",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd0165a0",
        //         },
        //         {
        //           type: "image",
        //           value:
        //             "https://consolidatedlabel.com/app/uploads/2007/10/low-res-72dpi.jpg",
        //           x: 236,
        //           y: 265,
        //           width: 378,
        //           height: 371,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri",
        //             fontSize: "24pt",
        //             color: "#333333",
        //             backgroundColor: "#FFFFFF",
        //             bold: false,
        //             italic: false,
        //             underline: false,
        //             textAlign: "left",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd0165a1",
        //         },
        //       ],
        //       order: 8,
        //       presentationId: "687010b4cb7f899ffd01657f",
        //       themeId: "6870080af7e9789396dc07cc",
        //       customStyles: {
        //         backgroundColor: "#FFFFFF",
        //       },
        //       _id: "68701158cb7f899ffd01659e",
        //       createdAt: "2025-07-10T19:15:36.445Z",
        //       updatedAt: "2025-07-10T19:15:41.149Z",
        //       __v: 0,
        //       imageUrl:
        //         "https://consolidatedlabel.com/app/uploads/2007/10/low-res-72dpi.jpg",
        //     },
        //     {
        //       title: "1.3 Operations of Complex Numbers",
        //       type: "content",
        //       layout: "68700687a565f718c9ac0016",
        //       layoutType: "title-content-image",
        //       elements: [
        //         {
        //           type: "title",
        //           value: "1.3 Operations of Complex Numbers",
        //           x: 473,
        //           y: 53,
        //           width: 756,
        //           height: 80,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri Light",
        //             fontSize: "44pt",
        //             color: "#2B579A",
        //             backgroundColor: "#FFFFFF",
        //             bold: true,
        //             italic: false,
        //             underline: false,
        //             textAlign: "center",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd0165a3",
        //         },
        //         {
        //           type: "content",
        //           value: [
        //             {
        //               title: "Operations with Complex Numbers",
        //               detail:
        //                 "Complex numbers can be added, subtracted, multiplied, and divided, just like real numbers. They can also be conjugated and their absolute value can be calculated.",
        //             },
        //           ],
        //           x: 473,
        //           y: 186,
        //           width: 756,
        //           height: 133,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri",
        //             fontSize: "24pt",
        //             color: "#333333",
        //             backgroundColor: "#FFFFFF",
        //             bold: false,
        //             italic: false,
        //             underline: false,
        //             textAlign: "left",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd0165a4",
        //         },
        //         {
        //           type: "image",
        //           value:
        //             "https://consolidatedlabel.com/app/uploads/2007/10/low-res-72dpi.jpg",
        //           x: 473,
        //           y: 398,
        //           width: 567,
        //           height: 186,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri",
        //             fontSize: "24pt",
        //             color: "#333333",
        //             backgroundColor: "#FFFFFF",
        //             bold: false,
        //             italic: false,
        //             underline: false,
        //             textAlign: "left",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd0165a5",
        //         },
        //       ],
        //       order: 9,
        //       presentationId: "687010b4cb7f899ffd01657f",
        //       themeId: "6870080af7e9789396dc07cc",
        //       customStyles: {
        //         backgroundColor: "#FFFFFF",
        //       },
        //       _id: "68701158cb7f899ffd0165a2",
        //       createdAt: "2025-07-10T19:15:36.445Z",
        //       updatedAt: "2025-07-10T19:15:41.149Z",
        //       __v: 0,
        //       imageUrl:
        //         "https://consolidatedlabel.com/app/uploads/2007/10/low-res-72dpi.jpg",
        //     },
        //     {
        //       title: "Number Systems",
        //       type: "content",
        //       layout: "68700687a565f718c9ac0016",
        //       layoutType: "title-content-image",
        //       elements: [
        //         {
        //           type: "title",
        //           value: "Number Systems",
        //           x: 473,
        //           y: 53,
        //           width: 756,
        //           height: 80,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri Light",
        //             fontSize: "44pt",
        //             color: "#2B579A",
        //             backgroundColor: "#FFFFFF",
        //             bold: true,
        //             italic: false,
        //             underline: false,
        //             textAlign: "center",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd0165a7",
        //         },
        //         {
        //           type: "content",
        //           value: [
        //             {
        //               title: "Chapter 1 - Introduction to Number Systems",
        //               detail:
        //                 "In this chapter, we will explore various number systems that form the foundation of mathematics. These include the Real numbers, Complex numbers and their operations.",
        //             },
        //           ],
        //           x: 473,
        //           y: 186,
        //           width: 756,
        //           height: 133,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri",
        //             fontSize: "24pt",
        //             color: "#333333",
        //             backgroundColor: "#FFFFFF",
        //             bold: false,
        //             italic: false,
        //             underline: false,
        //             textAlign: "left",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd0165a8",
        //         },
        //         {
        //           type: "image",
        //           value:
        //             "https://consolidatedlabel.com/app/uploads/2007/10/low-res-72dpi.jpg",
        //           x: 473,
        //           y: 398,
        //           width: 567,
        //           height: 186,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri",
        //             fontSize: "24pt",
        //             color: "#333333",
        //             backgroundColor: "#FFFFFF",
        //             bold: false,
        //             italic: false,
        //             underline: false,
        //             textAlign: "left",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd0165a9",
        //         },
        //       ],
        //       order: 10,
        //       presentationId: "687010b4cb7f899ffd01657f",
        //       themeId: "6870080af7e9789396dc07cc",
        //       customStyles: {
        //         backgroundColor: "#FFFFFF",
        //       },
        //       _id: "68701158cb7f899ffd0165a6",
        //       createdAt: "2025-07-10T19:15:36.446Z",
        //       updatedAt: "2025-07-10T19:15:41.149Z",
        //       __v: 0,
        //       imageUrl:
        //         "https://consolidatedlabel.com/app/uploads/2007/10/low-res-72dpi.jpg",
        //     },
        //     {
        //       title: "1.1 The Real Number System",
        //       type: "content",
        //       layout: "68700689a565f718c9ac002b",
        //       layoutType: "full-image",
        //       elements: [
        //         {
        //           type: "title",
        //           value: "1.1 The Real Number System",
        //           x: 473,
        //           y: 265,
        //           width: 756,
        //           height: 106,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri Light",
        //             fontSize: "44pt",
        //             color: "#2B579A",
        //             backgroundColor: "#FFFFFF",
        //             bold: true,
        //             italic: false,
        //             underline: false,
        //             textAlign: "center",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd0165ab",
        //         },
        //         {
        //           type: "content",
        //           value: [
        //             {
        //               title: "Understanding different types of numbers",
        //               detail:
        //                 "Real numbers can be divided into several types: Integers, Rational numbers, Irrational numbers, and Real numbers. Each of these categories has distinct properties and uses.",
        //             },
        //             {
        //               title:
        //                 "A. Integers: Basic counting numbers and their negatives",
        //               detail:
        //                 "Integers are whole numbers that can be positive, negative, or zero. Example: -3, 0, 2 etc.",
        //             },
        //             {
        //               title:
        //                 "B. Rational Numbers: Numbers that can be expressed as fractions",
        //               detail:
        //                 "Rational numbers are numbers that can be expressed as a fraction or a ratio of two integers. Example: 1/2, 3/4, 7 etc.",
        //             },
        //             {
        //               title:
        //                 "C. Irrational Numbers: Numbers that cannot be expressed as fractions",
        //               detail:
        //                 "Irrational numbers are numbers that cannot be expressed as a ratio of two integers. Example: √2, π etc.",
        //             },
        //             {
        //               title: "D. Real Numbers: The complete number line",
        //               detail:
        //                 "Real numbers include all rational and irrational numbers. They cover the complete number line.",
        //             },
        //           ],
        //           x: 473,
        //           y: 212,
        //           width: 756,
        //           height: 212,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri",
        //             fontSize: "24pt",
        //             color: "#333333",
        //             backgroundColor: "#FFFFFF",
        //             bold: false,
        //             italic: false,
        //             underline: false,
        //             textAlign: "left",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd0165ac",
        //         },
        //         {
        //           type: "image",
        //           value:
        //             "https://consolidatedlabel.com/app/uploads/2007/10/low-res-72dpi.jpg",
        //           x: 473,
        //           y: 265,
        //           width: 945,
        //           height: 530,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri",
        //             fontSize: "24pt",
        //             color: "#333333",
        //             backgroundColor: "#FFFFFF",
        //             bold: false,
        //             italic: false,
        //             underline: false,
        //             textAlign: "left",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd0165ad",
        //         },
        //       ],
        //       order: 11,
        //       presentationId: "687010b4cb7f899ffd01657f",
        //       themeId: "6870080af7e9789396dc07cc",
        //       customStyles: {
        //         backgroundColor: "#FFFFFF",
        //       },
        //       _id: "68701158cb7f899ffd0165aa",
        //       createdAt: "2025-07-10T19:15:36.447Z",
        //       updatedAt: "2025-07-10T19:15:41.149Z",
        //       __v: 0,
        //       imageUrl:
        //         "https://consolidatedlabel.com/app/uploads/2007/10/low-res-72dpi.jpg",
        //     },
        //     {
        //       title: "1.2 Complex Numbers",
        //       type: "content",
        //       layout: "68700689a565f718c9ac0027",
        //       layoutType: "image-right",
        //       elements: [
        //         {
        //           type: "title",
        //           value: "1.2 Complex Numbers",
        //           x: 473,
        //           y: 53,
        //           width: 756,
        //           height: 80,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri Light",
        //             fontSize: "44pt",
        //             color: "#2B579A",
        //             backgroundColor: "#FFFFFF",
        //             bold: true,
        //             italic: false,
        //             underline: false,
        //             textAlign: "center",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd0165af",
        //         },
        //         {
        //           type: "content",
        //           value: [
        //             {
        //               title: "Introduction to imaginary and complex numbers",
        //               detail:
        //                 "Imaginary and complex numbers extend the real number system. They are used when real numbers are insufficient to solve certain mathematical problems.",
        //             },
        //             {
        //               title:
        //                 "A. Imaginary Numbers: Understanding i and its powers",
        //               detail:
        //                 "Imaginary numbers are numbers that when squared, result in a negative number. 'i' is the basic imaginary unit where i² = -1.",
        //             },
        //             {
        //               title: "B. Complex Numbers: Numbers in the form a + bi",
        //               detail:
        //                 "Complex numbers are numbers that consist of a real part and an imaginary part. They are expressed in the form a + bi.",
        //             },
        //           ],
        //           x: 236,
        //           y: 265,
        //           width: 378,
        //           height: 371,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri",
        //             fontSize: "24pt",
        //             color: "#333333",
        //             backgroundColor: "#FFFFFF",
        //             bold: false,
        //             italic: false,
        //             underline: false,
        //             textAlign: "left",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd0165b0",
        //         },
        //         {
        //           type: "image",
        //           value:
        //             "https://consolidatedlabel.com/app/uploads/2007/10/low-res-72dpi.jpg",
        //           x: 709,
        //           y: 265,
        //           width: 378,
        //           height: 371,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri",
        //             fontSize: "24pt",
        //             color: "#333333",
        //             backgroundColor: "#FFFFFF",
        //             bold: false,
        //             italic: false,
        //             underline: false,
        //             textAlign: "left",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd0165b1",
        //         },
        //       ],
        //       order: 12,
        //       presentationId: "687010b4cb7f899ffd01657f",
        //       themeId: "6870080af7e9789396dc07cc",
        //       customStyles: {
        //         backgroundColor: "#FFFFFF",
        //       },
        //       _id: "68701158cb7f899ffd0165ae",
        //       createdAt: "2025-07-10T19:15:36.447Z",
        //       updatedAt: "2025-07-10T19:15:41.149Z",
        //       __v: 0,
        //       imageUrl:
        //         "https://consolidatedlabel.com/app/uploads/2007/10/low-res-72dpi.jpg",
        //     },
        //     {
        //       title: "1.3 Operations of Complex Numbers",
        //       type: "content",
        //       layout: "68700689a565f718c9ac0027",
        //       layoutType: "image-right",
        //       elements: [
        //         {
        //           type: "title",
        //           value: "1.3 Operations of Complex Numbers",
        //           x: 473,
        //           y: 53,
        //           width: 756,
        //           height: 80,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri Light",
        //             fontSize: "44pt",
        //             color: "#2B579A",
        //             backgroundColor: "#FFFFFF",
        //             bold: true,
        //             italic: false,
        //             underline: false,
        //             textAlign: "center",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd0165b3",
        //         },
        //         {
        //           type: "content",
        //           value: [
        //             {
        //               title: "Working with complex numbers",
        //               detail:
        //                 "Complex numbers can be added, subtracted, multiplied, and divided, just like real numbers.",
        //             },
        //             {
        //               title:
        //                 "A. Operations of Imaginary Numbers: Basic operations with i",
        //               detail:
        //                 "Basic operations with 'i' follow certain rules. For example, i² = -1, i³ = -i, and i⁴ = 1.",
        //             },
        //             {
        //               title:
        //                 "B. Operations of Complex Numbers: Arithmetic with complex numbers",
        //               detail:
        //                 "Arithmetic operations of complex numbers involve combining like terms and using the rules of imaginary numbers.",
        //             },
        //             {
        //               title:
        //                 "C. Equality of Complex Numbers: When are complex numbers equal",
        //               detail:
        //                 "Two complex numbers are equal if and only if both their real parts and their imaginary parts are equal.",
        //             },
        //           ],
        //           x: 236,
        //           y: 265,
        //           width: 378,
        //           height: 371,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri",
        //             fontSize: "24pt",
        //             color: "#333333",
        //             backgroundColor: "#FFFFFF",
        //             bold: false,
        //             italic: false,
        //             underline: false,
        //             textAlign: "left",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd0165b4",
        //         },
        //         {
        //           type: "image",
        //           value:
        //             "https://consolidatedlabel.com/app/uploads/2007/10/low-res-72dpi.jpg",
        //           x: 709,
        //           y: 265,
        //           width: 378,
        //           height: 371,
        //           position: "default",
        //           relatedElements: [],
        //           format: {
        //             fontFamily: "Calibri",
        //             fontSize: "24pt",
        //             color: "#333333",
        //             backgroundColor: "#FFFFFF",
        //             bold: false,
        //             italic: false,
        //             underline: false,
        //             textAlign: "left",
        //             lineHeight: "1.5",
        //           },
        //           _id: "68701158cb7f899ffd0165b5",
        //         },
        //       ],
        //       order: 13,
        //       presentationId: "687010b4cb7f899ffd01657f",
        //       themeId: "6870080af7e9789396dc07cc",
        //       customStyles: {
        //         backgroundColor: "#FFFFFF",
        //       },
        //       _id: "68701158cb7f899ffd0165b2",
        //       createdAt: "2025-07-10T19:15:36.448Z",
        //       updatedAt: "2025-07-10T19:15:41.149Z",
        //       __v: 0,
        //       imageUrl:
        //         "https://consolidatedlabel.com/app/uploads/2007/10/low-res-72dpi.jpg",
        //     },
        //   ],
        //   message: "Slides generated and saved successfully",
        // };
        const response = await getPresentation(presentationId);
        // const response = {
        //   presentation: {
        //     _id: "68516922aad46fe319b7d830",
        //     title: "Untitled Presentation",
        //     description: "",
        //     chapterId: "682caccb47bd63925da948fb",
        //     chapterTitle: "Geometry (Basic)",
        //     themeId: {
        //       colors: {
        //         background: "#FFFBEB",
        //         text: "#9A3412",
        //         accent1: "#EA580C",
        //         accent2: "#F97316",
        //         accent3: "#FDBA74",
        //       },
        //       fonts: {
        //         heading: "Trebuchet MS",
        //         body: "Avenir",
        //       },
        //       defaults: {
        //         title: {
        //           fontSize: "44pt",
        //           fontWeight: "bold",
        //           color: "#EA580C",
        //         },
        //         content: {
        //           fontSize: "24pt",
        //           fontWeight: "normal",
        //           color: "#9A3412",
        //         },
        //       },
        //       _id: "682e15ae338821734ce5ba3c",
        //       name: "Sunset Warm",
        //       description: "A warm theme with sunset-inspired colors",
        //       isDefault: false,
        //       isPublic: true,
        //       createdAt: "2025-05-21T18:04:30.660Z",
        //       updatedAt: "2025-05-21T18:04:30.660Z",
        //       __v: 0,
        //     },
        //     defaultLayout: "title-content",
        //     aspectRatio: "16:9",
        //     author: "67fe769866c9bc79ba9c902d",
        //     scope: "subject",
        //     isPublic: false,
        //     isActive: true,
        //     createdAt: "2025-06-17T13:09:54.271Z",
        //     updatedAt: "2025-06-20T10:56:27.322Z",
        //     __v: 0,
        //   },
        //   slides: [
        //     {
        //       customStyles: {
        //         backgroundColor: "#FFFBEB",
        //       },
        //       _id: "6851693daad46fe319b7d833",
        //       title: "Introduction to Basic Geometry",
        //       type: "content",
        //       layout: "683297c461558c2d09e02594",
        //       layoutType: "title-content",
        //       elements: [
        //         {
        //           format: {
        //             fontFamily: "Trebuchet MS",
        //             fontSize: "44pt",
        //             color: "#EA580C",
        //             backgroundColor: "#FFFBEB",
        //             bold: true,
        //             italic: false,
        //             underline: false,
        //             textAlign: "center",
        //             lineHeight: "1.5",
        //           },
        //           type: "title",
        //           value: "Testing",
        //           x: 473,
        //           y: 53,
        //           width: 756,
        //           height: 80,
        //           position: "default",
        //           relatedElements: [],
        //           _id: "6851693daad46fe319b7d834",
        //         },
        //         {
        //           format: {
        //             fontFamily: "Avenir",
        //             fontSize: "24pt",
        //             color: "#9A3412",
        //             backgroundColor: "#FFFBEB",
        //             bold: false,
        //             italic: false,
        //             underline: false,
        //             textAlign: "left",
        //             lineHeight: "1.5",
        //           },
        //           type: "content",
        //           value: [
        //             {
        //               title: "Basic Elements Basic ElementsBasic Elements",
        //               detail:
        //                 "The fundamental elements of geometry are points, lines, and planes.",
        //             },
        //             {
        //               title: "Definitions",
        //               detail:
        //                 "A point denotes a specific location, a line is an infinite set of points extending in both directions, and a plane is a flat surface extending indefinitely in all directions.",
        //             },
        //             {
        //               title: "Importance",
        //               detail:
        //                 "These elements are interrelated and form the basis of geometric concepts, often referred to as undefined terms since their definitions are accepted without proof.",
        //             },
        //           ],

        //           x: 473,
        //           y: 186,
        //           width: 756,
        //           height: 133,
        //           position: "default",
        //           relatedElements: [],
        //           _id: "6851693daad46fe319b7d835",
        //         },
        //         {
        //           format: {
        //             fontFamily: "Avenir",
        //             fontSize: "24pt",
        //             color: "#9A3412",
        //             backgroundColor: "#FFFBEB",
        //             bold: false,
        //             italic: false,
        //             underline: false,
        //             textAlign: "left",
        //             lineHeight: "1.5",
        //           },
        //           type: "image",
        //           value:
        //             "https://consolidatedlabel.com/app/uploads/2007/10/low-res-72dpi.jpg",
        //           x: 473,
        //           y: 398,
        //           width: 567,
        //           height: 186,
        //           position: "default",
        //           relatedElements: [],
        //           _id: "6851693daad46fe319b7d836",
        //         },
        //       ],
        //       order: 1,
        //       presentationId: "68516922aad46fe319b7d830",
        //       themeId: "682e15ae338821734ce5ba3c",
        //       createdAt: "2025-06-20T10:56:25.032Z",
        //       updatedAt: "2025-06-20T10:56:25.032Z",
        //       __v: 0,
        //     },
        //     {
        //       customStyles: {
        //         backgroundColor: "#FFFBEB",
        //       },
        //       _id: "6851693daad46fe319b7d837",
        //       title: "Basic Elements of Geometry",
        //       type: "content",
        //       layout: "683297c461558c2d09e02594",
        //       layoutType: "image-left",
        //       elements: [
        //         {
        //           format: {
        //             fontFamily: "Trebuchet MS",
        //             fontSize: "44pt",
        //             color: "#EA580C",
        //             backgroundColor: "#FFFBEB",
        //             bold: true,
        //             italic: false,
        //             underline: false,
        //             textAlign: "center",
        //             lineHeight: "1.5",
        //           },
        //           type: "title",
        //           value: "Basic Elements of Geometry",
        //           x: 473,
        //           y: 53,
        //           width: 756,
        //           height: 80,
        //           position: "default",
        //           relatedElements: [],
        //           _id: "6851693daad46fe319b7d838",
        //         },
        //         {
        //           format: {
        //             fontFamily: "Avenir",
        //             fontSize: "24pt",
        //             color: "#9A3412",
        //             backgroundColor: "#FFFBEB",
        //             bold: false,
        //             italic: false,
        //             underline: false,
        //             textAlign: "left",
        //             lineHeight: "1.5",
        //           },
        //           type: "content",
        //           value: [
        //             {
        //               title: "Basic Elements",
        //               detail:
        //                 "The fundamental elements of geometry are points, lines, and planes.",
        //             },
        //             {
        //               title: "Definitions",
        //               detail:
        //                 "A point denotes a specific location, a line is an infinite set of points extending in both directions, and a plane is a flat surface extending indefinitely in all directions.",
        //             },
        //             {
        //               title: "Importance",
        //               detail:
        //                 "These elements are interrelated and form the basis of geometric concepts, often referred to as undefined terms since their definitions are accepted without proof.",
        //             },
        //           ],
        //           x: 709,
        //           y: 265,
        //           width: 378,
        //           height: 371,
        //           position: "default",
        //           relatedElements: [],
        //           _id: "6851693daad46fe319b7d839",
        //         },
        //         {
        //           format: {
        //             fontFamily: "Avenir",
        //             fontSize: "24pt",
        //             color: "#9A3412",
        //             backgroundColor: "#FFFBEB",
        //             bold: false,
        //             italic: false,
        //             underline: false,
        //             textAlign: "left",
        //             lineHeight: "1.5",
        //           },
        //           type: "image",
        //           value:
        //             "https://consolidatedlabel.com/app/uploads/2007/10/low-res-72dpi.jpg",
        //           x: 236,
        //           y: 265,
        //           width: 378,
        //           height: 371,
        //           position: "default",
        //           relatedElements: [],
        //           _id: "6851693daad46fe319b7d83a",
        //         },
        //       ],
        //       order: 2,
        //       presentationId: "68516922aad46fe319b7d830",
        //       themeId: "682e15ae338821734ce5ba3c",
        //       createdAt: "2025-06-20T10:56:25.033Z",
        //       updatedAt: "2025-06-20T10:56:25.033Z",
        //       __v: 0,
        //     },

        //     {
        //       customStyles: {
        //         backgroundColor: "#FFFBEB",
        //       },
        //       _id: "6851693daad46fe319b7d83f",
        //       title: "Angles and their Types",
        //       type: "content",
        //       layout: "683297c461558c2d09e02594",
        //       layoutType: "image-left",
        //       elements: [
        //         {
        //           format: {
        //             fontFamily: "Trebuchet MS",
        //             fontSize: "44pt",
        //             color: "#EA580C",
        //             backgroundColor: "#FFFBEB",
        //             bold: true,
        //             italic: false,
        //             underline: false,
        //             textAlign: "center",
        //             lineHeight: "1.5",
        //           },
        //           type: "title",
        //           value: "Angles and their Types",
        //           x: 473,
        //           y: 53,
        //           width: 756,
        //           height: 80,
        //           position: "default",
        //           relatedElements: [],
        //           _id: "6851693daad46fe319b7d840",
        //         },
        //         {
        //           format: {
        //             fontFamily: "Avenir",
        //             fontSize: "24pt",
        //             color: "#9A3412",
        //             backgroundColor: "#FFFBEB",
        //             bold: false,
        //             italic: false,
        //             underline: false,
        //             textAlign: "left",
        //             lineHeight: "1.5",
        //           },
        //           type: "content",
        //           value: [
        //             {
        //               title: "Basic Elements",
        //               detail:
        //                 "The fundamental elements of geometry are points, lines, and planes.",
        //             },
        //             {
        //               title: "Definitions",
        //               detail:
        //                 "A point denotes a specific location, a line is an infinite set of points extending in both directions, and a plane is a flat surface extending indefinitely in all directions.",
        //             },
        //             {
        //               title: "Importance",
        //               detail:
        //                 "These elements are interrelated and form the basis of geometric concepts, often referred to as undefined terms since their definitions are accepted without proof.",
        //             },
        //           ],
        //           x: 709,
        //           y: 265,
        //           width: 378,
        //           height: 371,
        //           position: "default",
        //           relatedElements: [],
        //           _id: "6851693daad46fe319b7d841",
        //         },
        //         {
        //           format: {
        //             fontFamily: "Avenir",
        //             fontSize: "24pt",
        //             color: "#9A3412",
        //             backgroundColor: "#FFFBEB",
        //             bold: false,
        //             italic: false,
        //             underline: false,
        //             textAlign: "left",
        //             lineHeight: "1.5",
        //           },
        //           type: "image",
        //           value:
        //             "https://consolidatedlabel.com/app/uploads/2007/10/low-res-72dpi.jpg",
        //           x: 236,
        //           y: 265,
        //           width: 378,
        //           height: 371,
        //           position: "default",
        //           relatedElements: [],
        //           _id: "6851693daad46fe319b7d842",
        //         },
        //       ],
        //       order: 4,
        //       presentationId: "68516922aad46fe319b7d830",
        //       themeId: "682e15ae338821734ce5ba3c",
        //       createdAt: "2025-06-20T10:56:25.034Z",
        //       updatedAt: "2025-06-20T10:56:25.034Z",
        //       __v: 0,
        //     },
        //     {
        //       customStyles: {
        //         backgroundColor: "#FFFBEB",
        //       },
        //       _id: "6851693daad46fe319b7d843",
        //       title: "Applying Geometry in Real Life",
        //       type: "content",
        //       layout: "683297c461558c2d09e02594",
        //       layoutType: "image-right",
        //       elements: [
        //         {
        //           format: {
        //             fontFamily: "Trebuchet MS",
        //             fontSize: "44pt",
        //             color: "#EA580C",
        //             backgroundColor: "#FFFBEB",
        //             bold: true,
        //             italic: false,
        //             underline: false,
        //             textAlign: "center",
        //             lineHeight: "1.5",
        //           },
        //           type: "title",
        //           value: "Applying Geometry in Real Life",
        //           x: 473,
        //           y: 53,
        //           width: 756,
        //           height: 80,
        //           position: "default",
        //           relatedElements: [],
        //           _id: "6851693daad46fe319b7d844",
        //         },
        //         {
        //           format: {
        //             fontFamily: "Avenir",
        //             fontSize: "24pt",
        //             color: "#9A3412",
        //             backgroundColor: "#FFFBEB",
        //             bold: false,
        //             italic: false,
        //             underline: false,
        //             textAlign: "left",
        //             lineHeight: "1.5",
        //           },
        //           type: "content",
        //           value: [
        //             {
        //               title: "Basic Elements",
        //               detail:
        //                 "The fundamental elements of geometry are points, lines, and planes.",
        //             },
        //             {
        //               title: "Definitions",
        //               detail:
        //                 "A point denotes a specific location, a line is an infinite set of points extending in both directions, and a plane is a flat surface extending indefinitely in all directions.",
        //             },
        //             {
        //               title: "Importance",
        //               detail:
        //                 "These elements are interrelated and form the basis of geometric concepts, often referred to as undefined terms since their definitions are accepted without proof.",
        //             },
        //           ],
        //           y: 265,
        //           width: 378,
        //           height: 371,
        //           position: "default",
        //           relatedElements: [],
        //           _id: "6851693daad46fe319b7d845",
        //         },
        //         {
        //           format: {
        //             fontFamily: "Avenir",
        //             fontSize: "24pt",
        //             color: "#9A3412",
        //             backgroundColor: "#FFFBEB",
        //             bold: false,
        //             italic: false,
        //             underline: false,
        //             textAlign: "left",
        //             lineHeight: "1.5",
        //           },
        //           type: "image",
        //           value:
        //             "https://consolidatedlabel.com/app/uploads/2007/10/low-res-72dpi.jpg",
        //           x: 709,
        //           y: 265,
        //           width: 378,
        //           height: 371,
        //           position: "default",
        //           relatedElements: [],
        //           _id: "6851693daad46fe319b7d846",
        //         },
        //       ],
        //       order: 5,
        //       presentationId: "68516922aad46fe319b7d830",
        //       themeId: "682e15ae338821734ce5ba3c",
        //       createdAt: "2025-06-20T10:56:25.035Z",
        //       updatedAt: "2025-06-20T10:56:25.035Z",
        //       __v: 0,
        //     },
        //   ],
        // };
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
