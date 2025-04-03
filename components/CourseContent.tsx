import { useState } from 'react';
import { Box, Heading, Text, Flex } from 'rebass';
import { Content } from '@/types';
import { downloadContent } from '@/lib/api';

interface CourseContentProps {
  contents: Content[];
  courseId: string;
}

export default function CourseContent({ contents, courseId }: CourseContentProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Group contents by type to organize them
  const contentsByType = contents.reduce((acc, content) => {
    if (!acc[content.type]) {
      acc[content.type] = [];
    }
    acc[content.type].push(content);
    return acc;
  }, {} as Record<string, Content[]>);

  const handleDownload = async (contentId: string, fileName: string) => {
    try {
      setDownloading(contentId);
      setError(null);
      await downloadContent(contentId, fileName);
    } catch (err) {
      console.error('Download failed:', err);
      setError('Failed to download the file. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <Box>
      {error && (
        <Box className="alert alert-error" mb={3}>
          {error}
        </Box>
      )}
      
      {Object.entries(contentsByType).map(([type, typeContents]) => (
        <Box key={type} mb={4}>
          <Heading as="h3" fontSize={2} mb={3} sx={{ textTransform: 'capitalize' }}>
            {type}
          </Heading>
          
          {typeContents.map((content) => (
            <Box 
              key={content._id} 
              p={3} 
              mb={3}
              bg="white"
              sx={{
                borderRadius: '4px',
                boxShadow: 'small',
                border: '1px solid',
                borderColor: 'border',
              }}
            >
              <Flex justifyContent="space-between" alignItems="center" mb={2}>
                <Heading as="h4" fontSize={2}>
                  {content.title}
                </Heading>
                
                {content.fileUrl && (
                  <Box
                    as="button"
                    onClick={() => handleDownload(content._id, content.title)}
                    className="btn btn-secondary"
                    sx={{
                      py: 1,
                      px: 2,
                      fontSize: 1,
                    }}
                    disabled={downloading === content._id}
                  >
                    {downloading === content._id ? 'Downloading...' : 'Download'}
                  </Box>
                )}
              </Flex>
              
              <Text fontSize={1} mb={2}>
                {content.description}
              </Text>
              
              {content.text && (
                <Box
                  p={3}
                  bg="lightGray"
                  sx={{
                    borderRadius: '4px',
                    fontSize: 1,
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {content.text}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      ))}
      
      {Object.keys(contentsByType).length === 0 && (
        <Box
          p={4}
          bg="lightGray"
          borderRadius="default"
          textAlign="center"
        >
          <Text>No content available for this course yet.</Text>
        </Box>
      )}
    </Box>
  );
}
