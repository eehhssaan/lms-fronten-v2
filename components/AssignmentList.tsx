"use client";

import { useState, useEffect } from "react";
import { Box, Heading, Text, Flex } from "rebass";
import { Assignment } from "@/types";
import { getAssignments, deleteAssignment } from "@/lib/api";
import Button from "./Button";
import Loading from "./Loading";
import ErrorMessage from "./ErrorMessage";
import { useAuth } from "@/context/AuthContext";

interface AssignmentListProps {
  courseId: string;
  onCreateClick?: () => void;
  onAssignmentClick?: (assignment: Assignment) => void;
  onEditClick?: (assignment: Assignment) => void;
}

export default function AssignmentList({
  courseId,
  onCreateClick,
  onAssignmentClick,
  onEditClick,
}: AssignmentListProps) {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingAssignmentId, setDeletingAssignmentId] = useState<
    string | null
  >(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAssignments(courseId);
        setAssignments(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to load assignments");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [courseId]);

  const handleDelete = async (
    assignmentId: string,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation(); // Prevent triggering the assignment click handler

    if (
      !window.confirm(
        "Are you sure you want to delete this assignment? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeletingAssignmentId(assignmentId);
      setDeleteError(null);
      await deleteAssignment(assignmentId);

      // Remove the deleted assignment from the state
      setAssignments((prev) => prev.filter((a) => a._id !== assignmentId));
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete assignment");
    } finally {
      setDeletingAssignmentId(null);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading as="h2">Assignments</Heading>
        {(user?.role === "teacher" || user?.role === "admin") && (
          <Button onClick={onCreateClick} variant="primary">
            Create Assignment
          </Button>
        )}
      </Flex>

      {deleteError && (
        <Box mb={3} p={3} bg="red.50" color="red.600" borderRadius="md">
          {deleteError}
        </Box>
      )}

      {assignments.length === 0 ? (
        <Text color="gray.6">No assignments found for this course.</Text>
      ) : (
        <Box>
          {assignments.map((assignment) => (
            <Box
              key={assignment._id}
              onClick={() => onAssignmentClick?.(assignment)}
              sx={{
                cursor: "pointer",
                bg: "white",
                p: 3,
                mb: 3,
                borderRadius: "4px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                "&:hover": {
                  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                },
                opacity: deletingAssignmentId === assignment._id ? 0.7 : 1,
                transition: "opacity 0.2s ease-in-out",
              }}
            >
              <Flex justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Heading as="h3" fontSize={2} mb={2}>
                    {assignment.title}
                  </Heading>
                  <Text fontSize={1} color="gray.6" mb={2}>
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </Text>
                  <Text fontSize={1} mb={2}>
                    Points: {assignment.totalPoints}
                  </Text>
                  {!assignment.isPublished && (
                    <Text fontSize={1} color="orange.6">
                      Draft
                    </Text>
                  )}
                </Box>
                <Flex alignItems="center">
                  <Text
                    sx={{
                      display: "inline-block",
                      px: 2,
                      py: 1,
                      bg: assignment.isPublished ? "green.0" : "gray.1",
                      color: assignment.isPublished ? "green.7" : "gray.7",
                      borderRadius: "4px",
                      fontSize: 0,
                      mr: 2,
                    }}
                  >
                    {assignment.isPublished ? "Published" : "Draft"}
                  </Text>
                  {(user?.role === "teacher" || user?.role === "admin") && (
                    <Flex>
                      <Button
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation();
                          onEditClick?.(assignment);
                        }}
                        variant="secondary"
                        size="small"
                        sx={{ mr: 2 }}
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                          handleDelete(assignment._id, e)
                        }
                        variant="danger"
                        size="small"
                        disabled={deletingAssignmentId === assignment._id}
                      >
                        {deletingAssignmentId === assignment._id
                          ? "Deleting..."
                          : "Delete"}
                      </Button>
                    </Flex>
                  )}
                </Flex>
              </Flex>

              <Text
                fontSize={1}
                mt={2}
                color="gray.7"
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {assignment.description}
              </Text>

              {assignment.allowLateSubmissions && (
                <Text fontSize={0} mt={2} color="orange.7">
                  Late submissions allowed (Penalty: {assignment.latePenalty}%)
                </Text>
              )}

              {assignment.attachments && assignment.attachments.length > 0 && (
                <Text fontSize={0} mt={2} color="blue.7">
                  {assignment.attachments.length} attachment
                  {assignment.attachments.length !== 1 ? "s" : ""}
                </Text>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
