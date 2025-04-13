import { useState } from "react";
import { Box, Heading, Text, Flex } from "rebass";
import Button from "@/components/Button";
import { Content } from "@/types";
import ErrorMessage from "@/components/ErrorMessage";
import Loading from "@/components/Loading";
import {
  createCourseContent,
  deleteCourseContent,
  updateCourseContent,
} from "@/lib/api";

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
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [deletingContentIds, setDeletingContentIds] = useState<string[]>([]);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [moduleNumber, setModuleNumber] = useState(1);
  const [lessonNumber, setLessonNumber] = useState(1);
  const [order, setOrder] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setFile(null);
    setModuleNumber(1);
    setLessonNumber(1);
    setOrder(1);
    setError(null);
  };

  const handleStartEdit = (content: Content) => {
    if (!content._id) return;
    setIsEditing(content._id);
    setTitle(content.title);
    setDescription(content.description || "");
    setModuleNumber(content.moduleNumber || 1);
    setLessonNumber(content.lessonNumber || 1);
    setOrder(content.order || 1);
    setFile(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    resetForm();
  };

  const handleUpdate = async (contentId: string, e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!title.trim()) {
        throw new Error("Title is required");
      }

      if (!moduleNumber || moduleNumber < 1) {
        throw new Error("Please enter a valid module number");
      }

      if (!lessonNumber || lessonNumber < 1) {
        throw new Error("Please enter a valid lesson number");
      }

      const updateData: FormData | any = file ? new FormData() : {};

      if (file) {
        // If there's a new file, use FormData
        updateData.append("title", title.trim());
        updateData.append("description", description.trim());
        updateData.append("moduleNumber", moduleNumber.toString());
        updateData.append("lessonNumber", lessonNumber.toString());
        updateData.append("order", order.toString());
        updateData.append("file", file);
      } else {
        // If no new file, use JSON
        updateData.title = title.trim();
        updateData.description = description.trim();
        updateData.moduleNumber = moduleNumber;
        updateData.lessonNumber = lessonNumber;
        updateData.order = order;
      }

      await updateCourseContent(contentId, updateData);
      onContentAdded(); // Refresh content list
      setIsEditing(null);
      resetForm();
    } catch (err: any) {
      setError(err.message || "Failed to update content");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted");

    // Validate all required fields
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    if (!moduleNumber || moduleNumber < 1) {
      setError("Please enter a valid module number");
      return;
    }

    if (!lessonNumber || lessonNumber < 1) {
      setError("Please enter a valid lesson number");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Creating FormData with values:", {
        title: title.trim(),
        description: description.trim(),
        courseId,
        moduleNumber,
        lessonNumber,
        order,
        fileName: file?.name,
      });

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("courseId", courseId);
      formData.append("type", "document");
      formData.append("moduleNumber", moduleNumber.toString());
      formData.append("lessonNumber", lessonNumber.toString());
      formData.append("order", order.toString());

      if (file) {
        formData.append("file", file);
      }

      console.log("formData", formData);

      console.log("Sending request to create course content...");
      const response = await createCourseContent(courseId, formData);
      console.log("Course Content created successfully:", response);

      // Clear form
      setTitle("");
      setDescription("");
      setFile(null);
      setModuleNumber(1);
      setLessonNumber(1);
      setOrder(1);
      setIsAdding(false);
      onContentAdded();
    } catch (err: any) {
      console.error("Error creating content:", err);
      setError(err.message || "Failed to add content");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setError(null);
    // Reset form
    setTitle("");
    setDescription("");
    setFile(null);
    setModuleNumber(1);
    setLessonNumber(1);
    setOrder(1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFile(file);
  };

  const handleDelete = async (contentId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this material? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingContentIds((prev) => [...prev, contentId]);
    setDeleteError(null);

    try {
      await deleteCourseContent(contentId);
      onContentAdded(); // Refresh the content list
      setDeletingContentIds((prev) => prev.filter((id) => id !== contentId));
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete content");
      setDeletingContentIds((prev) => prev.filter((id) => id !== contentId));
    }
  };

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={3}>
        <Heading as="h3" fontSize={2}>
          Course Materials
        </Heading>
        {!isAdding && !isEditing && (
          <Button
            onClick={() => {
              console.log("Add Material clicked, setting isAdding to true");
              setIsAdding(true);
            }}
            variant="primary"
            size="small"
          >
            Add Material
          </Button>
        )}
      </Flex>

      {/* Display existing contents with edit and delete buttons */}
      {contents.length > 0 && (
        <Box mb={4}>
          {contents
            .filter(
              (content): content is Content & { _id: string } =>
                content !== null && !!content._id
            )
            .map((content) => (
              <Box
                key={content._id}
                p={3}
                mb={2}
                sx={{
                  border: "1px solid",
                  borderColor: "gray.200",
                  borderRadius: "6px",
                  bg: "white",
                  opacity: deletingContentIds.includes(content._id) ? 0.7 : 1,
                  transition: "opacity 0.2s ease-in-out",
                }}
              >
                {isEditing === content._id ? (
                  <form onSubmit={(e) => handleUpdate(content._id, e)}>
                    <Box mb={3}>
                      <Text as="label" display="block" mb={2} fontWeight="bold">
                        Title{" "}
                        <Box as="span" color="red">
                          *
                        </Box>
                      </Text>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="form-input"
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "6px",
                          border: "1px solid #ddd",
                          fontSize: "16px",
                        }}
                      />
                    </Box>

                    <Box mb={3}>
                      <Text as="label" display="block" mb={2} fontWeight="bold">
                        Description
                      </Text>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="form-textarea"
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "6px",
                          border: "1px solid #ddd",
                          fontSize: "16px",
                          resize: "vertical",
                        }}
                      />
                    </Box>

                    <Box mb={3}>
                      <Text as="label" display="block" mb={2} fontWeight="bold">
                        New File (Optional)
                      </Text>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.mp4,.zip"
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "6px",
                          border: "1px solid #ddd",
                          fontSize: "16px",
                        }}
                      />
                    </Box>

                    <Flex mx={-2} flexWrap="wrap" mb={3}>
                      <Box width={[1, 1 / 3]} px={2}>
                        <Text
                          as="label"
                          display="block"
                          mb={2}
                          fontWeight="bold"
                        >
                          Module Number{" "}
                          <Box as="span" color="red">
                            *
                          </Box>
                        </Text>
                        <input
                          type="number"
                          min="1"
                          value={moduleNumber}
                          onChange={(e) =>
                            setModuleNumber(parseInt(e.target.value))
                          }
                          required
                          style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "6px",
                            border: "1px solid #ddd",
                            fontSize: "16px",
                          }}
                        />
                      </Box>

                      <Box width={[1, 1 / 3]} px={2}>
                        <Text
                          as="label"
                          display="block"
                          mb={2}
                          fontWeight="bold"
                        >
                          Lesson Number{" "}
                          <Box as="span" color="red">
                            *
                          </Box>
                        </Text>
                        <input
                          type="number"
                          min="1"
                          value={lessonNumber}
                          onChange={(e) =>
                            setLessonNumber(parseInt(e.target.value))
                          }
                          required
                          style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "6px",
                            border: "1px solid #ddd",
                            fontSize: "16px",
                          }}
                        />
                      </Box>

                      <Box width={[1, 1 / 3]} px={2}>
                        <Text
                          as="label"
                          display="block"
                          mb={2}
                          fontWeight="bold"
                        >
                          Order
                        </Text>
                        <input
                          type="number"
                          min="1"
                          value={order}
                          onChange={(e) => setOrder(parseInt(e.target.value))}
                          style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "6px",
                            border: "1px solid #ddd",
                            fontSize: "16px",
                          }}
                        />
                      </Box>
                    </Flex>

                    {error && (
                      <Box
                        mb={3}
                        p={2}
                        bg="red.50"
                        color="red.600"
                        borderRadius="md"
                      >
                        {error}
                      </Box>
                    )}

                    <Flex justifyContent="flex-end" mt={3}>
                      <Button
                        onClick={handleCancelEdit}
                        variant="secondary"
                        size="small"
                        type="button"
                        sx={{ mr: 2 }}
                      >
                        Cancel
                      </Button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{
                          padding: "8px 16px",
                          fontSize: "14px",
                          borderRadius: "4px",
                          cursor: loading ? "not-allowed" : "pointer",
                          opacity: loading ? 0.7 : 1,
                          backgroundColor: "#007bff",
                          color: "white",
                          border: "1px solid #0056b3",
                        }}
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </button>
                    </Flex>
                  </form>
                ) : (
                  <Flex justifyContent="space-between" alignItems="center">
                    <Box>
                      <Text fontWeight="bold">{content.title}</Text>
                      <Text fontSize="sm" color="gray.600">
                        Module {content.moduleNumber}, Lesson{" "}
                        {content.lessonNumber}
                      </Text>
                    </Box>
                    <Flex>
                      <Button
                        onClick={() => handleStartEdit(content)}
                        variant="secondary"
                        size="small"
                        sx={{ mr: 2 }}
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(content._id)}
                        variant="danger"
                        size="small"
                        disabled={deletingContentIds.includes(content._id)}
                      >
                        {deletingContentIds.includes(content._id)
                          ? "Deleting..."
                          : "Delete"}
                      </Button>
                    </Flex>
                  </Flex>
                )}
              </Box>
            ))}

          {deleteError && (
            <Box
              mt={3}
              p={3}
              bg="red.50"
              color="red.600"
              borderRadius="md"
              fontSize="sm"
            >
              {deleteError}
            </Box>
          )}
        </Box>
      )}

      {console.log("isAdding state:", isAdding)}
      {isAdding ? (
        <Box
          className="card"
          mb={4}
          bg="white"
          p={4}
          sx={{ boxShadow: "sm", border: "1px solid", borderColor: "gray.200" }}
        >
          <Heading as="h4" fontSize={2} mb={3}>
            Add Course Material
          </Heading>

          <form
            onSubmit={async (e: React.FormEvent) => {
              e.preventDefault();
              console.log("Form onSubmit triggered");
              try {
                await handleSubmit(e);
              } catch (error) {
                console.error("Form submission error:", error);
              }
            }}
          >
            <Box mb={4}>
              <Text as="label" display="block" mb={2} fontWeight="bold">
                Title{" "}
                <Box as="span" color="red" display="inline">
                  *
                </Box>
              </Text>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="form-input"
                placeholder="Enter material title"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  fontSize: "16px",
                }}
              />
            </Box>

            <Box mb={4}>
              <Text as="label" display="block" mb={2} fontWeight="bold">
                Description{" "}
                <Box as="span" color="red" display="inline">
                  *
                </Box>
              </Text>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
                className="form-textarea"
                placeholder="Enter material description"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  fontSize: "16px",
                  resize: "vertical",
                  minHeight: "100px",
                }}
              />
            </Box>

            <Box mb={4}>
              <Text
                as="label"
                htmlFor="file-upload"
                display="block"
                mb={2}
                fontWeight="bold"
              >
                File{" "}
                <Box as="span" color="red" display="inline">
                  *
                </Box>
              </Text>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  width: "100%",
                }}
              >
                <label
                  htmlFor="file-upload"
                  style={{
                    cursor: "pointer",
                    padding: "10px",
                    border: "2px dashed #ccc",
                    borderRadius: "4px",
                    textAlign: "center",
                    marginBottom: "10px",
                  }}
                >
                  {file ? file.name : "Click to select a file"}
                </label>
                <input
                  id="file-upload"
                  name="material-file"
                  type="file"
                  onChange={handleFileChange}
                  required
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.mp4,.zip"
                  aria-label="Upload course material"
                  style={{
                    position: "absolute",
                    width: "1px",
                    height: "1px",
                    padding: 0,
                    margin: "-1px",
                    overflow: "hidden",
                    clip: "rect(0, 0, 0, 0)",
                    whiteSpace: "nowrap",
                    border: 0,
                  }}
                />
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Supported formats: PDF, Word, PowerPoint, Excel, Text, Images
                  (JPG/PNG), Video (MP4), ZIP
                </Text>
              </Box>
            </Box>

            <Flex mx={-2} flexWrap="wrap">
              <Box width={[1, 1 / 3]} px={2} mb={[3, 0]}>
                <Text as="label" display="block" mb={2} fontWeight="bold">
                  Module Number{" "}
                  <Box as="span" color="red" display="inline">
                    *
                  </Box>
                </Text>
                <input
                  type="number"
                  min="1"
                  value={moduleNumber}
                  onChange={(e) => setModuleNumber(parseInt(e.target.value))}
                  required
                  className="form-input"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ddd",
                    fontSize: "16px",
                  }}
                />
              </Box>

              <Box width={[1, 1 / 3]} px={2} mb={[3, 0]}>
                <Text as="label" display="block" mb={2} fontWeight="bold">
                  Lesson Number{" "}
                  <Box as="span" color="red" display="inline">
                    *
                  </Box>
                </Text>
                <input
                  type="number"
                  min="1"
                  value={lessonNumber}
                  onChange={(e) => setLessonNumber(parseInt(e.target.value))}
                  required
                  className="form-input"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ddd",
                    fontSize: "16px",
                  }}
                />
              </Box>

              <Box width={[1, 1 / 3]} px={2}>
                <Text as="label" display="block" mb={2} fontWeight="bold">
                  Order
                </Text>
                <input
                  type="number"
                  min="1"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value))}
                  className="form-input"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ddd",
                    fontSize: "16px",
                  }}
                />
              </Box>
            </Flex>

            {error && (
              <Box
                mt={3}
                p={3}
                bg="red.50"
                color="red.600"
                borderRadius="md"
                fontSize="sm"
              >
                {error}
              </Box>
            )}

            <Flex mt={4} justifyContent="flex-end">
              <Button
                onClick={handleCancel}
                variant="secondary"
                size="small"
                type="button"
                sx={{ mr: 2 }}
              >
                Cancel
              </Button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{
                  padding: "8px 16px",
                  fontSize: "14px",
                  borderRadius: "4px",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Adding..." : "Add Material"}
              </button>
            </Flex>
          </form>
        </Box>
      ) : null}
    </Box>
  );
}
