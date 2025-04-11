"use client";

import { useEffect, useState } from "react";
import { Box } from "rebass";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import AssignmentSubmission from "@/components/AssignmentSubmission";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import { getAssignment } from "@/lib/api";
import { Assignment } from "@/types";

export default function SubmitAssignmentPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const assignmentId = typeof params?.id === "string" ? params.id : "";
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAssignment(assignmentId);
        setAssignment(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to load assignment");
      } finally {
        setLoading(false);
      }
    };

    if (assignmentId) {
      fetchAssignment();
    }
  }, [assignmentId]);

  if (!courseId) {
    return <ErrorMessage message="Course ID is required" />;
  }

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!assignment) return <ErrorMessage message="Assignment not found" />;

  const handleSubmissionSuccess = () => {
    router.push(`/assignments?courseId=${courseId}`);
  };

  return (
    <Box p={4}>
      <AssignmentSubmission
        assignment={assignment}
        onSuccess={handleSubmissionSuccess}
      />
    </Box>
  );
}
