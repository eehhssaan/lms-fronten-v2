"use client";

import { useEffect, useState } from "react";
import { Box, Heading, Text, Flex } from "rebass";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import Button from "@/components/Button";
import { getAssignment } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Assignment } from "@/types";
import { formatDateTime } from "@/utils/helpers";

export default function AssignmentDetailPage() {
  const { user } = useAuth();
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

  const handleSubmit = () => {
    router.push(`/assignments/${assignment._id}/submit?courseId=${courseId}`);
  };

  const handleGrade = () => {
    router.push(`/assignments/${assignment._id}/grade?courseId=${courseId}`);
  };

  const handleBack = () => {
    router.push(`/assignments?courseId=${courseId}`);
  };

  return (
    <Box p={4}>
      <Box mb={4}>
        <Button onClick={handleBack} variant="secondary">
          Back to Assignments
        </Button>
      </Box>

      <Box className="card" p={4}>
        <Heading as="h1" mb={4}>
          {assignment.title}
        </Heading>

        <Box mb={4}>
          <Text color="gray.6" mb={2}>
            Due Date: {new Date(assignment.dueDate).toLocaleString()}
          </Text>
          <Text color="gray.6" mb={2}>
            Total Points: {assignment.totalPoints}
          </Text>
          {assignment.allowLateSubmissions && (
            <Text color="orange.7" mb={2}>
              Late submissions allowed (Penalty: {assignment.latePenalty}%)
            </Text>
          )}
        </Box>

        <Box mb={4}>
          <Heading as="h2" fontSize={2} mb={2}>
            Description
          </Heading>
          <Text>{assignment.description}</Text>
        </Box>

        <Box mb={4}>
          <Heading as="h2" fontSize={2} mb={2}>
            Instructions
          </Heading>
          <Text>{assignment.instructions}</Text>
        </Box>

        {assignment.rubric && assignment.rubric.length > 0 && (
          <Box mb={4}>
            <Heading as="h2" fontSize={2} mb={2}>
              Rubric
            </Heading>
            {assignment.rubric.map((item, index) => (
              <Box key={index} mb={2}>
                <Text fontWeight="bold">{item.criterion}</Text>
                <Text>Points: {item.points}</Text>
                <Text color="gray.6">{item.description}</Text>
              </Box>
            ))}
          </Box>
        )}

        {assignment.attachments && assignment.attachments.length > 0 && (
          <Box mb={4}>
            <Heading as="h2" fontSize={2} mb={2}>
              Attachments
            </Heading>
            {assignment.attachments.map((attachment, index) => (
              <Text key={index}>{attachment.name}</Text>
            ))}
          </Box>
        )}

        <Flex justifyContent="flex-end" mt={4}>
          {user?.role === "student" && (
            <Button onClick={handleSubmit} variant="primary">
              Submit Assignment
            </Button>
          )}
          {(user?.role === "teacher" || user?.role === "admin") && (
            <Button onClick={handleGrade} variant="primary">
              Grade Submissions
            </Button>
          )}
        </Flex>
      </Box>
    </Box>
  );
}
