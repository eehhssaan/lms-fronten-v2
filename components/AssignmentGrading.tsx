"use client";

import { useState, useEffect } from "react";
import { Box, Heading, Text, Flex } from "rebass";
import { Label, Input } from "@rebass/forms";
import { Assignment, AssignmentSubmission } from "@/types";
import {
  getAllAssignmentSubmissions,
  gradeAssignmentSubmission,
  downloadAssignmentAttachment,
} from "@/lib/api";
import Button from "./Button";
import ErrorMessage from "./ErrorMessage";
import Loading from "./Loading";
import { formatDateTime } from "@/utils/helpers";

interface AssignmentAttachment {
  _id: string;
  name: string;
  file: string;
  mimeType: string;
  uploadedAt: Date;
}

interface AssignmentGradingProps {
  assignment: Assignment;
  onGraded?: (submission: AssignmentSubmission) => void;
}

export default function AssignmentGrading({
  assignment,
  onGraded,
}: AssignmentGradingProps) {
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] =
    useState<AssignmentSubmission | null>(null);
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  const [grading, setGrading] = useState(false);
  const [downloadingAttachment, setDownloadingAttachment] = useState<
    string | null
  >(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAllAssignmentSubmissions(assignment._id);
        setSubmissions(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to load submissions");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [assignment._id]);

  const handleSubmissionSelect = (submission: AssignmentSubmission) => {
    setSelectedSubmission(submission);
    setScore(submission.score || 0);
    setFeedback(submission.feedback || "");
  };

  const downloadAttachment = async (attachment: {
    name: string;
    file: string;
    mimeType: string;
    uploadedAt: Date;
  }) => {
    try {
      setDownloadingAttachment(attachment.name);
      const response = await fetch(attachment.file);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = attachment.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading attachment:", error);
      setError("Failed to download attachment");
    } finally {
      setDownloadingAttachment(null);
    }
  };

  const handleGrade = async () => {
    if (!selectedSubmission) return;

    try {
      setGrading(true);
      setError(null);

      if (score < 0 || score > assignment.totalPoints) {
        throw new Error(
          `Score must be between 0 and ${assignment.totalPoints}`
        );
      }

      const response = await gradeAssignmentSubmission(selectedSubmission._id, {
        score,
        feedback,
      });

      // Update submissions list
      setSubmissions((prev) =>
        prev.map((sub) =>
          sub._id === selectedSubmission._id ? response.data : sub
        )
      );

      if (onGraded) {
        onGraded(response.data);
      }

      // Reset selection
      setSelectedSubmission(null);
      setScore(0);
      setFeedback("");
    } catch (err: any) {
      setError(err.message || "Failed to grade submission");
    } finally {
      setGrading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <Box>
      <Heading as="h2" mb={4}>
        Grade Submissions
      </Heading>

      <Flex>
        {/* Submissions List */}
        <Box flex={1} mr={4}>
          <Heading as="h3" fontSize={2} mb={3}>
            Submissions ({submissions.length})
          </Heading>

          {submissions.length === 0 ? (
            <Text color="gray.6">No submissions yet.</Text>
          ) : (
            submissions.map((submission) => (
              <Box
                key={submission._id}
                onClick={() => handleSubmissionSelect(submission)}
                sx={{
                  cursor: "pointer",
                  bg:
                    selectedSubmission?._id === submission._id
                      ? "blue.0"
                      : "white",
                  p: 3,
                  mb: 2,
                  borderRadius: "4px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  "&:hover": {
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <Flex justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Text fontWeight="bold">
                      {typeof submission.student === "object"
                        ? submission.student.name
                        : "Unknown Student"}
                    </Text>
                    <Text fontSize={1} fontWeight="medium" color="gray.7">
                      Submitted:{" "}
                      {submission.submittedAt
                        ? formatDateTime(submission.submittedAt.toString())
                        : "Not submitted"}
                    </Text>
                    <Text
                      fontSize={1}
                      color={
                        submission.status === "late" ? "orange.6" : "gray.6"
                      }
                    >
                      {submission.status === "late" && "⚠️ "}Status:{" "}
                      {submission.status}
                    </Text>
                  </Box>
                  {submission.score !== undefined && (
                    <Text fontWeight="bold">
                      {submission.score}/{assignment.totalPoints}
                    </Text>
                  )}
                </Flex>
              </Box>
            ))
          )}
        </Box>

        {/* Grading Form */}
        {selectedSubmission && (
          <Box flex={1}>
            <Heading as="h3" fontSize={2} mb={3}>
              Grade Submission
            </Heading>

            <Box mb={4}>
              <Text fontWeight="bold">
                Student:{" "}
                {typeof selectedSubmission.student === "object"
                  ? selectedSubmission.student.name
                  : "Unknown Student"}
              </Text>
              <Flex alignItems="center" mb={3}>
                <Text fontSize={1} fontWeight="medium" color="gray.7">
                  Submitted:{" "}
                  {selectedSubmission?.submittedAt
                    ? formatDateTime(selectedSubmission.submittedAt.toString())
                    : "Not submitted"}
                </Text>
                {selectedSubmission.status === "late" && (
                  <Text ml={2} fontSize={1} color="orange.6">
                    ⚠️ Late submission
                  </Text>
                )}
              </Flex>

              {selectedSubmission.textResponse && (
                <Box mb={3}>
                  <Label>Response</Label>
                  <Box
                    sx={{
                      bg: "gray.0",
                      p: 3,
                      borderRadius: "4px",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {selectedSubmission.textResponse}
                  </Box>
                </Box>
              )}

              {selectedSubmission.attachments &&
                selectedSubmission.attachments.length > 0 && (
                  <Box mb={3}>
                    <Label>Attachments</Label>
                    {selectedSubmission.attachments.map((attachment, index) => (
                      <Button
                        key={index}
                        onClick={() => downloadAttachment(attachment)}
                        variant="secondary"
                        size="small"
                        sx={{ mr: 2, mb: 2 }}
                      >
                        {attachment.name}
                      </Button>
                    ))}
                  </Box>
                )}

              <Box mb={3}>
                <Label htmlFor="score">
                  Score (out of {assignment.totalPoints})
                </Label>
                <Input
                  type="number"
                  id="score"
                  value={score}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setScore(Number(e.target.value))
                  }
                  min={0}
                  max={assignment.totalPoints}
                />
              </Box>

              <Box mb={3}>
                <Label htmlFor="feedback">Feedback</Label>
                <textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  style={{
                    width: "100%",
                    minHeight: "100px",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                  }}
                />
              </Box>

              <Flex justifyContent="flex-end">
                <Button onClick={handleGrade} disabled={grading}>
                  {grading ? "Saving..." : "Save Grade"}
                </Button>
              </Flex>
            </Box>
          </Box>
        )}
      </Flex>
    </Box>
  );
}
