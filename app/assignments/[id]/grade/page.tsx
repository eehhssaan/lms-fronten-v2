"use client";

import { useEffect, useState } from "react";
import { Box } from "rebass";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import AssignmentGrading from "@/components/AssignmentGrading";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import { getAssignment } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Assignment } from "@/types";

export default function GradeAssignmentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAssignment(params.id as string);
        setAssignment(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to load assignment");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchAssignment();
    }
  }, [params.id]);

  // Check authorization
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return (
      <ErrorMessage message="You are not authorized to grade assignments" />
    );
  }

  if (!courseId) {
    return <ErrorMessage message="Course ID is required" />;
  }

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!assignment) return <ErrorMessage message="Assignment not found" />;

  const handleGradingSuccess = () => {
    router.push(`/assignments?courseId=${courseId}`);
  };

  return (
    <Box p={4}>
      <AssignmentGrading
        assignment={assignment}
        onGraded={handleGradingSuccess}
      />
    </Box>
  );
}
