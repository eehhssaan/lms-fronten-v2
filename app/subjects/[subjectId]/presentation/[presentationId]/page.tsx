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
        const response = await getPresentation(presentationId);
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
