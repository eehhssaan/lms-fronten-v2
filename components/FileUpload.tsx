import { useState, useRef } from 'react';
import { Box, Heading, Text } from 'rebass';
import { Label, Input } from '@rebass/forms';
import { submitAssignment } from '@/lib/api';

interface FileUploadProps {
  courseId: string;
  assignmentId?: string;
}

export default function FileUpload({ courseId, assignmentId }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [textSubmission, setTextSubmission] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextSubmission(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!file && !textSubmission) {
      setError('Please upload a file or provide a text submission');
      return;
    }

    if (!assignmentId) {
      setError('No assignment selected for submission');
      return;
    }

    try {
      setLoading(true);
      await submitAssignment(assignmentId, file, textSubmission);
      setSuccess('Assignment submitted successfully!');
      
      // Reset form
      setFile(null);
      setTextSubmission('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Submission failed:', err);
      setError('Failed to submit assignment. Please try again.');
    } finally {
      setLoading(false);
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
        <Label htmlFor="fileUpload" mb={2}>Upload File</Label>
        <Input
          id="fileUpload"
          name="file"
          type="file"
          onChange={handleFileChange}
          ref={fileInputRef}
          sx={{
            border: '1px dashed',
            borderColor: 'border',
            borderRadius: '4px',
            py: 2,
            px: 2
          }}
        />
        {file && (
          <Text fontSize={1} mt={1} color="primary">
            Selected file: {file.name}
          </Text>
        )}
      </Box>

      <Box mb={3}>
        <Label htmlFor="textSubmission" mb={2}>Comments or Text Submission</Label>
        <Box
          as="textarea"
          id="textSubmission"
          name="textSubmission"
          value={textSubmission}
          onChange={handleTextChange}
          rows={4}
          sx={{
            width: '100%',
            p: 2,
            border: '1px solid',
            borderColor: 'border',
            borderRadius: '4px',
            fontFamily: 'body',
            fontSize: 1
          }}
        />
      </Box>

      <Box>
        <Box
          as="button"
          type="submit"
          className="btn btn-primary"
          width="100%"
          disabled={loading || (!assignmentId && true)}
        >
          {loading ? 'Submitting...' : 'Submit Assignment'}
        </Box>
      </Box>
    </Box>
  );
}
