import { useState } from "react";
import { Box, Heading, Text, Flex } from "rebass";
import Button from "@/components/Button";
import { Content } from "@/types";
import ErrorMessage from "@/components/ErrorMessage";
import Loading from "@/components/Loading";
import ConfirmDialog from "@/components/ConfirmDialog";
import { createCourseContent } from "@/lib/api";

interface CourseContentManagerProps {
  courseId: string;
  contents: Content[];
  onContentAdded: () => void;
}

export default function CourseContentManager({
  courseId,
  contents,
  onContentAdded,
}: CourseContentManagerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [moduleNumber, setModuleNumber] = useState(1);
  const [lessonNumber, setLessonNumber] = useState(1);
  const [order, setOrder] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("courseId", courseId);
      formData.append("type", "document");
      formData.append("moduleNumber", moduleNumber.toString());
      formData.append("lessonNumber", lessonNumber.toString());
      formData.append("order", order.toString());

      if (file) {
        formData.append("file", file);
      }

      await createCourseContent(courseId, formData);

      // Clear form
      setTitle("");
      setDescription("");
      setFile(null);
      setModuleNumber(1);
      setLessonNumber(1);
      setOrder(1);
      setShowAddDialog(false);
      onContentAdded();
    } catch (err: any) {
      setError(err.message || "Failed to add content");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={3}>
        <Heading as="h3" fontSize={2}>
          Course Materials
        </Heading>
        <Button
          onClick={() => setShowAddDialog(true)}
          variant="primary"
          size="small"
        >
          Add Material
        </Button>
      </Flex>

      <ConfirmDialog
        isOpen={showAddDialog}
        title="Add Course Material"
        message={
          <Box as="form" onSubmit={handleSubmit}>
            <Box mb={3}>
              <Text as="label" display="block" mb={2}>
                Title <span style={{ color: "red" }}>*</span>
              </Text>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
              />
            </Box>

            <Box mb={3}>
              <Text as="label" display="block" mb={2}>
                Description <span style={{ color: "red" }}>*</span>
              </Text>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
              />
            </Box>

            <Box mb={3}>
              <Text as="label" display="block" mb={2}>
                File <span style={{ color: "red" }}>*</span>
              </Text>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.mp4,.zip"
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
              />
              <Text fontSize={1} color="gray" mt={1}>
                Supported formats: PDF, Word, PowerPoint, Excel, Text, Images
                (JPG/PNG), Video (MP4), ZIP
              </Text>
            </Box>

            <Flex mb={3} mx={-2}>
              <Box width={1 / 3} px={2}>
                <Text as="label" display="block" mb={2}>
                  Module Number <span style={{ color: "red" }}>*</span>
                </Text>
                <input
                  type="number"
                  min="1"
                  value={moduleNumber}
                  onChange={(e) => setModuleNumber(parseInt(e.target.value))}
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                  }}
                />
              </Box>

              <Box width={1 / 3} px={2}>
                <Text as="label" display="block" mb={2}>
                  Lesson Number <span style={{ color: "red" }}>*</span>
                </Text>
                <input
                  type="number"
                  min="1"
                  value={lessonNumber}
                  onChange={(e) => setLessonNumber(parseInt(e.target.value))}
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                  }}
                />
              </Box>

              <Box width={1 / 3} px={2}>
                <Text as="label" display="block" mb={2}>
                  Order
                </Text>
                <input
                  type="number"
                  min="1"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                  }}
                />
              </Box>
            </Flex>

            {error && <ErrorMessage message={error} />}
          </Box>
        }
        confirmLabel={loading ? "Adding..." : "Add Material"}
        cancelLabel="Cancel"
        onConfirm={() => {
          const event = new Event("submit") as unknown as React.FormEvent;
          handleSubmit(event);
        }}
        onCancel={() => {
          setShowAddDialog(false);
          setError(null);
        }}
        isLoading={loading}
      />
    </Box>
  );
}
