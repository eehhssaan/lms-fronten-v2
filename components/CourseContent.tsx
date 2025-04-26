import { useState } from "react";
import { Box, Heading, Text, Flex } from "rebass";
import { downloadContent } from "@/lib/api";
import Button from "@/components/Button";
import ErrorMessage from "@/components/ErrorMessage";

interface CourseContentProps {
  materials: {
    title: string;
    description: string;
    fileUrl: string;
    uploadedAt: string;
    isInherited?: boolean;
    inheritedFrom?: string;
    originalMaterialId?: string;
  }[];
  courseId: string;
}

export default function CourseContent({
  materials,
  courseId,
}: CourseContentProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Group materials by whether they are inherited or not
  const courseMaterials = materials.filter((m) => !m.isInherited);
  const inheritedMaterials = materials.filter((m) => m.isInherited);

  return (
    <Box>
      {courseMaterials.length > 0 && (
        <Box mb={4}>
          <Heading as="h3" fontSize={2} mb={3}>
            Course Materials
          </Heading>
          {courseMaterials.map((material) => (
            <Box
              key={material.fileUrl}
              p={3}
              mb={2}
              sx={{
                border: "1px solid",
                borderColor: "gray.2",
                borderRadius: 2,
              }}
            >
              <Text fontWeight="bold">{material.title}</Text>
              {material.description && (
                <Text fontSize={1} color="gray" mt={1}>
                  {material.description}
                </Text>
              )}
              <Text fontSize={1} color="gray" mt={1}>
                Uploaded: {new Date(material.uploadedAt).toLocaleDateString()}
              </Text>
              <Box mt={2}>
                <Button
                  onClick={() => {
                    setDownloading(material.fileUrl);
                    downloadContent(
                      material.fileUrl,
                      material.title,
                      (progress) => {
                        setDownloadProgress(progress);
                      }
                    )
                      .then(() => setDownloading(null))
                      .catch((err) => {
                        setError(err.message);
                        setDownloading(null);
                      });
                  }}
                  disabled={!!downloading}
                  variant="secondary"
                  size="small"
                >
                  {downloading === material.fileUrl
                    ? "Downloading..."
                    : "Download"}
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {inheritedMaterials.length > 0 && (
        <Box>
          <Heading as="h3" fontSize={2} mb={3}>
            Inherited Materials
          </Heading>
          {inheritedMaterials.map((material) => (
            <Box
              key={material.fileUrl}
              p={3}
              mb={2}
              sx={{
                border: "1px solid",
                borderColor: "gray.2",
                borderRadius: 2,
                bg: "gray.0",
              }}
            >
              <Text fontWeight="bold">{material.title}</Text>
              {material.description && (
                <Text fontSize={1} color="gray" mt={1}>
                  {material.description}
                </Text>
              )}
              <Text fontSize={1} color="gray" mt={1}>
                Uploaded: {new Date(material.uploadedAt).toLocaleDateString()}
              </Text>
              <Text fontSize={1} color="gray" mt={1}>
                Inherited from: {material.inheritedFrom}
              </Text>
              <Box mt={2}>
                <Button
                  onClick={() => {
                    setDownloading(material.fileUrl);
                    downloadContent(
                      material.fileUrl,
                      material.title,
                      (progress) => {
                        setDownloadProgress(progress);
                      }
                    )
                      .then(() => setDownloading(null))
                      .catch((err) => {
                        setError(err.message);
                        setDownloading(null);
                      });
                  }}
                  disabled={!!downloading}
                  variant="secondary"
                  size="small"
                >
                  {downloading === material.fileUrl
                    ? "Downloading..."
                    : "Download"}
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {error && (
        <Box mt={3}>
          <ErrorMessage message={error} />
        </Box>
      )}
    </Box>
  );
}
