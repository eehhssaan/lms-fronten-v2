import { useState, useRef } from "react";
import { Box, Heading, Text, Flex } from "rebass";
import { Label, Input } from "@rebass/forms";
import { submitAssignment } from "@/lib/api";

const SUPPORTED_FILE_TYPES = [
  ".pdf", // application/pdf
  ".doc", // application/msword
  ".docx", // application/vnd.openxmlformats-officedocument.wordprocessingml.document
  ".ppt", // application/vnd.ms-powerpoint
  ".pptx", // application/vnd.openxmlformats-officedocument.presentationml.presentation
  ".xls", // application/vnd.ms-excel
  ".xlsx", // application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
  ".txt", // text/plain
  ".jpg", // image/jpeg
  ".jpeg", // image/jpeg
  ".png", // image/png
  ".mp4", // video/mp4
  ".zip", // application/zip
];

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

interface FileUploadProps {
  courseId: string;
  assignmentId: string;
  dueDate?: string;
  allowLateSubmissions?: boolean;
}

export default function FileUpload({
  courseId,
  assignmentId,
  dueDate,
  allowLateSubmissions = false,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [textResponse, setTextResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateSubmission = () => {
    // Check if past due date
    if (dueDate) {
      const now = new Date();
      const due = new Date(dueDate);
      if (now > due && !allowLateSubmissions) {
        throw new Error(
          "Assignment is past due date and late submissions are not allowed"
        );
      }
    }

    if (files.length === 0 && !textResponse.trim()) {
      throw new Error("Please provide either files or a text response");
    }
  };

  const validateFiles = (selectedFiles: File[]) => {
    // Check number of files
    if (selectedFiles.length > MAX_FILES) {
      throw new Error(`Maximum ${MAX_FILES} files allowed`);
    }

    // Check file sizes and types
    for (const file of selectedFiles) {
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File ${file.name} is larger than 10MB`);
      }

      const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
      if (!SUPPORTED_FILE_TYPES.includes(fileExtension)) {
        throw new Error(`File type ${fileExtension} is not supported`);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      try {
        const selectedFiles = Array.from(e.target.files);
        validateFiles(selectedFiles);
        setFiles(selectedFiles);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextResponse(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setUploadProgress(0);

    try {
      validateSubmission();
      setLoading(true);

      const formData = new FormData();
      files.forEach((file) => {
        formData.append("attachments", file);
      });

      if (textResponse) {
        formData.append("textResponse", textResponse);
      }

      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();

      // Handle progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress(percentComplete);
        }
      };

      // Create a promise to handle the upload
      const response: { success: boolean; data: any } = await new Promise(
        (resolve, reject) => {
          xhr.open(
            "POST",
            `${process.env.NEXT_PUBLIC_API_URL}/api/assignments/${assignmentId}/submit`
          );

          // Add auth token if available
          const token = localStorage.getItem("auth_token");
          if (token) {
            xhr.setRequestHeader("Authorization", `Bearer ${token}`);
          }

          xhr.onload = () => {
            if (xhr.status === 201) {
              resolve(JSON.parse(xhr.response));
            } else {
              reject(new Error(handleSubmissionError(xhr.status)));
            }
          };

          xhr.onerror = () => {
            reject(new Error("Network error"));
          };

          xhr.send(formData);
        }
      );

      // Check submission status
      const submissionStatus = response.data.status;
      setSuccess(
        submissionStatus === "late"
          ? "Assignment submitted (late submission)"
          : "Assignment submitted successfully!"
      );

      // Reset form
      setFiles([]);
      setTextResponse("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      console.error("Submission failed:", err);
      setError(err.message || "Failed to submit assignment. Please try again.");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmissionError = (status: number): string => {
    switch (status) {
      case 400:
        return "Invalid submission. Please check your files and try again.";
      case 401:
        return "Please log in to submit your assignment.";
      case 403:
        return "You are not authorized to submit this assignment. Make sure you are enrolled in the course.";
      case 404:
        return "Assignment not found.";
      case 413:
        return "Files too large. Each file must be under 10MB.";
      case 422:
        return "Submission validation failed. Please check all requirements.";
      default:
        return "An error occurred while submitting. Please try again.";
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      {error && (
        <Box className="alert alert-error" mb={3}>
          {error}
        </Box>
      )}

      {success && (
        <Box className="alert alert-success" mb={3}>
          {success}
        </Box>
      )}

      <Box mb={3}>
        <Label htmlFor="fileUpload" mb={2}>
          Upload Files (Maximum {MAX_FILES} files, 10MB each)
        </Label>
        <Input
          id="fileUpload"
          name="file"
          type="file"
          multiple
          onChange={handleFileChange}
          ref={fileInputRef}
          accept={SUPPORTED_FILE_TYPES.join(",")}
          sx={{
            border: "1px dashed",
            borderColor: "border",
            borderRadius: "4px",
            py: 2,
            px: 2,
          }}
        />
        {files.length > 0 && (
          <Box mt={2}>
            <Text fontSize={1} color="primary" mb={2}>
              Selected files:
            </Text>
            <Box as="ul" pl={3}>
              {files.map((file, index) => (
                <Text as="li" key={index} fontSize={1}>
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
                </Text>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      <Box mb={3}>
        <Label htmlFor="textResponse" mb={2}>
          Text Response (optional)
        </Label>
        <Box
          as="textarea"
          id="textResponse"
          name="textResponse"
          value={textResponse}
          onChange={handleTextChange}
          rows={4}
          sx={{
            width: "100%",
            p: 2,
            border: "1px solid",
            borderColor: "border",
            borderRadius: "4px",
            fontFamily: "body",
            fontSize: 1,
          }}
        />
      </Box>

      {uploadProgress > 0 && uploadProgress < 100 && (
        <Box mb={3}>
          <Text fontSize={1} mb={2}>
            Uploading: {Math.round(uploadProgress)}%
          </Text>
          <Box
            sx={{
              width: "100%",
              height: "4px",
              bg: "lightgray",
              borderRadius: "2px",
            }}
          >
            <Box
              sx={{
                width: `${uploadProgress}%`,
                height: "100%",
                bg: "primary",
                borderRadius: "2px",
                transition: "width 0.3s ease",
              }}
            />
          </Box>
        </Box>
      )}

      <Box>
        <Box
          as="button"
          type="submit"
          className="btn btn-primary"
          width="100%"
          disabled={loading || (files.length === 0 && !textResponse.trim())}
        >
          {loading ? "Submitting..." : "Submit Assignment"}
        </Box>
      </Box>
    </Box>
  );
}
