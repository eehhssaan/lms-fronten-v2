"use client";

import { useState, useRef, useEffect } from "react";
import { Box, Heading, Text, Flex } from "rebass";
import { Label, Input } from "@rebass/forms";
import { Assignment, AssignmentSubmission } from "@/types";
import {
  submitAssignmentWithFiles,
  getMyAssignmentSubmission,
  downloadAssignmentAttachment,
} from "@/lib/api";
import Button from "./Button";
import ErrorMessage from "./ErrorMessage";
import Loading from "./Loading";

interface AssignmentAttachment {
  _id: string;
  name: string;
  file: string;
  mimeType: string;
  uploadedAt: Date;
}

interface ExtendedAssignmentSubmission extends AssignmentSubmission {
  attachments: AssignmentAttachment[];
}

interface AssignmentSubmissionProps {
  assignment: Assignment;
  onSuccess?: (submission: AssignmentSubmission) => void;
}

export default function AssignmentSubmissionForm({
  assignment,
  onSuccess,
}: AssignmentSubmissionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [textResponse, setTextResponse] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [existingSubmission, setExistingSubmission] =
    useState<ExtendedAssignmentSubmission | null>(null);
  const [loadingSubmission, setLoadingSubmission] = useState(true);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  useEffect(() => {
    const fetchExistingSubmission = async () => {
      try {
        const response = await getMyAssignmentSubmission(assignment._id);
        setExistingSubmission(response.data as ExtendedAssignmentSubmission);
      } catch (err) {
        console.error("Failed to fetch existing submission:", err);
      } finally {
        setLoadingSubmission(false);
      }
    };

    fetchExistingSubmission();
  }, [assignment._id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleDownload = async (attachment: AssignmentAttachment) => {
    try {
      setDownloadingFile(attachment._id);
      await downloadAssignmentAttachment(
        existingSubmission?._id || "",
        attachment._id
      );
    } catch (err) {
      console.error("Failed to download file:", err);
      setError("Failed to download file. Please try again.");
    } finally {
      setDownloadingFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("Submit button clicked");
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      console.log("Preparing submission...");
      // Check if past due date and late submissions not allowed
      const now = new Date();
      const dueDate = new Date(assignment.dueDate);
      if (now > dueDate && !assignment.allowLateSubmissions) {
        throw new Error(
          "Assignment is past due date and late submissions are not allowed"
        );
      }

      // Validate submission
      if (files.length === 0 && !textResponse.trim()) {
        throw new Error("Please provide either files or a text response");
      }

      console.log("Creating FormData...");
      const formData = new FormData();

      // Add files
      files.forEach((file) => {
        console.log("Adding file:", file.name);
        formData.append("attachments", file);
      });

      // Add text response if provided
      if (textResponse.trim()) {
        console.log("Adding text response");
        formData.append("textResponse", textResponse.trim());
      }

      console.log("Submitting assignment...", {
        assignmentId: assignment._id,
        hasFiles: files.length > 0,
        hasText: Boolean(textResponse.trim()),
      });

      // Submit all files and text response in one request
      await submitAssignmentWithFiles(assignment._id, formData);

      console.log("Submission successful, fetching updated submission...");
      // Get the updated submission after successful submit
      const updatedSubmission = await getMyAssignmentSubmission(assignment._id);

      console.log("Got updated submission:", updatedSubmission);
      if (onSuccess && updatedSubmission) {
        onSuccess(updatedSubmission);
      }

      // Reset form
      setFiles([]);
      setTextResponse("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      console.error("Submission failed:", err);
      setError(err.message || "Failed to submit assignment");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const isLateSubmission = new Date() > new Date(assignment.dueDate);

  if (loadingSubmission) {
    return <Loading />;
  }

  if (existingSubmission) {
    return (
      <Box sx={{ maxWidth: "800px", mx: "auto" }}>
        <Heading as="h2" mb={4}>
          Assignment Submission
        </Heading>

        <Box
          mb={4}
          p={3}
          sx={{
            bg: "green.0",
            borderRadius: 4,
            border: "1px solid",
            borderColor: "green.2",
          }}
        >
          <Text color="green.8" fontWeight="bold">
            ✓ Submitted on{" "}
            {new Date(existingSubmission.submittedAt).toLocaleDateString(
              "en-US",
              {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }
            )}
          </Text>
          <Flex mt={2} alignItems="center">
            <Text color="gray.7" fontWeight="medium">
              Status:{" "}
              <Text
                as="span"
                color={
                  existingSubmission.status === "graded"
                    ? "green.6"
                    : existingSubmission.status === "late"
                    ? "orange.6"
                    : "blue.6"
                }
              >
                {existingSubmission.status.charAt(0).toUpperCase() +
                  existingSubmission.status.slice(1)}
              </Text>
            </Text>
            {existingSubmission.status === "late" && (
              <Text color="orange.6" ml={2}>
                ⚠️ Late submission
              </Text>
            )}
          </Flex>
        </Box>

        {existingSubmission.score !== undefined && (
          <Box
            mb={4}
            p={3}
            sx={{
              bg: "blue.0",
              borderRadius: 4,
              border: "1px solid",
              borderColor: "blue.2",
            }}
          >
            <Text fontWeight="bold">
              Score: {existingSubmission.score} / {assignment.totalPoints}
            </Text>
            {existingSubmission.feedback && (
              <Box mt={2}>
                <Text fontWeight="bold">Feedback:</Text>
                <Text mt={1}>{existingSubmission.feedback}</Text>
              </Box>
            )}
          </Box>
        )}

        <Box mb={4}>
          <Heading as="h3" fontSize={2} mb={2}>
            Your Response
          </Heading>
          {existingSubmission.textResponse ? (
            <Text sx={{ whiteSpace: "pre-wrap" }}>
              {existingSubmission.textResponse}
            </Text>
          ) : (
            <Text color="gray.6">No text response provided</Text>
          )}
        </Box>

        {existingSubmission.attachments &&
          existingSubmission.attachments.length > 0 && (
            <Box mb={4}>
              <Heading as="h3" fontSize={2} mb={2}>
                Attachments
              </Heading>
              {existingSubmission.attachments.map(
                (attachment: AssignmentAttachment) => (
                  <Flex
                    key={attachment._id}
                    p={2}
                    mb={2}
                    alignItems="center"
                    sx={{
                      bg: "gray.0",
                      borderRadius: 4,
                      border: "1px solid",
                      borderColor: "gray.2",
                    }}
                  >
                    <Text flex={1}>{attachment.name}</Text>
                    <button
                      onClick={() => handleDownload(attachment)}
                      disabled={downloadingFile === attachment._id}
                      style={{
                        backgroundColor: "#f8f9fa",
                        border: "1px solid #dee2e6",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      {downloadingFile === attachment._id
                        ? "Downloading..."
                        : "Download"}
                    </button>
                  </Flex>
                )
              )}
            </Box>
          )}

        {error && <ErrorMessage message={error} />}
      </Box>
    );
  }

  return (
    <Box
      as="form"
      onSubmit={(e: React.FormEvent) => {
        console.log("Form submitted");
        e.preventDefault();
        handleSubmit(e);
      }}
      sx={{ maxWidth: "800px", mx: "auto" }}
    >
      <Heading as="h2" mb={4}>
        Submit Assignment
      </Heading>

      {error && <ErrorMessage message={error} />}

      <Box mb={4}>
        <Heading as="h3" fontSize={2} mb={2}>
          {assignment.title}
        </Heading>
        <Text mb={3}>{assignment.description}</Text>
        <Text fontSize={1} mb={2}>
          Due: {new Date(assignment.dueDate).toLocaleString()}
        </Text>
        <Text fontSize={1} mb={3}>
          Points: {assignment.totalPoints}
        </Text>
        {isLateSubmission && assignment.allowLateSubmissions && (
          <Text color="orange.6" mb={3}>
            This is a late submission. A penalty of {assignment.latePenalty}%
            will be applied.
          </Text>
        )}
      </Box>

      <Box mb={4}>
        <Label htmlFor="textResponse">Response</Label>
        <textarea
          id="textResponse"
          value={textResponse}
          onChange={(e) => setTextResponse(e.target.value)}
          style={{
            width: "100%",
            minHeight: "200px",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ddd",
          }}
          placeholder="Enter your response here..."
        />
      </Box>

      <Box mb={4}>
        <Label htmlFor="attachments">Attachments</Label>
        <input
          type="file"
          id="attachments"
          onChange={handleFileChange}
          multiple
          ref={fileInputRef}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ddd",
          }}
        />
        <Text fontSize={0} mt={1} color="gray.6">
          Supported file types: PDF, Word, PowerPoint, Excel, Images, Videos,
          ZIP
        </Text>
      </Box>

      {uploadProgress > 0 && uploadProgress < 100 && (
        <Box mb={4}>
          <Text mb={2}>Uploading files: {Math.round(uploadProgress)}%</Text>
          <Box
            sx={{
              width: "100%",
              height: "4px",
              bg: "gray.2",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: `${uploadProgress}%`,
                height: "100%",
                bg: "blue",
                transition: "width 0.2s ease-in-out",
              }}
            />
          </Box>
        </Box>
      )}

      <Flex justifyContent="flex-end">
        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: "#007bff",
            color: "white",
            border: "1px solid #0056b3",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            fontSize: "16px",
            fontWeight: 500,
          }}
        >
          {loading ? "Submitting..." : "Submit Assignment"}
        </button>
      </Flex>
    </Box>
  );
}
