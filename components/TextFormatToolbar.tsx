import React from "react";
import { Box, Button, Flex, Text } from "rebass";
import { TextFormat } from "../types/presentation";

interface TextFormatToolbarProps {
  format: TextFormat;
  onFormatChange: (newFormat: TextFormat) => void;
  className?: string;
  onSlideBackgroundChange?: (color: string) => void;
  currentSlideBackground?: string;
}

const TextFormatToolbar: React.FC<TextFormatToolbarProps> = ({
  format,
  onFormatChange,
  className,
  onSlideBackgroundChange,
  currentSlideBackground,
}) => {
  const fonts = [
    "Arial",
    "Times New Roman",
    "Helvetica",
    "Calibri",
    "Georgia",
    "Verdana",
    "Roboto",
    "Open Sans",
    "Trebuchet MS",
  ];

  const fontSizes = [
    "8pt",
    "10pt",
    "12pt",
    "14pt",
    "16pt",
    "18pt",
    "20pt",
    "24pt",
    "28pt",
    "32pt",
    "36pt",
    "40pt",
    "44pt",
    "48pt",
    "54pt",
    "60pt",
    "72pt",
  ];

  const colors = [
    "#000000",
    "#FFFFFF",
    "#1A237E",
    "#2C3E50",
    "#303F9F",
    "#3F51B5",
    "#4A90E2",
    "#34495E",
    "#666666",
    "#F5F7FA",
    "#ECF0F1",
  ];

  const alignments: Array<TextFormat["textAlign"]> = [
    "left",
    "center",
    "right",
  ];

  // Function to get font size value for the select
  const getFontSizeValue = (fontSize: string | undefined): string => {
    if (!fontSize) return "12pt";
    if (fontSize.endsWith("pt")) return fontSize;
    return `${fontSize}pt`;
  };

  return (
    <Box
      className={className}
      sx={{
        bg: "#f5f5f5",
        p: 3,
        borderRadius: "4px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        mb: 3,
        border: "1px solid #e2e8f0",
      }}
    >
      <Flex
        sx={{
          gap: 3,
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {onSlideBackgroundChange && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              borderRight: "1px solid #e2e8f0",
              pr: 2,
              mr: 3,
              mb: 2,
            }}
          >
            <Text sx={{ fontSize: 1, color: "gray.600" }}>Slide BG:</Text>
            <Box sx={{ position: "relative", width: "32px", height: "32px" }}>
              <input
                type="color"
                value={currentSlideBackground || "#FFFFFF"}
                onChange={(e) => onSlideBackgroundChange(e.target.value)}
                style={{
                  width: "100%",
                  height: "100%",
                  padding: 0,
                  border: "1px solid #e2e8f0",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                title="Slide Background Color"
              />
            </Box>
            <Flex sx={{ gap: 1 }}>
              {colors.slice(0, 6).map((color) => (
                <Box
                  key={color}
                  onClick={() => onSlideBackgroundChange(color)}
                  sx={{
                    width: "16px",
                    height: "16px",
                    backgroundColor: color,
                    border: "1px solid #e2e8f0",
                    borderRadius: "2px",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "scale(1.1)",
                    },
                  }}
                  title={`Background: ${color}`}
                />
              ))}
            </Flex>
          </Box>
        )}

        {/* Font Family */}
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 2, mr: 3, mb: 2 }}
        >
          <Text sx={{ fontSize: 1, color: "gray.600" }}>Font:</Text>
          <select
            value={format.fontFamily || "Arial"}
            onChange={(e) =>
              onFormatChange({ ...format, fontFamily: e.target.value })
            }
            style={{
              padding: "4px 8px",
              border: "1px solid #e2e8f0",
              borderRadius: "4px",
              fontSize: "14px",
              fontFamily: format.fontFamily || "Arial",
            }}
          >
            {fonts.map((font) => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>
        </Box>

        {/* Font Size */}
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 2, mr: 3, mb: 2 }}
        >
          <Text sx={{ fontSize: 1, color: "gray.600" }}>Size:</Text>
          <select
            value={getFontSizeValue(format.fontSize)}
            onChange={(e) =>
              onFormatChange({ ...format, fontSize: e.target.value })
            }
            style={{
              padding: "4px 8px",
              border: "1px solid #e2e8f0",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          >
            {fontSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </Box>

        {/* Text Color */}
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 2, mr: 3, mb: 2 }}
        >
          <Text sx={{ fontSize: 1, color: "gray.600" }}>Color:</Text>
          <input
            type="color"
            value={format.color || "#000000"}
            onChange={(e) =>
              onFormatChange({ ...format, color: e.target.value })
            }
            style={{
              width: "32px",
              height: "32px",
              padding: 0,
              border: "1px solid #e2e8f0",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          />
        </Box>

        {/* Text Alignment */}
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 2, mr: 3, mb: 2 }}
        >
          <Text sx={{ fontSize: 1, color: "gray.600" }}>Align:</Text>
          <Flex sx={{ gap: 1 }}>
            {(alignments as Array<"left" | "center" | "right">).map((align) => (
              <Button
                key={align}
                onClick={() => onFormatChange({ ...format, textAlign: align })}
                sx={{
                  bg:
                    (format.textAlign || "left") === align
                      ? "primary"
                      : "transparent",
                  color: "black",
                  px: 2,
                  py: 1,
                  fontSize: 1,
                  border: "1px solid",
                  borderColor:
                    (format.textAlign || "left") === align
                      ? "primary"
                      : "gray.200",
                  borderRadius: 2,
                  cursor: "pointer",
                  "&:hover": {
                    bg:
                      (format.textAlign || "left") === align
                        ? "primary"
                        : "gray.50",
                  },
                }}
              >
                {align.charAt(0).toUpperCase() + align.slice(1)}
              </Button>
            ))}
          </Flex>
        </Box>

        {/* Text Style Toggles */}
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, mr: 3, mb: 2 }}
        >
          <Button
            onClick={() =>
              onFormatChange({ ...format, bold: !(format.bold || false) })
            }
            sx={{
              bg: format.bold ? "primary" : "transparent",
              color: "black",
              px: 2,
              py: 1,
              fontSize: 1,
              fontWeight: "bold",
              border: "1px solid",
              borderColor: format.bold ? "primary" : "gray.200",
              borderRadius: 2,
              cursor: "pointer",
              "&:hover": {
                bg: format.bold ? "primary" : "#e0e0e0",
              },
            }}
          >
            B
          </Button>
          <Button
            onClick={() =>
              onFormatChange({ ...format, italic: !(format.italic || false) })
            }
            sx={{
              bg: format.italic ? "primary" : "transparent",
              color: "black",
              px: 2,
              py: 1,
              fontSize: 1,
              fontStyle: "italic",
              border: "1px solid",
              borderColor: format.italic ? "primary" : "gray.200",
              borderRadius: 2,
              cursor: "pointer",
              "&:hover": {
                bg: format.italic ? "primary" : "#e0e0e0",
              },
            }}
          >
            I
          </Button>
          <Button
            onClick={() =>
              onFormatChange({
                ...format,
                underline: !(format.underline || false),
              })
            }
            sx={{
              bg: format.underline ? "primary" : "transparent",
              color: "black",
              px: 2,
              py: 1,
              fontSize: 1,
              textDecoration: "underline",
              border: "1px solid",
              borderColor: format.underline ? "primary" : "gray.200",
              borderRadius: 2,
              cursor: "pointer",
              "&:hover": {
                bg: format.underline ? "primary" : "#e0e0e0",
              },
            }}
          >
            U
          </Button>
        </Box>
      </Flex>
    </Box>
  );
};

export default TextFormatToolbar;
