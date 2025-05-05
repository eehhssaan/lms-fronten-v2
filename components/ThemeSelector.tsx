import React, { useEffect, useState } from "react";
import { Box, Button, Flex, Text } from "rebass";
import { getThemes, updatePresentationTheme } from "../lib/api/presentations";
import { Theme } from "../types/presentation";
import { Spinner } from "./ui/Spinner";
import toast from "react-hot-toast";

interface ThemeSelectorProps {
  currentThemeId?: string;
  presentationId?: string;
  onThemeSelect?: (theme: Theme) => void;
  disabled?: boolean;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentThemeId,
  presentationId,
  onThemeSelect,
  disabled = false,
}) => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadThemes();
  }, []);

  const loadThemes = async () => {
    setLoading(true);
    try {
      const fetchedThemes = await getThemes();
      setThemes(fetchedThemes);
    } catch (error) {
      toast.error("Failed to load themes");
    } finally {
      setLoading(false);
    }
  };

  const handleThemeSelect = async (theme: Theme) => {
    if (disabled) return;

    onThemeSelect?.(theme);

    // If we have a presentation ID, update the theme and regenerate PPTX
    if (presentationId) {
      setUpdating(true);
      try {
        await updatePresentationTheme(presentationId, theme._id);
        toast.success("Theme updated successfully");
      } catch (error) {
        toast.error("Failed to update theme");
      } finally {
        setUpdating(false);
      }
    }
  };

  if (loading) {
    return (
      <Flex sx={{ justifyContent: "center", p: 3 }}>
        <Spinner />
      </Flex>
    );
  }

  return (
    <Box>
      <Flex sx={{ flexWrap: "wrap", gap: 3 }}>
        {themes.map((theme) => (
          <Box
            key={theme._id}
            onClick={() => handleThemeSelect(theme)}
            sx={{
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.5 : 1,
              border:
                theme._id === currentThemeId
                  ? "2px solid #3182ce"
                  : "1px solid #e2e8f0",
              borderRadius: 2,
              p: 3,
              width: ["100%", "calc(50% - 12px)", "calc(33.33% - 16px)"],
              bg: theme.colors.background,
              color: theme.colors.text,
              transition: "all 0.2s",
              "&:hover": {
                transform: disabled ? "none" : "translateY(-2px)",
                boxShadow: disabled ? "none" : "0 4px 6px rgba(0, 0, 0, 0.1)",
              },
            }}
          >
            <Text
              sx={{
                fontSize: 2,
                fontWeight: "bold",
                mb: 2,
                fontFamily: theme.fonts.heading,
              }}
            >
              {theme.name}
            </Text>
            <Text
              sx={{
                fontSize: 1,
                opacity: 0.8,
                fontFamily: theme.fonts.body,
              }}
            >
              {theme.description}
            </Text>
            {updating && theme._id === currentThemeId && (
              <Flex sx={{ justifyContent: "center", mt: 2 }}>
                <Spinner size={20} />
              </Flex>
            )}
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

export default ThemeSelector;
