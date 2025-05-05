import React, { useEffect, useState } from "react";
import { Box, Button, Flex, Text } from "rebass";
import {
  createSlide,
  deleteSlide,
  getSlides,
  reorderSlides,
  updateSlide,
} from "../lib/api/presentations";
import { Slide, SlideLayout } from "../types/presentation";
import { Spinner } from "../components/ui/Spinner";
import toast from "react-hot-toast";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DroppableProvided,
  DraggableProvided,
  DropResult,
} from "react-beautiful-dnd";

interface SlideEditorProps {
  presentationId: string;
}

const SlideEditor: React.FC<SlideEditorProps> = ({ presentationId }) => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [creating, setCreating] = useState(false);
  const [newSlide, setNewSlide] = useState({
    title: "",
    content: "",
    layout: SlideLayout.TITLE_CONTENT,
    imageUrl: "",
    columnOneContent: "",
    columnTwoContent: "",
  });

  useEffect(() => {
    loadSlides();
  }, [presentationId]);

  const loadSlides = async () => {
    try {
      const list = await getSlides(presentationId);
      setSlides(list.sort((a, b) => a.order - b.order));
      setError(null);
    } catch (err) {
      setError("Failed to load slides");
      toast.error("Failed to load slides");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const created = await createSlide(presentationId, {
        ...newSlide,
        order: slides.length,
      });
      setSlides([...slides, created]);
      setCreating(false);
      setNewSlide({
        title: "",
        content: "",
        layout: SlideLayout.TITLE_CONTENT,
        imageUrl: "",
        columnOneContent: "",
        columnTwoContent: "",
      });
      toast.success("Slide created successfully");
    } catch (err) {
      toast.error("Failed to create slide");
    }
  };

  const handleUpdate = async () => {
    if (!editingSlide) return;

    try {
      const updated = await updateSlide(
        presentationId,
        editingSlide.id,
        editingSlide
      );
      setSlides(slides.map((s) => (s.id === updated.id ? updated : s)));
      setEditingSlide(null);
      toast.success("Slide updated successfully");
    } catch (err) {
      toast.error("Failed to update slide");
    }
  };

  const handleDelete = async (slideId: string) => {
    if (!window.confirm("Are you sure you want to delete this slide?")) {
      return;
    }

    try {
      await deleteSlide(presentationId, slideId);
      setSlides(slides.filter((s) => s.id !== slideId));
      toast.success("Slide deleted successfully");
    } catch (err) {
      toast.error("Failed to delete slide");
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(slides);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order property
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setSlides(updatedItems);

    try {
      await reorderSlides(
        presentationId,
        updatedItems.map((item) => item.id)
      );
    } catch (err) {
      toast.error("Failed to reorder slides");
      loadSlides(); // Reload original order
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Spinner />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, color: "red" }}>
        <Text>{error}</Text>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Flex sx={{ justifyContent: "space-between", mb: 4 }}>
        <Text sx={{ fontSize: 3, fontWeight: "bold" }}>Slides</Text>
        <Button
          onClick={() => setCreating(true)}
          sx={{
            bg: "primary",
            color: "white",
            px: 3,
            py: 2,
            borderRadius: 2,
          }}
        >
          Add Slide
        </Button>
      </Flex>

      {(creating || editingSlide) && (
        <Box sx={{ mb: 4, p: 3, bg: "gray.50", borderRadius: 2 }}>
          <Text sx={{ fontSize: 2, fontWeight: "bold", mb: 3 }}>
            {creating ? "Add New Slide" : "Edit Slide"}
          </Text>
          <Box sx={{ mb: 3 }}>
            <Text sx={{ mb: 2 }}>Title</Text>
            <input
              type="text"
              value={creating ? newSlide.title : editingSlide?.title}
              onChange={(e) =>
                creating
                  ? setNewSlide({ ...newSlide, title: e.target.value })
                  : setEditingSlide(
                      editingSlide
                        ? { ...editingSlide, title: e.target.value }
                        : null
                    )
              }
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </Box>
          <Box sx={{ mb: 3 }}>
            <Text sx={{ mb: 2 }}>Layout</Text>
            <select
              value={creating ? newSlide.layout : editingSlide?.layout}
              onChange={(e) =>
                creating
                  ? setNewSlide({
                      ...newSlide,
                      layout: e.target.value as SlideLayout,
                    })
                  : setEditingSlide(
                      editingSlide
                        ? {
                            ...editingSlide,
                            layout: e.target.value as SlideLayout,
                          }
                        : null
                    )
              }
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            >
              {Object.values(SlideLayout).map((layout) => (
                <option key={layout} value={layout}>
                  {layout
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </Box>
          <Box sx={{ mb: 3 }}>
            <Text sx={{ mb: 2 }}>Content</Text>
            <textarea
              value={creating ? newSlide.content : editingSlide?.content}
              onChange={(e) =>
                creating
                  ? setNewSlide({ ...newSlide, content: e.target.value })
                  : setEditingSlide(
                      editingSlide
                        ? { ...editingSlide, content: e.target.value }
                        : null
                    )
              }
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                minHeight: "100px",
              }}
            />
          </Box>
          <Flex sx={{ gap: 2, justifyContent: "flex-end" }}>
            <Button
              onClick={() => {
                setCreating(false);
                setEditingSlide(null);
              }}
              sx={{
                bg: "gray.300",
                color: "text",
                px: 3,
                py: 2,
                borderRadius: 2,
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={creating ? handleCreate : handleUpdate}
              sx={{
                bg: "primary",
                color: "white",
                px: 3,
                py: 2,
                borderRadius: 2,
              }}
            >
              {creating ? "Create" : "Update"}
            </Button>
          </Flex>
        </Box>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="slides">
          {(provided: DroppableProvided) => (
            <Box {...provided.droppableProps} ref={provided.innerRef}>
              {slides.length === 0 ? (
                <Text sx={{ textAlign: "center", color: "gray.500", py: 4 }}>
                  No slides yet. Add your first slide!
                </Text>
              ) : (
                slides.map((slide, index) => (
                  <Draggable
                    key={slide.id}
                    draggableId={slide.id}
                    index={index}
                  >
                    {(provided: DraggableProvided) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        sx={{
                          p: 3,
                          mb: 3,
                          bg: "white",
                          borderRadius: 2,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          "&:hover": {
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          },
                        }}
                      >
                        <Flex
                          sx={{
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Box>
                            <Text
                              sx={{ fontSize: 2, fontWeight: "bold", mb: 1 }}
                            >
                              {slide.title || `Slide ${index + 1}`}
                            </Text>
                            <Text sx={{ fontSize: 0, color: "gray.500" }}>
                              Layout:{" "}
                              {slide.layout
                                .replace(/-/g, " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </Text>
                          </Box>
                          <Flex sx={{ gap: 2 }}>
                            <Button
                              onClick={() => setEditingSlide(slide)}
                              sx={{
                                bg: "blue.500",
                                color: "white",
                                px: 3,
                                py: 2,
                                borderRadius: 2,
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDelete(slide.id)}
                              sx={{
                                bg: "red.500",
                                color: "white",
                                px: 3,
                                py: 2,
                                borderRadius: 2,
                              }}
                            >
                              Delete
                            </Button>
                          </Flex>
                        </Flex>
                      </Box>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
};

export default SlideEditor;
