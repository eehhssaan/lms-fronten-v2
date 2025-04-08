"use client";

import { useEffect, useState } from "react";
import { Box, Heading } from "rebass";
import AssignmentList from "@/components/AssignmentList";
import AssignmentForm from "@/components/AssignmentForm";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import CourseNavigation from "@/components/CourseNavigation";

export default function AssignmentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const [showForm, setShowForm] = useState(false);

  if (!courseId) {
    return <ErrorMessage message="Course ID is required" />;
  }

  const handleCreateClick = () => {
    setShowForm(true);
  };

  const handleAssignmentClick = (assignment: any) => {
    if (user?.role === "teacher" || user?.role === "admin") {
      router.push(`/assignments/${assignment._id}/grade?courseId=${courseId}`);
    } else {
      router.push(`/assignments/${assignment._id}/submit?courseId=${courseId}`);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    // Refresh the assignments list
    router.refresh();
  };

  return (
    <Box p={4}>
      <Heading as="h1" mb={4}>
        Course Assignments
      </Heading>

      <CourseNavigation courseId={courseId} activeTab="assignments" />

      {showForm ? (
        <AssignmentForm
          courseId={courseId}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <AssignmentList
          courseId={courseId}
          onCreateClick={handleCreateClick}
          onAssignmentClick={handleAssignmentClick}
        />
      )}
    </Box>
  );
}
