"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import PresentationPreview from "@/components/PresentationPreview";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import Loading from "@/components/Loading";

export default function FinalPPTXPreview() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const subjectId = params.subjectId as string;
  const presentationId = searchParams.get("presentationId");

  const [presentationData, setPresentationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const handleSave = async () => {
    try {
      console.log("presentationData");
      setLoading(true);
      const response = await api.put(
        `/v1/presentations/${presentationId}`,
        presentationData
      );
      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to save presentation");
      }
      toast.success("Presentation saved successfully");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save presentation";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchPresentation = async () => {
      if (!presentationId) {
        router.push(`/subjects/${subjectId}/presentation`);
        return;
      }

      try {
        const response = await api.get(`/v1/presentations/${presentationId}`);
        if (!response.data.success) {
          throw new Error(
            response.data.error || "Failed to fetch presentation"
          );
        }
        setPresentationData(response.data.data);
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
    <PresentationPreview
      presentationId={presentationId as string}
      onBack={() => router.push(`/subjects/${subjectId}/presentation`)}
      onSave={handleSave}
    />
  );
}
