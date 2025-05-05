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
  ];

  const fontSizes = [
    "12",
    "14",
    "16",
    "18",
    "20",
    "24",
    "28",
    "32",
    "36",
    "40",
    "48",
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

  return (
    <Box
      className={className}
      sx={{
        bg: "white",
        p: 2,
        borderRadius: "4px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        mb: 3,
      }}
    >
      <Flex sx={{ gap: 2, flexWrap: "wrap" }}>
        {/* Slide Background Color if onSlideBackgroundChange is provided */}
        {onSlideBackgroundChange && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              borderRight: "1px solid #e2e8f0",
              pr: 2,
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
            }}
          >
            {fonts.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </Box>

        {/* Font Size */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Text sx={{ fontSize: 1, color: "gray.600" }}>Size:</Text>
          <select
            value={format.fontSize || "16"}
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Text sx={{ fontSize: 1, color: "gray.600" }}>Align:</Text>
          <Flex sx={{ gap: 1 }}>
            {alignments.map((align) => (
              <Button
                key={align}
                onClick={() => onFormatChange({ ...format, textAlign: align })}
                sx={{
                  bg: format.textAlign === align ? "primary" : "transparent",
                  color: format.textAlign === align ? "white" : "text",
                  px: 2,
                  py: 1,
                  fontSize: 1,
                  border: "1px solid",
                  borderColor:
                    format.textAlign === align ? "primary" : "gray.200",
                  borderRadius: 2,
                  cursor: "pointer",
                  "&:hover": {
                    bg: format.textAlign === align ? "primary" : "gray.50",
                  },
                }}
              >
                {align.charAt(0).toUpperCase() + align.slice(1)}
              </Button>
            ))}
          </Flex>
        </Box>

        {/* Text Style Toggles */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            onClick={() => onFormatChange({ ...format, bold: !format.bold })}
            sx={{
              bg: format.bold ? "primary" : "transparent",
              color: format.bold ? "white" : "text",
              px: 2,
              py: 1,
              fontSize: 1,
              fontWeight: "bold",
              border: "1px solid",
              borderColor: format.bold ? "primary" : "gray.200",
              borderRadius: 2,
              cursor: "pointer",
              "&:hover": {
                bg: format.bold ? "primary" : "gray.50",
              },
            }}
          >
            B
          </Button>
          <Button
            onClick={() =>
              onFormatChange({ ...format, italic: !format.italic })
            }
            sx={{
              bg: format.italic ? "primary" : "transparent",
              color: format.italic ? "white" : "text",
              px: 2,
              py: 1,
              fontSize: 1,
              fontStyle: "italic",
              border: "1px solid",
              borderColor: format.italic ? "primary" : "gray.200",
              borderRadius: 2,
              cursor: "pointer",
              "&:hover": {
                bg: format.italic ? "primary" : "gray.50",
              },
            }}
          >
            I
          </Button>
          <Button
            onClick={() =>
              onFormatChange({ ...format, underline: !format.underline })
            }
            sx={{
              bg: format.underline ? "primary" : "transparent",
              color: format.underline ? "white" : "text",
              px: 2,
              py: 1,
              fontSize: 1,
              textDecoration: "underline",
              border: "1px solid",
              borderColor: format.underline ? "primary" : "gray.200",
              borderRadius: 2,
              cursor: "pointer",
              "&:hover": {
                bg: format.underline ? "primary" : "gray.50",
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
