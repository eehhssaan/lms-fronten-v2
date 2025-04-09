"use client";

import { useState } from "react";
import { Box, Heading } from "rebass";
import AssignmentList from "@/components/AssignmentList";
import AssignmentForm from "@/components/AssignmentForm";
import { Assignment } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";

export default function AssignmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(
    null
  );

  if (!courseId) {
    return <Box p={4}>Course ID is required</Box>;
  }

  const handleCreateClick = () => {
    setEditingAssignment(null);
    setShowForm(true);
  };

  const handleEditClick = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingAssignment(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAssignment(null);
  };

  const handleAssignmentClick = (assignment: Assignment) => {
    router.push(`/assignments/${assignment._id}?courseId=${courseId}`);
  };

  return (
    <Box p={4}>
      <Heading as="h1" mb={4}>
        Course Assignments
      </Heading>

      {showForm ? (
        <AssignmentForm
          courseId={courseId}
          assignment={editingAssignment || undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      ) : (
        <AssignmentList
          courseId={courseId}
          onCreateClick={handleCreateClick}
          onEditClick={handleEditClick}
          onAssignmentClick={handleAssignmentClick}
        />
      )}
    </Box>
  );
}
