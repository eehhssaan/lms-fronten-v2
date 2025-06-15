import React, { useEffect, useState } from "react";
import { Box, Button, Flex, Text } from "rebass";
import {
  createPresentation,
  deletePresentation,
  getPresentations,
  updatePresentation,
} from "../lib/api/presentations";
import { Presentation, Theme } from "../types/presentation";
import ThemeSelector from "./ThemeSelector";
import { Spinner } from "../components/ui/Spinner";
import toast from "react-hot-toast";

interface PresentationManagerProps {
  onSelect?: (presentation: Presentation) => void;
}

const PresentationManager: React.FC<PresentationManagerProps> = ({
  onSelect,
}) => {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newPresentation, setNewPresentation] = useState({
    title: "",
    description: "",
  });
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);

  useEffect(() => {
    loadPresentations();
  }, []);

  const loadPresentations = async () => {
    try {
      const list = await getPresentations();
      setPresentations(list);
      setError(null);
    } catch (err) {
      setError("Failed to load presentations");
      toast.error("Failed to load presentations");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedTheme) {
      toast.error("Please select a theme");
      return;
    }

    try {
      const created = await createPresentation({
        title: newPresentation.title,
        description: newPresentation.description,
        themeId: selectedTheme._id,
      });
      setPresentations([...presentations, created]);
      setCreating(false);
      setNewPresentation({ title: "", description: "" });
      setSelectedTheme(null);
      toast.success("Presentation created successfully");
    } catch (err) {
      toast.error("Failed to create presentation");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this presentation?")) {
      return;
    }

    try {
      await deletePresentation(id);
      setPresentations(presentations.filter((p) => p._id !== id));
      toast.success("Presentation deleted successfully");
    } catch (err) {
      toast.error("Failed to delete presentation");
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
        <Text sx={{ fontSize: 3, fontWeight: "bold" }}>Presentations</Text>
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
          Create New
        </Button>
      </Flex>

      {creating && (
        <Box sx={{ mb: 4, p: 3, bg: "gray.50", borderRadius: 2 }}>
          <Text sx={{ fontSize: 2, fontWeight: "bold", mb: 3 }}>
            Create New Presentation
          </Text>
          <Box sx={{ mb: 3 }}>
            <Text sx={{ mb: 2 }}>Title</Text>
            <input
              type="text"
              value={newPresentation.title}
              onChange={(e) =>
                setNewPresentation({
                  ...newPresentation,
                  title: e.target.value,
                })
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
            <Text sx={{ mb: 2 }}>Description</Text>
            <textarea
              value={newPresentation.description}
              onChange={(e) =>
                setNewPresentation({
                  ...newPresentation,
                  description: e.target.value,
                })
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
          <Box sx={{ mb: 3 }}>
            <Text sx={{ mb: 2 }}>Select Theme</Text>
            <ThemeSelector
              currentThemeId={selectedTheme?._id}
              onThemeSelect={setSelectedTheme}
            />
          </Box>
          <Flex sx={{ gap: 2, justifyContent: "flex-end" }}>
            <Button
              onClick={() => {
                setCreating(false);
                setNewPresentation({ title: "", description: "" });
                setSelectedTheme(null);
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
              onClick={handleCreate}
              disabled={!newPresentation.title || !selectedTheme}
              sx={{
                bg: "primary",
                color: "white",
                px: 3,
                py: 2,
                borderRadius: 2,
                opacity: !newPresentation.title || !selectedTheme ? 0.5 : 1,
                cursor:
                  !newPresentation.title || !selectedTheme
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              Create
            </Button>
          </Flex>
        </Box>
      )}

      <Box>
        {presentations.length === 0 ? (
          <Text sx={{ textAlign: "center", color: "gray.500", py: 4 }}>
            No presentations yet. Create your first one!
          </Text>
        ) : (
          presentations.map((presentation) => (
            <Box
              key={presentation._id}
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
                sx={{ justifyContent: "space-between", alignItems: "center" }}
              >
                <Box>
                  <Text sx={{ fontSize: 2, fontWeight: "bold", mb: 1 }}>
                    {presentation.title}
                  </Text>
                  {presentation.description && (
                    <Text sx={{ color: "gray.600", mb: 2 }}>
                      {presentation.description}
                    </Text>
                  )}
                  <Text sx={{ fontSize: 0, color: "gray.500" }}>
                    Theme: {presentation.theme?.name || "Default"}
                  </Text>
                </Box>
                <Flex sx={{ gap: 2 }}>
                  <Button
                    onClick={() => onSelect?.(presentation)}
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
                    onClick={() => handleDelete(presentation._id)}
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
          ))
        )}
      </Box>
    </Box>
  );
};

export default PresentationManager;
